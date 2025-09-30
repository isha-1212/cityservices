-- Create the wishlists table in Supabase
CREATE TABLE public.wishlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    service_id TEXT NOT NULL,
    service_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    CONSTRAINT wishlists_user_id_service_id_key UNIQUE (user_id, service_id)
);

-- Add RLS policies
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view their own wishlist items
CREATE POLICY "Users can view their own wishlist items" ON public.wishlists
    FOR SELECT
    USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own wishlist items
CREATE POLICY "Users can add items to their wishlist" ON public.wishlists
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own wishlist items
CREATE POLICY "Users can update their own wishlist items" ON public.wishlists
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Create policy to allow users to delete their own wishlist items
CREATE POLICY "Users can delete their own wishlist items" ON public.wishlists
    FOR DELETE
    USING (auth.uid() = user_id);

-- Function to create wishlists table if it doesn't exist
CREATE OR REPLACE FUNCTION create_wishlists_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'wishlists'
    ) THEN
        CREATE TABLE public.wishlists (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID NOT NULL,
            service_id TEXT NOT NULL,
            service_data JSONB DEFAULT '{}'::jsonb,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
            CONSTRAINT wishlists_user_id_service_id_key UNIQUE (user_id, service_id)
        );

        ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;

        -- Create policies
        CREATE POLICY "Users can view their own wishlist items" ON public.wishlists
            FOR SELECT
            USING (auth.uid() = user_id);

        CREATE POLICY "Users can add items to their wishlist" ON public.wishlists
            FOR INSERT
            WITH CHECK (auth.uid() = user_id);

        CREATE POLICY "Users can update their own wishlist items" ON public.wishlists
            FOR UPDATE
            USING (auth.uid() = user_id);

        CREATE POLICY "Users can delete their own wishlist items" ON public.wishlists
            FOR DELETE
            USING (auth.uid() = user_id);
    END IF;
END;
$$;
