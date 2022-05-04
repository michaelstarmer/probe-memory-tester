import json
from update_probe_sw import update_probe_sw
from jenkins_btech import JenkinsBuild
from probe_ssh import RemoteClient
from logger import Log
import requests
from db_adapter import Queue
import os

API_HOST = 'http://localhost:3333'
if os.environ.get('API_HOST'):
    API_HOST = os.environ['API_HOST']


def activeJobExists():
    response = requests.get(f'{API_HOST}/api/queue/active')
    if response.status_code != 200:
        Log.error(f'Bad request ({response.status_code})!')
        exit(1)
    job = json.loads(response.content)
    if job and job['id']:
        return True
    return False

# 1. Upgrade probe-software to latest successful build


if activeJobExists():
    exit(0)

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
