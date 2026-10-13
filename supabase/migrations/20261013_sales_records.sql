-- Apply after 20260930_user_management_security.sql.
-- The reporting month is independent of the PO date, which may be missing.
create table if not exists public.sales_records (
  id uuid primary key default gen_random_uuid(),
  sales_year smallint not null check (sales_year between 2000 and 2100),
  sales_month smallint not null check (sales_month between 1 and 12),
  account_executive text not null check (length(trim(account_executive)) > 0),
  sale_date date,
  po_number text not null default '',
  sales_type text not null check (length(trim(sales_type)) > 0),
  account_name text not null check (length(trim(account_name)) > 0),
  scope_of_work text not null check (length(trim(scope_of_work)) > 0),
  amount numeric(14,2) not null check (amount >= 0 and amount <> 'NaN'::numeric),
  -- Stable source identity for imports; editing a sale keeps its import identity.
  import_key text unique check (import_key ~ '^[0-9a-f]{64}$'),
  created_by uuid default auth.uid() references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_sales_records_period on public.sales_records (sales_year, sales_month);

alter table public.sales_records enable row level security;
revoke all on public.sales_records from anon;
grant select, insert, update, delete on public.sales_records to authenticated;

drop policy if exists "Approved users can read sales" on public.sales_records;
create policy "Approved users can read sales" on public.sales_records
  for select to authenticated using (
    exists (select 1 from public.profiles where id = auth.uid() and status = 'approved')
  );

drop policy if exists "Approved admins can add sales" on public.sales_records;
create policy "Approved admins can add sales" on public.sales_records
  for insert to authenticated with check (public.is_approved_admin());

drop policy if exists "Approved admins can update sales" on public.sales_records;
create policy "Approved admins can update sales" on public.sales_records
  for update to authenticated using (public.is_approved_admin())
  with check (public.is_approved_admin());

drop policy if exists "Approved admins can delete sales" on public.sales_records;
create policy "Approved admins can delete sales" on public.sales_records
  for delete to authenticated using (public.is_approved_admin());
