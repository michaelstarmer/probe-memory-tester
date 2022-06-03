FROM python:3.7

RUN apt-get update && apt-get install -y locales tzdata

ENV TZ=Europe/Oslo
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
RUN apt-get update && apt-get -y install cron vim

WORKDIR /app
COPY MemTester/requirements.txt .
RUN pip3 install -r requirements.txt
RUN pip3 install --upgrade paramiko
COPY crontab /etc/cron.d/crontab
RUN chmod 0644 /etc/cron.d/crontab
RUN /usr/bin/crontab /etc/cron.d/crontab
ENV xmlpath /app/xml_config
# run crond as main process of container
CMD ["cron", "-f"]
