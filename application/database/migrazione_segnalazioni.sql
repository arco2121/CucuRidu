-- ============================================================================
--  MIGRAZIONE "segnalazioni" per Cucu Ridu 2.5
--  Da eseguire sul database Supabase esistente. Non cancella niente.
--
--  Serve al pannello "Segnala" dentro il menu di pausa: i giocatori marcano
--  frasi e completamenti sbagliati mentre giocano, e li ritrovi su
--  /segnalazioni?chiave=... (la chiave e' la variabile SEGNALAZIONI_KEY)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.segnalazioni (
    id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    creato_at  timestamptz NOT NULL DEFAULT now(),
    stanza_id  text,
    giocatore  text,
    tipo       text NOT NULL,
    testo      text NOT NULL,
    nota       text,
    risolta    boolean NOT NULL DEFAULT false,
    CONSTRAINT segnalazioni_tipo_valido CHECK (tipo IN (
        'frase', 'completamento',
        -- proposte di roba nuova, dal pannello "Suggerisci"
        'suggerimento_frase', 'suggerimento_completamento'
    ))
);

CREATE INDEX IF NOT EXISTS idx_segnalazioni_creato ON public.segnalazioni(creato_at DESC);
CREATE INDEX IF NOT EXISTS idx_segnalazioni_tipo   ON public.segnalazioni(tipo);

-- Le segnalazioni non seguono la stanza: la stanza viene cancellata a fine
-- partita, ma la segnalazione deve restare. Per questo stanza_id e' solo un
-- testo, senza chiave esterna.

-- Comodo per fare pulizia quando hai sistemato le carte:
--   DELETE FROM public.segnalazioni WHERE risolta = true;
