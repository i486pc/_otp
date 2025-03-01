#!/bin/bash

# Configuration
BACKUP_DIR="/opt/otp-system/backups"
RETENTION_DAYS=7
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Backup environment variables
cp .env $BACKUP_DIR/env_$DATE.bak

# Backup Nginx configuration
tar -czf $BACKUP_DIR/nginx_$DATE.tar.gz data/nginx/

# Backup SSL certificates
tar -czf $BACKUP_DIR/ssl_$DATE.tar.gz data/certbot/

# Remove old backups
find $BACKUP_DIR -type f -mtime +$RETENTION_DAYS -delete

echo "Backup completed: $DATE"