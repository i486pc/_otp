# Security Implementation Guide for OTP Authentication System

This document provides detailed information about the security measures implemented in the OTP Authentication System, including protection against various types of attacks, input validation, rate limiting, and scheduled tasks.

## Table of Contents

1. [Security Overview](#security-overview)
2. [Input Validation and Sanitization](#input-validation-and-sanitization)
3. [Rate Limiting](#rate-limiting)
4. [Protection Against Common Attacks](#protection-against-common-attacks)
5. [Scheduled Tasks](#scheduled-tasks)
6. [Security Headers](#security-headers)
7. [Data Protection](#data-protection)
8. [Monitoring and Logging](#monitoring-and-logging)
9. [Best Practices](#best-practices)

## Security Overview

The OTP Authentication System implements multiple layers of security to protect against various threats:

- **Input Validation**: All user inputs are validated and sanitized to prevent injection attacks
- **Rate Limiting**: Limits the number of requests to prevent brute force attacks
- **Account Lockout**: Temporarily locks accounts after multiple failed attempts
- **OTP Expiration**: OTPs expire after a short time (30 seconds)
- **Secure Storage**: Sensitive data is stored securely
- **Security Headers**: HTTP security headers to protect against common web vulnerabilities
- **Scheduled Tasks**: Automated cleanup of expired data and security-related maintenance

## Input Validation and Sanitization

### Validation Strategies

1. **Schema Validation**: Using Joi to validate request bodies against predefined schemas
2. **Type Checking**: Ensuring inputs are of the expected type
3. **Format Validation**: Validating formats for emails, phone numbers, UUIDs, etc.
4. **Content Sanitization**: Escaping HTML and SQL special characters

### Implementation

```javascript
// Validation schema example
const generateOtpSchema = Joi.object({
  name: Joi.string().trim().allow('', null),
  userId: Joi.string().trim().allow('', null),
  channel: Joi.string().valid('sms', 'email', 'call', 'whatsapp', 'totp').required(),
  phoneNumber: Joi.string().when('channel', {
    is: Joi.string().valid('sms', 'call', 'whatsapp'),
    then: Joi.string().required(),
    otherwise: Joi.string().allow('', null)
  }),
  email: Joi.string().when('channel', {
    is: 'email',
    then: Joi.string().email().required(),
    otherwise: Joi.string().allow('', null)
  })
});

// Middleware for validation
export const validateRequestBody = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({ 
        error: 'Invalid request data', 
        details: error.details.map(detail => detail.message)
      });
    }
    
    next();
  };
};

// Sanitization functions
export const sanitizeHtmlInput = (input) => {
  if (typeof input !== 'string') {
    return input;
  }
  return validator.escape(input);
};

export const sanitizeSqlInput = (input) => {
  if (typeof input !== 'string') {
    return input;
  }
  return escape(input);
};
```

## Rate Limiting

### IP-Based Rate Limiting

Limits the number of requests from a single IP address to prevent distributed attacks.

```javascript
// IP-based rate limiting
const ipRequests = new Map();

// Check IP rate limit
const ipData = ipRequests.get(ip) || { count: 0, resetAt: now + windowMs };

// Reset if window expired
if (now > ipData.resetAt) {
  ipData.count = 0;
  ipData.resetAt = now + windowMs;
}

ipData.count += 1;
ipRequests.set(ip, ipData);

if (ipData.count > maxRequestsPerIp) {
  return res.status(429).json({ 
    error: 'Too many requests from this IP, please try again later',
    retryAfter: Math.ceil((ipData.resetAt - now) / 1000)
  });
}
```

### User-Based Rate Limiting

Limits the number of requests for a specific user ID to prevent targeted attacks.

```javascript
// User-based rate limiting
const userData = userRequests.get(userId) || { count: 0, resetAt: now + windowMs };

// Reset if window expired
if (now > userData.resetAt) {
  userData.count = 0;
  userData.resetAt = now + windowMs;
}

userData.count += 1;
userRequests.set(userId, userData);

if (userData.count > maxRequestsPerUser) {
  return res.status(429).json({ 
    error: 'Too many requests for this user, please try again later',
    retryAfter: Math.ceil((userData.resetAt - now) / 1000)
  });
}
```

### Failed Attempts Lockout

Temporarily locks an account after multiple failed verification attempts.

```javascript
// Check for rate limiting based on failed attempts
if (user.failed_attempts >= 5) {
  const lastFailedTime = new Date(user.last_failed_attempt).getTime();
  const now = Date.now();
  const lockoutPeriod = 15 * 60 * 1000; // 15 minutes
  
  if (now - lastFailedTime < lockoutPeriod) {
    const remainingTime = Math.ceil((lockoutPeriod - (now - lastFailedTime)) / 60000);
    return res.status(429).json({ 
      error: `Too many failed attempts. Please try again in ${remainingTime} minutes.` 
    });
  }
}
```

## Protection Against Common Attacks

### SQL Injection Protection

1. **Parameterized Queries**: Using Supabase's parameterized queries
2. **Input Sanitization**: Sanitizing inputs before using them in queries
3. **Type Validation**: Ensuring inputs are of the expected type

### XSS Protection

1. **Content Sanitization**: Escaping HTML special characters
2. **Content Security Policy**: Restricting which resources can be loaded
3. **X-XSS-Protection Header**: Enabling browser's built-in XSS protection

### CSRF Protection

1. **SameSite Cookies**: Using SameSite=Strict for cookies
2. **CORS Configuration**: Restricting which origins can make requests
3. **Anti-CSRF Tokens**: For sensitive operations (not implemented in this demo)

### JWT Security

1. **Strong Secret**: Using a strong, unique secret for JWT signing
2. **Short Expiration**: Setting reasonable expiration times
3. **Minimal Payload**: Including only necessary data in the token

## Scheduled Tasks

Scheduled tasks are used to maintain the security and performance of the system:

### Cleanup of Expired OTPs

```javascript
export const cleanupExpiredOtps = async () => {
  try {
    const now = new Date().toISOString();
    
    // Delete expired OTPs
    const { data, error } = await supabase
      .from('_otp_codes')
      .delete()
      .lt('expires_at', now);
    
    if (error) {
      console.error('Error cleaning up expired OTPs:', error);
      return { success: false, error };
    }
    
    console.log(`Cleaned up expired OTPs at ${new Date().toISOString()}`);
    return { success: true, count: data?.length || 0 };
  } catch (error) {
    console.error('Error in cleanupExpiredOtps:', error);
    return { success: false, error };
  }
};
```

### Reset of Failed Attempts

```javascript
export const resetFailedAttempts = async () => {
  try {
    const resetTime = new Date();
    resetTime.setHours(resetTime.getHours() - 24); // Reset attempts older than 24 hours
    
    // Update users with failed attempts older than the reset time
    const { data, error } = await supabase
      .from('_otp')
      .update({ failed_attempts: 0 })
      .lt('last_failed_attempt', resetTime.toISOString());
    
    if (error) {
      console.error('Error resetting failed attempts:', error);
      return { success: false, error };
    }
    
    console.log(`Reset failed attempts at ${new Date().toISOString()}`);
    return { success: true, count: data?.length || 0 };
  } catch (error) {
    console.error('Error in resetFailedAttempts:', error);
    return { success: false, error };
  }
};
```

### Scheduling Options

1. **Interval-Based**: Using `setInterval` for simple scheduling
2. **Cron-Based**: Using `node-schedule` for more complex scheduling
3. **External Scheduler**: Using n8n for workflow-based scheduling

## Security Headers

```javascript
export const securityHeaders = (req, res, next) => {
  // Set security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; connect-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline';");
  
  next();
};
```

## Data Protection

### Sensitive Data Handling

1. **Minimal Storage**: Storing only necessary data
2. **Short Retention**: Automatically deleting expired data
3. **Secure Transmission**: Using HTTPS for all communications

### OTP Security

1. **Short Expiration**: OTPs expire after 30 seconds
2. **Limited Attempts**: Maximum of 3 attempts per OTP
3. **One-Time Use**: OTPs are deleted after successful verification

## Monitoring and Logging

### Security Logging

```javascript
// Log security events
console.error('Invalid OTP attempt for user:', userId);
console.warn('Rate limit exceeded for IP:', ip);
console.info('User account locked due to multiple failed attempts:', userId);
```

### Audit Trail

1. **Authentication Events**: Logging all authentication attempts
2. **Admin Actions**: Logging administrative actions
3. **Security Incidents**: Logging security-related incidents

## Best Practices

1. **Defense in Depth**: Implementing multiple layers of security
2. **Principle of Least Privilege**: Granting only necessary permissions
3. **Secure by Default**: Making security the default configuration
4. **Regular Updates**: Keeping dependencies up to date
5. **Security Testing**: Regularly testing for vulnerabilities
6. **Incident Response Plan**: Having a plan for security incidents
7. **User Education**: Educating users about security best practices

## Using n8n for Scheduled Tasks

n8n can be used to create workflows for scheduled tasks, providing a visual interface for managing complex scheduling requirements.

### Example n8n Workflow for OTP Cleanup

1. **Schedule Trigger**: Set to run every 5 minutes
2. **HTTP Request**: Call the cleanup endpoint
3. **IF**: Check if cleanup was successful
4. **Slack/Email**: Send notification if cleanup failed

### Benefits of Using n8n for Scheduling

1. **Visual Interface**: Easy to understand and modify
2. **Error Handling**: Built-in error handling and retries
3. **Notifications**: Easy integration with notification services
4. **Monitoring**: Built-in execution history and logs
5. **Flexibility**: Can be combined with other workflows