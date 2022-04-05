from hashlib import sha1
import sys
from sys import stdin, stdout, stderr
import argparse
import subprocess
import paramiko


# RHOST = '10.0.28.239'
RUSER = 'root'
# RPASS = 'elvis'

# parser = argparse.ArgumentParser(
#     description="Increase consumtion of system resources on swprobe.")
# parser.add_argument("host", type=str, help="IP address")
# parser.add_argument("memory", type=str, help="IP address")
# parser.add_argument("duration", type=int,
#                     help="Length of test in seconds.")
# args = parser.parse_args()

# RHOST = args.host
# MEMORY = args.memory
# DURATION = args.duration


def set_memory(RHOST, MEMORY, DURATION):

    print('#### Start test ####')
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(RHOST, username='root', password='elvis')
    try:
        (stdin, stdout, stderr) = ssh.exec_command(
            f'cd; stress-ng --vm-bytes {MEMORY}G --vm-keep --vm 1 --timeout {DURATION} & disown')
        type(stdin)
        print('Snapshot updated.')
        return True
    except Exception as e:
        print('error!', e)
