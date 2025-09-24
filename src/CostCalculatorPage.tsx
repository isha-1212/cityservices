import React, { useEffect, useMemo, useState } from 'react';
import { CostCalculator } from './components/CostCalculator';
import mockServices, { Service } from './data/mockServices';

// Simple page wrapper for the Cost Calculator.
// For now, we prefill with bookmarked services if available; otherwise show top items.
export const CostCalculatorPage: React.FC = () => {
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const raw = localStorage.getItem('local_bookmarks');
      if (raw) setBookmarkedIds(new Set(JSON.parse(raw)));
    } catch {}
  }, []);

  const items = useMemo(() => {
    const all = mockServices; // static demo list; later can include CSV-loaded items
    const chosen: Service[] = [];

    if (bookmarkedIds.size > 0) {
      for (const s of all) {
        if (s.id && bookmarkedIds.has(s.id)) chosen.push(s);
      }
    }

    if (chosen.length === 0) {
      // Fallback: a few representative items to start with
      chosen.push(...all.slice(0, 12));
    }

    return chosen.map(s => ({
      id: s.id || `${s.name}-${s.city}`,
      name: s.name,
      type: s.type,
      price: s.price || 0,
    }));
  }, [bookmarkedIds]);

  // Persisted budget defaults
  const [min, setMin] = useState<number>(() => Number(localStorage.getItem('calc_min_budget') || 0));
  const [max, setMax] = useState<number>(() => Number(localStorage.getItem('calc_max_budget') || 0));

  useEffect(() => {
    localStorage.setItem('calc_min_budget', String(min || 0));
  }, [min]);
  useEffect(() => {
    localStorage.setItem('calc_max_budget', String(max || 0));
  }, [max]);

  return (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">Cost Calculator</h2>
        <p className="text-slate-600">Estimate your monthly and daily costs. Select the services you intend to use.</p>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Monthly Budget Min</label>
            <input type="number" min={0} value={min} onChange={e => setMin(Number(e.target.value) || 0)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Monthly Budget Max</label>
            <input type="number" min={0} value={max} onChange={e => setMax(Number(e.target.value) || 0)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            <p className="text-xs text-slate-500 mt-1">Tip: set Max to 0 to ignore the upper limit.</p>
          </div>
        </div>
      </div>

      <CostCalculator selectedServices={items} userBudget={{ min, max }} />
    </div>
  );
};

export default CostCalculatorPage;
