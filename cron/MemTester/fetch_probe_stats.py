from math import ceil
from tkinter import Tk
import requests
import json
import sys

HOST = '10.0.28.109'
PORT = 61208

API_BASE = f'http://{HOST}:{PORT}/api/3'

def get_memory_usage():
    url = f'{API_BASE}/mem'
    print(url)
    try:
        response = requests.get(f'{API_BASE}/quicklook/mem')
        if response.status_code != 200:
            sys.exit(f"Bad request ({response.status_code})!")
        response = json.loads(response.content)
        return response['mem']
    except Exception as e:
        print("error!", e)
        exit(1)
        
        
def get_cpu_usage():
    url = f'{API_BASE}/mem'
    print(url)
    try:
        response = requests.get(f'{API_BASE}/quicklook/cpu')
        if response.status_code != 200:
            sys.exit(f"Bad request ({response.status_code})!")
        response = json.loads(response.content)
        return response['cpu']
    except Exception as e:
        print("error!", e)
        exit(1)
        
        
def get_amps():
    try:
        response = requests.get(f'{API_BASE}/amps')
        if response.status_code != 200:
            sys.exit(f"Bad request ({response.status_code})!")
        return json.loads(response.content)
    except Exception as e:
        print("error!", e)
        exit(1)
        
        
def get_current_job_id():
    try:
        response = requests.get(f'http://localhost:3333/api/queue/active')
        if response.status_code != 200:
            sys.exit(f"Bad request ({response.status_code})!")
        job = json.loads(response.content)
        return job['id']
    except Exception as e:
        print("error!", e)
        exit(1)
        
        
def add_job_stats(data):
    try:
        response = requests.post(f'http://localhost:3333/api/stats', data)        
        if response.status_code != 200:
            sys.exit(f"Bad request ({response.status_code})!")
        return True
    except Exception as e:
        print("error!", e)
        return False
        

cpu = get_cpu_usage()
mem = get_memory_usage()

data = {'cpu': cpu, 'mem': mem}
add_job = add_job_stats(data)
if add_job:
    print('\nAdded stats to active job:')
    print(data)