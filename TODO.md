# TODO: Implement Dynamic Food Suggestions

## Tasks
- [ ] Modify foodSuggestions to be dynamic from allServices data
- [ ] Extract unique words from dish names, descriptions, and features
- [ ] Filter suggestions with prefix match to each word
- [ ] Test the suggestions functionality

## Information Gathered
- Current foodSuggestions is static array
- User wants suggestions from actual dish names in data
- Match prefix to each word in the sentence

## Plan
- Use useMemo to create foodSuggestions from allServices
- Split names, descriptions, features into words
- Filter words longer than 2 chars, capitalize first letter
- Sort the unique words
- Use prefix match for filtering suggestions
