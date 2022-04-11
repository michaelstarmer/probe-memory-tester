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


def install_stress_ng(RHOST):
    try:
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        ssh.connect(RHOST, username='root', password='elvis')

        (stdin, stdout, stderr) = ssh.exec_command(
            "yum install -y stress-ng")
        type(stdin)
        print(stdout)
    except:
        print("The Error is ") + str(sys.exc_info()[0])
        sys.exit(1)


def set_memory(RHOST, MEMORY, DURATION):
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(RHOST, username='root',
                   password='elvis')
    transport = client.get_transport()
    channel = transport.open_session()

    print('Install stress-ng')
    print('stress-ng install: OK')
    print('Executing stress-ng memory test...')
    print(f"""yum install stress-ng -y & stress-ng
                --vm-bytes {MEMORY}G 
                --vm-keep 
                --vm 1
                --timeout {DURATION}M
                > /dev/null 2>1 &""")
    print('Run channel 1 (yum)')
    channel.exec_command(
        f'stress-ng --vm-bytes {MEMORY}G --vm-keep --vm 1 --timeout {DURATION}M >/dev/null 2>&1 &')
    print('Exec ok')
