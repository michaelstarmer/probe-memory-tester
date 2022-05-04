import json
import requests
import re
from tqdm import tqdm
from logger import Log


class JenkinsBuild:
    def __init__(self, version=None, job=None):
        if not version and not job:
            Log.error('At least one argument required: version, job')
            exit(1)
        self.buildUrl = f'http://build.dev.btech/view/v{version}/job/{job}/label=centos7,product=vprobe'
        self.build = None
        self.buildNumber = None
        self.gitCommit = None
        self.version = version
        if not job:
            self.job = f'CentOS7-based_{version}'
            self.buildUrl = f'http://build.dev.btech/view/v{version}/job/CentOS7-based_{version}/label=centos7,product=vprobe'
        if not version:
            self.job = job
            self.buildUrl = f'http://build.dev.btech/job/{job}'

    def fetch(self, url):
        print(f'{self.buildUrl}/api/json?pretty=true')
        response = requests.get(
            f'{self.buildUrl}/api/json?pretty=true')
        if response.status_code != 200:
            if response.status_code == 404:
                print('Job not found!')
                return None
            return None
        if not response.content:
            print('No valid build response.')
        return response.content

    def parseResponse(self, build):
        if not len(build):
            print('No build data found.')
            return None
        self.build = build
        self.buildNumber = build['number']
        if len(build['changeSet']['items']):
            commitId = build['changeSet']['items'][0]['commitId'][:8]
            self.gitCommit = commitId[:8]

    def loadLastStableBuild(self):
        self.buildUrl = f"{self.buildUrl}/lastSuccessfulBuild"
        build = self.fetch(f'{self.buildUrl}/api/json?pretty=true')
        self.parseResponse(json.loads(build))
        return self

    def loadLastSuccessfulBuild(self):
        self.buildUrl = f"{self.buildUrl}/lastSuccessfulBuild"
        build = self.fetch(f'{self.buildUrl}/api/json?pretty=true')
        self.parseResponse(json.loads(build))
        return self

    def loadLastCompletedBuild(self):
        self.buildUrl = f"{self.buildUrl}/lastCompletedBuild"
        build = self.fetch(f'{self.buildUrl}/api/json?pretty=true')
        self.parseResponse(json.loads(build))
        return self

    def loadLastBuild(self):
        self.buildUrl = f"{self.buildUrl}/lastBuild"
        build = self.fetch(f'{self.buildUrl}/api/json?pretty=true')
        self.parseResponse(json.loads(build))
        return self

    def loadByBuildId(self, buildId: int):
        self.buildUrl = f"{self.buildUrl}/{str(buildId)}"
        build = self.fetch(f'{self.buildUrl}/api/json?pretty=true')
        self.parseResponse(json.loads(build))
        return self

    def print(self):
        if not self.build:
            print('No data found for build.')
            exit(1)
        print(json.dumps(self.build, indent=4))

    def getBuildArtifacts(self):
        if not self.build or len(self.build) < 1:
            print('Build required to get artifacts')
            return None
        if not dict(self.build).get('artifacts'):
            print('Artifacts not found in build object')
            return None
        return self.build['artifacts']

    def searchArtifactExt(self, artifactList, extention):
        for artifact in artifactList:
            match = re.match(r'(.*\.' + extention + '$)',
                             artifact['relativePath'])
            if match:
                return {'fileName': artifact['fileName'], 'relativePath': artifact['relativePath']}

    def getVersion(self):
        artifact = self.searchArtifactExt(self.getBuildArtifacts(), 'rpm')
        return artifact['fileName']

    def downloadBinary(self, extension='', location='./'):
        artifact = self.searchArtifactExt(self.getBuildArtifacts(), extension)
        extensionUrl = f'{self.buildUrl}/artifact/{artifact["relativePath"]}'
        filePath = location + artifact['fileName']
        # dl with progressbar
        with requests.get(extensionUrl, stream=True) as r:
            r.raise_for_status()
            with open(filePath, 'wb') as f:
                total = int(r.headers['content-length'])  # bytes -> kb
                pbar = tqdm(total=total)
                for chunk in r.iter_content(chunk_size=8192):
                    if chunk:
                        f.write(chunk)
                        pbar.update(len(chunk))
        return filePath
