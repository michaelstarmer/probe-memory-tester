from datetime import datetime
import os
import json
from time import sleep
from vm_edit_mem import ProbeVM
import stress
from probe.probe_eii import Probe
from db_adapter import Queue
import requests
import logging
from sys import stdin, stdout, stderr
import paramiko
import sys

API_HOST = 'http://localhost:3333'
if os.environ.get('API_HOST'):
    API_HOST = os.environ['API_HOST']

print(f'\nCRON API_HOST = {API_HOST}')


def set_snapshot(sid):
    # sshpass -p "$vmpwd" ssh "$vmhost" vim-cmd vmsvc/snapshot.revert "$vmid" "$snapid" true || exit 1
    vmid = 29
    snapid = sid
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('10.0.28.202', username='root', password='ldap2retro!')
    try:
        (stdin, stdout, stderr) = ssh.exec_command(
            f'vim-cmd vmsvc/snapshot.revert {vmid} {sid} true || exit 1')
        type(stdin)
        print('Snapshot updated.')
    except Exception as e:
        print('error!', e)


def power_on_vm(vmid):
    # sshpass -p "$vmpwd" ssh "$vmhost" vim-cmd vmsvc/snapshot.revert "$vmid" "$snapid" true || exit 1

    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('10.0.28.202', username='root', password='ldap2retro!')
    try:
        (stdin, stdout, stderr) = ssh.exec_command(
            f'vim-cmd vmsvc/power.on "{vmid}" || exit 1')
        type(stdin)
        print('VM Powered On.')
    except Exception as e:
        print('error!', e)


def get_active_job():
    try:
        response = requests.get(f'{API_HOST}/api/queue/active')
        if response.status_code != 200:
            sys.exit(f"Bad request ({response.status_code})!")
        job = json.loads(response.content)
        return job
    except Exception as e:
        print("error job id!", e)


def get_last_job():
    try:
        response = requests.get(f'{API_HOST}/api/jobs/last')
        if response.status_code != 200:
            sys.exit(f"Bad request ({response.status_code})!")
        job = json.loads(response.content)
        return job
    except Exception as e:
        print("error job id!", e)


def change_snapshot(vmid, snapshot_id):
    set_snapshot(snapshot_id)
    print('Set snapshot. Wait 10 sec...')
    sleep(10)
    print("Snapshot set.")
    print("Restarting. Wait 60 sec...")
    power_on_vm(vmid)
    sleep(60.0)
    print('Done. Snapshot changed.')


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
    nextJob = {}

    previous_job = get_last_job()

    try:
        response = requests.get(f'{API_HOST}/api/queue/next')
        if response.status_code != 200:
            print(
                f'Bad request - {response.status_code} (localhost:3333/api/queue/next)')
            exit()

        payload = json.loads(response.content)
        print(payload)
        nextJob = payload

    except Exception as e:
        logging.error(e)

    if not nextJob.get('id'):
        print('No new jobs in queue.')
        exit(0)

    job = get_active_job()
    if not nextJob.get('id'):
        sys.exit('No jobs to configure')

    jobId = nextJob.get('id')
    memory = nextJob.get('memory')
    xml = nextJob.get('xmlConfig')['filename']
    duration = int(nextJob.get('duration'))
    duration_minutes = duration * 60

    snapshot_id = nextJob.get('version')
    print(f'\nSnapshot ID: {snapshot_id}')

    print("Running memory test:")
    print(f'\t- RAM: {memory}, config: {xml}')

    if not os.path.exists(xml):
        print('XML-file not found:', xml)
        xml = f'/app/{xml}'

    if not xml:
        print("Missing xml")
        exit(1)

    try:
        print("\n#####################################################")
        print("# Running memory test for the following configuration: ")
        print(f'# Probe: {xml} streams')
        print(f'# RAM  : {memory}GB')
        print('#######################################################')
        print(f'nextJob version: {snapshot_id}')
        print('previousJob:', previous_job)
        if not previous_job:
            change_snapshot(vmid=29, snapshot_id=snapshot_id)
        elif previous_job and previous_job.get('version') != snapshot_id:
            change_snapshot(vmid=29, snapshot_id=snapshot_id)
        else:
            print('Same version detected. Not loading snapshot.')

        print("Importing new xml-config...")
        probe.import_config(xml)
        queue.log(jobId, 'running')
        print(
            f"\nProbe updated. Setting new memory for duration: {duration} minutes.")
        stress.set_memory(RHOST=probe_ip, MEMORY=memory,
                          DURATION=duration)
        # queue.setJobCompleted(id=jobId)
    except Exception as e:
        print("memtester error!", e)
        exit(1)
