-- Schema for minimal MVP
create schema if not exists public;

create table if not exists public.verses (
  id bigserial primary key,
  book text not null,
  chapter int not null,
  verse int not null,
  text text not null,
  testament text check (testament in ('OT','NT'))
);

-- Indexes to speed up lookups
create index if not exists idx_verses_book_chapter_verse on public.verses(book, chapter, verse);
create index if not exists idx_verses_text_trgm on public.verses using gin (text gin_trgm_ops);

-- Enable RLS and allow read-only access for anon
alter table public.verses enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'verses' and policyname = 'Allow anon read'
  ) then
    create policy "Allow anon read"
      on public.verses for select
      to anon
      using (true);
  end if;
end $$;

-- Sample data to verify (optional)
insert into public.verses (book, chapter, verse, text, testament)
values
  ('John', 3, 16, 'ځکه خدای نړۍ دومره مینه کړه چې خپل یوازینی زوی یې ورکړ، څو هر څوک چې په هغه ایمان راوړي، هلاک نه شي بلکې ابدي ژوند ولري.', 'NT')
on conflict do nothing;

