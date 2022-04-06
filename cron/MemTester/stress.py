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
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(RHOST, username='root',
                   password='elvis', timeout=DURATION*60)
    transport = client.get_transport()
    channel = transport.open_session()
    print('Executing stress-ng memory test...')
    try:
        channel.exec_command(
            f"""yum install stress-ng -y & nohup stress-ng
                --vm-bytes {MEMORY}G 
                --vm-keep 
                --vm 1
                --timeout {DURATION}M
                > /dev/null &""")
        print('Memory test complete.')
    except Exception as e:
        print('stress-ng error:', e)
