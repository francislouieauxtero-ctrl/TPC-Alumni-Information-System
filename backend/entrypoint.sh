#!/bin/sh
set -e

# Log the exact raw value injected by Railway before applying any default
echo "================================================================================"
echo "==> DEBUG: Railway injected PORT=[$PORT]"
echo "================================================================================"

# Apply fallback only if PORT is completely unset or empty
export PORT="${PORT:-8080}"

echo "==> Starting Laravel Backend Service on port: ${PORT}"

# Wipe any default Debian site configs or conflicting conf.d files
rm -rf /etc/nginx/sites-enabled /etc/nginx/sites-available /etc/nginx/conf.d/* 2>/dev/null || true
mkdir -p /etc/nginx/conf.d

# Generate Nginx configuration dynamically using envsubst
if [ -f /etc/nginx/templates/nginx.conf.template ]; then
    echo "==> Rendering Nginx configuration from template for port ${PORT}..."
    envsubst '${PORT}' < /etc/nginx/templates/nginx.conf.template > /etc/nginx/conf.d/default.conf
elif [ -f /var/www/backend/nginx.conf.template ]; then
    echo "==> Rendering Nginx configuration from backend template for port ${PORT}..."
    envsubst '${PORT}' < /var/www/backend/nginx.conf.template > /etc/nginx/conf.d/default.conf
else
    echo "==> Updating /etc/nginx/conf.d/default.conf for port ${PORT}..."
    sed -i "s/\${PORT}/${PORT}/g" /etc/nginx/conf.d/default.conf
fi

echo "==> Rendered listen directives in /etc/nginx/conf.d/default.conf:"
grep -i "listen" /etc/nginx/conf.d/default.conf || true

# Validate Nginx configuration syntax
echo "==> Validating Nginx configuration syntax..."
nginx -t

# Ensure required storage and cache directories exist
mkdir -p /var/www/backend/storage/app/public/avatars \
         /var/www/backend/storage/app/public/events \
         /var/www/backend/storage/app/public/announcements \
         /var/www/backend/storage/framework/sessions \
         /var/www/backend/storage/framework/views \
         /var/www/backend/storage/framework/cache \
         /var/www/backend/storage/logs \
         /var/www/backend/bootstrap/cache

# Set directory permissions for web user
chown -R www-data:www-data /var/www/backend
chmod -R 775 /var/www/backend/storage /var/www/backend/bootstrap/cache

# Create storage symlink
php artisan storage:link --force || true

# Clear cached config & routes before boot
php artisan config:clear || true
php artisan route:clear || true
php artisan view:clear || true

# Verify TiDB TLS/SSL CA certificate if MYSQL_ATTR_SSL_CA is configured
if [ -n "$MYSQL_ATTR_SSL_CA" ]; then
    if [ ! -f "$MYSQL_ATTR_SSL_CA" ]; then
        echo "================================================================================" >&2
        echo "ERROR: TiDB Cloud SSL CA certificate not found at '$MYSQL_ATTR_SSL_CA'!" >&2
        echo "Please ensure the certificate is bundled at /etc/ssl/certs/tidb-ca.pem" >&2
        echo "or set MYSQL_ATTR_SSL_CA to a valid certificate path." >&2
        echo "================================================================================" >&2
        exit 1
    fi
    echo "==> Verified TiDB TLS/SSL CA certificate at: $MYSQL_ATTR_SSL_CA"
fi

# Check if migrations should run (defaults to true if DB_HOST is set)
RUN_MIGRATIONS=${RUN_MIGRATIONS:-true}
if [ "$RUN_MIGRATIONS" = "true" ] && [ -n "$DB_HOST" ] && [ "$DB_HOST" != "127.0.0.1" ]; then
    echo "==> Running database migrations on TiDB Cloud..."
    php artisan migrate --force --no-interaction || echo "Notice: Migration encountered an issue or database is already up to date."
    
    # Run AdminSeeder only if explicitly requested or if SUPER_ADMIN_EMAIL is set
    RUN_SEEDER=${RUN_SEEDER:-true}
    if [ "$RUN_SEEDER" = "true" ] && [ -n "$SUPER_ADMIN_EMAIL" -o -n "$ADMIN_EMAIL" ]; then
        echo "==> Running AdminSeeder with environment credentials..."
        php artisan db:seed --class=AdminSeeder --force --no-interaction || true
    fi
fi

# Optimize Laravel cache in production
if [ "$APP_ENV" = "production" ]; then
    echo "==> Caching Laravel configuration..."
    php artisan config:cache || true
    php artisan route:cache || true
    php artisan view:cache || true
fi

# Start PHP-FPM FastCGI daemon
echo "==> Starting PHP-FPM daemon (listening on 127.0.0.1:9000)..."
php-fpm -D

# Start Nginx in foreground to serve requests on $PORT
echo "==> Launching Nginx on dynamic port ${PORT}..."
exec nginx -g "daemon off;"
