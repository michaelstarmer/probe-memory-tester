import json
import requests
from logger import Log


class WebApi:
    def __init__(self, host):
        self.host = host

    def _post(self, endpoint, payload):
        url = f'{self.host}/{endpoint}'
        response = requests.post(url, data=payload)
        if response.status_code != 200:
            Log.warn(f'POST error: ({response.reason}): {url}')
            return False
        return json.loads(response.content)

    def _get(self, endpoint):
        url = f'{self.host}/{endpoint}'
        response = requests.get(url)
        if response.status_code != 200:
            Log.warn(f'GET error: ({response.reason}): {url}')
            return False
        return json.loads(response.content)

    def createJob(self, payload):
        print('Create job')
        response = self._post('api/jobs/create', payload)
        return response

    def getSettings(self):
        response = self._get('api/probe-config')
        return response

    def setJobStatus(self, id, status):
        response = self._get(f'api/jobs/{id}/status/{status}')
        return response

    def getWaitingJob(self):
        response = self._get(f'api/jobs/next')
        return response

    def startJob(self, id):
        response = self._get(f'api/jobs/{id}/status/running')
        return response

    def getLastJob(self):
        response = self._get(f'api/jobs/last')
        return response

    def getNextJob(self):
        response = self._get(f'api/jobs/next')
        return response

    def getJenkinsJobForAutoTesting(self):
        print('Get Jenkins job for auto testing')

    def logToJob(self, id, message, logType='info'):
        print('Log to job')
        payload = {
            'type': logType,
            'message': message}
        response = self._post(f'api/jobs/{id}/log', payload)
        return response

    def checkPreviousTestExists(self, jenkinsJob, buildNumber):
        response = self._get(
            f'api/search-job/{jenkinsJob}/buildNumber/{buildNumber}')
        return response
