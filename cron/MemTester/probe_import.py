#!/usr/bin/python env
import os
from probe.probe_eii import Probe
import argparse

PROBE_IP = '10.0.28.239'
XML_FILE = './export-heavy-load.xml'
ROOT_DIR = os.path.abspath(os.curdir)




probe = Probe('10.0.28.140')

exportFile = probe.export_config('export.xml')

print('Export file abs path:', f'{ROOT_DIR}/export.xml')
print('path exists:', os.path.exists('./export.xml'))

if os.path.exists('./export.xml'):
    resultImport = probe.import_config(f'export.xml')
    print('result', resultImport)

