# step 0: verify if rpm version is compatible with current probe version
# step 1: download latest successful rpm-build
# step 2: upload rpm to probe
#         - scp module
# step 3: remove old version (if any)
#         - yum remove -y $(yum list | grep btech-probe)
# step 3: install rpm on probe
#         - yum localinstall -y <rpmPath>
# step 4: verify install OK

from jenkins_builds import JenkinsBuild
from probe_ssh import RemoteClient
from logger import Log
import os
import re


def purgeBinaries(dir):
    for f in os.listdir(dir):
        if re.search(r'.*\.(rpm|tea)', f):
            os.remove(os.path.join(dir, f))


def update_probe_sw():
    PROBE_IP = '10.0.28.239'
    PROBE_USER = 'root'
    PROBE_PASS = 'elvis'
    JENKINS_PROBE_VERSION = '6.1'
    JENKINS_PROBE_JOB = 'CentOS7-based_6.1'

    probe = RemoteClient(PROBE_IP, PROBE_USER, PROBE_PASS)
    jenkins = JenkinsBuild(JENKINS_PROBE_VERSION, JENKINS_PROBE_JOB)

    latestBuild = jenkins.loadLastSuccessfulBuild()
    currentProbeVersion = probe.getVersion()
    upgradeVersion = latestBuild.getVersion()

    print(f"""###### Probe upgrade ######
    PROBE
    \tIP       : {PROBE_IP}
    \tVersion  : {currentProbeVersion}
    TARGET
    \tJob      : {JENKINS_PROBE_VERSION} / {JENKINS_PROBE_JOB}
    \tVersion  : {upgradeVersion}
    \tBuild no.: {latestBuild.buildNumber}
    \tGitCommit: {latestBuild.gitCommit}
    \tUrl      : {latestBuild.buildUrl}
    """)

    print('Downloading binary from Jenkins...')
    binExt = 'tea'
    binary = latestBuild.downloadBinary(extension=binExt, location='./')
    print(f'\nUpload and install .{binExt}-file to probe ({PROBE_IP})...')
    probe.upload(binary, '/var/opt/btech/probe/')
    purgeBinaries('./')
    # probe.removePackage('btech-probe')
    upgradeSuccess = probe.exec([f'/opt/btech/probe/bin/vprobe_upgrade'])
    if upgradeSuccess:
        Log.success('Probe software update complete.')
    else:
        Log.error('Probe software update failed.')
