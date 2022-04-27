import sys


class Log:
    def __init__(self) -> None:
        pass

    @staticmethod
    def info(msg: str):
        sys.stderr.write('\x1b[1;34m' + msg.strip() + '\x1b[0m' + '\n')

    def success(msg: str):
        sys.stderr.write('\x1b[1;32m' + msg.strip() + '\x1b[0m' + '\n')

    def error(msg: str):
        sys.stderr.write('\x1b[1;31m' + msg.strip() + '\x1b[0m' + '\n')
