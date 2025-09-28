import React, { useState } from 'react';
import { User, Settings, Bell, Shield, CreditCard as Edit3, Save, X } from 'lucide-react';

export const Profile: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+91 98765 43210',
    city: 'Mumbai',
    profession: 'Software Engineer',
    company: 'Tech Innovations Pvt Ltd'
  });

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'preferences', label: 'Preferences', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  const handleSave = () => {
    setIsEditing(false);
    // Here you would typically save to backend
    window.dispatchEvent(new CustomEvent('toast:show', { 
      detail: { message: 'Profile updated successfully', type: 'success' } 
    }));
  };

  const ProfileTab = () => (
    <div className="space-y-8">
      {/* Profile Header */}
      <div className="flex items-center space-x-6 p-6 bg-slate-50 rounded-xl">
        <div className="w-24 h-24 bg-slate-700 rounded-2xl flex items-center justify-center shadow-lg">
          <User className="w-12 h-12 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-slate-900">{formData.name}</h3>
              <p className="text-slate-600">{formData.email}</p>
              <span className="inline-block text-xs px-3 py-1 bg-slate-700 text-white rounded-full mt-2">
                Premium Member
              </span>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                isEditing 
                  ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {isEditing ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
              <span>{isEditing ? 'Cancel' : 'Edit'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              disabled={!isEditing}
              className={`w-full px-4 py-3 border rounded-xl transition-colors ${
                isEditing 
                  ? 'border-slate-300 focus:border-slate-700 focus:ring-2 focus:ring-slate-700' 
                  : 'border-slate-200 bg-slate-50'
              }`}
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              disabled={!isEditing}
              className={`w-full px-4 py-3 border rounded-xl transition-colors ${
                isEditing 
                  ? 'border-slate-300 focus:border-slate-700 focus:ring-2 focus:ring-slate-700' 
                  : 'border-slate-200 bg-slate-50'
              }`}
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              disabled={!isEditing}
              className={`w-full px-4 py-3 border rounded-xl transition-colors ${
                isEditing 
                  ? 'border-slate-300 focus:border-slate-700 focus:ring-2 focus:ring-slate-700' 
                  : 'border-slate-200 bg-slate-50'
              }`}
            />
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Current City</label>
            <select 
              value={formData.city}
              onChange={(e) => setFormData({...formData, city: e.target.value})}
              disabled={!isEditing}
              className={`w-full px-4 py-3 border rounded-xl transition-colors ${
                isEditing 
                  ? 'border-slate-300 focus:border-slate-700 focus:ring-2 focus:ring-slate-700' 
                  : 'border-slate-200 bg-slate-50'
              }`}
            >
              <option>Mumbai</option>
              <option>Delhi</option>
              <option>Bangalore</option>
              <option>Pune</option>
              <option>Ahmedabad</option>
              <option>Surat</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Profession</label>
            <input
              type="text"
              value={formData.profession}
              onChange={(e) => setFormData({...formData, profession: e.target.value})}
              disabled={!isEditing}
              className={`w-full px-4 py-3 border rounded-xl transition-colors ${
                isEditing 
                  ? 'border-slate-300 focus:border-slate-700 focus:ring-2 focus:ring-slate-700' 
                  : 'border-slate-200 bg-slate-50'
              }`}
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Company</label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => setFormData({...formData, company: e.target.value})}
              disabled={!isEditing}
              className={`w-full px-4 py-3 border rounded-xl transition-colors ${
                isEditing 
                  ? 'border-slate-300 focus:border-slate-700 focus:ring-2 focus:ring-slate-700' 
                  : 'border-slate-200 bg-slate-50'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      {isEditing && (
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="flex items-center space-x-2 px-6 py-3 bg-slate-700 text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save Changes</span>
          </button>
        </div>
      )}
    </div>
  );

  const PreferencesTab = () => (
    <div className="space-y-8">
      {/* Budget Preferences */}
      <div className="bg-slate-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Budget Preferences</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Monthly Budget</label>
            <select className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-slate-700 focus:ring-2 focus:ring-slate-700">
              <option>₹20,000 - ₹30,000</option>
              <option>₹30,000 - ₹50,000</option>
              <option>₹50,000 - ₹75,000</option>
              <option>₹75,000+</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Priority</label>
            <select className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-slate-700 focus:ring-2 focus:ring-slate-700">
              <option>Cost-effective</option>
              <option>Quality</option>
              <option>Convenience</option>
              <option>Location</option>
            </select>
          </div>
        </div>
      </div>

      {/* Service Preferences */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Service Preferences</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {['Accommodation', 'Food', 'Transport', 'Coworking', 'Utilities'].map((service) => (
            <label key={service} className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
              <span className="font-medium text-slate-700">{service}</span>
              <input type="checkbox" defaultChecked className="w-5 h-5 text-slate-700 border-slate-300 rounded focus:ring-slate-700" />
            </label>
          ))}
        </div>
      </div>

      {/* Preferred Cities */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Preferred Cities</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {['Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Hyderabad', 'Chennai', 'Jaipur', 'Kolkata'].map((city) => (
            <label key={city} className="flex items-center space-x-3 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
              <input type="checkbox" defaultChecked className="w-4 h-4 text-slate-700 border-slate-300 rounded focus:ring-slate-700" />
              <span className="text-sm font-medium text-slate-700">{city}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const NotificationsTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-slate-900">Notification Settings</h3>
      <div className="space-y-4">
        {[
          { label: 'New service recommendations', description: 'Get notified when we find services matching your preferences' },
          { label: 'Price alerts', description: 'Alert when prices drop for bookmarked services' },
          { label: 'Weekly cost summary', description: 'Receive weekly spending analysis and tips' },
          { label: 'City updates', description: 'Updates about new services in your preferred cities' },
          { label: 'Marketing emails', description: 'Promotional offers and feature updates' }
        ].map((item, index) => (
          <div key={index} className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
            <div className="flex-1">
              <div className="font-medium text-slate-900">{item.label}</div>
              <div className="text-sm text-slate-600 mt-1">{item.description}</div>
            </div>
            <input type="checkbox" defaultChecked className="w-5 h-5 text-slate-700 border-slate-300 rounded focus:ring-slate-700" />
          </div>
        ))}
      </div>
    </div>
  );

  const SecurityTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-slate-900">Security Settings</h3>
      <div className="space-y-4">
        <div className="p-6 border border-slate-200 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="font-semibold text-slate-900">Password</span>
              <p className="text-sm text-slate-600 mt-1">Last changed 30 days ago</p>
            </div>
            <button className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors">
              Change Password
            </button>
          </div>
        </div>

        <div className="p-6 border border-slate-200 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="font-semibold text-slate-900">Two-Factor Authentication</span>
              <p className="text-sm text-slate-600 mt-1">Extra security for your account</p>
            </div>
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
              Enabled
            </span>
          </div>
        </div>

        <div className="p-6 border border-slate-200 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="font-semibold text-slate-900">Login Sessions</span>
              <p className="text-sm text-slate-600 mt-1">2 active sessions</p>
            </div>
            <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors">
              Manage Sessions
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-slate-900 mb-3">Profile Settings</h1>
        <p className="text-lg text-slate-600">Manage your account and preferences</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Tab Navigation */}
        <div className="border-b border-slate-200 bg-slate-50">
          <nav className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                    isActive
                      ? 'border-slate-700 text-slate-900 bg-white'
                      : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-8">
          {activeTab === 'profile' && <ProfileTab />}
          {activeTab === 'preferences' && <PreferencesTab />}
          {activeTab === 'notifications' && <NotificationsTab />}
          {activeTab === 'security' && <SecurityTab />}
        </div>
      </div>
    </div>
  );
};