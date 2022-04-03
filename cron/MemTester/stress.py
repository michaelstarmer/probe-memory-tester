from hashlib import sha1
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
            [f'ssh', '-o', 'StrictHostKeyChecking=no', '-i', 'keys/memtester',
                f'{RUSER}@{RHOST}', 'cd;', 'stress-ng', '--vm-bytes', f'{MEMORY}G', '--vm-keep', '--vm', '1', '--timeout', f'{DURATION}', '&', 'disown'],
            capture_output=True, text=True)
        
        print(result.stdout.split())
        print(result.stderr.split())
        return result.stdout.split()
        
        print('#### End test ####')
    except Exception as e:
        print('ssh connect error!', e)
        exit(1)
