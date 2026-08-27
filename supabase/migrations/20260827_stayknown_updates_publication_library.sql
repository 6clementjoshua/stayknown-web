begin;

alter table public.stayknown_updates_posts
  add column if not exists deleted_at timestamptz,
  add column if not exists delete_after timestamptz,
  add column if not exists deleted_by uuid references auth.users(id) on delete set null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'stayknown_updates_posts_deleted_window_check'
      and conrelid = 'public.stayknown_updates_posts'::regclass
  ) then
    alter table public.stayknown_updates_posts
      add constraint stayknown_updates_posts_deleted_window_check
      check (
        (deleted_at is null and delete_after is null)
        or
        (deleted_at is not null and delete_after is not null and delete_after >= deleted_at)
      );
  end if;
end
$$;

create index if not exists stayknown_updates_posts_active_created_idx
  on public.stayknown_updates_posts (created_at desc)
  where deleted_at is null;

create index if not exists stayknown_updates_posts_deleted_idx
  on public.stayknown_updates_posts (delete_after asc, deleted_at desc)
  where deleted_at is not null;

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
    select 1
    from public.stayknown_updates_posts p
    where p.id = p_post_id
      and p.deleted_at is null
      and (
        (p.status = 'published' and coalesce(p.published_at, p.created_at) <= now())
        or
        (p.status = 'scheduled' and p.scheduled_for is not null and p.scheduled_for <= now())
      )
  ) then
    raise exception 'post_not_public';
  end if;

  select exists(
    select 1
    from public.stayknown_update_likes l
    where l.post_id = p_post_id and l.token_hash = p_token_hash
  ) into v_exists;

  if v_exists then
    delete from public.stayknown_update_likes
    where post_id = p_post_id and token_hash = p_token_hash;

    update public.stayknown_updates_posts
       set like_count = greatest(0, like_count - 1), updated_at = now()
     where id = p_post_id
       and deleted_at is null
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
         and deleted_at is null
       returning stayknown_updates_posts.like_count into v_count;
    else
      select p.like_count
        into v_count
      from public.stayknown_updates_posts p
      where p.id = p_post_id
        and p.deleted_at is null;
    end if;

    return query select true, v_count;
  end if;
end;
$$;

revoke all on function public.stayknown_toggle_update_like(uuid,text)
  from public, anon, authenticated;
grant execute on function public.stayknown_toggle_update_like(uuid,text)
  to service_role;

create or replace function public.purge_stayknown_updates_deleted_posts()
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_count integer := 0;
begin
  delete from public.stayknown_updates_posts
  where deleted_at is not null
    and coalesce(delete_after, deleted_at + interval '90 days') <= now();

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

revoke all on function public.purge_stayknown_updates_deleted_posts()
  from public, anon, authenticated;
grant execute on function public.purge_stayknown_updates_deleted_posts()
  to service_role;

comment on column public.stayknown_updates_posts.deleted_at is
  'Soft-delete timestamp. Deleted Updates are removed from public surfaces immediately but remain recoverable until delete_after.';
comment on column public.stayknown_updates_posts.delete_after is
  'Automatic permanent-deletion deadline, normally 90 days after deleted_at.';

update storage.buckets
set file_size_limit = 262144000,
    allowed_mime_types = array[
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'video/mp4',
      'video/webm',
      'audio/mpeg',
      'audio/mp4',
      'audio/aac',
      'audio/wav',
      'audio/x-wav',
      'audio/ogg',
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ]::text[]
where id = 'stayknown-updates-media';

do $$
declare
  v_jobid bigint;
begin
  select jobid
    into v_jobid
  from cron.job
  where jobname = 'stayknown-updates-purge-deleted-daily'
  limit 1;

  if v_jobid is not null then
    perform cron.unschedule(v_jobid);
  end if;

  perform cron.schedule(
    'stayknown-updates-purge-deleted-daily',
    '17 3 * * *',
    'select public.purge_stayknown_updates_deleted_posts();'
  );
end
$$;

commit;
