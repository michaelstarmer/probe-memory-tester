from datetime import datetime
import time
import json
from vm_edit_mem import ProbeVM
from probe.probe_eii import Probe
from db_adapter import Queue
import requests
import logging
import os


# testspecs = [
#     { 'memory': 32, 'xml': '2000-streams.xml' },
#     { 'memory': 24, 'xml': '100-streams.xml' },
# ]

if __name__ == '__main__':
    queue = Queue(host='10.0.28.98', database='memtest', username='memtest', password='ldap2retro')
    probe_ip = queue.probeIp()
    vm = ProbeVM("10.0.28.202", "root", "sw-probe-memtest", password="ldap2retro!")
    probe = Probe(probe_ip)
    job = {}
    
    # job = queue.getJob()
    try:
        response = requests.get('http://localhost:3333/api/queue/next')
        if response.status_code != 200:
            print(f'Bad request - {response.status_code} (localhost:3333/api/queue/next)')
            exit()
    
        payload = json.loads(response.content)
        print(payload)
        job = payload
        print('Fetched jon!', job)
        
    except Exception as e:
        logging.error(e)

    if not job.get('id'):
        print('No new jobs in queue.')
        exit(0)


    jobId = job.get('id')
    memory = job.get('memory')
    xml = job.get('xmlFile')
    queue.log(jobId, 'running')
    print("Running memory test:")
    print(f'\t- RAM: {memory}, config: {xml}')

    try:
            print("\n#####################################################")
            print("# Running memory test for the following configuration: ")
            print(f'# Probe: {xml} streams')
            print(f'# RAM  : {memory}GB')
            print('#######################################################')
            print("Importing new xml-config...")
            print("CWD:", os.getcwd())
            probe.import_config(xml)
            print("Probe configuration: OK")
            vm.set_memory(memory)
            print("VM configuration   : OK")
            print("\nProbe updated and running new settings for 90 seconds.")
            queue.setJobCompleted(id=jobId)
    except Exception as e:
        print("memtester error!", e)
        exit(1)


