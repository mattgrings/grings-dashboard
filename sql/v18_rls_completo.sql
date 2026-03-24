-- =====================================================
-- V18 — RLS COMPLETO + TABELAS + COLUNAS
-- Executar TUDO de uma vez no Supabase SQL Editor
-- =====================================================

-- ── COLUNAS EXTRAS NO PERFIS ──────────────────────────
alter table public.perfis add column if not exists peso_kg         numeric;
alter table public.perfis add column if not exists altura_cm       numeric;
alter table public.perfis add column if not exists imc             numeric;
alter table public.perfis add column if not exists meta_peso_kg    numeric;
alter table public.perfis add column if not exists tipo_plano      text default 'light';
alter table public.perfis add column if not exists plano_entregue  boolean default false;
alter table public.perfis add column if not exists data_inicio     date;
alter table public.perfis add column if not exists data_vencimento date;
alter table public.perfis add column if not exists objetivo        text;
alter table public.perfis add column if not exists plano           text;
alter table public.perfis add column if not exists observacoes     text;
alter table public.perfis add column if not exists ativo           boolean default true;
alter table public.perfis add column if not exists telefone        text;
alter table public.perfis add column if not exists instagram       text;

-- ── TABELA: REGISTROS DE PESO ─────────────────────────
create table if not exists public.registros_peso (
  id        uuid default gen_random_uuid() primary key,
  aluno_id  uuid references public.perfis(id) on delete cascade not null,
  peso_kg   numeric not null,
  data      date not null default current_date,
  imc       numeric,
  observ    text default '',
  criado_em timestamptz default now()
);

alter table public.registros_peso enable row level security;
drop policy if exists "aluno_peso"  on public.registros_peso;
drop policy if exists "admin_peso"  on public.registros_peso;

create policy "aluno_peso"
  on public.registros_peso for all to authenticated
  using (aluno_id = auth.uid())
  with check (aluno_id = auth.uid());

create policy "admin_peso"
  on public.registros_peso for all to authenticated
  using (
    (select perfil from public.perfis where id = auth.uid()) = 'admin'
  )
  with check (
    (select perfil from public.perfis where id = auth.uid()) = 'admin'
  );

-- ── TABELA: FOTOS DE EVOLUCAO ─────────────────────────
create table if not exists public.fotos_evolucao (
  id          uuid default gen_random_uuid() primary key,
  aluno_id    uuid references public.perfis(id) on delete cascade not null,
  url         text not null,
  data_foto   date not null default current_date,
  peso_kg     numeric,
  tipo_foto   text default 'frente',
  observacoes text default '',
  enviada_por text default 'aluno',
  criado_em   timestamptz default now()
);

alter table public.fotos_evolucao enable row level security;
drop policy if exists "aluno_fotos" on public.fotos_evolucao;
drop policy if exists "admin_fotos" on public.fotos_evolucao;

create policy "aluno_fotos"
  on public.fotos_evolucao for all to authenticated
  using (aluno_id = auth.uid())
  with check (aluno_id = auth.uid());

create policy "admin_fotos"
  on public.fotos_evolucao for all to authenticated
  using (
    (select perfil from public.perfis where id = auth.uid()) = 'admin'
  )
  with check (
    (select perfil from public.perfis where id = auth.uid()) = 'admin'
  );

-- ── TABELA: NOTIFICACOES ──────────────────────────────
create table if not exists public.notificacoes (
  id         uuid default gen_random_uuid() primary key,
  tipo       text not null,
  titulo     text not null,
  mensagem   text default '',
  aluno_id   uuid,
  referencia text,
  lida       boolean default false,
  criado_em  timestamptz default now()
);

alter table public.notificacoes enable row level security;
drop policy if exists "admin_notif"   on public.notificacoes;
drop policy if exists "inserir_notif" on public.notificacoes;

create policy "admin_notif"
  on public.notificacoes for all to authenticated
  using (
    (select perfil from public.perfis where id = auth.uid()) = 'admin'
  )
  with check (
    (select perfil from public.perfis where id = auth.uid()) = 'admin'
  );

create policy "inserir_notif"
  on public.notificacoes for insert to authenticated
  with check (true);

-- ── STORAGE: BUCKET FOTOS ─────────────────────────────
insert into storage.buckets (id, name, public)
values ('fotos-evolucao', 'fotos-evolucao', true)
on conflict (id) do nothing;

drop policy if exists "fotos_publicas"     on storage.objects;
drop policy if exists "aluno_upload_fotos" on storage.objects;
drop policy if exists "admin_upload_fotos" on storage.objects;

create policy "fotos_publicas"
  on storage.objects for select
  using (bucket_id = 'fotos-evolucao');

create policy "aluno_upload_fotos"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'fotos-evolucao'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "admin_upload_fotos"
  on storage.objects for all to authenticated
  using (
    bucket_id = 'fotos-evolucao'
    and (select perfil from public.perfis where id = auth.uid()) = 'admin'
  )
  with check (
    bucket_id = 'fotos-evolucao'
    and (select perfil from public.perfis where id = auth.uid()) = 'admin'
  );

-- ── ZERAR VALORES INVALIDOS ───────────────────────────
update public.perfis set peso_kg = null where peso_kg = 0;
update public.perfis set altura_cm = null where altura_cm = 0;
update public.perfis set imc = null where imc = 0;
