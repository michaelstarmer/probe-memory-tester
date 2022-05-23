from webapi import WebApi
from jenkins_btech import JenkinsBuild
from logger import Log
import json

api = WebApi('http://localhost:3333')
settings = api.getSettings()
probeIp = settings['probe_ip']
jobNameAutoTest = settings['jenkins_job']

jenkins = JenkinsBuild(version=None, job=jobNameAutoTest)
latestJenkinsBuild = jenkins.loadLastSuccessfulBuild()

print(latestJenkinsBuild.job)
print(latestJenkinsBuild.buildNumber)

foundExistingJob = api.checkPreviousTestExists(
    latestJenkinsBuild.job, latestJenkinsBuild.buildNumber)

if foundExistingJob:
    Log.warn(
        f'Latest Jenkins-build (#{latestJenkinsBuild.buildNumber}) matched with a previous build already tested. Skipping...')
    exit()

jobCreated = api.createJob({
    'jenkinsJob': latestJenkinsBuild.job,
    'memory': 4,
    'build_number': latestJenkinsBuild.buildNumber,
    'duration': settings['duration'],
    'xmlFileId': 5,
})
print(jobCreated)
Log.success('New job created!')
