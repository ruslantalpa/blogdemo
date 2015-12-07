-- execute with
-- sudo -H -u postgres bash -c 'psql -f ./appdb.sql'

CREATE DATABASE blogdemo;

\connect blogdemo

-------------------------------------------------------------------------------
-- Adapted from https://github.com/robconery/pg-auth

begin;

-- comment out the role creation statements if
-- you want to run this script more than once
create role anon;
create role author;
--create role authenticator with login password 'authenticator';
--superuser is needed untill the PR that fixes this is merged
create role authenticator with SUPERUSER login password 'authenticator';  

create extension if not exists pgcrypto;
create extension if not exists "uuid-ossp";

-- We put things inside the basic_auth schema to hide
-- them from public view. Certain public procs/views will
-- refer to helpers and tables inside.
create schema if not exists basic_auth;

-------------------------------------------------------------------------------
-- Utility functions

create or replace function
basic_auth.clearance_for_role(u name) returns void as
$$
declare
  ok boolean;
begin
  select exists (
    select rolname
      from pg_authid
     where pg_has_role(current_user, oid, 'member')
       and rolname = u
  ) into ok;
  if not ok then
    raise invalid_password using message =
      'current user not member of role ' || u;
  end if;
end
$$ LANGUAGE plpgsql;

-------------------------------------------------------------------------------
-- Users storage and constraints

create table if not exists
basic_auth.users (
  email    text primary key check ( email ~* '^.+@.+\..+$' ),
  pass     text not null check (length(pass) < 512),
  name     text not null default '',
  role     name not null check (length(role) < 512),
  verified boolean not null default false
  -- If you like add more columns, or a json column
);

create or replace function
basic_auth.check_role_exists() returns trigger
  language plpgsql
  as $$
begin
  if not exists (select 1 from pg_roles as r where r.rolname = new.role) then
    raise foreign_key_violation using message =
      'unknown database role: ' || new.role;
    return null;
  end if;
  return new;
end
$$;

drop trigger if exists ensure_user_role_exists on basic_auth.users;
create constraint trigger ensure_user_role_exists
  after insert or update on basic_auth.users
  for each row
  execute procedure basic_auth.check_role_exists();

create or replace function
basic_auth.encrypt_pass() returns trigger
  language plpgsql
  as $$
begin
  if tg_op = 'INSERT' or new.pass <> old.pass then
    new.pass = crypt(new.pass, gen_salt('bf'));
  end if;
  return new;
end
$$;

drop trigger if exists encrypt_pass on basic_auth.users;
create trigger encrypt_pass
  before insert or update on basic_auth.users
  for each row
  execute procedure basic_auth.encrypt_pass();

create or replace function
basic_auth.send_validation() returns trigger
  language plpgsql
  as $$
declare
  tok uuid;
begin
  select uuid_generate_v4() into tok;
  insert into basic_auth.tokens (token, token_type, email)
         values (tok, 'validation', new.email);
  perform pg_notify('validate',
    json_build_object(
      'email', new.email,
      'token', tok,
      'token_type', 'validation'
    )::text
  );
  return new;
end
$$;

drop trigger if exists send_validation on basic_auth.users;
create trigger send_validation
  after insert on basic_auth.users
  for each row
  execute procedure basic_auth.send_validation();

-------------------------------------------------------------------------------
-- Email Validation and Password Reset

drop type if exists token_type_enum cascade;
create type token_type_enum as enum ('validation', 'reset');

create table if not exists
basic_auth.tokens (
  token       uuid primary key,
  token_type  token_type_enum not null,
  email       text not null references basic_auth.users (email)
                on delete cascade on update cascade,
  created_at  timestamptz not null default current_date
);

-------------------------------------------------------------------------------
-- Login helper

create or replace function
basic_auth.user_role(email text, pass text) returns name
  language plpgsql
  as $$
begin
  return (
  select role from basic_auth.users
   where users.email = user_role.email
     and users.pass = crypt(user_role.pass, users.pass)
  );
end;
$$;

create or replace function
basic_auth.current_email() returns text
  language plpgsql
  as $$
begin
  return current_setting('postgrest.claims.email');
exception
  -- handle unrecognized configuration parameter error
  when undefined_object then return '';
end;
$$;


-------------------------------------------------------------------------------
-- Public functions (in current schema, not basic_auth)

create or replace function
request_password_reset(email text) returns void
  language plpgsql
  as $$
declare
  tok uuid;
begin
  delete from basic_auth.tokens
   where token_type = 'reset'
     and tokens.email = request_password_reset.email;

  select uuid_generate_v4() into tok;
  insert into basic_auth.tokens (token, token_type, email)
         values (tok, 'reset', request_password_reset.email);
  perform pg_notify('reset',
    json_build_object(
      'email', request_password_reset.email,
      'token', tok,
      'token_type', 'reset'
    )::text
  );
end;
$$;

