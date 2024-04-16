FROM node:18-alpine3.17
RUN apk add --no-cache bash
WORKDIR /app
COPY package.json ./
RUN npm install -timeout=600000
COPY . .
RUN npm run build
CMD ["npm", "start"]