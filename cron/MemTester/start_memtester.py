from datetime import datetime
import os
import json
from vm_edit_mem import ProbeVM
import stress
from probe.probe_eii import Probe
from db_adapter import Queue
import requests
import logging
from sys import stdin, stdout, stderr
import paramiko

def set_snapshot(sid):
    # sshpass -p "$vmpwd" ssh "$vmhost" vim-cmd vmsvc/snapshot.revert "$vmid" "$snapid" true || exit 1
    vmid = 29
    snapid = sid
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('10.0.28.202', username='root', password='ldap2retro!')
    try:
        (stdin, stdout, stderr) = ssh.exec_command(f'vim-cmd vmsvc/snapshot.revert {vmid} {sid}')
        type(stdin)
        print('Snapshot updated.')
    except Exception as e:
        print('error!', e)
    
if __name__ == '__main__':
    queue = Queue(host='10.0.28.187', database='memtest',
                  username='memtest', password='ldap2retro')
    probe_ip = queue.probeIp()
    print(probe_ip)
    if not probe_ip:
        print('Probe IP not set.')
        exit(1)

    print(f"""\n
    #######################
    # ProbeVM: {probe_ip} #
    #######################
    """)

    probe = Probe(probe_ip)
    job = {}

    try:
        response = requests.get('http://localhost:3333/api/queue/next')
        if response.status_code != 200:
            print(
                f'Bad request - {response.status_code} (localhost:3333/api/queue/next)')
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
    xml = job.get('xmlConfig')['filename']
    print(xml)
    
    snapshot_id = job.get('version')
    print(f'\nSnapshot ID: {snapshot_id}')
    queue.log(jobId, 'running')
    print("Running memory test:")
    print(f'\t- RAM: {memory}, config: {xml}')

    if not os.path.exists(xml):
        print('XML-file not found:', xml)
        print('Assuming prod.')
        xml = f'/app/{xml}'
        exit(1)
        
    if not xml:
        print("Missing xml")
        exit(1)
    

    try:
        print("\n#####################################################")
        print("# Running memory test for the following configuration: ")
        print(f'# Probe: {xml} streams')
        print(f'# RAM  : {memory}GB')
        print('#######################################################')
        print("Importing new xml-config...")
        set_snapshot(snapshot_id)
        probe.import_config(xml)
        print("Probe configuration: OK")
        stress.set_memory(RHOST=probe_ip, MEMORY=memory, DURATION=60)
        print("VM configuration   : OK")
        print("\nProbe updated and running new settings for 90 seconds.")
        # queue.setJobCompleted(id=jobId)
    except Exception as e:
        print("memtester error!", e)
        exit(1)
