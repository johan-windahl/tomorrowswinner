-- Simple seed: one crypto competition with two options
insert into public.competitions (category, title, slug, start_at, deadline_at, evaluation_end_at)
values (
  'crypto',
  'Crypto: best performer today',
  'crypto-best-today',
  (now() at time zone 'America/New_York')::timestamptz,
  (date_trunc('day', now() at time zone 'America/New_York') + interval '22 hours')::timestamptz,
  (date_trunc('day', (now() at time zone 'America/New_York') + interval '1 day') + interval '23 hours 59 minutes')::timestamptz
)
on conflict (slug) do nothing;

with c as (
  select id from public.competitions where slug = 'crypto-best-today'
)
insert into public.options (competition_id, symbol, name)
select c.id, v.symbol, v.name
from c cross join (values
  ('BTC','Bitcoin'),
  ('ETH','Ethereum')
) as v(symbol, name)
on conflict (competition_id, symbol) do nothing;


