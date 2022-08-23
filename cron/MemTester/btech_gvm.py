from base64 import b64decode
from pathlib import Path
from pprint import pprint
import paramiko
import xmltodict

hostname = '10.0.28.89'
username = 'kali'
password = 'kali'


class GvmSSH:
    def __init__(self, hostname, username, password):
        self.hostname = hostname
        self.username = username
        self.password = password

    def _sshExec(self, cmd, noParseXml=False):
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        ssh.connect(hostname=self.hostname,
                    username=self.username, password=self.password)
        try:
            (stdin, stdout, stderr) = ssh.exec_command(cmd)
            stdin.close()
            lines = stdout.readlines()
            xmlString = ""
            for line in lines:
                xmlString += line
            if not xmlString:
                raise Exception("Could not get response")
            if noParseXml:
                return xmlString
            return xmltodict.parse(xmlString)
        except paramiko.SSHException as e:
            print('ssh err:', e)
        except Exception as e:
            print('err!')
            print(e)

    def tasks(self):
        payload = self._sshExec(
            f'gvm-cli --gmp-username admin --gmp-password ldap2retro socket --xml "<get_tasks/>"')
        if not payload or not payload['get_tasks_response']:
            return False
        return payload['get_tasks_response']['task']

    def targets(self):
        payload = self._sshExec(
            f'gvm-cli --gmp-username admin --gmp-password ldap2retro socket --xml "<get_targets/>"')
        if not payload:
            return False
        return payload['get_targets_response']['target']

    def reports(self):
        payload = self._sshExec(
            f'gvm-cli --gmp-username admin --gmp-password ldap2retro socket --xml "<get_reports/>"')
        if not payload:
            return False
        return payload['get_reports_response']['report']

    def startTask(self, task_id):
        cmd = f'gvm-cli --gmp-username admin --gmp-password ldap2retro socket --xml "<start_task task_id=\\"{task_id}\\"/>"'
        payload = self._sshExec(cmd)
        if not payload['start_task_response']["@status"] == '202':
            return False
        return payload['start_task_response']["report_id"]

    def taskStatus(self, task_id):
        cmd = f'gvm-cli --gmp-username admin --gmp-password ldap2retro socket --xml "<get_tasks task_id=\\"{task_id}\\"/>"'
        payload = self._sshExec(cmd)

        return payload['get_tasks_response']['task']

    def taskReport(self, report_id):
        cmd = f'gvm-cli --gmp-username admin --gmp-password ldap2retro socket --xml "<get_reports report_id=\\"{report_id}\\" details=\\"hml\\"/>"'
        payload = self._sshExec(cmd)

        return payload['get_reports_response']

    def taskResults(self, report_id):
        cmd = f'gvm-cli --gmp-username admin --gmp-password ldap2retro socket --xml "<get_results report_id=\\"{report_id}\\" details=\\"hml\\"/>"'
        payload = self._sshExec(cmd)

        return payload['get_results_response']

    def downloadReportPDF(self, report_id, path='report.pdf'):
        cmd = f'gvm-cli --gmp-username admin --gmp-password ldap2retro socket --xml "<get_reports report_id=\\"{report_id}\\" details=\\"hml\\" format_id=\\"c402cc3e-b531-11e1-9163-406186ea4fc5\\"/>"'
        payload = self._sshExec(cmd)
        content = payload['get_reports_response']['report']["#text"]
        binaryBase64EncodedPdf = str(content).encode('ascii')
        binaryPdf = b64decode(binaryBase64EncodedPdf)
        pdfPath = Path(path).expanduser()
        pdfPath.write_bytes(binaryPdf)
        return pdfPath

    def reportFormats(self):
        cmd = f'gvm-cli --gmp-username admin --gmp-password ldap2retro socket --xml "<get_report_formats/>"'
        payload = self._sshExec(cmd)
        return payload

    def printTask(task):
        id = task["@id"]
        name = task["name"]
        inUse = task["in_use"]
        lastReport = task["last_report"]["report"]

        print('TASK')
        print(f'{name} ({id})')
        print(f'In use? {"yes" if inUse == "1" else "no"}')
        if lastReport:
            print(f'Last report:\n\t- {lastReport["@id"]}')
        print()
