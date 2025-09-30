# Robust Service Filtering & Combination Logic - Usage Guide

## Overview

This guide explains how to use the robust filtering and combination logic from `serviceFilteringLogic.ts` in your ServiceSearch component.

## Key Features

### 1. **Automatic Monthly Cost Conversion**
All services are normalized to monthly costs for fair comparison:
- **Accommodation**: Already monthly (no conversion)
- **Tiffin**: Per-tiffin price × 2 meals/day × 30 days
- **Food**: Per-item price × 60 meals/month (2/day)
- **Transport**: Daily cost × 30 days (if applicable)

### 2. **Advanced Filtering**
Filters services by:
- Search query (name, city, description)
- City selection
- Service types (multi-select)
- Budget range (monthly)
- Minimum rating
- Area (for accommodation)
- Food type (for food/tiffin)

### 3. **Smart Combination Generation**
- Generates all possible combinations within budget
- **Prioritizes cheapest combinations first**
- Converts everything to monthly basis
- Handles user-selected specific items
- Performance-optimized with limits

## Basic Usage

### Step 1: Import the Functions

```typescript
import {
  applyAdvancedFilters,
  generateServiceCombinations,
  getCheapestCombination,
  getAllCombinationsSorted,
  getServiceStatistics,
  FilterCriteria
} from '../utils/serviceFilteringLogic';
```

### Step 2: Define Filter Criteria

```typescript
const criteria: FilterCriteria = {
  searchQuery: '', // Optional search text
  selectedCity: 'Ahmedabad', // Or empty for all cities
  selectedTypes: ['accommodation', 'food', 'tiffin'], // Services user wants
  priceRange: [0, 15000], // Monthly budget range
  minRating: 4.0, // Minimum rating filter
  areaQuery: 'Bodakdev', // Optional area filter
  foodQuery: 'Gujarati' // Optional food type filter
};
```

### Step 3: Get Filtered Services

```typescript
// Get all services matching filters
const filteredServices = applyAdvancedFilters(allServices, criteria);

// Get statistics
const stats = getServiceStatistics(allServices, criteria);
console.log('Total services:', stats.totalServices);
console.log('Services by type:', stats.servicesByType);
console.log('Cheapest by type:', stats.cheapestByType);
```

### Step 4: Generate Combinations

```typescript
// Get cheapest combination + all combinations sorted by price
const result = getAllCombinationsSorted(allServices, criteria, {
  maxCombinations: 1000, // Max combinations to generate
  maxServicesPerType: 20, // Max services per type to consider
});

// The absolute cheapest combination
const cheapestCombo = result.cheapest;
if (cheapestCombo) {
  console.log('Cheapest combination:', cheapestCombo.totalMonthlyPrice);
  console.log('Services:', cheapestCombo.services.map(s => s.name));
  console.log('Breakdown:', cheapestCombo.breakdown);
}

// All combinations sorted by price (cheapest first)
const allCombinations = result.allCombinations;
console.log('Total combinations found:', result.totalFound);
```

### Step 5: Handle User-Selected Specific Items

```typescript
// If user selects a specific accommodation
const specificSelections = {
  'accommodation': 'accommodation-123', // serviceId
  // Other types will show all options
};

const customResult = generateServiceCombinations(
  allServices,
  criteria,
  {
    maxCombinations: 1000,
    maxServicesPerType: 20,
    specificSelections // Pass user selections
  }
);

// This will generate combinations with the selected accommodation
// and all possible food/tiffin options
```

## Complete Example Integration

```typescript
const ServiceSearch: React.FC = () => {
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [criteria, setCriteria] = useState<FilterCriteria>({
    searchQuery: '',
    selectedCity: '',
    selectedTypes: [],
    priceRange: [0, 100000],
    minRating: 0,
    areaQuery: '',
    foodQuery: ''
  });

  // Generate combinations using useMemo for performance
  const combinationResults = useMemo(() => {
    if (criteria.selectedTypes.length < 2) {
      return { cheapest: null, allCombinations: [], totalFound: 0 };
    }

    return getAllCombinationsSorted(allServices, criteria, {
      maxCombinations: 1000,
      maxServicesPerType: 20
    });
  }, [allServices, criteria]);

  // Get filtered individual services
  const filteredIndividualServices = useMemo(() => {
    return applyAdvancedFilters(allServices, criteria)
      .sort((a, b) => convertToMonthlyPrice(a) - convertToMonthlyPrice(b));
  }, [allServices, criteria]);

  // Get statistics
  const stats = useMemo(() => {
    return getServiceStatistics(allServices, criteria);
  }, [allServices, criteria]);

  return (
    <div>
      {/* Show cheapest combination first */}
      {combinationResults.cheapest && (
        <div className="bg-green-50 p-6 rounded-xl mb-6">
          <h3 className="text-xl font-bold text-green-900 mb-2">
            🎯 Cheapest Combination
          </h3>
          <div className="text-2xl font-bold text-green-700 mb-4">
            ₹{combinationResults.cheapest.totalMonthlyPrice.toLocaleString()}/month
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {combinationResults.cheapest.services.map(service => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </div>
      )}

      {/* Show all combinations sorted by price */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold">
          All Combinations ({combinationResults.totalFound})
        </h3>
        {combinationResults.allCombinations.map(combo => (
          <CombinationCard key={combo.id} combination={combo} />
        ))}
      </div>

      {/* Show individual services */}
      <div className="mt-8">
        <h3 className="text-xl font-bold">Individual Services</h3>
        <div className="grid grid-cols-3 gap-4">
          {filteredIndividualServices.map(service => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </div>

      {/* Show statistics */}
      <div className="mt-8 bg-blue-50 p-6 rounded-xl">
        <h3 className="text-xl font-bold mb-4">Statistics</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-600">Total Services</div>
            <div className="text-2xl font-bold">{stats.totalServices}</div>
          </div>
          {Object.entries(stats.servicesByType).map(([type, count]) => (
            <div key={type}>
              <div className="text-sm text-gray-600 capitalize">{type}</div>
              <div className="text-2xl font-bold">{count}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
```

