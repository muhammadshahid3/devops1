FROM php:8.3-cli

# System packages + PHP extensions Laravel needs
RUN apt-get update && apt-get install -y --no-install-recommends \
        git unzip libzip-dev default-mysql-client \
    && docker-php-ext-install pdo_mysql bcmath zip pcntl \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# 1) Fresh Laravel 12 skeleton  2) Sanctum (API tokens)
RUN composer create-project laravel/laravel:^12.0 . --prefer-dist --no-interaction \
    && composer require laravel/sanctum --no-interaction \
    && php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider" --no-interaction

# 3) Our application code (models, controllers, routes, migrations, seeders)
COPY src/ /var/www/html/

COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN sed -i 's/\r$//' /usr/local/bin/entrypoint.sh && chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 8000
ENTRYPOINT ["entrypoint.sh"]
