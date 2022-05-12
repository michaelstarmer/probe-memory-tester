from time import sleep
import paramiko
from sys import stdin, stdout, stderr


class ESXiClient:
    def __init__(self, host, username, password):
        self.host = host
        self.username = username
        self.password = password

    def set_snapshot(self, vmid, sid):
        # sshpass -p "$vmpwd" ssh "$vmhost" vim-cmd vmsvc/snapshot.revert "$vmid" "$snapid" true || exit 1
        snapid = sid
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        ssh.connect(hostname=self.host, username=self.username,
                    password=self.password)
        try:
            (stdin, stdout, stderr) = ssh.exec_command(
                f'vim-cmd vmsvc/snapshot.revert {vmid} {sid} true || exit 1')
            type(stdin)
            sleep(30)
            return True
        except Exception as e:
            print('error!', e)

    def power_on_vm(self, vmid):
        # sshpass -p "$vmpwd" ssh "$vmhost" vim-cmd vmsvc/snapshot.revert "$vmid" "$snapid" true || exit 1

        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        ssh.connect(hostname=self.host, username=self.username,
                    password=self.password)
        try:
            (stdin, stdout, stderr) = ssh.exec_command(
                f'vim-cmd vmsvc/power.on "{vmid}" || exit 1')
            type(stdin)
            sleep(10)
            return True
        except Exception as e:
            print('error!', e)
