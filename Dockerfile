FROM nginx:alpine
RUN apk update && apk add nano npm
RUN npm install --global gulp-cli
RUN mkdir -p /usr/share/nginx/html/tmp/
WORKDIR /usr/share/nginx/html/tmp/
ADD ./ .
RUN npm install
ARG PARSE_INIT=${PARSE_INIT}
ARG PARSE_URL=${PARSE_URL}
RUN gulp prod --PARSE_INIT $PARSE_INIT --PARSE_URL $PARSE_URL
RUN cp /usr/share/nginx/html/tmp/nginx.conf /etc/nginx/nginx.conf
RUN cp -R /usr/share/nginx/html/tmp/dist/* /usr/share/nginx/html/
WORKDIR /usr/share/nginx/html/
RUN rm -r /usr/share/nginx/html/tmp
EXPOSE 7777