import React, { useState, useEffect } from 'react';
import { Calculator, CheckCircle, Circle } from 'lucide-react';
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

      const { error } = await supabase
        .from('budget_plans')
        .insert({
          user_id: user.id,
          total_budget: parseFloat(budget),
          total_cost: analysis.totalCost,
          selected_items: analysis.selectedItems,
          category_breakdown: analysis.categoryBreakdown,
          is_over_budget: analysis.isOverBudget,
          difference_amount: analysis.differenceAmount
        });

      if (error) throw error;

      window.dispatchEvent(new CustomEvent('toast:show', {
        detail: { message: 'Budget plan saved successfully!', type: 'success' }
      }));

      setShowResults(false);
      onClose();
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
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                <Calculator className="w-6 h-6 text-slate-700" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Budget Buddy</h2>
                <p className="text-sm text-gray-600">Plan your monthly expenses</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Enter Your Monthly Budget
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                ₹
              </span>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="Enter amount (e.g., 25000)"
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-slate-500 focus:ring focus:ring-slate-200 transition-all text-lg"
                min="0"
                step="100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Select Services from Your Bookmarks
              <span className="ml-2 text-gray-500 font-normal">
                ({selectedServiceIds.size} selected)
              </span>
            </label>
            {bookmarkedServices.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No bookmarked services found.</p>
                <p className="text-sm mt-2">Add some services to your bookmarks first.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-3">
                {bookmarkedServices.map((service) => {
                  const isSelected = selectedServiceIds.has(service.id);
                  return (
                    <div
                      key={service.id}
                      onClick={() => toggleServiceSelection(service.id)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-slate-500 bg-slate-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
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
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
