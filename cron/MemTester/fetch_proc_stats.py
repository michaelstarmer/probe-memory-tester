from sys import stderr, stdin, stdout
import sys
from time import sleep
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


def parseProcStats(status):
    keys = ['Name', 'Pid', 'VmSize', 'VmPeak', 'VmData', 'State']
    parsed = {}
    for idx, value in enumerate(status):
        if str(value).replace(':', '') not in keys:
            continue
        parsed[str(value.replace(':', ''))] = status[idx+1]
    return parsed


def getProcStats(name='ewe'):
    (stdin, stdout, stderr) = ssh.exec_command(
        f"""
ps -p $(systemctl --property=MainPID show probe.{name} | cut -d '=' -f2) -o %mem,%cpu | head -n 2 | tail -n 1
"""
    )
    type(stdin)
    data = ''.join(stdout.readlines()).split()
    return data


def saveSystemStats(data):
    response = requests.post(f'http://localhost:3333/api/stats', data)
    if response.status_code != 200:
        print(response)
        sys.exit(f"Bad request ({response.status_code})!")
    print('System stats saved!')
    return True


def getProbeProcs():
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


payload = getProbeProcs()

saveProcStats(4, payload)

ssh.close()
