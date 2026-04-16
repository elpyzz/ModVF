-- Additive migration for monthly modpack credits (safe for existing users)
-- Run manually on Supabase SQL editor.

alter table if exists public.profiles
  add column if not exists monthly_modpack_credits_total integer not null default 0,
  add column if not exists monthly_modpack_credits_used integer not null default 0,
  add column if not exists monthly_credits_period_start timestamptz null,
  add column if not exists monthly_credits_period_end timestamptz null;

alter table if exists public.translations
  add column if not exists billing_source text null,
  add column if not exists billing_consumed_at timestamptz null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'translations_billing_source_check'
  ) then
    alter table public.translations
      add constraint translations_billing_source_check
      check (billing_source in ('none', 'monthly', 'purchased') or billing_source is null);
  end if;
end
$$;

create index if not exists idx_translations_user_type_status_created
  on public.translations(user_id, type, status, created_at desc);

create index if not exists idx_translations_user_billing_period
  on public.translations(user_id, type, billing_source, billing_consumed_at, created_at desc);
