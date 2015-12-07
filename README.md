#PostgREST blog demo

```
vagrant up
```

after that try the folowing urls
```
http://localhost:8000/
```

The folowing ports are being forwarded
```
3000 - direct connection to PostgREST
8000 - nginx (proxies the frontend at "/" and postgrest at "/api" )
5433 - postgrest (admin/admin)
8080 - express serving the dev version of the frontend with hot code reloading using webpack
```
