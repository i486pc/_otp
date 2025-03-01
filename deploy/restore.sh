#!/bin/bash

# Check if backup date is provided
if [ "$#" -ne 1 ]; then
    echo "Usage: $0 <backup_date>"
    echo "Example: $0 20250228_123456"
    exit 1
fi

BACKUP_DATE=$1
BACKUP_DIR="/opt/otp-system/backups"

# Restore environment variables
if [ -f "$BACKUP_DIR/env_$BACKUP_DATE.bak" ]; then
    cp "$BACKUP_DIR/env_$BACKUP_DATE.bak" .env
    echo "Environment variables restored"
fi

# Restore Nginx configuration
if [ -f "$BACKUP_DIR/nginx_$BACKUP_DATE.tar.gz" ]; then
    tar -xzf "$BACKUP_DIR/nginx_$BACKUP_DATE.tar.gz"
    echo "Nginx configuration restored"
fi

# Restore SSL certificates
if [ -f "$BACKUP_DIR/ssl_$BACKUP_DATE.tar.gz" ]; then
    tar -xzf "$BACKUP_DIR/ssl_$BACKUP_DATE.tar.gz"
    echo "SSL certificates restored"
fi

# Restart services
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d

echo "Restore completed"