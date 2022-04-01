FROM python:3.7
RUN apt-get update && apt-get install -y locales tzdata
RUN sed -i -e 's/# nb_NO.UTF-8 UTF-8/nb_NO.UTF-8 UTF-8/' /etc/locale.gen && \
    dpkg-reconfigure --frontend=noninteractive locales && \
    update-locale LANG=nb_NO.UTF-8
ENV LANG='nb_NO.UTF-8' LANGUAGE='nb_NO:no' LC_ALL='nb_NO.UTF-8'
RUN cp /usr/share/zoneinfo/Europe/Oslo /etc/localtime
RUN locale -a


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
