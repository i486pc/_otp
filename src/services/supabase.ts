import { createClient } from '@supabase/supabase-js';
import { User, VerificationStatus } from '../types';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Make sure VITE_SUPABASE_URL and VITE_SUPABASE_KEY are set in your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Get user by ID
export const getUserById = async (userId: string): Promise<User | null> => {
  try {
    // Get user data
    const { data: user, error } = await supabase
      .from('_otp')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error retrieving user:', error);
      return null;
    }
    
    // Get verification status
    const { data: verification, error: verificationError } = await supabase
      .from('_otp_verification')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (verificationError) {
      console.error('Error retrieving verification status:', verificationError);
      return null;
    }
    
    return {
      id: user.id,
      name: user.name,
      phoneNumber: user.phone,
      email: user.email,
      verified: {
        whatsapp: verification.whatsapp_verified,
        sms: verification.sms_verified,
        email: verification.email_verified,
        voice: verification.call_verified
      }
    };
  } catch (error) {
    console.error('Error in getUserById:', error);
    return null;
  }
};

// Get verification status
export const getVerificationStatus = async (userId: string): Promise<VerificationStatus | null> => {
  try {
    const { data, error } = await supabase
      .from('_otp_verification')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      console.error('Error retrieving verification status:', error);
      return null;
    }
    
    return {
      sms: data.sms_verified,
      email: data.email_verified,
      voice: data.call_verified,
      whatsapp: data.whatsapp_verified
    };
  } catch (error) {
    console.error('Error in getVerificationStatus:', error);
    return null;
  }
};