import { supabase } from './supabase'

/**
 * Carrega todos os dados do usuário do Supabase.
 * Retorna um Map de chave → dados (JSONB).
 */
export async function carregarTodosDoSupabase(
  userId: string
): Promise<Map<string, unknown>> {
  const resultado = new Map<string, unknown>()

  try {
    const { data, error } = await supabase
      .from('dados_app')
      .select('chave, dados')
      .eq('user_id', userId)

    if (error) {
      console.warn('[db] Erro ao carregar dados_app:', error.message)
      return resultado
    }

    if (data) {
      for (const row of data) {
        resultado.set(row.chave, row.dados)
      }
    }
  } catch (err) {
    console.warn('[db] Exceção ao carregar dados_app:', err)
  }

  return resultado
}

/**
 * Salva os dados de uma store no Supabase (upsert).
 */
export async function salvarNoSupabase(
  userId: string,
  chave: string,
  dados: unknown
): Promise<void> {
  try {
    const { error } = await supabase.from('dados_app').upsert(
      {
        user_id: userId,
        chave,
        dados,
        atualizado_em: new Date().toISOString(),
      },
      { onConflict: 'user_id,chave' }
    )

    if (error) {
      console.warn(`[db] Erro ao salvar ${chave}:`, error.message)
    }
  } catch (err) {
    console.warn(`[db] Exceção ao salvar ${chave}:`, err)
  }
}
