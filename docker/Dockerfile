FROM alpine
RUN apk update && apk add nano npm nodejs wget bash --no-cache coreutils git
WORKDIR /app
ADD ./ .
RUN npm install
RUN npm run build
CMD ["npm", "start"]
