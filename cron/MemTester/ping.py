from probe.probe_eii import Probe
import time
import json
RHOST = '10.0.28.239'

probe = Probe('10.0.28.239')

start = time.time()
status = probe.get_status()
print(json.dumps(status, indent=2))
end = time.time()
print(f'Elapsed time: {end - start}')

exit()
