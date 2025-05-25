import { useState } from 'react';
import { toast } from 'react-hot-toast';

export default function EmailConfirmation({ orderId, userEmail }) {
  const [emailSent, setEmailSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const sendConfirmationEmail = async () => {
    setLoading(true);
    
    try {
      // In a real app, this would call an API endpoint to send an email
      // For now, we'll just simulate a successful email send
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate success
      setEmailSent(true);
      toast.success('Confirmation email sent!');
    } catch (error) {
      console.error('Error sending confirmation email:', error);
      toast.error('Failed to send confirmation email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 text-center">
      {emailSent ? (
        <div className="text-green-600">
          <p className="mb-2">✓ Confirmation email sent!</p>
          <p className="text-sm text-gray-600">Check your inbox for order details.</p>
        </div>
      ) : (
        <button
          onClick={sendConfirmationEmail}
          disabled={loading}
          className={`btn-primary w-full ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {loading ? 'Sending...' : 'Send Confirmation Email'}
        </button>
      )}
    </div>
  );
}
