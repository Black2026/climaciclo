
create extension if not exists pgcrypto;

-- Roles
create type public.app_role as enum ('admin');

create table public.admin_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.admin_roles to authenticated;
grant all on public.admin_roles to service_role;
alter table public.admin_roles enable row level security;
create policy "own role row readable" on public.admin_roles
  for select to authenticated using (user_id = auth.uid());

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admin_roles where user_id = _user_id and role = _role)
$$;
revoke all on function public.has_role(uuid, public.app_role) from public, anon;
grant execute on function public.has_role(uuid, public.app_role) to authenticated, service_role;

create or replace function public.set_updated_at() returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end $$;

-- Settings (single row)
create table public.app_settings (
  id int primary key default 1 check (id = 1),
  whatsapp_number text check (whatsapp_number is null or whatsapp_number ~ '^55[1-9][0-9]9?[0-9]{8}$'),
  whatsapp_enabled boolean not null default false,
  display_name text not null default 'ClimaCiclo' check (char_length(display_name) between 1 and 60),
  controller_name text check (controller_name is null or char_length(controller_name) <= 150),
  controller_document text check (controller_document is null or char_length(controller_document) <= 30),
  privacy_contact_channel text check (privacy_contact_channel is null or char_length(privacy_contact_channel) <= 200),
  retention_period text check (retention_period is null or char_length(retention_period) <= 200),
  privacy_updated_at timestamptz,
  ready_for_real_data boolean generated always as (
    coalesce(length(trim(controller_name)),0) > 0
    and coalesce(length(trim(privacy_contact_channel)),0) > 0
    and coalesce(length(trim(retention_period)),0) > 0
  ) stored,
  updated_by uuid,
  updated_at timestamptz not null default now(),
  constraint whatsapp_enabled_needs_number check (not whatsapp_enabled or whatsapp_number is not null)
);
grant select, update on public.app_settings to authenticated;
grant all on public.app_settings to service_role;
alter table public.app_settings enable row level security;
create policy "admin read settings" on public.app_settings for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "admin update settings" on public.app_settings for update to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create trigger app_settings_updated before update on public.app_settings for each row execute function public.set_updated_at();
insert into public.app_settings (id) values (1);

-- Leads
create type public.lead_status as enum ('novo','em_contato','orcamento_enviado','convertido','descartado');

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  public_code text not null unique,
  idempotency_key uuid not null unique,
  environment_type text not null check (environment_type in ('residencial','comercial')),
  unit_count int not null check (unit_count between 1 and 50),
  unit_type text not null check (unit_type in ('split','janela','cassete','piso_teto','portatil','nao_sei')),
  city text not null check (char_length(city) between 2 and 80),
  neighborhood text not null check (char_length(neighborhood) between 2 and 80),
  follow_up_pref text not null check (follow_up_pref in ('trimestral','semestral','anual','nao_sei')),
  interests text[] not null check (cardinality(interests) between 1 and 3 and interests <@ array['limpeza','revisao','orientacao']),
  name text not null check (char_length(name) between 2 and 100),
  whatsapp text not null check (whatsapp ~ '^[1-9][0-9]{9,10}$'),
  email text check (email is null or char_length(email) <= 255),
  consent boolean not null check (consent = true),
  consent_at timestamptz not null default now(),
  consent_text_version text not null,
  status public.lead_status not null default 'novo',
  internal_notes text check (internal_notes is null or char_length(internal_notes) <= 4000),
  phone_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index leads_created_idx on public.leads (created_at desc);
create index leads_phone_hash_idx on public.leads (phone_hash);
grant select, insert, update, delete on public.leads to authenticated;
grant all on public.leads to service_role;
alter table public.leads enable row level security;
create policy "admin select leads" on public.leads for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "admin insert leads" on public.leads for insert to authenticated with check (public.has_role(auth.uid(),'admin'));
create policy "admin update leads" on public.leads for update to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "admin delete leads" on public.leads for delete to authenticated using (public.has_role(auth.uid(),'admin'));
create trigger leads_updated before update on public.leads for each row execute function public.set_updated_at();

