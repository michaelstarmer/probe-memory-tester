#!/bin/bash
HOST="localhost"
if [ "$1" == "prod" ] ; then
  printf "Using prod!\n"
  HOST="10.0.28.187"
fi

mysql -h "$HOST" --protocol=TCP -u memtest -pldap2retro
