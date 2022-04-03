FROM python:3.7

RUN apt-get update && apt-get install -y locales tzdata

ENV TZ=Europe/Oslo
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

RUN apt-get update && apt-get -y install cron vim
RUN pip3 install requests paramiko argparse mysql-connector-python matplotlib xmltodict
WORKDIR /app

COPY crontab /etc/cron.d/crontab
RUN chmod 0644 /etc/cron.d/crontab
RUN /usr/bin/crontab /etc/cron.d/crontab
ENV xmlpath /app/xml_config
# run crond as main process of container
CMD ["cron", "-f"]
