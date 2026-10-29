#!/usr/bin/env bash
# SOMENTE banco PostgreSQL efemero do GitHub Actions.
set -euo pipefail

dir="$(mktemp -d)"
trap 'rm -rf "$dir"' EXIT
export G2_LOCK_SIGNAL="$dir/lock-acquired"

psql -X -v ON_ERROR_STOP=1 -q <<'SQL'
UPDATE public.app_settings
   SET controller_name = 'Controlador ficticio',
       privacy_contact_channel = 'contato@example.invalid',
       retention_period = 'Somente teste temporario'
 WHERE id = 1;
INSERT INTO public.lead_rate_limits(bucket, window_start, count)
VALUES ('phone:concorrencia-teste', date_trunc('day',now()), 0);
SQL

# Uma terceira sessao bloqueia o bucket para garantir que ambas as
# requisicoes atravessem a verificacao inicial antes de gravar o lead.
psql -X -v ON_ERROR_STOP=1 -q <<'SQL' >"$dir/locker.log" 2>&1 &
BEGIN;
SELECT bucket FROM public.lead_rate_limits
 WHERE bucket = 'phone:concorrencia-teste'
 FOR UPDATE;
\! sh -c 'touch "$G2_LOCK_SIGNAL"'
SELECT pg_sleep(9);
COMMIT;
SQL
locker_pid=$!

for _ in $(seq 1 100); do
  if [[ -f "$G2_LOCK_SIGNAL" ]]; then break; fi
  sleep 0.05
done
if [[ ! -f "$G2_LOCK_SIGNAL" ]]; then
  cat "$dir/locker.log"
  echo "Nao foi possivel garantir o bloqueio inicial" >&2
  exit 1
fi

# As duas sessoes usam o MESMO idempotency_key e o MESMO hash de telefone.
call="SELECT coalesce(public_code, 'NULL') || '|' || created::text ||
             '|' || coalesce(error,'NULL')
      FROM public.submit_lead(
      '00000000-0000-4000-8000-000000000099'::uuid,
      'residencial', 2, 'split', 'Recife', 'Boa Viagem', 'semestral',
      ARRAY['limpeza']::text[], 'Cliente ficticio', '11912345678', '',
      true, 'versao-teste', 'concorrencia-teste', NULL::text);"

psql -X -v ON_ERROR_STOP=1 -qAt -c "$call" >"$dir/a.txt" 2>"$dir/a.err" &
pid_a=$!
psql -X -v ON_ERROR_STOP=1 -qAt -c "$call" >"$dir/b.txt" 2>"$dir/b.err" &
pid_b=$!

# Aguarda as duas conexoes chegarem ao ponto de contenção.
# Isso torna observavel a corrida no esquema antigo.
waiters=0
for _ in $(seq 1 100); do
  waiters=$(psql -X -v ON_ERROR_STOP=1 -qAt -c "
    SELECT count(*) FROM pg_stat_activity
    WHERE query LIKE '%00000000-0000-4000-8000-000000000099%'
      AND query NOT LIKE '%pg_stat_activity%'
      AND wait_event_type = 'Lock';" | tr -d '[:space:]')
  [[ "$waiters" -ge 1 ]] && break
  sleep 0.05
done
echo "Sessoes em espera observadas: $waiters (o teste exige dois clientes paralelos)."

wait "$pid_a"
wait "$pid_b"
wait "$locker_pid"

a="$(tr -d '\r\n' <"$dir/a.txt")"
b="$(tr -d '\r\n' <"$dir/b.txt")"
echo "Cliente A: $a"
echo "Cliente B: $b"
if [[ "$a" != "$b" && "$a" != *"|true|NULL" && "$b" != *"|true|NULL" ]]; then
  echo "Nenhuma chamada criou um lead" >&2
  exit 1
fi
code_a="${a%%|*}"
code_b="${b%%|*}"
if [[ "$code_a" != "$code_b" || "$code_a" != CC-* ]]; then
  echo "As chamadas retornaram codigos diferentes" >&2
  exit 1
fi
if [[ "$a" != *"|true|NULL" && "$b" != *"|true|NULL" ]]; then
  echo "Nenhuma chamada foi a criadora" >&2
  exit 1
fi
if [[ "$a" != *"|false|NULL" && "$b" != *"|false|NULL" ]]; then
  echo "Nenhuma chamada foi deduplicada" >&2
  exit 1
fi

summary=$(psql -X -v ON_ERROR_STOP=1 -qAt -c "
  SELECT (SELECT count(*) FROM public.leads
          WHERE idempotency_key='00000000-0000-4000-8000-000000000099'::uuid)
  || '|' ||
         (SELECT count FROM public.lead_rate_limits
          WHERE bucket='phone:concorrencia-teste'
            AND window_start=date_trunc('day',now()));")
echo "Registros|quota: $summary"
if [[ "$summary" != "1|1" ]]; then
  echo "Falha de idempotencia concorrente: deveria existir 1 lead e 1 consumo de quota" >&2
  exit 1
fi
echo "G2-CONC aprovado: duas requisicoes simultaneas, um lead, mesma resposta e uma quota."
