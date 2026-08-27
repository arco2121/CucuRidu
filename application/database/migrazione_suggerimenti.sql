-- ============================================================================
--  MIGRAZIONE "suggerimenti" per Cucu Ridu 2.5
--  Da eseguire su Supabase DOPO migrazione_segnalazioni.sql. Non cancella
--  niente e non tocca le righe gia presenti.
--
--  Serve al pannello "Suggerisci" del menu di pausa: i giocatori propongono
--  frasi e completamenti NUOVI. Finiscono nella stessa tabella delle
--  segnalazioni, ma con un tipo diverso, cosi su /segnalazioni?chiave=...
--  restano separati dalle correzioni (c'e' il menu a tendina "Mostra").
--
--  Senza questa migrazione gli invii dei suggerimenti falliscono con un
--  errore di CHECK sul tipo (la tabella conosceva solo 'frase' e
--  'completamento').
-- ============================================================================

ALTER TABLE public.segnalazioni
    DROP CONSTRAINT IF EXISTS segnalazioni_tipo_valido;

ALTER TABLE public.segnalazioni
    ADD CONSTRAINT segnalazioni_tipo_valido CHECK (tipo IN (
        'frase',
        'completamento',
        'suggerimento_frase',
        'suggerimento_completamento'
    ));

-- Comodo per guardare solo le proposte nuove:
--   SELECT creato_at, tipo, testo, giocatore FROM public.segnalazioni
--   WHERE tipo LIKE 'suggerimento_%' AND risolta = false
--   ORDER BY creato_at DESC;
