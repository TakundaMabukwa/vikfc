-- Create signatures table for the love contract
-- This table is PUBLIC so anyone can see the signatures

CREATE TABLE IF NOT EXISTS public.signatures (
  id TEXT PRIMARY KEY DEFAULT 'love-contract',
  vik_signature TEXT,
  shalom_signature TEXT,
  valentine_accepted BOOLEAN DEFAULT FALSE,
  vik_signed_at TIMESTAMPTZ,
  shalom_signed_at TIMESTAMPTZ,
  valentine_accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Allow public read access (anyone can view signatures)
ALTER TABLE public.signatures ENABLE ROW LEVEL SECURITY;

-- Anyone can read signatures
CREATE POLICY "signatures_public_read" ON public.signatures 
  FOR SELECT USING (true);

-- Anyone can insert signatures (for initial creation)
CREATE POLICY "signatures_public_insert" ON public.signatures 
  FOR INSERT WITH CHECK (true);

-- Anyone can update signatures (so both parties can sign)
CREATE POLICY "signatures_public_update" ON public.signatures 
  FOR UPDATE USING (true);

-- Insert default row if not exists
INSERT INTO public.signatures (id) 
VALUES ('love-contract') 
ON CONFLICT (id) DO NOTHING;
