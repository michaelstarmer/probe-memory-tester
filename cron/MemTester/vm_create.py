#!/usr/bin/python env

import argparse
import paramiko
import getpass
import sys
from sys import stdin, stdout, stderr
from utils import setup_config

print("Setting up config...")
ConfigData = setup_config()
NAME            = ""
LOG             = ConfigData['LOG']
isDryRun        = ConfigData['isDryRun']
isVerbose       = ConfigData['isVerbose']
isSummary       = ConfigData['isSummary']
HOST            = ConfigData['HOST']
USER            = ConfigData['USER']
PASSWORD        = ConfigData['PASSWORD']
CPU             = ConfigData['CPU']
MEM             = ConfigData['MEM']
HDISK           = int(ConfigData['HDISK'])
DISKFORMAT      = ConfigData['DISKFORMAT']
VIRTDEV         = ConfigData['VIRTDEV']
STORE           = ConfigData['STORE']
NET             = ConfigData['NET']
ISO             = ConfigData['ISO']
GUESTOS         = ConfigData['GUESTOS']
VMXOPTS         = ConfigData['VMXOPTS']
MAC             = ConfigData['MAC']

DSPATH = ""
DSSTORE = ""
ErrorMessages = []
CheckHasErrors = False

parser = argparse.ArgumentParser(description="CLI for creating VM")
parser.add_argument("-H", "--host", dest="HOST", type=str, help="ESXi host/IP")
parser.add_argument("-U", "--user", dest="USER", type=str, help="ESXi user")
parser.add_argument("-P", "--password", dest="PASSWORD", type=str, help="ESXi password")
parser.add_argument("-n", "--name", dest="NAME", type=str, help="VM name")
parser.add_argument("--MEM", dest="MEM", type=int, help="Memory/RAM (GB)")
parser.add_argument("--update", dest="UPDATE", type=str, help="Update config file")
args = parser.parse_args()

if args.HOST:
    HOST = args.HOST
if args.USER:
    USER = args.USER
if args.PASSWORD:
    PASSWORD = args.PASSWORD
if args.NAME:
    NAME = args.NAME
if args.MEM:
    MEM = int(args.MEM)

if args.UPDATE:
    print("Save new values to config file.")

try:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(HOST, username=USER, password=PASSWORD)

except Exception as e:
    print(f"Could not connect to ESXi: {e.msg}")
    sys.exit(1)


try:
    (stdin, stdout, stderr) = ssh.exec_command("esxcli storage filesystem list | grep '/vmfs/volumes/.*true  VMFS' | sort -nk7")
    type(stdin)
    VOLUMES = {}
    for line in stdout.readlines():
        splitLine = line.split()
        VOLUMES[splitLine[0]] = splitLine[1]
        LeastUsedDS = splitLine[1]
except Exception as e:
    print(f"Error reading volumes: {str(sys.exc_info()[0])}")
    ErrorMessages(f"Could not find volume.")
    CheckHasErrors = True

if STORE == "LeastUsed":
    STORE = LeastUsedDS

V = []
for Path in VOLUMES:
    V.append(VOLUMES[Path])
    if STORE == Path or STORE == VOLUMES[Path]:
        DSPATH = Path
        DSSTORE = VOLUMES[Path]

if DSSTORE not in V:
    print("ERROR: Disk Storage does not exist.")
    ErrorMessages.append(f"Disk Storage {STORE} does not exist!")
    CheckHasErrors = True

try:
    FullPath = f"{DSPATH}/{NAME}"
    (stdin, stdout, stderr) = ssh.exec_command("ls -d " + FullPath)
    type(stdin)
    if stdout.readlines() and not stderr.readlines():
        print(f"Error: directory {FullPath} already exists.")
        ErrorMessages.append(f"Directory {FullPath} already exists.")
        CheckHasErrors = True
except:
    pass

