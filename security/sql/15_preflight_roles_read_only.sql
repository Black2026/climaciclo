-- G4.5 | Diagnostico complementar SOMENTE LEITURA
-- Executar CADA SELECT separadamente no SQL Editor Lovable e exportar os CSV.
-- Verificar memberships/heranca das roles usadas pelo PostgREST.
SELECT member.rolname AS papel, parent.rolname AS papel_herdado,
       m.admin_option, m.inherit_option, m.set_option
FROM pg_auth_members m
JOIN pg_roles member ON member.oid=m.member
JOIN pg_roles parent ON parent.oid=m.roleid
WHERE member.rolname IN ('anon','authenticated','service_role','sandbox_exec')
   OR parent.rolname IN ('anon','authenticated','service_role','sandbox_exec')
ORDER BY papel,papel_herdado;

-- Verificar grants de USAGE/CREATE no schema publico.
SELECT r.rolname AS papel,
       has_schema_privilege(r.rolname,'public','USAGE') AS pode_usar_schema,
       has_schema_privilege(r.rolname,'public','CREATE') AS pode_criar_no_schema
FROM pg_roles r
WHERE r.rolname IN ('anon','authenticated','service_role','sandbox_exec')
ORDER BY papel;

-- Privilegios padrao relevantes para tabelas futuras.
SELECT pg_get_userbyid(d.defaclrole) AS proprietario,
       COALESCE(n.nspname,'(global)') AS esquema,
       d.defaclobjtype AS tipo_objeto,
       d.defaclacl::text AS acl_padrao
FROM pg_default_acl d
LEFT JOIN pg_namespace n ON n.oid=d.defaclnamespace
WHERE n.nspname='public' OR n.nspname IS NULL
ORDER BY proprietario,esquema,tipo_objeto;
