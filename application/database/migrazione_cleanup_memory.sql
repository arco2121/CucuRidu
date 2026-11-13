-- Pulizia degli ID temporanei lasciati nella tabella memory.
-- Conserva gli ID delle stanze e dei giocatori (inclusi quelli espulsi) ancora
-- referenziati da stanze attive. Gli altri record piu' vecchi di 24 ore vengono
-- eliminati, recuperando anche i residui lasciati da processi terminati male.
-- Eseguire su Supabase dopo dump.sql o come migrazione sul database esistente.

CREATE INDEX IF NOT EXISTS idx_memory_created_at
    ON public.memory(created_at);

CREATE OR REPLACE FUNCTION public.delete_old_memory()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    DELETE FROM public.memory AS m
    WHERE (m.created_at IS NULL OR m.created_at < now() - INTERVAL '24 hours')
      AND NOT EXISTS (
          SELECT 1
          FROM public.stanze AS s
          WHERE s."stanza_Id" = m.item_id
             OR EXISTS (
                 SELECT 1
                 FROM jsonb_array_elements(COALESCE(s.stanza->'giocatori', '[]'::jsonb)) AS giocatore
                 WHERE giocatore->>0 = m.item_id
             )
             OR EXISTS (
                 SELECT 1
                 FROM jsonb_array_elements_text(COALESCE(s.stanza->'giocatoriPassati', '[]'::jsonb)) AS giocatore_id
                 WHERE giocatore_id = m.item_id
             )
      );
END;
$$;
