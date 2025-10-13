import React, { useState, useEffect } from 'react';
import { Calculator, CheckCircle, Circle, History } from 'lucide-react';
import { Service } from '../data/mockServices';
import { supabase } from '../config/supabase';
import {
  calculateBudgetAnalysis,
  findCheaperAlternatives,
  formatCurrency,
  BudgetAnalysis,
  Alternative
} from '../utils/budgetCalculations';
import { BudgetAnalysisResult } from './BudgetAnalysisResult';

interface BudgetBuddyProps {
  bookmarkedServices: Service[];
  allServices: Service[];
  onClose: () => void;
}

interface SavedPlan {
  id: string;
  user_id: string;
  name: string;
  budget: number;
  total_cost: number;
  bookmark_ids: string[];
  selected_items: Array<{
    id: string;
    name: string;
    type: string;
    price: number;
  }>;
  category_breakdown: Record<string, number>;
  is_over_budget: boolean;
  difference_amount: number;
  created_at: string;
}

export const BudgetBuddy: React.FC<BudgetBuddyProps> = ({
  bookmarkedServices,
  allServices,
  onClose
}) => {
  const [selectedServiceIds, setSelectedServiceIds] = useState<Set<string>>(new Set());
  const [budget, setBudget] = useState<string>('');
  const [analysis, setAnalysis] = useState<BudgetAnalysis | null>(null);
  const [alternatives, setAlternatives] = useState<Alternative[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [showSavedPlans, setShowSavedPlans] = useState(false);
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);

  useEffect(() => {
    const fetchSavedPlans = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('budget_plans')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setSavedPlans(data || []);
      } catch (err) {
        console.error('Error fetching saved plans:', err);
      }
    };

    fetchSavedPlans();
  }, [showSavedPlans]);

  const toggleServiceSelection = (serviceId: string) => {
    const newSelected = new Set(selectedServiceIds);
    if (newSelected.has(serviceId)) {
      newSelected.delete(serviceId);
    } else {
      newSelected.add(serviceId);
    }
    setSelectedServiceIds(newSelected);
    setError('');
  };

  const handleCalculate = () => {
    setError('');

    if (selectedServiceIds.size === 0) {
      setError('Please select at least one service');
      return;
    }

    const budgetNum = parseFloat(budget);
    if (!budget || isNaN(budgetNum) || budgetNum <= 0) {
      setError('Please enter a valid budget amount');
      return;
    }

    const selectedServices = bookmarkedServices.filter(service =>
      selectedServiceIds.has(service.id)
    );

    const analysisResult = calculateBudgetAnalysis(selectedServices, budgetNum);
    const alternativesResult = findCheaperAlternatives(selectedServices, allServices);

    setAnalysis(analysisResult);
    setAlternatives(alternativesResult);
    setShowResults(true);
  };

  const handleSavePlan = async () => {
    if (!analysis) return;

    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        window.dispatchEvent(new CustomEvent('toast:show', {
          detail: { message: 'Please log in to save your budget plan', type: 'error' }
        }));
        setIsSaving(false);
        return;
      }

      const budgetAmount = Number(budget);
      if (isNaN(budgetAmount) || budgetAmount <= 0) {
        throw new Error('Invalid budget amount');
      }

      if (!analysis) {
        throw new Error('Analysis data is missing');
      }

      const selectedServices = Array.from(selectedServiceIds).map(id => {
        const service = bookmarkedServices.find(s => s.id === id);
        if (!service) {
          throw new Error(`Service with id ${id} not found`);
        }
        return {
          id: service.id,
          name: service.name || '',
          type: service.type || '',
          price: Number(service.price) || 0
        };
      });

      const budgetPlan = {
        user_id: user.id,
        name: `Budget Plan ${new Date().toLocaleDateString()}`,
        budget: budgetAmount,
        total_cost: Number(analysis.totalCost) || 0,
        bookmark_ids: selectedServices.map(s => s.id),
        selected_items: selectedServices,
        category_breakdown: analysis.categoryBreakdown || {},
        is_over_budget: Boolean(analysis.isOverBudget),
        difference_amount: Math.abs(budgetAmount - (Number(analysis.totalCost) || 0))
      };

      const { data: newPlan, error } = await supabase
        .from('budget_plans')
        .insert([budgetPlan])
        .select()
        .single();

      if (error) {
        console.error('Supabase error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });

        let errorMessage = 'Failed to save budget plan';
        if (error.message.includes('schema cache')) {
          errorMessage = 'Database schema error. Please try again in a moment.';
        } else if (error.code === '23502') {
          errorMessage = 'Missing required fields';
        }

        window.dispatchEvent(new CustomEvent('toast:show', {
          detail: { message: errorMessage, type: 'error' }
        }));

        throw new Error(`Failed to save budget plan: ${error.message}`);
      }

      window.dispatchEvent(new CustomEvent('toast:show', {
        detail: { message: 'Budget plan saved successfully!', type: 'success' }
      }));

      // Refresh saved plans after saving with the returned plan data
      if (newPlan) {
        setSavedPlans(prev => [newPlan, ...prev]);
      }
      setShowResults(false);
      setShowSavedPlans(true);
    } catch (err) {
      console.error('Error saving budget plan:', err);
      window.dispatchEvent(new CustomEvent('toast:show', {
        detail: { message: 'Failed to save budget plan', type: 'error' }
      }));
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloseResults = () => {
    setShowResults(false);
    setAnalysis(null);
    setAlternatives([]);
  };

  if (showResults && analysis) {
    return (
      <BudgetAnalysisResult
        analysis={analysis}
        budget={parseFloat(budget)}
        alternatives={alternatives}
        onClose={handleCloseResults}
        isSaving={isSaving}
        onSavePlan={handleSavePlan}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calculator className="w-6 h-6 text-slate-700" />
              <h2 className="text-xl font-bold text-gray-900">Budget Buddy</h2>
              <div className="flex gap-4 ml-4">
                <button
                  onClick={() => setShowSavedPlans(false)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg ${!showSavedPlans ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <Calculator className="w-4 h-4" />
                  New Plan
                </button>
                <button
                  onClick={() => setShowSavedPlans(true)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg ${showSavedPlans ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <History className="w-4 h-4" />
                  Saved Plans
                </button>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {showSavedPlans ? (
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Your Saved Budget Plans</h2>
            {savedPlans.length === 0 ? (
              <p className="text-gray-500">No saved budget plans yet.</p>
            ) : (
              <div className="space-y-4">
                {savedPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex flex-col gap-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{plan.name}</h3>
                          <p className="text-sm text-gray-500">
                            Created on {new Date(plan.created_at).toLocaleDateString()}
                          </p>
                          <div className="mt-2">
                            <p>Budget: {formatCurrency(plan.budget)}</p>
                            <p>Total Cost: {formatCurrency(plan.total_cost)}</p>
                            <p className={plan.total_cost > plan.budget ? 'text-red-500' : 'text-green-500'}>
                              {plan.total_cost > plan.budget ? 'Over budget' : 'Within budget'}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="border-t pt-3">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Services</h4>
                        <div className="space-y-2">
                          {plan.selected_items?.map(item => (
                            <div key={item.id} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg">
                              <div>
                                <p className="font-medium text-gray-900">{item.name}</p>
                                <p className="text-sm text-gray-600 capitalize">{item.type}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-gray-900">{formatCurrency(item.price)}</p>
                                <p className="text-xs text-gray-500">per month</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-6">
              <button
                onClick={() => setShowSavedPlans(false)}
                className="w-full bg-slate-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-slate-800 transition-colors"
              >
                Create New Budget Plan
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            <div className="space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Enter Your Monthly Budget</span>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">₹</span>
                  </span>
                  <input
                    type="text"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="Enter amount (e.g., 25000)"
                    className="block w-full pl-7 pr-12 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-700 focus:border-transparent"
                  />
                </div>
              </label>

              <div>
                <span className="text-sm font-medium text-gray-700">
                  Select Services from Your Wishlist
                  {bookmarkedServices.length > 0 && ` (${selectedServiceIds.size} selected)`}
                </span>
                {bookmarkedServices.length === 0 ? (
                  <div className="mt-2 text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                    <p className="text-gray-500">No services in your wishlist yet.</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Add services to your wishlist to create a budget plan.
                    </p>
                  </div>
                ) : (
                  <div className="mt-2 space-y-2">
                    {bookmarkedServices.map((service) => {
                      const isSelected = selectedServiceIds.has(service.id);
                      return (
                        <div
                          key={service.id}
                          onClick={() => toggleServiceSelection(service.id)}
                          className={`cursor-pointer rounded-lg border ${isSelected
                            ? 'border-slate-700 bg-slate-50'
                            : 'border-gray-200 hover:border-gray-300'
                            }`}
                        >
                          <div className="p-4 flex items-center gap-4">
                            <div className="flex-shrink-0">
                              {isSelected ? (
                                <CheckCircle className="w-6 h-6 text-slate-700" />
                              ) : (
                                <Circle className="w-6 h-6 text-gray-300" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 truncate">
                                {service.name}
                              </p>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-sm text-gray-600 capitalize">
                                  {service.type}
                                </span>
                                <span className="text-sm text-gray-400">•</span>
                                <span className="text-sm text-gray-600">
                                  {service.city}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-gray-900">
                                {formatCurrency(service.price)}
                              </p>
                              <p className="text-xs text-gray-500">per month</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={handleCalculate}
                disabled={bookmarkedServices.length === 0}
                className="flex-1 bg-slate-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-slate-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Calculate Budget
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};