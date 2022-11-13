FROM alpine
ENV MONGO_URI=$MONGO_URI
ENV APP_ID=$APP_ID
ENV MASTER_KEY=$MASTER_KEY
ENV PARSE_DASHBOARD_USER_ID=$PARSE_DASHBOARD_USER_ID
ENV PARSE_DASHBOARD_USER_PASSWORD=$PARSE_DASHBOARD_USER_PASSWORD
RUN apk update && apk add nano npm nodejs wget bash --no-cache coreutils git
RUN npm install --global gulp-cli
WORKDIR /app
ADD ./ .
RUN npm install
RUN gulp prod
EXPOSE 7777
CMD ["npm", "start"]
