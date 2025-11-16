import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Save, X, Search, Filter, Users } from 'lucide-react';
import { supabase } from '../config/supabase';
import { Service } from '../data/mockServices';
import { AdminManagement } from './AdminManagement';

interface AdminPanelProps {
  user: any;
}

interface ExtendedService extends Service {
  area?: string;
  contact?: string;
  email?: string;
  address?: string;
  website?: string;
  amenities?: string[];
  created_at?: string;
  updated_at?: string;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'services' | 'admins'>('services');
  const [services, setServices] = useState<ExtendedService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingService, setEditingService] = useState<ExtendedService | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [isAdmin, setIsAdmin] = useState(false);

  // Form state
  const [formData, setFormData] = useState<Partial<ExtendedService>>({
    name: '',
    type: 'accommodation',
    city: '',
    area: '',
    price: 0,
    rating: 0,
    description: '',
    address: '',
    contact: '',
    email: '',
    website: '',
    amenities: [],
    features: [],
    image: ''
  });

  useEffect(() => {
    checkAdminStatus();
    loadServices();
  }, [user]);

  const checkAdminStatus = async () => {
    try {
      if (!user) {
        setIsAdmin(false);
        return;
      }

      // Check if user is admin in the profiles table
      const { data, error } = await supabase
        .from('profiles')
        .select('is_admin, role')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
        return;
      }

      setIsAdmin(data?.is_admin === true || data?.role === 'admin');
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    }
  };

  const loadServices = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setServices(data || []);
    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'rating' ? parseFloat(value) || 0 : value
    }));
  };

  const handleAmenitiesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const amenities = e.target.value.split(',').map(a => a.trim()).filter(a => a);
    setFormData(prev => ({ ...prev, amenities }));
  };

  const handleFeaturesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const features = e.target.value.split(',').map(a => a.trim()).filter(a => a);
    setFormData(prev => ({ ...prev, features }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.city) {
      alert('Please fill in required fields (Name and City)');
      return;
    }

    try {
      const serviceData = {
        ...formData,
        id: editingService?.id || `service_${Date.now()}`,
        created_at: editingService?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (editingService) {
        // Update existing service
        const { error } = await supabase
          .from('services')
          .update(serviceData)
          .eq('id', editingService.id);

        if (error) throw error;

        window.dispatchEvent(new CustomEvent('toast:show', {
          detail: { message: 'Service updated successfully', type: 'success' }
        }));
      } else {
        // Add new service
        const { error } = await supabase
          .from('services')
          .insert([serviceData]);

        if (error) throw error;

        window.dispatchEvent(new CustomEvent('toast:show', {
          detail: { message: 'Service added successfully', type: 'success' }
        }));
      }

      // Reset form and reload services
      resetForm();
      loadServices();
    } catch (error) {
      console.error('Error saving service:', error);
      window.dispatchEvent(new CustomEvent('toast:show', {
        detail: { message: 'Failed to save service', type: 'error' }
      }));
    }
  };

  const handleEdit = (service: ExtendedService) => {
    setEditingService(service);
    setFormData(service);
    setShowAddForm(true);
  };

  const handleDelete = async (serviceId: string) => {
    if (!confirm('Are you sure you want to delete this service?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId);

      if (error) throw error;

      window.dispatchEvent(new CustomEvent('toast:show', {
        detail: { message: 'Service deleted successfully', type: 'success' }
      }));

      loadServices();
    } catch (error) {
      console.error('Error deleting service:', error);
      window.dispatchEvent(new CustomEvent('toast:show', {
        detail: { message: 'Failed to delete service', type: 'error' }
      }));
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'accommodation',
      city: '',
      area: '',
      price: 0,
      rating: 0,
      description: '',
      address: '',
      contact: '',
      email: '',
      website: '',
      amenities: [],
      features: [],
      image: ''
    });
    setEditingService(null);
    setShowAddForm(false);
  };

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.city?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || service.type === filterCategory;
    return matchesSearch && matchesCategory;
  });

  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Access Denied</h3>
          <p className="text-slate-600">You don't have permission to access the admin panel.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Admin Panel</h1>
          <p className="text-slate-600 mt-1">Manage services and listings</p>
        </div>
        {activeTab === 'services' && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 bg-slate-700 text-white px-6 py-3 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Service
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('services')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'services'
                ? 'border-slate-700 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Services Management
          </button>
          <button
            onClick={() => setActiveTab('admins')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'admins'
                ? 'border-slate-700 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Admin Management
            </div>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'services' ? (
        <div className="space-y-6">
          {/* Search and Filter */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-700 focus:border-transparent"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-700 focus:border-transparent"
                >
                  <option value="all">All Categories</option>
                  <option value="accommodation">Accommodation</option>
                  <option value="food">Food</option>
                  <option value="transport">Transport</option>
                  <option value="tiffin">Tiffin</option>
                </select>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="text-sm text-slate-600 mb-1">Total Services</div>
              <div className="text-3xl font-bold text-slate-900">{services.length}</div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="text-sm text-slate-600 mb-1">Filtered Results</div>
              <div className="text-3xl font-bold text-slate-900">{filteredServices.length}</div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="text-sm text-slate-600 mb-1">Categories</div>
              <div className="text-3xl font-bold text-slate-900">{new Set(services.map(s => s.type)).size}</div>
            </div>
          </div>

          {/* Services List */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 border-4 border-slate-700 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="mt-4 text-slate-600">Loading services...</p>
              </div>
            ) : filteredServices.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-600">No services found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Service</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Location</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Rating</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-slate-700 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {filteredServices.map((service) => (
                      <tr key={service.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {service.image && (
                              <img src={service.image} alt={service.name} className="w-10 h-10 rounded-lg object-cover mr-3" />
                            )}
                            <div className="text-sm font-medium text-slate-900">{service.name}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-700 capitalize">
                            {service.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                          {service.city}{service.area && `, ${service.area}`}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                          ₹{service.price?.toLocaleString() || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                          {service.rating || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleEdit(service)}
                            className="text-slate-600 hover:text-slate-900 mr-3"
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(service.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        <AdminManagement />
      )}

      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900">
                  {editingService ? 'Edit Service' : 'Add New Service'}
                </h2>
                <button onClick={resetForm} className="text-slate-400 hover:text-slate-600">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Service Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name || ''}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-700 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Category *</label>
                    <select
                      name="type"
                      value={formData.type || 'accommodation'}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-700 focus:border-transparent"
                    >
                      <option value="accommodation">Accommodation</option>
                      <option value="food">Food</option>
                      <option value="transport">Transport</option>
                      <option value="tiffin">Tiffin</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">City *</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city || ''}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-700 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Area</label>
                    <input
                      type="text"
                      name="area"
                      value={formData.area || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-700 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Price (₹)</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price || 0}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-700 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Rating (0-5)</label>
                    <input
                      type="number"
                      name="rating"
                      value={formData.rating || 0}
                      onChange={handleInputChange}
                      min="0"
                      max="5"
                      step="0.1"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-700 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Contact</label>
                    <input
                      type="text"
                      name="contact"
                      value={formData.contact || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-700 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-700 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={formData.description || ''}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-700 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-700 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Website</label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-700 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Image URL</label>
                  <input
                    type="url"
                    name="image"
                    value={formData.image || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-700 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Features (comma-separated)</label>
                  <input
                    type="text"
                    value={formData.features?.join(', ') || ''}
                    onChange={handleFeaturesChange}
                    placeholder="WiFi, Parking, AC, etc."
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-700 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Amenities (comma-separated)</label>
                  <input
                    type="text"
                    value={formData.amenities?.join(', ') || ''}
                    onChange={handleAmenitiesChange}
                    placeholder="WiFi, Parking, AC, etc."
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-700 focus:border-transparent"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 flex items-center justify-center gap-2 bg-slate-700 text-white px-6 py-3 rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    <Save className="w-5 h-5" />
                    {editingService ? 'Update Service' : 'Add Service'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};