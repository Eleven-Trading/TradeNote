FROM alpine
RUN apk update && apk add nano npm nodejs wget bash --no-cache coreutils git
RUN npm install --global gulp-cli
WORKDIR /app
ADD ./ .
RUN npm install
RUN gulp prod
EXPOSE 7777
CMD ["npm", "start"]
