import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { authenticator } from 'otplib';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import ClickSend from 'clicksend';
import { createClient } from '@supabase/supabase-js';
import QRCode from 'qrcode';
import Joi from 'joi';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Configure ClickSend for SMS
const clickSendConfig = {
  username: process.env.CLICKSEND_USERNAME,
  apiKey: process.env.CLICKSEND_API_KEY
};

// Configure email transporter
const emailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Apply global middleware
app.use(cors());
app.use(express.json());

// Configure TOTP options
authenticator.options = {
  digits: 6,
  step: 30, // 30 seconds validity
  window: 1  // Allow 1 step before/after for clock drift
};

// Validation schemas
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

const verifyOtpSchema = Joi.object({
  userId: Joi.string().required(),
  otp: Joi.string().pattern(/^\d{6}$/).required(),
  channel: Joi.string().valid('sms', 'email', 'call', 'whatsapp', 'totp').required()
});

const totpSetupSchema = Joi.object({
  userId: Joi.string().required()
});

const totpEnableSchema = Joi.object({
  userId: Joi.string().required(),
  code: Joi.string().pattern(/^\d{6}$/).required()
});

// Validate request body middleware
const validateRequestBody = (schema) => {
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

// Send OTP via SMS using ClickSend
const sendSmsOtp = async (phoneNumber, otp) => {
  try {
    const clicksendClient = new ClickSend.SMSApi(
      clickSendConfig.username,
      clickSendConfig.apiKey
    );

    const smsMessage = new ClickSend.SmsMessage();
    smsMessage.from = process.env.SMS_FROM_NUMBER || 'OTP System';
    smsMessage.to = phoneNumber;
    smsMessage.body = `Your verification code is: ${otp}. This code will expire in 30 seconds.`;

    const smsCollection = new ClickSend.SmsMessageCollection();
    smsCollection.messages = [smsMessage];

    const response = await clicksendClient.smsSendPost(smsCollection);
    console.log('SMS sent successfully:', response);
    return true;
  } catch (error) {
    console.error('Error sending SMS:', error);
    return false;
  }
};

// Send OTP via Email
const sendEmailOtp = async (email, otp) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@yourdomain.com',
      to: email,
      subject: 'Your Verification Code',
      text: `Your verification code is: ${otp}. This code will expire in 30 seconds.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #4f46e5;">Your Verification Code</h2>
          <p>Please use the following code to complete your verification:</p>
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; text-align: center; font-size: 24px; letter-spacing: 5px; font-weight: bold;">
            ${otp}
          </div>
          <p style="margin-top: 20px; color: #6b7280;">This code will expire in 30 seconds.</p>
          <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">If you didn't request this code, please ignore this email.</p>
        </div>
      `
    };

    await emailTransporter.sendMail(mailOptions);
    console.log('Email sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

// Make a voice call with OTP using Vapi.ai
const makeVoiceCallOtp = async (phoneNumber, otp) => {
  try {
    // Format OTP with spaces for better voice readability
    const formattedOtp = otp.split('').join(' ');
    
    // Call Vapi.ai API to initiate a voice call
    const response = await fetch('https://api.vapi.ai/call', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.VAPI_API_KEY}`
      },
      body: JSON.stringify({
        recipient: {
          phone_number: phoneNumber
        },
        assistant_id: process.env.VAPI_ASSISTANT_ID,
        first_message: formattedOtp
      })
    });
    
    const data = await response.json();
    console.log('Voice call initiated successfully:', data);
    return true;
  } catch (error) {
    console.error('Error making voice call:', error);
    return false;
  }
};

// Find or create user in Supabase
const findOrCreateUser = async (name, phoneNumber, email, authMethod) => {
  try {
    // Check if user exists by phone or email
    let query = supabase.from('_otp').select('*');
    
    if (phoneNumber) {
      query = query.eq('phone', phoneNumber);
    } else if (email) {
      query = query.eq('email', email);
    } else {
      throw new Error('Either phone or email is required');
    }
    
    let { data: user, error } = await query.maybeSingle();
    
    if (error) {
      console.error('Error finding user:', error);
      throw error;
    }
    
    // If user doesn't exist, create a new one
    if (!user) {
      // Generate a TOTP secret for the new user
      const secret = authenticator.generateSecret();
      
      const { data: newUser, error: createError } = await supabase
        .from('_otp')
        .insert([
          { 
            name, 
            phone: phoneNumber, 
            email, 
            authentication_by: authMethod,
            last_login: new Date(),
            totp_secret: secret,
            totp_enabled: false,
            failed_attempts: 0,
            last_failed_attempt: null
          }
        ])
        .select()
        .single();
      
      if (createError) {
        console.error('Error creating user:', createError);
        throw createError;
      }
      
      user = newUser;
      
      // Create verification record for the new user
      const { error: verificationError } = await supabase
        .from('_otp_verification')
        .insert([{ user_id: user.id }]);
      
      if (verificationError) {
        console.error('Error creating verification record:', verificationError);
        throw verificationError;
      }
    }
    
    return user;
  } catch (error) {
    console.error('Error in findOrCreateUser:', error);
    throw error;
  }
};

// Generate TOTP for a user
const generateTotpForUser = async (userId) => {
  try {
    // Get user's TOTP secret
    const { data: user, error } = await supabase
      .from('_otp')
      .select('totp_secret')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error retrieving user:', error);
      throw error;
    }
    
    if (!user.totp_secret) {
      // Generate a new secret if one doesn't exist
      const secret = authenticator.generateSecret();
      
      const { error: updateError } = await supabase
        .from('_otp')
        .update({ totp_secret: secret })
        .eq('id', userId);
      
      if (updateError) {
        console.error('Error updating user:', updateError);
        throw updateError;
      }
      
      return { secret, isNew: true };
    }
    
    return { secret: user.totp_secret, isNew: false };
  } catch (error) {
    console.error('Error in generateTotpForUser:', error);
    throw error;
  }
};

// Generate QR code for TOTP setup
const generateQrCode = async (user, secret) => {
  try {
    const serviceName = process.env.SERVICE_NAME || 'OTP Authentication';
    const otpauth = authenticator.keyuri(user.email || user.phone, serviceName, secret);
    
    const qrCodeDataUrl = await QRCode.toDataURL(otpauth);
    return qrCodeDataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
};

// Store OTP in Supabase
const storeOtp = async (userId, otp, channel) => {
  try {
    // Set expiration time (30 seconds from now)
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + 30);
    
    // Delete any existing OTPs for this user and channel
    const { error: deleteError } = await supabase
      .from('_otp_codes')
      .delete()
      .eq('user_id', userId)
      .eq('channel', channel);
    
    if (deleteError) {
      console.error('Error deleting existing OTPs:', deleteError);
      throw deleteError;
    }
    
    // Store new OTP
    const { data, error } = await supabase
      .from('_otp_codes')
      .insert([
        { 
          user_id: userId, 
          code: otp, 
          channel, 
          expires_at: expiresAt.toISOString(),
          attempts: 0
        }
      ])
      .select();
    
    if (error) {
      console.error('Error storing OTP:', error);
      throw error;
    }
    
    return data[0];
  } catch (error) {
    console.error('Error in storeOtp:', error);
    throw error;
  }
};

// Enable TOTP for a user
app.post('/api/totp/enable', validateRequestBody(totpEnableSchema), async (req, res) => {
  const { userId, code } = req.body;
  
  try {
    // Get user's TOTP secret
    const { data: user, error } = await supabase
      .from('_otp')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error retrieving user:', error);
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (!user.totp_secret) {
      return res.status(400).json({ error: 'TOTP not set up for this user' });
    }
    
    // If code is provided, verify it before enabling TOTP
    if (code) {
      const isValid = authenticator.verify({
        token: code,
        secret: user.totp_secret
      });
      
      if (!isValid) {
        // Increment failed attempts
        const { error: updateError } = await supabase
          .from('_otp')
          .update({ 
            failed_attempts: user.failed_attempts + 1,
            last_failed_attempt: new Date().toISOString()
          })
          .eq('id', userId);
          
        if (updateError) {
          console.error('Error updating failed attempts:', updateError);
        }
        
        return res.status(401).json({ error: 'Invalid verification code' });
      }
    }
    
    // Enable TOTP for the user
    const { error: updateError } = await supabase
      .from('_otp')
      .update({ 
        totp_enabled: true,
        failed_attempts: 0,
        last_failed_attempt: null
      })
      .eq('id', userId);
    
    if (updateError) {
      console.error('Error updating user:', updateError);
      return res.status(500).json({ error: 'Failed to enable TOTP' });
    }
    
    res.json({ 
      success: true, 
      message: 'TOTP enabled successfully'
    });
  } catch (error) {
    console.error('Error enabling TOTP:', error);
    res.status(500).json({ error: 'Failed to enable TOTP' });
  }
});

// Disable TOTP for a user
app.post('/api/totp/disable', validateRequestBody(totpEnableSchema), async (req, res) => {
  const { userId, code } = req.body;
  
  try {
    // Get user's TOTP secret
    const { data: user, error } = await supabase
      .from('_otp')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error retrieving user:', error);
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (!user.totp_enabled) {
      return res.status(400).json({ error: 'TOTP is not enabled for this user' });
    }
    
    // Verify code before disabling TOTP
    const isValid = authenticator.verify({
      token: code,
      secret: user.totp_secret
    });
    
    if (!isValid) {
      // Increment failed attempts
      const { error: updateError } = await supabase
        .from('_otp')
        .update({ 
          failed_attempts: user.failed_attempts + 1,
          last_failed_attempt: new Date().toISOString()
        })
        .eq('id', userId);
        
      if (updateError) {
        console.error('Error updating failed attempts:', updateError);
      }
      
      return res.status(401).json({ error: 'Invalid verification code' });
    }
    
    // Disable TOTP for the user
    const { error: updateError } = await supabase
      .from('_otp')
      .update({ 
        totp_enabled: false,
        failed_attempts: 0,
        last_failed_attempt: null
      })
      .eq('id', userId);
    
    if (updateError) {
      console.error('Error updating user:', updateError);
      return res.status(500).json({ error: 'Failed to disable TOTP' });
    }
    
    res.json({ 
      success: true, 
      message: 'TOTP disabled successfully'
    });
  } catch (error) {
    console.error('Error disabling TOTP:', error);
    res.status(500).json({ error: 'Failed to disable TOTP' });
  }
});

// Setup TOTP for a user
app.post('/api/totp/setup', validateRequestBody(totpSetupSchema), async (req, res) => {
  const { userId } = req.body;
  
  try {
    // Get user
    const { data: user, error } = await supabase
      .from('_otp')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error retrieving user:', error);
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Generate or retrieve TOTP secret
    const { secret, isNew } = await generateTotpForUser(userId);
    
    // Generate QR code
    const qrCode = await generateQrCode(user, secret);
    
    res.json({ 
      success: true, 
      secret,
      qrCode,
      isNew
    });
  } catch (error) {
    console.error('Error setting up TOTP:', error);
    res.status(500).json({ error: 'Failed to set up TOTP' });
  }
});

// Generate OTP for a user
app.post('/api/generate-otp', validateRequestBody(generateOtpSchema), async (req, res) => {
  const { name, userId, channel, phoneNumber, email } = req.body;
  
  try {
    // For TOTP channel, handle differently
    if (channel === 'totp') {
      if (!userId) {
        return res.status(400).json({ error: 'User ID is required for TOTP' });
      }
      
      // Get user
      const { data: user, error } = await supabase
        .from('_otp')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error retrieving user:', error);
        return res.status(404).json({ error: 'User not found' });
      }
      
      if (!user.totp_enabled) {
        return res.status(400).json({ error: 'TOTP is not enabled for this user' });
      }
      
      // For TOTP, we don't actually generate or send a code
      // The user will generate it using their authenticator app
      return res.json({ 
        message: 'TOTP authentication initiated',
        userId: user.id,
        channel: 'totp'
      });
    }
    
    // For other channels, proceed as before
    let user;
    
    if (userId) {
      // Get existing user by ID
      const { data, error } = await supabase
        .from('_otp')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error retrieving user:', error);
        return res.status(404).json({ error: 'User not found' });
      }
      
      user = data;
      
      // Update user info if provided
      if (name || phoneNumber || email) {
        const updates = {};
        if (name) updates.name = name;
        if (phoneNumber) updates.phone = phoneNumber;
        if (email) updates.email = email;
        
        const { error: updateError } = await supabase
          .from('_otp')
          .update(updates)
          .eq('id', userId);
        
        if (updateError) {
          console.error('Error updating user:', updateError);
          return res.status(500).json({ error: 'Failed to update user information' });
        }
      }
    } else {
      // Create or find user by phone/email
      user = await findOrCreateUser(name, phoneNumber, email, channel);
    }
    
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
      
      // Reset failed attempts if lockout period has passed
      const { error: resetError } = await supabase
        .from('_otp')
        .update({ failed_attempts: 0 })
        .eq('id', user.id);
        
      if (resetError) {
        console.error('Error resetting failed attempts:', resetError);
      }
    }
    
    // Generate a 6-digit OTP
    authenticator.options = { digits: 6 };
    const otp = authenticator.generate(user.totp_secret || authenticator.generateSecret());
    
    // Store OTP in database
    await storeOtp(user.id, otp, channel);
    
    let sendSuccess = false;
    
    // Send OTP via the selected channel
    switch (channel) {
      case 'sms':
        if (!user.phone) {
          return res.status(400).json({ error: 'Phone number is required for SMS channel' });
        }
        sendSuccess = await sendSmsOtp(user.phone, otp);
        break;
        
      case 'email':
        if (!user.email) {
          return res.status(400).json({ error: 'Email is required for email channel' });
        }
        sendSuccess = await sendEmailOtp(user.email, otp);
        break;
        
      case 'call':
        if (!user.phone) {
          return res.status(400).json({ error: 'Phone number is required for voice channel' });
        }
        sendSuccess = await makeVoiceCallOtp(user.phone, otp);
        break;
        
      case 'whatsapp':
        // In a real implementation, you would integrate with WhatsApp Business API
        // For this demo, we'll simulate success
        sendSuccess = true;
        break;
    }
    
    if (!sendSuccess) {
      return res.status(500).json({ error: `Failed to send OTP via ${channel}` });
    }
    
    // In a real implementation, never return OTPs directly
    // For this demo, we return it for testing purposes
    res.json({ 
      message: `OTP generated and sent via ${channel}`,
      userId: user.id,
      // Only for demo purposes - remove in production
      otp: process.env.NODE_ENV === 'development' ? otp : undefined
    });
  } catch (error) {
    console.error('Error generating OTP:', error);
    res.status(500).json({ error: 'Failed to generate OTP' });
  }
});

// Verify OTP
app.post('/api/verify-otp', validateRequestBody(verifyOtpSchema), async (req, res) => {
  const { userId, otp, channel } = req.body;
  
  try {
    // Get user data
    const { data: user, error } = await supabase
      .from('_otp')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error retrieving user:', error);
      return res.status(404).json({ error: 'User not found' });
    }
    
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
    
    let isValid = false;
    
    // For TOTP channel, verify using TOTP algorithm
    if (channel === 'totp') {
      if (!user.totp_enabled) {
        return res.status(400).json({ error: 'TOTP is not enabled for this user' });
      }
      
      isValid = authenticator.verify({
        token: otp,
        secret: user.totp_secret
      });
    } else {
      // For other channels, get the stored OTP
      const { data: otpData, error: otpError } = await supabase
        .from('_otp_codes')
        .select('*')
        .eq('user_id', userId)
        .eq('channel', channel)
        .single();
      
      if (otpError) {
        console.error('Error retrieving OTP:', otpError);
        return res.status(404).json({ error: 'No OTP found for this user and channel' });
      }
      
      // Check if OTP is expired
      if (new Date() > new Date(otpData.expires_at)) {
        // Delete expired OTP
        await supabase
          .from('_otp_codes')
          .delete()
          .eq('id', otpData.id);
          
        return res.status(401).json({ error: 'OTP expired' });
      }
      
      // Increment attempt counter
      const { error: updateError } = await supabase
        .from('_otp_codes')
        .update({ attempts: otpData.attempts + 1 })
        .eq('id', otpData.id);
      
      if (updateError) {
        console.error('Error updating OTP attempts:', updateError);
      }
      
      // Check max attempts (3)
      if (otpData.attempts >= 3) {
        // Delete OTP after max attempts
        await supabase
          .from('_otp_codes')
          .delete()
          .eq('id', otpData.id);
          
        // Update user's failed attempts
        await supabase
          .from('_otp')
          .update({ 
            failed_attempts: user.failed_attempts + 1,
            last_failed_attempt: new Date().toISOString()
          })
          .eq('id', userId);
          
        return res.status(401).json({ error: 'Maximum attempts exceeded' });
      }
      
      // Verify OTP
      isValid = otpData.code === otp;
      
      // If valid, delete the used OTP
      if (isValid) {
        await supabase
          .from('_otp_codes')
          .delete()
          .eq('id', otpData.id);
      }
    }
    
    if (!isValid) {
      // Update user's failed attempts
      await supabase
        .from('_otp')
        .update({ 
          failed_attempts: user.failed_attempts + 1,
          last_failed_attempt: new Date().toISOString()
        })
        .eq('id', userId);
        
      return res.status(401).json({ error: 'Invalid OTP' });
    }
    
    // Reset failed attempts on successful verification
    await supabase
      .from('_otp')
      .update({ 
        failed_attempts: 0,
        last_failed_attempt: null
      })
      .eq('id', userId);
    
    // Mark channel as verified
    const verificationUpdate = {};
    if (channel === 'sms') verificationUpdate.sms_verified = true;
    if (channel === 'email') verificationUpdate.email_verified = true;
    if (channel === 'call') verificationUpdate.call_verified = true;
    if (channel === 'whatsapp') verificationUpdate.whatsapp_verified = true;
    if (channel === 'totp') verificationUpdate.totp_verified = true;
    
    const { error: verificationError } = await supabase
      .from('_otp_verification')
      .update(verificationUpdate)
      .eq('user_id', userId);
    
    if (verificationError) {
      console.error('Error updating verification status:', verificationError);
      return res.status(500).json({ error: 'Failed to update verification status' });
    }
    
    // Get updated verification status
    const { data: verification, error: getVerificationError } = await supabase
      .from('_otp_verification')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (getVerificationError) {
      console.error('Error getting verification status:', getVerificationError);
      return res.status(500).json({ error: 'Failed to get verification status' });
    }
    
    // Count verified channels
    const verifiedChannels = [
      verification.sms_verified,
      verification.email_verified,
      verification.call_verified,
      verification.whatsapp_verified,
      verification.totp_verified
    ].filter(Boolean).length;
    
    // Generate a token if at least 2 channels are verified
    let token = null;
    if (verifiedChannels >= 2) {
      token = jwt.sign({ 
        userId, 
        verified: true,
        verifiedChannels,
        name: user.name,
        phone: user.phone,
        email: user.email
      }, JWT_SECRET, { expiresIn: '7d' });
    }
    
    res.json({ 
      success: true, 
      message: `${channel} verified successfully`,
      fullyVerified: verifiedChannels >= 2,
      verifiedChannels,
      token
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
});

// Webhook for n8n integration
app.post('/api/webhook/n8n', async (req, res) => {
  const { action, name, userId, channel, phoneNumber, email } = req.body;
  
  if (!action) {
    return res.status(400).json({ error: 'Action is required' });
  }
  
  try {
    // Handle different actions from n8n
    switch (action) {
      case 'initiate_verification': {
        // Find or create user
        let user;
        
        if (userId) {
          // Get existing user
          const { data, error } = await supabase
            .from('_otp')
            .select('*')
            .eq('id', userId)
            .single();
          
          if (error) {
            console.error('Error retrieving user:', error);
            return res.status(404).json({ error: 'User not found' });
          }
          
          user = data;
        } else {
          // Create or find user
          user = await findOrCreateUser(name, phoneNumber, email, channel);
        }
        
        // For TOTP channel, handle differently
        if (channel === 'totp') {
          if (!user.totp_enabled) {
            return res.status(400).json({ error: 'TOTP is not enabled for this user' });
          }
          
          return res.json({
            success: true,
            userId: user.id,
            channel: 'totp'
          });
        }
        
        // Generate OTP
        authenticator.options = { digits: 6 };
        const otp = authenticator.generate(user.totp_secret || authenticator.generateSecret());
        
        // Store OTP
        await storeOtp(user.id, otp, channel);
        
        // Send OTP via the selected channel
        let sendSuccess = false;
        switch (channel) {
          case 'sms':
            sendSuccess = await sendSmsOtp(user.phone, otp);
            break;
          case 'email':
            sendSuccess = await sendEmailOtp(user.email, otp);
            break;
          case 'call':
            sendSuccess = await makeVoiceCallOtp(user.phone, otp);
            break;
          case 'whatsapp':
            // Simulate success for demo
            sendSuccess = true;
            break;
        }
        
        if (!sendSuccess) {
          return res.status(500).json({ error: `Failed to send OTP via ${channel}` });
        }
        
        res.json({
          success: true,
          userId: user.id,
          channel,
          // Only for demo - remove in production
          otp: process.env.NODE_ENV === 'development' ? otp : undefined
        });
        break;
      }
        
      case 'check_verification_status': {
        if (!userId) {
          return res.status(400).json({ error: 'User ID is required' });
        }
        
        // Get verification status
        const { data: verification, error } = await supabase
          .from('_otp_verification')
          .select('*')
          .eq('user_id', userId)
          .single();
        
        if (error) {
          console.error('Error retrieving verification status:', error);
          return res.status(404).json({ error: 'Verification status not found' });
        }
        
        // Count verified channels
        const verifiedChannels = [
          verification.sms_verified,
          verification.email_verified,
          verification.call_verified,
          verification.whatsapp_verified,
          verification.totp_verified
        ].filter(Boolean).length;
        
        res.json({
          userId,
          verified: {
            sms: verification.sms_verified,
            email: verification.email_verified,
            call: verification.call_verified,
            whatsapp: verification.whatsapp_verified,
            totp: verification.totp_verified
          },
          fullyVerified: verifiedChannels >= 2,
          verifiedChannels
        });
        break;
      }
        
      default:
        res.status(400).json({ error: 'Unknown action' });
    }
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Failed to process webhook' });
  }
});

// Get n8n webhook URL
app.get('/api/webhook-url', (req, res) => {
  // In production, this would be your actual server URL
  const baseUrl = process.env.BASE_URL || `http://localhost:${PORT}`;
  res.json({
    webhookUrl: `${baseUrl}/api/webhook/n8n`
  });
});

// Get available channels
app.get('/api/channels', (req, res) => {
  res.json({
    channels: [
      { id: 'sms', name: 'SMS', provider: 'ClickSend', available: !!process.env.CLICKSEND_API_KEY },
      { id: 'email', name: 'Email', provider: 'SMTP', available: !!process.env.SMTP_USER },
      { id: 'call', name: 'Voice Call', provider: 'Vapi.ai', available: !!process.env.VAPI_API_KEY },
      { id: 'whatsapp', name: 'WhatsApp', provider: 'WhatsApp Business API', available: true },
      { id: 'totp', name: 'Authenticator App', provider: 'TOTP', available: true }
    ]
  });
});

// Get user by ID
app.get('/api/users/:userId', async (req, res) => {
  const { userId } = req.params;
  
  try {
    // Get user data
    const { data: user, error } = await supabase
      .from('_otp')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error retrieving user:', error);
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Get verification status
    const { data: verification, error: verificationError } = await supabase
      .from('_otp_verification')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (verificationError) {
      console.error('Error retrieving verification status:', verificationError);
      return res.status(404).json({ error: 'Verification status not found' });
    }
    
    res.json({
      id: user.id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      authentication_by: user.authentication_by,
      last_login: user.last_login,
      created_at: user.created_at,
      totp_enabled: user.totp_enabled,
      verified: {
        sms: verification.sms_verified,
        email: verification.email_verified,
        call: verification.call_verified,
        whatsapp: verification.whatsapp_verified,
        totp: verification.totp_verified
      }
    });
  } catch (error) {
    console.error('Error retrieving user:', error);
    res.status(500).json({ error: 'Failed to retrieve user' });
  }
});

// Cleanup expired OTPs
const cleanupExpiredOtps = async () => {
  try {
    const now = new Date().toISOString();
    
    // Delete expired OTPs
    const { error } = await supabase
      .from('_otp_codes')
      .delete()
      .lt('expires_at', now);
    
    if (error) {
      console.error('Error cleaning up expired OTPs:', error);
    }
  } catch (error) {
    console.error('Error in OTP cleanup:', error);
  }
};

// Run cleanup task every 5 minutes
setInterval(async () => {
  try {
    await cleanupExpiredOtps();
  } catch (error) {
    console.error('Error in scheduled cleanup:', error);
  }
}, 5 * 60 * 1000);

app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});