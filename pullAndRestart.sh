#!/bin/bash
git pull && \
docker-compose up -d --force-recreate --build && \
printf "Successfully updated server!\n"