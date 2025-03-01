# n8n Integration Guide for OTP Authentication System

This guide explains how to integrate the OTP Authentication System with n8n, including both using the existing HTTP Request nodes and the custom OTP Authentication node.

## Table of Contents

1. [Introduction](#introduction)
2. [Integration Options](#integration-options)
3. [Using HTTP Request Nodes](#using-http-request-nodes)
4. [Using the Custom OTP Authentication Node](#using-the-custom-otp-authentication-node)
5. [Example Workflows](#example-workflows)
6. [Best Practices](#best-practices)

## Introduction

n8n is a workflow automation platform that can be used to automate the OTP authentication process. By integrating with n8n, you can:

- Create automated workflows for user registration and verification
- Connect OTP authentication to other systems and services
- Customize the authentication flow based on your specific requirements

## Integration Options

There are two main ways to integrate the OTP Authentication System with n8n:

1. **Using HTTP Request Nodes**: This approach uses n8n's built-in HTTP Request nodes to call the OTP Authentication API endpoints directly.

2. **Using the Custom OTP Authentication Node**: This approach uses a custom n8n node specifically designed for the OTP Authentication System, providing a more user-friendly interface.

## Using HTTP Request Nodes

### Prerequisites

- n8n instance up and running
- OTP Authentication API accessible from n8n

### Basic Workflow Structure

1. **Trigger Node**: Start the workflow (e.g., Webhook, Manual, Schedule)
2. **HTTP Request Node**: Call the OTP Authentication API
3. **Conditional Nodes**: Handle different responses and scenarios
4. **Action Nodes**: Perform actions based on the authentication result

### Example: Generate OTP

1. Add an HTTP Request node
2. Configure it as follows:
   - Method: POST
   - URL: `http://your-api-url/api/generate-otp`
   - Headers: `Content-Type: application/json`
   - Body: 
     ```json
     {
       "name": "{{$json.name}}",
       "userId": "{{$json.userId}}",
       "channel": "{{$json.channel}}",
       "phoneNumber": "{{$json.phoneNumber}}",
       "email": "{{$json.email}}"
     }
     ```

### Example: Verify OTP

1. Add an HTTP Request node
2. Configure it as follows:
   - Method: POST
   - URL: `http://your-api-url/api/verify-otp`
   - Headers: `Content-Type: application/json`
   - Body: 
     ```json
     {
       "userId": "{{$json.userId}}",
       "otp": "{{$json.otp}}",
       "channel": "{{$json.channel}}"
     }
     ```

## Using the Custom OTP Authentication Node

### Installation

1. Install the custom OTP Authentication node in n8n:
   - Go to Settings > Community Nodes
   - Click "Install a community node"
   - Enter `n8n-nodes-otp-auth`
   - Click "Install"

2. Configure the credentials:
   - Go to Credentials > New
   - Select "OTP Auth API"
   - Enter your API URL and optional API key
   - Save the credentials

### Using the Node

The custom OTP Authentication node provides a more intuitive interface for interacting with the OTP Authentication API:

1. **Generate OTP**:
   - Select "OTP" as the resource
   - Select "Generate" as the operation
   - Fill in the required fields (name, userId, channel, etc.)

2. **Verify OTP**:
   - Select "OTP" as the resource
   - Select "Verify" as the operation
   - Fill in the required fields (userId, otp, channel)

3. **Get Channels**:
   - Select "OTP" as the resource
   - Select "Get Channels" as the operation

4. **Get User**:
   - Select "OTP" as the resource
   - Select "Get User" as the operation
   - Enter the userId

## Example Workflows

### User Registration and Verification

1. **Webhook Node**: Receive user registration data
2. **OTP Auth Node** (Generate): Generate OTP for the user
3. **Wait Node**: Wait for user to enter OTP
4. **Webhook Node**: Receive OTP from user
5. **OTP Auth Node** (Verify): Verify the OTP
6. **IF Node**: Check if verification was successful
7. **Action Nodes**: Complete registration or handle failure

### Multi-Channel Authentication

1. **Webhook Node**: Receive authentication request
2. **OTP Auth Node** (Generate): Generate OTP via first channel (e.g., SMS)
3. **Wait Node**: Wait for user to enter OTP
4. **Webhook Node**: Receive OTP from user
5. **OTP Auth Node** (Verify): Verify the OTP
6. **IF Node**: Check if verification was successful
7. **OTP Auth Node** (Generate): Generate OTP via second channel (e.g., Email)
8. **Wait Node**: Wait for user to enter second OTP
9. **Webhook Node**: Receive second OTP from user
10. **OTP Auth Node** (Verify): Verify the second OTP
11. **IF Node**: Check if both verifications were successful
12. **Action Nodes**: Complete authentication or handle failure

## Best Practices

1. **Error Handling**: Always include error handling in your workflows to handle API errors, timeouts, and other issues.

2. **Security**: Store sensitive information (API keys, credentials) securely in n8n's credentials manager.

3. **Timeouts**: Set appropriate timeouts for Wait nodes to ensure workflows don't hang indefinitely.

4. **Logging**: Use n8n's logging features to track workflow execution and troubleshoot issues.

5. **Testing**: Test your workflows thoroughly before deploying them to production.

6. **Monitoring**: Set up monitoring for your workflows to ensure they're running correctly.

7. **Versioning**: Use n8n's versioning features to keep track of workflow changes.

8. **Documentation**: Document your workflows to make them easier to understand and maintain.