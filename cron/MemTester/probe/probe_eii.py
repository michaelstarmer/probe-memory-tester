from concurrent.futures import process
import readline
from urllib import response
import requests
import json
import xmltodict
import traceback, logging
import os


class ProbeRequest:

    def get(url, pretty=False):
        try:
            response = requests.get(url)
            if response.status_code != 200:
                print(f'Bad request - {response.status_code} ({url})')
                exit(1)
            content = json.dumps(xmltodict.parse(response.content), indent=2)
            if not pretty:
                return json.loads(content)
            return content 
        except Exception as e:
            logging.error(traceback.format_exc())

    def post(url, file, pretty=False):
        try:
            response = requests.post(url, file)
            if response.status_code != 200:
                print(f'Bad request - {response.status_code} ({url})')
                exit(1)
        except Exception as e:
            print(e)
            exit()


class Probe:
    def __init__(self, probe_ip):
        self.probe_ip = probe_ip
        self.api_base = f'http://{probe_ip}/probe'

    def get_status(self, pretty=False):
        return ProbeRequest.get(f'{self.api_base}/status', pretty)
        
    def get_generaldata(self, pretty=False):
        return ProbeRequest.get(f'{self.api_base}/generaldata', pretty)

    def get_alarms(self, pretty=False):
        return ProbeRequest.get(f'{self.api_base}/alarms', pretty)

    def get_alarmconfigdata(self, pretty=False):
        return ProbeRequest.get(f'{self.api_base}/alarmconfigdata', pretty)

    def get_ethdata(self, pretty=False):
        return ProbeRequest.get(f'{self.api_base}/ethdata', pretty)

    def get_pidinfo(self, pretty=False):
        return ProbeRequest.get(f'{self.api_base}/pidinfo', pretty)
        
    def get_ottdata(self, pretty=False):
        return ProbeRequest.get(f'{self.api_base}/ottdata', pretty)

    def get_etrcurrentepg(self, pretty=False):
        return ProbeRequest.get(f'{self.api_base}/etrcurrentepg', pretty)

    def get_licensekey(self, pretty=False):
        return ProbeRequest.get(f'{self.api_base}/licensekeys?xml=1', pretty)

    def export_config(self, filename='./export.xml'):
        xml = requests.get(f'{self.api_base}/?xml=1&exportMask=0x80000000&xmlFlags=0x10')
        with open(filename, 'wb') as file:
            file.write(xml.content)
        return filename


    def import_config(self, xmlFile):
        file = open(f'{xmlFile}', 'rb')
        print("Work dir:", os.getcwd())
        try:
            result = ProbeRequest.post(f'{self.api_base}/core/importExport/data.xml', open(xmlFile, 'rb'))
            return result
        except Exception as e:
            print('post error!')
            print(e)


    def debug_data(self):
        FoundMemInfo = False
        DebugData = dict()
        try:
            data = requests.get(f'{self.api_base}/core/data.xml?xml=1')
            for line in data.text.splitlines():
                if line[:8] == 'meminfo:':
                    print("True")
                    FoundMemInfo = True
                if FoundMemInfo:
                    l = line.split()
                    if len(l) > 2:
                        if l[0] == "MemTotal:":
                            print(l[1])
                            DebugData['MemTotal'] = int(l[1])
                        elif l[0] == "MemFree:":
                            print(l[1])
                            DebugData['MemFree'] = int(l[1])
                # print(line)
            print(DebugData)
            return DebugData
        except Exception as e:
            print("error fetching debug data!", e)
            return None