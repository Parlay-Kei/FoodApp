"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState('email'); // 'email' or 'phone'
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Logged in successfully!');
        router.push('/menu');
        router.refresh();
      }
    } catch (error) {
      toast.error('An error occurred during login');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone,
      });
      
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('OTP sent to your phone!');
        setOtpSent(true);
      }
    } catch (error) {
      toast.error('An error occurred while sending OTP');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.verifyOtp({
        phone,
        token: otp,
        type: 'sms',
      });
      
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Logged in successfully!');
        router.push('/menu');
        router.refresh();
      }
    } catch (error) {
      toast.error('An error occurred during verification');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Login to Food Truck</h1>
        
        <div className="flex justify-center space-x-4 mb-6">
          <button 
            onClick={() => setMethod('email')} 
            className={`px-4 py-2 rounded-full ${method === 'email' ? 'bg-primary text-white' : 'bg-gray-200'}`}
          >
            Email
          </button>
          <button 
            onClick={() => setMethod('phone')} 
            className={`px-4 py-2 rounded-full ${method === 'phone' ? 'bg-primary text-white' : 'bg-gray-200'}`}
          >
            Phone
          </button>
        </div>
        
        {method === 'email' ? (
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="Enter your email"
                required
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="Enter your password"
                required
              />
            </div>
            
            <button
              type="submit"
              className="btn-primary w-full"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            {!otpSent ? (
              <form onSubmit={handleSendOTP}>
                <div className="mb-4">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="input-field"
                    placeholder="Enter your phone number with country code"
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  className="btn-primary w-full"
                  disabled={loading}
                >
                  {loading ? 'Sending...' : 'Send OTP'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTP}>
                <div className="mb-4">
                  <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
                    One-Time Password
                  </label>
                  <input
                    id="otp"
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="input-field"
                    placeholder="Enter the OTP sent to your phone"
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  className="btn-primary w-full mb-2"
                  disabled={loading}
                >
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>
                
                <button
                  type="button"
                  onClick={() => setOtpSent(false)}
                  className="btn-outline w-full"
                >
                  Back to Phone Entry
                </button>
              </form>
            )}
          </div>
        )}
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link href="/signup" className="text-primary font-semibold hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
