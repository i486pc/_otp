import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Smartphone, Mail, Phone, MessageSquare, Loader, User, Shield } from 'lucide-react';
import { generateOtp, getAvailableChannels } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { Channel } from '../types';

const Login: React.FC = () => {
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<string>('sms');
  const [isLoadingChannels, setIsLoadingChannels] = useState(true);
  
  const navigate = useNavigate();
  const { login } = useAuth();
  
  // Fetch available channels
  useEffect(() => {
    const fetchChannels = async () => {
      try {
        setIsLoadingChannels(true);
        const availableChannels = await getAvailableChannels();
        setChannels(availableChannels);
        
        // Set default channel to the first available one
        if (availableChannels.length > 0) {
          const firstAvailable = availableChannels.find( c => c.available);
          if (firstAvailable) {
            setSelectedChannel(firstAvailable.id);
          }
        }
      } catch (error) {
        console.error('Error fetching channels:', error);
        setError('Failed to load available verification methods.');
      } finally {
        setIsLoadingChannels(false);
      }
    };
    
    fetchChannels();
  }, []);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber && (selectedChannel === 'sms' || selectedChannel === 'voice' || selectedChannel === 'whatsapp')) {
      setError('Phone number is required for the selected verification method');
      return;
    }
    
    if (!email && selectedChannel === 'email') {
      setError('Email is required for email verification');
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      
      // Generate OTP for selected channel
      const response = await generateOtp(
        name,
        userId,
        selectedChannel as any, 
        phoneNumber, 
        email
      );
      
      // Store user information for verification
      const userData = {
        id: response.userId,
        name,
        phoneNumber,
        email,
        verified: {
          whatsapp: false,
          sms: false,
          email: false,
          voice: false,
          totp: false
        }
      };
      
      // Temporarily store for verification process
      localStorage.setItem('temp_user', JSON.stringify(userData));
      
      // Redirect to verification page
      navigate('/verify', { state: { userId: response.userId, channel: selectedChannel } });
    } catch (error: any) {
      console.error('Error generating OTP:', error);
      setError(error.response?.data?.error || 'Failed to generate verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const getChannelIcon = (channelId: string) => {
    switch (channelId) {
      case 'sms':
        return <Smartphone className="h-5 w-5" />;
      case 'email':
        return <Mail className="h-5 w-5" />;
      case 'voice':
      case 'call':
        return <Phone className="h-5 w-5" />;
      case 'whatsapp':
        return <MessageSquare className="h-5 w-5" />;
      case 'totp':
        return <Shield className="h-5 w-5" />;
      default:
        return <Smartphone className="h-5 w-5" />;
    }
  };
  
  if (isLoadingChannels) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader className="h-10 w-10 text-indigo-600 animate-spin" />
          <p className="mt-4 text-indigo-800">Loading verification methods...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl overflow-hidden max-w-md w-full">
        <div className="p-6 bg-indigo-600 text-white">
          <h2 className="text-2xl font-bold">Multi-Channel OTP Authentication</h2>
          <p className="mt-2">Choose your preferred verification method</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <div>
            <label htmlFor="name" className="block text-sm font- medium text-gray-700 mb-1">
              Your Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>
          
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Verification Method
            </label>
            <div className="grid grid-cols-2 gap-3">
              {channels.map(channel => (
                <button
                  key={channel.id}
                  type="button"
                  disabled={!channel.available}
                  onClick={() => setSelectedChannel(channel.id)}
                  className={`flex items-center justify-center p-3 rounded-md border ${
                    selectedChannel === channel.id 
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-700' 
                      : 'border-gray-300 text-gray-700'
                  } ${!channel.available ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                >
                  {getChannelIcon(channel.id)}
                  <span className="ml-2">{channel.name}</span>
                </button>
              ))}
            </div>
            <div className="text-xs text-gray-500">
              Provider: {channels.find(c => c.id === selectedChannel)?.provider || ''}
            </div>
          </div>
          
          {(selectedChannel === 'sms' || selectedChannel === 'voice' || selectedChannel === 'whatsapp') && (
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Smartphone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="phoneNumber"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Sending...' : 'Send Verification Code'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;