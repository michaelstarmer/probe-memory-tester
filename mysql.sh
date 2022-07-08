#!/bin/bash
HOST="172.18.0.2"
if [ "$1" == "prod" ] ; then
  printf "Using prod!\n"
  HOST="10.0.28.187"
fi

mysql -h "$HOST" --protocol=TCP -u memtest -pldap2retro
