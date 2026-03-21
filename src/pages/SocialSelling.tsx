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
} from '@phosphor-icons/react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameMonth, isToday } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useSocialStore } from '../store/socialStore'
import type { Conteudo, StatusConteudo, PlataformaSocial, CategoriaConteudo, IdeiaPauta } from '../types'
import EmptyState from '../components/ui/EmptyState'

// ==================== HELPERS ====================

const statusLabels: Record<StatusConteudo, { label: string; emoji: string }> = {
  ideia: { label: 'Ideia', emoji: '💡' },
  roteiro: { label: 'Roteiro', emoji: '📝' },
  gravado: { label: 'Gravado', emoji: '🎬' },
  editado: { label: 'Editado', emoji: '✂️' },
  agendado: { label: 'Agendado', emoji: '⏰' },
  publicado: { label: 'Publicado', emoji: '✅' },
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
  const { conteudos, ideias } = useSocialStore()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#00E620]/10 flex items-center justify-center">
            <Megaphone size={22} className="text-[#00E620]" />
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
                  view === tab.id ? 'bg-[#00E620] text-black' : 'text-gray-400 hover:text-white'
                }`}
              >
                <tab.icon size={14} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#00E620] text-black font-semibold text-sm hover:brightness-110 transition-all"
          >
            <Plus size={16} weight="bold" />
            <span className="hidden sm:inline">Conteúdo</span>
          </button>
        </div>
      </div>

      {/* Views */}
      {view === 'pipeline' && <PipelineView conteudos={conteudos} ideias={ideias} onAddIdeia={() => setShowIdeiaModal(true)} />}
      {view === 'calendario' && <CalendarioView conteudos={conteudos} />}
      {view === 'metricas' && <MetricasView conteudos={conteudos} />}

      {/* Modal Novo Conteúdo */}
      <AnimatePresence>
        {showModal && <ConteudoModal onClose={() => setShowModal(false)} />}
        {showIdeiaModal && <IdeiaModal onClose={() => setShowIdeiaModal(false)} />}
      </AnimatePresence>
    </div>
  )
}

// ==================== PIPELINE VIEW ====================

function PipelineView({ conteudos, ideias, onAddIdeia }: { conteudos: Conteudo[]; ideias: IdeiaPauta[]; onAddIdeia: () => void }) {
  const { moveConteudo, deleteConteudo, ideiaToConteudo, deleteIdeia } = useSocialStore()

  if (conteudos.length === 0 && ideias.length === 0) {
    return <EmptyState icon={Megaphone} titulo="Nenhum conteúdo criado" descricao="Comece criando seu primeiro conteúdo para as redes sociais" />
  }

  const nextStatus = (status: StatusConteudo): StatusConteudo | null => {
    const idx = statusOrder.indexOf(status)
    return idx < statusOrder.length - 1 ? statusOrder[idx + 1] : null
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
            <button onClick={onAddIdeia} className="text-xs text-[#00E620] hover:underline">+ Nova Ideia</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {ideias.map((ideia) => (
              <div key={ideia.id} className="bg-[#0A0A0A] border border-white/5 rounded-xl p-3 flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{ideia.titulo}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{categoriaLabels[ideia.categoria]}</p>
                </div>
                <div className="flex gap-1 ml-2 shrink-0">
                  <button
                    onClick={() => ideiaToConteudo(ideia.id)}
                    title="Transformar em conteúdo"
                    className="p-1.5 rounded-lg hover:bg-[#00E620]/10 text-[#00E620] transition-colors"
                  >
                    <ArrowRight size={14} />
                  </button>
                  <button
                    onClick={() => deleteIdeia(ideia.id)}
                    className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-colors"
                  >
                    <Trash size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pipeline - cards on mobile, columns on desktop */}
      <div className="hidden md:grid md:grid-cols-6 gap-3">
        {statusOrder.map((status) => {
          const items = conteudos.filter((c) => c.status === status)
          return (
            <div key={status} className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-semibold text-gray-400 uppercase">
                  {statusLabels[status].emoji} {statusLabels[status].label}
                </span>
                <span className="text-[10px] text-gray-600 bg-white/5 px-1.5 py-0.5 rounded-full">{items.length}</span>
              </div>
              <div className="space-y-2 min-h-[100px]">
                {items.map((c) => (
                  <ConteudoCard key={c.id} conteudo={c} onMove={nextStatus(status) ? () => moveConteudo(c.id, nextStatus(status)!) : undefined} onDelete={() => deleteConteudo(c.id)} />
                ))}
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
          return (
            <div key={status}>
              <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2 px-1">
                {statusLabels[status].emoji} {statusLabels[status].label} ({items.length})
              </h3>
              <div className="space-y-2">
                {items.map((c) => (
                  <ConteudoCard key={c.id} conteudo={c} onMove={nextStatus(status) ? () => moveConteudo(c.id, nextStatus(status)!) : undefined} onDelete={() => deleteConteudo(c.id)} />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ConteudoCard({ conteudo, onMove, onDelete }: { conteudo: Conteudo; onMove?: () => void; onDelete: () => void }) {
  const p = plataformaConfig[conteudo.plataforma]
  const PlatIcon = p.icon

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-[#111111] border border-white/5 rounded-xl p-3 hover:border-white/10 transition-colors"
    >
      <div className="flex items-start gap-2 mb-2">
        <PlatIcon size={16} className={p.color} />
        <span className="text-xs text-gray-500">{p.label}</span>
      </div>
      <p className="text-white text-sm font-medium line-clamp-2 mb-1">{conteudo.titulo}</p>
      <p className="text-[10px] text-gray-600 mb-2">{categoriaLabels[conteudo.categoria]}</p>

      {conteudo.status === 'publicado' && conteudo.metricas && (
        <div className="flex gap-2 text-[10px] text-gray-400 mb-2">
          {conteudo.metricas.curtidas != null && <span className="flex items-center gap-0.5"><Heart size={10} />{formatNum(conteudo.metricas.curtidas)}</span>}
          {conteudo.metricas.comentarios != null && <span className="flex items-center gap-0.5"><ChatCircle size={10} />{formatNum(conteudo.metricas.comentarios)}</span>}
          {conteudo.metricas.alcance != null && <span className="flex items-center gap-0.5"><Eye size={10} />{formatNum(conteudo.metricas.alcance)}</span>}
        </div>
      )}

      <div className="flex items-center justify-between">
        {onMove && (
          <button onClick={onMove} className="text-[10px] text-[#00E620] hover:underline flex items-center gap-0.5">
            Avançar <ArrowRight size={10} />
          </button>
        )}
        <button onClick={onDelete} className="text-[10px] text-gray-600 hover:text-red-400 ml-auto">
          <Trash size={12} />
        </button>
      </div>
    </motion.div>
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
        <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} className="text-gray-400 hover:text-white p-2">←</button>
        <h3 className="text-white font-semibold capitalize">{format(currentMonth, 'MMMM yyyy', { locale: ptBR })}</h3>
        <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} className="text-gray-400 hover:text-white p-2">→</button>
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
            <div
              key={day.toISOString()}
              className={`aspect-square rounded-lg p-1 text-xs flex flex-col items-center ${
                today ? 'bg-[#00E620]/10 border border-[#00E620]/30' : 'hover:bg-white/5'
              } ${!isSameMonth(day, currentMonth) ? 'opacity-30' : ''}`}
            >
              <span className={`${today ? 'text-[#00E620] font-bold' : 'text-gray-400'}`}>{format(day, 'd')}</span>
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

      {/* Legenda */}
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
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Posts', value: publicados.length, icon: Megaphone },
          { label: 'Alcance', value: formatNum(totalAlcance), icon: Eye },
          { label: 'Curtidas', value: formatNum(totalCurtidas), icon: Heart },
          { label: 'Leads', value: totalLeads, icon: Funnel },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-[#111111] border border-white/5 rounded-xl p-4 text-center">
            <kpi.icon size={20} className="text-[#00E620] mx-auto mb-2" />
            <p className="text-2xl font-display text-white">{kpi.value}</p>
            <p className="text-[10px] text-gray-500">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Melhor Post */}
      {melhorPost && (
        <div className="bg-[#111111] border border-[#00E620]/10 rounded-2xl p-4">
          <h3 className="text-xs text-gray-500 uppercase mb-2">Melhor Post</h3>
          <p className="text-white font-semibold">{melhorPost.titulo}</p>
          <div className="flex gap-3 mt-2 text-xs text-gray-400">
            <span>{formatNum(melhorPost.metricas?.alcance ?? 0)} alcance</span>
            <span>{melhorPost.metricas?.curtidas ?? 0} curtidas</span>
            <span>{melhorPost.metricas?.leadsGerados ?? 0} leads</span>
          </div>
        </div>
      )}

      {/* Top 5 Posts */}
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
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 text-gray-400"><X size={20} /></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Título</label>
            <input value={titulo} onChange={(e) => setTitulo(e.target.value)} className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl px-4 py-3 text-white" placeholder="Ex: Dica de treino para pernas" />
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-2 block">Plataforma</label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.entries(plataformaConfig) as [PlataformaSocial, typeof plataformaConfig[PlataformaSocial]][]).map(([key, val]) => (
                <button
                  key={key}
                  onClick={() => setPlataforma(key)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                    plataforma === key ? 'border-[#00E620]/50 bg-[#00E620]/10 text-white' : 'border-white/5 text-gray-400 hover:border-white/10'
                  }`}
                >
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
                <button
                  key={key}
                  onClick={() => setCategoria(key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    categoria === key ? 'bg-[#00E620] text-black' : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Roteiro / Script</label>
            <textarea value={roteiro} onChange={(e) => setRoteiro(e.target.value)} rows={3} className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl px-4 py-3 text-white resize-none" placeholder="Descreva o roteiro..." />
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Legenda</label>
            <textarea value={legenda} onChange={(e) => setLegenda(e.target.value)} rows={2} className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl px-4 py-3 text-white resize-none" placeholder="Legenda para publicação..." />
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Data de publicação</label>
            <input type="date" value={dataPublicacao} onChange={(e) => setDataPublicacao(e.target.value)} className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl px-4 py-3 text-white" />
          </div>

          <button
            onClick={handleSave}
            disabled={!titulo.trim()}
            className="w-full py-3 rounded-xl bg-[#00E620] text-black font-semibold text-sm hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
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
    addIdeia({
      titulo,
      descricao: descricao || undefined,
      plataformas: ['instagram_feed'],
      categoria,
      prioridade: 'media',
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
        className="bg-[#111111] border border-white/5 rounded-t-3xl md:rounded-2xl w-full md:max-w-md p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold">Nova Ideia</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 text-gray-400"><X size={20} /></button>
        </div>

        <div className="space-y-3">
          <input value={titulo} onChange={(e) => setTitulo(e.target.value)} className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl px-4 py-3 text-white" placeholder="Título da ideia" />
          <textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} rows={2} className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl px-4 py-3 text-white resize-none" placeholder="Descrição (opcional)" />
          <div className="flex flex-wrap gap-2">
            {(Object.entries(categoriaLabels) as [CategoriaConteudo, string][]).map(([key, label]) => (
              <button key={key} onClick={() => setCategoria(key)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${categoria === key ? 'bg-[#00E620] text-black' : 'bg-white/5 text-gray-400'}`}>
                {label}
              </button>
            ))}
          </div>
          <button onClick={handleSave} disabled={!titulo.trim()} className="w-full py-3 rounded-xl bg-[#00E620] text-black font-semibold text-sm hover:brightness-110 disabled:opacity-40">Salvar Ideia</button>
        </div>
      </motion.div>
    </motion.div>
  )
}
