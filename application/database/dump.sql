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

CREATE TABLE public.push_subscriptions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    client_Id text NOT NULL,
    subscription jsonb DEFAULT '{}'::jsonb,
    endpoint text NOT NULL UNIQUE
);
CREATE INDEX IF NOT EXISTS idx_push_subs_client_id ON public.push_subscriptions(client_Id);

CREATE OR REPLACE FUNCTION update_stanza(target_id text, new_json jsonb, id_of_machine text)
RETURNS void AS $$
BEGIN
INSERT INTO public.stanze ("stanza_Id", "stanza", "machine_id", "updated_at")
VALUES (target_id, new_json, id_of_machine, now())
    ON CONFLICT ("stanza_Id")
    DO UPDATE SET
    "stanza" = "stanze"."stanza" || EXCLUDED."stanza",
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