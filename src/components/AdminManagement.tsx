import React, { useState, useEffect } from 'react';
import { Shield, Users, Mail, CheckCircle, XCircle, Heart, Star, TrendingUp } from 'lucide-react';
import { supabase } from '../config/supabase';

interface AdminUser {
  id: string;
  email: string;
  name?: string;
  is_admin: boolean;
  role?: string;
  created_at: string;
  service_count?: number;
  total_bookmarks?: number;
  total_wishlists?: number;
  total_interest?: number;
}

export const AdminManagement: React.FC = () => {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [allUsers, setAllUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAllUsers, setShowAllUsers] = useState(false);

  useEffect(() => {
    loadAdmins();
  }, []);

  const fixServicesWithoutAdminId = async () => {
    try {
      // Get the current user (must be an admin)
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check if current user is admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin, role')
        .eq('id', user.id)
        .single();

      if (!profile || (!profile.is_admin && profile.role !== 'admin')) return;

      // Get services without admin_id
      const { data: servicesWithoutAdmin } = await supabase
        .from('services')
        .select('id, name')
        .is('admin_id', null);

      if (servicesWithoutAdmin && servicesWithoutAdmin.length > 0) {
        console.log(`Found ${servicesWithoutAdmin.length} services without admin_id, assigning to current user`);
        
        // Assign these services to the current user
        const { error } = await supabase
          .from('services')
          .update({ admin_id: user.id })
          .is('admin_id', null);

        if (error) {
          console.error('Error updating services with admin_id:', error);
        } else {
          console.log('Successfully assigned admin_id to services');
        }
      }
    } catch (error) {
      console.error('Error in fixServicesWithoutAdminId:', error);
    }
  };

  const loadAdmins = async () => {
    try {
      setIsLoading(true);
      
      // First, let's fix any services without admin_id
      await fixServicesWithoutAdminId();
      
      // Load all admins with service analytics
      const { data: adminData, error: adminError } = await supabase
        .from('profiles')
        .select(`
          id, 
          email, 
          name, 
          is_admin, 
          role, 
          created_at
        `)
        .or('is_admin.eq.true,role.eq.admin')
        .order('created_at', { ascending: false });

      if (adminError) throw adminError;

      // Get service analytics for each admin
      if (adminData) {
        const adminsWithAnalytics = await Promise.all(
          adminData.map(async (admin) => {
            // Get service count for this admin
            const { count: serviceCount } = await supabase
              .from('services')
              .select('*', { count: 'exact', head: true })
              .eq('admin_id', admin.id);

            // Get service IDs for this admin
            const { data: adminServices, error: serviceError } = await supabase
              .from('services')
              .select('id, name')
              .eq('admin_id', admin.id);

            if (serviceError) {
              console.error(`Error loading services for ${admin.email}:`, serviceError);
            }

            const serviceIds = adminServices?.map(s => s.id) || [];

            let totalBookmarks = 0;
            let totalWishlists = 0;

            if (serviceIds.length > 0) {
              // Get bookmark count
              const { count: bookmarkCount, error: bookmarkError } = await supabase
                .from('bookmarks')
                .select('*', { count: 'exact', head: true })
                .in('service_id', serviceIds);

              // Get wishlist count  
              const { count: wishlistCount, error: wishlistError } = await supabase
                .from('wishlists')
                .select('*', { count: 'exact', head: true })
                .in('service_id', serviceIds);

              if (bookmarkError) {
                console.error(`Error loading bookmarks for ${admin.email}:`, bookmarkError);
              }
              
              if (wishlistError) {
                console.error(`Error loading wishlists for ${admin.email}:`, wishlistError);
              }

              totalBookmarks = bookmarkCount || 0;
              totalWishlists = wishlistCount || 0;
            }

            return {
              ...admin,
              service_count: serviceCount || 0,
              total_bookmarks: totalBookmarks,
              total_wishlists: totalWishlists,
              total_interest: totalBookmarks + totalWishlists
            };
          })
        );

        setAdmins(adminsWithAnalytics);
      }

      // Load all users (without analytics for performance)
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
      {/* Header with Analytics Summary */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-slate-900">Admin Management</h3>
          <p className="text-slate-600 mt-1">Manage administrator access and view service analytics</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              setIsLoading(true);
              loadAdmins();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh Analytics
          </button>
          <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-lg">
            <Shield className="w-5 h-5 text-slate-700" />
            <span className="font-semibold text-slate-900">{admins.length}</span>
            <span className="text-slate-600 text-sm">Admins</span>
          </div>
          <div className="flex items-center gap-2 bg-blue-100 px-4 py-2 rounded-lg">
            <TrendingUp className="w-5 h-5 text-blue-700" />
            <span className="font-semibold text-blue-900">
              {admins.reduce((sum, admin) => sum + (admin.total_interest || 0), 0)}
            </span>
            <span className="text-blue-700 text-sm">Total Interest</span>
          </div>
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
                  {!showAllUsers && (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                        Services
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                        User Interest
                      </th>
                    </>
                  )}
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
                      {!showAllUsers && isAdmin && (
                        <>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-slate-900">
                                {user.service_count || 0}
                              </span>
                              <span className="text-xs text-slate-500">services</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Heart className="w-4 h-4 text-red-500" />
                                <span className="text-sm font-medium text-slate-900">
                                  {(user.total_interest || 0)}
                                </span>
                                <span className="text-xs text-slate-500">total</span>
                              </div>
                              <div className="flex gap-3 text-xs text-slate-600">
                                <span>{user.total_bookmarks || 0} bookmarks</span>
                                <span>{user.total_wishlists || 0} wishlists</span>
                              </div>
                            </div>
                          </td>
                        </>
                      )}
                      {!showAllUsers && !isAdmin && (
                        <>
                          <td className="px-6 py-4 whitespace-nowrap text-slate-400 text-sm">-</td>
                          <td className="px-6 py-4 whitespace-nowrap text-slate-400 text-sm">-</td>
                        </>
                      )}
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

      {/* Admin Analytics Cards */}
      {!showAllUsers && admins.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {admins
            .filter(admin => admin.is_admin || admin.role === 'admin')
            .sort((a, b) => (b.total_interest || 0) - (a.total_interest || 0))
            .slice(0, 3)
            .map((admin) => (
              <div key={admin.id} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">{admin.name || 'Admin'}</h4>
                    <p className="text-sm text-slate-600">{admin.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white rounded-lg p-3 border border-blue-100">
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-medium text-blue-700 uppercase">Services</span>
                    </div>
                    <span className="text-xl font-bold text-slate-900">{admin.service_count || 0}</span>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-red-100">
                    <div className="flex items-center gap-2 mb-1">
                      <Heart className="w-4 h-4 text-red-600" />
                      <span className="text-xs font-medium text-red-700 uppercase">Interest</span>
                    </div>
                    <span className="text-xl font-bold text-slate-900">{admin.total_interest || 0}</span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-blue-100">
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>{admin.total_bookmarks || 0} bookmarks</span>
                    <span>{admin.total_wishlists || 0} wishlists</span>
                  </div>
                </div>
              </div>
            ))
          }
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-blue-900 mb-1">Admin Analytics & Access</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Admins can add, edit, and delete services</li>
              <li>• Service interest is tracked through bookmarks and wishlists</li>
              <li>• Analytics show user engagement with admin services</li>
              <li>• Top performing admins are highlighted in analytics cards</li>
              <li>• Multiple users can have admin access simultaneously</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
