-- Second Opinion initial persistence schema.
-- PDF binaries are intentionally not stored; audits keep extracted text and results only.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.audits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  original_answer text not null,
  source_text text not null,
  source_filename text,
  analysis_results jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists audits_user_id_created_at_idx
  on public.audits (user_id, created_at desc);

create index if not exists audits_user_id_idx
  on public.audits (user_id);

alter table public.profiles enable row level security;
alter table public.audits enable row level security;

drop policy if exists "Users can view their own profile" on public.profiles;
create policy "Users can view their own profile"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
  on public.profiles for insert
  to authenticated
  with check ((select auth.uid()) = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

drop policy if exists "Users can delete their own profile" on public.profiles;
create policy "Users can delete their own profile"
  on public.profiles for delete
  to authenticated
  using ((select auth.uid()) = id);

drop policy if exists "Users can view their own audits" on public.audits;
create policy "Users can view their own audits"
  on public.audits for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert their own audits" on public.audits;
create policy "Users can insert their own audits"
  on public.audits for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own audits" on public.audits;
create policy "Users can update their own audits"
  on public.audits for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their own audits" on public.audits;
create policy "Users can delete their own audits"
  on public.audits for delete
  to authenticated
  using ((select auth.uid()) = user_id);
