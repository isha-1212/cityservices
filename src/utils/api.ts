const API_BASE_URL = 'http://localhost:5000';

export async function postBudgetEstimate(bookmarkIds: string[], budget: number) {
  const response = await fetch(`${API_BASE_URL}/api/budget/estimate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bookmarkIds, budget }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to get estimate');
  }
  return response.json();
}

export async function postSaveBudgetPlan(name: string, bookmarkIds: string[], budget: number, totalCost: number) {
  const response = await fetch(`${API_BASE_URL}/api/budget/plans`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, bookmarkIds, budget, totalCost }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to save plan');
  }
  return response.json();
}
