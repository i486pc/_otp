import { createClient } from '@supabase/supabase-js';
import { authenticator } from 'otplib';
import nodemailer from 'nodemailer';
import ClickSend from 'clicksend';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Configure ClickSend for SMS
const clickSendConfig = {
  username: process.env.CLICKSEND_USERNAME,
  apiKey: process.env.CLICKSEND_API_KEY
};

// Configure email transporter
const emailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Configure TOTP options
authenticator.options = {
  digits: 6,
  step: 30
};

// Send OTP via SMS using ClickSend
const sendSmsOtp = async (phoneNumber: string, otp: string) => {
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

    await clicksendClient.smsSendPost(smsCollection);
    console.log('SMS sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending SMS:', error);
    return false;
  }
};

// Send OTP via Email
const sendEmailOtp = async (email: string, otp: string) => {
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
const makeVoiceCallOtp = async (phoneNumber: string, otp: string) => {
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

// Process OTP queue
const processOtpQueue = async () => {
  try {
    // Get pending OTPs from the queue
    const { data: pendingOtps, error } = await supabase
      .from('_otp_queue')
      .select('*')
      .eq('status', 'pending')
      .limit(10);

    if (error) {
      console.error('Error fetching pending OTPs:', error);
      return;
    }

    if (!pendingOtps || pendingOtps.length === 0) {
      return;
    }

    // Process each pending OTP
    for (const otpRequest of pendingOtps) {
      try {
        // Mark as processing
        await supabase
          .from('_otp_queue')
          .update({ status: 'processing', updated_at: new Date().toISOString() })
          .eq('id', otpRequest.id);

        let success = false;

        // Send OTP via the selected channel
        switch (otpRequest.channel) {
          case 'sms':
            success = await sendSmsOtp(otpRequest.phone_number, otpRequest.otp);
            break;
          case 'email':
            success = await sendEmailOtp(otpRequest.email, otpRequest.otp);
            break;
          case 'voice':
            success = await makeVoiceCallOtp(otpRequest.phone_number, otpRequest.otp);
            break;
          case 'whatsapp':
            // Implement WhatsApp sending logic
            success = true; // Placeholder
            break;
        }

        // Update status
        await supabase
          .from('_otp_queue')
          .update({
            status: success ? 'completed' : 'failed',
            updated_at: new Date().toISOString(),
            error: success ? null : 'Failed to send OTP'
          })
          .eq('id', otpRequest.id);

      } catch (error) {
        console.error(`Error processing OTP request ${otpRequest.id}:`, error);
        
        // Mark as failed
        await supabase
          .from('_otp_queue')
          .update({
            status: 'failed',
            updated_at: new Date().toISOString(),
            error: error.message
          })
          .eq('id', otpRequest.id);
      }
    }
  } catch (error) {
    console.error('Error in processOtpQueue:', error);
  }
};

// Start the worker
const startWorker = () => {
  console.log('Starting OTP worker...');
  
  // Process queue every 5 seconds
  setInterval(processOtpQueue, 5000);
  
  // Also process immediately on startup
  processOtpQueue();
};

startWorker();