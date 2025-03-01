# n8n-nodes-otp-auth

This is an n8n community node for integrating with the OTP Authentication system. It provides a simple interface for generating and verifying OTPs through various channels (SMS, Email, Voice Call, WhatsApp).

## Installation

### In n8n Desktop/Server

1. Go to **Settings > Community Nodes**
2. Click on **Install a community node**
3. Enter `n8n-nodes-otp-auth` in the **Name** field
4. Click **Install**

### In n8n Cloud

1. Go to **Workflows > Community Nodes**
2. Click on **Install a community node**
3. Enter `n8n-nodes-otp-auth` in the **Name** field
4. Click **Install**

## Usage

### OTP Authentication Node

This node allows you to interact with the OTP Authentication API. It supports the following operations:

#### Generate OTP

Generates an OTP for a user through a specified channel.

**Parameters:**
- **Name**: Name of the user (optional)
- **User ID**: ID of the user (optional, will be created if not provided)
- **Channel**: Channel to send the OTP through (SMS, Email, Voice Call, WhatsApp)
- **Phone Number**: Phone number to send the OTP to (required for SMS, Voice Call, and WhatsApp)
- **Email**: Email to send the OTP to (required for Email)

#### Verify OTP

Verifies an OTP provided by a user.

**Parameters:**
- **User ID**: ID of the user (required)
- **OTP**: OTP to verify (required)
- **Channel**: Channel the OTP was sent through (required)

#### Get Channels

Gets the available authentication channels.

#### Get User

Gets information about a user.

**Parameters:**
- **User ID**: ID of the user (required)

## Credentials

### OTP Auth API

To use this node, you need to provide the following credentials:

- **API URL**: The URL of the OTP Authentication API (e.g., `http://localhost:3000/api`)
- **API Key**: Optional API key for authentication

## Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Build the node: `npm run build`
4. Link to your n8n installation: `npm link`
5. In your n8n installation directory, run: `npm link n8n-nodes-otp-auth`

## License

MIT