# WOL-WEB

```
node index.js
```


## Docker

Build docker image:
```
docker build -t wol-web  .
```

Test:
```
docker-compose up
docker exec -it wol-web-wol_web-1 sh
```

Docker compose:
```
docker-compose up -d
```

Share to [Docker Hub](https://hub.docker.com/r/cedced19/wol-web):
```
docker tag wol-web:latest cedced19/wol-web:1.0
docker push cedced19/wol-web:1.0
```