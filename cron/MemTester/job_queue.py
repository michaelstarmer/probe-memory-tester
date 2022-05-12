from logger import Log
# from jenkins_btech import JenkinsBuild
from probe_ssh import RemoteClient
from probe.probe_eii import Probe
from esxi import ESXiClient
from update_probe_sw import update_probe_sw
from webapi import WebApi
from stress import install_stress_ng, set_memory

apiclient = WebApi('http://localhost:3333')
esxi = ESXiClient('10.0.28.202', 'root', 'ldap2retro!')

settings = apiclient.getSettings()
probeIp = settings['probe_ip']
autoTestJenkinsJob = settings['jenkins_job']

probe = RemoteClient(probeIp, 'root', 'elvis')
eii = Probe(probe_ip=probeIp)

jobReadyToStart = apiclient.getWaitingJob()
if not jobReadyToStart or not jobReadyToStart['id']:
    Log.info('No jobs ready for startup in queue.')
    exit(0)
jobId = jobReadyToStart['id']

print(jobReadyToStart)
Log.info('Job ready to start testing.')

if (jobReadyToStart['is_manual']):
    print('Changing snapshot for manual test.')
    snapshotSet = esxi.set_snapshot(29, 2)
    if not snapshotSet:
        apiclient.logToJob(jobId, 'Error setting snapshot', 'error')
        exit()
    poweredOn = esxi.power_on_vm(29)
    if not poweredOn:
        apiclient.logToJob(jobId, 'Error restarting vm', 'error')
        exit()
    apiclient.logToJob(jobId, message='Snapshot reverted to default.')
    Log.success('OK')

print('\nImporting XML')
# eii.import_config(jobReadyToStart['xmlConfig']['filename'])
apiclient.logToJob(
    jobId, message='Imported XML configuration.', logType='info')
Log.success('OK')

print('\nUpdating probe sw.')
swUpdate = update_probe_sw(probeIp, 'root', 'elvis',
                           swVersion=None, jobName=jobReadyToStart['jenkins_job'])
if not swUpdate:
    apiclient.logToJob(
        jobId, 'Probe software upgrade failed. See logs.', 'error')
    exit()

Log.success('OK')
print('Setting job started')
apiclient.startJob(jobReadyToStart['id'])
apiclient.logToJob(jobId, 'Updated probe software', 'info')

Log.success('OK')

exit()
Log.info("[ QUEUE ] Starting new test")
esxi.set_snapshot(29, 2)
esxi.power_on_vm(29)
