GRANT INSERT ON public.purchases TO authenticated;

CREATE POLICY "Users can create own purchases"
ON public.purchases
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);