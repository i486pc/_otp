import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Smartphone, Mail, Phone, MessageSquare, CheckCircle, ArrowRight, Lock } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-indigo-600 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold flex items-center">
            <Shield className="mr-3 h-8 w-8" />
            OTP Authentication System
          </h1>
          <div className="flex space-x-4">
            <Link 
              to="/login"
              className="px-4 py-2 bg-white text-indigo-600 rounded-md font-medium hover:bg-indigo-50 transition-colors"
            >
              Login
            </Link>
            <Link 
              to="/saas-home"
              className="px-4 py-2 bg-indigo-700 text-white rounded-md font-medium hover:bg-indigo-800 transition-colors"
            >
              SaaS Platform
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Multi-Channel OTP Authentication
            </h2>
            <p className="text-xl text-gray-700 mb-8">
              Secure your applications with our advanced multi-channel OTP authentication system. Support for SMS, Email, Voice Calls, WhatsApp, and Authenticator Apps.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link 
                to="/login" 
                className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
              >
                Try Demo
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link 
                to="/saas-home" 
                className="px-6 py-3 bg-white text-indigo-600 font-medium rounded-lg border border-indigo-200 hover:bg-indigo-50 transition-colors"
              >
                View SaaS Platform
              </Link>
            </div>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-xl">
            <div className="flex justify-center mb-6">
              <Shield className="h-16 w-16 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold text-center mb-6">Available Authentication Channels</h3>
            <div className="space-y-4">
              <div className="flex items-center p-4 bg-indigo-50 rounded-lg">
                <Smartphone className="h-6 w-6 text-indigo-600 mr-3" />
                <span className="font-medium">SMS Authentication</span>
                <CheckCircle className="h-5 w-5 text-green-500 ml-auto" />
              </div>
              <div className="flex items-center p-4 bg-indigo-50 rounded-lg">
                <Mail className="h-6 w-6 text-indigo-600 mr-3" />
                <span className="font-medium">Email Authentication</span>
                <CheckCircle className="h-5 w-5 text-green-500 ml-auto" />
              </div>
              <div className="flex items-center p-4 bg-indigo-50 rounded-lg">
                <MessageSquare className="h-6 w-6 text-indigo-600 mr-3" />
                <span className="font-medium">WhatsApp Authentication</span>
                <CheckCircle className="h-5 w-5 text-green-500 ml-auto" />
              </div>
              <div className="flex items-center p-4 bg-indigo-50 rounded-lg">
                <Phone className="h-6 w-6 text-indigo-600 mr-3" />
                <span className="font-medium">Voice Call Authentication</span>
                <CheckCircle className="h-5 w-5 text-green-500 ml-auto" />
              </div>
              <div className="flex items-center p-4 bg-indigo-50 rounded-lg">
                <Lock className="h-6 w-6 text-indigo-600 mr-3" />
                <span className="font-medium">TOTP Authenticator Apps</span>
                <CheckCircle className="h-5 w-5 text-green-500 ml-auto" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 border rounded-lg">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Multi-Factor Authentication</h3>
              <p className="text-gray-600">
                Enhance security by requiring verification through multiple channels. Combine SMS, Email, WhatsApp, Voice Calls, and TOTP for maximum protection.
              </p>
            </div>
            <div className="p-6 border rounded-lg">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                <Smartphone className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Multiple Channels</h3>
              <p className="text-gray-600">
                Provide flexibility for your users by offering multiple authentication channels. Let them choose their preferred method for receiving verification codes.
              </p>
            </div>
            <div className="p-6 border rounded-lg">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                <Lock className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Advanced Security</h3>
              <p className="text-gray-600">
                Protect against brute force attacks with rate limiting, account lockout, and OTP expiration. All communications are encrypted and secure.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-indigo-200"></div>
          
          {/* Step 1 */}
          <div className="relative mb-12">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-indigo-600 text-white w-10 h-10 rounded-full flex items-center justify-center z-10">
                1
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md max-w-xl mx-auto">
              <h3 className="text-xl font-semibold mb-2">User Requests Authentication</h3>
              <p className="text-gray-600">
                The user initiates the authentication process by providing their phone number, email, or other identifier.
              </p>
            </div>
          </div>
          
          {/* Step 2 */}
          <div className="relative mb-12">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-indigo-600 text-white w-10 h-10 rounded-full flex items-center justify-center z-10">
                2
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md max-w-xl mx-auto">
              <h3 className="text-xl font-semibold mb-2">OTP Generation</h3>
              <p className="text-gray-600">
                The system generates a secure one-time password (OTP) and sends it to the user through their chosen channel (SMS, Email, WhatsApp, Voice Call).
              </p>
            </div>
          </div>
          
          {/* Step 3 */}
          <div className="relative mb-12">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-indigo-600 text-white w-10 h-10 rounded-full flex items-center justify-center z-10">
                3
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md max-w-xl mx-auto">
              <h3 className="text-xl font-semibold mb-2">User Verification</h3>
              <p className="text-gray-600">
                The user receives the OTP and enters it into the application to verify their identity.
              </p>
            </div>
          </div>
          
          {/* Step 4 */}
          <div className="relative">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-indigo-600 text-white w-10 h-10 rounded-full flex items-center justify-center z-10">
                4
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md max-w-xl mx-auto">
              <h3 className="text-xl font-semibold mb-2">Authentication Complete</h3>
              <p className="text-gray-600">
                Upon successful verification, the user is authenticated and granted access to the protected resource or service.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-indigo-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Secure Your Application?</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Try our multi-channel OTP authentication system today and provide your users with a secure and flexible authentication experience.
          </p>
          <div className="flex justify-center space-x-4">
            <Link 
              to="/login" 
              className="px-6 py-3 bg-white text-indigo-600 font-medium rounded-lg hover:bg-indigo-50 transition-colors"
            >
              Try Demo
            </Link>
            <Link 
              to="/saas-home" 
              className="px-6 py-3 bg-indigo-700 text-white font-medium rounded-lg border border-indigo-500 hover:bg-indigo-800 transition-colors"
            >
              View SaaS Platform
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-8 md:mb-0">
              <div className="flex items-center">
                <Shield className="h-8 w-8 text-indigo-400 mr-2" />
                <span className="text-xl font-bold">OTP Authentication System</span>
              </div>
              <p className="mt-4 text-gray-400 max-w-md">
                A comprehensive multi-channel OTP authentication system for securing your applications and protecting your users.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Features</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-white">SMS Authentication</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">Email Authentication</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">WhatsApp Authentication</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">Voice Call Authentication</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">TOTP Authentication</a></li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Resources</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-white">Documentation</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">API Reference</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">SDKs</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">Integrations</a></li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Company</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-white">About Us</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">Contact</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">Privacy Policy</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">Terms of Service</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-700 text-center text-gray-400">
            <p>&copy; 2025 OTP Authentication System. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;