from datetime import datetime
import os
import json
from time import sleep

from tqdm import tqdm
from vm_edit_mem import ProbeVM
import stress
from probe.probe_eii import Probe
from db_adapter import Queue
import requests
import logging
from sys import stdin, stdout, stderr
import paramiko
import sys
from update_probe_sw import update_probe_sw
from logger import Log

API_HOST = 'http://memtest.dev.btech'
if os.environ.get('API_HOST'):
    API_HOST = os.environ['API_HOST']

print(f'\nCRON API_HOST = {API_HOST}')


def set_snapshot(sid):
    # sshpass -p "$vmpwd" ssh "$vmhost" vim-cmd vmsvc/snapshot.revert "$vmid" "$snapid" true || exit 1
    vmid = 29
    snapid = sid
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('10.0.28.202', username='root', password='ldap2retro')
    try:
        (stdin, stdout, stderr) = ssh.exec_command(
            f'vim-cmd vmsvc/snapshot.revert {vmid} {sid} true || exit 1')
        type(stdin)
    except Exception as e:
        print('error!', e)


def power_on_vm(vmid):
    # sshpass -p "$vmpwd" ssh "$vmhost" vim-cmd vmsvc/snapshot.revert "$vmid" "$snapid" true || exit 1

    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('10.0.28.202', username='root', password='ldap2retro')
    try:
        (stdin, stdout, stderr) = ssh.exec_command(
            f'vim-cmd vmsvc/power.on "{vmid}" || exit 1')
        type(stdin)
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
    with tqdm(total=100) as pbar:
        for i in range(10):
            sleep(1)
            pbar.update(10)
    print(f'Restarting VM (vmid: {vmid}')
    power_on_vm(vmid)
    with tqdm(total=100) as pbar:
        for i in range(10):
            sleep(3)
            pbar.update(10)
    Log.success('Done.')


def startTestRun(memory=0, duration=0):
    queue = Queue(host='10.0.28.187', database='memtest',
                  username='memtest', password='ldap2retro')
    probe_ip = queue.probeIp()
    print('probe ip:', probe_ip)
    if not probe_ip:
        print('Probe IP not set.')
        exit(1)

    try:
        print('')
        Log.warn('### RUNNING DEVELOPMENT MODE ###')
        print('')
        Log.info('Changing snapshot...')
        change_snapshot(vmid=29, snapshot_id=9)
        Log.success('OK')
        Log.info('Updating probe software...')
        update_probe_sw('10.0.28.239', 'root', 'elvis', '6.1')
        Log.success('OK')
        Log.info('Installing stress-ng')
        stress.install_stress_ng(RHOST=probe_ip)
        Log.success('OK')
        if memory and duration:
            Log.info('Setting probe memory...')
            stress.set_memory(RHOST=probe_ip, MEMORY=memory,
                              DURATION=duration)
        else:
            Log.warn('Memory/duration not specified. Skipping stress-ng startup.')
        Log.success('\nVM configuration complete.')
        # print("Importing xml config...")
        # probe.import_config(xml)
        # Log.success('OK')
    except Exception as e:
        print("memtester error!", e)
        exit(1)


if __name__ == '__main__':

    isDev = False
    if sys.argv[1] and sys.argv[1] == 'dev':
        isDev = True

    if isDev:
        startTestRun()
        exit()

    queue = Queue(host='10.0.28.187', database='memtest',
                  username='memtest', password='ldap2retro')
    probe_ip = queue.probeIp()
    print('probe ip:', probe_ip)
    if not probe_ip:
        print('Probe IP not set.')
        exit(1)

    probe = Probe(probe_ip)
    nextJob = {}
    previous_job = get_last_job()

    try:
        response = requests.get(f'{API_HOST}/api/queue/next')
        if response.status_code != 200:
            print(
                f'Bad request - {response.status_code} (http://memtest.dev.btech/api/queue/next)')
            exit()

        payload = json.loads(response.content)
        print(payload)
        nextJob = payload

    except Exception as e:
        logging.error(e)

    if not nextJob.get('id') and not isDev:
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

    # snapshot_id = nextJob.get('version')
    snapshot_id = 8  # default to 6.0.0-2
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
        Log.info('\nStarting new probe test:')
        print('xml    :', xml)
        print('memory :', memory)

        print('Setting default snapshot. Standby while probe is booting...')

        change_snapshot(vmid=29, snapshot_id=snapshot_id)
        queue.log(jobId, 'running')
        print(
            f"\nProbe updated. Setting new memory for duration: {duration} minutes.")
        update_probe_sw('10.0.28.239', 'root', 'elvis', '6.1')
        print('Updated probe sw.')
        stress.install_stress_ng(RHOST=probe_ip)
        stress.set_memory(RHOST=probe_ip, MEMORY=memory,
                          DURATION=duration)
        print('Memory set!')

        print("Importing new xml-config...")

        probe.import_config(xml)
        # queue.setJobCompleted(id=jobId)
    except Exception as e:
        print("memtester error!", e)
        exit(1)
