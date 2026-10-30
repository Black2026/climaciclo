-- G4.5 | PREFLIGHT - SOMENTE LEITURA. Nao altera o banco.
-- IMPORTANTE: execute cada SELECT separadamente e exporte um CSV por consulta.
-- Se executar os quatro SELECTs de uma vez, o Lovable SQL Editor pode exportar
-- somente a ultima tabela exibida; nesse caso faltarao ACL e grants de funcoes.
-- Exportar resultados para arquivo privado e revisar antes de qualquer REVOKE.
-- 1. Estado RLS, proprietario e ACL explicita.
SELECT c.relname AS tabela,
       pg_get_userbyid(c.relowner) AS proprietario,
       c.relrowsecurity AS rls_habilitado,
       c.relacl::text AS acl_explicita
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relkind IN ('r','p')
  AND c.relname IN ('admin_roles','app_settings','leads',
                   'customers','service_orders','reminders','lead_rate_limits')
ORDER BY c.relname;

-- 2. Discriminacao de grants: inclui concessoes a PUBLIC.
SELECT c.relname AS tabela,
       CASE WHEN a.grantee=0 THEN 'PUBLIC'
            ELSE pg_get_userbyid(a.grantee) END AS beneficiario,
       pg_get_userbyid(a.grantor) AS concedente,
       a.privilege_type AS privilegio,
       a.is_grantable AS delegavel
FROM pg_class c
JOIN pg_namespace n ON n.oid=c.relnamespace
CROSS JOIN LATERAL aclexplode(
  coalesce(c.relacl, acldefault('r',c.relowner))
) a
WHERE n.nspname='public' AND c.relkind IN ('r','p')
  AND c.relname IN ('admin_roles','app_settings','leads',
                   'customers','service_orders','reminders','lead_rate_limits')
ORDER BY c.relname, beneficiario, privilegio;

-- 3. EXECUTE das funcoes sensiveis, sem revelar chaves nem dados pessoais.
SELECT p.proname AS funcao,
       pg_get_function_identity_arguments(p.oid) AS assinatura,
       p.prosecdef AS security_definer,
       has_function_privilege('anon',p.oid,'EXECUTE') AS anon_executa,
       has_function_privilege('authenticated',p.oid,'EXECUTE') AS autenticado_executa,
       has_function_privilege('service_role',p.oid,'EXECUTE') AS servico_executa
FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
WHERE n.nspname='public'
  AND p.proname IN ('has_role','submit_lead','convert_lead_to_customer')
ORDER BY p.proname, assinatura;

-- 4. Confirmar que a coleta continua desligada.
SELECT id,ready_for_real_data,whatsapp_enabled
FROM public.app_settings WHERE id=1;
