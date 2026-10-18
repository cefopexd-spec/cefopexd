-- Schéma initial CeFoPExD
-- Tables: inscriptions, contacts, newsletter

CREATE TABLE IF NOT EXISTS public.inscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nom TEXT NOT NULL,
  prenom TEXT NOT NULL,
  email TEXT,
  telephone TEXT NOT NULL,
  filiere TEXT NOT NULL,
  niveau_etude TEXT,
  message TEXT,
  statut TEXT DEFAULT 'en_attente',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nom TEXT NOT NULL,
  email TEXT NOT NULL,
  telephone TEXT,
  sujet TEXT,
  message TEXT NOT NULL,
  statut TEXT DEFAULT 'nouveau',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.newsletter (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.inscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public insert inscriptions') THEN
    CREATE POLICY "Allow public insert inscriptions" ON public.inscriptions FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public insert contacts') THEN
    CREATE POLICY "Allow public insert contacts" ON public.contacts FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public insert newsletter') THEN
    CREATE POLICY "Allow public insert newsletter" ON public.newsletter FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow service_role full inscriptions') THEN
    CREATE POLICY "Allow service_role full inscriptions" ON public.inscriptions FOR ALL USING (auth.role() = 'service_role');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow service_role full contacts') THEN
    CREATE POLICY "Allow service_role full contacts" ON public.contacts FOR ALL USING (auth.role() = 'service_role');
  END IF;
END
$$;
