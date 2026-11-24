-- ============================================================================
--  MIGRAZIONE "session_identificativi" per Cucu Ridu
--  Da eseguire sul database Supabase esistente. NON cancella dati.
--  Aggiunge la tabella parallela alle sessioni per associare una stringa
--  personalizzata (custom_id) al sid della sessione e/o al token JWT.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.sessions (
                                               "sid" varchar NOT NULL COLLATE "default" PRIMARY KEY,
                                               "sess" json NOT NULL,
                                               "expire" timestamp(6) NOT NULL
    );
CREATE INDEX IF NOT EXISTS "IDX_sessions_expire" ON public.sessions ("expire");

CREATE TABLE IF NOT EXISTS public.session_identificativi (
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