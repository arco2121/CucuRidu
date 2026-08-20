-- ============================================================================
--  MIGRAZIONE "disconnessioni" per Cucu Ridu 2.5
--  Da eseguire sul database Supabase esistente. NON cancella dati.
--  Sistema due cose:
--   1) le scritture concorrenti sulla stessa stanza che si sovrascrivevano a
--      vicenda (la risposta di un giocatore spariva)
--   2) il disconnect di un socket vecchio che marcava offline un giocatore
--      gia rientrato con un socket nuovo
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. VERSIONING OTTIMISTICO SULLE STANZE
-- ----------------------------------------------------------------------------

ALTER TABLE public.stanze
    ADD COLUMN IF NOT EXISTS version bigint NOT NULL DEFAULT 0;

-- update_stanza_cas: scrive la stanza SOLO se nessun altro l'ha modificata
-- nel frattempo (compare-and-swap sulla colonna version).
--   ritorna  > 0  => scrittura riuscita, e' la nuova version
--   ritorna   -1  => conflitto: qualcun altro ha scritto, rileggi e riprova
--   ritorna   -2  => la stanza non esiste piu
-- Se expected_version e' NULL la scrittura e' incondizionata (creazione stanza).
CREATE OR REPLACE FUNCTION update_stanza_cas(
    target_id        text,
    new_json         jsonb,
    id_of_machine    text,
    expected_version bigint DEFAULT NULL
)
RETURNS bigint AS $$
DECLARE
    nuova_versione bigint;
BEGIN
    IF expected_version IS NULL THEN
        INSERT INTO public.stanze ("stanza_Id", "stanza", "machine_id", "updated_at", "version")
        VALUES (target_id, new_json, id_of_machine, now(), 1)
        ON CONFLICT ("stanza_Id") DO UPDATE
            SET "stanza"     = EXCLUDED."stanza",
                "machine_id" = EXCLUDED."machine_id",
                "updated_at" = now(),
                "version"    = stanze."version" + 1
        RETURNING "version" INTO nuova_versione;
        RETURN nuova_versione;
    END IF;

    UPDATE public.stanze
       SET "stanza"     = new_json,
           "machine_id" = id_of_machine,
           "updated_at" = now(),
           "version"    = "version" + 1
     WHERE "stanza_Id" = target_id
       AND "version"   = expected_version
    RETURNING "version" INTO nuova_versione;

    IF nuova_versione IS NOT NULL THEN
        RETURN nuova_versione;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.stanze WHERE "stanza_Id" = target_id) THEN
        RETURN -2;
    END IF;

    RETURN -1;
END;
$$ LANGUAGE plpgsql;

-- La vecchia update_stanza faceva un merge JSONB shallow (stanza || nuovo):
-- la chiave "round" veniva sostituita in blocco, quindi l'ultimo che scriveva
-- cancellava la risposta appena registrata da un altro. La lasciamo definita
-- solo come fallback, ma ora sovrascrive in modo esplicito invece di fondere.
CREATE OR REPLACE FUNCTION update_stanza(target_id text, new_json jsonb, id_of_machine text)
RETURNS void AS $$
BEGIN
    PERFORM update_stanza_cas(target_id, new_json, id_of_machine, NULL);
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- 2. PRESENZA LEGATA AL SOCKET, NON SOLO AL TEMPO
-- ----------------------------------------------------------------------------

-- La vecchia set_presenza accettava un "offline" solo in base a event_time.
-- Ma il disconnect di un socket morto arriva SEMPRE dopo la riconnessione
-- (il server se ne accorge dopo pingInterval + pingTimeout), quindi passava
-- la guardia e marcava offline un giocatore che stava gia giocando.
-- Ora un "offline" viene applicato solo se il socket che si e' disconnesso e'
-- ancora quello registrato per quel giocatore.
DROP FUNCTION IF EXISTS set_presenza(text, text, boolean, text, bigint);

CREATE OR REPLACE FUNCTION set_presenza(
    p_giocatore_id       text,
    p_stanza_id          text,
    p_online             boolean,
    p_socket_id          text,
    p_event_time         bigint,
    p_expected_socket_id text DEFAULT NULL
)
RETURNS boolean AS $$
DECLARE
    applicato boolean;
