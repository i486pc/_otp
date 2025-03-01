import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, AlertCircle, RefreshCw, Smartphone, Mail, Phone, MessageSquare, Shield } from 'lucide-react';
import OtpInput from '../components/AuthFlow/OtpInput';
import TotpSetup from '../components/AuthFlow/TotpSetup';
import { verifyOtp, generateOtp, getUserData } from '../services/api';
import { useAuth } from '../hooks/useAuth';

const Verify: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [userId, setUserId] = useState<string>('');
  const [channel, setChannel] = useState<'whatsapp' | 'sms' | 'email' | 'voice' | 'totp'>('sms');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [showTotpSetup, setShowTotpSetup] = useState(false);
  
  // Get data from navigation or localStorage
  useEffect(() => {
    const state = location.state as { userId: string; channel: 'whatsapp' | 'sms' | 'email' | 'voice' | 'totp' } | null;
    
    if (state?.userId) {
      setUserId(state.userId);
      setChannel(state.channel);
      
      // If channel is TOTP and it's a new setup, show the setup UI
      if (state.channel === 'totp') {
        setShowTotpSetup(true);
      }
    } else {
      // Try to get from localStorage
      const tempUser = localStorage.getItem('temp_user');
      if (tempUser) {
        const userData = JSON.parse(tempUser);
        setUserId(userData.id);
      } else {
        // Redirect to login if no data
        navigate('/login');
      }
    }
  }, [location, navigate]);
  
  // Manage countdown for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);
  
  const getChannelIcon = () => {
    switch (channel) {
      case 'sms':
        return <Smartphone className="h-6 w-6 text-indigo-600" />;
      case 'email':
        return <Mail className="h-6 w-6 text-indigo-600" />;
      case 'voice':
        return <Phone className="h-6 w-6 text-indigo-600" />;
      case 'whatsapp':
        return <MessageSquare className="h-6 w-6 text-indigo-600" />;
      case 'totp':
        return <Shield className="h-6 w-6 text-indigo-600" />;
      default:
        return <Smartphone className="h-6 w-6 text-indigo-600" />;
    }
  };
  
  const getChannelName = () => {
    switch (channel) {
      case 'sms':
        return 'SMS';
      case 'email':
        return 'Email';
      case 'voice':
        return 'Voice Call';
      case 'whatsapp':
        return 'WhatsApp';
      case 'totp':
        return 'Authenticator App';
      default:
        return 'SMS';
    }
  };
  
  const handleVerify = async (otp: string) => {
    if (!userId) return;
    
    try {
      setIsLoading(true);
      setError('');
      setSuccess('');
      
      const response = await verifyOtp(userId, otp, channel);
      
      if (response.success) {
        setSuccess(`${getChannelName()} verification completed successfully!`);
        
        // If fully verified (at least 2 channels), login
        if (response.fullyVerified) {
          // Get user data from API
          const userData = await getUserData(userId);
          
          if (userData) {
            // Login
            login(userData);
            
            // Clear temporary data
            localStorage.removeItem('temp_user');
            
            // Redirect to dashboard
            setTimeout(() => {
              navigate('/dashboard');
            }, 1500);
          } else {
            setError('Failed to retrieve user data');
          }
        } else {
          // Suggest verifying another channel
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        }
      }
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      setError(error.response?.data?.error || 'Failed to verify code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleResend = async () => {
    if (!userId || countdown > 0) return;
    
    try {
      setIsResending(true);
      setError('');
      
      // Get user data from localStorage for contact info
      const tempUser = localStorage.getItem('temp_user');
      let name, phoneNumber, email;
      
      if (tempUser) {
        const userData = JSON.parse(tempUser);
        name = userData.name;
        phoneNumber = userData.phoneNumber;
        email = userData.email;
      }
      
      await generateOtp(name, userId, channel as any, phoneNumber, email);
      
      setSuccess(`New code sent via ${getChannelName()}`);
      setCountdown(60); // 1 minute wait for resend
      
      // Clear success after a while
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (error: any) {
      console.error('Error resending OTP:', error);
      setError(error.response?.data?.error || 'Failed to resend code. Please try again.');
    } finally {
      setIsResending(false);
    }
  };
  
  const handleTotpSetupComplete = () => {
    setShowTotpSetup(false);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl overflow-hidden max-w-md w-full">
        <div className="p-6 bg-indigo-600 text-white">
          <h2 className="text-2xl font-bold">Verification Code</h2>
          <p className="mt-2">
            {showTotpSetup 
              ? 'Set up your authenticator app' 
              : `Enter the code ${channel === 'totp' ? 'from your authenticator app' : `sent via ${getChannelName()}`}`}
          </p>
        </div>
        
        <div className="p-6 space-y-6">
          {error && (
            <div className="flex items-center bg-red-50 text-red-600 p-3 rounded-md text-sm">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              {error}
            </div>
          )}
          
          {success && (
            <div className="flex items-center bg-green-50 text-green-600 p-3 rounded-md text-sm">
              <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              {success}
            </div>
          )}
          
          {!showTotpSetup && (
            <div className="flex justify-center mb-4">
              {getChannelIcon()}
            </div>
          )}
          
          {showTotpSetup ? (
            <TotpSetup userId={userId} onComplete={handleTotpSetupComplete} />
          ) : (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700 text-center">
                Enter verification code
              </label>
              
              <OtpInput onComplete={handleVerify} />
              
              {channel !== 'totp' && (
                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={isResending || countdown > 0}
                    className="text-indigo-600 text-sm hover:text-indigo-800 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto"
                  >
                    {isResending ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                        Resending...
                      </>
                    ) : countdown > 0 ? (
                      `Resend code in ${countdown}s`
                    ) : (
                      'Resend code'
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
          
          <div className="text-center text-sm text-gray-500 mt-4">
            <p>
              Verifying via: {getChannelName()}
            </p>
            <p className="mt-2">
              <button 
                onClick={() => navigate('/login')} 
                className="text-indigo-600 hover:text-indigo-800"
              >
                Try a different verification method
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Verify;