/*
  # Budget Buddy Schema

  1. New Tables
    - `budget_plans`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `name` (text) - Optional name for the budget plan
      - `total_budget` (decimal) - User's monthly budget
      - `total_cost` (decimal) - Calculated total cost of selected items
      - `selected_items` (jsonb) - Array of selected service IDs with their costs
      - `category_breakdown` (jsonb) - Cost breakdown by category
      - `is_over_budget` (boolean) - Whether the plan exceeds budget
      - `difference_amount` (decimal) - Difference between budget and cost
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `budget_plans` table
    - Add policies for users to manage their own budget plans
*/

CREATE TABLE IF NOT EXISTS budget_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text DEFAULT '',
  total_budget decimal(10, 2) NOT NULL,
  total_cost decimal(10, 2) NOT NULL DEFAULT 0,
  selected_items jsonb DEFAULT '[]'::jsonb,
  category_breakdown jsonb DEFAULT '{}'::jsonb,
  is_over_budget boolean DEFAULT false,
  difference_amount decimal(10, 2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE budget_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own budget plans"
  ON budget_plans
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own budget plans"
  ON budget_plans
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own budget plans"
  ON budget_plans
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own budget plans"
  ON budget_plans
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_budget_plans_user_id ON budget_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_budget_plans_created_at ON budget_plans(created_at DESC);
