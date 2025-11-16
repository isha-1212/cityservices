import React, { useState, useEffect } from 'react';
import { User, Pencil, Save, X } from 'lucide-react';
import { supabase } from '../config/supabase';
import { CustomSelect } from './CustomSelect.tsx';
import { AdminPromotion } from './AdminPromotion';

interface ProfileProps {
  user: {
    id?: string;
    name?: string;
    email?: string;
    phone?: string;
    city?: string;
    profession?: string;
  } | null;
  onAuthRequired: () => void;
}

// Separate ProfileTab component to prevent re-creation
interface ProfileTabProps {
  profileData: {
    name: string;
    email: string;
    phone: string;
    city: string;
    profession: string;
  };
  onNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPhoneChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCityChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onProfessionChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSave: () => void;
  isEditing: boolean;
  onToggleEdit: () => void;
  isLoading: boolean;
  message: string;
  isAdmin: boolean;
  onBecomeAdmin: () => void;
}

const ProfileTab: React.FC<ProfileTabProps> = ({
  profileData,
  onNameChange,
  onEmailChange,
  onPhoneChange,
  onCityChange,
  onProfessionChange,
  onSave,
  isEditing,
  onToggleEdit,
  isLoading,
  message,
  isAdmin,
  onBecomeAdmin,
}) => {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-6 bg-slate-50 rounded-xl mb-4 sm:mb-6">
        <div className="flex items-center space-x-3 sm:space-x-4 w-full sm:w-auto">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-700 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-base sm:text-lg md:text-xl font-bold text-slate-900">
              {profileData.name || 'User'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 truncate">
              {profileData.email || 'No email provided'}
            </p>
<<<<<<< HEAD
            {isAdmin ? (
              <span className="inline-block bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-semibold px-3 py-1 rounded-full mt-1 shadow-sm">
                ⭐ Admin
              </span>
            ) : (
              <div className="mt-1 space-y-2">
                <span className="inline-block bg-slate-700 text-white text-xs px-2 py-1 rounded-full">
                  Premium Member
                </span>
                <button
                  onClick={() => {
                    console.log('Become Admin button clicked');
                    onBecomeAdmin();
                  }}
                  className="block bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs px-3 py-1 rounded-full hover:from-yellow-600 hover:to-orange-600 transition-all duration-200 shadow-sm"
                >
                  Become Admin
                </button>
              </div>
            )}
=======
>>>>>>> 1363ac7e340820ea08840696b6947f21036cd610
          </div>
        </div>
        <button
          onClick={onToggleEdit}
          className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition-colors w-full sm:w-auto ${isEditing
            ? 'bg-red-100 text-red-700 hover:bg-red-200'
            : 'bg-slate-700 text-white hover:bg-slate-800'
            }`}
        >
          {isEditing ? <X className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
          <span className="text-sm sm:text-base">{isEditing ? 'Cancel' : 'Edit'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div className="space-y-3 sm:space-y-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <input
              key="name-input"
              type="text"
              value={profileData.name}
              onChange={onNameChange}
              placeholder="Enter your full name"
              disabled={!isEditing}
              className={`w-full px-3 py-2 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-slate-700 ${isEditing
                ? 'border-slate-300 bg-white'
                : 'border-slate-200 bg-slate-50 text-slate-600'
                }`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              key="email-input"
              type="email"
              value={profileData.email}
              onChange={onEmailChange}
              placeholder="Enter your email address"
              disabled={!isEditing}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-slate-700 ${isEditing
                ? 'border-slate-300 bg-white'
                : 'border-slate-200 bg-slate-50 text-slate-600'
                }`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
            <input
              key="phone-input"
              type="tel"
              value={profileData.phone}
              onChange={onPhoneChange}
              placeholder="Enter your phone number"
              disabled={!isEditing}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-slate-700 ${isEditing
                ? 'border-slate-300 bg-white'
                : 'border-slate-200 bg-slate-50 text-slate-600'
                }`}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Current City</label>
            <CustomSelect
              key="city-select"
              options={[
                { value: '', label: 'Select a city' },
                { value: 'Ahmedabad', label: 'Ahmedabad' },
                { value: 'Gandhinagar', label: 'Gandhinagar' },
                { value: 'Surat', label: 'Surat' },
                { value: 'Rajkot', label: 'Rajkot' },
                { value: 'Baroda/Vadodra', label: 'Baroda/Vadodra' }
              ]}
              value={profileData.city}
              onChange={(value) => {
                const fakeEvent = { target: { value } } as React.ChangeEvent<HTMLSelectElement>;
                onCityChange(fakeEvent);
              }}
              disabled={!isEditing}
              placeholder="Select a city"
              className={`w-full ${!isEditing ? 'opacity-60' : ''}`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Profession</label>
            <input
              key="profession-input"
              type="text"
              value={profileData.profession}
              onChange={onProfessionChange}
              placeholder="Enter your profession"
              disabled={!isEditing}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-slate-700 ${isEditing
                ? 'border-slate-300 bg-white'
                : 'border-slate-200 bg-slate-50 text-slate-600'
                }`}
            />
          </div>

        </div>
      </div>

      {/* Save Changes Button - Only show when editing */}
      {isEditing && (
        <div className="flex justify-end pt-3 sm:pt-4">
          <button
            onClick={onSave}
            disabled={isLoading}
            className="flex items-center justify-center space-x-2 px-4 sm:px-6 py-2 text-sm sm:text-base bg-slate-700 text-white rounded-lg hover:bg-slate-800 focus:ring-2 focus:ring-slate-700 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
          >
            <Save className="w-4 h-4" />
            <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      )}

      {/* Success/Error Message */}
      {message && (
        <div className={`p-3 rounded-lg text-sm ${message.includes('successfully')
          ? 'bg-green-100 text-green-700'
          : 'bg-red-100 text-red-700'
          }`}>
          {message}
        </div>
      )}


    </div>
  );
};

