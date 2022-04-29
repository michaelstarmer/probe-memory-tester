import sys
from sys import stdin, stdout, stderr
from probe_ssh import RemoteClient


def install_stress_ng(RHOST):
    probe = RemoteClient(RHOST, 'root', 'elvis')
    probe.installPackage('stress-ng')


def set_memory(RHOST, MEMORY, DURATION):
    try:
        probe = RemoteClient(RHOST, 'root', 'elvis')
        probe.exec(['killall stress-ng'])
        probe.exec(
            [f'stress-ng --vm-bytes {MEMORY}G --vm-keep --vm 1 --timeout {DURATION}M >/dev/null 2>&1 &'])
    except:
        print('stress-ng error')
        print(str(sys.exc_info()[0]))
        sys.exit(1)
