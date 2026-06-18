#!/bin/sh
set -e

mkdir -p /app/data

if [ ! -f /app/data/gates.db ]; then
  echo "Initializing database..."
  cp /app/gates.db.template /app/data/gates.db
fi

exec node server.js
