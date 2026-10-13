# Using 18 alpine because supports arm/v8 and arm/v8 needed for silicon chips
FROM node:18-alpine
RUN apk add --no-cache bash
WORKDIR /app
ADD ./ .
RUN npm install --fetch-retries=5 --fetch-timeout=300000 --fetch-retry-mintimeout=20000 --fetch-retry-maxtimeout=120000
RUN npm run build
CMD ["npm", "start"]