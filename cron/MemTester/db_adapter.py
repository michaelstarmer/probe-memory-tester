from datetime import datetime
import os
import mysql.connector as db

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
            query = f"""SELECT value FROM probe_configs WHERE probe_configs.key LIKE "ip";"""
            cursor.execute(query)
            result = cursor.fetchone()
            if result:
                return result[0]
        except db.Error as e:
            print(f'db error: {e}')


    def getJob(self):
        cursor = self.connection.cursor()
        try:
            query = "SELECT id, memory, xml_config FROM jobs WHERE completed_at IS NULL ORDER BY id ASC LIMIT 1"
            cursor.execute(query)
            # for (id, memory, xml_config) in cursor:
            #     print(f"Successfully retrieved job: {id}, {memory}, {xml_config}")
            result = cursor.fetchone()
            
            if result:
                return dict(id=result[0], memory= result[1], xml= result[2])
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