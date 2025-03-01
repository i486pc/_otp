#!/bin/bash

# Update system
apt update && apt upgrade -y

# Install required packages
apt install -y \
  apt-transport-https \
  ca-certificates \
  curl \
  gnupg \
  lsb-release \
  git \
  nginx \
  certbot \
  python3-certbot-nginx

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/download/v2.24.5/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Create project directory
mkdir -p /opt/otp-system
cd /opt/otp-system

# Create data directory
mkdir -p data/nginx/conf.d
mkdir -p data/certbot/conf
mkdir -p data/certbot/www

# Copy configuration files
cp nginx.conf data/nginx/conf.d/default.conf