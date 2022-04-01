import sys
from sys import stdin, stdout, stderr
import argparse
import subprocess

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
    try:
        print('#### Start test ####')
        result = subprocess.run(
            [f'ssh {RUSER}@{RHOST} stress-ng --vm-bytes {MEMORY}G --vm-keep --vm 1 --timeout {DURATION}'],
            check=True, shell=True)
        result.check_returncode()

        print('#### End test ####')
    except Exception as e:
        print('ssh connect error!', e.msg)
        exit(1)
