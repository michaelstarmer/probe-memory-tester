#!/usr/bin/python env
from probe.probe_eii import Probe
import argparse

PROBE_IP = '10.0.28.97'
XML_FILE = './export-heavy-load.xml'


def main():
    print("main")
    parser = argparse.ArgumentParser(description="Export full probe config")
    parser.add_argument("PROBE", type=str, help="Probe IP")
    parser.add_argument("FILENAME", type=str, help="XML filename")
    args = parser.parse_args()

    probe = Probe(args.PROBE)
    FILENAME = args.FILENAME

    try:
        xmlFile = XML_FILE
        print(f'Upload config to probe: {probe.probe_ip}')
        print(f'Config file: {FILENAME}')
        print(probe.import_config(FILENAME))
    except Exception as e:
        print(e)


if __name__ == '__main__':
    main()
