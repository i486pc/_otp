# Multi-Channel OTP Authentication System

This project provides a comprehensive authentication system using One-Time Passwords (OTPs) delivered through multiple channels: SMS via ClickSend, Email via SMTP, Voice Calls via Vapi.ai, and WhatsApp via WhatsApp Business API.

## Features

- Generate and verify OTPs across multiple channels
- Multi-factor authentication requiring verification on at least 2 channels
- JWT token generation upon successful verification
- Interactive demo UI for testing the OTP flow
- Webhook integration for external systems

## System Architecture

The system consists of:

1. **Frontend**: React application with channel selection and OTP verification
2. **Backend API**: Express.js server that handles OTP generation and verification
3. **External Services**: Integration with ClickSend, SMTP, Vapi.ai, and WhatsApp Business API

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- ClickSend account (for SMS)
- SMTP server access (for Email)
- Vapi.ai account (for Voice Calls)
- WhatsApp Business API access

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file with the following variables:
   ```
   PORT=3000
   JWT_SECRET=your-secure-jwt-secret-change-this-in-production
   BASE_URL=http://localhost:3000

   # ClickSend SMS Configuration
   CLICKSEND_USERNAME=your_clicksend_username
   CLICKSEND_API_KEY=your_clicksend_api_key
   SMS_FROM_NUMBER=OTPSystem

   # Email Configuration
   SMTP_HOST=smtp.example.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your_smtp_username
   SMTP_PASS=your_smtp_password
   EMAIL_FROM=noreply@yourdomain.com

   # Vapi.ai Voice Call Configuration
   VAPI_API_KEY=your_vapi_api_key
   VAPI_ASSISTANT_ID=your_vapi_assistant_id

   # Environment (development or production)
   NODE_ENV=development
   ```

### Running the Application

1. Start the API server:
   ```
   npm run start:api
   ```

2. In a separate terminal, start the frontend:
   ```
   npm run dev
   ```

3. Access the application at `http://localhost:5173`

## API Endpoints

- `POST /api/generate-otp`: Generate OTP for a user via selected channel
- `POST /api/verify-otp`: Verify OTP for a user
- `POST /api/webhook/n8n`: Webhook endpoint for external integrations
- `GET /api/webhook-url`: Get the webhook URL for integrations
- `GET /api/channels`: Get available authentication channels

## Channel Integration

### SMS with ClickSend

The system uses ClickSend's API to send SMS messages containing OTP codes. Configure your ClickSend credentials in the `.env` file.

### Email with SMTP

Standard SMTP is used for sending email OTPs. Configure your SMTP server details in the `.env` file.

### Voice Calls with Vapi.ai

Vapi.ai is used to make automated voice calls that read out the OTP code. Configure your Vapi.ai credentials in the `.env` file.

### WhatsApp Business API

For WhatsApp integration, you'll need to set up access to the WhatsApp Business API. In a production environment, replace the placeholder implementation with actual WhatsApp API calls.

## Security Considerations

- OTPs expire after 10 minutes
- Maximum of 3 verification attempts per OTP
- Multi-factor authentication requiring at least 2 verified channels
- JWT tokens for authenticated sessions
- Rate limiting to prevent brute force attacks

## Production Considerations

For production deployment:

1. Replace the in-memory storage with a database
2. Implement proper error handling and logging
3. Set up HTTPS
4. Configure proper rate limiting
5. Never return OTPs in API responses
6. Use a secure JWT secret
7. Implement monitoring and alerting

## License

MIT