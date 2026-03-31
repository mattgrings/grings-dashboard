import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Megaphone,
  Plus,
  X,
  InstagramLogo,
  WhatsappLogo,
  TiktokLogo,
  YoutubeLogo,
  Heart,
  ChatCircle,
  Eye,
  Funnel,
  ChartBar,
  CalendarBlank,
  Kanban,
  Lightbulb,
  ArrowRight,
  Trash,
  DotsThree,
  Pencil,
} from '@phosphor-icons/react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameMonth, isToday } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useSocialStore } from '../store/socialStore'
import type { Conteudo, StatusConteudo, PlataformaSocial, CategoriaConteudo, IdeiaPauta } from '../types'
import EmptyState from '../components/ui/EmptyState'

// ==================== HELPERS ====================

const statusLabels: Record<StatusConteudo, { label: string; emoji: string; cor: string }> = {
  ideia:     { label: 'Ideia',     emoji: '💡', cor: '#888888' },
  roteiro:   { label: 'Roteiro',   emoji: '📝', cor: '#3B82F6' },
  gravado:   { label: 'Gravado',   emoji: '🎬', cor: '#F59E0B' },
  editado:   { label: 'Editado',   emoji: '✂️', cor: '#8B5CF6' },
  agendado:  { label: 'Agendado',  emoji: '⏰', cor: '#06B6D4' },
  publicado: { label: 'Publicado', emoji: '✅', cor: '#00E620' },
}

const statusOrder: StatusConteudo[] = ['ideia', 'roteiro', 'gravado', 'editado', 'agendado', 'publicado']

const plataformaConfig: Record<PlataformaSocial, { label: string; icon: typeof InstagramLogo; color: string }> = {
  instagram_feed: { label: 'Feed', icon: InstagramLogo, color: 'text-pink-400' },
  instagram_reels: { label: 'Reels', icon: InstagramLogo, color: 'text-purple-400' },
  instagram_stories: { label: 'Stories', icon: InstagramLogo, color: 'text-orange-400' },
  whatsapp_status: { label: 'WhatsApp', icon: WhatsappLogo, color: 'text-green-400' },
  tiktok: { label: 'TikTok', icon: TiktokLogo, color: 'text-cyan-400' },
  youtube_shorts: { label: 'Shorts', icon: YoutubeLogo, color: 'text-red-400' },
}

const categoriaLabels: Record<CategoriaConteudo, string> = {
  transformacao: 'Transformação',
  dica_treino: 'Dica Treino',
  dica_nutricao: 'Dica Nutrição',
  bastidores: 'Bastidores',
  depoimento: 'Depoimento',
  oferta: 'Oferta',
  motivacional: 'Motivacional',
  resultado: 'Resultado',
}

const plataformaEmoji: Record<string, string> = {
  instagram_feed: '📸', instagram_reels: '🎬', instagram_stories: '⭕',
  whatsapp_status: '💬', tiktok: '🎵', youtube_shorts: '▶️',
}

const categoriaEmoji: Record<string, string> = {
  transformacao: '💪', dica_treino: '🏋️', dica_nutricao: '🥗',
  bastidores: '🎥', depoimento: '⭐', oferta: '💰',
  motivacional: '🔥', resultado: '📈',
}

