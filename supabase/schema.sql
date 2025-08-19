-- Supabase schema for MVP
-- Helper: update timestamp
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Category enum (idempotent creation)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'category') THEN
    CREATE TYPE public.category AS ENUM ('finance','crypto');
  END IF;
END
$$;

-- Profiles (linked to auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  handle text unique not null check (handle ~ '^[A-Za-z0-9]{3,30}$'),
  display_name text,
  country text,
  avatar_url text,
  socials jsonb not null default '{}'::jsonb,
  handle_changes_left int not null default 3,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Handle-change limiter trigger: decrement handle_changes_left when handle changes
create or replace function public.on_profiles_before_update()
returns trigger as $$
begin
  if new.handle is distinct from old.handle then
    if old.handle_changes_left <= 0 then
      raise exception 'No handle changes left';
    end if;
    new.handle_changes_left = old.handle_changes_left - 1;
  end if;
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
before update on public.profiles
for each row execute function public.on_profiles_before_update();

-- Competitions
create table if not exists public.competitions (
  id bigserial primary key,
  category public.category not null,
  title text not null,
  slug text not null unique,
  start_at timestamptz not null,
  deadline_at timestamptz not null,
  evaluation_start_at timestamptz not null,
  evaluation_end_at timestamptz not null,
  timezone text not null default 'America/New_York',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger competitions_updated_at
before update on public.competitions
for each row execute function public.set_updated_at();

-- Options in a competition (tickers/coins)
create table if not exists public.options (
  id bigserial primary key,
  competition_id bigint not null references public.competitions(id) on delete cascade,
  symbol text not null,
  name text,
  coin_id text,
  metadata jsonb not null default '{}'::jsonb,
  unique(competition_id, symbol)
);

-- Guesses
create table if not exists public.guesses (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  competition_id bigint not null references public.competitions(id) on delete cascade,
  option_id bigint not null references public.options(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, competition_id)
);

create trigger guesses_updated_at
before update on public.guesses
for each row execute function public.set_updated_at();

-- Results per option
create table if not exists public.results (
  id bigserial primary key,
  competition_id bigint not null references public.competitions(id) on delete cascade,
  option_id bigint not null references public.options(id) on delete cascade,
  percent_change numeric not null,
  is_winner boolean not null default false,
  created_at timestamptz not null default now(),
  unique(competition_id, option_id)
);

-- Scores per user/competition
create table if not exists public.scores (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  competition_id bigint not null references public.competitions(id) on delete cascade,
  points int not null,
  created_at timestamptz not null default now(),
  unique(user_id, competition_id)
);

-- Referrals
create table if not exists public.referrals (
  id bigserial primary key,
  code text not null check (code ~ '^[A-Za-z0-9]{8}$'),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(code)
);

-- Market data tables
create table if not exists public.crypto_prices_daily (
  id bigserial primary key,
  coin_id text not null,
  as_of_date date not null,
  price_usd numeric not null,
  market_cap numeric,
  rank int,
  created_at timestamptz not null default now(),
  unique(coin_id, as_of_date)
);

-- Crypto coins metadata
create table if not exists public.crypto_coins (
  id text primary key,
  symbol text,
  name text,
  rank int,
  updated_at timestamptz not null default now()
);

create table if not exists public.equity_prices_eod (
  id bigserial primary key,
  symbol text not null,
  as_of_date date not null,
  close numeric not null,
  adjusted_close numeric,
  previous_close numeric,
  daily_change_percent numeric,
  created_at timestamptz not null default now(),
  unique(symbol, as_of_date)
);

-- Equity tickers (S&P 500 universe)
create table if not exists public.equity_tickers (
  symbol text primary key,
  name text,
  exchange text,
  updated_at timestamptz not null default now()
);

-- RLS enablement
alter table public.profiles enable row level security;
alter table public.competitions enable row level security;
alter table public.options enable row level security;
alter table public.results enable row level security;
alter table public.guesses enable row level security;
alter table public.scores enable row level security;
alter table public.referrals enable row level security;
alter table public.crypto_prices_daily enable row level security;
alter table public.equity_prices_eod enable row level security;
alter table public.equity_tickers enable row level security;
alter table public.crypto_coins enable row level security;

-- Basic policies (idempotent via drop/create)
-- Public read-only for competitions/options/results
drop policy if exists "competitions_read_all" on public.competitions;
create policy "competitions_read_all" on public.competitions for select using (true);

drop policy if exists "options_read_all" on public.options;
create policy "options_read_all" on public.options for select using (true);

drop policy if exists "results_read_all" on public.results;
create policy "results_read_all" on public.results for select using (true);

-- Public read-only for market data
drop policy if exists "crypto_prices_read_all" on public.crypto_prices_daily;
create policy "crypto_prices_read_all" on public.crypto_prices_daily for select using (true);

drop policy if exists "equity_prices_read_all" on public.equity_prices_eod;
create policy "equity_prices_read_all" on public.equity_prices_eod for select using (true);

drop policy if exists "equity_tickers_read_all" on public.equity_tickers;
create policy "equity_tickers_read_all" on public.equity_tickers for select using (true);

drop policy if exists "crypto_coins_read_all" on public.crypto_coins;
create policy "crypto_coins_read_all" on public.crypto_coins for select using (true);

-- Profiles
drop policy if exists "profiles_insert_self" on public.profiles;
create policy "profiles_insert_self" on public.profiles for insert with check (auth.uid() = id);
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

drop policy if exists "guesses_select_own" on public.guesses;
create policy "guesses_select_own" on public.guesses
  for select using (auth.uid() = user_id);

drop policy if exists "guesses_insert_own" on public.guesses;
create policy "guesses_insert_own" on public.guesses
  for insert with check (auth.uid() = user_id);

drop policy if exists "guesses_update_own" on public.guesses;
create policy "guesses_update_own" on public.guesses
  for update using (auth.uid() = user_id);

drop policy if exists "scores_select_own" on public.scores;
create policy "scores_select_own" on public.scores
  for select using (auth.uid() = user_id);

drop policy if exists "referrals_select_own" on public.referrals;
create policy "referrals_select_own" on public.referrals
  for select using (auth.uid() = owner_user_id);

drop policy if exists "referrals_insert_own" on public.referrals;
create policy "referrals_insert_own" on public.referrals
  for insert with check (auth.uid() = owner_user_id);

-- Auto-create profile on new auth user
create or replace function public.on_auth_user_created()
returns trigger as $$
begin
  insert into public.profiles (id, handle, display_name)
  values (new.id, 'user_' || substr(new.id::text, 1, 8), coalesce(split_part(new.email, '@', 1), 'user'))
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.on_auth_user_created();


