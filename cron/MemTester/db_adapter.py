from datetime import datetime
import json
import os
import mysql.connector as db
import requests
from logger import Log
user = 'memtest'
password = 'ldap2retro'


class Queue:
    def __init__(self, host, database, username, password):
        self.connection = db.connect(
            user=username,
            password=password,
            host=host,
            database=database)
        pass

    def probeIp(self):
        cursor = self.connection.cursor()
        try:
            query = f"""SELECT value FROM settings WHERE settings.key LIKE 'probe_ip';"""
            cursor.execute(query)
            result = cursor.fetchone()
            print(cursor)
            if result:
                return result[0]
        except db.Error as e:
            print(f'db error: {e}')

    def getWaitingManualJob(self):
        job = requests.get('http://memtest.dev.btech/api/jobs/next')
        if job:
            return json.loads(job.content)
        return None
        exit()
        cursor = self.connection.cursor()
        try:
            query = """SELECT id, memory, jenkins_job, duration, xml_file_id FROM memtest.jobs WHERE is_manual = 1 AND status='waiting' ORDER BY id ASC LIMIT 1;"""
            cursor.execute(query)
            result = cursor.fetchone()

            if result:
                return dict(id=result[0], memory=result[1], jenkinsJob=result[2], duration=result[3], xml=result[4])
        except db.Error as e:
            print(f"db error: {e}")

    def setJobCompleted(self, id):
        now = datetime.now()
        dt = now.strftime('%Y-%m-%d %H:%M:%S')
        cursor = self.connection.cursor()
        try:
            query = f"""UPDATE memtest.jobs
                    SET completed_at='{dt}', status='completed'
                    WHERE id={id};"""
            cursor.execute(query)
            self.connection.commit()

            print(f'Job {id} complete.')
            return True
        except db.Error as e:
            print(f"update job error! {e}")
            return False

    def startJob(self, id):
        print('Queue starting job!')
        try:
            startedJob = requests.get(
                f'http://memtest.dev.btech/api/jobs/{id}/start')
            if not startedJob.status_code == 200:
                print('Error starting job')
                return False
            else:
                print(json.loads(startedJob.content))
                return json.loads(startedJob.content)
        except requests.RequestException as e:
            Log.error('request error')
            print(e)

    def setJobRunning(self, id):
        now = datetime.now()
        dt = now.strftime('%Y-%m-%d %H:%M:%S')
        cursor = self.connection.cursor()
        try:
            query = f"""UPDATE memtest.jobs
                    SET status='running'
                    WHERE id={id};"""
            cursor.execute(query)
            self.connection.commit()

            print(f'Job {id} complete.')
            return True
        except db.Error as e:
            print(f"update job error! {e}")
            return False

    def getLastJobBuildNumber(self):
        cursor = self.connection.cursor()
        try:
            query = """SELECT build_number FROM jobs WHERE is_manual = 0 ORDER BY id DESC LIMIT 1"""
            cursor.execute(query)
            result = cursor.fetchone()
            if result:
                return result[0]
        except db.Error as e:
            print(f'db error: {e}')

    def getSettings(self):
        cursor = self.connection.cursor()
        try:
            query = """SELECT settings.key, settings.value FROM settings"""
            cursor.execute(query)
            result = cursor.fetchall()
            settings = {}
            if result:
                for setting in result:
                    settings[setting[0]] = setting[1]
                return settings
        except db.Error as e:
            Log.error(f'db error: {e}')

    def getSelectedJenkinsJob(self):
        cursor = self.connection.cursor()
        try:
            query = """SELECT value FROM settings WHERE settings.key = 'jenkins_job'"""
            cursor.execute(query)
            result = cursor.fetchone()
            if result:
                return result[0]
        except db.Error as e:
            Log.error(f'db error: {e}')

    def createJob(self, memory, xml_config, duration, jenkins_job, build_number, status):
        print(jenkins_job, build_number)

        cursor = self.connection.cursor()
        try:
            query = f"""INSERT INTO memtest.jobs (memory, xml_file_id, duration, jenkins_job, build_number, status) VALUES ({memory}, {xml_config}, {duration}, '{jenkins_job}', {build_number}, '{status}')"""
            cursor.execute(query)
            self.connection.commit()
        except db.Error as e:
            Log.error('Error: insert job to db failed!')
            print(e)

    def log(self, id, status):
        now = datetime.now()
        dt = now.strftime('%Y-%m-%d %H:%M:%S')
        cursor = self.connection.cursor()
        try:
            query = f"""UPDATE memtest.jobs
                    SET status='{status}'
                    WHERE id={id};"""
            cursor.execute(query)
            self.connection.commit()

            print(f'Logged status to job {id}: {status}.')
            return True
        except db.Error as e:
            print(f"update job error! {e}")
            return False
