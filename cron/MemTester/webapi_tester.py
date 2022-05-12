from webapi import WebApi

api = WebApi('http://localhost:3333')

settings = api.getSettings()
print('settings:')
print(settings)

nextJob = api.getWaitingJob()
if nextJob and nextJob['id']:
    print(f"Starting job: {nextJob['id']}")
    startJob = api.startJob(nextJob['id'])
    print(startJob)
