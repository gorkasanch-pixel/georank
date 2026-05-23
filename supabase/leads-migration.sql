-- ─── GEORANK MIGRATION: LEADS ────────────────────────────────────────────────
-- Run this in Supabase SQL Editor → New Query → Run
-- This adds waitlist + demo booking tables to your existing schema

-- ─── WAITLIST ─────────────────────────────────────────────────────────────────
create table public.waitlist (
  id            uuid default gen_random_uuid() primary key,
  first_name    text not null,
  last_name     text,
  email         text not null unique,
  business_type text,
  locations     text,
  note          text,
  status        text not null default 'waiting',  -- waiting | invited | converted
  source        text default 'landing_page',
  created_at    timestamptz default now()
);

-- ─── DEMO BOOKINGS ────────────────────────────────────────────────────────────
create table public.demo_bookings (
  id          uuid default gen_random_uuid() primary key,
  name        text not null,
  email       text not null,
  slot_day    text not null,
  slot_time   text not null,
  status      text not null default 'confirmed',  -- confirmed | cancelled | completed
  notes       text,
  created_at  timestamptz default now()
);

-- ─── ROW LEVEL SECURITY ───────────────────────────────────────────────────────
-- These tables are write-only from the public (anyone can submit)
-- Only admins can read them

alter table public.waitlist       enable row level security;
alter table public.demo_bookings  enable row level security;

-- Public can insert (submit the form)
create policy "Anyone can join waitlist"
  on public.waitlist for insert
  with check (true);

create policy "Anyone can book a demo"
  on public.demo_bookings for insert
  with check (true);

-- Only admins can read leads
create policy "Admins can read waitlist"
  on public.waitlist for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can read demo bookings"
  on public.demo_bookings for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Admins can update status (e.g. mark as invited / completed)
create policy "Admins can update waitlist"
  on public.waitlist for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can update demo bookings"
  on public.demo_bookings for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ─── INDEXES ──────────────────────────────────────────────────────────────────
create index on public.waitlist      (email);
create index on public.waitlist      (status);
create index on public.waitlist      (created_at desc);
create index on public.demo_bookings (email);
create index on public.demo_bookings (created_at desc);

-- ─── HANDY VIEW FOR ADMIN DASHBOARD ──────────────────────────────────────────
-- Shows total leads at a glance
create or replace view public.leads_summary as
select
  (select count(*) from public.waitlist)                            as total_waitlist,
  (select count(*) from public.waitlist where status = 'waiting')  as pending_waitlist,
  (select count(*) from public.waitlist where status = 'invited')  as invited,
  (select count(*) from public.waitlist where status = 'converted')as converted,
  (select count(*) from public.demo_bookings)                       as total_demos,
  (select count(*) from public.demo_bookings where status = 'confirmed') as upcoming_demos;
