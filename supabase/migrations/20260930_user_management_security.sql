create or replace function public.is_approved_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin' and status = 'approved'
  );
$$;
revoke all on function public.is_approved_admin() from public;
grant execute on function public.is_approved_admin() to authenticated;

drop policy if exists "Allow public read access to profiles" on public.profiles;
drop policy if exists "Allow public insert to profiles" on public.profiles;
drop policy if exists "Allow public update to profiles" on public.profiles;
drop policy if exists "Allow public delete to profiles" on public.profiles;
drop policy if exists "Users and admins can read profiles" on public.profiles;
drop policy if exists "Users can create pending profiles" on public.profiles;
drop policy if exists "Admins can update profiles" on public.profiles;

create policy "Users and admins can read profiles" on public.profiles
  for select to authenticated using (id = auth.uid() or public.is_approved_admin());
create policy "Users can create pending profiles" on public.profiles
  for insert to authenticated with check (id = auth.uid() and role = 'user' and status = 'pending');
create policy "Admins can update profiles" on public.profiles
  for update to authenticated using (public.is_approved_admin())
  with check (
    public.is_approved_admin() and exists (
      select 1 from public.profiles admin_profile
      where admin_profile.id <> profiles.id
        and admin_profile.role = 'admin'
        and admin_profile.status = 'approved'
    )
  );