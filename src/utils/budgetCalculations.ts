import { Service } from '../data/mockServices';

export interface CategoryBreakdown {
  [category: string]: {
    total: number;
    items: string[];
    count: number;
  };
}

export interface BudgetAnalysis {
  totalCost: number;
  categoryBreakdown: CategoryBreakdown;
  isOverBudget: boolean;
  differenceAmount: number;
  selectedItems: Array<{
    id: string;
    name: string;
    type: string;
    price: number;
  }>;
}

export interface Alternative {
  original: Service;
  alternatives: Service[];
}

export const calculateBudgetAnalysis = (
  selectedServices: Service[],
  totalBudget: number
): BudgetAnalysis => {
  const categoryBreakdown: CategoryBreakdown = {};
  let totalCost = 0;

  const selectedItems = selectedServices.map(service => {
    const monthlyPrice = service.price;
    totalCost += monthlyPrice;

    const category = service.type;
    if (!categoryBreakdown[category]) {
      categoryBreakdown[category] = {
        total: 0,
        items: [],
        count: 0
      };
    }

    categoryBreakdown[category].total += monthlyPrice;
    categoryBreakdown[category].items.push(service.name);
    categoryBreakdown[category].count += 1;

    return {
      id: service.id,
      name: service.name,
      type: service.type,
      price: monthlyPrice
    };
  });

  const isOverBudget = totalCost > totalBudget;
  const differenceAmount = totalBudget - totalCost;

  return {
    totalCost,
    categoryBreakdown,
    isOverBudget,
    differenceAmount,
    selectedItems
  };
};

export const findCheaperAlternatives = (
  selectedServices: Service[],
  allServices: Service[]
): Alternative[] => {
  const alternatives: Alternative[] = [];

  selectedServices.forEach(service => {
    const similarServices = allServices.filter(
      s =>
        s.type === service.type &&
        s.city === service.city &&
        s.id !== service.id &&
        s.price < service.price
    ).sort((a, b) => a.price - b.price).slice(0, 3);

    if (similarServices.length > 0) {
      alternatives.push({
        original: service,
        alternatives: similarServices
      });
    }
  });

  return alternatives;
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

export const getCategoryColor = (category: string): string => {
  const colors: { [key: string]: string } = {
    accommodation: 'bg-blue-100 text-blue-800',
    food: 'bg-green-100 text-green-800',
    tiffin: 'bg-orange-100 text-orange-800',
    transport: 'bg-purple-100 text-purple-800',
    coworking: 'bg-pink-100 text-pink-800',
    utilities: 'bg-yellow-100 text-yellow-800'
  };
  return colors[category] || 'bg-gray-100 text-gray-800';
};
