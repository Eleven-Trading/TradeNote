## docker installation

1. build the tradenote image with your custom parameters, eg, PARSE_INIT=APPID PARSE_URL=http://localhost:1337/parse
```
docker build -f docker/Dockerfile . -t tradenote:latest --build-arg PARSE_INIT=<your_parse_app_id> --build-arg PARSE_URL=<your_parse_server_url>
```

2. modify the env.env file to match your environment

3. run all the services up

run tradenote services with parse-dashboard
```
cd docker
docker-compose up -d
```

or run tradenote services without parse-dashboard
```
cd docker
docker-compose -f docker-compose-without-dashboard.yaml up -d
```

4. wait at least 1 minute for services up and data creation (IMPORTANT)

5. register via http://<your_ip>:7777/register and login
