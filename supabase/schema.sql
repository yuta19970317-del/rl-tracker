-- players
create table if not exists players (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- matches
create table if not exists matches (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  winner1_id uuid not null references players(id),
  winner2_id uuid not null references players(id),
  loser1_id uuid not null references players(id),
  loser2_id uuid not null references players(id),
  memo text not null default '',
  created_at timestamptz not null default now()
);

-- match_players (individual stats per player per match)
create table if not exists match_players (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references matches(id) on delete cascade,
  player_id uuid not null references players(id),
  team text not null check (team in ('winner', 'loser')),
  score integer not null default 0,
  goals integer not null default 0,
  assists integer not null default 0,
  saves integer not null default 0,
  shots integer not null default 0
);

-- app_settings (shared key-value config)
create table if not exists app_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

insert into app_settings (key, value)
values ('ranking_min_matches', '3')
on conflict (key) do nothing;

-- RLS: 認証なしで全員読み書き可（URLを知っている人全員が操作できる設計）
alter table players enable row level security;
alter table matches enable row level security;
alter table match_players enable row level security;

create policy "public read players" on players for select using (true);
create policy "public insert players" on players for insert with check (true);
create policy "public update players" on players for update using (true);

create policy "public read matches" on matches for select using (true);
create policy "public insert matches" on matches for insert with check (true);
create policy "public update matches" on matches for update using (true);
create policy "public delete matches" on matches for delete using (true);

create policy "public read match_players" on match_players for select using (true);
create policy "public insert match_players" on match_players for insert with check (true);
create policy "public update match_players" on match_players for update using (true);
create policy "public delete match_players" on match_players for delete using (true);

alter table app_settings enable row level security;

create policy "public read app_settings" on app_settings for select using (true);
create policy "public update app_settings" on app_settings for update using (true);
