FROM node:16-bullseye
ADD ./app /app
WORKDIR /app
RUN apt-get -y update && apt-get -y install wakeonlan iputils-ping
RUN npm install