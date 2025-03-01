import { escape } from 'sqlstring';
import validator from 'validator';

/**
 * Sanitize user input to prevent SQL injection
 * @param {string} input - The user input to sanitize
 * @returns {string} - The sanitized input
 */
export const sanitizeSqlInput = (input) => {
  if (typeof input !== 'string') {
    return input;
  }
  return escape(input);
};

/**
 * Sanitize user input to prevent XSS attacks
 * @param {string} input - The user input to sanitize
 * @returns {string} - The sanitized input
 */
export const sanitizeHtmlInput = (input) => {
  if (typeof input !== 'string') {
    return input;
  }
  return validator.escape(input);
};

/**
 * Validate phone number format
 * @param {string} phoneNumber - The phone number to validate
 * @returns {boolean} - Whether the phone number is valid
 */
export const isValidPhoneNumber = (phoneNumber) => {
  if (typeof phoneNumber !== 'string') {
    return false;
  }
  return validator.isMobilePhone(phoneNumber);
};

/**
 * Validate email format
 * @param {string} email - The email to validate
 * @returns {boolean} - Whether the email is valid
 */
export const isValidEmail = (email) => {
  if (typeof email !== 'string') {
    return false;
  }
  return validator.isEmail(email);
};

/**
 * Validate OTP format (6 digits)
 * @param {string} otp - The OTP to validate
 * @returns {boolean} - Whether the OTP is valid
 */
export const isValidOtp = (otp) => {
  if (typeof otp !== 'string') {
    return false;
  }
  return validator.isNumeric(otp) && otp.length === 6;
};

/**
 * Validate UUID format
 * @param {string} uuid - The UUID to validate
 * @returns {boolean} - Whether the UUID is valid
 */
export const isValidUuid = (uuid) => {
  if (typeof uuid !== 'string') {
    return false;
  }
  return validator.isUUID(uuid);
};

/**
 * Rate limiting middleware
 * This is a simple in-memory rate limiter
 * For production, use a Redis-based solution
 */
const ipRequests = new Map();
const userRequests = new Map();

export const rateLimiter = (req, res, next) => {
  const ip = req.ip;
  const userId = req.body.userId || 'anonymous';
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequestsPerIp = 60; // 60 requests per minute per IP
  const maxRequestsPerUser = 30; // 30 requests per minute per user
  
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
  
  // Check user rate limit if userId is provided
  if (userId !== 'anonymous') {
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
  }
  
  next();
};

/**
 * Security headers middleware
 */
export const securityHeaders = (req, res, next) => {
  // Set security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; connect-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline';");
  
  next();
};

/**
 * Validate request body middleware
 */
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