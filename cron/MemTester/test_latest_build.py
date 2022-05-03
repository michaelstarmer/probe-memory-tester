from update_probe_sw import update_probe_sw
from jenkins_btech import JenkinsBuild
from probe_ssh import RemoteClient
from logger import Log
import requests

# 1. Upgrade probe-software to latest successful build

probeIp = '10.0.28.239'

probe = RemoteClient(probeIp, 'root', 'elvis')
build = JenkinsBuild('6.1')

Log.info('Running test of latest Jenkins-build...')
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
