-- RAVEN Market: recursos do cliente sem checkout ou acesso a pedidos de lojas externas.
-- Cada usuário controla somente seus dados. Avaliações públicas dependem de aprovação.
create table if not exists public.raven_customer_profile (
  user_id uuid primary key references auth.users(id) on delete cascade,
  cep varchar(8) check (cep is null or cep ~ '^[0-9]{8}$'),
  updated_at timestamptz not null default now()
);
create table if not exists public.raven_user_items (
  user_id uuid not null references auth.users(id) on delete cascade,
  product_key varchar(180) not null check (length(btrim(product_key)) between 3 and 180),
  list_type varchar(8) not null check (list_type in ('saved','cart')),
  created_at timestamptz not null default now(),
  primary key (user_id,product_key,list_type)
);
create index if not exists raven_user_items_user_idx
  on public.raven_user_items (user_id, list_type, created_at desc);
create table if not exists public.raven_product_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_key varchar(180) not null check (length(btrim(product_key)) between 3 and 180),
  rating smallint not null check (rating between 1 and 5),
  body varchar(500) not null check (length(btrim(body)) between 15 and 500),
  moderation_status varchar(10) not null default 'pending'
    check (moderation_status in ('pending','approved','rejected')),
  created_at timestamptz not null default now(),
  unique (user_id,product_key)
);
create index if not exists raven_reviews_product_idx
  on public.raven_product_reviews (product_key,moderation_status,created_at desc);

alter table public.raven_customer_profile enable row level security;
alter table public.raven_user_items enable row level security;
alter table public.raven_product_reviews enable row level security;

revoke all on public.raven_customer_profile from public,anon,authenticated;
revoke all on public.raven_user_items from public,anon,authenticated;
revoke all on public.raven_product_reviews from public,anon,authenticated;
grant usage on schema public to anon,authenticated;
grant select,insert,update(cep),delete on public.raven_customer_profile to authenticated;
grant select,insert,delete on public.raven_user_items to authenticated;
grant select on public.raven_product_reviews to anon,authenticated;
grant insert (user_id,product_key,rating,body) on public.raven_product_reviews to authenticated;
grant delete on public.raven_product_reviews to authenticated;

drop policy if exists raven_profile_read on public.raven_customer_profile;
create policy raven_profile_read on public.raven_customer_profile for select to authenticated
using ((select auth.uid())=user_id);
drop policy if exists raven_profile_insert on public.raven_customer_profile;
create policy raven_profile_insert on public.raven_customer_profile for insert to authenticated
with check ((select auth.uid())=user_id);
drop policy if exists raven_profile_update on public.raven_customer_profile;
create policy raven_profile_update on public.raven_customer_profile for update to authenticated
using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
drop policy if exists raven_profile_delete on public.raven_customer_profile;
create policy raven_profile_delete on public.raven_customer_profile for delete to authenticated
using ((select auth.uid())=user_id);

drop policy if exists raven_items_read on public.raven_user_items;
create policy raven_items_read on public.raven_user_items for select to authenticated
using ((select auth.uid())=user_id);
drop policy if exists raven_items_insert on public.raven_user_items;
create policy raven_items_insert on public.raven_user_items for insert to authenticated
with check ((select auth.uid())=user_id);
drop policy if exists raven_items_delete on public.raven_user_items;
create policy raven_items_delete on public.raven_user_items for delete to authenticated
using ((select auth.uid())=user_id);

drop policy if exists raven_reviews_visible on public.raven_product_reviews;
create policy raven_reviews_visible on public.raven_product_reviews for select to anon,authenticated
using (moderation_status='approved' or (select auth.uid())=user_id);
drop policy if exists raven_reviews_insert on public.raven_product_reviews;
create policy raven_reviews_insert on public.raven_product_reviews for insert to authenticated
with check ((select auth.uid())=user_id and moderation_status='pending');
drop policy if exists raven_reviews_delete on public.raven_product_reviews;
create policy raven_reviews_delete on public.raven_product_reviews for delete to authenticated
using ((select auth.uid())=user_id);

-- A moderação é realizada no painel Supabase por quem administra a Raven.
-- Usuários não têm privilégios de modificar moderation_status nem podem atualizar avaliações.