-- Customers
create table public.customers (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null unique references public.leads(id) on delete restrict,
  name text not null check (char_length(name) between 2 and 100),
  whatsapp text not null,
  email text,
  city text not null,
  neighborhood text not null,
  notes text check (notes is null or char_length(notes) <= 4000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.customers to authenticated;
grant all on public.customers to service_role;
alter table public.customers enable row level security;
create policy "admin select customers" on public.customers for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "admin insert customers" on public.customers for insert to authenticated with check (public.has_role(auth.uid(),'admin'));
create policy "admin update customers" on public.customers for update to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "admin delete customers" on public.customers for delete to authenticated using (public.has_role(auth.uid(),'admin'));
create trigger customers_updated before update on public.customers for each row execute function public.set_updated_at();

-- Service orders
create table public.service_orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  kind text not null check (kind in ('limpeza','revisao','orientacao','outro')),
  status text not null default 'aberta' check (status in ('aberta','agendada_manual','concluida','cancelada')),
  scheduled_note text check (scheduled_note is null or char_length(scheduled_note) <= 300),
  notes text check (notes is null or char_length(notes) <= 4000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index so_customer_idx on public.service_orders(customer_id);
grant select, insert, update, delete on public.service_orders to authenticated;
grant all on public.service_orders to service_role;
alter table public.service_orders enable row level security;
create policy "admin select so" on public.service_orders for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "admin insert so" on public.service_orders for insert to authenticated with check (public.has_role(auth.uid(),'admin'));
create policy "admin update so" on public.service_orders for update to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "admin delete so" on public.service_orders for delete to authenticated using (public.has_role(auth.uid(),'admin'));
create trigger so_updated before update on public.service_orders for each row execute function public.set_updated_at();

-- Reminders
create table public.reminders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  service_order_id uuid references public.service_orders(id) on delete set null,
  due_date date not null,
  title text not null check (char_length(title) between 2 and 150),
  done boolean not null default false,
  created_at timestamptz not null default now()
);
create index reminders_due_idx on public.reminders(due_date);
grant select, insert, update, delete on public.reminders to authenticated;
grant all on public.reminders to service_role;
alter table public.reminders enable row level security;
create policy "admin select rem" on public.reminders for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "admin insert rem" on public.reminders for insert to authenticated with check (public.has_role(auth.uid(),'admin'));
create policy "admin update rem" on public.reminders for update to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "admin delete rem" on public.reminders for delete to authenticated using (public.has_role(auth.uid(),'admin'));

-- Rate limits (server only)
create table public.lead_rate_limits (
  bucket text not null,
  window_start timestamptz not null,
  count int not null default 0,
  primary key (bucket, window_start)
);
grant all on public.lead_rate_limits to service_role;
alter table public.lead_rate_limits enable row level security;

-- Atomic lead submission (service_role only)
create or replace function public.submit_lead(
  p_idempotency_key uuid, p_environment_type text, p_unit_count int, p_unit_type text,
  p_city text, p_neighborhood text, p_follow_up_pref text, p_interests text[],
  p_name text, p_whatsapp text, p_email text, p_consent boolean, p_consent_text_version text,
  p_phone_hash text, p_ip_hash text
) returns table (public_code text, created boolean, error text)
language plpgsql security definer set search_path = public as $$
declare
  v_code text;
  v_existing text;
  v_count int;
  v_ready boolean;
  v_alphabet text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  i int;
begin
  if p_consent is distinct from true then
    return query select null::text, false, 'consent_required'; return;
  end if;

  select l.public_code into v_existing from public.leads l where l.idempotency_key = p_idempotency_key;
  if v_existing is not null then
    return query select v_existing, false, null::text; return;
  end if;

  select s.ready_for_real_data into v_ready from public.app_settings s where s.id = 1;
  if not coalesce(v_ready, false) then
    return query select null::text, false, 'not_ready'; return;
  end if;

  insert into public.lead_rate_limits as r (bucket, window_start, count)
    values ('phone:' || p_phone_hash, date_trunc('day', now()), 1)
    on conflict (bucket, window_start) do update set count = r.count + 1
    returning r.count into v_count;
  if v_count > 3 then
    return query select null::text, false, 'rate_limited'; return;
  end if;
  if p_ip_hash is not null then
    insert into public.lead_rate_limits as r (bucket, window_start, count)
      values ('ip:' || p_ip_hash, date_trunc('hour', now()), 1)
      on conflict (bucket, window_start) do update set count = r.count + 1
      returning r.count into v_count;
    if v_count > 10 then
      return query select null::text, false, 'rate_limited'; return;
    end if;
  end if;

  for attempt in 1..5 loop
    v_code := 'CC-';
    for i in 1..6 loop
      v_code := v_code || substr(v_alphabet, 1 + floor(random() * length(v_alphabet))::int, 1);
    end loop;
    begin
      insert into public.leads (public_code, idempotency_key, environment_type, unit_count, unit_type,
        city, neighborhood, follow_up_pref, interests, name, whatsapp, email, consent, consent_at,
        consent_text_version, status, internal_notes, phone_hash)
      values (v_code, p_idempotency_key, p_environment_type, p_unit_count, p_unit_type,
        p_city, p_neighborhood, p_follow_up_pref, p_interests, p_name, p_whatsapp, nullif(p_email,''), true, now(),
        p_consent_text_version, 'novo', null, p_phone_hash)
      on conflict (idempotency_key) do nothing;
      if found then
        return query select v_code, true, null::text; return;
      end if;
      select l.public_code into v_existing from public.leads l where l.idempotency_key = p_idempotency_key;
      return query select v_existing, false, null::text; return;
    exception when unique_violation then
      -- public_code collision: retry
      null;
    end;
  end loop;
  return query select null::text, false, 'code_generation_failed';
end $$;
revoke all on function public.submit_lead(uuid,text,int,text,text,text,text,text[],text,text,text,boolean,text,text,text) from public, anon, authenticated;
grant execute on function public.submit_lead(uuid,text,int,text,text,text,text,text[],text,text,text,boolean,text,text,text) to service_role;

-- Transactional, idempotent conversion (runs as caller; RLS applies)
create or replace function public.convert_lead_to_customer(p_lead_id uuid)
returns uuid language plpgsql security invoker set search_path = public as $$
declare
  v_lead public.leads%rowtype;
  v_customer uuid;
begin
  if not public.has_role(auth.uid(), 'admin') then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  select * into v_lead from public.leads where id = p_lead_id for update;
  if not found then
    raise exception 'lead_not_found' using errcode = 'P0002';
  end if;
  insert into public.customers (lead_id, name, whatsapp, email, city, neighborhood)
    values (v_lead.id, v_lead.name, v_lead.whatsapp, v_lead.email, v_lead.city, v_lead.neighborhood)
    on conflict (lead_id) do nothing
    returning id into v_customer;
  if v_customer is null then
    select id into v_customer from public.customers where lead_id = v_lead.id;
  end if;
  update public.leads set status = 'convertido' where id = v_lead.id and status <> 'convertido';
  return v_customer;
end $$;
revoke all on function public.convert_lead_to_customer(uuid) from public, anon;
grant execute on function public.convert_lead_to_customer(uuid) to authenticated;
