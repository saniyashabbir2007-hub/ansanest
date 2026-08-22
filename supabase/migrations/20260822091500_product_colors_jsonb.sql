-- Convert products.colors from text[] (color names) to jsonb objects.
-- { colorName, colorCode, imageUrl }

do $$
begin
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'products'
      and column_name = 'colors'
  ) then
    alter table public.products
      add column colors jsonb not null default '[]'::jsonb;
  elsif exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'products'
      and column_name = 'colors'
      and udt_name = '_text'
  ) then
    alter table public.products
      alter column colors drop default;

    alter table public.products
      alter column colors type jsonb using (
        coalesce(
          (
            select jsonb_agg(
              jsonb_build_object(
                'colorName', c,
                'colorCode', '',
                'imageUrl', ''
              )
            )
            from unnest(colors) as c
          ),
          '[]'::jsonb
        )
      );

    alter table public.products
      alter column colors set default '[]'::jsonb;

    alter table public.products
      alter column colors set not null;
  end if;
end $$;
