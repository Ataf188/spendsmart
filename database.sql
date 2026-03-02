-- Supabase Dashboard > SQL Editor mein ye paste karo aur Run karo

-- Expenses table
CREATE TABLE expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  amount DECIMAL NOT NULL,
  category TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Har user sirf apna data dekhe (Row Level Security)
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own expenses"
ON expenses FOR ALL
USING (auth.uid() = user_id);
