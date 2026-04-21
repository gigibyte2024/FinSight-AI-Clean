
CREATE TABLE public.linked_upis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  upi_id TEXT NOT NULL,
  label TEXT DEFAULT 'Personal',
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.linked_upis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own UPIs" ON public.linked_upis FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own UPIs" ON public.linked_upis FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own UPIs" ON public.linked_upis FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own UPIs" ON public.linked_upis FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_linked_upis_updated_at
BEFORE UPDATE ON public.linked_upis
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
