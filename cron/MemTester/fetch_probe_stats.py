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

HOST = '10.0.28.239'
DEV_HOST = '192.168.147.131'
PORT = 3333

API_HOST = 'http://localhost:3333'
if os.environ.get('API_HOST'):
    API_HOST = os.environ['API_HOST']

print('LOCAL TIME:', time.strftime('%c'))


def get_proc_mem():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('10.0.28.239', username='root', password='elvis')
    try:
        (stdin, stdout, stderr) = ssh.exec_command(
            f'ssh -o StrictHostKeyChecking=no' + 'cd; top -bn 1 | ' +
            """awk '/Mem :/ {print $4 " " $6 " " $8}'""")
        type(stdin)
        # print('get_proc_mem:', ''.join(stdout.readlines()).split())
        mem_values = ''.join(stdout.readlines()).split()
        return mem_values
    except Exception as e:
        print('get proc mem error!', e)
    # total/free/used
    # result = subprocess.run(
    #     [f'ssh -o StrictHostKeyChecking=no -i ./keys/memtester root@{HOST} ' + """cd; top -bn 1 | awk '/Mem :/ {print $4 " " $6 " " $8}'"""], check=True, capture_output=True, text=True, shell=True)
    # result.check_returncode()
    # print(result.stdout.split())
    # return result.stdout.split()


def get_proc_cpu():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('10.0.28.239', username='root', password='elvis')
    try:
        (stdin, stdout, stderr) = ssh.exec_command(
            f'ssh -o StrictHostKeyChecking=no' + 'cd; top -bn 1 | ' +
            """awk '/^%Cpu/ {print $4 " " $6 " " $8}'""")
        type(stdin)
        cpu_values = ''.join(stdout.readlines()).split()
        return cpu_values
    except Exception as e:
        print('get proc mem error!', e)
    # total/free/used
    # result = subprocess.run(
    #     [f'ssh -o StrictHostKeyChecking=no -p elvis root@{HOST} ' +
    #         """cd; top -bn 1 | awk '/^%Cpu/ {print $4 " " $6 " " $8}'"""],
    #     check=True, capture_output=True, text=True, shell=True)
    # result.check_returncode()
    # return result.stdout.split()


def get_mem_usage_percent():
    memory = get_proc_mem()
    m_used = memory[2].replace(',', '')
    m_total = memory[0].replace(',', '')
    return int(float(m_used) / float(m_total) * 100)


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
        print("error job id!", e)


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
print('mem_total:', mem_total)
print('mem_free:', mem_free)
print('mem_used:', mem_used)
print('mem %:', mem_pct)

c = get_proc_cpu()
print(c)
cpu_usr = c[0]
cpu_sys = c[1]
print('')
print('CPU usr:', float(cpu_usr))
print('CPU sys:', float(cpu_sys))
job_id = get_current_job_id()
if not job_id:
    sys.exit('No active jobs to log.')
data = {'cpu': float(cpu_usr), 'mem': float(mem_pct)}
print(data)
if add_job_stats(data):
    print('[ SUCCESS ] System data saved.')
exit(0)

cpu = get_cpu_usage()
mem = get_memory_usage()
# mem_proc = get_processes_by_mem()

job_id = get_current_job_id()
btech_stats = get_amps()

if job_id:
    for proc in btech_stats.values():
        print('add btech stats:', proc)
        add_btech_stats(job_id, data=proc)

data = {'cpu': cpu, 'mem': mem}
add_job = add_job_stats(data)
if add_job:
    print('\nAdded stats to active job:')
    print(data)
