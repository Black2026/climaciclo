-- ClimaCiclo G4.5 - REMEDIACAO CONTROLADA (EXECUCAO MANUAL, APOS REVISAO)
-- NAO e uma migration automatica. Rodar PRIMEIRO em uma base isolada.
-- Antes de rodar: exportar 10_preflight_read_only.sql, preservar snapshot ACL,
-- revisar plano, backup e acesso administrador. Nao altera RLS nem dados.
BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '30s';

DO $guard$
DECLARE
  t text;
  tables text[] := ARRAY['admin_roles','app_settings','leads',
    'customers','service_orders','reminders','lead_rate_limits'];
  bad text;
BEGIN
  SELECT string_agg(tname, ', ') INTO bad
  FROM unnest(tables) tname
  WHERE NOT EXISTS (
    SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname='public' AND c.relname=tname
      AND c.relkind IN ('r','p') AND c.relrowsecurity
  );
  IF bad IS NOT NULL THEN
    RAISE EXCEPTION 'ABORTADO: tabela ausente ou sem RLS: %',bad;
  END IF;

  -- Se PUBLIC receber ACL direta, REVOKE de anon/authenticated nao basta.
  -- Nao revogar PUBLIC automaticamente, pois outros consumidores podem depender.
  SELECT string_agg(c.relname, ', ') INTO bad
  FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
  WHERE n.nspname='public' AND c.relname=ANY(tables)
    AND EXISTS (
      SELECT 1 FROM aclexplode(coalesce(c.relacl,acldefault('r',c.relowner))) a
      WHERE a.grantee=0
    );
  IF bad IS NOT NULL THEN
    RAISE EXCEPTION 'ABORTADO: ACL PUBLIC encontrada: %. Revisar concessoes herdadas.',bad;
  END IF;
  IF (SELECT count(*) FROM public.app_settings WHERE id=1 AND ready_for_real_data=false) <> 1 THEN
    RAISE EXCEPTION 'ABORTADO: coleta real nao esta explicitamente bloqueada';
  END IF;
END $guard$;

REVOKE ALL PRIVILEGES ON TABLE
 public.admin_roles, public.app_settings, public.leads, public.customers,
 public.service_orders, public.reminders, public.lead_rate_limits
FROM anon, authenticated;

GRANT SELECT ON TABLE public.admin_roles TO authenticated;
GRANT SELECT, UPDATE ON TABLE public.app_settings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE
 public.leads, public.customers, public.service_orders, public.reminders
TO authenticated;

-- service_role nao e alterado. Suas permissoes devem ser auditadas
-- separadamente, inclusive bypassrls e funcoes SECURITY DEFINER.
DO $verify$
DECLARE
  t text;
  bad text;
BEGIN
  SELECT string_agg(tname || ':' || role_name || ':' || priv, ', ') INTO bad
  FROM unnest(ARRAY['admin_roles','app_settings','leads','customers',
    'service_orders','reminders','lead_rate_limits']) tname
  CROSS JOIN unnest(ARRAY['anon','authenticated']) role_name
  CROSS JOIN unnest(ARRAY['TRUNCATE','TRIGGER','REFERENCES','MAINTAIN']) priv
  WHERE has_table_privilege(role_name,format('public.%I',tname),priv);
  IF bad IS NOT NULL THEN
    RAISE EXCEPTION 'ABORTADO: privilegios perigosos persistem: %',bad;
  END IF;

  SELECT string_agg(tname, ', ') INTO bad
  FROM unnest(ARRAY['admin_roles','app_settings','leads','customers',
    'service_orders','reminders','lead_rate_limits']) tname
  WHERE has_table_privilege('anon',format('public.%I',tname),'SELECT')
     OR has_table_privilege('anon',format('public.%I',tname),'INSERT')
     OR has_table_privilege('anon',format('public.%I',tname),'UPDATE')
     OR has_table_privilege('anon',format('public.%I',tname),'DELETE');
  IF bad IS NOT NULL THEN
    RAISE EXCEPTION 'ABORTADO: anon ainda tem DML nas tabelas: %',bad;
  END IF;
  IF NOT has_table_privilege('authenticated','public.admin_roles','SELECT')
    OR NOT has_table_privilege('authenticated','public.app_settings','SELECT')
    OR NOT has_table_privilege('authenticated','public.app_settings','UPDATE')
    OR NOT has_table_privilege('authenticated','public.leads','SELECT')
    OR NOT has_table_privilege('authenticated','public.customers','INSERT')
    OR NOT has_table_privilege('authenticated','public.service_orders','UPDATE')
    OR NOT has_table_privilege('authenticated','public.reminders','DELETE') THEN
    RAISE EXCEPTION 'ABORTADO: permissao necessaria ausente';
  END IF;
END $verify$;
COMMIT;
-- Nao execute automaticamente nem combine com SQL de criacao do schema.
