-- ============================================================
-- RODAR NO SUPABASE SQL EDITOR (Dashboard > SQL Editor > New Query)
-- ============================================================

-- Tabela que guarda os dados de cada store por usuário
CREATE TABLE IF NOT EXISTS dados_app (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  chave TEXT NOT NULL,
  dados JSONB NOT NULL DEFAULT '{}',
  atualizado_em TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, chave)
);

-- Índice para busca rápida por usuário
CREATE INDEX IF NOT EXISTS idx_dados_app_user_id ON dados_app(user_id);

-- RLS: cada usuário só acessa seus próprios dados
ALTER TABLE dados_app ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios veem apenas seus dados"
  ON dados_app FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuarios inserem apenas seus dados"
  ON dados_app FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios atualizam apenas seus dados"
  ON dados_app FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuarios deletam apenas seus dados"
  ON dados_app FOR DELETE
  USING (auth.uid() = user_id);
