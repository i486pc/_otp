# Guia de Implantação em Produção

Este documento fornece instruções detalhadas para implantar o sistema de autenticação OTP em um ambiente de produção, garantindo segurança, escalabilidade e confiabilidade.

## Índice
1. [Requisitos de Infraestrutura](#requisitos-de-infraestrutura)
2. [Configuração do Ambiente](#configuração-do-ambiente)
3. [Implantação do Backend](#implantação-do-backend)
4. [Implantação do Frontend](#implantação-do-frontend)
5. [Configuração do n8n](#configuração-do-n8n)
6. [Integração com WhatsApp Business API](#integração-com-whatsapp-business-api)
7. [Monitoramento e Logging](#monitoramento-e-logging)
8. [Backup e Recuperação](#backup-e-recuperação)
9. [Checklist de Implantação](#checklist-de-implantação)

## Requisitos de Infraestrutura

### Servidores Recomendados
- **Backend API**: 
  - 2 vCPUs, 4GB RAM
  - 20GB SSD
  - Sistema operacional: Ubuntu 20.04 LTS ou superior

- **Banco de Dados**:
  - 2 vCPUs, 8GB RAM
  - 50GB SSD
  - Sistema operacional: Ubuntu 20.04 LTS ou superior

- **n8n Workflow**:
  - 2 vCPUs, 4GB RAM
  - 20GB SSD
  - Sistema operacional: Ubuntu 20.04 LTS ou superior

### Serviços de Nuvem Alternativos
- **Backend API**: 
  - AWS: t3.medium ou equivalente
  - Google Cloud: e2-medium ou equivalente
  - Azure: Standard_B2ms ou equivalente

- **Banco de Dados**:
  - AWS RDS: db.t3.medium (PostgreSQL)
  - Google Cloud SQL: db-n1-standard-1 (PostgreSQL)
  - Azure Database for PostgreSQL: General Purpose, 2 vCores

- **n8n Workflow**:
  - Opção 1: Servidor dedicado (mesmas especificações do Backend)
  - Opção 2: n8n.cloud (serviço gerenciado)

### Requisitos de Rede
- Balanceador de carga para distribuição de tráfego
- Firewall configurado para permitir apenas portas necessárias
- Certificados SSL/TLS para todos os domínios
- DNS configurado para todos os serviços

## Configuração do Ambiente

### Variáveis de Ambiente

#### Backend API
```
# Configurações do Servidor
PORT=3000
NODE_ENV=production

# Segurança
JWT_SECRET=<segredo-jwt-forte-e-único>
JWT_EXPIRATION=7d
CORS_ORIGIN=https://seu-dominio.com

# Banco de Dados
DB_HOST=<host-do-banco>
DB_PORT=5432
DB_NAME=otp_auth
DB_USER=<usuario-do-banco>
DB_PASSWORD=<senha-do-banco>

# URLs
BASE_URL=https://api.seu-dominio.com
FRONTEND_URL=https://seu-dominio.com

# WhatsApp
WHATSAPP_API_URL=<url-da-api-whatsapp>
WHATSAPP_API_KEY=<chave-da-api-whatsapp>

# Email
SMTP_HOST=<host-smtp>
SMTP_PORT=587
SMTP_USER=<usuario-smtp>
SMTP_PASS=<senha-smtp>
EMAIL_FROM=noreply@seu-dominio.com
```

#### n8n
```
# Configurações Gerais
N8N_HOST=localhost
N8N_PORT=5678
N8N_PROTOCOL=https
N8N_PATH=/
N8N_USER_FOLDER=/home/n8n/.n8n

# Segurança
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=<usuario-admin>
N8N_BASIC_AUTH_PASSWORD=<senha-admin>
N8N_JWT_SECRET=<segredo-jwt-forte-e-único>

# Banco de Dados
DB_TYPE=postgresdb
DB_POSTGRESDB_HOST=<host-do-banco>
DB_POSTGRESDB_PORT=5432
DB_POSTGRESDB_DATABASE=n8n
DB_POSTGRESDB_USER=<usuario-do-banco>
DB_POSTGRESDB_PASSWORD=<senha-do-banco>

# Webhook
N8N_WEBHOOK_URL=https://n8n.seu-dominio.com/

# API OTP
OTP_API_URL=https://api.seu-dominio.com
```

### Configuração de Banco de Dados

#### Criação do Banco de Dados PostgreSQL
```sql
-- Criar banco de dados
CREATE DATABASE otp_auth;

-- Criar usuário com privilégios limitados
CREATE USER otp_user WITH ENCRYPTED PASSWORD 'senha-segura';
GRANT CONNECT ON DATABASE otp_auth TO otp_user;

-- Conectar ao banco de dados
\c otp_auth

-- Criar tabelas
CREATE TABLE users (
  id UUID PRIMARY KEY,
  phone_number VARCHAR(20) NOT NULL,
  email VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE verification_status (
  user_id UUID REFERENCES users(id),
  whatsapp_verified BOOLEAN DEFAULT FALSE,
  email_verified BOOLEAN DEFAULT FALSE,
  last_verified_at TIMESTAMP WITH TIME ZONE,
  PRIMARY KEY (user_id)
);

CREATE TABLE otp_requests (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  channel VARCHAR(10) NOT NULL,
  otp_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  attempts INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conceder privilégios
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO otp_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO otp_user;

-- Criar índices
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone_number);
CREATE INDEX idx_otp_user_id ON otp_requests(user_id);
CREATE INDEX idx_otp_expires ON otp_requests(expires_at);
```

#### Configuração de Backup
```bash
#!/bin/bash
# backup-database.sh

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/path/to/backups"
DB_NAME="otp_auth"
DB_USER="postgres"

# Criar diretório de backup se não existir
mkdir -p $BACKUP_DIR

# Backup do banco de dados
pg_dump -U $DB_USER -d $DB_NAME -F c -f $BACKUP_DIR/$DB_NAME\_$TIMESTAMP.backup

# Manter apenas os últimos 7 backups diários
find $BACKUP_DIR -name "$DB_NAME\_*.backup" -type f -mtime +7 -delete
```

## Implantação do Backend

### Preparação do Servidor

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar PM2 para gerenciamento de processos
sudo npm install -g pm2

# Instalar Nginx
sudo apt install -y nginx

# Configurar firewall
sudo ufw allow 'Nginx Full'
sudo ufw allow ssh ```bash
sudo ufw enable
```

### Implantação da API

```bash
# Criar diretório para a aplicação
sudo mkdir -p /var/www/otp-api
sudo chown -R $USER:$USER /var/www/otp-api

# Clonar repositório (ou transferir arquivos)
git clone https://github.com/seu-usuario/otp-api.git /var/www/otp-api

# Instalar dependências
cd /var/www/otp-api
npm ci --production

# Configurar variáveis de ambiente
cp .env.example .env
nano .env  # Editar com as configurações de produção

# Iniciar aplicação com PM2
pm2 start src/server/api.js --name otp-api
pm2 save
pm2 startup
```

### Configuração do Nginx

```nginx
# /etc/nginx/sites-available/otp-api.conf

server {
    listen 80;
    server_name api.seu-dominio.com;

    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl;
    server_name api.seu-dominio.com;

    ssl_certificate /etc/letsencrypt/live/api.seu-dominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.seu-dominio.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:10m;
    ssl_stapling on;
    ssl_stapling_verify on;
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Limitar tamanho de upload
    client_max_body_size 5M;

    # Configurar rate limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
    limit_req zone=api_limit burst=20 nodelay;
}
```

```bash
# Ativar configuração do Nginx
sudo ln -s /etc/nginx/sites-available/otp-api.conf /etc/nginx/sites-enabled/
sudo nginx -t  # Testar configuração
sudo systemctl restart nginx
```

### Certificados SSL com Let's Encrypt

```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obter certificado
sudo certbot --nginx -d api.seu-dominio.com

# Configurar renovação automática
sudo systemctl status certbot.timer
```

## Implantação do Frontend

### Preparação para Build

```bash
# Configurar variáveis de ambiente para build
cat > .env.production << EOL
VITE_API_URL=https://api.seu-dominio.com
EOL

# Construir aplicação
npm run build
```

### Configuração do Nginx para Frontend

```nginx
# /etc/nginx/sites-available/otp-frontend.conf

server {
    listen 80;
    server_name seu-dominio.com www.seu-dominio.com;

    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl;
    server_name seu-dominio.com www.seu-dominio.com;

    ssl_certificate /etc/letsencrypt/live/seu-dominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/seu-dominio.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:10m;
    ssl_stapling on;
    ssl_stapling_verify on;
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Content-Security-Policy "default-src 'self'; script-src 'self'; img-src 'self' data: https://api.seu-dominio.com; style-src 'self' 'unsafe-inline'; font-src 'self'; connect-src 'self' https://api.seu-dominio.com; frame-src 'none'; object-src 'none';";

    root /var/www/otp-frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Configurar cache para arquivos estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }

    # Desabilitar acesso a arquivos ocultos
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
}
```

```bash
# Ativar configuração do Nginx
sudo ln -s /etc/nginx/sites-available/otp-frontend.conf /etc/nginx/sites-enabled/
sudo nginx -t  # Testar configuração
sudo systemctl restart nginx

# Obter certificado
sudo certbot --nginx -d seu-dominio.com -d www.seu-dominio.com
```

## Configuração do n8n

### Instalação do n8n

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar n8n globalmente
sudo npm install -g n8n

# Criar usuário dedicado para n8n
sudo useradd -m -s /bin/bash n8n

# Criar diretório para dados
sudo mkdir -p /var/lib/n8n
sudo chown -R n8n:n8n /var/lib/n8n

# Criar arquivo de configuração
sudo mkdir -p /etc/n8n
sudo nano /etc/n8n/.env  # Adicionar variáveis de ambiente
```

### Configuração do Serviço Systemd

```ini
# /etc/systemd/system/n8n.service

[Unit]
Description=n8n workflow automation
After=network.target postgresql.service

[Service]
Type=simple
User=n8n
WorkingDirectory=/var/lib/n8n
EnvironmentFile=/etc/n8n/.env
ExecStart=/usr/bin/n8n start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
# Ativar e iniciar serviço
sudo systemctl daemon-reload
sudo systemctl enable n8n
sudo systemctl start n8n
sudo systemctl status n8n
```

### Configuração do Nginx para n8n

```nginx
# /etc/nginx/sites-available/n8n.conf

server {
    listen 80;
    server_name n8n.seu-dominio.com;

    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl;
    server_name n8n.seu-dominio.com;

    ssl_certificate /etc/letsencrypt/live/n8n.seu-dominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/n8n.seu-dominio.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:10m;
    ssl_stapling on;
    ssl_stapling_verify on;
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";

    location / {
        proxy_pass http://localhost:5678;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Aumentar timeout para execuções longas
    proxy_connect_timeout 600;
    proxy_send_timeout 600;
    proxy_read_timeout 600;
    send_timeout 600;
}
```

```bash
# Ativar configuração do Nginx
sudo ln -s /etc/nginx/sites-available/n8n.conf /etc/nginx/sites-enabled/
sudo nginx -t  # Testar configuração
sudo systemctl restart nginx

# Obter certificado
sudo certbot --nginx -d n8n.seu-dominio.com
```

### Importação do Workflow

1. Acesse a interface do n8n em `https://n8n.seu-dominio.com`
2. Faça login com as credenciais configuradas
3. Vá para "Workflows" > "Import from File"
4. Selecione o arquivo `n8n-workflow-example.json`
5. Ajuste as credenciais e variáveis conforme necessário
6. Ative o workflow

## Integração com WhatsApp Business API

### Opções de Integração

#### Opção 1: API Oficial do WhatsApp Business
1. Crie uma conta no [Facebook Business Manager](https://business.facebook.com/)
2. Solicite acesso à API do WhatsApp Business
3. Configure um número de telefone para uso com a API
4. Obtenha as credenciais de API necessárias

#### Opção 2: Provedores de Terceiros
Provedores que oferecem integração simplificada:
- [Twilio](https://www.twilio.com/whatsapp)
- [MessageBird](https://messagebird.com/products/whatsapp)
- [Vonage](https://www.vonage.com/communications-apis/messages/)

### Configuração no n8n

1. Crie uma nova credencial no n8n para a API do WhatsApp
2. Configure os nós HTTP Request no workflow para usar a API correta
3. Atualize os templates de mensagem conforme necessário
4. Teste o envio de mensagens

### Exemplo de Configuração para Twilio

```javascript
// Configuração do nó HTTP Request para Twilio
{
  "url": "https://api.twilio.com/2010-04-01/Accounts/{{$credentials.twilio.sid}}/Messages.json",
  "method": "POST",
  "authentication": "basicAuth",
  "username": "{{$credentials.twilio.sid}}",
  "password": "{{$credentials.twilio.authToken}}",
  "headers": {
    "Content-Type": "application/x-www-form-urlencoded"
  },
  "body": {
    "To": "whatsapp:{{$json[\"phoneNumber\"]}}",
    "From": "whatsapp:+14155238886",
    "Body": "Seu código de verificação é: {{$json[\"otp\"]}}. Este código expirará em 10 minutos."
  }
}
```

## Monitoramento e Logging

### Configuração do Logging

#### Backend API

```javascript
// Configuração do Winston para logging
import winston from 'winston';
import 'winston-daily-rotate-file';

const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json()
);

const transport = new winston.transports.DailyRotateFile({
  filename: 'logs/otp-api-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d'
});

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  transports: [
    transport,
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

export default logger;
```

#### n8n

Configurar variáveis de ambiente para logging:

```
N8N_LOG_LEVEL=info
N8N_LOG_OUTPUT=file
N8N_LOG_FILE_LOCATION=/var/log/n8n/n8n.log
```

### Monitoramento com Prometheus e Grafana

#### Instalação do Prometheus

```bash
# Criar usuário para Prometheus
sudo useradd --no-create-home --shell /bin/false prometheus

# Criar diretórios
sudo mkdir -p /etc/prometheus /var/lib/prometheus

# Baixar Prometheus
wget https://github.com/prometheus/prometheus/releases/download/v2.37.0/prometheus-2.37.0.linux-amd64.tar.gz
tar -xvf prometheus-2.37.0.linux-amd64.tar.gz

# Copiar binários
sudo cp prometheus-2.37.0.linux-amd64/prometheus /usr/local/bin/
sudo cp prometheus-2.37.0.linux-amd64/promtool /usr/local/bin/

# Copiar arquivos de configuração
sudo cp -r prometheus-2.37.0.linux-amd64/consoles /etc/prometheus
sudo cp -r prometheus-2.37.0.linux-amd64/console_libraries /etc/prometheus

# Configurar permissões
sudo chown -R prometheus:prometheus /etc/prometheus /var/lib/prometheus
sudo chown prometheus:prometheus /usr/local/bin/prometheus /usr/local/bin/promtool

# Limpar arquivos temporários
rm -rf prometheus-2.37.0.linux-amd64 prometheus-2.37.0.linux-amd64.tar.gz
```

#### Configuração do Prometheus

```yaml
# /etc/prometheus/prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'prometheus'
    scrape_interval: 5s
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'node_exporter'
    scrape_interval: 5s
    static_configs:
      - targets: ['localhost:9100']
      
  - job_name: 'api_metrics'
    scrape_interval: 5s
    static_configs:
      - targets: ['api-server:3000']
```

#### Serviço Systemd para Prometheus

```ini
# /etc/systemd/system/prometheus.service
[Unit]
Description=Prometheus
Wants=network-online.target
After=network-online.target

[Service]
User=prometheus
Group=prometheus
Type=simple
ExecStart=/usr/local/bin/prometheus \
    --config.file /etc/prometheus/prometheus.yml \
    --storage.tsdb.path /var/lib/prometheus/ \
    --web.console.templates=/etc/prometheus/consoles \
    --web.console.libraries=/etc/prometheus/console_libraries

[Install]
WantedBy=multi-user.target
```

#### Instalação do Grafana

```bash
# Adicionar repositório Grafana
sudo apt-get install -y apt-transport-https software-properties-common
sudo add-apt-repository "deb https://packages.grafana.com/oss/deb stable main"
wget -q -O - https://packages.grafana.com/gpg.key | sudo apt-key add -
sudo apt-get update

# Instalar Grafana
sudo apt-get install -y grafana

# Iniciar e habilitar serviço
sudo systemctl enable grafana-server
sudo systemctl start grafana-server
```

## Backup e Recuperação

### Backup Automatizado

#### Script de Backup Completo

```bash
#!/bin/bash
# backup-system.sh

# Configurações
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/path/to/backups"
DB_NAME="otp_auth"
DB_USER="postgres"
N8N_DATA_DIR="/var/lib/n8n"
API_DIR="/var/www/otp-api"
FRONTEND_DIR="/var/www/otp-frontend"
RETENTION_DAYS=7

# Criar diretório de backup
mkdir -p $BACKUP_DIR/$TIMESTAMP

# Backup do banco de dados
echo "Backing up database..."
pg_dump -U $DB_USER -d $DB_NAME -F c -f $BACKUP_DIR/$TIMESTAMP/$DB_NAME.backup

# Backup das configurações do n8n
echo "Backing up n8n configuration..."
tar -czf $BACKUP_DIR/$TIMESTAMP/n8n-data.tar.gz -C $N8N_DATA_DIR .

# Backup da API
echo "Backing up API..."
tar -czf $BACKUP_DIR/$TIMESTAMP/api.tar.gz -C $API_DIR --exclude="node_modules" .

# Backup do Frontend
echo "Backing up Frontend..."
tar -czf $BACKUP_DIR/$TIMESTAMP/frontend.tar.gz -C $FRONTEND_DIR .

# Backup das configurações do Nginx
echo "Backing up Nginx configuration..."
tar -czf $BACKUP_DIR/$TIMESTAMP/nginx-conf.tar.gz -C /etc/nginx .

# Backup das configurações do Let's Encrypt
echo "Backing up SSL certificates..."
tar -czf $BACKUP_DIR/$TIMESTAMP/letsencrypt.tar.gz -C /etc/letsencrypt .

# Limpar backups antigos
echo "Cleaning up old backups..."
find $BACKUP_DIR -type d -mtime +$RETENTION_DAYS -exec rm -rf {} \;

echo "Backup completed: $BACKUP_DIR/$TIMESTAMP"
```

#### Agendamento com Cron

```bash
# Editar crontab
crontab -e

# Adicionar linha para executar backup diariamente às 2h da manhã
0 2 * * * /path/to/backup-system.sh >> /var/log/backup.log 2>&1
```

### Procedimento de Recuperação

#### Restauração do Banco de Dados

```bash
# Restaurar banco de dados
pg_restore -U postgres -d otp_auth -c $BACKUP_DIR/$TIMESTAMP/$DB_NAME.backup
```

#### Restauração da API

```bash
# Restaurar arquivos da API
rm -rf /var/www/otp-api/*
tar -xzf $BACKUP_DIR/$TIMESTAMP/api.tar.gz -C /var/www/otp-api

# Reinstalar dependências
cd /var/www/otp-api
npm ci --production

# Reiniciar serviço
pm2 restart otp-api
```

#### Restauração do n8n

```bash
# Parar serviço n8n
sudo systemctl stop n8n

# Restaurar dados
rm -rf /var/lib/n8n/*
tar -xzf $BACKUP_DIR/$TIMESTAMP/n8n-data.tar.gz -C /var/lib/n8n

# Ajustar permissões
sudo chown -R n8n:n8n /var/lib/n8n

# Reiniciar serviço
sudo systemctl start n8n
```

## Checklist de Implantação

### Pré-implantação
- [ ] Revisar requisitos de infraestrutura
- [ ] Configurar servidores e rede
- [ ] Configurar banco de dados
- [ ] Preparar variáveis de ambiente
- [ ] Configurar domínios DNS
- [ ] Revisar código para problemas de segurança

### Implantação do Backend
- [ ] Implantar API
- [ ] Configurar Nginx
- [ ] Obter certificados SSL
- [ ] Configurar PM2
- [ ] Testar endpoints da API

### Implantação do Frontend
- [ ] Construir aplicação
- [ ] Implantar arquivos estáticos
- [ ] Configurar Nginx
- [ ] Obter certificados SSL
- [ ] Testar interface do usuário

### Configuração do n8n
- [ ] Instalar n8n
- [ ] Configurar serviço
- [ ] Importar workflow
- [ ] Configurar credenciais
- [ ] Testar workflow

### Integração com WhatsApp
- [ ] Configurar API do WhatsApp
- [ ] Testar envio de mensagens
- [ ] Configurar templates de mensagem
- [ ] Verificar conformidade com políticas do WhatsApp

### Monitoramento e Segurança
- [ ] Configurar logging
- [ ] Configurar monitoramento
- [ ] Configurar backups
- [ ] Testar procedimento de recuperação
- [ ] Configurar firewall
- [ ] Implementar rate limiting

### Testes Finais
- [ ] Testar fluxo completo de autenticação
- [ ] Verificar desempenho sob carga
- [ ] Verificar segurança
- [ ] Documentar procedimentos operacionais
- [ ] Treinar equipe de suporte