# TODO: Budget Buddy Feature Implementation

## Tasks
- [x] Update backend schema to add services and budget_plans tables.
- [x] Add backend endpoints: POST /api/services/seed, GET /api/bookmarks/services, POST /api/budget/estimate, POST /api/budget/plans.
- [x] Implement estimation logic in backend with category breakdown, budget comparison, and smart suggestions.
- [x] Update Bookmarks.tsx to add Budget Buddy UI flow with modal, selection, budget input, results display, and save option.
- [x] Add Calculator icon import from lucide-react.
- [ ] Test the Budget Buddy feature end-to-end.

## Information Gathered
- Services use 'type' as category (accommodation, food, tiffin, etc.).
- Price is assumed monthly cost.
- Suggestions: Find cheaper alternatives in same category not selected, that reduce overage.

## Plan
- Backend: Add tables and endpoints for seeding, fetching, estimating, saving.
- Frontend: Add modal in Bookmarks with selection checkboxes, budget input, estimate button, display results with breakdown and suggestions, save plan option.

## Next Steps
- Test the feature by seeding services, bookmarking some, opening Budget Buddy, selecting items, entering budget, getting estimate, and saving plan.
