from urllib import response
import paramiko
from scp import SCPClient, SCPException
from paramiko.auth_handler import AuthenticationException
from typing import List
import sys
from logger import Log


class RemoteClient:
    def __init__(
        self,
        host: str,
        user: str,
        password: str,
    ):
        self.host = host
        self.user = user
        self.password = password
        self.remote_path = '~/'
        self.client = None

    @property
    def connection(self):
        try:
            client = paramiko.SSHClient()
            client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            client.connect(
                self.host,
                username=self.user,
                password=self.password,
                timeout=5000
            )
            return client
        except AuthenticationException as e:
            print(f'Authentication failed: {e}')

    @property
    def scp(self) -> SCPClient:
        conn = self.connection
        return SCPClient(conn.get_transport())

    @property
    def disconnect(self):
        if self.connection:
            self.connection.close()
        if self.scp:
            self.scp.close()

    def installPackage(self, packageName: str):
        (stdin, stdout, stderr) = self.connection.exec_command(
            f'yum install -y {packageName}')
        exit_status = stdout.channel.recv_exit_status()
        if exit_status != 0:
            Log.error(f'Failed to install package: {packageName}')
            return False
        return True

    def removePackage(self, packageName: str):
        (stdin, stdout, stderr) = self.connection.exec_command(
            f'yum remove -y $(yum list | grep {packageName})')
        exit_status = stdout.channel.recv_exit_status()
        if exit_status != 0:
            Log.error(f'Could not remove package: {packageName}')

    def deleteExistingProbeSw(self):
        self.removePackage('btech-probe')
        # self.exec(['rm -rf /opt/btech/probe'])

    def getVersion(self):
        (stdin, stdout, stderr) = self.connection.exec_command(
            '/opt/btech/probe/bin/version')
        exit_status = stdout.channel.recv_exit_status()
        response = stdout.read().splitlines()
        if not len(response) > 0:
            return None
        response = response.pop().decode('utf-8')
        if not exit_status == 0:
            print('version error!', stderr)
        return response

    def upload(self, file, remote_path):
        try:
            self.scp.put(file, remote_path=remote_path)
        except SCPException as e:
            raise e

    def exec(self, commands: List[str]):
        for cmd in commands:
            sys.stdout.write('\x1b[1;33m' + cmd + '\x1b[0m' + '\n')
            (stdin, stdout, stderr) = self.connection.exec_command(cmd)
            exit_status = stdout.channel.recv_exit_status()
            response = stdout.readlines()
            for line in response:
                sys.stdout.write('\x1b[1;34m' + line + '\x1b[0m')
            if exit_status != 0:
                return False
            print('')
            return True
