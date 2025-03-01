# OTP System Deployment Guide

This guide explains how to deploy the OTP Authentication System on a Hetzner server.

## Quick Start

1. Upload this zip file to your Hetzner server
2. Extract the files:
   ```bash
   unzip otp-system.zip -d /opt/otp-system
   cd /opt/otp-system
   ```
3. Run the installation script:
   ```bash
   chmod +x deploy/install.sh
   ./deploy/install.sh
   ```
4. Configure environment variables:
   ```bash
   cp deploy/.env.example .env
   nano .env
   ```
5. Set up SSL certificates:
   ```bash
   chmod +x deploy/setup-ssl.sh
   ./deploy/setup-ssl.sh your-domain.com your-email@example.com
   ```
6. Start the services:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

## Directory Structure

```
/opt/otp-system/
├── src/                  # Source code
├── deploy/               # Deployment scripts and configs
├── data/                 # Data directories
│   ├── nginx/           # Nginx configuration
│   ├── certbot/         # SSL certificates
│   └── backups/         # Backup files
├── docker-compose.yml    # Development compose file
├── docker-compose.prod.yml # Production compose file
├── Dockerfile           # API Dockerfile
├── Dockerfile.worker    # Worker Dockerfile
└── .env                 # Environment variables
```

## Deployment Scripts

- `install.sh`: Installs system dependencies
- `setup-ssl.sh`: Sets up SSL certificates
- `backup.sh`: Creates system backups
- `restore.sh`: Restores from backup
- `monitoring.sh`: Checks system health

## Monitoring

Run the monitoring script:
```bash
./deploy/monitoring.sh
```

## Backup and Restore

Create backup:
```bash
./deploy/backup.sh
```

Restore from backup:
```bash
./deploy/restore.sh YYYYMMDD_HHMMSS
```

## Security Notes

1. Update the JWT_SECRET in .env
2. Keep your API keys secure
3. Regularly update system packages
4. Monitor logs for suspicious activity
5. Maintain regular backups

## Support

For support, please contact our team or open an issue in the repository.