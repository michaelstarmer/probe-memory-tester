FROM node:16-alpine
WORKDIR /app
COPY . .
RUN npm i serve
RUN npm ci
RUN npm run build
ENV API_HOST $API_HOST
ENV NODE_ENV production
EXPOSE 3000
CMD [ "npx", "serve", "build" ]
