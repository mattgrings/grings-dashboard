import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ChatText,
  PaperPlaneRight,
  ArrowLeft,
  CheckCircle,
} from '@phosphor-icons/react'
import GradienteHeader from '../components/ui/GradienteHeader'
import { useChatStore } from '../store/chatStore'
import { useAlunosStore } from '../store/alunosStore'
import { useAuthStore } from '../store/authStore'

export default function Chat() {
  const [conversaAberta, setConversaAberta] = useState<string | null>(null)
  const conversas = useChatStore((s) => s.conversas)
  const user = useAuthStore((s) => s.user)
  const isAdmin = user?.role === 'admin'

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {!conversaAberta ? (
        <ListaConversas
          conversas={conversas}
          onAbrir={setConversaAberta}
          isAdmin={isAdmin}
        />
      ) : (
        <ConversaAberta
          conversaId={conversaAberta}
          onVoltar={() => setConversaAberta(null)}
          isAdmin={isAdmin}
        />
      )}
    </motion.div>
  )
}

function ListaConversas({
  conversas,
  onAbrir,
  isAdmin,
}: {
  conversas: ReturnType<typeof useChatStore.getState>['conversas']
  onAbrir: (id: string) => void
  isAdmin: boolean
}) {
  const alunos = useAlunosStore((s) => s.alunos).filter((a) => a.status === 'ativo')
  const getOrCreate = useChatStore((s) => s.getOrCreateConversa)

  return (
    <>
      <GradienteHeader
        icone={ChatText}
        titulo="Chat"
        subtitulo={`${conversas.length} conversa(s)`}
        corIcone="#A855F7"
      />

      {/* List or create for admin */}
      {isAdmin && conversas.length === 0 && (
        <div className="text-center py-12 space-y-3">
          <ChatText size={48} className="mx-auto text-gray-600" />
          <p className="text-white font-bold">Nenhuma conversa ainda</p>
          <p className="text-gray-500 text-sm">Selecione um aluno para iniciar uma conversa.</p>
        </div>
      )}

      {/* Active conversations */}
      <div className="space-y-2">
        {conversas.map((c) => {
          const naoLidas = isAdmin ? c.naoLidasAdmin : c.naoLidasAluno
          return (
            <motion.button
              key={c.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => onAbrir(c.id)}
              className="w-full text-left bg-[#161616] border border-white/5 rounded-2xl p-4 hover:border-purple-400/30 transition-all touch-manipulation"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-sm flex-shrink-0">
                  {c.alunoNome.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm">{c.alunoNome}</p>
                  {c.ultimaMensagem && (
                    <p className="text-gray-500 text-xs truncate">{c.ultimaMensagem}</p>
                  )}
                </div>
                {naoLidas > 0 && (
                  <span className="w-5 h-5 rounded-full bg-purple-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {naoLidas}
                  </span>
                )}
              </div>
            </motion.button>
          )
        })}
      </div>

      {/* Alunos sem conversa (admin only) */}
      {isAdmin && (
        <div className="space-y-2">
          <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">
            Iniciar conversa com
          </p>
          {alunos
            .filter((a) => !conversas.some((c) => c.alunoId === a.id))
            .map((aluno) => (
              <button
                key={aluno.id}
                onClick={() => {
                  const conv = getOrCreate(aluno.id, aluno.nome)
                  onAbrir(conv.id)
                }}
                className="w-full text-left bg-[#111111] border border-white/5 rounded-xl p-3 hover:border-purple-400/30 transition-all touch-manipulation flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 font-bold text-xs">
                  {aluno.nome.slice(0, 2).toUpperCase()}
                </div>
                <span className="text-gray-400 text-sm">{aluno.nome}</span>
              </button>
            ))}
        </div>
      )}
    </>
  )
}

function ConversaAberta({
  conversaId,
  onVoltar,
  isAdmin,
}: {
  conversaId: string
  onVoltar: () => void
  isAdmin: boolean
}) {
  const [texto, setTexto] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const user = useAuthStore((s) => s.user)
  const conversa = useChatStore((s) => s.conversas.find((c) => c.id === conversaId))
  const mensagens = useChatStore((s) => s.getMensagens(conversaId))
  const enviar = useChatStore((s) => s.enviarMensagem)
  const marcarLidas = useChatStore((s) => s.marcarLidas)

  useEffect(() => {
    marcarLidas(conversaId, isAdmin ? 'admin' : 'aluno')
  }, [conversaId, mensagens.length, marcarLidas, isAdmin])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [mensagens.length])

  const handleEnviar = () => {
    if (!texto.trim()) return
    enviar(
      conversaId,
      texto.trim(),
      isAdmin ? 'admin' : 'aluno',
      user?.nome ?? 'Usuário'
    )
    setTexto('')
  }

  return (
    <div className="flex flex-col" style={{ minHeight: 'calc(100dvh - 180px)' }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <button onClick={onVoltar} className="touch-manipulation">
          <ArrowLeft size={24} className="text-white" />
        </button>
        <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-sm">
          {conversa?.alunoNome.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <p className="text-white font-bold text-sm">{conversa?.alunoNome}</p>
          <p className="text-gray-500 text-xs">{isAdmin ? 'Aluno' : 'Consultoria'}</p>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-3 pb-4"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {mensagens.length === 0 && (
          <div className="text-center py-12">
            <ChatText size={40} className="mx-auto text-gray-600 mb-2" />
            <p className="text-gray-500 text-sm">Nenhuma mensagem ainda. Diga oi!</p>
          </div>
        )}
        {mensagens.map((msg) => {
          const isMine =
            (isAdmin && msg.remetente === 'admin') ||
            (!isAdmin && msg.remetente === 'aluno')
          return (
            <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${
                  isMine
                    ? 'bg-[#00E620] text-black rounded-br-md'
                    : 'bg-[#161616] text-white border border-white/5 rounded-bl-md'
                }`}
              >
                <p>{msg.conteudo}</p>
                <p
                  className={`text-[10px] mt-1 ${
                    isMine ? 'text-black/50' : 'text-gray-600'
                  }`}
                >
                  {new Date(msg.criadoEm).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                  {isMine && msg.lida && (
                    <CheckCircle size={10} className="inline ml-1" weight="fill" />
                  )}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Input */}
      <div className="flex gap-2 items-end">
        <input
          type="text"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleEnviar()}
          placeholder="Digite sua mensagem..."
          className="flex-1 bg-[#111111] border border-white/10 rounded-2xl px-4 py-3 text-white placeholder:text-gray-600 outline-none focus:border-[#00E620] transition-colors"
        />
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleEnviar}
          disabled={!texto.trim()}
          className="w-12 h-12 rounded-2xl bg-[#00E620] flex items-center justify-center shadow-[0_0_15px_rgba(0,230,32,0.4)] disabled:opacity-40 touch-manipulation"
        >
          <PaperPlaneRight size={20} color="#000" weight="fill" />
        </motion.button>
      </div>
    </div>
  )
}
