begin;

create extension if not exists pgcrypto;
create extension if not exists citext;

create table if not exists public.stayknown_update_admins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null references auth.users(id) on delete set null,
  email citext not null unique,
  role text not null default 'editor' check (role in ('owner','admin','editor','analyst')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.stayknown_update_admins (user_id, email, role, is_active)
select id, email, 'owner', true
from auth.users
where lower(email) = '6clementjoshua@gmail.com'
on conflict (email) do update
set user_id = excluded.user_id,
    role = 'owner',
    is_active = true,
    updated_at = now();

create table if not exists public.stayknown_updates_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  status text not null default 'draft' check (status in ('draft','scheduled','published','archived')),
  article_type text not null default 'Article' check (article_type in ('Article','NewsArticle','BlogPosting')),
  category text not null default 'Product',
  kicker text,
  title text not null,
  summary text not null default '',
  body jsonb not null default '[]'::jsonb check (jsonb_typeof(body) = 'array'),
  hero_image_url text,
  image_16_9_url text,
  image_4_3_url text,
  image_1_1_url text,
  hero_alt_text text,
  author_name text not null default 'StayKnown',
  author_url text,
  seo_title text,
  seo_description text,
  canonical_path text,
  animation_preset text not null default 'editorial-rise' check (
    animation_preset in ('none','editorial-rise','quiet-glow','line-sweep','spotlight','milestone-burst','confetti')
  ),
  featured boolean not null default false,
  strict_seo boolean not null default true,
  like_count bigint not null default 0 check (like_count >= 0),
  scheduled_for timestamptz,
  published_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists stayknown_updates_posts_public_idx
  on public.stayknown_updates_posts (status, published_at desc, scheduled_for desc);
create index if not exists stayknown_updates_posts_category_idx
  on public.stayknown_updates_posts (category, published_at desc);

create table if not exists public.stayknown_update_likes (
  post_id uuid not null references public.stayknown_updates_posts(id) on delete cascade,
  token_hash text not null,
  created_at timestamptz not null default now(),
  primary key (post_id, token_hash)
);

create table if not exists public.stayknown_update_audit_log (
  id bigint generated always as identity primary key,
  post_id uuid references public.stayknown_updates_posts(id) on delete set null,
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.stayknown_update_admins enable row level security;
alter table public.stayknown_updates_posts enable row level security;
alter table public.stayknown_update_likes enable row level security;
alter table public.stayknown_update_audit_log enable row level security;

revoke all on table public.stayknown_update_admins from public, anon, authenticated;
revoke all on table public.stayknown_updates_posts from public, anon, authenticated;
revoke all on table public.stayknown_update_likes from public, anon, authenticated;
revoke all on table public.stayknown_update_audit_log from public, anon, authenticated;

grant all on table public.stayknown_update_admins to service_role;
grant all on table public.stayknown_updates_posts to service_role;
grant all on table public.stayknown_update_likes to service_role;
grant all on table public.stayknown_update_audit_log to service_role;

create or replace function public.stayknown_toggle_update_like(
  p_post_id uuid,
  p_token_hash text
)
returns table (liked boolean, like_count bigint)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_exists boolean;
  v_count bigint;
begin
  if p_post_id is null or nullif(btrim(coalesce(p_token_hash, '')), '') is null then
    raise exception 'invalid_like_request';
  end if;

  if not exists (
    select 1 from public.stayknown_updates_posts p
    where p.id = p_post_id
      and (
        (p.status = 'published' and coalesce(p.published_at, p.created_at) <= now())
        or (p.status = 'scheduled' and p.scheduled_for is not null and p.scheduled_for <= now())
      )
  ) then
    raise exception 'post_not_public';
  end if;

  select exists(
    select 1 from public.stayknown_update_likes l
    where l.post_id = p_post_id and l.token_hash = p_token_hash
  ) into v_exists;

  if v_exists then
    delete from public.stayknown_update_likes
    where post_id = p_post_id and token_hash = p_token_hash;
    update public.stayknown_updates_posts
       set like_count = greatest(0, like_count - 1), updated_at = now()
     where id = p_post_id
     returning stayknown_updates_posts.like_count into v_count;
    return query select false, v_count;
  else
    insert into public.stayknown_update_likes(post_id, token_hash)
    values (p_post_id, p_token_hash)
    on conflict do nothing;
    if found then
      update public.stayknown_updates_posts
         set like_count = like_count + 1, updated_at = now()
       where id = p_post_id
       returning stayknown_updates_posts.like_count into v_count;
    else
      select p.like_count into v_count from public.stayknown_updates_posts p where p.id = p_post_id;
    end if;
    return query select true, v_count;
  end if;
end;
$$;

revoke all on function public.stayknown_toggle_update_like(uuid,text) from public, anon, authenticated;
grant execute on function public.stayknown_toggle_update_like(uuid,text) to service_role;

comment on table public.stayknown_updates_posts is
  'StayKnown public editorial updates. Public access is server-rendered through controlled website routes; direct Data API access is revoked.';
comment on table public.stayknown_update_admins is
  'Explicit allowlist for StayKnown Updates admin access. Separate from mail-console authorization.';
comment on table public.stayknown_update_likes is
  'Privacy-minimized per-browser like state using only a server HMAC token hash; no IP or identity is stored.';

commit;
