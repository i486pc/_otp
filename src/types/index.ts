export interface User {
  id: string;
  name?: string;
  phoneNumber?: string;
  email?: string;
  verified: {
    whatsapp: boolean;
    sms: boolean;
    email: boolean;
    voice: boolean;
    totp: boolean;
  };
  totp_enabled?: boolean;
}

export interface OtpResponse {
  message: string;
  userId: string;
  otp?: string; // Only for demo
}

export interface TotpSetupResponse {
  success: boolean;
  secret: string;
  qrCode: string;
  isNew: boolean;
}

export interface VerificationResponse {
  success: boolean;
  message: string;
  fullyVerified: boolean;
  verifiedChannels: number;
  token?: string;
}

export interface N8nWebhookPayload {
  action: 'initiate_verification' | 'check_verification_status';
  userId: string;
  channel: 'whatsapp' | 'sms' | 'email' | 'voice' | 'totp';
  phoneNumber?: string;
  email?: string;
}

export interface Channel {
  id: string;
  name: string;
  provider: string;
  available: boolean;
}

export interface VerificationStatus {
  sms: boolean;
  email: boolean;
  voice: boolean;
  whatsapp: boolean;
  totp: boolean;
}

export interface OtpUser {
  id: string;
  name?: string;
  phone?: string;
  email?: string;
  authentication_by?: string;
  last_login: string;
  created_at: string;
  totp_secret?: string;
  totp_enabled: boolean;
}

export interface OtpCode {
  id: string;
  user_id: string;
  code: string;
  channel: string;
  expires_at: string;
  attempts: number;
  created_at: string;
}

export interface OtpVerification {
  id: string;
  user_id: string;
  sms_verified: boolean;
  email_verified: boolean;
  call_verified: boolean;
  whatsapp_verified: boolean;
  totp_verified: boolean;
  updated_at: string;
}