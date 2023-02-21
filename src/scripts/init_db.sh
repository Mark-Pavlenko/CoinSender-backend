#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "postgres" <<-EOSQL
  CREATE DATABASE $POSTGRES_DATABASE;
  ALTER USER $POSTGRES_USER WITH ENCRYPTED PASSWORD '$POSTGRES_PASSWORD';
  GRANT ALL PRIVILEGES ON DATABASE $POSTGRES_DATABASE TO $POSTGRES_USER;
  ALTER SYSTEM SET max_connections TO "250";
  ALTER SYSTEM SET shared_buffers TO "256MB";
  ALTER ROLE $POSTGRES_USER SET client_encoding TO 'utf8';
  ALTER ROLE $POSTGRES_USER SET timezone TO 'UTC';
EOSQL