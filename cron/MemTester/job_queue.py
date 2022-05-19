from time import sleep
import requests
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

settings = {}
settings = apiclient.getSettings()
probeIp = settings['probe_ip']
autoTestJenkinsJob = settings['jenkins_job']

esxiVmId = 29
esxiSnapshotId = 6

if settings.get('esxi_snapshot_id'):
    esxiSnapshotId = settings['esxi_snapshot_id']
if settings.get('esxi_vmid'):
    esxiVmId = settings['esxi_vmid']

probe = RemoteClient(probeIp, 'root', 'elvis')
eii = Probe(probe_ip=probeIp)

jobReadyToStart = apiclient.getWaitingJob()
if not jobReadyToStart or not jobReadyToStart['id']:
    Log.info('No jobs ready for startup in queue.')
    exit(0)
jobId = jobReadyToStart['id']

print(jobReadyToStart)
apiclient.setJobStatus(jobId, 'initializing')
Log.info('Job ready to start testing.')

if (jobReadyToStart):
    print('Changing snapshot for manual test.')
    snapshotSet = esxi.set_snapshot(29, 6)
    if not snapshotSet:
        apiclient.logToJob(jobId, 'Error setting snapshot', 'error')
        apiclient.setJobStatus(jobId, 'failed')
        exit()
    poweredOn = esxi.power_on_vm(29)
    if not poweredOn:
        apiclient.logToJob(jobId, 'Error restarting vm', 'error')
        apiclient.setJobStatus(jobId, 'failed')
        exit()
    probeIsOnline = False
    for i in range(6):
        apiclient.logToJob(jobId, message='Pinging probe...')
        sleep(10)
        print('Pinging probe...')
        probeRequest = requests.get(f'http://{probeIp}/probe/status')
        if probeRequest.status_code == 200:
            probeIsOnline = True
            apiclient.logToJob(jobId, message='Probe is back online.')
            break
    if probeIsOnline:
        Log.success('Probe is online!')
        apiclient.logToJob(jobId, message='Snapshot reverted to default.')
    else:
        Log.error('Probe not responding. Update failed.')
        apiclient.logToJob(
            jobId, message='Snapshot reverted to default.', logType='error')


print('\nImporting XML')
# eii.import_config(jobReadyToStart['xmlConfig']['filename'])
apiclient.logToJob(
    jobId, message='Imported XML configuration.', logType='info')
Log.success('OK')

print('\nUpdating probe sw.')
apiclient.logToJob(jobId, message='Updating probe SW.')
swUpdate = update_probe_sw(probeIp, 'root', 'elvis',
                           swVersion=None, jobName=jobReadyToStart['jenkins_job'])
if not swUpdate:
    apiclient.logToJob(
        jobId, 'Probe software upgrade failed. See logs.', 'error')
    apiclient.setJobStatus(jobId, 'failed')
    exit()

if jobReadyToStart['memory'] and jobReadyToStart['memory'] > 0:
    if install_stress_ng(probeIp):
        apiclient.logToJob(jobId, 'Installed stress-ng', logType='info')
    else:
        apiclient.logToJob(
            jobId, 'Error installing stress-ng', logType='error')
    set_memory(probeIp, jobReadyToStart['memory'], jobReadyToStart['duration'])
    apiclient.logToJob(
        jobId, message=f'Memory stress set to {jobReadyToStart["memory"]}GB', logType='info')

apiclient.startJob(jobReadyToStart['id'])
apiclient.logToJob(jobId, 'Successfully updated probe SW', 'info')
apiclient.logToJob(jobId, 'Initialization complete.')

Log.success('OK')

exit()
Log.info("[ QUEUE ] Starting new test")
esxi.set_snapshot(29, 2)
esxi.power_on_vm(29)
