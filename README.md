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
```

You can have hot code reload while editing the frontend components if you have nodejs on your host machine
```
#install dependencies
npm install -g webpack webpack-dev-server rimraf

#start the server
npm start

#open http:/localhost:8080/ in brower and try editing some of the files from frontend/src/components
```
