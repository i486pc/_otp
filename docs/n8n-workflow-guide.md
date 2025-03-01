# Guia Detalhado do Workflow n8n para Autenticação OTP via WhatsApp

Este documento fornece uma explicação detalhada do workflow n8n para autenticação OTP via WhatsApp, incluindo a configuração de cada nó e as conexões entre eles.

## Visão Geral do Workflow

O workflow n8n é responsável por:
1. Receber solicitações de autenticação via webhook
2. Processar diferentes tipos de solicitações (signup ou verificação de OTP)
3. Gerar OTPs através da API
4. Enviar OTPs via WhatsApp ou email
5. Verificar OTPs fornecidos pelos usuários
6. Enviar mensagens de confirmação ou erro

## Estrutura do Workflow

```
[Webhook] --> [Is Signup?] --> [Generate WhatsApp OTP] --> [Send WhatsApp Message]
                          \--> [Generate Email OTP] --> [Send Email]
          \--> [Is OTP Verification?] --> [Verify OTP] --> [Is Verified?] --> [Send Success Message]
                                                                         \--> [Send Failure Message]
```

## Configuração Detalhada dos Nós

### 1. Webhook (WhatsApp Webhook)

Este nó cria um endpoint HTTP que recebe solicitações do WhatsApp ou da aplicação.

**Configuração:**
- **Método HTTP**: POST
- **Caminho**: `/whatsapp-webhook`
- **Opções de Resposta**: Responder imediatamente

**Dados de Entrada Esperados:**
```json
{
  "type": "signup",
  "userId": "user123",
  "phoneNumber": "+5511999999999",
  "email": "user@example.com"
}
```

ou

```json
{
  "type": "verify_otp",
  "userId": "user123",
  "otp": "123456",
  "channel": "whatsapp",
  "phoneNumber": "+5511999999999"
}
```

### 2. Nó de Condição (Is Signup?)

Este nó verifica se a solicitação é para cadastro (signup).

**Configuração:**
- **Condição**: `{{$json["type"]}} === "signup"`

### 3. Geração de OTP para WhatsApp (Generate WhatsApp OTP)

Este nó chama a API para gerar um OTP para o canal WhatsApp.

**Configuração:**
- **URL**: `{{$env.OTP_API_URL}}/api/webhook/n8n`
- **Método**: POST
- **Corpo da Requisição**:
  ```json
  {
    "action": "initiate_verification",
    "userId": "{{$json[\"userId\"]}}",
    "channel": "whatsapp",
    "phoneNumber": "{{$json[\"phoneNumber\"]}}",
    "email": "{{$json[\"email\"]}}"
  }
  ```

### 4. Envio de Mensagem WhatsApp (Send WhatsApp Message)

Este nó envia o OTP gerado para o usuário via WhatsApp.

**Configuração:**
- **URL**: `https://api.whatsapp.com/send`
- **Método**: POST
- **Corpo da Requisição**:
  ```json
  {
    "phoneNumber": "{{$json[\"phoneNumber\"]}}",
    "message": "Seu código de verificação é: {{$node[\"Generate WhatsApp OTP\"].json[\"otp\"]}}. Este código expirará em 10 minutos."
  }
  ```

### 5. Geração de OTP para Email (Generate Email OTP)

Este nó chama a API para gerar um OTP para o canal de email.

**Configuração:**
- **URL**: `{{$env.OTP_API_URL}}/api/webhook/n8n`
- **Método**: POST
- **Corpo da Requisição**:
  ```json
  {
    "action": "initiate_verification",
    "userId": "{{$json[\"userId\"]}}",
    "channel": "email",
    "phoneNumber": "{{$json[\"phoneNumber\"]}}",
    "email": "{{$json[\"email\"]}}"
  }
  ```

### 6. Envio de Email (Send Email)

Este nó envia o OTP gerado para o usuário via email.

**Configuração:**
- **De**: `noreply@yourdomain.com`
- **Para**: `{{$json["email"]}}`
- **Assunto**: `Seu Código de Verificação`
- **Texto**: `Seu código de verificação é: {{$node["Generate Email OTP"].json["otp"]}}. Este código expirará em 10 minutos.`

### 7. Nó de Condição (Is OTP Verification?)

