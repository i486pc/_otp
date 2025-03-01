# Guia de Implementação da API de Autenticação OTP

Este documento detalha a implementação da API de autenticação OTP, incluindo a estrutura do código, endpoints, e considerações de segurança.

## Estrutura do Projeto

```
src/
├── server/
│   ├── api.js             # Servidor Express principal
│   ├── controllers/       # Controladores para cada endpoint
│   │   ├── otp.js         # Controlador para operações de OTP
│   │   └── webhook.js     # Controlador para webhooks do n8n
│   ├── middleware/        # Middleware Express
│   │   ├── auth.js        # Middleware de autenticação
│   │   ├── rateLimit.js   # Limitação de taxa de requisições
│   │   └── validation.js  # Validação de entrada
│   ├── services/          # Serviços de negócios
│   │   ├── otp.js         # Serviço de geração e verificação de OTP
│   │   └── user.js        # Serviço de gerenciamento de usuários
│   └── utils/             # Utilitários
│       ├── logger.js      # Utilitário de logging
│       └── security.js    # Funções de segurança
└── types/                 # Definições de tipos TypeScript
    └── index.ts           # Tipos compartilhados
```

## Implementação Detalhada

### 1. Servidor Principal (api.js)

```javascript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { authenticator } from 'otplib';
import jwt from 'jsonwebtoken';

// Importar middleware
import { rateLimiter } from './middleware/rateLimit.js';
import { validateInput } from './middleware/validation.js';
import { authMiddleware } from './middleware/auth.js';

// Importar controladores
import * as otpController from './controllers/otp.js';
import * as webhookController from './controllers/webhook.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware global
app.use(cors());
app.use(express.json());
app.use(rateLimiter);

// Rotas de OTP
app.post('/api/generate-otp', validateInput, otpController.generateOtp);
app.post('/api/verify-otp', validateInput, otpController.verifyOtp);

// Rotas de webhook
app.post('/api/webhook/n8n', webhookController.handleWebhook);
app.get('/api/webhook-url', webhookController.getWebhookUrl);

// Rota protegida de exemplo
app.get('/api/protected', authMiddleware, (req, res) => {
  res.json({ message: 'This is a protected route', user: req.user });
});

// Tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});

export default app;
```

### 2. Controlador de OTP (controllers/otp.js)

```javascript
import * as otpService from '../services/otp.js';
import * as userService from '../services/user.js';
import { logger } from '../utils/logger.js';

// Gerar OTP para um usuário
export const generateOtp = async (req, res) => {
  try {
    const { userId, channel } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    // Verificar se o usuário existe ou criar um novo
    let user = userService.getUser(userId);
    if (!user) {
      user = userService.createUser(userId);
    }
    
    // Gerar OTP
    const otpData = otpService.generateOtp(userId, channel);
    
    logger.info(`OTP generated for user ${userId} on channel ${channel}`);
    
    // Em produção, nunca retornar o OTP diretamente
    // Aqui apenas para fins de desenvolvimento
    res.json({ 
      message: `OTP generated for ${channel}`,
      otp: process.env.NODE_ENV === 'development' ? otpData.otp : undefined
    });
  } catch (error) {
    logger.error(`Error generating OTP: ${error.message}`);
    res.status(500).json({ error: 'Failed to generate OTP' });
  }
};

// Verificar OTP
export const verifyOtp = async (req, res) => {
  try {
    const { userId, otp, channel } = req.body;
    
    if (!userId || !otp) {
      return res.status(400).json({ error: 'User ID and OTP are required' });
    }
    
    // Verificar OTP
    const verificationResult = otpService.verifyOtp(userId, otp, channel);
    
    if (!verificationResult.success) {
      logger.warn(`Invalid OTP attempt for user ${userId} on channel ${channel}`);
      return res.status(401).json({ error: verificationResult.message });
    }
    
    // Atualizar status de verificação do usuário
    userService.updateVerificationStatus(userId, channel);
    
    // Verificar se todos os canais estão verificados
    const user = userService.getUser(userId);
    const fullyVerified = user.verified.whatsapp && user.verified.email;
    
    // Gerar token JWT se totalmente verificado
    let token = null;
    if (fullyVerified) {
      token = jwt.sign({ userId, verified: true }, process.env.JWT_SECRET, { expiresIn: '7d' });
      logger.info(`User ${userId} fully verified, token generated`);
    }
    
    res.json({ 
      success: true, 
      message: `${channel} verified successfully`,
      fullyVerified,
      token
    });
  } catch (error) {
    logger.error(`Error verifying OTP: ${error.message}`);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
};
```

