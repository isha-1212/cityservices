import { Service } from '../data/mockServices';

export interface FilterCriteria {
    searchQuery?: string;
    selectedCity?: string;
    selectedTypes: string[];
    priceRange: [number, number];
    minRating?: number;
    areaQuery?: string;
    foodQuery?: string;
}

const DAYS_IN_MONTH = 30;
const TYPICAL_MEALS_PER_DAY = 2;
const MEALS_PER_MONTH = DAYS_IN_MONTH * TYPICAL_MEALS_PER_DAY;

export function convertToMonthlyPrice(service: Service): number {
    const price = Number(service.price) || 0;
    switch (service.type) {
        case 'accommodation':
            return price;
        case 'tiffin':
            // assume per-tiffin price if small
            if (price < 500) return price * TYPICAL_MEALS_PER_DAY * DAYS_IN_MONTH;
            return price;
        case 'food':
            if (price < 1000) return price * MEALS_PER_MONTH;
            return price;
        case 'transport':
            if (price < 500) return price * DAYS_IN_MONTH;
            return price;
        default:
            return price;
    }
}

export function applyAdvancedFilters(services: Service[], criteria: FilterCriteria): Service[] {
    return services.filter(service => {
        const monthlyPrice = convertToMonthlyPrice(service);
        if (criteria.searchQuery) {
            const q = criteria.searchQuery.toLowerCase();
            if (!(service.name.toLowerCase().includes(q) || service.city.toLowerCase().includes(q) || service.description.toLowerCase().includes(q))) return false;
        }
        if (criteria.selectedCity && service.city !== criteria.selectedCity) return false;
        if (criteria.selectedTypes.length > 0 && !criteria.selectedTypes.includes(service.type)) return false;
        if (monthlyPrice < criteria.priceRange[0] || monthlyPrice > criteria.priceRange[1]) return false;
        if (criteria.minRating && service.rating < criteria.minRating) return false;
        if (criteria.areaQuery && service.type === 'accommodation') {
            const a = criteria.areaQuery.toLowerCase();
            const metaArea = (service.meta?.['Locality / Area'] || service.meta?.['Area'] || '').toString().toLowerCase();
            if (!(metaArea.includes(a) || service.name.toLowerCase().includes(a) || service.description.toLowerCase().includes(a))) return false;
        }
        if (criteria.foodQuery && (service.type === 'food' || service.type === 'tiffin')) {
            const f = criteria.foodQuery.toLowerCase();
            const featuresMatch = (service.features || []).some(fe => fe.toLowerCase().includes(f));
            const metaMatch = (service.meta && Object.values(service.meta).some(v => v && v.toString().toLowerCase().includes(f))) || false;
            if (!(service.name.toLowerCase().includes(f) || service.description.toLowerCase().includes(f) || featuresMatch || metaMatch)) return false;
        }
        return true;
    });
}

export interface ServiceCombination {
    id: string;
    services: Service[];
    totalMonthlyPrice: number;
    types: string[];
    breakdown: Record<string, number>;
}

export function generateServiceCombinations(services: Service[], criteria: FilterCriteria, options?: { maxCombinations?: number; maxServicesPerType?: number; specificSelections?: Record<string, string> }) {
    const maxCombinations = options?.maxCombinations ?? 1000;
    const maxServicesPerType = options?.maxServicesPerType ?? 20;
    if (criteria.selectedTypes.length < 2) return [] as ServiceCombination[];

    const servicesByType: Record<string, Service[]> = {};
    for (const type of criteria.selectedTypes) {
        const filtered = applyAdvancedFilters(services, { ...criteria, selectedTypes: [type] });
        const sorted = filtered.map(s => ({ ...s })).sort((a, b) => convertToMonthlyPrice(a) - convertToMonthlyPrice(b));
        servicesByType[type] = sorted.slice(0, maxServicesPerType);
    }

    const types = criteria.selectedTypes;
    const combinations: ServiceCombination[] = [];
    const maxBudget = criteria.priceRange[1];

    function generateCombos(i: number, current: Service[], total: number) {
        if (combinations.length >= maxCombinations) return;
        if (i === types.length) {
            if (total >= criteria.priceRange[0] && total <= maxBudget) {
                const breakdown: Record<string, number> = {};
                current.forEach(s => { breakdown[s.type] = convertToMonthlyPrice(s); });
                combinations.push({ id: current.map(s => s.id).sort().join('-'), services: [...current], totalMonthlyPrice: total, types: [...types], breakdown });
            }
            return;
        }
        const type = types[i];
        const list = servicesByType[type] || [];
        for (const s of list) {
            const monthly = convertToMonthlyPrice(s);
            const newTotal = total + monthly;
            if (newTotal <= maxBudget) {
                generateCombos(i + 1, [...current, s], newTotal);
            } else {
                break;
            }
        }
    }

    generateCombos(0, [], 0);
    combinations.sort((a, b) => a.totalMonthlyPrice - b.totalMonthlyPrice);
    return combinations;
}

export function getAllCombinationsSorted(services: Service[], criteria: FilterCriteria, options?: { maxCombinations?: number; maxServicesPerType?: number }) {
    const all = generateServiceCombinations(services, criteria, options);
    const cheapest = all.length ? all[0] : null;
    return { cheapest, allCombinations: all, totalFound: all.length };
}

export function getServiceStatistics(services: Service[], criteria: FilterCriteria) {
    const filtered = applyAdvancedFilters(services, criteria);
    const byType: Record<string, Service[]> = {};
    filtered.forEach(s => { byType[s.type] = byType[s.type] || []; byType[s.type].push(s); });
    const servicesByType: Record<string, number> = {};
    const priceRangeByType: Record<string, { min: number; max: number; avg: number }> = {};
    const cheapestByType: Record<string, Service> = {};

    Object.entries(byType).forEach(([type, list]) => {
        servicesByType[type] = list.length;
        const monthlyPrices = list.map(s => convertToMonthlyPrice(s));
        const min = Math.min(...monthlyPrices);
        const max = Math.max(...monthlyPrices);
        const avg = monthlyPrices.reduce((a, b) => a + b, 0) / monthlyPrices.length;
        priceRangeByType[type] = { min, max, avg };
        cheapestByType[type] = list.reduce((acc, cur) => convertToMonthlyPrice(cur) < convertToMonthlyPrice(acc) ? cur : acc, list[0]);
    });

    return { totalServices: filtered.length, servicesByType, priceRangeByType, cheapestByType };
}
