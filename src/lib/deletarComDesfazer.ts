import { supabase } from './supabase'

interface ItemParaDesfazer {
  tabela: string
  id: string
  dados: unknown
  timer: ReturnType<typeof setTimeout>
  onDesfazer: () => void
}

// Fila de itens aguardando exclusão definitiva
const filaExclusao = new Map<string, ItemParaDesfazer>()

// Callback global para toast
let toastCallback: ((msg: string, onDesfazer: () => void) => void) | null = null

export function registrarToastCallback(cb: (msg: string, onDesfazer: () => void) => void) {
  toastCallback = cb
}

export async function deletarComDesfazer(
  id: string,
  tabela: string,
  dados: unknown,
  onAtualizar: () => void,
  mensagem?: string
) {
  // Remover da UI imediatamente (optimistic)
  onAtualizar()

  // Mostrar toast com desfazer
  if (toastCallback) {
    toastCallback(mensagem ?? 'Item excluído', () => {
      // DESFAZER: cancelar o timer e restaurar
      const item = filaExclusao.get(id)
      if (item) {
        clearTimeout(item.timer)
        filaExclusao.delete(id)
        item.onDesfazer()
      }
    })
  }

  // Agendar exclusão real após 5 segundos
  const timer = setTimeout(async () => {
    filaExclusao.delete(id)
    const { error } = await supabase.from(tabela).delete().eq('id', id)
    if (error) {
      console.error('[deletarComDesfazer] Erro na exclusão:', error)
    }
  }, 5000)

  filaExclusao.set(id, {
    tabela,
    id,
    dados,
    timer,
    onDesfazer: onAtualizar,
  })
}
