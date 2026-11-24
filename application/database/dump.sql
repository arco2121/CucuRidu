-- ============================================================================
--  DUMP COMPLETO SUPABASE - Cucu Ridu (con supporto identificativi sessione/JWT)
--  ATTENZIONE: questo file CANCELLA e ricrea le tabelle.
--  Su un database gia' in uso esegui invece migrazione_session_identificativi.sql,
--  che aggiorna lo schema senza distruggere i dati esistenti.
-- ============================================================================

DROP VIEW IF EXISTS public.v_sessioni_complete CASCADE;
DROP TABLE IF EXISTS public.session_identificativi CASCADE;
DROP TABLE IF EXISTS public.segnalazioni CASCADE;
DROP TABLE IF EXISTS public.memory CASCADE;
DROP TABLE IF EXISTS public.presenza CASCADE;
DROP TABLE IF EXISTS public.stanze CASCADE;
DROP TABLE IF EXISTS public.items CASCADE;
DROP TABLE IF EXISTS public.push_subscriptions CASCADE;
DROP TABLE IF EXISTS public.sessions CASCADE;

-- ----------------------------------------------------------------------------
-- 1. TABELLE CORE DI GIOCO E CLUSTER
-- ----------------------------------------------------------------------------

CREATE TABLE public.memory (
                               set_name text NOT NULL,
                               item_id text NOT NULL,
                               created_at timestamp with time zone DEFAULT now(),
                               CONSTRAINT memory_pkey PRIMARY KEY (set_name, item_id)
);

CREATE TABLE public.stanze (
                               "stanza_Id" text NOT NULL,
                               stanza jsonb DEFAULT '{}'::jsonb,
                               machine_id text NOT NULL,
                               updated_at timestamp with time zone DEFAULT now(),
                               version bigint NOT NULL DEFAULT 0,
                               CONSTRAINT stanze_pkey PRIMARY KEY ("stanza_Id")
);

CREATE TABLE public.items (
                              "item_id" text NOT NULL,
                              value jsonb DEFAULT '{}'::jsonb,
                              machine_id text NOT NULL,
                              updated_at timestamp with time zone DEFAULT now(),
                              CONSTRAINT items_pkey PRIMARY KEY ("item_id")
);

