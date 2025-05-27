"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'react-hot-toast';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState('email'); // 'email' or 'phone'
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleEmailSignup = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    setLoading(true);
    
    try {
      // Log the redirect URL for debugging
      const redirectUrl = `${window.location.origin}/login`;
      console.log('Email redirect URL:', redirectUrl);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name: email.split('@')[0], // Use part of email as name
          }
        },
      });
      
      console.log('Signup response:', data);
      
      if (error) {
        console.error('Signup error:', error);
        toast.error(error.message);
      } else {
        // Create profile entry
        if (data?.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([
              { 
                id: data.user.id,
                email: data.user.email,
                is_admin: false
              }
            ]);
            
          if (profileError) {
            console.error('Error creating profile:', profileError);
          }
        }
        
        // Check if email confirmation is required
        if (data?.user?.identities?.length === 0) {
          toast.error('This email is already registered. Please log in or use a different email.');
        } else if (data?.user?.confirmed_at) {
          toast.success('Signup successful! You can now log in.');
          router.push('/login');
        } else {
          toast.success('Signup successful! Please check your email for the confirmation link.');
          toast.info('If you don\'t see the email, check your spam folder.');
          router.push('/login');
        }
      }
    } catch (error) {
      toast.error('An error occurred during signup');
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
      const { data, error } = await supabase.auth.verifyOtp({
        phone,
        token: otp,
        type: 'sms',
      });
      
      if (error) {
        toast.error(error.message);
      } else {
        // Create profile entry
        if (data?.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([
              { 
                id: data.user.id,
                phone: data.user.phone,
                is_admin: false
              }
            ]);
            
          if (profileError) {
            console.error('Error creating profile:', profileError);
          }
        }
        
        toast.success('Signup successful!');
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
        <h1 className="text-2xl font-bold text-center mb-6">Sign Up for Food Truck</h1>
        
        <div className="flex justify-center space-x-4 mb-6">
          <button 
            onClick={() => setMethod('email')} 
            className={`btn-outline ${method === 'email' ? 'btn-primary text-white' : ''}`}
          >
            Email
          </button>
          <button 
            onClick={() => setMethod('phone')} 
            className={`btn-outline ${method === 'phone' ? 'btn-primary text-white' : ''}`}
          >
            Phone
          </button>
        </div>
        
        {method === 'email' ? (
          <form onSubmit={handleEmailSignup} className="space-y-4">
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
                placeholder="Create a password"
                required
              />
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-field"
                placeholder="Confirm your password"
                required
              />
            </div>
            
            <button
              type="submit"
              className="btn-primary w-full"
              disabled={loading}
            >
              {loading ? 'Signing up...' : 'Sign Up'}
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
            Already have an account?{' '}
            <Link href="/login" className="text-primary font-semibold hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
