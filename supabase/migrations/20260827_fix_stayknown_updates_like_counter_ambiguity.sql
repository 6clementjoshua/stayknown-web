-- SOURCE CONTROL RECORD ONLY.
-- This migration was already applied to the live StayKnown Supabase project by ChatGPT on 2026-08-27.
-- DO NOT run it again manually.

create or replace function public.stayknown_toggle_update_like(
  p_post_id uuid,
  p_token_hash text
)
returns table(liked boolean, like_count bigint)
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
    where l.post_id = p_post_id
      and l.token_hash = p_token_hash
  ) into v_exists;

  if v_exists then
    delete from public.stayknown_update_likes l
    where l.post_id = p_post_id
      and l.token_hash = p_token_hash;

    update public.stayknown_updates_posts as p
       set like_count = greatest(0, p.like_count - 1),
           updated_at = now()
     where p.id = p_post_id
       and p.deleted_at is null
     returning p.like_count into v_count;

    return query select false, v_count;
  else
    insert into public.stayknown_update_likes(post_id, token_hash)
    values (p_post_id, p_token_hash)
    on conflict do nothing;

    if found then
      update public.stayknown_updates_posts as p
         set like_count = p.like_count + 1,
             updated_at = now()
       where p.id = p_post_id
         and p.deleted_at is null
       returning p.like_count into v_count;
    else
      select p.like_count
        into v_count
      from public.stayknown_updates_posts p
      where p.id = p_post_id
        and p.deleted_at is null;
    end if;

    return query select true, coalesce(v_count, 0);
  end if;
end;
$$;

revoke all on function public.stayknown_toggle_update_like(uuid, text)
  from public, anon, authenticated;
grant execute on function public.stayknown_toggle_update_like(uuid, text)
  to service_role;
