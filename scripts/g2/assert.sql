-- SOMENTE banco efemero do GitHub Actions; nao executar no Lovable Cloud.
-- Dados 100% ficticios. Todas as alteracoes sao revertidas ao final.
BEGIN;
DO $g2$
DECLARE
  r record;
  first_code text;
  hash_count int;
  i int;
  fn oid;
BEGIN
  IF (SELECT ready_for_real_data FROM public.app_settings WHERE id=1) IS DISTINCT FROM false THEN
    RAISE EXCEPTION 'Bloqueio inicial incorreto';
  END IF;
  SELECT p.oid INTO fn FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
    WHERE n.nspname='public' AND p.proname='submit_lead';
  IF fn IS NULL OR has_function_privilege('anon',fn,'EXECUTE')
     OR has_function_privilege('authenticated',fn,'EXECUTE')
     OR NOT has_function_privilege('service_role',fn,'EXECUTE') THEN
    RAISE EXCEPTION 'Permissoes da RPC incorretas';
  END IF;
  IF has_table_privilege('anon','public.leads','SELECT')
     OR NOT (SELECT relrowsecurity FROM pg_class WHERE oid='public.leads'::regclass) THEN
    RAISE EXCEPTION 'Leads expostos ou RLS desativada';
  END IF;

  SELECT * INTO r FROM public.submit_lead(
    '00000000-0000-4000-8000-000000000001'::uuid,
    'residencial',2,'split','Recife','Boa Viagem','semestral',
    ARRAY['limpeza']::text[],'Cliente ficticio','11912345678','',
    true,'versao-teste','bloqueado','ip-bloqueado');
  IF r.error IS DISTINCT FROM 'not_ready' OR r.created IS DISTINCT FROM false
     OR r.public_code IS NOT NULL OR (SELECT count(*) FROM public.leads)<>0
     OR (SELECT count(*) FROM public.lead_rate_limits)<>0 THEN
    RAISE EXCEPTION 'G2-004: bloqueio de privacidade falhou';
  END IF;

  -- Ativa privacidade APENAS na transacao deste banco efemero.
  UPDATE public.app_settings SET controller_name='Controlador ficticio',
    privacy_contact_channel='contato@example.invalid',
    retention_period='Prazo ficticio' WHERE id=1;
  IF (SELECT ready_for_real_data FROM public.app_settings WHERE id=1) IS DISTINCT FROM true THEN
    RAISE EXCEPTION 'Nao ativou configuracao ficticia';
  END IF;

  SELECT * INTO r FROM public.submit_lead(
    '00000000-0000-4000-8000-000000000002'::uuid,
    'residencial',2,'split','Recife','Boa Viagem','semestral',
    ARRAY['limpeza']::text[],'Cliente ficticio','11912345678','',
    true,'versao-teste','phone-1','ip-1');
  IF r.error IS NOT NULL OR r.created IS DISTINCT FROM true
     OR r.public_code !~ '^CC-[A-Z2-9]{6}$' THEN
    RAISE EXCEPTION 'G2-001: insercao/codigo falhou';
  END IF;
  first_code := r.public_code;
  IF NOT EXISTS (SELECT 1 FROM public.leads WHERE public_code=first_code
      AND status='novo'::public.lead_status AND consent=true
      AND internal_notes IS NULL) THEN
    RAISE EXCEPTION 'G2-001: estado gravado incorreto';
  END IF;
  SELECT COALESCE(sum(count),0)::int INTO hash_count FROM public.lead_rate_limits
    WHERE bucket='phone:phone-1';

  SELECT * INTO r FROM public.submit_lead(
    '00000000-0000-4000-8000-000000000002'::uuid,
    'residencial',2,'split','Recife','Boa Viagem','semestral',
    ARRAY['limpeza']::text[],'Cliente ficticio','11912345678','',
    true,'versao-teste','phone-1','ip-1');
  IF r.created IS DISTINCT FROM false OR r.error IS NOT NULL
     OR r.public_code IS DISTINCT FROM first_code
     OR (SELECT count(*) FROM public.leads)<>1
     OR (SELECT COALESCE(sum(count),0) FROM public.lead_rate_limits
         WHERE bucket='phone:phone-1')<>hash_count THEN
    RAISE EXCEPTION 'G2-002: idempotencia sequencial falhou';
  END IF;

  SELECT * INTO r FROM public.submit_lead(
    gen_random_uuid(),'residencial',2,'split','Recife','Boa Viagem','semestral',
    ARRAY['limpeza']::text[],'Cliente ficticio','11912345678','',
    false,'versao-teste','phone-consent','ip-consent');
  IF r.error IS DISTINCT FROM 'consent_required'
     OR (SELECT count(*) FROM public.leads)<>1 THEN
    RAISE EXCEPTION 'Consentimento nao foi bloqueado';
  END IF;

  FOR i IN 1..4 LOOP
    SELECT * INTO r FROM public.submit_lead(
      gen_random_uuid(),'residencial',1,'split','Recife','Boa Viagem','anual',
      ARRAY['limpeza']::text[],'Cliente ficticio','11912345678','',
      true,'versao-teste','phone-quota','ip-outro-'||i);
    IF (i<=3 AND (r.created IS DISTINCT FROM true OR r.error IS NOT NULL))
       OR (i=4 AND r.error IS DISTINCT FROM 'rate_limited') THEN
      RAISE EXCEPTION 'Limite por telefone incorreto na tentativa %',i;
    END IF;
  END LOOP;
  IF (SELECT count(*) FROM public.leads WHERE phone_hash='phone-quota')<>3 THEN
    RAISE EXCEPTION 'Limite por telefone gerou quantidade incorreta';
  END IF;

  FOR i IN 1..11 LOOP
    SELECT * INTO r FROM public.submit_lead(
      gen_random_uuid(),'residencial',1,'split','Recife','Boa Viagem','anual',
      ARRAY['limpeza']::text[],'Cliente ficticio','11912345678','',
      true,'versao-teste','phone-ip-'||i,'ip-cota');
    IF (i<=10 AND (r.created IS DISTINCT FROM true OR r.error IS NOT NULL))
       OR (i=11 AND r.error IS DISTINCT FROM 'rate_limited') THEN
      RAISE EXCEPTION 'Limite por IP incorreto na tentativa %',i;
    END IF;
  END LOOP;
  RAISE NOTICE 'G2 OK: bloqueio, persistencia, idempotencia sequencial, consentimento, RLS e limites.';
END $g2$;
ROLLBACK;
