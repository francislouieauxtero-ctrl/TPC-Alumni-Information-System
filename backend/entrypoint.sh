#!/bin/sh
set -e

# Default PORT to 80 if not set by Railway
export PORT=${PORT:-80}

echo "==> Starting Laravel backend on port ${PORT}..."

# Substitute PORT into Nginx config
sed -i "s/\${PORT}/${PORT}/g" /etc/nginx/conf.d/default.conf

# Ensure required storage and cache directories exist
mkdir -p /var/www/backend/storage/app/public/avatars \
         /var/www/backend/storage/app/public/events \
         /var/www/backend/storage/app/public/announcements \
         /var/www/backend/storage/framework/sessions \
         /var/www/backend/storage/framework/views \
         /var/www/backend/storage/framework/cache \
         /var/www/backend/storage/logs \
         /var/www/backend/bootstrap/cache

# Set directory permissions
chown -R www-data:www-data /var/www/backend/storage /var/www/backend/bootstrap/cache
chmod -R 775 /var/www/backend/storage /var/www/backend/bootstrap/cache

# Create storage symlink
php artisan storage:link --force || true

# Clear cached config & routes before migration
php artisan config:clear || true
php artisan route:clear || true
php artisan view:clear || true

# Check if migrations should run (defaults to true if DB_HOST is set, can be disabled with RUN_MIGRATIONS=false)
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

echo "==> Starting PHP-FPM..."
php-fpm -D

echo "==> Starting Nginx..."
exec nginx -g "daemon off;"
