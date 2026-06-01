-- Zexter Agent Database Schema
-- Run this in the Supabase SQL Editor

-- daily_briefs: stores AI-generated pre-market intelligence briefs
create table if not exists daily_briefs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  brief_date date not null,
  day_type text,
  day_type_reason text,
  primary_catalyst jsonb,
  trade_params jsonb,
  time_windows jsonb,
  full_brief text,
  data_source text,
  overnight_context text,
  warning_flags jsonb
);

create index if not exists daily_briefs_date_idx on daily_briefs (brief_date desc);

-- Post-session review columns (added for session analysis feature)
alter table daily_briefs add column if not exists post_session_notes text;
alter table daily_briefs add column if not exists actual_day_type text;
alter table daily_briefs add column if not exists actual_nq_range numeric;
alter table daily_briefs add column if not exists rules_followed boolean;
alter table daily_briefs add column if not exists rules_broken text;
alter table daily_briefs add column if not exists post_session_analysis text;

-- trade_logs: individual trade records
create table if not exists trade_logs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  trade_date date not null,
  trade_time text,
  trade_num integer,
  pts numeric not null,
  result text not null,
  pnl numeric not null,
  contracts integer default 3,
  day_type text,
  brief_id uuid,
  account_name text default 'PA1',
  notes text
);

create index if not exists trade_logs_date_idx on trade_logs (trade_date desc);

-- account_snapshots: balance snapshots for Apex accounts
create table if not exists account_snapshots (
  id uuid primary key default gen_random_uuid(),
  snapshot_date date not null,
  account_name text not null,
  account_type text not null,
  balance numeric not null,
  drawdown_floor numeric,
  payout_requested numeric default 0,
  status text default 'active'
);

create index if not exists account_snapshots_date_idx on account_snapshots (snapshot_date desc);
create index if not exists account_snapshots_account_idx on account_snapshots (account_name);
