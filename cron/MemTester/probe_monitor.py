#!/usr/bin/python env
from probe.probe_eii import Probe
import json
import probe_export

probe = Probe('10.0.28.97')
status = probe.get_status()

print(json.dumps(status, indent=2))

DebugData = probe.debug_data()
for item in DebugData:
    print(item)

print('Done')
