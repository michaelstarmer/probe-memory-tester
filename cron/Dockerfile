FROM python:3.7
RUN apt-get update && apt-get -y install cron vim
RUN pip3 install requests paramiko argparse mysql-connector-python matplotlib xmltodict
WORKDIR /app

COPY crontab /etc/cron.d/crontab
RUN chmod 0644 /etc/cron.d/crontab
RUN /usr/bin/crontab /etc/cron.d/crontab
ENV xmlpath /app/xml_config
run echo $xmlpath
run ls -la
# run crond as main process of container
CMD ["cron", "-f"]
