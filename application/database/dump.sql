--DUMP da eseguire solo su supbase (Almeno pensato per quello)

DROP TABLE IF EXISTS public.memory CASCADE;
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
    CONSTRAINT stanze_pkey PRIMARY KEY ("stanza_Id")
);

CREATE TABLE public.items (
    "item_id" text NOT NULL,
    value jsonb DEFAULT '{}'::jsonb,
    machine_id text NOT NULL,
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT items_pkey PRIMARY KEY ("item_id")
);

CREATE TABLE IF NOT EXISTS public.presenza (
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

CREATE OR REPLACE FUNCTION jsonb_merge_deep(a jsonb, b jsonb)
RETURNS jsonb AS $$
SELECT CASE
           WHEN jsonb_typeof(a) = 'object' AND jsonb_typeof(b) = 'object' THEN (
               SELECT jsonb_object_agg(
                          key,
                              CASE
                                  WHEN a_val IS NULL THEN b_val
                                  WHEN b_val IS NULL THEN a_val
                                  WHEN jsonb_typeof(a_val) = 'object' AND jsonb_typeof(b_val) = 'object'
                                      THEN jsonb_merge_deep(a_val, b_val)
                                  ELSE b_val
                                  END
                      )
               FROM (
                        SELECT COALESCE(ka.key, kb.key) AS key,
                       a -> COALESCE(ka.key, kb.key) AS a_val,
                       b -> COALESCE(ka.key, kb.key) AS b_val
                        FROM jsonb_object_keys(a) ka(key)
                            FULL OUTER JOIN jsonb_object_keys(b) kb(key) ON ka.key = kb.key
                    ) sub
           )
           ELSE b
           END;
$$ LANGUAGE sql IMMUTABLE;

CREATE OR REPLACE FUNCTION update_stanza(target_id text, new_json jsonb, id_of_machine text)
RETURNS void AS $$
BEGIN
INSERT INTO public.stanze ("stanza_Id", "stanza", "machine_id", "updated_at")
VALUES (target_id, new_json, id_of_machine, now())
    ON CONFLICT ("stanza_Id")
DO UPDATE SET
    "stanza" = jsonb_merge_deep("stanze"."stanza", EXCLUDED."stanza"),
           "updated_at" = now();
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_item(target_id text, new_json jsonb, id_of_machine text)
RETURNS void AS $$
BEGIN
INSERT INTO public.items ("id_item", "value", "machine_id", "updated_at")
VALUES (target_id, new_json, id_of_machine, now())
    ON CONFLICT ("id_item")
    DO UPDATE SET
    "value" = "items"."value" || EXCLUDED."value",
               "updated_at" = now();
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

CREATE OR REPLACE FUNCTION set_presenza(
    p_giocatore_id text, p_stanza_id text,
    p_online boolean, p_socket_id text, p_event_time bigint
)
RETURNS void AS $$
BEGIN
INSERT INTO public.presenza (giocatore_id, stanza_id, online, socket_id, event_time, updated_at)
VALUES (p_giocatore_id, p_stanza_id, p_online, p_socket_id, p_event_time, now())
    ON CONFLICT (giocatore_id) DO UPDATE SET
    online    = CASE WHEN p_event_time >= presenza.event_time THEN EXCLUDED.online    ELSE presenza.online END,
                                      socket_id = CASE WHEN p_event_time >= presenza.event_time THEN EXCLUDED.socket_id ELSE presenza.socket_id END,
        event_time = GREATEST(presenza.event_time, p_event_time),
        updated_at = now();
END;
$$ LANGUAGE plpgsql;