### 3. Controlador de Webhook (controllers/webhook.js)

```javascript
import * as otpService from '../services/otp.js';
import * as userService from '../services/user.js';
import { logger } from '../utils/logger.js';

// Manipular webhook do n8n
export const handleWebhook = async (req, res) => {
  try {
    const { action, userId, channel, phoneNumber, email } = req.body;
    
    if (!action || !userId) {
      return res.status(400).json({ error: 'Action and userId are required' });
    }
    
    // Tratar diferentes ações
    switch (action) {
      case 'initiate_verification':
        // Criar ou obter usuário
        let user = userService.getUser(userId);
        if (!user) {
          user = userService.createUser(userId, { phoneNumber, email });
        }
        
        // Gerar OTP
        const otpData = otpService.generateOtp(userId, channel);
        
        logger.info(`Webhook: OTP generated for user ${userId} on channel ${channel}`);
        
        res.json({
          success: true,
          userId,
          channel,
          // Apenas para desenvolvimento
          otp: process.env.NODE_ENV === 'development' ? otpData.otp : undefined
        });
        break;
        
      case 'check_verification_status':
        const userStatus = userService.getUser(userId);
        if (!userStatus) {
          return res.status(404).json({ error: 'User not found' });
        }
        
        res.json({
          userId,
          verified: userStatus.verified
        });
        break;
        
      default:
        res.status(400).json({ error: 'Unknown action' });
    }
  } catch (error) {
    logger.error(`Webhook error: ${error.message}`);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};

// Obter URL do webhook
export const getWebhookUrl = (req, res) => {
  const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
  res.json({
    webhookUrl: `${baseUrl}/api/webhook/n8n`
  });
};
```

### 4. Serviço de OTP (services/otp.js)

```javascript
import { authenticator } from 'otplib';
import { logger } from '../utils/logger.js';

// Armazenamento em memória para OTPs (substituir por banco de dados em produção)
const otpStore = new Map();

// Gerar OTP para um usuário
export const generateOtp = (userId, channel) => {
  // Configurar o authenticator para gerar um código de 6 dígitos
  authenticator.options = { digits: 6 };
  
  // Gerar um segredo único para este OTP
  const secret = authenticator.generateSecret();
  
  // Gerar o OTP
  const otp = authenticator.generate(secret);
  
  // Armazenar OTP com expiração (10 minutos)
  const expiresAt = Date.now() + 10 * 60 * 1000;
  
  otpStore.set(userId, {
    otp,
    channel,
    expiresAt,
    attempts: 0
  });
  
  logger.debug(`Generated OTP for user ${userId} on channel ${channel}`);
  
  return {
    otp,
    expiresAt
  };
};

// Verificar OTP
export const verifyOtp = (userId, otp, channel) => {
  const otpData = otpStore.get(userId);
  
  // Verificar se existe um OTP para este usuário
  if (!otpData) {
    return {
      success: false,
      message: 'No OTP found for this user'
    };
  }
  
  // Verificar se o OTP é para o canal correto
  if (otpData.channel !== channel) {
    return {
      success: false,
      message: `This OTP is for ${otpData.channel}, not ${channel}`
    };
  }
  
  // Verificar se o OTP expirou
  if (Date.now() > otpData.expiresAt) {
    otpStore.delete(userId);
    return {
      success: false,
      message: 'OTP expired'
    };
  }
  
  // Incrementar contagem de tentativas
  otpData.attempts += 1;
  
  // Verificar número máximo de tentativas (3)
  if (otpData.attempts > 3) {
    otpStore.delete(userId);
    return {
      success: false,
      message: 'Maximum attempts exceeded'
    };
  }
  
  // Verificar se o OTP é válido
  const isValid = otpData.otp === otp;
  
  // Se válido, remover o OTP usado
  if (isValid) {
    otpStore.delete(userId);
    logger.debug(`OTP verified successfully for user ${userId} on channel ${channel}`);
  } else {
    logger.warn(`Invalid OTP attempt for user ${userId} on channel ${channel}`);
  }
  
  return {
    success: isValid,
    message: isValid ? 'OTP verified successfully' : 'Invalid OTP'
  };
};

// Limpar OTPs expirados (chamar periodicamente)
export const cleanupExpiredOtps = () => {
  const now = Date.now();
  let count = 0;
  
  for (const [userId, otpData] of otpStore.entries()) {
    if (now > otpData.expiresAt) {
      otpStore.delete(userId);
      count++;
    }
  }
  
  if (count > 0) {
    logger.debug(`Cleaned up ${count} expired OTPs`);
  }
  
  return count;
};
```

