/*
  # Add TOTP support to OTP authentication system

  1. Schema Updates
    - Add `totp_secret` column to `_otp` table
    - Add `totp_enabled` column to `_otp` table
    - Add `totp_verified` column to `_otp_verification` table
  
  2. Security
    - Maintain existing RLS policies
*/

-- Add TOTP columns to _otp table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = '_otp' AND column_name = 'totp_secret'
  ) THEN
    ALTER TABLE _otp ADD COLUMN totp_secret TEXT;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = '_otp' AND column_name = 'totp_enabled'
  ) THEN
    ALTER TABLE _otp ADD COLUMN totp_enabled BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Add TOTP verified column to _otp_verification table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = '_otp_verification' AND column_name = 'totp_verified'
  ) THEN
    ALTER TABLE _otp_verification ADD COLUMN totp_verified BOOLEAN DEFAULT false;
  END IF;
END $$;