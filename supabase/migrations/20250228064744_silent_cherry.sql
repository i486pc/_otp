/*
  # OTP Authentication Tables

  1. New Tables
    - `_otp`
      - `id` (uuid, primary key)
      - `name` (text)
      - `phone` (text)
      - `email` (text)
      - `authentication_by` (text, enum: 'sms', 'email', 'call')
      - `last_login` (timestamptz, default: now())
      - `created_at` (timestamptz, default: now())
    - `_otp_codes`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references _otp.id)
      - `code` (text)
      - `channel` (text, enum: 'sms', 'email', 'call', 'whatsapp')
      - `expires_at` (timestamptz)
      - `attempts` (integer, default: 0)
      - `created_at` (timestamptz, default: now())
    - `_otp_verification`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references _otp.id)
      - `sms_verified` (boolean, default: false)
      - `email_verified` (boolean, default: false)
      - `call_verified` (boolean, default: false)
      - `whatsapp_verified` (boolean, default: false)
      - `updated_at` (timestamptz, default: now())
  
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create _otp table
CREATE TABLE IF NOT EXISTS _otp (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  phone TEXT,
  email TEXT,
  authentication_by TEXT CHECK (authentication_by IN ('sms', 'email', 'call', 'whatsapp')),
  last_login TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create _otp_codes table
CREATE TABLE IF NOT EXISTS _otp_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES _otp(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  channel TEXT CHECK (channel IN ('sms', 'email', 'call', 'whatsapp')),
  expires_at TIMESTAMPTZ NOT NULL,
  attempts INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create _otp_verification table
CREATE TABLE IF NOT EXISTS _otp_verification (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES _otp(id) ON DELETE CASCADE,
  sms_verified BOOLEAN DEFAULT false,
  email_verified BOOLEAN DEFAULT false,
  call_verified BOOLEAN DEFAULT false,
  whatsapp_verified BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_otp_phone ON _otp(phone);
CREATE INDEX IF NOT EXISTS idx_otp_email ON _otp(email);
CREATE INDEX IF NOT EXISTS idx_otp_codes_user_id ON _otp_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_otp_codes_expires_at ON _otp_codes(expires_at);
CREATE INDEX IF NOT EXISTS idx_otp_verification_user_id ON _otp_verification(user_id);

-- Enable Row Level Security
ALTER TABLE _otp ENABLE ROW LEVEL SECURITY;
ALTER TABLE _otp_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE _otp_verification ENABLE ROW LEVEL SECURITY;

-- Create policies
-- For _otp table
CREATE POLICY "Service role can do all operations on _otp"
  ON _otp
  USING (true)
  WITH CHECK (true);

-- For _otp_codes table
CREATE POLICY "Service role can do all operations on _otp_codes"
  ON _otp_codes
  USING (true)
  WITH CHECK (true);

-- For _otp_verification table
CREATE POLICY "Service role can do all operations on _otp_verification"
  ON _otp_verification
  USING (true)
  WITH CHECK (true);

-- Create function to update last_login
CREATE OR REPLACE FUNCTION update_last_login()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_login = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update last_login on update
CREATE TRIGGER update_last_login_trigger
BEFORE UPDATE ON _otp
FOR EACH ROW
EXECUTE FUNCTION update_last_login();