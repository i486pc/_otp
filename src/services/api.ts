import axios from 'axios';
import { OtpResponse, VerificationResponse, Channel, User, TotpSetupResponse } from '../types';
import { getUserById } from './supabase';

const API_URL = 'http://localhost:3000/api';

export const generateOtp = async (
  name: string | undefined,
  userId: string | undefined,
  channel: 'whatsapp' | 'sms' | 'email' | 'voice' | 'totp',
  phoneNumber?: string,
  email?: string
): Promise<OtpResponse> => {
  try {
    const response = await axios.post(`${API_URL}/generate-otp`, { 
      name,
      userId, 
      channel,
      phoneNumber,
      email
    });
    return response.data;
  } catch (error) {
    console.error('Error generating OTP:', error);
    throw error;
  }
};

export const verifyOtp = async (
  userId: string, 
  otp: string, 
  channel: 'whatsapp' | 'sms' | 'email' | 'voice' | 'totp'
): Promise<VerificationResponse> => {
  try {
    const response = await axios.post(`${API_URL}/verify-otp`, { userId, otp, channel });
    
    // If verification is successful and there's a token, store it
    if (response.data.success && response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
    }
    
    return response.data;
  } catch (error) {
    console.error('Error verifying OTP:', error);
    throw error;
  }
};

export const setupTotp = async (userId: string): Promise<TotpSetupResponse> => {
  try {
    const response = await axios.post(`${API_URL}/totp/setup`, { userId });
    return response.data;
  } catch (error) {
    console.error('Error setting up TOTP:', error);
    throw error;
  }
};

export const enableTotp = async (userId: string, code: string): Promise<{ success: boolean, message: string }> => {
  try {
    const response = await axios.post(`${API_URL}/totp/enable`, { userId, code });
    return response.data;
  } catch (error) {
    console.error('Error enabling TOTP:', error);
    throw error;
  }
};

export const disableTotp = async (userId: string, code: string): Promise<{ success: boolean, message: string }> => {
  try {
    const response = await axios.post(`${API_URL}/totp/disable`, { userId, code });
    return response.data;
  } catch (error) {
    console.error('Error disabling TOTP:', error);
    throw error;
  }
};

export const getWebhookUrl = async (): Promise<string> => {
  try {
    const response = await axios.get(`${API_URL}/webhook-url`);
    return response.data.webhookUrl;
  } catch (error) {
    console.error('Error getting webhook URL:', error);
    throw error;
  }
};

export const getAvailableChannels = async (): Promise<Channel[]> => {
  try {
    const response = await axios.get(`${API_URL}/channels`);
    return response.data.channels;
  } catch (error) {
    console.error('Error getting available channels:', error);
    throw error;
  }
};

export const getUserData = async (userId: string): Promise<User | null> => {
  try {
    // First try to get from Supabase directly
    const user = await getUserById(userId);
    if (user) return user;
    
    // Fallback to API
    const response = await axios.get(`${API_URL}/users/${userId}`);
    
    return {
      id: response.data.id,
      name: response.data.name,
      phoneNumber: response.data.phone,
      email: response.data.email,
      totp_enabled: response.data.totp_enabled,
      verified: {
        whatsapp: response.data.verified.whatsapp,
        sms: response.data.verified.sms,
        email: response.data.verified.email,
        voice: response.data.verified.call,
        totp: response.data.verified.totp
      }
    };
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};