# TODO: Fix Contact Provider Button for Accommodation Area Links

## Tasks
- [x] Create src/data/areasMap.ts with imports of all area listing URLs and export a map object.
- [x] Modify src/components/ServiceDetails.tsx to import areasMap.
- [x] Add onClick handler to "Contact Provider" button in ServiceDetails.tsx.
- [x] Implement handler to normalize area name from service.meta['Locality / Area'], lookup URL in areasMap, and open in new tab.
- [x] Add fallback alert if area listing not found or service type is not accommodation.
- [ ] Test the button on accommodation services to verify correct area listing opens.

## Information Gathered
- Accommodation services have area info in service.meta['Locality / Area'].
- Area listing URLs are in src/data/areas/*.ts files.
- Button currently has no onClick handler.

## Plan
- Create areasMap.ts with all area listing imports and map.
- Update ServiceDetails.tsx to add handler and button onClick.
- Test functionality.

## Next Steps
- Await user confirmation to test or further improvements.
