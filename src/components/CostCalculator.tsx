import React, { useState } from 'react';
import { Calculator, TrendingUp, TrendingDown, DollarSign, Calendar, CheckCircle2 } from 'lucide-react';

interface CostCalculatorProps {
  selectedServices: Array<{
    id: string;
    name: string;
    type: string;
    price: number;
  }>;
  userBudget: {
    min: number;
    max: number;
  };
}

export const CostCalculator: React.FC<CostCalculatorProps> = ({ selectedServices, userBudget }) => {
  const [selectedItems, setSelectedItems] = useState<Record<string, boolean>>({});

  // Calculate totals
  const selectedServicesList = selectedServices.filter(service => selectedItems[service.id]);
  const totalMonthly = selectedServicesList.reduce((sum, service) => sum + (service.price || 0), 0);
  const totalDaily = totalMonthly / 30;

  // Budget analysis
  const budgetMax = userBudget.max || 0;
  const budgetMin = userBudget.min || 0;
  const isOverBudget = totalMonthly > budgetMax;
  const budgetUsagePercent = budgetMax > 0 ? (totalMonthly / budgetMax) * 100 : 0;

  const toggleService = (serviceId: string) => {
    setSelectedItems(prev => ({
      ...prev,
      [serviceId]: !prev[serviceId]
    }));
  };

  const selectAll = () => {
    const allSelected = selectedServices.reduce((acc, service) => {
      acc[service.id] = true;
      return acc;
    }, {} as Record<string, boolean>);
    setSelectedItems(allSelected);
  };

  const clearAll = () => {
    setSelectedItems({});
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="p-3 sm:p-4 md:p-6 border-b border-slate-200">
        <div className="flex flex-col gap-3">
          <div className="flex items-start space-x-2 sm:space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Calculator className="w-4 h-4 sm:w-5 sm:h-5 text-slate-700" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm sm:text-base md:text-lg font-bold text-slate-900">Cost Calculator</h3>
              <p className="text-xs text-slate-600">Select services to calculate monthly costs</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 justify-end">
            <button
              onClick={selectAll}
              className="px-2 sm:px-3 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              Select All
            </button>
            <button
              onClick={clearAll}
              className="px-2 sm:px-3 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              Clear All
            </button>
          </div>
        </div>
      </div>

      <div className="p-3 sm:p-4 md:p-6">
        {/* Cost Summary Cards */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
          {/* Daily Cost */}
          <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg p-3 sm:p-4 md:p-6 text-white">
            <div className="flex items-center justify-between mb-1 sm:mb-2">
              <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 opacity-80" />
              <span className="text-[10px] sm:text-xs font-medium opacity-80">Daily</span>
            </div>
            <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-0.5">₹{Math.round(totalDaily).toLocaleString()}</div>
            <div className="text-[10px] sm:text-xs opacity-80">per day</div>
          </div>

          {/* Monthly Cost */}
          <div className="bg-gradient-to-br from-slate-600 to-slate-700 rounded-lg p-3 sm:p-4 md:p-6 text-white">
            <div className="flex items-center justify-between mb-1 sm:mb-2">
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 opacity-80" />
              <span className="text-[10px] sm:text-xs font-medium opacity-80">Monthly</span>
            </div>
            <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-0.5">₹{totalMonthly.toLocaleString()}</div>
            <div className="text-[10px] sm:text-xs opacity-80">per month</div>
          </div>
        </div>

        {/* Budget Analysis */}
        {budgetMax > 0 && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 md:p-6 rounded-lg border-2 border-dashed border-slate-200 bg-slate-50">
            <div className="flex items-center justify-between gap-2 mb-3">
              <h4 className="text-xs sm:text-sm md:text-base font-semibold text-slate-900">Budget Analysis</h4>
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] sm:text-xs font-medium ${
                isOverBudget ? 'bg-red-100 text-red-700' : 
                budgetUsagePercent > 80 ? 'bg-yellow-100 text-yellow-700' : 
                'bg-green-100 text-green-700'
              }`}>
                {isOverBudget ? (
                  <>
                    <TrendingUp className="w-4 h-4" />
                    Over Budget
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Within Budget
                  </>
                )}
              </div>
            </div>
            
            <div className="space-y-2 sm:space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-slate-600">Budget Range:</span>
                <span className="font-medium text-slate-900">₹{budgetMin.toLocaleString()} - ₹{budgetMax.toLocaleString()}</span>
              </div>
              
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${
                    isOverBudget ? 'bg-red-500' : 
                    budgetUsagePercent > 80 ? 'bg-yellow-500' : 
                    'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(budgetUsagePercent, 100)}%` }}
                />
              </div>
              
              <div className="flex justify-between text-xs">
                <span className="text-slate-600">Usage: {budgetUsagePercent.toFixed(1)}%</span>
                {isOverBudget && (
                  <span className="text-red-600 font-medium">
                    ₹{(totalMonthly - budgetMax).toLocaleString()} over budget
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Services List */}
        <div className="space-y-2 sm:space-y-3">
          <h4 className="text-xs sm:text-sm md:text-base font-semibold text-slate-900">Available Services</h4>

          {selectedServices.length === 0 ? (
            <div className="text-center py-4 sm:py-6">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Calculator className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
              </div>
              <p className="text-xs text-slate-500">No services available for calculation</p>
            </div>
          ) : (
            <div className="space-y-1.5 sm:space-y-2 max-h-60 sm:max-h-64 md:max-h-80 overflow-y-auto">
              {selectedServices.map(service => {
                const isSelected = selectedItems[service.id] || false;
                return (
                  <label
                    key={service.id}
                    className={`flex items-center justify-between p-2.5 sm:p-3 md:p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'border-slate-700 bg-slate-50'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleService(service.id)}
                        className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-700 border-slate-300 rounded focus:ring-slate-700 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs sm:text-sm font-medium text-slate-900 truncate">{service.name}</div>
                        <div className="text-[10px] sm:text-xs text-slate-500 capitalize">{service.type}</div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <div className="text-xs sm:text-sm font-bold text-slate-900">
                        ₹{(service.price || 0).toLocaleString()}
                      </div>
                      <div className="text-[10px] sm:text-xs text-slate-500">/month</div>
                    </div>
                  </label>
                );
              })}
            </div>
          )}
          
          {/* Total */}
          {selectedServicesList.length > 0 && (
            <div className="border-t border-slate-200 pt-3 mt-3">
              <div className="flex items-center justify-between p-3 sm:p-4 bg-slate-700 text-white rounded-lg">
                <div>
                  <span className="text-xs sm:text-sm font-semibold">Total Cost</span>
                  <div className="text-[10px] sm:text-xs opacity-80">{selectedServicesList.length} services selected</div>
                </div>
                <div className="text-right">
                  <div className="text-base sm:text-lg md:text-xl font-bold">₹{totalMonthly.toLocaleString()}</div>
                  <div className="text-[10px] sm:text-xs opacity-80">/month</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};