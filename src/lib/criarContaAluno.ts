import { supabase } from './supabase'

export interface DadosNovoAluno {
  nome: string
  email: string
  senha: string
  telefone?: string
  instagram?: string
  fotoBase64?: string
  plano?: string
  dataInicio?: string
  dataVencimento?: string
  objetivo?: string
  observacoes?: string
}

export interface ResultadoCriacaoAluno {
  sucesso: boolean
  alunoId?: string
  erro?: string
}

export async function criarContaAluno(
  dados: DadosNovoAluno
): Promise<ResultadoCriacaoAluno> {
  // Validações básicas
  if (!dados.nome.trim()) return { sucesso: false, erro: 'Nome é obrigatório' }
  if (!dados.email.trim()) return { sucesso: false, erro: 'Email é obrigatório' }
  if (!dados.senha || dados.senha.length < 6) {
    return { sucesso: false, erro: 'Senha deve ter pelo menos 6 caracteres' }
  }

  try {
    // 1) Salvar sessão do admin antes de signUp (signUp troca a sessão)
    const { data: { session: adminSession } } = await supabase.auth.getSession()

    // 2) Criar usuário via signUp
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: dados.email.trim().toLowerCase(),
      password: dados.senha,
      options: {
        data: { full_name: dados.nome.trim() },
      },
    })

    if (signUpError) {
      if (signUpError.message.includes('already registered')) {
        return { sucesso: false, erro: 'Este email já está cadastrado' }
      }
      return { sucesso: false, erro: signUpError.message }
    }

    if (!signUpData.user) {
      return { sucesso: false, erro: 'Erro ao criar usuário' }
    }

    const novoUserId = signUpData.user.id

    // 3) Restaurar sessão do admin
    if (adminSession) {
      await supabase.auth.setSession({
        access_token: adminSession.access_token,
        refresh_token: adminSession.refresh_token,
      })
    }

    // 4) Criar/atualizar perfil completo (agora como admin)
    const { error: perfilError } = await supabase
      .from('perfis')
      .upsert(
        {
          id: novoUserId,
          nome: dados.nome.trim(),
          email: dados.email.trim().toLowerCase(),
          telefone: dados.telefone?.trim() || null,
          instagram: dados.instagram?.trim() || null,
          foto_url: dados.fotoBase64 || null,
          perfil: 'aluno',
          ativo: true,
          plano: dados.plano?.trim() || null,
          data_inicio: dados.dataInicio || null,
          data_vencimento: dados.dataVencimento || null,
          objetivo: dados.objetivo?.trim() || null,
          observacoes: dados.observacoes?.trim() || null,
        },
        { onConflict: 'id' }
      )

    if (perfilError) {
      console.error('Erro ao salvar perfil:', perfilError)
      // Conta criada mas perfil falhou — não é fatal
    }

    return { sucesso: true, alunoId: novoUserId }
  } catch (err: unknown) {
    console.error('Erro ao criar conta do aluno:', err)
    return {
      sucesso: false,
      erro: err instanceof Error ? err.message : 'Erro inesperado ao criar conta',
    }
  }
}

// Helper: calcular força da senha
export function calcularForcaSenha(senha: string): number {
  let forca = 0
  if (senha.length >= 6) forca++
  if (senha.length >= 10) forca++
  if (/[A-Z]/.test(senha) && /[a-z]/.test(senha)) forca++
  if (/[0-9]/.test(senha) || /[^A-Za-z0-9]/.test(senha)) forca++
  return forca
}
