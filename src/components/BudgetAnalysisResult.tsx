import React from 'react';
import { CheckCircle, XCircle, TrendingDown, DollarSign } from 'lucide-react';
import { BudgetAnalysis, Alternative, formatCurrency, getCategoryColor } from '../utils/budgetCalculations';
import { Service } from '../data/mockServices';

interface BudgetAnalysisResultProps {
  analysis: BudgetAnalysis;
  budget: number;
  alternatives: Alternative[];
  onClose: () => void;
  onSavePlan?: () => void;
}

export const BudgetAnalysisResult: React.FC<BudgetAnalysisResultProps> = ({
  analysis,
  budget,
  alternatives,
  onClose,
  onSavePlan
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Budget Analysis</h2>
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
          <div className={`p-6 rounded-lg ${analysis.isOverBudget ? 'bg-red-50 border-2 border-red-200' : 'bg-green-50 border-2 border-green-200'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {analysis.isOverBudget ? (
                  <XCircle className="w-8 h-8 text-red-600" />
                ) : (
                  <CheckCircle className="w-8 h-8 text-green-600" />
                )}
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {analysis.isOverBudget ? 'Over Budget' : 'Within Budget'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {analysis.isOverBudget
                      ? 'Your selections exceed your monthly budget'
                      : 'Great! Your selections fit within your budget'}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="text-sm text-gray-600 mb-1">Your Budget</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(budget)}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="text-sm text-gray-600 mb-1">Total Cost</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(analysis.totalCost)}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="text-sm text-gray-600 mb-1">
                  {analysis.isOverBudget ? 'Over by' : 'Remaining'}
                </p>
                <p className={`text-2xl font-bold ${analysis.isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
                  {formatCurrency(Math.abs(analysis.differenceAmount))}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Category Breakdown
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(analysis.categoryBreakdown).map(([category, data]) => (
                <div key={category} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(category)}`}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </span>
                    <span className="text-lg font-bold text-gray-900">
                      {formatCurrency(data.total)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {data.count} {data.count === 1 ? 'item' : 'items'}
                  </p>
                  <div className="mt-2 space-y-1">
                    {data.items.slice(0, 2).map((item, idx) => (
                      <p key={idx} className="text-xs text-gray-500 truncate">
                        • {item}
                      </p>
                    ))}
                    {data.items.length > 2 && (
                      <p className="text-xs text-gray-400">
                        +{data.items.length - 2} more
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {alternatives.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-green-600" />
                Cheaper Alternatives
                <span className="text-sm font-normal text-gray-600">
                  (Save on these items)
                </span>
              </h3>
              <div className="space-y-4">
                {alternatives.map((alt, idx) => (
                  <div key={idx} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="mb-3">
                      <p className="text-sm text-gray-500 mb-1">Current Selection:</p>
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-gray-900">{alt.original.name}</p>
                        <p className="font-bold text-gray-900">{formatCurrency(alt.original.price)}</p>
                      </div>
                    </div>
                    <div className="border-t border-gray-200 pt-3">
                      <p className="text-sm text-gray-500 mb-2">Cheaper options:</p>
                      <div className="space-y-2">
                        {alt.alternatives.map((altService: Service) => {
                          const savings = alt.original.price - altService.price;
                          return (
                            <div
                              key={altService.id}
                              className="flex items-center justify-between bg-green-50 p-3 rounded-lg"
                            >
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">
                                  {altService.name}
                                </p>
                                <p className="text-xs text-gray-600 mt-1">
                                  Rating: {altService.rating} ⭐
                                </p>
                              </div>
                              <div className="text-right ml-4">
                                <p className="font-bold text-gray-900">
                                  {formatCurrency(altService.price)}
                                </p>
                                <p className="text-xs text-green-600 font-medium">
                                  Save {formatCurrency(savings)}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            {onSavePlan && (
              <button
                onClick={onSavePlan}
                className="flex-1 bg-slate-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-slate-800 transition-colors"
              >
                Save This Plan
              </button>
            )}
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
