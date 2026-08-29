-- ============================================
-- FarmSmith Foods — Auto-create customer profile on signup
-- ============================================

create or replace function public.handle_new_customer_signup()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.customer_profiles (id, full_name, phone)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'phone'
  )
  on conflict (id) do update set
    full_name = coalesce(excluded.full_name, customer_profiles.full_name),
    phone = coalesce(excluded.phone, customer_profiles.phone),
    updated_at = now();

  return new;
end;
$$;

-- Trigger to execute automatically after user creation in auth.users
drop trigger if exists on_auth_user_created_customer_profile on auth.users;
create trigger on_auth_user_created_customer_profile
  after insert on auth.users
  for each row execute function public.handle_new_customer_signup();
