-- ============================================================
-- FarmSmith Foods - Contact Inquiries Table
-- Stores user messages submitted through the Contact Us page
-- ============================================================

create table if not exists contact_inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text,
  message text not null,
  status text not null default 'new',
  created_at timestamptz not null default now()
);

alter table contact_inquiries enable row level security;

drop policy if exists "Public can create contact inquiries" on contact_inquiries;
create policy "Public can create contact inquiries"
  on contact_inquiries
  for insert
  to anon, authenticated
  with check (true);
