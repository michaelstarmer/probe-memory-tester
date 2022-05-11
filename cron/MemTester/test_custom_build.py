from update_probe_sw import update_probe_sw
from jenkins_btech import JenkinsBuild
from probe_ssh import RemoteClient
from logger import Log
import requests
from db_adapter import Queue

queue = Queue(host='10.0.28.187', database='memtest',
              username='memtest', password='ldap2retro')
config = queue.getSettings()
probeIp = config['probe_ip']

probe = RemoteClient(probeIp, 'root', 'elvis')

job = queue.getWaitingManualJob()
print(job)
waitingManualJob = queue.getWaitingManualJob()
if not waitingManualJob:
    Log.warn('No manual jobs waiting in queue.')
    exit(0)

Log.info('Found manual job waiting for execution:')
print(waitingManualJob)

print('Starting automatic test for:', waitingManualJob['jenkins_job'])
probe_updated = update_probe_sw(probeIp=probeIp, probeUser='root',
                                probePass='elvis', jobName=waitingManualJob['jenkins_job'])

jobId = waitingManualJob['id']
if not probe_updated:
    response = requests.post(f'http://localhost:3333/api/jobs/{jobId}/log', {
        'type': 'warning', 'message': 'Error while updating probe.'})
    if response.status_code != 200:
        Log.error(f'Bad request ({response.status_code})')
else:
    response = requests.post(f'http://localhost:3333/api/jobs/{jobId}/log', {
        'type': 'info', 'message': 'Probe updated successfully.'})
    if response.status_code != 200:
        Log.error(f'Bad request ({response.status_code})')
    queue.startJob(jobId)
print('Done.')
# jenkins = JenkinsBuild(version=None, job=)
