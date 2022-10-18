from asyncio import subprocess
from math import ceil
from numbers import Number
from tkinter import Tk
import requests
import json
import sys
import subprocess
import os
import time
import paramiko
from webapi import WebApi
from logger import Log

VM_HOST = '10.0.28.140'
DEV_HOST = '192.168.147.131'
PORT = 3333

API_HOST = 'http://memtest.dev.btech'

api = WebApi(API_HOST)
settings = api.getSettings()

if settings['probe_ip']:
    Log.info('Probe IP detected in db settings. Using VM HOST: ' +
             settings['probe_ip'])
    VM_HOST = settings['probe_ip']

if os.environ.get('API_HOST'):
    API_HOST = os.environ['API_HOST']
if os.environ.get('VM_HOST'):
    VM_HOST = os.environ['VM_HOST']

print('LOCAL TIME:', time.strftime('%c'))


def getProcStats(name='ewe'):
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(VM_HOST, username='root', password='elvis')
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


def get_proc_mem():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(VM_HOST, username='root', password='elvis')
    try:
        (stdin, stdout, stderr) = ssh.exec_command(
            f'ssh -o StrictHostKeyChecking=no' + 'cd; top -bn 1 | ' +
            """awk '/Mem :/ {print $4 " " $6 " " $8 " " $10}'""")
        type(stdin)
        # print('get_proc_mem:', ''.join(stdout.readlines()).split())
        mem_values = ''.join(stdout.readlines()).split()

        return mem_values
    except Exception as e:
        print('get proc mem error!', e)


def get_proc_cpu():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(VM_HOST, username='root', password='elvis')
    try:
        (stdin, stdout, stderr) = ssh.exec_command(
            f'ssh -o StrictHostKeyChecking=no' + 'cd; top -bn 1 | ' +
            """awk '/^%Cpu/ {print $4 " " $6 " " $8}'""")
        type(stdin)
        cpu_values = ''.join(stdout.readlines()).split()
        return cpu_values
    except Exception as e:
        print('get proc mem error!', e)


def get_mem_usage_percent():
    memory = get_proc_mem()
    m_used = memory[2].replace(',', '')
    m_buff_cached = memory[3].replace(',', '')
    m_total = memory[0].replace(',', '')
    memory_used_pct = (float(m_used) + float(m_buff_cached)
                       ) / float(m_total) * 100
    return int(memory_used_pct)


def get_memory_usage():
    url = f'{API_HOST}/mem'
    print(url)
    try:
        response = requests.get(f'{API_HOST}/quicklook/mem')
        if response.status_code != 200:
            sys.exit(f"Bad request ({response.status_code})!")
        response = json.loads(response.content)
        return response['mem']
    except Exception as e:
        print("error mem!", e)


def get_cpu_usage():
    url = f'{API_HOST}/mem'
    print(url)
    try:
        response = requests.get(f'{API_HOST}/quicklook/cpu')
        if response.status_code != 200:
            sys.exit(f"Bad request ({response.status_code})!")
        response = json.loads(response.content)
        return response['cpu']
    except Exception as e:
        print("error cpu!", e)


def get_amps():
    try:
        response = requests.get(f'{API_HOST}/amps')
        if response.status_code != 200:
            sys.exit(f"Bad request ({response.status_code})!")
        data = json.loads(response.content)
        return {'ott': data[0], 'ewe': data[1], 'vidana': data[2], 'etr': data[3]}
    except Exception as e:
        print("error!", e)


def get_current_job_id():
    try:
        response = requests.get(f'{API_HOST}/api/queue/active')
        if response.status_code != 200:
            sys.exit(f"Bad request ({response.status_code})!")
        job = json.loads(response.content)
        return job['id']
    except Exception as e:
        print("No job id found in queue.", e)


def add_job_stats(data):
    try:
        response = requests.post(f'{API_HOST}/api/stats', data)
        if response.status_code != 200:
            print(response)
            sys.exit(f"Bad request ({response.status_code})!")
        # print(response)
        return True
    except Exception as e:
        print("error - add job stats!", e)
        return False


def add_btech_stats(job_id, data):
    try:
        print(data)
        response = requests.post(
            f'{API_HOST}/api/stats/btech/{job_id}', data)
        if response.status_code != 200:
            sys.exit(f"Bad request ({response.status_code})!")
        return True
    except Exception as e:
        print("error!", e)
        return False


def get_processes_by_mem():
    try:
        response = requests.get(f'{API_HOST}/processlist')
        if response.status_code != 200:
            sys.exit(f"Bad request ({response.status_code})!")
        return json.loads(response.content)
    except Exception as e:
        print("error!", e)
        return False


t = get_proc_mem()
print(t)
mem_total = t[0]
mem_free = t[1]
mem_used = t[2]
mem_pct = get_mem_usage_percent()
print('mem %:', mem_pct)

c = get_proc_cpu()
cpu_usr = c[0]
cpu_sys = c[1]
job_id = get_current_job_id()
if not job_id:
    sys.exit('No active jobs to log.')

data = {'cpu': float(cpu_usr), 'mem': float(mem_pct)}
print(data)
if add_job_stats(data):
    print('[ SUCCESS ] System data saved.')
else:
    api.logToJob(job_id, 'Error while reading CPU/RAM from probe.', 'error')

payload = getAllProbeProcs()

if api.addProcStats(job_id, payload):
    print('[ SUCCESS ] System data saved.')
else:
    api.logToJob(
        job_id, 'Error while reading CPU/RAM from btech processes.', 'error')

exit(0)
