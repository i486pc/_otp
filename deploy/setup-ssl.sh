#!/bin/bash

# Function to create/renew SSL certificate
setup_ssl() {
    local domain=$1
    local email=$2

    # Stop nginx
    docker-compose -f docker-compose.prod.yml stop nginx

    # Request certificate
    docker-compose -f docker-compose.prod.yml run --rm certbot certonly \
        --webroot \
        --webroot-path=/var/www/certbot \
        --email $email \
        --agree-tos \
        --no-eff-email \
        -d $domain

    # Start nginx
    docker-compose -f docker-compose.prod.yml up -d nginx
}

# Check if domain and email are provided
if [ "$#" -ne 2 ]; then
    echo "Usage: $0 <domain> <email>"
    exit 1
fi

DOMAIN=$1
EMAIL=$2

# Replace domain in nginx config
sed -i "s/your-domain.com/$DOMAIN/g" data/nginx/conf.d/default.conf

# Setup SSL
setup_ssl $DOMAIN $EMAIL