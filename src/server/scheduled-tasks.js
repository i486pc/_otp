import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Cleanup expired OTPs
 * This function removes expired OTP codes from the database
 */
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

/**
 * Reset failed attempts for users
 * This function resets the failed login attempts counter after a certain period
 */
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

/**
 * Run all scheduled tasks
 */
export const runScheduledTasks = async () => {
  console.log('Running scheduled tasks...');
  
  // Run cleanup tasks
  await cleanupExpiredOtps();
  await resetFailedAttempts();
  
  console.log('Scheduled tasks completed');
};

// If this file is run directly, execute the tasks
if (import.meta.url === import.meta.main) {
  runScheduledTasks()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Error running scheduled tasks:', error);
      process.exit(1);
    });
}