### 5. Serviço de Usuário (services/user.js)

```javascript
import { logger } from '../utils/logger.js';

// Armazenamento em memória para usuários (substituir por banco de dados em produção)
const userStore = new Map();

// Criar um novo usuário
export const createUser = (userId, data = {}) => {
  const { phoneNumber, email } = data;
  
  const user = {
    id: userId,
    phoneNumber,
    email,
    verified: {
      whatsapp: false,
      email: false
    },
    createdAt: new Date()
  };
  
  userStore.set(userId, user);
  logger.debug(`Created new user with ID ${userId}`);
  
  return user;
};

// Obter um usuário pelo ID
export const getUser = (userId) => {
  return userStore.get(userId);
};

// Atualizar status de verificação
export const updateVerificationStatus = (userId, channel) => {
  const user = userStore.get(userId);
  
  if (!user) {
    throw new Error(`User ${userId} not found`);
  }
  
  if (channel === 'whatsapp') {
    user.verified.whatsapp = true;
  } else if (channel === 'email') {
    user.verified.email = true;
  }
  
  logger.debug(`Updated verification status for user ${userId}: ${channel} verified`);
  
  return user;
};

// Verificar se um usuário está totalmente verificado
export const isFullyVerified = (userId) => {
  const user = userStore.get(userId);
  
  if (!user) {
    return false;
  }
  
  return user.verified.whatsapp && user.verified.email;
};
```

### 6. Middleware de Autenticação (middleware/auth.js)

```javascript
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger.js';

export const authMiddleware = (req, res, next) => {
  // Obter token do cabeçalho Authorization
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Adicionar usuário à requisição
    req.user = decoded;
    
    next();
  } catch (error) {
    logger.warn(`Invalid token: ${error.message}`);
    return res.status(401).json({ error: 'Invalid token' });
  }
};
```

### 7. Middleware de Rate Limiting (middleware/rateLimit.js)

```javascript
import { logger } from '../utils/logger.js';

// Armazenamento em memória para controle de taxa (substituir por Redis em produção)
const requestCounts = new Map();

// Limitar requisições a 100 por IP por hora
export const rateLimiter = (req, res, next) => {
  const ip = req.ip;
  const now = Date.now();
  const windowMs = 60 * 60 * 1000; // 1 hora
  const maxRequests = 100; // Máximo de requisições por janela
  
  // Limpar entradas antigas
  if (!requestCounts.has(ip)) {
    requestCounts.set(ip, {
      count: 0,
      resetAt: now + windowMs
    });
  }
  
  const data = requestCounts.get(ip);
  
  // Resetar contador se a janela expirou
  if (now > data.resetAt) {
    data.count = 0;
    data.resetAt = now + windowMs;
  }
  
  // Incrementar contador
  data.count += 1;
  
  // Verificar limite
  if (data.count > maxRequests) {
    logger.warn(`Rate limit exceeded for IP ${ip}`);
    return res.status(429).json({ error: 'Too many requests, please try again later' });
  }
  
  next();
};
```

