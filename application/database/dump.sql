--DUMP da eseguire solo su supbase (Almeno pensato per quello)
--ATTENZIONE: questo file CANCELLA le tabelle. Su un database gia in uso
--esegui invece migrazione_disconnessioni.sql, che aggiorna senza distruggere.

DROP TABLE IF EXISTS public.memory CASCADE;
DROP TABLE IF EXISTS public.presenza CASCADE;
DROP TABLE IF EXISTS public.stanze CASCADE;
DROP TABLE IF EXISTS public.items CASCADE;
DROP TABLE IF EXISTS public.push_subscriptions CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;

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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    client_Id text NOT NULL,
    subscription jsonb DEFAULT '{}'::jsonb,
    endpoint text NOT NULL UNIQUE
);
CREATE INDEX IF NOT EXISTS idx_push_subs_client_id ON public.push_subscriptions(client_Id);

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
    "value" = EXCLUDED."value",
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

-- Un "offline" viene accettato solo se il socket che si e' disconnesso e'
-- ancora quello registrato per il giocatore: altrimenti il disconnect tardivo
-- di un socket morto buttava fuori chi si era gia riconnesso.
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

-- Le righe di presenza che puntano a una stanza che non esiste piu vanno tolte
-- prima di rimettere il vincolo, altrimenti l'ALTER fallisce con un 23503.
DELETE FROM public.presenza p
 WHERE NOT EXISTS (SELECT 1 FROM public.stanze s WHERE s."stanza_Id" = p.stanza_id);

ALTER TABLE public.presenza DROP CONSTRAINT IF EXISTS presenza_stanza_id_fkey;
ALTER TABLE public.presenza
ADD CONSTRAINT presenza_stanza_id_fkey
FOREIGN KEY (stanza_id)
REFERENCES public.stanze("stanza_Id")
ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_presenza_stanza ON public.presenza(stanza_id);
CREATE INDEX IF NOT EXISTS idx_stanze_updated  ON public.stanze(updated_at);
