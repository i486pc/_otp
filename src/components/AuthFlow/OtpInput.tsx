import React, { useState, useRef, useEffect } from 'react';

interface OtpInputProps {
  length?: number;
  onComplete: (otp: string) => void;
}

const OtpInput: React.FC<OtpInputProps> = ({ length = 6, onComplete }) => {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  // Initialize refs
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length);
  }, [length]);
  
  // Focus on first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);
  
  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Allow only digits
    if (!/^\d*$/.test(value)) return;
    
    // Update the value in state
    const newOtp = [...otp];
    
    // Take only the last character if more than one is pasted
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    
    // If a value was entered and it's not the last input, focus on next
    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
    
    // Check if all fields are filled
    if (newOtp.every(v => v) && newOtp.length === length) {
      onComplete(newOtp.join(''));
    }
  };
  
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // If backspace is pressed and field is empty, focus on previous
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };
  
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').trim();
    
    // Check if pasted data is only digits
    if (!/^\d+$/.test(pastedData)) return;
    
    // Fill inputs with pasted digits
    const newOtp = [...otp];
    for (let i = 0; i < Math.min(length, pastedData.length); i++) {
      newOtp[i] = pastedData[i];
    }
    
    setOtp(newOtp);
    
    // Focus on next empty input or last if all filled
    const nextEmptyIndex = newOtp.findIndex(v => !v);
    if (nextEmptyIndex !== -1) {
      inputRefs.current[nextEmptyIndex]?.focus();
    } else {
      inputRefs.current[length - 1]?.focus();
    }
    
    // Check if all fields are filled
    if (newOtp.every(v => v) && newOtp.length === length) {
      onComplete(newOtp.join(''));
    }
  };
  
  return (
    <div className="flex justify-center space-x-2">
      {otp.map((digit, index) => (
        <input
          key={index}
          ref={el => inputRefs.current[index] = el}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={1}
          value={digit}
          onChange={e => handleChange(index, e)}
          onKeyDown={e => handleKeyDown(index, e)}
          onPaste={handlePaste}
          className="w-12 h-14 text-center text-xl font-bold border border-gray-300 rounded-md focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
        />
      ))}
    </div>
  );
};

export default OtpInput;