### 8. Middleware de Validação (middleware/validation.js)

```javascript
import { logger } from '../utils/logger.js';

export const validateInput = (req, res, next) => {
  // Validar requisições para generate-otp
  if (req.path === '/api/generate-otp') {
    const { userId, channel } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    if (!channel || !['whatsapp', 'email'].includes(channel)) {
      return res.status(400).json({ error: 'Valid channel (whatsapp or email) is required' });
    }
  }
  
  // Validar requisições para verify-otp
  if (req.path === '/api/verify-otp') {
    const { userId, otp, channel } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    if (!otp) {
      return res.status(400).json({ error: 'OTP is required' });
    }
    
    if (!channel || !['whatsapp', 'email'].includes(channel)) {
      return res.status(400).json({ error: 'Valid channel (whatsapp or email) is required' });
    }
  }
  
  next();
};
```

### 9. Utilitário de Logging (utils/logger.js)

```javascript
// Níveis de log: error, warn, info, debug
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3
};

// Nível de log atual (baseado em variável de ambiente ou padrão para 'info')
const currentLevel = logLevels[process.env.LOG_LEVEL || 'info'];

export const logger = {
  error: (message) => {
    if (currentLevel >= logLevels.error) {
      console.error(`[ERROR] ${new Date().toISOString()}: ${message}`);
    }
  },
  
  warn: (message) => {
    if (currentLevel >= logLevels.warn) {
      console.warn(`[WARN] ${new Date().toISOString()}: ${message}`);
    }
  },
  
  info: (message) => {
    if (currentLevel >= logLevels.info) {
      console.info(`[INFO] ${new Date().toISOString()}: ${message}`);
    }
  },
  
  debug: (message) => {
    if (currentLevel >= logLevels.debug) {
      console.debug(`[DEBUG] ${new Date().toISOString()}: ${message}`);
    }
  }
};
```

## Considerações de Segurança

1. **Armazenamento Seguro**:
   - Em produção, substitua o armazenamento em memória por um banco de dados seguro
   - Considere criptografar OTPs armazenados

2. **Proteção contra Ataques**:
   - Implementar rate limiting para prevenir ataques de força bruta
   - Limitar número de tentativas de verificação
   - Implementar proteção contra timing attacks

3. **Segredos e Configurações**:
   - Usar variáveis de ambiente para segredos
   - Nunca expor segredos no código
   - Usar um segredo JWT forte e rotacioná-lo periodicamente

4. **Validação de Entrada**:
   - Validar todas as entradas do usuário
   - Sanitizar dados antes de processá-los
   - Implementar validação de tipo e formato

5. **Logging e Monitoramento**:
   - Implementar logging detalhado
   - Monitorar tentativas de acesso suspeitas
   - Configurar alertas para atividades anômalas

## Migração para Produção

Para migrar esta implementação para produção:

1. **Persistência de Dados**:
   - Substituir armazenamento em memória por banco de dados (MongoDB, PostgreSQL, etc.)
   - Implementar backups e recuperação de dados

2. **Escalabilidade**:
   - Considerar arquitetura stateless para permitir múltiplas instâncias
   - Usar Redis para armazenamento compartilhado de sessão/cache

3. **Segurança Adicional**:
   - Implementar HTTPS
   - Configurar CORS adequadamente
   - Adicionar proteção contra CSRF
   - Implementar autenticação para webhooks

4. **Monitoramento**:
   - Implementar health checks
   - Configurar logging centralizado
   - Implementar métricas e dashboards

5. **Integração Real**:
   - Substituir a implementação de exemplo do WhatsApp por uma integração real
   - Configurar serviço de email para envio real de emails