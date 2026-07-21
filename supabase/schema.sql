-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Price records table
create table if not exists public.price_records (
  id uuid default uuid_generate_v4() primary key,
  item_no text,
  inventory text not null,
  brand text not null,
  model text not null,
  description text not null,
  category text,
  uom text default 'Unit',
  order_qty integer default 1,
  var_price numeric(12,2) default 0,
  srp_price numeric(12,2) default 0,
  lp_price numeric(12,2) default 0,
  buying_price numeric(12,2) default 0,
  stock_availability text default 'Unknown',
  warranty_information text,
  remarks text,
  quote_date timestamp with time zone default now(),
  expiry_date timestamp with time zone default (now() + interval '30 days'),
  status text default 'Active',
  source_file_id uuid,
  created_by uuid references auth.users(id),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Uploaded files table
create table if not exists public.uploaded_files (
  id uuid default uuid_generate_v4() primary key,
  file_name text not null,
  file_type text,
  uploaded_by uuid references auth.users(id),
  uploaded_at timestamp with time zone default now(),
  parsed_status text default 'pending',
  notes text
);

-- Request cart items table
create table if not exists public.request_cart_items (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  price_record_id uuid references public.price_records(id),
  inventory text not null,
  description text not null,
  uom text default 'Unit',
  order_qty integer default 1,
  estimated_unit_cost numeric(12,2) default 0,
  estimated_ext_cost numeric(12,2) default 0,
  required_date date,
  promised_date date,
  issue_status text default 'Requested',
  canceled boolean default false,
  project_id text,
  project_task text,
  requisition_ref_nbr text,
  update text,
  created_at timestamp with time zone default now()
);

-- Generated requests table
create table if not exists public.generated_requests (
  id uuid default uuid_generate_v4() primary key,
  request_number text unique not null,
  generated_by uuid references auth.users(id) not null,
  generated_at timestamp with time zone default now(),
  file_path text,
  status text default 'Pending',
  item_count integer default 0
);

-- Markup predictions table
create table if not exists public.markup_predictions (
  id uuid default uuid_generate_v4() primary key,
  brand text,
  category text,
  inventory text,
  buying_price numeric(12,2) not null,
  predicted_var_price numeric(12,2) not null,
  predicted_srp_price numeric(12,2) not null,
  predicted_lp_price numeric(12,2) not null,
  var_markup_percent numeric(6,2) not null,
  srp_markup_percent numeric(6,2) not null,
  lp_markup_percent numeric(6,2) not null,
  confidence_level text default 'Medium',
  created_at timestamp with time zone default now()
);

-- Audit logs table
create table if not exists public.audit_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id),
  action text not null,
  entity_type text,
  entity_id uuid,
  old_value jsonb,
  new_value jsonb,
  created_at timestamp with time zone default now()
);

