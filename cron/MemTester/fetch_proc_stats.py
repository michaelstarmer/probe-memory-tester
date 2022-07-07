from sys import stderr, stdin, stdout
import sys
from time import sleep
from numpy import number
import paramiko
from logger import Log

PROBE_IP = '10.0.28.140'

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(PROBE_IP, username='root', password='elvis')


def parseProcStats(status):
    keys = ['Name', 'Pid', 'VmSize', 'VmPeak', 'VmData', 'State']
    parsed = {}
    for idx, value in enumerate(status):
        if str(value).replace(':', '') not in keys:
            continue
        parsed[str(value.replace(':', ''))] = status[idx+1]
    return parsed


def getProcStats(name='ewe'):
    (stdin, stdout, stderr) = ssh.exec_command(
        f"""
ps -p "/proc/$(systemctl --property=MainPID show probe.{name} | cut -d '=' -f2) -o %mem,rss"
"""
    )
    type(stdin)
    data = ''.join(stdout.readlines()).split()
    return parseProcStats(data)


def printStat(stat):
    print(
        f"""{int(stat['VmSize'])/1000} KB ({stat['Name']} - {stat['State']})""")


procs = [getProcStats('ewe'), getProcStats(
    'etr'), getProcStats('ott'), getProcStats('vidana')]

for proc in procs:
    procName = str(proc['Name'])
    if len(procName) < 8:
        for x in range(8 - len(procName)):
            procName = procName + ' '
    print(f'{procName} {proc["VmData"]} kB')

ssh.close()
