import React, { useState } from 'react';
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { supabase } from '../config/supabase';

interface AdminPromotionProps {
  user: any;
  onClose: () => void;
}

export const AdminPromotion: React.FC<AdminPromotionProps> = ({ user, onClose }) => {
  const [adminKey, setAdminKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  // Add console log to verify component is rendered
  console.log('AdminPromotion component rendered', { user, showModal: true });

  const handlePromoteToAdmin = async () => {
    if (!adminKey) {
      setMessage('Please enter the admin key');
      return;
    }

    if (adminKey !== 'ADMIN2024') {
      setMessage('Invalid admin key. Contact system administrator.');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      // Update user's profile to admin
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          is_admin: true,
          role: 'admin',
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        });

      if (error) {
        console.error('Error promoting to admin:', error);
        setMessage('Failed to promote to admin. Please try again.');
        return;
      }

      setSuccess(true);
      setMessage('Successfully promoted to admin! Please refresh the page.');
      
      // Auto close after 3 seconds
      setTimeout(() => {
        onClose();
        window.location.reload(); // Refresh to update admin status
      }, 3000);
      
    } catch (error) {
      console.error('Network error:', error);
      setMessage('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 relative z-[10000]">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
            <Shield className="w-8 h-8 text-yellow-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Become an Admin
          </h2>
          <p className="text-gray-600 text-sm">
            Enter the admin secret key to upgrade your account
          </p>
        </div>

        {!success ? (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Secret Key
              </label>
              <input
                type="password"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                placeholder="Enter admin key..."
                disabled={isLoading}
              />
            </div>

            {message && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-red-700 text-sm">{message}</p>
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={handlePromoteToAdmin}
                disabled={isLoading || !adminKey}
                className="flex-1 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Promoting...' : 'Become Admin'}
              </button>
            </div>
          </>
        ) : (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Admin Promotion Successful!
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              {message}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};