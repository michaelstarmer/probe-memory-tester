from sys import stderr, stdin, stdout
import sys
from time import time
from numpy import number
import paramiko
import requests
from logger import Log
from webapi import WebApi

PROBE_IP = '10.0.28.140'

api = WebApi('http://localhost:3333')

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(PROBE_IP, username='root', password='elvis')


def getProcStats(name='ewe'):
    (stdin, stdout, stderr) = ssh.exec_command(
        f"""
ps -p $(systemctl --property=MainPID show probe.{name} | cut -d '=' -f2) -o %mem,%cpu | head -n 2 | tail -n 1
"""
    )
    type(stdin)
    data = ''.join(stdout.readlines()).split()
    return data


def getAllProbeProcs():
    payload = []
    btechProcesses = ['ana', 'capture', 'database', 'dbana', 'esyslog', 'etr', 'ewe', 'flashserver', 'hugepages',
                      'linkout', 'microbitr', 'ott', 'psi', 'relay', 'sap', 'storage', 'tsoffload', 'ucast_relay', 'vidana', 'ott*']
    for pName in btechProcesses:
        c = getProcStats(pName)
        if c:
            #print(f'{pName} - cpu: {c[0]}, mem: {c[1]}')
            payload.append({'name': pName, 'cpu': c[0], 'mem': c[1]})
    return payload


def saveProcStats(jobId, payload):
    response = requests.post(
        f'http://localhost:3333/api/jobs/{jobId}/proc-stats', json=payload)
    if response.status_code != 200:
        print(response)
        sys.exit(f"Bad request ({response.status_code})!")
    print('System stats saved!')
    return True


def get_current_job_id():
    try:
        response = requests.get(f'{API_HOST}/api/queue/active')
        if response.status_code != 200:
            sys.exit(f"Bad request ({response.status_code})!")
        job = json.loads(response.content)
        return job['id']
    except Exception as e:
        print("No job id found in queue.", e)


job_id = get_current_job_id()
if not job_id:
    sys.exit('No active jobs to log.')

start = time()
payload = getAllProbeProcs()

api.addProcStats(job_id, payload)
finish = time()

delta = finish - start
ssh.close()
Log.success(f'Proc stats finished in {delta} s.')