VMX = []
VMX.append('.encoding = "UTF-8"')
VMX.append('config.version = "8"')
VMX.append('virtualHW.version = "19"')
VMX.append('vmci0.present = "TRUE"')
VMX.append('displayName = "' + NAME + '"')
VMX.append('floppy0.present = "FALSE"')
VMX.append('numvcpus = "4"')
VMX.append('scsi0.present = "TRUE"')
VMX.append('scsi0.sharedBus = "none"')
VMX.append('scsi0.virtualDev = "pvscsi"')
VMX.append('memSize = "' + str(MEM * 1024) + '"')
VMX.append('scsi0:0.present = "TRUE"')
VMX.append('scsi0:0.fileName = "' + NAME + '.vmdk"')
VMX.append('scsi0:0.deviceType = "scsi-hardDisk"')
if ISO == "": 
    VMX.append('ide1:0.present = "TRUE"')
    VMX.append('ide1:0.fileName = "emptyBackingString"')
    VMX.append('ide1:0.deviceType = "atapi-cdrom"')
    VMX.append('ide1:0.startConnected = "FALSE"')
    VMX.append('ide1:0.clientDevice = "TRUE"')
else:
    VMX.append('ide1:0.present = "TRUE"')
    VMX.append('ide1:0.fileName = "' + ISO + '"')
    VMX.append('ide1:0.deviceType = "cdrom-image"')
VMX.append('pciBridge0.present = "TRUE"')
VMX.append('pciBridge4.present = "TRUE"')
VMX.append('pciBridge4.virtualDev = "pcieRootPort"')
VMX.append('pciBridge4.functions = "8"')
VMX.append('pciBridge5.present = "TRUE"')
VMX.append('pciBridge5.virtualDev = "pcieRootPort"')
VMX.append('pciBridge5.functions = "8"')
VMX.append('pciBridge6.present = "TRUE"')
VMX.append('pciBridge6.virtualDev = "pcieRootPort"')
VMX.append('pciBridge6.functions = "8"')
VMX.append('pciBridge7.present = "TRUE"')
VMX.append('pciBridge7.virtualDev = "pcieRootPort"')
VMX.append('pciBridge7.functions = "8"')
VMX.append('guestOS = "' + GUESTOS + '"')
if NET != "None":
    VMX.append('ethernet0.virtualDev = "vmxnet3"')
    VMX.append('ethernet0.present = "TRUE"')
    VMX.append('ethernet0.networkName = "' + NET + '"')
    if MAC == "": 
        VMX.append('ethernet0.addressType = "generated"')
    else:
        VMX.append('ethernet0.addressType = "static"')
        VMX.append('ethernet0.address = "' + MAC + '"')

print("\nVMX:")
for entry in VMX:
    print(entry)

MyVM = FullPath + "/" + NAME
if CheckHasErrors:
    Result = "Errors"
else:
    Result = "Success"

if CheckHasErrors:
    print("\nError! Could not create VM.")
    for msg in ErrorMessages:
        print(f"\t{msg}")
    exit(1)

input("Config is valid! Press Enter to create VM...")

def create_vmx():
    (stdin, stdout, stderr) = ssh.exec_command(f"mkdir {FullPath}")
    type(stdin)
    for line in VMX:
        (stdin, stdout, stderr) = ssh.exec_command(f"echo {line} >> {MyVM}.vmx")
        type(stdin)
        # print(stdout.read().decode())


def create_vmdk():
    cmd = f"vmkfstools -c {str(HDISK)}G -d {DISKFORMAT} {MyVM}.vmdk"
    print(f">> {cmd}")
    (stdin, stdout, stderr) = ssh.exec_command(cmd)
    type(stdin)
    if stderr.readlines():
        print("Could not create .vmdk file!")
        print(stderr.read().decode())
        sys.exit(1)


def register():
    cmd = f"vim-cmd solo/registervm {MyVM}.vmx"
    print(f">> {cmd}")
    (stdin, stdout, stderr) = ssh.exec_command(cmd)
    type(stdin)
    return int(stdout.readlines()[0])


def power_on(VMID):
    cmd = f"vim-cmd vmsvc/power.on {VMID}"
    (stdin, stdout, stderr) = ssh.exec_command(cmd)
    type(stdin)
    if stderr.readlines():
        print("power.on VM error!")
        Result="Fail"

try:
    
    print(f"Create {NAME}.vmx file")
    create_vmx()
    print(f"Creating {NAME}.vmdk file")
    create_vmdk()
    VMID = register()
    print(f"\nPower on {NAME} (VMID: {VMID})...")
    power_on(VMID)
    ssh.close()
    
except Exception as e:
    print(f"Error while creating VM.")
    print(e)
    ErrorMessages.append("Error exception while creating VM.")
    Result = "Fail"
    

print(f"\nVM creation: {Result}\n")