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
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = '_otp' AND column_name = 'failed_attempts'
  ) THEN
    ALTER TABLE _otp ADD COLUMN failed_attempts INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = '_otp' AND column_name = 'last_failed_attempt'
  ) THEN
    ALTER TABLE _otp ADD COLUMN last_failed_attempt TIMESTAMPTZ;
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