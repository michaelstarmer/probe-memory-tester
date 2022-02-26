#!/usr/bin/python env

from sys import stdin, stdout, stderr
import paramiko
import argparse

HOST = "esxi.mps"
USER = "root"
NAME = ""
VMID = None

parser = argparse.ArgumentParser(description="CLI for creating VM")
parser.add_argument("-H", "--host", dest="HOST", type=str, help="ESXi host/IP")
parser.add_argument("-U", "--user", dest="USER", type=str, help="ESXi user")
parser.add_argument("-P", "--password", dest="PASSWORD", type=str, help="ESXi password")
parser.add_argument("--name", dest="NAME", type=str, help="ID of VM to delete")
args = parser.parse_args()


if args.HOST:
    HOST = args.HOST
if args.USER:
    USER = args.USER
if args.PASSWORD:
    PASSWORD = args.PASSWORD
if args.NAME:
    NAME = args.NAME

if NAME == "":
    print("Missing input value: NAME")
    exit(1)

try:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(HOST, username=USER, password=PASSWORD)
except Exception as e:
    print(f"Error connecting to ESXi")
    print(e)
    exit(1)


try:
    (stdin, stdout, stderr) = ssh.exec_command("vim-cmd vmsvc/getallvms")
    type(stdin)
    for line in stdout.readlines():
        splitLine = line.split()
        if NAME == splitLine[1]:
            VMID = splitLine[0]
except:
    print(f"Could not get VMs")
    exit(1)

if not VMID:
    print(f"VM {NAME} not found.")
    exit(1)

input(f"Destroy VM {NAME} ({VMID})? (Enter)")

try:
    print("\nPowering off VM...")
    (stdin, stdout, stderr) = ssh.exec_command(f"vim-cmd vmsvc/power.off {str(VMID)} ||echo")
    type(stdin)
    lines = str(stdout.readlines()) + str(stderr.readlines())
    print(lines)

    print("\nDestroying VM...")
    cmd = f"vim-cmd vmsvc/destroy {str(VMID)}"
    (stdin, stdout, stderr) = ssh.exec_command(cmd)
    type(stdin)
    lines = str(stdout.readlines()) + str(stderr.readlines())
    print(f"Done! VM destroyed.")

except Exception as e:
    print(e)
    exit(1)

exit(0)