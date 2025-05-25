import { useState } from 'react';
import { toast } from 'react-hot-toast';

interface EmailConfirmationProps {
  orderId: string;
  userEmail: string;
}

export default function EmailConfirmation({ orderId, userEmail }: EmailConfirmationProps) {
  const [emailSent, setEmailSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const sendConfirmationEmail = () => {
    setLoading(true);
    setTimeout(() => {
      setEmailSent(true);
      setLoading(false);
      toast.success('Confirmation email sent!');
    }, 1000);
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