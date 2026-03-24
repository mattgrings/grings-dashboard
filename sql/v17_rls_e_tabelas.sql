-- ═══════════════════════════════════════════════════════════════
-- V17 — TABELAS NOVAS + RLS COMPLETO
-- Executar no Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- ── TABELA: REGISTROS DE PESO ─────────────────────────────────
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

drop policy if exists "Aluno gerencia proprio peso" on public.registros_peso;
create policy "Aluno gerencia proprio peso"
  on public.registros_peso for all
  to authenticated
  using (aluno_id = auth.uid())
  with check (aluno_id = auth.uid());

drop policy if exists "Admin ve registros de peso" on public.registros_peso;
create policy "Admin ve registros de peso"
  on public.registros_peso for all
  to authenticated
  using (
    exists (
      select 1 from public.perfis
      where id = auth.uid() and perfil = 'admin'
    )
  );

-- ── TABELA: FOTOS DE EVOLUCAO ─────────────────────────────────
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

drop policy if exists "Aluno gerencia proprias fotos" on public.fotos_evolucao;
create policy "Aluno gerencia proprias fotos"
  on public.fotos_evolucao for all
  to authenticated
  using (aluno_id = auth.uid())
  with check (aluno_id = auth.uid());

drop policy if exists "Admin gerencia fotos" on public.fotos_evolucao;
create policy "Admin gerencia fotos"
  on public.fotos_evolucao for all
  to authenticated
  using (
    exists (
      select 1 from public.perfis
      where id = auth.uid() and perfil = 'admin'
    )
  );

-- ── TABELA: NOTIFICACOES ──────────────────────────────────────
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

drop policy if exists "Admin ve notificacoes" on public.notificacoes;
create policy "Admin ve notificacoes"
  on public.notificacoes for all
  to authenticated
  using (
    exists (
      select 1 from public.perfis
      where id = auth.uid() and perfil = 'admin'
    )
  );

drop policy if exists "Qualquer autenticado insere notificacao" on public.notificacoes;
create policy "Qualquer autenticado insere notificacao"
  on public.notificacoes for insert
  to authenticated
  with check (true);

-- ── STORAGE: BUCKET FOTOS EVOLUCAO ────────────────────────────
insert into storage.buckets (id, name, public)
values ('fotos-evolucao', 'fotos-evolucao', true)
on conflict (id) do nothing;

-- Aluno gerencia proprias fotos no storage
drop policy if exists "Aluno gerencia proprias fotos storage" on storage.objects;
create policy "Aluno gerencia proprias fotos storage"
  on storage.objects for all
  to authenticated
  using (
    bucket_id = 'fotos-evolucao'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'fotos-evolucao'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Admin ve todas as fotos no storage
drop policy if exists "Admin ve todas fotos storage" on storage.objects;
create policy "Admin ve todas fotos storage"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'fotos-evolucao'
    and exists (
      select 1 from public.perfis
      where id = auth.uid() and perfil = 'admin'
    )
  );

-- Admin upload para qualquer pasta
drop policy if exists "Admin upload fotos storage" on storage.objects;
create policy "Admin upload fotos storage"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'fotos-evolucao'
    and exists (
      select 1 from public.perfis
      where id = auth.uid() and perfil = 'admin'
    )
  );

-- ── ADICIONAR COLUNAS NO PERFIL (se nao existem) ─────────────
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'perfis' and column_name = 'peso_kg') then
    alter table public.perfis add column peso_kg numeric;
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'perfis' and column_name = 'altura_cm') then
    alter table public.perfis add column altura_cm numeric;
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'perfis' and column_name = 'imc') then
    alter table public.perfis add column imc numeric;
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'perfis' and column_name = 'meta_peso_kg') then
    alter table public.perfis add column meta_peso_kg numeric;
  end if;
end $$;

-- ── RLS PARA PLANOS DE TREINO ─────────────────────────────────
-- (caso as tabelas existam do v16)

do $$
begin
  if exists (select 1 from information_schema.tables where table_name = 'planos_treino') then
    execute 'alter table public.planos_treino enable row level security';

    execute 'drop policy if exists "Aluno ve proprio treino" on public.planos_treino';
    execute 'create policy "Aluno ve proprio treino" on public.planos_treino for select to authenticated using (aluno_id = auth.uid())';

    execute 'drop policy if exists "Admin gerencia treinos" on public.planos_treino';
    execute 'create policy "Admin gerencia treinos" on public.planos_treino for all to authenticated using (exists (select 1 from public.perfis where id = auth.uid() and perfil = ''admin''))';
  end if;
end $$;
