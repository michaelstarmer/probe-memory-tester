#!/usr/bin/python env

from sys import stdin, stdout, stderr
import paramiko
import argparse
import re

HOST = "esxi.mps"
USER = "root"
PASSWORD = None
MEM = None
NAME = None
VMID = None
volumePath = "/vmfs/volumes/61e6bf06-2507a90a-4787-3cecef8a206a"

# parser = argparse.ArgumentParser(description="Edit VM memory")
# parser.add_argument("-P", "--password", dest="PASSWORD", type=str, help="ESXi password")
# parser.add_argument("name", type=str, help="Name of VM to delete")
# parser.add_argument("memory", type=int, help="Memory in GB")
# args = parser.parse_args()

# if args.PASSWORD:
#     PASSWORD = args.PASSWORD
# if args.name:
#     NAME = args.name
# if args.memory:
#     MEM = args.memory


class ProbeVM:
    def __init__(self, host, user, vm_name, password=None):
        self.HOST = host
        self.USER = user
        self.NAME = vm_name
        self.PASSWORD = password
        self.VMID = None
        try:
            self.ssh = paramiko.SSHClient()
            self.ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            self.ssh.connect(host, username=user, password=password)
        except Exception as e:
            print("SSH connect error!")
            print(e)
            exit(1)

    def powerOff(self):
        vmState = ""
        (stdin, stdout, stderr) = self.ssh.exec_command(
            f"vim-cmd vmsvc/power.off {str(self.VMID)} ||echo")
        type(stdin)
        while vmState != "off":
            (stdin, stdout, stderr) = self.ssh.exec_command(
                f"vim-cmd vmsvc/power.getstate {self.VMID}")
            type(stdin)
            lines = str(stdout.readlines()) + str(stderr.readlines())
            if re.search("Powered off", lines):
                vmState = "off"

    def powerOn(self):
        vmState = ""
        (stdin, stdout, stderr) = self.ssh.exec_command(
            f"vim-cmd vmsvc/power.on {str(self.VMID)} ||echo")
        type(stdin)
        print(f"Powered on: {self.NAME}")

    def changeMemSize(self, GB):
        newMemSize = str(GB*1024)
        cmd = f"""sed -i 's/memSize.*$/memSize = {newMemSize}/g' {volumePath}/{self.NAME}/{self.NAME}.vmx"""
        # print(f">> {cmd}")
        (stdin, stdout, stderr) = self.ssh.exec_command(cmd)
        type(stdin)

    def set_memory(self, MEM):
        if not self.NAME:
            print(f"Missing input value --name")

        try:
            (stdin, stdout, stderr) = self.ssh.exec_command(
                "vim-cmd vmsvc/getallvms")
            type(stdin)
            for line in stdout.readlines():
                splitLine = line.split()
                if self.NAME == splitLine[1]:
                    self.VMID = splitLine[0]
        except:
            print(f"Could not find VM")

        if not self.VMID:
            print(f"VM {self.NAME} not found!")
            exit(1)

        try:
            print("\nPowering off VM...")
            self.powerOff()
        except Exception as e:
            print(e)

        try:
            print(f"Setting memory to {MEM}")
            self.changeMemSize(MEM)
            print(stdout.read().decode())
        except Exception as e:
            print(f"Failed to change memSize on {self.NAME}")
            print(e)

        try:
            self.powerOn()
            print("\nDone!")
        except:
            print(f"Failed to power on {self.NAME}")


if __name__ == '__main__':
    print("Main")
