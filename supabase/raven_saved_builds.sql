-- Execute no SQL Editor do projeto Supabase usado pelo Raven PC Builder.
-- A tabela guarda somente as escolhas dos componentes; nunca senhas.
create table if not exists public.raven_saved_builds (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name varchar(55) not null check (length(btrim(name)) > 0),
  parts jsonb not null check (
    jsonb_typeof(parts) = 'object'
    and octet_length(parts::text) <= 4096
  ),
  created_at timestamptz not null default now()
);

create index if not exists raven_saved_builds_user_created_idx
  on public.raven_saved_builds (user_id, created_at desc);

alter table public.raven_saved_builds enable row level security;
revoke all on table public.raven_saved_builds from public, anon, authenticated;
grant select, insert, delete on public.raven_saved_builds to authenticated;

drop policy if exists raven_builds_select_own on public.raven_saved_builds;
create policy raven_builds_select_own on public.raven_saved_builds
  for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists raven_builds_insert_own on public.raven_saved_builds;
create policy raven_builds_insert_own on public.raven_saved_builds
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists raven_builds_delete_own on public.raven_saved_builds;
create policy raven_builds_delete_own on public.raven_saved_builds
  for delete to authenticated
  using ((select auth.uid()) = user_id);

-- Limite transacional: duas abas concorrentes não conseguem criar o sexto PC.
create or replace function public.raven_limit_saved_builds()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(new.user_id::text, 2026)
  );
  if (select count(*) from public.raven_saved_builds
      where user_id = new.user_id) >= 5 then
    raise exception 'Limite de cinco montagens por conta'
      using errcode = '23514';
  end if;
  return new;
end;
$$;

revoke all on function public.raven_limit_saved_builds()
  from public, anon, authenticated;

drop trigger if exists raven_builds_limit_insert on public.raven_saved_builds;
create trigger raven_builds_limit_insert
  before insert on public.raven_saved_builds
  for each row execute function public.raven_limit_saved_builds();
