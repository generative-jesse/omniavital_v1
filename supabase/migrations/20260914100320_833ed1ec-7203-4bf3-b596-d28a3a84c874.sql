
-- Prevent duplicate ritual rows for same product/day so agent + UI stay in sync
DELETE FROM public.ritual_logs a USING public.ritual_logs b
WHERE a.ctid < b.ctid AND a.user_id = b.user_id AND a.logged_date = b.logged_date
  AND a.product_id IS NOT DISTINCT FROM b.product_id;

CREATE UNIQUE INDEX IF NOT EXISTS ritual_logs_user_product_date_key
  ON public.ritual_logs (user_id, product_id, logged_date);

CREATE POLICY "Users can delete own logs" ON public.ritual_logs
  FOR DELETE USING (auth.uid() = user_id);

-- DIET LOGS
CREATE TABLE public.diet_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  logged_date date NOT NULL DEFAULT CURRENT_DATE,
  logged_at timestamptz NOT NULL DEFAULT now(),
  meal text NOT NULL DEFAULT 'other',
  raw_text text,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  calories integer,
  protein_g numeric,
  carbs_g numeric,
  fat_g numeric,
  source text NOT NULL DEFAULT 'app',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.diet_logs TO authenticated;
GRANT ALL ON public.diet_logs TO service_role;
ALTER TABLE public.diet_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own diet logs" ON public.diet_logs
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- MOOD LOGS
CREATE TABLE public.mood_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  logged_date date NOT NULL DEFAULT CURRENT_DATE,
  logged_at timestamptz NOT NULL DEFAULT now(),
  mood text NOT NULL,
  score integer,
  energy integer,
  tags text[] NOT NULL DEFAULT '{}',
  raw_text text,
  source text NOT NULL DEFAULT 'app',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mood_logs TO authenticated;
GRANT ALL ON public.mood_logs TO service_role;
ALTER TABLE public.mood_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own mood logs" ON public.mood_logs
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- JOURNAL
CREATE TABLE public.journal_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  logged_date date NOT NULL DEFAULT CURRENT_DATE,
  logged_at timestamptz NOT NULL DEFAULT now(),
  title text,
  body text NOT NULL,
  tags text[] NOT NULL DEFAULT '{}',
  source text NOT NULL DEFAULT 'app',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.journal_entries TO authenticated;
GRANT ALL ON public.journal_entries TO service_role;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own journal" ON public.journal_entries
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- CHECK-IN REMINDERS
CREATE TABLE public.checkin_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind text NOT NULL DEFAULT 'daily',
  remind_at timestamptz NOT NULL,
  message text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.checkin_reminders TO authenticated;
GRANT ALL ON public.checkin_reminders TO service_role;
ALTER TABLE public.checkin_reminders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own reminders" ON public.checkin_reminders
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER diet_logs_updated_at BEFORE UPDATE ON public.diet_logs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER mood_logs_updated_at BEFORE UPDATE ON public.mood_logs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER journal_entries_updated_at BEFORE UPDATE ON public.journal_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER checkin_reminders_updated_at BEFORE UPDATE ON public.checkin_reminders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX diet_logs_user_date_idx ON public.diet_logs (user_id, logged_date DESC);
CREATE INDEX mood_logs_user_date_idx ON public.mood_logs (user_id, logged_date DESC);
CREATE INDEX journal_entries_user_date_idx ON public.journal_entries (user_id, logged_date DESC);