CREATE TABLE public.presenza (
                                 giocatore_id text PRIMARY KEY,
                                 stanza_id text NOT NULL,
                                 online boolean NOT NULL DEFAULT true,
                                 socket_id text,
                                 event_time bigint NOT NULL DEFAULT 0,
                                 updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.push_subscriptions (
                                           id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
                                           created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
                                           "client_Id" text NOT NULL,
                                           subscription jsonb DEFAULT '{}'::jsonb,
                                           endpoint text NOT NULL UNIQUE
);
CREATE INDEX IF NOT EXISTS idx_push_subs_client_id ON public.push_subscriptions("client_Id");

CREATE TABLE public.segnalazioni (
                                     id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                                     creato_at  timestamptz NOT NULL DEFAULT now(),
                                     stanza_id  text,
                                     giocatore  text,
                                     tipo       text NOT NULL,
                                     testo      text NOT NULL,
                                     nota       text,
                                     risolta    boolean NOT NULL DEFAULT false,
                                     CONSTRAINT segnalazioni_tipo_valido CHECK (tipo IN (
                                                                                         'frase',
                                                                                         'completamento',
                                                                                         'suggerimento_frase',
                                                                                         'suggerimento_completamento'
                                         ))
);
CREATE INDEX IF NOT EXISTS idx_segnalazioni_creato ON public.segnalazioni(creato_at DESC);
CREATE INDEX IF NOT EXISTS idx_segnalazioni_tipo   ON public.segnalazioni(tipo);

-- ----------------------------------------------------------------------------
-- 2. SESSIONI (connect-pg-simple) E MAPPATURA PARALLELA IDENTIFICATIVI / JWT
-- ----------------------------------------------------------------------------

-- Tabella standard usata da connect-pg-simple (Session.js)
CREATE TABLE public.sessions (
                                 "sid" varchar NOT NULL COLLATE "default" PRIMARY KEY,
                                 "sess" json NOT NULL,
                                 "expire" timestamp(6) NOT NULL
);
CREATE INDEX IF NOT EXISTS "IDX_sessions_expire" ON public.sessions ("expire");

-- Tabella parallela alle sessioni: associa una stringa personalizzata
-- (custom_id) al sid della sessione Express, al token JWT generato e/o a
-- metadati extra, permettendo di risalire a JWT e sessione partendo da custom_id.
-- Nota: sid non ha una FK bloccante verso sessions per evitare race-condition
-- (errore 23503) quando Session.set() viene chiamato prima del flush di
-- express-session a fine risposta, oppure quando si genera un JWT senza cookie.
CREATE TABLE public.session_identificativi (
                                               id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
                                               custom_id   text NOT NULL,
                                               sid         varchar NULL,
                                               jwt         text NULL,
                                               metadata    jsonb NOT NULL DEFAULT '{}'::jsonb,
                                               created_at  timestamptz NOT NULL DEFAULT now(),
                                               updated_at  timestamptz NOT NULL DEFAULT now(),
                                               expire      timestamptz NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_session_identificativi_custom_id ON public.session_identificativi(custom_id);
CREATE INDEX IF NOT EXISTS idx_session_identificativi_sid       ON public.session_identificativi(sid);
CREATE INDEX IF NOT EXISTS idx_session_identificativi_jwt       ON public.session_identificativi(jwt);
CREATE INDEX IF NOT EXISTS idx_session_identificativi_expire    ON public.session_identificativi(expire);

-- Vista di comodo per leggere in un colpo solo identificativo, JWT e payload
-- della sessione Express (sessions.sess) da Supabase o da codice.
CREATE OR REPLACE VIEW public.v_sessioni_complete AS
SELECT
    si.id,
    si.custom_id,
    si.sid,
    si.jwt,
    si.metadata,
    s.sess AS session_data,
    COALESCE(s.expire::timestamptz, si.expire) AS expire,
    si.created_at,
    si.updated_at
FROM public.session_identificativi si
         LEFT JOIN public.sessions s ON s.sid = si.sid;

-- Quando una sessione viene distrutta o potata da connect-pg-simple,
-- rimuove automaticamente anche i riferimenti collegati a quel sid.
CREATE OR REPLACE FUNCTION public.cleanup_identificativi_on_session_delete()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
DELETE FROM public.session_identificativi
WHERE sid = OLD.sid;
RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS trg_cleanup_session_identificativi ON public.sessions;
CREATE TRIGGER trg_cleanup_session_identificativi
    AFTER DELETE ON public.sessions
    FOR EACH ROW
    EXECUTE FUNCTION public.cleanup_identificativi_on_session_delete();

-- Salva o aggiorna in parallelo l'associazione custom_id -> (sid, jwt, metadata).
-- Se p_sostituisci = true (default), mantiene un solo record attivo per custom_id
-- evitando accumulo di vecchi JWT per lo stesso identificativo.
CREATE OR REPLACE FUNCTION public.salva_sessione_identificativo(
    p_custom_id   text,
    p_sid         varchar DEFAULT NULL,
    p_jwt         text DEFAULT NULL,
    p_expire      timestamptz DEFAULT (now() + INTERVAL '1 hour'),
    p_metadata    jsonb DEFAULT '{}'::jsonb,
    p_sostituisci boolean DEFAULT true
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
record_id uuid;
BEGIN
    IF p_custom_id IS NULL OR btrim(p_custom_id) = '' THEN
        RAISE EXCEPTION 'custom_id non puo essere vuoto';
END IF;

    IF p_sostituisci THEN
DELETE FROM public.session_identificativi
WHERE custom_id = p_custom_id
  AND (p_sid IS NULL OR sid IS DISTINCT FROM p_sid);
END IF;

    IF p_sid IS NOT NULL THEN
UPDATE public.session_identificativi
SET jwt        = COALESCE(p_jwt, jwt),
    metadata   = CASE WHEN p_metadata IS NULL OR p_metadata = '{}'::jsonb
                                 THEN metadata ELSE p_metadata END,
    expire     = GREATEST(expire, p_expire),
    updated_at = now()
WHERE custom_id = p_custom_id
  AND sid = p_sid
    RETURNING id INTO record_id;

IF record_id IS NOT NULL THEN
            RETURN record_id;
END IF;
END IF;

INSERT INTO public.session_identificativi (custom_id, sid, jwt, metadata, expire, created_at, updated_at)
VALUES (p_custom_id, p_sid, p_jwt, COALESCE(p_metadata, '{}'::jsonb), p_expire, now(), now())
    RETURNING id INTO record_id;

RETURN record_id;
END;
$$;

-- Risale a JWT, sid e dati di sessione (sessions.sess) a partire dalla stringa
-- personalizzata custom_id (restituisce solo record non ancora scaduti).
CREATE OR REPLACE FUNCTION public.trova_da_identificativo(p_custom_id text)
RETURNS TABLE (
    id           uuid,
    custom_id    text,
    sid          varchar,
    jwt          text,
    metadata     jsonb,
    session_data json,
    expire       timestamptz,
    updated_at   timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
SELECT
    si.id,
    si.custom_id,
    si.sid,
    si.jwt,
    si.metadata,
    s.sess AS session_data,
    COALESCE(s.expire::timestamptz, si.expire) AS expire,
    si.updated_at
FROM public.session_identificativi si
         LEFT JOIN public.sessions s ON s.sid = si.sid
WHERE si.custom_id = p_custom_id
  AND COALESCE(s.expire::timestamptz, si.expire) > now()
ORDER BY si.updated_at DESC;
$$;

-- Pulizia periodica dei record scaduti (in linea con delete_old_stanze / delete_old_memory)
CREATE OR REPLACE FUNCTION public.delete_old_session_identificativi()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
DELETE FROM public.session_identificativi
WHERE expire < now();
END;
$$;

-- ----------------------------------------------------------------------------
-- 3. FUNZIONI RPC ESISTENTI DI GIOCO E MANUTENZIONE
-- ----------------------------------------------------------------------------

-- Scrittura della stanza con compare-and-swap sulla colonna version.
--   > 0 => ok, e' la nuova version
--    -1 => conflitto, qualcun altro ha scritto: rileggi e riprova
--    -2 => la stanza non esiste piu
-- expected_version NULL => scrittura incondizionata (creazione stanza)
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

CREATE OR REPLACE FUNCTION update_stanza(target_id text, new_json jsonb, id_of_machine text)
RETURNS void AS $$
BEGIN
    PERFORM update_stanza_cas(target_id, new_json, id_of_machine, NULL);
END;
$$ LANGUAGE plpgsql;

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

CREATE OR REPLACE FUNCTION delete_old_presenza()
RETURNS void
SECURITY DEFINER
AS $$
BEGIN
DELETE FROM public.presenza
WHERE updated_at < (now() - INTERVAL '2 hours');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION delete_old_stanze()
RETURNS void
SECURITY DEFINER
AS $$
BEGIN
DELETE FROM public.stanze
WHERE updated_at < (now() - INTERVAL '1 hour');
END;
$$ LANGUAGE plpgsql;

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

DELETE FROM public.presenza p
WHERE NOT EXISTS (SELECT 1 FROM public.stanze s WHERE s."stanza_Id" = p.stanza_id);

ALTER TABLE public.presenza DROP CONSTRAINT IF EXISTS presenza_stanza_id_fkey;
ALTER TABLE public.presenza
    ADD CONSTRAINT presenza_stanza_id_fkey
        FOREIGN KEY (stanza_id)
            REFERENCES public.stanze("stanza_Id")
            ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_memory_created_at ON public.memory(created_at);
CREATE INDEX IF NOT EXISTS idx_presenza_stanza   ON public.presenza(stanza_id);
CREATE INDEX IF NOT EXISTS idx_stanze_updated    ON public.stanze(updated_at);