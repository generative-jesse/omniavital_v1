DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone authenticated can read posts" ON public.forum_posts;
CREATE POLICY "Members can read posts" ON public.forum_posts FOR SELECT TO authenticated
USING (auth.uid() IS NOT NULL AND COALESCE((auth.jwt() ->> 'is_anonymous')::boolean, false) = false);

DROP POLICY IF EXISTS "Anyone can insert email signups" ON public.email_signups;
CREATE POLICY "Anyone can submit a valid email" ON public.email_signups FOR INSERT TO anon, authenticated
WITH CHECK (char_length(email) <= 254 AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$');

DROP POLICY IF EXISTS "Products are publicly readable" ON public.products;
CREATE POLICY "Products catalog is readable" ON public.products FOR SELECT TO anon, authenticated
USING (true);