-- Apply once in the Supabase SQL editor before using imports and request history.
alter table public.price_records add column if not exists reqst_number text default '';
alter table public.generated_requests add column if not exists items jsonb default '[]'::jsonb;
create table if not exists public.settings (
  key text primary key,
  value jsonb not null
);
alter table public.settings enable row level security;
drop policy if exists "Authenticated settings read" on public.settings;
create policy "Authenticated settings read" on public.settings for select to authenticated using (true);
drop policy if exists "Authenticated settings insert" on public.settings;
create policy "Authenticated settings insert" on public.settings for insert to authenticated with check (true);
drop policy if exists "Authenticated settings update" on public.settings;
create policy "Authenticated settings update" on public.settings for update to authenticated using (true) with check (true);
drop policy if exists "Delete own generated requests" on public.generated_requests;
create policy "Delete own generated requests" on public.generated_requests for delete to authenticated using (generated_by = auth.uid());
