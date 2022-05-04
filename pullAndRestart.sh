#!/bin/bash
git pull && \
docker-compose up -d --force-recreate --build $1 && \
printf "Successfully updated server!\n"