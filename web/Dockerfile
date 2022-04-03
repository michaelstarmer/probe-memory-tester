FROM node:16.10.0
RUN apt-get update && apt-get install -y locales tzdata
RUN sed -i -e 's/# nb_NO.UTF-8 UTF-8/nb_NO.UTF-8 UTF-8/' /etc/locale.gen && \
    dpkg-reconfigure --frontend=noninteractive locales && \
    update-locale LANG=nb_NO.UTF-8
ENV LANG='nb_NO.UTF-8' LANGUAGE='nb_NO:no' LC_ALL='nb_NO.UTF-8'
RUN cp /usr/share/zoneinfo/Europe/Oslo /etc/localtime
RUN locale -a


# Create app directory

COPY . /app
WORKDIR /app

# RUN npm run build
RUN yarn

RUN npm run build

RUN cp .env ./build/.env

ENV TZ = 'Europe/Amsterdam'

WORKDIR /app/build
RUN yarn install --production
# Install app dependencies
EXPOSE 3333
CMD [ "npm", "start"]