export const Profile: React.FC<ProfileProps> = ({ user, onAuthRequired }) => {
<<<<<<< HEAD
  const [activeTab, setActiveTab] = useState('profile');
  const [showAdminPromotion, setShowAdminPromotion] = useState(false);
=======
>>>>>>> 1363ac7e340820ea08840696b6947f21036cd610
  const [isEditing, setIsEditing] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    city: user?.city || '',
    profession: user?.profession || '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Check admin status
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user?.id) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('is_admin, role')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error checking admin status:', error);
          return;
        }

        setIsAdmin(data?.is_admin === true || data?.role === 'admin');
      } catch (error) {
        console.error('Error checking admin status:', error);
      }
    };

    checkAdminStatus();
  }, [user]);

  // Fetch profile data from Supabase when component mounts
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;

      try {
        console.log('🔍 Fetching profile data for user:', user.email);

        // Get current user from Supabase
        const { data: { user: currentUser }, error } = await supabase.auth.getUser();

        if (error) {
          console.error('❌ Error getting Supabase user:', error);
          throw error;
        }

        if (currentUser) {
          // Use user metadata for profile data
          const metadata = currentUser.user_metadata || {};

          console.log('✅ User metadata loaded:', metadata);
          console.log('✅ User info:', { email: currentUser.email, id: currentUser.id });

          setProfileData({
            name: metadata.name || metadata.full_name || user.name || '',
            email: currentUser.email || user.email || '',
            phone: metadata.phone || user.phone || '',
            city: metadata.city || user.city || '',
            profession: metadata.profession || user.profession || '',
          });
        } else {
          console.log('🔍 No authenticated user found, using local user data');
          setProfileData({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            city: user.city || '',
            profession: user.profession || '',
          });
        }
      } catch (error) {
        console.error('❌ Error fetching profile data:', error);
        // Fallback to user data on error
        setProfileData({
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          city: user.city || '',
          profession: user.profession || ''
        });
      }
    };

    fetchProfileData();
  }, [user]);

  interface ProfileData {
    name: string;
    email: string;
    phone: string;
    city: string;
    profession: string;
  }

  // Simple change handlers that don't use useCallback
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData((prev: ProfileData) => ({ ...prev, name: e.target.value }));
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData((prev: ProfileData) => ({ ...prev, email: e.target.value }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData((prev: ProfileData) => ({ ...prev, phone: e.target.value }));
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setProfileData((prev: ProfileData) => ({ ...prev, city: e.target.value }));
  };

  const handleProfessionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData((prev: ProfileData) => ({ ...prev, profession: e.target.value }));
  };

  // Handle edit toggle
  const handleToggleEdit = () => {
    if (isEditing) {
      // When canceling edit, reset to current profileData (not user prop)
      // This prevents losing saved changes
      const { data: { user: currentUser } } = supabase.auth.getUser().then(({ data }) => {
        if (data.user) {
          const metadata = data.user.user_metadata || {};
          setProfileData({
            name: metadata.name || profileData.name,
            email: data.user.email || profileData.email,
            phone: metadata.phone || profileData.phone,
            city: metadata.city || profileData.city,
            profession: metadata.profession || profileData.profession,
          });
        }
      });
    }
    setIsEditing(!isEditing);
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    setMessage('');

    try {
      console.log('🔍 Profile data to save:', profileData);

      // Update user metadata in Supabase
      const { data, error } = await supabase.auth.updateUser({
        data: {
          name: profileData.name,
          phone: profileData.phone,
          city: profileData.city,
          profession: profileData.profession
        }
      });

      if (error) {
        console.error('❌ Supabase update error:', error);
        setMessage(error.message || 'Failed to update profile');
        return;
      }

      console.log('✅ Save successful:', data);
      setMessage('Profile updated successfully!');

      // Re-fetch the updated user data from Supabase
      const { data: { user: updatedSupabaseUser } } = await supabase.auth.getUser();
      
      if (updatedSupabaseUser) {
        const metadata = updatedSupabaseUser.user_metadata || {};
        
        // Update profileData state with fresh data from Supabase
        const freshProfileData = {
          name: metadata.name || profileData.name,
          email: updatedSupabaseUser.email || profileData.email,
          phone: metadata.phone || profileData.phone,
          city: metadata.city || profileData.city,
          profession: metadata.profession || profileData.profession,
        };
        
        setProfileData(freshProfileData);
        
        // Update localStorage with new user data
        const updatedUser = {
          ...user,
          name: metadata.name || profileData.name,
          phone: metadata.phone || profileData.phone,
          city: metadata.city || profileData.city,
          profession: metadata.profession || profileData.profession
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      
      // Exit edit mode after successful save
      setIsEditing(false);

      // Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('❌ Profile update error:', error);
      setMessage('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Show login prompt for unauthenticated users
  if (!user) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="mb-6">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Login to Access Your Profile</h3>
              <p className="text-gray-600 mb-6">
                Sign in to manage your profile, preferences, and account settings
              </p>
              <button
                onClick={() => onAuthRequired?.()}
                className="bg-slate-700 text-white px-6 py-3 rounded-lg hover:bg-slate-800 transition-colors"
              >
                Login / Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
<<<<<<< HEAD
      <div className="text-center mb-6 sm:mb-8 px-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">
          Profile Settings
        </h2>
        <p className="text-sm sm:text-base text-slate-600">
          Manage your account and preferences
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100">
        {/* Tab Navigation */}
        <div className="border-b border-slate-200 overflow-x-auto">
          <nav className="flex space-x-0 min-w-max sm:min-w-0">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id
                    ? 'border-slate-700 text-slate-800 bg-slate-100'
                    : 'border-transparent text-slate-600 hover:text-slate-800 hover:bg-slate-50'
                    }`}
                >
                  <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-6">
          {activeTab === 'profile' && (
            <ProfileTab
              profileData={profileData}
              onNameChange={handleNameChange}
              onEmailChange={handleEmailChange}
              onPhoneChange={handlePhoneChange}
              onCityChange={handleCityChange}
              onProfessionChange={handleProfessionChange}
              onSave={handleSaveProfile}
              isLoading={isLoading}
              message={message}
              isEditing={isEditing}
              onToggleEdit={handleToggleEdit}
              isAdmin={isAdmin}
              onBecomeAdmin={() => setShowAdminPromotion(true)}
            />
          )}
          {activeTab === 'preferences' && <PreferencesTab />}
          {activeTab === 'notifications' && <NotificationsTab />}
        </div>
      </div>
      
      {/* Admin Promotion Modal */}
      {showAdminPromotion && (
        <>
          {console.log('Rendering AdminPromotion modal')}
          <AdminPromotion 
            user={user}
            onClose={() => setShowAdminPromotion(false)}
          />
        </>
      )}
=======
      <ProfileTab
        profileData={profileData}
        onNameChange={handleNameChange}
        onEmailChange={handleEmailChange}
        onPhoneChange={handlePhoneChange}
        onCityChange={handleCityChange}
        onProfessionChange={handleProfessionChange}
        onSave={handleSaveProfile}
        isLoading={isLoading}
        message={message}
        isEditing={isEditing}
        onToggleEdit={handleToggleEdit}
      />
>>>>>>> 1363ac7e340820ea08840696b6947f21036cd610
    </div>
  );
};