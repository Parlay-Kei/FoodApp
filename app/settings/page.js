"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'react-hot-toast';
import Navbar from '../../components/Navbar';

export default function Settings() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    receive_sms: false,
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    // Check if user is logged in
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Please login to access this page');
        router.push('/login');
        return;
      }
      
      setUser(user);
      
      // Fetch user profile
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load profile');
      } else if (data) {
        setFormData(prevData => ({
          ...prevData,
          email: user.email || '',
          phone: user.phone || data.phone || '',
          receive_sms: data.receive_sms || false
        }));
      }
      
      setLoading(false);
    }
    
    getUser();
  }, [router, supabase]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Update profile
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);
    
    try {
      // Update profile in Supabase
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          phone: formData.phone,
          receive_sms: formData.receive_sms
        })
        .eq('id', user.id);
        
      if (profileError) throw profileError;
      
      // Update email if changed
      if (formData.email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: formData.email
        });
        
        if (emailError) throw emailError;
        
        toast.success('Email update initiated. Please check your inbox for confirmation.');
      }
      
      // Update password if provided
      if (formData.new_password) {
        if (formData.new_password !== formData.confirm_password) {
          toast.error('New passwords do not match');
          return;
        }
        
        const { error: passwordError } = await supabase.auth.updateUser({
          password: formData.new_password
        });
        
        if (passwordError) throw passwordError;
        
        // Clear password fields
        setFormData({
          ...formData,
          current_password: '',
          new_password: '',
          confirm_password: ''
        });
        
        toast.success('Password updated successfully');
      }
      
      toast.success('Profile updated successfully');
      
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  // Delete account
  const handleDeleteAccount = async () => {
    try {
      setUpdating(true);
      
      // Delete user from Supabase Auth
      const { error } = await supabase.rpc('delete_user');
      
      if (error) throw error;
      
      // Sign out
      await supabase.auth.signOut();
      
      toast.success('Your account has been deleted');
      router.push('/');
      
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error(error.message || 'Failed to delete account');
    } finally {
      setUpdating(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-64">
          <p>Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Account Settings</h1>
        
        <div className="card p-6">
          <form onSubmit={handleUpdateProfile}>
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-4">Profile Information</h2>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="input-field"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <h2 className="text-lg font-semibold mb-4">Notification Preferences</h2>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="receive_sms"
                    name="receive_sms"
                    checked={formData.receive_sms}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <label htmlFor="receive_sms" className="ml-2 block text-sm text-gray-700">
                    Receive SMS notifications (order status updates, promotions)
                  </label>
                </div>
              </div>
              
              <div>
                <h2 className="text-lg font-semibold mb-4">Change Password</h2>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="new_password" className="block text-sm font-medium text-gray-700 mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      id="new_password"
                      name="new_password"
                      value={formData.new_password}
                      onChange={handleInputChange}
                      className="input-field"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      id="confirm_password"
                      name="confirm_password"
                      value={formData.confirm_password}
                      onChange={handleInputChange}
                      className="input-field"
                    />
                  </div>
                </div>
              </div>
              
              <div className="pt-4">
                <button
                  type="submit"
                  className="btn-primary w-full sm:w-auto"
                  disabled={updating}
                >
                  {updating ? 'Updating...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </form>
        </div>
        
        <div className="card p-6 mt-6">
          <h2 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h2>
          
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="border border-red-600 text-red-600 font-semibold py-2 px-4 rounded-lg hover:bg-red-50 transition duration-200"
              disabled={updating}
            >
              Delete Account
            </button>
          ) : (
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-sm text-red-600 mb-4">
                Are you sure you want to delete your account? This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={handleDeleteAccount}
                  className="bg-red-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-700 transition duration-200"
                  disabled={updating}
                >
                  {updating ? 'Deleting...' : 'Yes, Delete My Account'}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 transition duration-200"
                  disabled={updating}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
