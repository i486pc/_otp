import React, { useState, useEffect } from 'react';
import { Copy, Check, AlertCircle } from 'lucide-react';
import OtpInput from './OtpInput';
import { setupTotp, enableTotp } from '../../services/api';

interface TotpSetupProps {
  userId: string;
  onComplete: () => void;
}

const TotpSetup: React.FC<TotpSetupProps> = ({ userId, onComplete }) => {
  const [secret, setSecret] = useState<string>('');
  const [qrCode, setQrCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [step, setStep] = useState<number>(1);
  const [copied, setCopied] = useState<boolean>(false);
  
  useEffect(() => {
    const fetchTotpSetup = async () => {
      try {
        setIsLoading(true);
        setError('');
        
        const response = await setupTotp(userId);
        
        if (response.success) {
          setSecret(response.secret);
          setQrCode(response.qrCode);
        } else {
          setError('Failed to set up TOTP');
        }
      } catch (error: any) {
        setError(error.response?.data?.error || 'Failed to set up TOTP');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTotpSetup();
  }, [userId]);
  
  const handleCopySecret = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleVerify = async (otp: string) => {
    try {
      setIsLoading(true);
      setError('');
      setSuccess('');
      
      const response = await enableTotp(userId, otp);
      
      if (response.success) {
        setSuccess('TOTP enabled successfully');
        setTimeout(() => {
          onComplete();
        }, 1500);
      } else {
        setError('Failed to verify code');
      }
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to verify code');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      {error && (
        <div className="flex items-center bg-red-50 text-red-600 p-3 rounded-md text-sm">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
          {error}
        </div>
      )}
      
      {success && (
        <div className="flex items-center bg-green-50 text-green-600 p-3 rounded-md text-sm">
          <Check className="h-5 w-5 mr-2 flex-shrink-0" />
          {success}
        </div>
      )}
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <>
          {step === 1 && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Step 1: Scan QR Code</h3>
              <p className="text-sm text-gray-600">
                Scan this QR code with your authenticator app (Google Authenticator, Microsoft Authenticator, Authy, etc.)
              </p>
              
              <div className="flex justify-center">
                <img src={qrCode} alt="TOTP QR Code" className="w-48 h-48" />
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Secret Key (if you can't scan the QR code)</p>
                    <p className="font-mono text-sm">{secret}</p>
                  </div>
                  <button
                    onClick={handleCopySecret}
                    className="p-2 text-indigo-600 hover:text-indigo-800 focus:outline-none"
                  >
                    {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              
              <button
                onClick={() => setStep(2)}
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
              >
                Next
              </button>
            </div>
          )}
          
          {step === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Step 2: Verify Code</h3>
              <p className="text-sm text-gray-600">
                Enter the 6-digit code from your authenticator app to verify and enable TOTP authentication.
              </p>
              
              <div className="py-4">
                <OtpInput onComplete={handleVerify} />
              </div>
              
              <div className="flex space-x-4">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => onComplete()}
                  className="flex-1 text-indigo-600 py-2 px-4 rounded-md hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
                >
                  Skip for now
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TotpSetup;