function formatNum(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

// ==================== MAIN PAGE ====================

type ViewTab = 'pipeline' | 'calendario' | 'metricas'

export default function SocialSelling() {
  const [view, setView] = useState<ViewTab>('pipeline')
  const [showModal, setShowModal] = useState(false)
  const [showIdeiaModal, setShowIdeiaModal] = useState(false)
  const [conteudoAberto, setConteudoAberto] = useState<Conteudo | null>(null)
  const { conteudos, ideias } = useSocialStore()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
            <Megaphone size={22} className="text-purple-400" />
          </div>
          <h1 className="text-xl md:text-2xl font-display text-white tracking-wider">SOCIAL SELLING</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-[#111111] border border-white/5 rounded-xl p-1">
            {([
              { id: 'pipeline', icon: Kanban, label: 'Pipeline' },
              { id: 'calendario', icon: CalendarBlank, label: 'Calendário' },
              { id: 'metricas', icon: ChartBar, label: 'Métricas' },
            ] as const).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setView(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  view === tab.id ? 'bg-purple-500 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <tab.icon size={14} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-500 text-white font-bold text-sm shadow-[0_0_15px_rgba(168,85,247,0.4)] touch-manipulation"
          >
            <Plus size={16} weight="bold" />
            <span className="hidden sm:inline">Conteúdo</span>
          </button>
        </div>
      </div>

      {/* Views */}
      {view === 'pipeline' && (
        <PipelineView
          conteudos={conteudos}
          ideias={ideias}
          onAddIdeia={() => setShowIdeiaModal(true)}
          onAbrirConteudo={setConteudoAberto}
        />
      )}
      {view === 'calendario' && <CalendarioView conteudos={conteudos} />}
      {view === 'metricas' && <MetricasView conteudos={conteudos} />}

      {/* Modal Novo Conteúdo */}
      <AnimatePresence>
        {showModal && <ConteudoModal onClose={() => setShowModal(false)} />}
        {showIdeiaModal && <IdeiaModal onClose={() => setShowIdeiaModal(false)} />}
      </AnimatePresence>

      {/* Drawer de ver/editar conteúdo */}
      <AnimatePresence>
        {conteudoAberto && (
          <DrawerConteudo
            conteudo={conteudoAberto}
            onFechar={() => setConteudoAberto(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// ==================== PIPELINE VIEW ====================

function PipelineView({
  conteudos, ideias, onAddIdeia, onAbrirConteudo,
}: {
  conteudos: Conteudo[]
  ideias: IdeiaPauta[]
  onAddIdeia: () => void
  onAbrirConteudo: (c: Conteudo) => void
}) {
  const { moveConteudo, deleteConteudo, ideiaToConteudo, deleteIdeia } = useSocialStore()

  if (conteudos.length === 0 && ideias.length === 0) {
    return <EmptyState icon={Megaphone} titulo="Nenhum conteúdo criado" descricao="Comece criando seu primeiro conteúdo para as redes sociais" />
  }

  return (
    <div className="space-y-6">
      {/* Ideias Section */}
      {ideias.length > 0 && (
        <div className="bg-[#111111] border border-white/5 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <Lightbulb size={18} className="text-yellow-400" />
              Banco de Ideias ({ideias.length})
            </h3>
            <button onClick={onAddIdeia} className="text-xs text-purple-400 hover:underline touch-manipulation">+ Nova Ideia</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {ideias.map((ideia) => (
              <div key={ideia.id} className="bg-[#0A0A0A] border border-white/5 rounded-xl p-3 flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{ideia.titulo}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{categoriaLabels[ideia.categoria]}</p>
                </div>
                <div className="flex gap-1 ml-2 shrink-0">
                  <button onClick={() => ideiaToConteudo(ideia.id)} title="Transformar em conteúdo" className="p-1.5 rounded-lg hover:bg-purple-500/10 text-purple-400 transition-colors touch-manipulation">
                    <ArrowRight size={14} />
                  </button>
                  <button onClick={() => deleteIdeia(ideia.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-colors touch-manipulation">
                    <Trash size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pipeline Kanban — Desktop: columns, Mobile: grouped list */}
      <div className="hidden md:flex gap-3 overflow-x-auto pb-4">
        {statusOrder.map((status) => {
          const items = conteudos.filter((c) => c.status === status)
          const cfg = statusLabels[status]
          return (
            <div key={status} className="flex-shrink-0 w-56 bg-[#111111] rounded-2xl p-3 space-y-2">
              <div className="flex items-center justify-between px-1 pb-1">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: cfg.cor, boxShadow: `0 0 6px ${cfg.cor}` }} />
                  <span className="text-xs font-bold text-white">{cfg.emoji} {cfg.label}</span>
                </div>
                {items.length > 0 && (
                  <span className="text-[10px] text-gray-500 bg-white/5 px-1.5 py-0.5 rounded-full">{items.length}</span>
                )}
              </div>
              <div className="space-y-2 min-h-[80px]">
                {items.map((c) => (
                  <CardConteudo
                    key={c.id}
                    conteudo={c}
                    corStatus={cfg.cor}
                    onClick={() => onAbrirConteudo(c)}
                    onMove={(novoStatus) => moveConteudo(c.id, novoStatus)}
                    onDelete={() => deleteConteudo(c.id)}
                  />
                ))}
                {items.length === 0 && (
                  <div className="py-4 text-center text-[10px] text-gray-600 border border-dashed border-white/5 rounded-xl">
                    Nenhum
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Mobile: vertical list grouped by status */}
      <div className="md:hidden space-y-4">
        {statusOrder.map((status) => {
          const items = conteudos.filter((c) => c.status === status)
          if (items.length === 0) return null
          const cfg = statusLabels[status]
          return (
            <div key={status}>
              <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2 px-1">
                {cfg.emoji} {cfg.label} ({items.length})
              </h3>
              <div className="space-y-2">
                {items.map((c) => (
                  <CardConteudo
                    key={c.id}
                    conteudo={c}
                    corStatus={cfg.cor}
                    onClick={() => onAbrirConteudo(c)}
                    onMove={(novoStatus) => moveConteudo(c.id, novoStatus)}
                    onDelete={() => deleteConteudo(c.id)}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ==================== CARD CONTEUDO CLICÁVEL ====================

function CardConteudo({
  conteudo, corStatus, onClick, onMove, onDelete,
}: {
  conteudo: Conteudo
  corStatus: string
  onClick: () => void
  onMove: (status: StatusConteudo) => void
  onDelete: () => void
}) {
  const [menuAberto, setMenuAberto] = useState(false)
  const p = plataformaConfig[conteudo.plataforma]

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-[#0A0A0A] border border-white/5 rounded-xl p-3 cursor-pointer
                 hover:border-purple-500/30 transition-all relative group"
      onClick={onClick}
    >
      {/* Barra de cor */}
      <div className="absolute left-0 top-0 bottom-0 w-0.5 rounded-l-xl" style={{ background: corStatus }} />

      <div className="pl-2">
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className="text-sm">{plataformaEmoji[conteudo.plataforma] ?? '📱'}</span>
          <span className="text-[10px] text-gray-500 capitalize truncate flex-1">
            {p.label}
          </span>
          <span className="text-sm">{categoriaEmoji[conteudo.categoria] ?? ''}</span>
        </div>

        <p className="text-white text-sm font-medium line-clamp-2 mb-1">{conteudo.titulo}</p>

        {conteudo.roteiro && (
          <p className="text-gray-600 text-[10px] line-clamp-2 leading-relaxed mb-1.5">
            {conteudo.roteiro}
          </p>
        )}

        {conteudo.status === 'publicado' && conteudo.metricas && (
          <div className="flex gap-2 text-[10px] text-gray-400 mb-1.5">
            {conteudo.metricas.curtidas != null && <span className="flex items-center gap-0.5"><Heart size={10} />{formatNum(conteudo.metricas.curtidas)}</span>}
            {conteudo.metricas.comentarios != null && <span className="flex items-center gap-0.5"><ChatCircle size={10} />{formatNum(conteudo.metricas.comentarios)}</span>}
            {conteudo.metricas.alcance != null && <span className="flex items-center gap-0.5"><Eye size={10} />{formatNum(conteudo.metricas.alcance)}</span>}
          </div>
        )}

        <div className="flex items-center justify-between">
          {conteudo.dataPublicacao ? (
            <span className="text-[10px] text-gray-600">📅 {format(new Date(conteudo.dataPublicacao), 'dd/MM')}</span>
          ) : (
            <span className="text-[10px] text-gray-600">Sem data</span>
          )}
          <span className="text-[10px] text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">Ver →</span>
        </div>
      </div>

      {/* Menu ⋮ */}
      <div className="absolute top-2 right-2" onClick={(e) => e.stopPropagation()}>
        <div className="relative">
          <button
            onClick={() => setMenuAberto(!menuAberto)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-600
                       hover:text-white hover:bg-white/5 transition-all touch-manipulation"
          >
            <DotsThree size={16} weight="bold" />
          </button>

          <AnimatePresence>
            {menuAberto && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuAberto(false)} />
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute right-0 top-8 z-20 bg-[#1a1a1a] border border-white/10
                             rounded-xl overflow-hidden shadow-xl w-44"
                >
                  <div className="p-1">
                    <p className="text-[10px] text-gray-500 px-3 py-1.5 font-medium">Mover para...</p>
                    {statusOrder.filter((s) => s !== conteudo.status).map((s) => (
                      <button
                        key={s}
                        onClick={() => { onMove(s); setMenuAberto(false) }}
                        className="w-full text-left px-3 py-2 text-xs text-gray-400
                                   hover:text-white hover:bg-white/5 transition-all rounded-lg touch-manipulation"
                      >
                        {statusLabels[s].emoji} {statusLabels[s].label}
                      </button>
                    ))}
                    <div className="border-t border-white/5 mt-1 pt-1">
                      <button
                        onClick={() => { onDelete(); setMenuAberto(false) }}
                        className="w-full text-left px-3 py-2 text-xs text-red-400
                                   hover:bg-red-500/10 rounded-lg transition-all touch-manipulation"
                      >
                        🗑️ Excluir
                      </button>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}

// ==================== DRAWER VER/EDITAR CONTEÚDO ====================

function DrawerConteudo({ conteudo, onFechar }: { conteudo: Conteudo; onFechar: () => void }) {
  const { updateConteudo, deleteConteudo } = useSocialStore()
  const [editando, setEditando] = useState(false)
  const [form, setForm] = useState<Partial<Conteudo>>({})

  const set = (campo: string, valor: unknown) => setForm((f) => ({ ...f, [campo]: valor }))

  // Resetar form quando muda conteudo
  useState(() => { setForm({ ...conteudo }); setEditando(false) })

  const handleSalvar = () => {
    updateConteudo(conteudo.id, {
      titulo: form.titulo,
      plataforma: form.plataforma,
      categoria: form.categoria,
      status: form.status,
      roteiro: form.roteiro,
      legenda: form.legenda,
      hashtags: form.hashtags,
      dataPublicacao: form.dataPublicacao || undefined,
      linkPublicado: form.linkPublicado || undefined,
      metricas: form.metricas,
    })
    setEditando(false)
    onFechar()
  }

  const handleExcluir = () => {
    deleteConteudo(conteudo.id)
    onFechar()
  }

  return (
    <>
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={onFechar}
      />

      {/* Drawer */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed top-0 right-0 bottom-0 z-[60] flex flex-col
                   bg-[#0f0f0f] border-l border-white/5
                   w-full sm:w-[480px] max-w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={onFechar} className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-colors touch-manipulation">
              <X size={20} />
            </button>
            <div>
              <p className="text-[10px] text-gray-500">Conteúdo</p>
              <h2 className="font-bold text-white text-sm leading-tight max-w-[200px] truncate">{conteudo.titulo}</h2>
            </div>
          </div>

          <div className="flex gap-2">
            {editando ? (
              <>
                <button onClick={() => { setForm({ ...conteudo }); setEditando(false) }} className="px-3 py-2 rounded-xl border border-white/10 text-gray-400 text-sm touch-manipulation">Cancelar</button>
                <motion.button whileTap={{ scale: 0.95 }} onClick={handleSalvar} className="px-4 py-2 rounded-xl bg-purple-500 text-white font-bold text-sm touch-manipulation">Salvar</motion.button>
              </>
            ) : (
              <>
                <button onClick={() => { setForm({ ...conteudo }); setEditando(true) }} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/10 text-gray-400 text-sm hover:border-purple-500/40 hover:text-purple-400 transition-all touch-manipulation">
                  <Pencil size={16} /> Editar
                </button>
                <button onClick={handleExcluir} className="w-9 h-9 rounded-xl border border-white/10 flex items-center justify-center text-gray-400 hover:border-red-500/40 hover:text-red-400 transition-all touch-manipulation">
                  <Trash size={18} />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Scroll content */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
          {/* STATUS */}
          <DrawerSection label="Status">
            <div className="flex flex-wrap gap-2">
              {statusOrder.map((s) => {
                const cfg = statusLabels[s]
                const selected = (editando ? form.status : conteudo.status) === s
                return (
                  <button
                    key={s}
                    onClick={() => editando && set('status', s)}
                    className={`px-3 py-1.5 rounded-xl text-xs border transition-all ${editando ? 'touch-manipulation cursor-pointer' : 'cursor-default'} ${selected ? 'font-bold' : 'border-white/5 text-gray-500'}`}
                    style={selected ? { borderColor: cfg.cor + '60', background: cfg.cor + '15', color: cfg.cor } : {}}
                  >
                    {cfg.emoji} {cfg.label}
                  </button>
                )
              })}
            </div>
          </DrawerSection>

          {/* PLATAFORMA */}
          <DrawerSection label="Plataforma">
            <div className="flex flex-wrap gap-2">
              {(Object.keys(plataformaConfig) as PlataformaSocial[]).map((pid) => {
                const selected = (editando ? form.plataforma : conteudo.plataforma) === pid
                return (
                  <button
                    key={pid}
                    onClick={() => editando && set('plataforma', pid)}
                    className={`px-3 py-1.5 rounded-xl text-xs border transition-all ${editando ? 'touch-manipulation' : 'cursor-default'} ${selected ? 'border-purple-500/40 bg-purple-500/15 text-purple-400 font-bold' : 'border-white/5 text-gray-500'}`}
                  >
                    {plataformaEmoji[pid]} {plataformaConfig[pid].label}
                  </button>
                )
              })}
            </div>
          </DrawerSection>

          {/* TÍTULO */}
          <DrawerSection label="Título">
            {editando ? (
              <input value={form.titulo ?? ''} onChange={(e) => set('titulo', e.target.value)}
                className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-white outline-none focus:border-purple-500 transition-colors text-base" />
            ) : (
              <p className="text-white font-bold text-lg leading-tight">{conteudo.titulo}</p>
            )}
          </DrawerSection>

          {/* ROTEIRO */}
          <DrawerSection label="📋 Roteiro / Script">
            {editando ? (
              <textarea value={form.roteiro ?? ''} onChange={(e) => set('roteiro', e.target.value)}
                placeholder="Escreva o roteiro completo aqui..."
                rows={8}
                className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 outline-none resize-none focus:border-purple-500 transition-colors text-sm leading-relaxed" />
            ) : (
              <div className={`rounded-xl border p-4 ${conteudo.roteiro ? 'bg-white/[0.02] border-white/5' : 'border-dashed border-white/5'}`}>
                {conteudo.roteiro ? (
                  <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">{conteudo.roteiro}</p>
                ) : (
                  <p className="text-gray-600 text-sm text-center py-4">Nenhum roteiro escrito ainda. Clique em Editar para adicionar.</p>
                )}
              </div>
            )}
          </DrawerSection>

          {/* LEGENDA */}
          <DrawerSection label="✍️ Legenda">
            {editando ? (
              <textarea value={form.legenda ?? ''} onChange={(e) => set('legenda', e.target.value)}
                placeholder="Legenda completa com emojis e CTA..."
                rows={4}
                className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 outline-none resize-none focus:border-purple-500 transition-colors text-sm" />
            ) : (
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                {conteudo.legenda ? (
                  <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">{conteudo.legenda}</p>
                ) : (
                  <p className="text-gray-600 text-sm">Sem legenda definida</p>
                )}
              </div>
            )}
          </DrawerSection>

          {/* HASHTAGS */}
          <DrawerSection label="# Hashtags">
            {editando ? (
              <input value={Array.isArray(form.hashtags) ? form.hashtags.join(' ') : ''}
                onChange={(e) => set('hashtags', e.target.value.split(' ').filter(Boolean))}
                placeholder="#fitness #consultoria..."
                className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-white outline-none focus:border-purple-500 transition-colors text-sm" />
            ) : (
              <p className="text-purple-400 text-sm">
                {conteudo.hashtags?.join(' ') || <span className="text-gray-600">Sem hashtags</span>}
              </p>
            )}
          </DrawerSection>

          {/* DATA */}
          <DrawerSection label="📅 Data de publicação">
            {editando ? (
              <input type="date" value={form.dataPublicacao ?? ''} onChange={(e) => set('dataPublicacao', e.target.value)}
                className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-white outline-none focus:border-purple-500 transition-colors" />
            ) : (
              <p className="text-white text-sm">
                {conteudo.dataPublicacao ? format(new Date(conteudo.dataPublicacao), "dd/MM/yyyy") : <span className="text-gray-600">Não agendado</span>}
              </p>
            )}
          </DrawerSection>

          {/* LINK PUBLICADO */}
          <DrawerSection label="🔗 Link do post">
            {editando ? (
              <input type="url" value={form.linkPublicado ?? ''} onChange={(e) => set('linkPublicado', e.target.value)}
                placeholder="https://instagram.com/p/..."
                className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 outline-none focus:border-purple-500 transition-colors text-sm" />
            ) : conteudo.linkPublicado ? (
              <a href={conteudo.linkPublicado} target="_blank" rel="noopener noreferrer" className="text-purple-400 text-sm hover:text-purple-300 transition-colors flex items-center gap-1.5 touch-manipulation">
                <ArrowRight size={14} /> Ver post publicado
              </a>
            ) : (
              <p className="text-gray-600 text-sm">Ainda não publicado</p>
            )}
          </DrawerSection>

          {/* MÉTRICAS (quando publicado) */}
          {(conteudo.status === 'publicado' || editando) && (
            <DrawerSection label="📊 Métricas">
              <div className="grid grid-cols-3 gap-2">
                {[
                  { campo: 'alcance', label: '👁️ Alcance' },
                  { campo: 'curtidas', label: '❤️ Curtidas' },
                  { campo: 'comentarios', label: '💬 Comentários' },
                  { campo: 'compartilhamentos', label: '↗️ Compartilh.' },
                  { campo: 'salvamentos', label: '🔖 Salvamentos' },
                  { campo: 'leadsGerados', label: '🎯 Leads' },
                ].map((m) => (
                  <div key={m.campo} className="bg-white/[0.02] rounded-xl p-3 text-center">
                    <p className="text-lg font-bold text-white">
                      {(conteudo.metricas as Record<string, number> | undefined)?.[m.campo] ?? 0}
                    </p>
                    <p className="text-[10px] text-gray-500 leading-tight">{m.label}</p>
                    {editando && (
                      <input type="number"
                        value={(form.metricas as Record<string, number> | undefined)?.[m.campo] ?? ''}
                        onChange={(e) => set('metricas', { ...(form.metricas ?? {}), [m.campo]: Number(e.target.value) || 0 })}
                        className="w-full mt-1 bg-white/5 border border-white/5 rounded-lg px-2 py-1 text-white text-center text-xs outline-none focus:border-purple-500" />
                    )}
                  </div>
                ))}
              </div>
            </DrawerSection>
          )}
        </div>
      </motion.div>
    </>
  )
}

function DrawerSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">{label}</label>
      {children}
    </div>
  )
}

// ==================== CALENDARIO VIEW ====================

function CalendarioView({ conteudos }: { conteudos: Conteudo[] }) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const days = useMemo(() => {
    const start = startOfMonth(currentMonth)
    const end = endOfMonth(currentMonth)
    return eachDayOfInterval({ start, end })
  }, [currentMonth])

  const startDayOfWeek = getDay(days[0])
  const empties = Array.from({ length: startDayOfWeek }, (_, i) => i)

  const getConteudosForDay = (day: Date) => {
    const dateStr = format(day, 'yyyy-MM-dd')
    return conteudos.filter((c) => c.dataPublicacao?.startsWith(dateStr))
  }

  if (conteudos.length === 0) {
    return <EmptyState icon={CalendarBlank} titulo="Calendário vazio" descricao="Crie conteúdos e agende datas de publicação para visualizar aqui" />
  }

  return (
    <div className="bg-[#111111] border border-white/5 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} className="text-gray-400 hover:text-white p-2 touch-manipulation">←</button>
        <h3 className="text-white font-semibold capitalize">{format(currentMonth, 'MMMM yyyy', { locale: ptBR })}</h3>
        <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} className="text-gray-400 hover:text-white p-2 touch-manipulation">→</button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((d) => (
          <div key={d} className="text-[10px] text-gray-600 font-medium py-1">{d}</div>
        ))}
        {empties.map((i) => <div key={`e${i}`} />)}
        {days.map((day) => {
          const dayConteudos = getConteudosForDay(day)
          const today = isToday(day)
          return (
            <div key={day.toISOString()} className={`aspect-square rounded-lg p-1 text-xs flex flex-col items-center ${today ? 'bg-purple-500/10 border border-purple-500/30' : 'hover:bg-white/5'} ${!isSameMonth(day, currentMonth) ? 'opacity-30' : ''}`}>
              <span className={`${today ? 'text-purple-400 font-bold' : 'text-gray-400'}`}>{format(day, 'd')}</span>
              {dayConteudos.length > 0 && (
                <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center">
                  {dayConteudos.slice(0, 3).map((c) => {
                    const p = plataformaConfig[c.plataforma]
                    return <div key={c.id} className={`w-1.5 h-1.5 rounded-full ${p.color.replace('text-', 'bg-')}`} />
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-white/5">
        {Object.entries(plataformaConfig).map(([key, val]) => (
          <span key={key} className="flex items-center gap-1 text-[10px] text-gray-500">
            <div className={`w-2 h-2 rounded-full ${val.color.replace('text-', 'bg-')}`} />
            {val.label}
          </span>
        ))}
      </div>
    </div>
  )
}

// ==================== METRICAS VIEW ====================

function MetricasView({ conteudos }: { conteudos: Conteudo[] }) {
  const publicados = conteudos.filter((c) => c.status === 'publicado')

  if (publicados.length === 0) {
    return <EmptyState icon={ChartBar} titulo="Sem métricas ainda" descricao="Publique conteúdos e adicione métricas para visualizar os resultados" />
  }

  const totalAlcance = publicados.reduce((acc, c) => acc + (c.metricas?.alcance ?? 0), 0)
  const totalCurtidas = publicados.reduce((acc, c) => acc + (c.metricas?.curtidas ?? 0), 0)
  const totalLeads = publicados.reduce((acc, c) => acc + (c.metricas?.leadsGerados ?? 0), 0)

  const melhorPost = publicados.sort((a, b) => (b.metricas?.alcance ?? 0) - (a.metricas?.alcance ?? 0))[0]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Posts', value: publicados.length, icon: Megaphone },
          { label: 'Alcance', value: formatNum(totalAlcance), icon: Eye },
          { label: 'Curtidas', value: formatNum(totalCurtidas), icon: Heart },
          { label: 'Leads', value: totalLeads, icon: Funnel },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-[#111111] border border-white/5 rounded-xl p-4 text-center">
            <kpi.icon size={20} className="text-purple-400 mx-auto mb-2" />
            <p className="text-2xl font-display text-white">{kpi.value}</p>
            <p className="text-[10px] text-gray-500">{kpi.label}</p>
          </div>
        ))}
      </div>

      {melhorPost && (
        <div className="bg-[#111111] border border-purple-500/10 rounded-2xl p-4">
          <h3 className="text-xs text-gray-500 uppercase mb-2">Melhor Post</h3>
          <p className="text-white font-semibold">{melhorPost.titulo}</p>
          <div className="flex gap-3 mt-2 text-xs text-gray-400">
            <span>{formatNum(melhorPost.metricas?.alcance ?? 0)} alcance</span>
            <span>{melhorPost.metricas?.curtidas ?? 0} curtidas</span>
            <span>{melhorPost.metricas?.leadsGerados ?? 0} leads</span>
          </div>
        </div>
      )}

      <div className="bg-[#111111] border border-white/5 rounded-2xl p-4">
        <h3 className="text-white font-semibold mb-3">Top Posts por Alcance</h3>
        <div className="space-y-2">
          {publicados.slice(0, 5).map((c, i) => {
            const p = plataformaConfig[c.plataforma]
            return (
              <div key={c.id} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                <span className="text-xs text-gray-600 w-5">{i + 1}.</span>
                <p.icon size={14} className={p.color} />
                <span className="text-sm text-white flex-1 truncate">{c.titulo}</span>
                <span className="text-xs text-gray-400">{formatNum(c.metricas?.alcance ?? 0)}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ==================== CONTEUDO MODAL ====================

function ConteudoModal({ onClose }: { onClose: () => void }) {
  const { addConteudo } = useSocialStore()
  const [titulo, setTitulo] = useState('')
  const [plataforma, setPlataforma] = useState<PlataformaSocial>('instagram_feed')
  const [categoria, setCategoria] = useState<CategoriaConteudo>('dica_treino')
  const [roteiro, setRoteiro] = useState('')
  const [legenda, setLegenda] = useState('')
  const [dataPublicacao, setDataPublicacao] = useState('')

  const handleSave = () => {
    if (!titulo.trim()) return
    addConteudo({
      titulo,
      plataforma,
      categoria,
      status: 'ideia',
      roteiro: roteiro || undefined,
      legenda: legenda || undefined,
      dataPublicacao: dataPublicacao || undefined,
    })
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-0 md:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        exit={{ y: 100 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-[#111111] border border-white/5 rounded-t-3xl md:rounded-2xl w-full md:max-w-lg max-h-[90vh] overflow-y-auto p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-display text-xl tracking-wider">NOVO CONTEÚDO</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 text-gray-400 touch-manipulation"><X size={20} /></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Título</label>
            <input value={titulo} onChange={(e) => setTitulo(e.target.value)} className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl px-4 py-3 text-white outline-none focus:border-purple-500 transition-colors" placeholder="Ex: Dica de treino para pernas" />
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-2 block">Plataforma</label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.entries(plataformaConfig) as [PlataformaSocial, typeof plataformaConfig[PlataformaSocial]][]).map(([key, val]) => (
                <button key={key} onClick={() => setPlataforma(key)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition-all touch-manipulation ${plataforma === key ? 'border-purple-500/50 bg-purple-500/10 text-white' : 'border-white/5 text-gray-400 hover:border-white/10'}`}>
                  <val.icon size={14} className={val.color} />
                  {val.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-2 block">Categoria</label>
            <div className="flex flex-wrap gap-2">
              {(Object.entries(categoriaLabels) as [CategoriaConteudo, string][]).map(([key, label]) => (
                <button key={key} onClick={() => setCategoria(key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all touch-manipulation ${categoria === key ? 'bg-purple-500 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Roteiro / Script</label>
            <textarea value={roteiro} onChange={(e) => setRoteiro(e.target.value)} rows={3} className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl px-4 py-3 text-white resize-none outline-none focus:border-purple-500 transition-colors" placeholder="Descreva o roteiro..." />
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Legenda</label>
            <textarea value={legenda} onChange={(e) => setLegenda(e.target.value)} rows={2} className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl px-4 py-3 text-white resize-none outline-none focus:border-purple-500 transition-colors" placeholder="Legenda para publicação..." />
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Data de publicação</label>
            <input type="date" value={dataPublicacao} onChange={(e) => setDataPublicacao(e.target.value)} className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl px-4 py-3 text-white outline-none focus:border-purple-500 transition-colors" />
          </div>

          <button onClick={handleSave} disabled={!titulo.trim()} className="w-full py-3 rounded-xl bg-purple-500 text-white font-bold text-sm shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all disabled:opacity-40 disabled:cursor-not-allowed touch-manipulation">
            Criar Conteúdo
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ==================== IDEIA MODAL ====================

function IdeiaModal({ onClose }: { onClose: () => void }) {
  const { addIdeia } = useSocialStore()
  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [categoria, setCategoria] = useState<CategoriaConteudo>('dica_treino')

  const handleSave = () => {
    if (!titulo.trim()) return
    addIdeia({ titulo, descricao: descricao || undefined, plataformas: ['instagram_feed'], categoria, prioridade: 'media' })
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-0 md:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        exit={{ y: 100 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-[#111111] border border-white/5 rounded-t-3xl md:rounded-2xl w-full md:max-w-md p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold">Nova Ideia</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 text-gray-400 touch-manipulation"><X size={20} /></button>
        </div>

        <div className="space-y-3">
          <input value={titulo} onChange={(e) => setTitulo(e.target.value)} className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl px-4 py-3 text-white outline-none focus:border-purple-500 transition-colors" placeholder="Título da ideia" />
          <textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} rows={2} className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl px-4 py-3 text-white resize-none outline-none focus:border-purple-500 transition-colors" placeholder="Descrição (opcional)" />
          <div className="flex flex-wrap gap-2">
            {(Object.entries(categoriaLabels) as [CategoriaConteudo, string][]).map(([key, label]) => (
              <button key={key} onClick={() => setCategoria(key)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all touch-manipulation ${categoria === key ? 'bg-purple-500 text-white' : 'bg-white/5 text-gray-400'}`}>
                {label}
              </button>
            ))}
          </div>
          <button onClick={handleSave} disabled={!titulo.trim()} className="w-full py-3 rounded-xl bg-purple-500 text-white font-bold text-sm shadow-[0_0_15px_rgba(168,85,247,0.4)] disabled:opacity-40 touch-manipulation">Salvar Ideia</button>
        </div>
      </motion.div>
    </motion.div>
  )
}