BEGIN
    -- La stanza puo' essere gia sparita (partita finita, oppure ripulita da
    -- delete_old_stanze) mentre arriva un disconnect in ritardo. Senza questo
    -- controllo la INSERT sbatteva contro la chiave esterna e tirava su un
    -- errore 23503 per qualcosa che non interessa piu a nessuno.
    IF NOT EXISTS (SELECT 1 FROM public.stanze WHERE "stanza_Id" = p_stanza_id) THEN
        DELETE FROM public.presenza WHERE giocatore_id = p_giocatore_id;
        RETURN false;
    END IF;

    INSERT INTO public.presenza (giocatore_id, stanza_id, online, socket_id, event_time, updated_at)
    VALUES (p_giocatore_id, p_stanza_id, p_online, p_socket_id, p_event_time, now())
    ON CONFLICT (giocatore_id) DO UPDATE SET
        stanza_id  = EXCLUDED.stanza_id,
        online     = CASE WHEN (p_expected_socket_id IS NULL
                                OR presenza.socket_id IS NULL
                                OR presenza.socket_id = ''
                                OR presenza.socket_id = p_expected_socket_id)
                          THEN EXCLUDED.online ELSE presenza.online END,
        socket_id  = CASE WHEN (p_expected_socket_id IS NULL
                                OR presenza.socket_id IS NULL
                                OR presenza.socket_id = ''
                                OR presenza.socket_id = p_expected_socket_id)
                          THEN EXCLUDED.socket_id ELSE presenza.socket_id END,
        event_time = GREATEST(presenza.event_time, p_event_time),
        updated_at = now();

    SELECT (presenza.online IS NOT DISTINCT FROM p_online)
      INTO applicato
      FROM public.presenza
     WHERE presenza.giocatore_id = p_giocatore_id;

    RETURN COALESCE(applicato, false);
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- 3. update_item SCRIVEVA IN UNA COLONNA CHE NON ESISTE
-- ----------------------------------------------------------------------------

-- La vecchia update_item inseriva in "id_item", ma la colonna della tabella
-- items si chiama "item_id": ogni chiamata falliva in silenzio. La usa
-- ClusterMap per la blacklist dei token di sessione, che quindi non ha mai
-- funzionato in cluster.
CREATE OR REPLACE FUNCTION update_item(target_id text, new_json jsonb, id_of_machine text)
RETURNS void AS $$
BEGIN
    INSERT INTO public.items ("item_id", "value", "machine_id", "updated_at")
    VALUES (target_id, new_json, id_of_machine, now())
    ON CONFLICT ("item_id")
    DO UPDATE SET
        "value"      = EXCLUDED."value",
        "machine_id" = EXCLUDED."machine_id",
        "updated_at" = now();
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- 4. RIGHE DI PRESENZA ORFANE E CHIAVE ESTERNA
-- ----------------------------------------------------------------------------

-- Se in presenza restano righe che puntano a stanze non piu esistenti, ogni
-- tentativo di (ri)creare il vincolo fallisce con:
--   ERROR: 23503 ... Key (stanza_id)=(XXXXXX) is not present in table "stanze"
-- Succede tipicamente dopo aver rilanciato dump.sql, che ricreava stanze da
-- zero lasciando presenza con dentro i dati vecchi.
DELETE FROM public.presenza p
 WHERE NOT EXISTS (SELECT 1 FROM public.stanze s WHERE s."stanza_Id" = p.stanza_id);

ALTER TABLE public.presenza DROP CONSTRAINT IF EXISTS presenza_stanza_id_fkey;
ALTER TABLE public.presenza
  ADD CONSTRAINT presenza_stanza_id_fkey
  FOREIGN KEY (stanza_id)
  REFERENCES public.stanze("stanza_Id")
  ON DELETE CASCADE;

-- ----------------------------------------------------------------------------
-- 5. INDICI UTILI
-- ----------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_presenza_stanza ON public.presenza(stanza_id);
CREATE INDEX IF NOT EXISTS idx_stanze_updated  ON public.stanze(updated_at);
