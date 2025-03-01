# Guia de Implementação do Sistema OTP para WhatsApp

Este guia detalha o processo de implementação do sistema de autenticação OTP para WhatsApp, dividido em etapas claras e sequenciais.

## Índice
1. [Visão Geral da Arquitetura](#visão-geral-da-arquitetura)
2. [Configuração do Ambiente](#configuração-do-ambiente)
3. [Implementação do Backend](#implementação-do-backend)
4. [Integração com n8n](#integração-com-n8n)
5. [Desenvolvimento do Frontend](#desenvolvimento-do-frontend)
6. [Testes e Validação](#testes-e-validação)
7. [Considerações de Segurança](#considerações-de-segurança)
8. [Implantação em Produção](#implantação-em-produção)

## Visão Geral da Arquitetura

O sistema consiste em três componentes principais:

1. **Backend API (Express.js)**: Gerencia a geração e verificação de OTPs
2. **Frontend (React)**: Interface para demonstração e testes
3. **n8n Workflow**: Orquestra a comunicação via WhatsApp

```
[Usuário/WhatsApp] <--> [n8n Workflow] <--> [Backend API] <--> [Armazenamento]
                                               ^
                                               |
                                        [Frontend React]
```

## Configuração do Ambiente

### Passo 1: Configuração Inicial

- [x] Criar estrutura de diretórios do projeto
- [ ] Configurar variáveis de ambiente (.env)
- [ ] Instalar dependências necessárias

### Passo 2: Configuração do Banco de Dados

Para desenvolvimento, usamos armazenamento em memória. Para produção, recomendamos:

- [ ] Configurar Supabase ou outro banco de dados
- [ ] Criar tabelas para usuários e OTPs
- [ ] Configurar conexão segura

## Implementação do Backend

### Passo 3: Estrutura do Servidor Express

```javascript
// Estrutura básica do servidor
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { authenticator } from 'otplib';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Rotas serão adicionadas aqui

app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});
```

### Passo 4: Implementação da Geração de OTP

- [ ] Criar endpoint `/api/generate-otp`
- [ ] Implementar lógica de geração de OTP
- [ ] Configurar armazenamento temporário de OTPs

```javascript
// Exemplo de implementação
app.post('/api/generate-otp', (req, res) => {
  const { userId, channel } = req.body;
  
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }
  
  // Gerar um segredo para este usuário
  const secret = authenticator.generateSecret();
  
  // Gerar um OTP de 6 dígitos
  const otp = authenticator.generate(secret);
  
  // Armazenar OTP com expiração (10 minutos)
  otpStore.set(userId, {
    otp,
    channel,
    expires: Date.now() + 10 * 60 * 1000
  });
  
  res.json({ 
    message: `OTP generated for ${channel}`,
    // Apenas para desenvolvimento - remover em produção
    otp
  });
});
```

### Passo 5: Implementação da Verificação de OTP

- [ ] Criar endpoint `/api/verify-otp`
- [ ] Implementar lógica de verificação
- [ ] Gerar token JWT após verificação bem-sucedida

```javascript
app.post('/api/verify-otp', (req, res) => {
  const { userId, otp, channel } = req.body;
  
  if (!userId || !otp) {
    return res.status(400).json({ error: 'User ID and OTP are required' });
  }
  
  const otpData = otpStore.get(userId);
  const userData = userStore.get(userId);
  
  if (!otpData || !userData) {
    return res.status(404).json({ error: 'No OTP found for this user' });
  }
  
  if (Date.now() > otpData.expires) {
    otpStore.delete(userId);
    return res.status(401).json({ error: 'OTP expired' });
  }
  
  // Verificar OTP
  const isValid = otpData.otp === otp;
  
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid OTP' });
  }
  
  // Marcar este canal como verificado
  if (channel === 'whatsapp') {
    userData.verified.whatsapp = true;
  } else if (channel === 'email') {
    userData.verified.email = true;
  }
  
  // Limpar o OTP usado
  otpStore.delete(userId);
  
  // Gerar token se ambos os canais estiverem verificados
  let token = null;
  if (userData.verified.whatsapp && userData.verified.email) {
    token = jwt.sign({ userId, verified: true }, JWT_SECRET, { expiresIn: '7d' });
  }
  
  res.json({ 
    success: true, 
    message: `${channel} verified successfully`,
    fullyVerified: userData.verified.whatsapp && userData.verified.email,
    token
  });
});
```

### Passo 6: Implementação do Webhook para n8n

- [ ] Criar endpoint `/api/webhook/n8n`
- [ ] Implementar lógica para diferentes ações
- [ ] Configurar resposta para o n8n

```javascript
app.post('/api/webhook/n8n', (req, res) => {
  const { action, userId, channel, phoneNumber, email } = req.body;
  
  if (!action || !userId) {
    return res.status(400).json({ error: 'Action and userId are required' });
  }
  
  // Tratar diferentes ações do n8n
  switch (action) {
    case 'initiate_verification':
      // Criar usuário se não existir
      if (!userStore.has(userId)) {
        userStore.set(userId, {
          secret: authenticator.generateSecret(),
          phoneNumber,
          email,
          verified: {
            whatsapp: false,
            email: false
          }
        });
      }
      
      // Gerar OTP
      const userData = userStore.get(userId);
      const otp = authenticator.generate(userData.secret);
      
      otpStore.set(userId, {
        otp,
        channel,
        expires: Date.now() + 10 * 60 * 1000
      });
      
      res.json({
        success: true,
        userId,
        channel,
        // Apenas para desenvolvimento - remover em produção
        otp
      });
      break;
      
    case 'check_verification_status':
      const user = userStore.get(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json({
        userId,
        verified: user.verified
      });
      break;
      
    default:
      res.status(400).json({ error: 'Unknown action' });
  }
});
```

## Integração com n8n

### Passo 7: Configuração do Workflow no n8n

- [ ] Importar o workflow de exemplo
- [ ] Configurar nós de webhook
- [ ] Configurar nós de condição
- [ ] Configurar nós de requisição HTTP

#### Estrutura do Workflow:

1. **Webhook de Entrada**: Recebe solicitações do WhatsApp
2. **Nó de Condição**: Verifica o tipo de solicitação (signup ou verify_otp)
3. **Geração de OTP**: Chama a API para gerar OTP
4. **Envio de Mensagem**: Envia OTP via WhatsApp ou email
5. **Verificação de OTP**: Verifica o OTP fornecido pelo usuário
6. **Resposta ao Usuário**: Envia mensagem de sucesso ou falha

### Passo 8: Configuração da Integração com WhatsApp

- [ ] Configurar API do WhatsApp Business
- [ ] Implementar envio de mensagens
- [ ] Configurar recebimento de mensagens

## Desenvolvimento do Frontend

### Passo 9: Implementação da Interface do Usuário

- [ ] Criar componentes React
- [ ] Implementar fluxo de autenticação
- [ ] Estilizar com Tailwind CSS

### Passo 10: Integração com a API Backend

- [ ] Criar serviços para comunicação com a API
- [ ] Implementar tratamento de erros
- [ ] Gerenciar estado da aplicação

```typescript
// Exemplo de serviço para comunicação com a API
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export const generateOtp = async (userId: string, channel: 'whatsapp' | 'email') => {
  try {
    const response = await axios.post(`${API_URL}/generate-otp`, { userId, channel });
    return response.data;
  } catch (error) {
    console.error('Error generating OTP:', error);
    throw error;
  }
};

export const verifyOtp = async (userId: string, otp: string, channel: 'whatsapp' | 'email') => {
  try {
    const response = await axios.post(`${API_URL}/verify-otp`, { userId, otp, channel });
    return response.data;
  } catch (error) {
    console.error('Error verifying OTP:', error);
    throw error;
  }
};
```

## Testes e Validação

### Passo 11: Testes Unitários

- [ ] Testar geração de OTP
- [ ] Testar verificação de OTP
- [ ] Testar integração com n8n

### Passo 12: Testes de Integração

- [ ] Testar fluxo completo de autenticação
- [ ] Testar cenários de erro
- [ ] Testar expiração de OTP

## Considerações de Segurança

### Passo 13: Implementação de Medidas de Segurança

- [ ] Implementar rate limiting
- [ ] Configurar HTTPS
- [ ] Implementar validação de entrada
- [ ] Configurar políticas de CORS
- [ ] Implementar logs de segurança

## Implantação em Produção

### Passo 14: Preparação para Produção

- [ ] Configurar banco de dados persistente
- [ ] Remover logs de desenvolvimento
- [ ] Configurar variáveis de ambiente seguras
- [ ] Implementar monitoramento

### Passo 15: Implantação

- [ ] Implantar backend em servidor de produção
- [ ] Implantar frontend em CDN
- [ ] Configurar domínios e certificados SSL
- [ ] Realizar testes finais em ambiente de produção

## Checklist Final

- [ ] Todos os componentes estão implementados
- [ ] Testes foram executados com sucesso
- [ ] Medidas de segurança estão em vigor
- [ ] Documentação está completa
- [ ] Sistema está pronto para uso em produção