-- ClimaCiclo G4.5 - POS-VERIFICACAO somente leitura
SELECT r.rolname AS papel, t.relname AS tabela,
       has_table_privilege(r.rolname,t.oid,'SELECT') AS pode_ler,
       has_table_privilege(r.rolname,t.oid,'INSERT') AS pode_inserir,
       has_table_privilege(r.rolname,t.oid,'UPDATE') AS pode_atualizar,
       has_table_privilege(r.rolname,t.oid,'DELETE') AS pode_excluir,
       has_table_privilege(r.rolname,t.oid,'TRUNCATE') AS pode_truncar,
       has_table_privilege(r.rolname,t.oid,'REFERENCES') AS pode_referenciar,
       has_table_privilege(r.rolname,t.oid,'TRIGGER') AS pode_criar_trigger
FROM pg_class t JOIN pg_namespace n ON n.oid=t.relnamespace
CROSS JOIN pg_roles r
WHERE n.nspname='public' AND t.relkind IN ('r','p')
 AND t.relname IN ('admin_roles','app_settings','leads','customers',
                   'service_orders','reminders','lead_rate_limits')
 AND r.rolname IN ('anon','authenticated','service_role')
ORDER BY t.relname,r.rolname;

-- Revalidar as politicas (RLS nao deve ter sido modificado).
SELECT tablename,policyname,cmd,roles,qual,with_check
FROM pg_policies
WHERE schemaname='public'
 AND tablename IN ('admin_roles','app_settings','leads','customers',
   'service_orders','reminders','lead_rate_limits')
ORDER BY tablename,policyname;

SELECT id,ready_for_real_data,whatsapp_enabled
FROM public.app_settings WHERE id=1;
