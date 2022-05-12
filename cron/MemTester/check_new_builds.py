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

lastJob = api.getLastJob()
nextJob = api.getNextJob()

if nextJob:
    if nextJob['build_number'] == latestJenkinsBuild.buildNumber and nextJob['jenkins_job'] == latestJenkinsBuild.job:
        Log.warn(
            f'Latest build from Jenkins has already been tested (#{latestJenkinsBuild.buildNumber})')
        exit()

if lastJob:
    if lastJob['build_number'] == latestJenkinsBuild.buildNumber and lastJob['jenkins_job'] == latestJenkinsBuild.job:
        Log.warn(
            f'Latest build from Jenkins has already been tested (#{latestJenkinsBuild.buildNumber})')
        exit()

jobCreated = api.createJob({
    'jenkinsJob': latestJenkinsBuild.job,
    'memory': 4,
    'build_number': latestJenkinsBuild.buildNumber,
    'duration': settings['duration'],
    'xmlFileId': 2,
})
print(jobCreated)
Log.success('New job created!')