-- Profiles table for user roles and approval status
create table if not exists public.profiles (
  id uuid references auth.users(id) primary key,
  email text,
  full_name text,
  role text default 'user',
  status text default 'pending',
  approved_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table public.price_records enable row level security;
alter table public.uploaded_files enable row level security;
alter table public.request_cart_items enable row level security;
alter table public.generated_requests enable row level security;
alter table public.markup_predictions enable row level security;
alter table public.audit_logs enable row level security;
alter table public.profiles enable row level security;

-- Price records policies
drop policy if exists "Allow public read access to price_records" on public.price_records;
create policy "Allow public read access to price_records" on public.price_records for select using (true);
drop policy if exists "Allow public insert to price_records" on public.price_records;
create policy "Allow public insert to price_records" on public.price_records for insert with check (true);
drop policy if exists "Allow public update to price_records" on public.price_records;
create policy "Allow public update to price_records" on public.price_records for update using (true);
drop policy if exists "Allow public delete to price_records" on public.price_records;
create policy "Allow public delete to price_records" on public.price_records for delete using (true);

-- Uploaded files policies
drop policy if exists "Allow public read access to uploaded_files" on public.uploaded_files;
create policy "Allow public read access to uploaded_files" on public.uploaded_files for select using (true);
drop policy if exists "Allow public insert to uploaded_files" on public.uploaded_files;
create policy "Allow public insert to uploaded_files" on public.uploaded_files for insert with check (true);

-- Request cart items policies
drop policy if exists "Allow public read access to request_cart_items" on public.request_cart_items;
create policy "Allow public read access to request_cart_items" on public.request_cart_items for select using (true);
drop policy if exists "Allow public insert to request_cart_items" on public.request_cart_items;
create policy "Allow public insert to request_cart_items" on public.request_cart_items for insert with check (true);
drop policy if exists "Allow public update to request_cart_items" on public.request_cart_items;
create policy "Allow public update to request_cart_items" on public.request_cart_items for update using (true);
drop policy if exists "Allow public delete to request_cart_items" on public.request_cart_items;
create policy "Allow public delete to request_cart_items" on public.request_cart_items for delete using (true);

-- Generated requests policies
drop policy if exists "Allow public read access to generated_requests" on public.generated_requests;
create policy "Allow public read access to generated_requests" on public.generated_requests for select using (true);
drop policy if exists "Allow public insert to generated_requests" on public.generated_requests;
create policy "Allow public insert to generated_requests" on public.generated_requests for insert with check (true);

-- Markup predictions policies
drop policy if exists "Allow public read access to markup_predictions" on public.markup_predictions;
create policy "Allow public read access to markup_predictions" on public.markup_predictions for select using (true);
drop policy if exists "Allow public insert to markup_predictions" on public.markup_predictions;
create policy "Allow public insert to markup_predictions" on public.markup_predictions for insert with check (true);

-- Audit logs policies
drop policy if exists "Allow public read access to audit_logs" on public.audit_logs;
create policy "Allow public read access to audit_logs" on public.audit_logs for select using (true);
drop policy if exists "Allow public insert to audit_logs" on public.audit_logs;
create policy "Allow public insert to audit_logs" on public.audit_logs for insert with check (true);

-- Profiles policies
drop policy if exists "Allow public read access to profiles" on public.profiles;
create policy "Allow public read access to profiles" on public.profiles for select using (true);
drop policy if exists "Allow public insert to profiles" on public.profiles;
create policy "Allow public insert to profiles" on public.profiles for insert with check (true);
drop policy if exists "Allow public update to profiles" on public.profiles;
create policy "Allow public update to profiles" on public.profiles for update using (true);
drop policy if exists "Allow public delete to profiles" on public.profiles;
create policy "Allow public delete to profiles" on public.profiles for delete using (true);

-- Create indexes
create index if not exists idx_price_records_status on public.price_records(status);
create index if not exists idx_price_records_brand on public.price_records(brand);
create index if not exists idx_price_records_inventory on public.price_records(inventory);
create index if not exists idx_price_records_expiry on public.price_records(expiry_date);
create index if not exists idx_profiles_status on public.profiles(status);

-- Insert sample data
insert into public.price_records (item_no, inventory, brand, model, description, category, uom, var_price, srp_price, lp_price, buying_price, stock_availability, warranty_information, quote_date, expiry_date, status)
values
  ('ITM-001', 'INV-100', 'Epson', 'EB-L210W', 'Epson EB-L210W WXGA 3LCD Laser Projector', 'Projectors', 'Unit', 1200.00, 1500.00, 1100.00, 1000.00, 'In Stock', '3 Years', now(), now() + interval '30 days', 'Active'),
  ('ITM-002', 'INV-101', 'Panasonic', 'PT-MZ682B', 'Panasonic PT-MZ682B LCD Laser Projector', 'Projectors', 'Unit', 2500.00, 3000.00, 2400.00, 2200.00, 'Out of Stock', '2 Years', now(), now() + interval '7 days', 'Expiring Soon'),
  ('ITM-003', 'INV-102', 'DJI', 'Mavic 3', 'DJI Mavic 3 Pro Drone', 'Drones', 'Unit', 2100.00, 2500.00, 2000.00, 1800.00, 'Pre-order', '1 Year', now() - interval '40 days', now() - interval '10 days', 'Expired'),
  ('ITM-004', 'INV-103', 'Unknown', 'Legacy-X', 'Old Legacy System Part', 'Parts', 'Piece', 0.00, 0.00, 0.00, 0.00, 'None', 'N/A', now() - interval '60 days', now() - interval '30 days', 'No Offer'),
  ('ITM-005', 'INV-104', 'Sony', 'VPL-PHZ60', 'Sony VPL-PHZ60 Laser Projector', 'Projectors', 'Unit', 0.00, 0.00, 0.00, 0.00, 'Discontinued', 'N/A', now() - interval '100 days', now() - interval '70 days', 'EOL')
on conflict (id) do nothing;
