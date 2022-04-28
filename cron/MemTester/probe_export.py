#!/usr/bin/python env
from fileinput import filename
from probe.probe_eii import Probe
import argparse
PROBE_IP = '10.0.28.97'


def main():
    print("Export probe config")
    parser = argparse.ArgumentParser(description="Export full probe config")
    parser.add_argument("PROBE", type=str, help="Probe IP")
    parser.add_argument("FILENAME", type=str, help="XML filename")
    args = parser.parse_args()

    probe = Probe(args.PROBE)
    FILENAME = args.FILENAME

    try:
        export = probe.export_config(filename=FILENAME)
        print(f"Probe config exported to {export}")
    except Exception as e:
        print('export error!', e)
        exit(1)


if __name__ == '__main__':
    main()

    # window.open('/probe?'+'xml=1&exportMask=0x80000000&saveas=full_config.xml
