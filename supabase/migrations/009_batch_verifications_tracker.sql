-- ==============================================================================
-- FARMSMITH FOODS — BATCH QUALITY VERIFICATIONS TRACKER
-- Tracks total "Verify Quality" button checks with atomic increment RPC
-- ==============================================================================

create table if not exists public.site_metrics (
  id text primary key,
  count bigint not null default 0,
  updated_at timestamptz not null default now()
);

-- Seed initial counter starting from 0 (real click data only)
insert into public.site_metrics (id, count)
values ('batch_verifications', 0)
on conflict (id) do nothing;

-- Enable Row Level Security
alter table public.site_metrics enable row level security;

-- Allow public read access to metrics
create policy "Allow public read site_metrics"
  on public.site_metrics for select
  to anon, authenticated
  using (true);

-- Atomic increment function callable by frontend / API
create or replace function public.increment_site_metric(metric_id text, increment_by int default 1)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  new_count bigint;
begin
  insert into public.site_metrics (id, count, updated_at)
  values (metric_id, increment_by, now())
  on conflict (id) do update
  set count = site_metrics.count + increment_by,
      updated_at = now()
  returning count into new_count;

  return new_count;
end;
$$;

grant execute on function public.increment_site_metric(text, int) to anon, authenticated, service_role;
