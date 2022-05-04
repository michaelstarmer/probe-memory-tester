from update_probe_sw import update_probe_sw
from jenkins_btech import JenkinsBuild
from probe_ssh import RemoteClient
from logger import Log
import requests
from db_adapter import Queue

# 1. Upgrade probe-software to latest successful build

queue = Queue(host='10.0.28.187', database='memtest',
              username='memtest', password='ldap2retro')
appConfig = queue.getSettings()
probeIp = appConfig['probe_ip']
jenkinsJob = appConfig['jenkins_job']

print('probe ip:    ', probeIp)
print('jenkins job: ', jenkinsJob)

probe = RemoteClient(probeIp, 'root', 'elvis')
jenkins = JenkinsBuild(version=None, job=jenkinsJob)

build = jenkins.loadLastCompletedBuild()

print('Checking last job:')
last_job_build_number = queue.getLastJobBuildNumber()
if last_job_build_number:
    if build.buildNumber <= last_job_build_number:
        Log.warn(
            f'Latest build in job {jenkinsJob} (build no. {last_job_build_number}) already tested.')
        exit()

Log.info(f'New build discovered (build no. {build.buildNumber})')
queue.createJob(memory=4, xml_config=2, duration=10,
                jenkins_job=build.job, build_number=build.buildNumber, status='running')

Log.info('Starting automatic test of latest Jenkins-build...')
update_probe_sw(probeIp, 'root', 'elvis', '6.1')

exit(0)
# no startAt means immediate execution
# duration dynamic?
payload = {
    'memory': 4,
    'cpu': 4,
    'xmlFileId': 2,
    'duration': 60,
}
requests.post('http://localhost:3333/api/jobs/create', data=payload)
