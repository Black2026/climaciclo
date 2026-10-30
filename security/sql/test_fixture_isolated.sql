-- Isolated PostgreSQL G4.5 fixture. NEVER run on Lovable Cloud.
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='anon') THEN CREATE ROLE anon NOLOGIN; END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='authenticated') THEN CREATE ROLE authenticated NOLOGIN; END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='service_role') THEN CREATE ROLE service_role NOLOGIN; END IF;
END $$;
CREATE TABLE public.admin_roles (id integer primary key);
CREATE TABLE public.app_settings (id integer primary key, ready_for_real_data boolean NOT NULL DEFAULT false, whatsapp_enabled boolean NOT NULL DEFAULT false);
CREATE TABLE public.leads (id integer primary key);
CREATE TABLE public.customers (id integer primary key);
CREATE TABLE public.service_orders (id integer primary key);
CREATE TABLE public.reminders (id integer primary key);
CREATE TABLE public.lead_rate_limits (id integer primary key);
INSERT INTO public.app_settings(id,ready_for_real_data) VALUES (1,false);
ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_rate_limits ENABLE ROW LEVEL SECURITY;
GRANT ALL PRIVILEGES ON TABLE public.admin_roles,public.app_settings,public.leads,
 public.customers,public.service_orders,public.reminders,public.lead_rate_limits
TO anon,authenticated,service_role;
