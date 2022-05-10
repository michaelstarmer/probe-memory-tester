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

waitingManualJob = queue.getWaitingManualJob()
if not waitingManualJob:
    Log.warn('No manual jobs waiting in queue.')
    exit(0)

Log.info('Found manual job waiting for execution:')
print(waitingManualJob)

print('Starting automatic test for:', waitingManualJob['jenkinsJob'])
probe_updated = update_probe_sw(probeIp=probeIp, probeUser='root',
                                probePass='elvis', jobName=waitingManualJob['jenkinsJob'])

jobId = waitingManualJob['id']
if not probe_updated:
    requests.post(f'http://localhost:3333/api/jobs/{jobId}/log', {
                  'type': 'warning', 'message': 'Error while updating probe.'})
else:
    requests.post(f'http://localhost:3333/api/jobs/{jobId}/log', {
        'type': 'info', 'message': 'Probe updated successfully.'})
    queue.setJobRunning(jobId)
print('Done.')
# jenkins = JenkinsBuild(version=None, job=)
