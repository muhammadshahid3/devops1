#!/bin/sh
set -e
cd /var/www/html

# Write runtime settings from docker-compose environment into .env
set_env() {
  key="$1"; val="$2"
  [ -z "$val" ] && return 0
  if grep -q "^${key}=" .env; then
    sed -i "s|^${key}=.*|${key}=${val}|" .env
  else
    echo "${key}=${val}" >> .env
  fi
}

for key in APP_ENV APP_DEBUG APP_URL APP_TIMEZONE DB_CONNECTION DB_HOST DB_PORT DB_DATABASE DB_USERNAME DB_PASSWORD SESSION_DRIVER CACHE_STORE; do
  eval "val=\${$key:-}"
  set_env "$key" "$val"
done

echo "Waiting for database and running migrations..."
tries=0
until php artisan migrate --force; do
  tries=$((tries+1))
  if [ "$tries" -ge 30 ]; then
    echo "Database is not reachable. Giving up."
    exit 1
  fi
  echo "Database not ready yet (attempt $tries). Retrying in 3s..."
  sleep 3
done

if [ "${SEED_DEMO_DATA:-true}" = "true" ]; then
  echo "Seeding demo doctors, slots and a demo patient..."
  php artisan db:seed --force
fi

echo "Backend running on http://localhost:8000"
exec php artisan serve --host=0.0.0.0 --port=8000 --no-reload