## Key Advantages

### 1. **Accurate Monthly Costs**
```typescript
// Before: Inconsistent pricing
food1.price = 150; // Is this per item or monthly?
tiffin1.price = 3000; // Is this per tiffin or monthly?

// After: Everything normalized
const monthlyFood = convertToMonthlyPrice(food1); // 9000 (150 × 60 meals)
const monthlyTiffin = convertToMonthlyPrice(tiffin1); // 3000 (already monthly)
```

### 2. **Cheapest-First Sorting**
```typescript
// Combinations are automatically sorted by total price
allCombinations[0] // Cheapest option
allCombinations[1] // Second cheapest
// ... and so on
```

### 3. **Smart Budget Validation**
```typescript
import { suggestBudgetAdjustments } from '../utils/serviceFilteringLogic';

const validation = suggestBudgetAdjustments(allServices, criteria);
if (!validation.isRealistic) {
  alert(validation.message);
  // Suggest: validation.suggestedBudget
}
```

### 4. **Performance Optimization**
```typescript
// Limits prevent browser freeze
generateServiceCombinations(services, criteria, {
  maxCombinations: 1000, // Stop after 1000 combinations
  maxServicesPerType: 20 // Only consider 20 cheapest per type
});
```

## Common Scenarios

### Scenario 1: User Wants Accommodation + Food
```typescript
const criteria: FilterCriteria = {
  selectedTypes: ['accommodation', 'food'],
  priceRange: [0, 20000],
  selectedCity: 'Ahmedabad',
  // ... other filters
};

const result = getAllCombinationsSorted(services, criteria);
// Shows cheapest accommodation+food combo first
// Then all other combinations sorted by price
```

### Scenario 2: User Selects Specific Accommodation
```typescript
const specificSelections = {
  'accommodation': 'acc-123' // User clicked on this specific room
};

const result = generateServiceCombinations(services, criteria, {
  maxCombinations: 500,
  specificSelections
});

// Shows all food options paired with selected accommodation
// Sorted by total price
```

### Scenario 3: User Wants All Services (Accommodation + Food + Tiffin + Transport)
```typescript
const criteria: FilterCriteria = {
  selectedTypes: ['accommodation', 'food', 'tiffin', 'transport'],
  priceRange: [0, 30000],
  // ... other filters
};

const result = getAllCombinationsSorted(services, criteria);
// Generates 4-service combinations
// Shows cheapest complete package first
```

## Performance Tips

1. **Use `useMemo`** for expensive calculations
2. **Limit `maxServicesPerType`** to 10-20 for large datasets
3. **Limit `maxCombinations`** to 500-1000
4. **Debounce** filter changes (wait 300ms before recalculating)
5. **Paginate** results display

## Migration from Old Logic

### Before:
```typescript
// Old way - manual filtering
const filtered = allServices.filter(s => {
  // Complex nested conditions
  // No monthly normalization
  // No combination logic
});
```

### After:
```typescript
// New way - use robust functions
const filtered = applyAdvancedFilters(allServices, criteria);
const combinations = getAllCombinationsSorted(allServices, criteria);
```

## Troubleshooting

### Issue: No combinations found
**Solution**: Check if budget is too low
```typescript
const validation = suggestBudgetAdjustments(services, criteria);
console.log(validation.message);
```

### Issue: Too slow / browser freezes
**Solution**: Reduce limits
```typescript
{
  maxCombinations: 200, // Lower this
  maxServicesPerType: 10 // Lower this
}
```

### Issue: Prices seem wrong
**Solution**: Check if services are already monthly
```typescript
// Add logging to see conversions
services.forEach(s => {
  console.log(s.name, s.price, '->', convertToMonthlyPrice(s));
});
```

## Summary

This robust logic provides:
- ✅ Accurate monthly cost conversion
- ✅ Cheapest combinations first
- ✅ All combinations within budget
- ✅ Support for user-selected items
- ✅ Performance-optimized
- ✅ Easy to integrate
- ✅ Type-safe with TypeScript

Use it to replace your current filtering and combination logic for a more reliable, accurate, and user-friendly experience!
