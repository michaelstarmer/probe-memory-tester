FROM node:16.10.0
RUN apt-get update && apt-get install -y locales tzdata
ENV TZ=Europe/Oslo
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone


# Create app directory

COPY . /app
WORKDIR /app

# RUN npm run build
RUN yarn

RUN yarn build

RUN cp .env ./build/.env
RUN cp public/apidoc.json ./build/public/apidoc.json

ENV TZ = 'Europe/Amsterdam'

WORKDIR /app/build
RUN yarn install --production
# Install app dependencies
EXPOSE 3333
ENV TZ=Europe/Oslo
CMD [ "npm", "start"]
