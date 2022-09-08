from webapi import WebApi
from jenkins_btech import JenkinsBuild
from logger import Log
import json

api = WebApi('http://memtest.dev.btech')
settings = api.getSettings()
probeIp = settings['probe_ip']
jobNameAutoTest = settings['jenkins_job']

jenkins = JenkinsBuild(version=None, job=jobNameAutoTest)
latestJenkinsBuild = jenkins.loadLastSuccessfulBuild()


print(latestJenkinsBuild.job)
print(latestJenkinsBuild.buildNumber)

foundExistingJob = api.checkPreviousTestExists(
    latestJenkinsBuild.job, latestJenkinsBuild.buildNumber)

buildNumber = latestJenkinsBuild.buildNumber


print('found existing job:', foundExistingJob)
if foundExistingJob:
    Log.warn(
        f'Latest Jenkins-build (#{buildNumber}) matched with a previous build already tested. Skipping...')
    exit()

payload = {
    'jenkinsJob': latestJenkinsBuild.job,
    'buildNumber': buildNumber,
    'duration': settings['duration'],
    'xmlFileId': 5,
    'securityAudit': True,
    'gitCommit': latestJenkinsBuild.gitCommit,
}
jobCreated = api.createJob(payload)
print('payload', payload)
if jobCreated:
    print('jobCreated', jobCreated)
    Log.success('New job created!')
else:
    Log.error('Job not created')
