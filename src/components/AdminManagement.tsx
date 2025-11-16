import React, { useState, useEffect } from 'react';
import { Shield, Users, Mail, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../config/supabase';

interface AdminUser {
  id: string;
  email: string;
  name?: string;
  is_admin: boolean;
  role?: string;
  created_at: string;
}

export const AdminManagement: React.FC = () => {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [allUsers, setAllUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAllUsers, setShowAllUsers] = useState(false);

  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    try {
      setIsLoading(true);
      
      // Load all admins
      const { data: adminData, error: adminError } = await supabase
        .from('profiles')
        .select('id, email, name, is_admin, role, created_at')
        .or('is_admin.eq.true,role.eq.admin')
        .order('created_at', { ascending: false });

      if (adminError) throw adminError;

      setAdmins(adminData || []);

      // Load all users
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id, email, name, is_admin, role, created_at')
        .order('created_at', { ascending: false });

      if (userError) throw userError;

      setAllUsers(userData || []);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAdminStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_admin: !currentStatus })
        .eq('id', userId);

      if (error) throw error;

      // Reload data
      loadAdmins();

      window.dispatchEvent(new CustomEvent('toast:show', {
        detail: { 
          message: currentStatus ? 'Admin access removed' : 'Admin access granted', 
          type: 'success' 
        }
      }));
    } catch (error) {
      console.error('Error updating admin status:', error);
      window.dispatchEvent(new CustomEvent('toast:show', {
        detail: { message: 'Failed to update admin status', type: 'error' }
      }));
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 border-4 border-slate-700 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-slate-600">Loading admin data...</p>
      </div>
    );
  }

  const displayUsers = showAllUsers ? allUsers : admins;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-slate-900">Admin Management</h3>
          <p className="text-slate-600 mt-1">Manage administrator access for users</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-lg">
          <Shield className="w-5 h-5 text-slate-700" />
          <span className="font-semibold text-slate-900">{admins.length}</span>
          <span className="text-slate-600 text-sm">Admins</span>
        </div>
      </div>

      {/* Toggle View */}
      <div className="flex gap-2">
        <button
          onClick={() => setShowAllUsers(false)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            !showAllUsers
              ? 'bg-slate-700 text-white'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          Admins Only ({admins.length})
        </button>
        <button
          onClick={() => setShowAllUsers(true)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            showAllUsers
              ? 'bg-slate-700 text-white'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          All Users ({allUsers.length})
        </button>
      </div>

      {/* Admin/User List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {displayUsers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600">No {showAllUsers ? 'users' : 'admins'} found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-700 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {displayUsers.map((user) => {
                  const isAdmin = user.is_admin || user.role === 'admin';
                  return (
                    <tr key={user.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                            {isAdmin ? (
                              <Shield className="w-5 h-5 text-orange-500" />
                            ) : (
                              <Users className="w-5 h-5 text-slate-500" />
                            )}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-slate-900">
                              {user.name || 'User'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-slate-600">
                          <Mail className="w-4 h-4 mr-2 text-slate-400" />
                          {user.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isAdmin ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                            <CheckCircle className="w-3 h-3" />
                            Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                            <XCircle className="w-3 h-3" />
                            User
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => toggleAdminStatus(user.id, isAdmin)}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            isAdmin
                              ? 'bg-red-100 text-red-700 hover:bg-red-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {isAdmin ? 'Remove Admin' : 'Make Admin'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-blue-900 mb-1">About Admin Access</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Admins can add, edit, and delete services</li>
              <li>• Admins see the "Admin" menu item in navigation</li>
              <li>• Admin status is shown with a golden badge on their profile</li>
              <li>• Multiple users can have admin access simultaneously</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