create or replace function
reset_password(email text, token uuid, pass text)
  returns void
  language plpgsql
  as $$
declare
  tok uuid;
begin
  if exists(select 1 from basic_auth.tokens
             where tokens.email = reset_password.email
               and tokens.token = reset_password.token
               and token_type = 'reset') then
    update basic_auth.users set pass=reset_password.pass
     where users.email = reset_password.email;

    delete from basic_auth.tokens
     where tokens.email = reset_password.email
       and tokens.token = reset_password.token
       and token_type = 'reset';
  else
    raise invalid_password using message =
      'invalid user or token';
  end if;
  delete from basic_auth.tokens
   where token_type = 'reset'
     and tokens.email = reset_password.email;

  select uuid_generate_v4() into tok;
  insert into basic_auth.tokens (token, token_type, email)
         values (tok, 'reset', reset_password.email);
  perform pg_notify('reset',
    json_build_object(
      'email', reset_password.email,
      'token', tok
    )::text
  );
end;
$$;

drop type if exists basic_auth.jwt_claims cascade;
create type
basic_auth.jwt_claims AS (role text, email text);

create or replace function
login(email text, pass text) returns basic_auth.jwt_claims
  language plpgsql
  as $$
declare
  _role name;
  result basic_auth.jwt_claims;
begin
  select basic_auth.user_role(email, pass) into _role;
  if _role is null then
    raise invalid_password using message = 'invalid user or password';
  end if;
  -- TODO; check verified flag if you care whether users
  -- have validated their emails
  select _role as role, login.email as email into result;
  return result;
end;
$$;

create or replace function
signup(email text, pass text) returns void
as $$
  insert into basic_auth.users (email, pass, role) values
    (signup.email, signup.pass, 'author');
$$ language sql;

-------------------------------------------------------------------------------
-- User management (!!!! changed)

create or replace view authors as
select
       actual.email as email,
       actual.name as name
from basic_auth.users as actual;

-------------------------------------------------------------------------------
-- Blogging stuff!

create table if not exists
posts (
  id         bigserial primary key,
  title      text not null,
  body       text not null,
  author     text not null references basic_auth.users (email)
               on delete restrict on update cascade,
  created_at timestamptz not null default current_date
);

create table if not exists
comments (
  id         bigserial primary key,
  body       text not null,
  author     text not null references basic_auth.users (email)
               on delete restrict on update cascade,
  post       bigint not null references posts (id)
               on delete cascade on update cascade,
  created_at timestamptz not null default current_date
);

-------------------------------------------------------------------------------
-- Permissions

grant insert on table basic_auth.users, basic_auth.tokens to anon;
grant select on table pg_authid, basic_auth.users, posts, comments, authors to anon;
grant execute on function
  login(text,text),
  request_password_reset(text),
  reset_password(text,uuid,text),
  signup(text, text)
  to anon;

--grant author to anon;
grant anon to authenticator;
grant author to authenticator;    

grant select, insert, update, delete
  on basic_auth.tokens, basic_auth.users to anon, author;
grant select, insert, update, delete
  on table posts, comments to author;
grant select on table authors to author;

grant usage, select on sequence posts_id_seq, comments_id_seq to author;

grant usage on schema public, basic_auth to anon, author;

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
drop policy if exists authors_eigenedit on posts;
create policy authors_eigenedit on posts
  using (true)
  with check (
    author = basic_auth.current_email()
  );

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
drop policy if exists authors_eigenedit on comments;
create policy authors_eigenedit on comments
  using (true)
  with check (
    author = basic_auth.current_email()
  );


------- Data
insert into basic_auth.users (email,pass,name,role,verified) values
('joe@begriffs.com','nelson', 'Joe Nelson', 'author','TRUE'),
('ruslan.talpa@gmail.com','talpa', 'Ruslan Talpa', 'author','TRUE');

insert into posts (title,author,body) values
('Postgrest Intro', 'joe@begriffs.com', E'## Introduction\nPostgREST is a standalone web server that turns your database directly into a RESTful API. The structural constraints and permissions in the database determine the API endpoints and operations.\nThis guide explains how to install the software and provides practical examples of its use. You''ll learn how to build a fast, versioned, secure API and how to deploy it to production.\nThe project has a friendly and growing community.'),
('Postgrest Intro again', 'ruslan.talpa@gmail.com', E'## Introduction\nPostgREST is a standalone web server that turns your database directly into a RESTful API. The structural constraints and permissions in the database determine the API endpoints and operations.\nThis guide explains how to install the software and provides practical examples of its use. You''ll learn how to build a fast, versioned, secure API and how to deploy it to production.\nThe project has a friendly and growing community.');

insert into comments (body, author, post) values
('Interesting project', 'joe@begriffs.com', 1),
('Interesting project indeed', 'ruslan.talpa@gmail.com', 1),
('Interesting project', 'joe@begriffs.com', 2);
commit;