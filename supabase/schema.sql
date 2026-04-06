-- ============================================================
-- SharkAPI.dev — Database Schema
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- Enable pgcrypto for hashing
create extension if not exists pgcrypto;


-- ============================================================
-- 1. PROFILES
-- ============================================================
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text not null,
  full_name     text,
  role          text not null default 'user' check (role in ('user', 'admin')),
  status        text not null default 'active' check (status in ('active', 'suspended')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();


-- ============================================================
-- 2. API KEYS
-- ============================================================
create table if not exists public.api_keys (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  name          text not null,
  key_prefix    text not null,          -- e.g. "sk_live_abc1"  (shown in UI)
  key_hash      text not null unique,   -- sha256 hash of full key (never stored plain)
  is_active     boolean not null default true,
  last_used_at  timestamptz,
  created_at    timestamptz not null default now(),
  revoked_at    timestamptz
);

create index if not exists api_keys_user_id_idx  on public.api_keys(user_id);
create index if not exists api_keys_key_hash_idx on public.api_keys(key_hash);


-- ============================================================
-- 3. PROVIDERS
-- ============================================================
create table if not exists public.providers (
  id            uuid primary key default gen_random_uuid(),
  name          text not null unique,
  base_url      text not null,
  auth_type     text not null default 'bearer' check (auth_type in ('bearer', 'api_key', 'basic')),
  auth_config   jsonb not null default '{}', -- stores encrypted/masked credentials
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create trigger providers_updated_at
  before update on public.providers
  for each row execute procedure public.set_updated_at();


-- ============================================================
-- 4. MODELS
-- ============================================================
create table if not exists public.models (
  id                    uuid primary key default gen_random_uuid(),
  provider_id           uuid references public.providers(id) on delete set null,
  category              text not null check (category in ('image', 'video', 'audio', 'music', 'text')),
  code                  text not null unique,   -- our internal code e.g. "image-1k"
  name                  text not null,          -- display name e.g. "Image Generation 1K"
  variant               text,                   -- e.g. "1k", "2k", "720p", "hd"
  price_usd             numeric(10,6) not null, -- price per request
  billing_unit          text not null default 'request',
  provider_endpoint     text,                   -- provider's specific endpoint path
  provider_model_code   text,                   -- provider's model identifier
  request_config        jsonb not null default '{}', -- extra params for provider
  is_active             boolean not null default true,
  is_public             boolean not null default true,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index if not exists models_category_idx   on public.models(category);
create index if not exists models_is_active_idx  on public.models(is_active, is_public);

create trigger models_updated_at
  before update on public.models
  for each row execute procedure public.set_updated_at();

-- Seed initial models
insert into public.models (category, code, name, variant, price_usd, billing_unit, is_active, is_public)
values
  ('image', 'image-1k', 'Image Generation 1K', '1k', 0.01, 'request', true, true),
  ('image', 'image-2k', 'Image Generation 2K', '2k', 0.02, 'request', true, true)
on conflict (code) do nothing;


-- ============================================================
-- 5. JOBS
-- ============================================================
create table if not exists public.jobs (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references public.profiles(id) on delete cascade,
  api_key_id            uuid references public.api_keys(id) on delete set null,
  model_id              uuid references public.models(id) on delete set null,
  source                text not null default 'playground' check (source in ('api', 'playground')),
  status                text not null default 'queued'
                          check (status in ('queued', 'processing', 'completed', 'failed', 'cancelled')),
  input_data            jsonb not null default '{}',
  pricing_snapshot      jsonb not null default '{}', -- price at time of request
  external_request_id   text,                        -- provider's reference id
  error_message         text,
  queued_at             timestamptz not null default now(),
  started_at            timestamptz,
  completed_at          timestamptz,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index if not exists jobs_user_id_idx   on public.jobs(user_id);
create index if not exists jobs_status_idx    on public.jobs(status);
create index if not exists jobs_created_at_idx on public.jobs(created_at desc);

create trigger jobs_updated_at
  before update on public.jobs
  for each row execute procedure public.set_updated_at();


-- ============================================================
-- 6. JOB OUTPUTS
-- ============================================================
create table if not exists public.job_outputs (
  id            uuid primary key default gen_random_uuid(),
  job_id        uuid not null references public.jobs(id) on delete cascade,
  output_type   text not null check (output_type in ('image', 'video', 'audio', 'text', 'json')),
  text_content  text,
  file_url      text,
  metadata      jsonb not null default '{}',
  created_at    timestamptz not null default now()
);

create index if not exists job_outputs_job_id_idx on public.job_outputs(job_id);


-- ============================================================
-- 7. TRANSACTIONS
-- ============================================================
create table if not exists public.transactions (
  id                      uuid primary key default gen_random_uuid(),
  user_id                 uuid not null references public.profiles(id) on delete cascade,
  job_id                  uuid references public.jobs(id) on delete set null,
  type                    text not null check (type in ('usage', 'payment', 'refund', 'adjustment')),
  amount_usd              numeric(10,6) not null,
  status                  text not null default 'pending'
                            check (status in ('pending', 'paid', 'failed', 'refunded')),
  provider_transaction_id text,
  metadata                jsonb not null default '{}',
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

create index if not exists transactions_user_id_idx on public.transactions(user_id);
create index if not exists transactions_job_id_idx  on public.transactions(job_id);
create index if not exists transactions_type_idx    on public.transactions(type);

create trigger transactions_updated_at
  before update on public.transactions
  for each row execute procedure public.set_updated_at();


-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

alter table public.profiles     enable row level security;
alter table public.api_keys     enable row level security;
alter table public.providers    enable row level security;
alter table public.models       enable row level security;
alter table public.jobs         enable row level security;
alter table public.job_outputs  enable row level security;
alter table public.transactions enable row level security;


-- Helper: check if current user is admin
create or replace function public.is_admin()
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;


-- ── profiles ──
create policy "Users can read own profile"
  on public.profiles for select
  using (id = auth.uid() or public.is_admin());

create policy "Users can update own profile"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid() and role = (select role from public.profiles where id = auth.uid()));

create policy "Admins can manage all profiles"
  on public.profiles for all
  using (public.is_admin());


-- ── api_keys ──
create policy "Users manage own api_keys"
  on public.api_keys for all
  using (user_id = auth.uid());

create policy "Admins can read all api_keys"
  on public.api_keys for select
  using (public.is_admin());


-- ── providers — admin only ──
create policy "Admins manage providers"
  on public.providers for all
  using (public.is_admin());


-- ── models — public read, admin write ──
create policy "Anyone can read active public models"
  on public.models for select
  using (is_active = true and is_public = true or public.is_admin());

create policy "Admins manage models"
  on public.models for all
  using (public.is_admin());


-- ── jobs ──
create policy "Users manage own jobs"
  on public.jobs for all
  using (user_id = auth.uid());

create policy "Admins can read all jobs"
  on public.jobs for select
  using (public.is_admin());


-- ── job_outputs ──
create policy "Users read own job outputs"
  on public.job_outputs for select
  using (
    job_id in (select id from public.jobs where user_id = auth.uid())
    or public.is_admin()
  );

create policy "Service role can insert job outputs"
  on public.job_outputs for insert
  with check (true); -- controlled via service_role key in backend


-- ── transactions ──
create policy "Users read own transactions"
  on public.transactions for select
  using (user_id = auth.uid() or public.is_admin());

create policy "Service role can insert transactions"
  on public.transactions for insert
  with check (true); -- controlled via service_role key in backend
