import React, { useState } from 'react';
import { X, Lock, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '../config/supabase';

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match');
      setIsSuccess(false);
      return;
    }

    if (newPassword.length < 6) {
      setMessage('Password must be at least 6 characters');
      setIsSuccess(false);
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) {
        setMessage(error.message);
        setIsSuccess(false);
      } else {
        setMessage('Password updated successfully!');
        setIsSuccess(true);
        setTimeout(() => {
          handleClose();
          onSuccess();
        }, 2000);
      }
    } catch (error) {
      setMessage('Failed to update password. Please try again.');
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setNewPassword('');
    setConfirmPassword('');
    setMessage('');
    setIsSuccess(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 relative">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
            <Lock className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Reset Password</h2>
          <p className="text-gray-600 mt-2">
            Enter your new password below
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* New Password */}
          <div className="relative">
            <input
              type={showNewPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="New password"
              required
            />
            <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
            >
              {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Confirm new password"
              required
            />
            <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
            >
              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>

          {/* Password strength indicator */}
          {newPassword && (
            <div className="text-xs text-gray-600">
              Password strength: 
              <span className={`ml-2 font-semibold ${
                newPassword.length >= 8 ? 'text-green-600' : 
                newPassword.length >= 6 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {newPassword.length >= 8 ? 'Strong' : 
                 newPassword.length >= 6 ? 'Medium' : 'Weak'}
              </span>
            </div>
          )}

          {/* Message */}
          {message && (
            <div className={`flex items-center space-x-2 text-sm p-3 rounded-lg ${
              isSuccess 
                ? 'bg-green-50 text-green-700' 
                : 'bg-red-50 text-red-700'
            }`}>
              {isSuccess ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              <span>{message}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !newPassword || !confirmPassword}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                Updating...
              </div>
            ) : (
              'Update Password'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
