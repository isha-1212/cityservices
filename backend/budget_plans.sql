-- Create budget_plans table
CREATE TABLE IF NOT EXISTS budget_plans (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    name VARCHAR(255) NOT NULL,
    bookmark_ids TEXT[] NOT NULL,
    budget DECIMAL(10,2) NOT NULL,
    total_cost DECIMAL(10,2) NOT NULL,
    selected_items JSONB NOT NULL,
    category_breakdown JSONB NOT NULL,
    is_over_budget BOOLEAN NOT NULL,
    difference_amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_budget_plans_user_id ON budget_plans(user_id);

-- Add RLS policies
ALTER TABLE budget_plans ENABLE ROW LEVEL SECURITY;

-- Policy for inserting: users can only insert their own plans
CREATE POLICY insert_budget_plans ON budget_plans
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Policy for selecting: users can only view their own plans
CREATE POLICY select_budget_plans ON budget_plans
    FOR SELECT 
    USING (auth.uid() = user_id);

-- Policy for updating: users can only update their own plans
CREATE POLICY update_budget_plans ON budget_plans
    FOR UPDATE 
    USING (auth.uid() = user_id);

-- Policy for deleting: users can only delete their own plans
CREATE POLICY delete_budget_plans ON budget_plans
    FOR DELETE 
    USING (auth.uid() = user_id);