Este nó verifica se a solicitação é para verificação de OTP.

**Configuração:**
- **Condição**: `{{$json["type"]}} === "verify_otp"`

### 8. Verificação de OTP (Verify OTP)

Este nó chama a API para verificar o OTP fornecido pelo usuário.

**Configuração:**
- **URL**: `{{$env.OTP_API_URL}}/api/verify-otp`
- **Método**: POST
- **Corpo da Requisição**:
  ```json
  {
    "userId": "{{$json[\"userId\"]}}",
    "otp": "{{$json[\"otp\"]}}",
    "channel": "{{$json[\"channel\"]}}"
  }
  ```

### 9. Nó de Condição (Is Verified?)

Este nó verifica se a verificação do OTP foi bem-sucedida.

**Configuração:**
- **Condição**: `{{$json["success"]}} === true`

### 10. Envio de Mensagem de Sucesso (Send Success Message)

Este nó envia uma mensagem de sucesso para o usuário via WhatsApp.

**Configuração:**
- **URL**: `https://api.whatsapp.com/send`
- **Método**: POST
- **Corpo da Requisição**:
  ```json
  {
    "phoneNumber": "{{$json[\"phoneNumber\"]}}",
    "message": "Verificação bem-sucedida! {{$json[\"fullyVerified\"] ? \"Sua conta agora está totalmente verificada.\" : \"Por favor, complete a verificação para todos os canais.\"}}"
  }
  ```

### 11. Envio de Mensagem de Falha (Send Failure Message)

Este nó envia uma mensagem de falha para o usuário via WhatsApp.

**Configuração:**
- **URL**: `https://api.whatsapp.com/send`
- **Método**: POST
- **Corpo da Requisição**:
  ```json
  {
    "phoneNumber": "{{$json[\"phoneNumber\"]}}",
    "message": "Verificação falhou. Por favor, tente novamente com um OTP válido."
  }
  ```

## Conexões entre Nós

1. **Webhook** → **Is Signup?** e **Is OTP Verification?**
2. **Is Signup? (true)** → **Generate WhatsApp OTP** e **Generate Email OTP**
3. **Generate WhatsApp OTP** → **Send WhatsApp Message**
4. **Generate Email OTP** → **Send Email**
5. **Is OTP Verification? (true)** → **Verify OTP**
6. **Verify OTP** → **Is Verified?**
7. **Is Verified? (true)** → **Send Success Message**
8. **Is Verified? (false)** → **Send Failure Message**

## Variáveis de Ambiente Necessárias

- `OTP_API_URL`: URL base da API de OTP (ex: `http://localhost:3000`)

## Considerações de Produção

Para um ambiente de produção, considere:

1. **Segurança**:
   - Usar HTTPS para todas as comunicações
   - Implementar autenticação para o webhook
   - Proteger as credenciais de API

2. **Escalabilidade**:
   - Configurar execuções paralelas
   - Implementar filas para processamento assíncrono

3. **Monitoramento**:
   - Configurar alertas para falhas
   - Implementar logs detalhados
   - Monitorar tempos de execução

4. **Integração Real com WhatsApp**:
   - Substituir a URL de exemplo por uma integração real com a API do WhatsApp Business
   - Configurar webhooks bidirecionais para receber respostas do usuário

## Testes do Workflow

Para testar o workflow:

1. **Teste de Signup**:
   ```bash
   curl -X POST http://localhost:5678/webhook/whatsapp-webhook \
     -H "Content-Type: application/json" \
     -d '{"type":"signup","userId":"test123","phoneNumber":"+5511999999999","email":"test@example.com"}'
   ```

2. **Teste de Verificação de OTP**:
   ```bash
   curl -X POST http://localhost:5678/webhook/whatsapp-webhook \
     -H "Content-Type: application/json" \
     -d '{"type":"verify_otp","userId":"test123","otp":"123456","channel":"whatsapp","phoneNumber":"+5511999999999"}'
   ```

## Próximos Passos

1. Implementar tratamento de erros mais robusto
2. Adicionar suporte para reenvio de OTP
3. Implementar expiração automática de OTPs não verificados
4. Adicionar suporte para múltiplos idiomas nas mensagens