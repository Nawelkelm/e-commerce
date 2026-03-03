#!/bin/sh
# wait-for-postgres.sh
# Espera a que la base de datos PostgreSQL esté lista antes de iniciar el backend

set -e

host="$DB_HOST"
port="${DB_PORT:-5432}"

echo "Esperando conexión con PostgreSQL ($host:$port)..."

# Esperar a que PostgreSQL esté disponible usando pg_isready
until pg_isready -h "$host" -p "$port"; do
  echo "Esperando a que PostgreSQL ($host:$port) esté disponible..."
  sleep 2
done

echo "PostgreSQL está disponible. Iniciando el backend..."
exec node src/index.js
