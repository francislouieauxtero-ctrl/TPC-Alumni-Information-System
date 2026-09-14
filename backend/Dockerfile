FROM php:8.3-fpm

# Install system dependencies, Nginx, CA certificates, and gettext-base (for envsubst)
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    curl \
    unzip \
    zip \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    libzip-dev \
    libicu-dev \
    default-mysql-client \
    ca-certificates \
    nginx \
    gettext-base \
    procps \
    && docker-php-ext-install -j$(nproc) \
    pdo \
    pdo_mysql \
    mbstring \
    exif \
    pcntl \
    bcmath \
    gd \
    zip \
    intl \
    opcache \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Download Let's Encrypt ISRG Root X1 CA certificate for TiDB Cloud Serverless TLS
RUN curl -fsSL https://letsencrypt.org/certs/isrgrootx1.pem -o /etc/ssl/certs/tidb-ca.pem \
    && chmod 644 /etc/ssl/certs/tidb-ca.pem

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/backend

# Copy composer manifest first to cache dependency installation
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist

# Copy application source
COPY . .

# Generate optimized autoload files
RUN composer dump-autoload --optimize --no-dev

# Prepare Nginx configuration template directory and clean default sites
RUN mkdir -p /etc/nginx/templates /etc/nginx/conf.d \
    && rm -rf /etc/nginx/sites-enabled /etc/nginx/sites-available /etc/nginx/conf.d/* 2>/dev/null || true
COPY nginx.conf.template /etc/nginx/templates/nginx.conf.template

# Copy and set entrypoint
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Expose Nginx HTTP port for Railway port detection
EXPOSE 8080

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
