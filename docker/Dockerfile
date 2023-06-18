FROM node:18-alpine3.17
RUN apk add --no-cache bash
WORKDIR /app
ADD ./ .
RUN npm install
RUN npm run build
CMD ["npm", "start"]
