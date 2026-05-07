import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  DotsThree,
  Trash,
  WhatsappLogo,
  InstagramLogo,
  Warning,
  CaretDown,
  Users,
  X,
} from '@phosphor-icons/react'
import { isPast, format } from 'date-fns'
import { supabase } from '../../lib/supabase'
import { deletarComDesfazer } from '../../lib/deletarComDesfazer'
import BottomSheet from '../ui/BottomSheet'
import EmptyState from '../ui/EmptyState'
import type { LeadCRM } from '../../pages/CRM'

// ==================== ETAPAS ====================

const ETAPAS = [
  { id: 'novo', label: 'Novo', emoji: '🆕', cor: '#666' },
  { id: 'abordado', label: 'Abordado', emoji: '💬', cor: '#3B82F6' },
  { id: 'respondeu', label: 'Respondeu', emoji: '✉️', cor: '#8B5CF6' },
  { id: 'call_marcada', label: 'Call marcada', emoji: '📅', cor: '#F59E0B' },
  { id: 'call_realizada', label: 'Call realizada', emoji: '📞', cor: '#06B6D4' },
  { id: 'proposta_enviada', label: 'Proposta enviada', emoji: '📋', cor: '#A855F7' },
  { id: 'convertido', label: 'Convertido', emoji: '✅', cor: '#00E620' },
  { id: 'perdido', label: 'Perdido', emoji: '❌', cor: '#FF4444' },
  { id: 'nurturing', label: 'Nurturing', emoji: '🌱', cor: '#F97316' },
] as const

interface Props {
  leads: LeadCRM[]
  onAtualizar: () => void
}

// ==================== PIPELINE ====================

export default function PipelineCRM({ leads, onAtualizar }: Props) {
  const [leadSelecionado, setLeadSelecionado] = useState<LeadCRM | null>(null)
  const [modalNovoLead, setModalNovoLead] = useState(false)
  const [filtroStatus, setFiltroStatus] = useState('todos')

  const leadsFiltrados =
    filtroStatus === 'todos' ? leads : leads.filter((l) => l.status === filtroStatus)

  const leadsAtivos = leadsFiltrados.filter(
    (l) => !['convertido', 'perdido'].includes(l.status)
  )

  const moverLead = async (leadId: string, novoStatus: string) => {
    await supabase
      .from('captacoes')
      .update({
        status: novoStatus,
        data_conversao: novoStatus === 'convertido' ? new Date().toISOString().split('T')[0] : null,
      })
      .eq('id', leadId)
    onAtualizar()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        {/* Filtros */}
        <div className="flex gap-2 overflow-x-auto scrollbar-none flex-1 -mx-1 px-1">
          <button
            onClick={() => setFiltroStatus('todos')}
            className={`px-3 py-1.5 rounded-xl text-xs border transition-all
                        touch-manipulation whitespace-nowrap ${
                          filtroStatus === 'todos'
                            ? 'border-[#00E620] bg-[#00E620]/10 text-[#00E620] font-bold'
                            : 'border-white/10 text-gray-400'
                        }`}
          >
            Todos ({leads.filter((l) => !['convertido', 'perdido'].includes(l.status)).length})
          </button>
          {ETAPAS.slice(0, -3).map((e) => {
            const count = leads.filter((l) => l.status === e.id).length
            if (count === 0) return null
            return (
              <button
                key={e.id}
                onClick={() => setFiltroStatus(filtroStatus === e.id ? 'todos' : e.id)}
                className={`px-3 py-1.5 rounded-xl text-xs border transition-all
                            touch-manipulation whitespace-nowrap ${
                              filtroStatus === e.id ? 'font-bold' : 'border-white/10 text-gray-400'
                            }`}
                style={
                  filtroStatus === e.id
                    ? { borderColor: e.cor + '50', background: e.cor + '15', color: e.cor }
                    : {}
                }
              >
                {e.emoji} {e.label} ({count})
              </button>
            )
          })}
        </div>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setModalNovoLead(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#00E620]
                     text-black font-bold text-sm flex-shrink-0 touch-manipulation
                     shadow-[0_0_12px_rgba(0,230,32,0.3)]"
        >
          <Plus size={18} weight="bold" />
          Novo Lead
        </motion.button>
      </div>

      {/* Lista de leads */}
      {leadsAtivos.length === 0 ? (
        <EmptyState
          icon={Users}
          titulo="Nenhum lead nesta etapa"
          descricao="Adicione leads para acompanhar no pipeline."
          acaoLabel="Adicionar lead"
          onAcao={() => setModalNovoLead(true)}
        />
      ) : (
        <div className="space-y-3">
          {leadsAtivos.map((lead) => (
            <CardLeadCRM
              key={lead.id}
              lead={lead}
              onClick={() => setLeadSelecionado(lead)}
              onMover={(status) => moverLead(lead.id, status)}
              onExcluir={() => {
                deletarComDesfazer(
                  lead.id,
                  'captacoes',
                  lead,
                  onAtualizar,
                  `Lead "${lead.nome}" excluído`
                )
              }}
            />
          ))}
        </div>
      )}

      {/* Seção convertidos e perdidos */}
      <ConvertidosEPerdidos leads={leads} />

      {/* Drawer do lead */}
      {leadSelecionado && (
        <DrawerLead
          lead={leadSelecionado}
          onFechar={() => setLeadSelecionado(null)}
          onAtualizar={() => {
            setLeadSelecionado(null)
            onAtualizar()
          }}
        />
      )}

      {/* Modal novo lead */}
      <ModalNovoLead
        aberto={modalNovoLead}
        onFechar={() => setModalNovoLead(false)}
        onSalvo={() => {
          setModalNovoLead(false)
          onAtualizar()
        }}
      />
    </div>
  )
}

// ==================== CARD LEAD ====================

function CardLeadCRM({
  lead,
  onClick,
  onMover,
  onExcluir,
}: {
  lead: LeadCRM
  onClick: () => void
  onMover: (status: string) => void
  onExcluir: () => void
}) {
  const etapa = ETAPAS.find((e) => e.id === lead.status)
  const [menuAberto, setMenuAberto] = useState(false)

  const followupAtrasado =
    lead.data_followup &&
    isPast(new Date(lead.data_followup)) &&
    !['convertido', 'perdido'].includes(lead.status)

  return (
    <motion.div
      whileHover={{ y: -1 }}
      className={`bg-[#161616] rounded-2xl border overflow-hidden cursor-pointer transition-all ${
        followupAtrasado ? 'border-yellow-500/30' : 'border-white/5 hover:border-[#00E620]/30'
      }`}
      onClick={onClick}
    >
      {/* Barra de status */}
      <div className="h-1" style={{ background: etapa?.cor ?? '#666' }} />

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Avatar */}
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center
                          font-bold text-black text-sm flex-shrink-0"
              style={{
                background: `linear-gradient(135deg, ${etapa?.cor ?? '#666'}, ${etapa?.cor ?? '#666'}88)`,
              }}
            >
              {lead.nome?.charAt(0).toUpperCase() ?? '?'}
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-bold text-white">{lead.nome ?? 'Sem nome'}</p>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{
                    background: (etapa?.cor ?? '#666') + '20',
                    color: etapa?.cor ?? '#666',
                  }}
                >
                  {etapa?.emoji} {etapa?.label}
                </span>
                {lead.origem && (
                  <span className="text-xs text-gray-600 capitalize">{lead.origem}</span>
                )}
                {lead.temperatura && (
                  <span
                    className={`text-xs ${
                      lead.temperatura === 'quente'
                        ? 'text-red-400'
                        : lead.temperatura === 'morno'
                          ? 'text-yellow-400'
                          : 'text-blue-400'
                    }`}
                  >
                    {lead.temperatura === 'quente'
                      ? '🔥'
                      : lead.temperatura === 'morno'
                        ? '🌡️'
                        : '🧊'}{' '}
                    {lead.temperatura}
                  </span>
                )}
              </div>
              {followupAtrasado && (
                <p className="text-xs text-yellow-400 mt-1 flex items-center gap-1">
                  <Warning size={12} weight="fill" />
                  Follow-up atrasado
                </p>
              )}
            </div>
          </div>

          {/* Menu */}
          <div onClick={(e) => e.stopPropagation()} className="relative flex-shrink-0">
            <button
              onClick={() => setMenuAberto(!menuAberto)}
              className="w-8 h-8 rounded-lg flex items-center justify-center
                         text-gray-500 hover:text-white hover:bg-white/5
                         transition-all touch-manipulation"
            >
              <DotsThree size={18} weight="bold" />
            </button>

            <AnimatePresence>
              {menuAberto && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuAberto(false)} />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="absolute right-0 top-9 z-20 bg-[#1a1a1a]
                               border border-white/10 rounded-xl overflow-hidden
                               shadow-xl w-48"
                  >
                    <div className="p-1">
                      <p className="text-xs text-gray-600 px-3 py-1.5 font-medium">Mover para...</p>
                      {ETAPAS.filter((e) => e.id !== lead.status).map((e) => (
                        <button
                          key={e.id}
                          onClick={() => {
                            onMover(e.id)
                            setMenuAberto(false)
                          }}
                          className="w-full text-left px-3 py-2 text-xs
                                     text-gray-400 hover:text-white hover:bg-white/5
                                     rounded-lg transition-all touch-manipulation flex
                                     items-center gap-2"
                        >
                          <span>{e.emoji}</span>
                          {e.label}
                        </button>
                      ))}
                      <div className="border-t border-white/5 mt-1 pt-1">
                        {lead.telefone && (
                          <a
                            href={`https://wa.me/55${lead.telefone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full text-left px-3 py-2 text-xs text-[#00E620]
                                       hover:bg-[#00E620]/10 rounded-lg transition-all
                                       touch-manipulation flex items-center gap-2"
                            onClick={() => setMenuAberto(false)}
                          >
                            <WhatsappLogo size={14} />
                            Abrir WhatsApp
                          </a>
                        )}
                        <button
                          onClick={() => {
                            onExcluir()
                            setMenuAberto(false)
                          }}
                          className="w-full text-left px-3 py-2 text-xs text-red-400
                                     hover:bg-red-500/10 rounded-lg transition-all
                                     touch-manipulation flex items-center gap-2"
                        >
                          <Trash size={14} />
                          Excluir
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* WhatsApp + Instagram */}
        {(lead.telefone || lead.instagram) && (
          <div
            className="mt-3 pt-3 border-t border-white/5 flex gap-2 flex-wrap"
            onClick={(e) => e.stopPropagation()}
          >
            {lead.telefone && (
              <a
                href={`https://wa.me/55${lead.telefone.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl
                           bg-[#00E620]/10 border border-[#00E620]/20 text-[#00E620] text-xs
                           font-medium touch-manipulation hover:bg-[#00E620]/20 transition-all"
              >
                <WhatsappLogo size={14} weight="fill" />
                WhatsApp
              </a>
            )}
            {lead.instagram && (
              <span
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl
                           bg-white/5 border border-white/5 text-gray-400 text-xs"
              >
                <InstagramLogo size={14} />
                {lead.instagram}
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ==================== CONVERTIDOS E PERDIDOS ====================

function ConvertidosEPerdidos({ leads }: { leads: LeadCRM[] }) {
  const [expandido, setExpandido] = useState(false)

  const convertidos = leads.filter((l) => l.status === 'convertido')
  const perdidos = leads.filter((l) => l.status === 'perdido')

  if (convertidos.length === 0 && perdidos.length === 0) return null

  return (
    <div className="space-y-3">
      <button
        onClick={() => setExpandido(!expandido)}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300
                   transition-all touch-manipulation"
      >
        <motion.div animate={{ rotate: expandido ? 180 : 0 }}>
          <CaretDown size={16} />
        </motion.div>
        Convertidos ({convertidos.length}) e Perdidos ({perdidos.length})
      </button>

      <AnimatePresence>
        {expandido && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden space-y-2"
          >
            {convertidos.map((lead) => (
              <div
                key={lead.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-[#00E620]/5
                           border border-[#00E620]/10"
              >
                <span>✅</span>
                <span className="text-sm text-white flex-1">{lead.nome}</span>
                {lead.valor_fechado && (
                  <span className="text-sm font-bold text-[#00E620]">
                    R${lead.valor_fechado.toLocaleString('pt-BR')}
                  </span>
                )}
              </div>
            ))}
            {perdidos.map((lead) => (
              <div
                key={lead.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-red-500/5
                           border border-red-500/10"
              >
                <span>❌</span>
                <span className="text-sm text-gray-400 flex-1">{lead.nome}</span>
                {lead.motivo_perda && (
                  <span className="text-xs text-red-400">{lead.motivo_perda}</span>
                )}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ==================== DRAWER LEAD ====================

function DrawerLead({
  lead,
  onFechar,
  onAtualizar,
}: {
  lead: LeadCRM
  onFechar: () => void
  onAtualizar: () => void
}) {
  const etapa = ETAPAS.find((e) => e.id === lead.status)
  const [editando, setEditando] = useState(false)
  const [form, setForm] = useState({
    nome: lead.nome ?? '',
    telefone: lead.telefone ?? '',
    instagram: lead.instagram ?? '',
    email: lead.email ?? '',
    origem: lead.origem ?? 'instagram',
    temperatura: lead.temperatura ?? 'frio',
    observacoes: lead.observacoes ?? '',
    valor_fechado: String(lead.valor_fechado ?? ''),
    motivo_perda: lead.motivo_perda ?? '',
    data_followup: lead.data_followup ?? '',
  })
  const [interacoes, setInteracoes] = useState<any[]>([])
  const [novaInteracao, setNovaInteracao] = useState({ tipo: 'nota', descricao: '' })

  // Carregar interacoes
  useState(() => {
    supabase
      .from('interacoes_crm')
      .select('*')
      .eq('lead_id', lead.id)
      .order('criado_em', { ascending: false })
      .then(({ data }) => setInteracoes(data ?? []))
  })

  const salvar = async () => {
    await supabase
      .from('captacoes')
      .update({
        nome: form.nome,
        telefone: form.telefone,
        instagram: form.instagram,
        email: form.email,
        origem: form.origem,
        temperatura: form.temperatura,
        observacoes: form.observacoes,
        valor_fechado: form.valor_fechado ? Number(form.valor_fechado) : null,
        motivo_perda: form.motivo_perda || null,
        data_followup: form.data_followup || null,
      })
      .eq('id', lead.id)
    setEditando(false)
    onAtualizar()
  }

  const adicionarInteracao = async () => {
    if (!novaInteracao.descricao.trim()) return
    await supabase.from('interacoes_crm').insert({
      lead_id: lead.id,
      tipo: novaInteracao.tipo,
      descricao: novaInteracao.descricao,
    })
    setNovaInteracao({ tipo: 'nota', descricao: '' })
    // Recarregar
    const { data } = await supabase
      .from('interacoes_crm')
      .select('*')
      .eq('lead_id', lead.id)
      .order('criado_em', { ascending: false })
    setInteracoes(data ?? [])
  }

  const inputClass =
    'w-full bg-[#111] border border-white/5 rounded-xl px-4 py-3 text-white outline-none focus:border-[#00E620] transition-colors text-sm'

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
        onClick={onFechar}
      />
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[420px]
                   bg-[#0f0f0f] border-l border-white/5 overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#0f0f0f] border-b border-white/5 px-5 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center
                            font-bold text-black text-sm"
                style={{
                  background: `linear-gradient(135deg, ${etapa?.cor ?? '#666'}, ${etapa?.cor ?? '#666'}88)`,
                }}
              >
                {lead.nome?.charAt(0).toUpperCase() ?? '?'}
              </div>
              <div>
                <p className="font-bold text-white">{lead.nome ?? 'Sem nome'}</p>
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{
                    background: (etapa?.cor ?? '#666') + '20',
                    color: etapa?.cor ?? '#666',
                  }}
                >
                  {etapa?.emoji} {etapa?.label}
                </span>
              </div>
            </div>
            <button
              onClick={onFechar}
              className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center
                         text-gray-400 hover:text-white transition-colors touch-manipulation"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* Mover status */}
          <div className="space-y-2">
            <p className="text-xs text-gray-500 font-medium">Mover para</p>
            <div className="flex flex-wrap gap-1.5">
              {ETAPAS.map((e) => (
                <button
                  key={e.id}
                  onClick={async () => {
                    await supabase
                      .from('captacoes')
                      .update({
                        status: e.id,
                        data_conversao:
                          e.id === 'convertido' ? new Date().toISOString().split('T')[0] : null,
                      })
                      .eq('id', lead.id)
                    onAtualizar()
                  }}
                  disabled={e.id === lead.status}
                  className={`px-2.5 py-1.5 rounded-lg text-xs transition-all touch-manipulation ${
                    e.id === lead.status
                      ? 'font-bold opacity-100'
                      : 'opacity-60 hover:opacity-100'
                  }`}
                  style={{
                    background: e.id === lead.status ? e.cor + '25' : 'transparent',
                    color: e.cor,
                    border: `1px solid ${e.id === lead.status ? e.cor + '40' : 'transparent'}`,
                  }}
                >
                  {e.emoji} {e.label}
                </button>
              ))}
            </div>
          </div>

          {/* Campos editaveis */}
          {editando ? (
            <div className="space-y-3">
              <input
                value={form.nome}
                onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                placeholder="Nome"
                className={inputClass}
              />
              <input
                value={form.telefone}
                onChange={(e) => setForm((f) => ({ ...f, telefone: e.target.value }))}
                placeholder="Telefone"
                className={inputClass}
              />
              <input
                value={form.instagram}
                onChange={(e) => setForm((f) => ({ ...f, instagram: e.target.value }))}
                placeholder="Instagram"
                className={inputClass}
              />
              <input
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="Email"
                className={inputClass}
              />
              <select
                value={form.origem}
                onChange={(e) => setForm((f) => ({ ...f, origem: e.target.value }))}
                className={inputClass}
              >
                <option value="instagram">Instagram</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="indicacao">Indicação</option>
                <option value="trafego_pago">Tráfego Pago</option>
                <option value="outro">Outro</option>
              </select>
              <select
                value={form.temperatura}
                onChange={(e) => setForm((f) => ({ ...f, temperatura: e.target.value }))}
                className={inputClass}
              >
                <option value="frio">🧊 Frio</option>
                <option value="morno">🌡️ Morno</option>
                <option value="quente">🔥 Quente</option>
              </select>
              <div className="space-y-1">
                <label className="text-xs text-gray-500">Próximo follow-up</label>
                <input
                  type="date"
                  value={form.data_followup}
                  onChange={(e) => setForm((f) => ({ ...f, data_followup: e.target.value }))}
                  className={inputClass}
                />
              </div>
              <input
                value={form.valor_fechado}
                onChange={(e) => setForm((f) => ({ ...f, valor_fechado: e.target.value }))}
                placeholder="Valor fechado (R$)"
                type="number"
                className={inputClass}
              />
              <textarea
                value={form.observacoes}
                onChange={(e) => setForm((f) => ({ ...f, observacoes: e.target.value }))}
                placeholder="Observações"
                rows={3}
                className={`${inputClass} resize-none`}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setEditando(false)}
                  className="flex-1 py-2.5 rounded-xl border border-white/10
                             text-gray-400 text-sm touch-manipulation"
                >
                  Cancelar
                </button>
                <button
                  onClick={salvar}
                  className="flex-1 py-2.5 rounded-xl bg-[#00E620] text-black
                             font-bold text-sm touch-manipulation"
                >
                  Salvar
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <button
                onClick={() => setEditando(true)}
                className="w-full py-2 rounded-xl border border-white/10 text-gray-400
                           text-xs hover:text-white hover:border-white/20 transition-all
                           touch-manipulation"
              >
                Editar informações
              </button>

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Telefone', value: lead.telefone },
                  { label: 'Instagram', value: lead.instagram },
                  { label: 'Email', value: lead.email },
                  { label: 'Origem', value: lead.origem },
                  { label: 'Temperatura', value: lead.temperatura },
                  { label: 'Follow-up', value: lead.data_followup ? format(new Date(lead.data_followup), 'dd/MM/yyyy') : null },
                  { label: 'Valor', value: lead.valor_fechado ? `R$${lead.valor_fechado.toLocaleString('pt-BR')}` : null },
                ].filter((i) => i.value).map((item) => (
                  <div key={item.label} className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                    <p className="text-[10px] text-gray-600 uppercase tracking-wider">{item.label}</p>
                    <p className="text-sm text-white mt-0.5">{item.value}</p>
                  </div>
                ))}
              </div>

              {lead.observacoes && (
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                  <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Observações</p>
                  <p className="text-sm text-gray-300 whitespace-pre-wrap">{lead.observacoes}</p>
                </div>
              )}
            </div>
          )}

          {/* Interações */}
          <div className="space-y-3 pt-3 border-t border-white/5">
            <h4 className="text-sm font-bold text-white">Histórico de interações</h4>

            {/* Nova interacao */}
            <div className="space-y-2">
              <select
                value={novaInteracao.tipo}
                onChange={(e) => setNovaInteracao((n) => ({ ...n, tipo: e.target.value }))}
                className="w-full bg-[#111] border border-white/5 rounded-xl px-3 py-2
                           text-white text-xs outline-none focus:border-[#00E620]"
              >
                <option value="nota">📝 Nota</option>
                <option value="mensagem">💬 Mensagem</option>
                <option value="ligacao">📞 Ligação</option>
                <option value="email">📧 Email</option>
                <option value="call">🎥 Call</option>
                <option value="proposta">📋 Proposta</option>
              </select>
              <div className="flex gap-2">
                <input
                  value={novaInteracao.descricao}
                  onChange={(e) => setNovaInteracao((n) => ({ ...n, descricao: e.target.value }))}
                  placeholder="O que aconteceu?"
                  className="flex-1 bg-[#111] border border-white/5 rounded-xl px-3 py-2
                             text-white text-sm outline-none focus:border-[#00E620]"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') adicionarInteracao()
                  }}
                />
                <button
                  onClick={adicionarInteracao}
                  disabled={!novaInteracao.descricao.trim()}
                  className="px-4 py-2 rounded-xl bg-[#00E620] text-black font-bold text-xs
                             touch-manipulation disabled:opacity-30"
                >
                  +
                </button>
              </div>
            </div>

            {/* Lista */}
            {interacoes.length === 0 ? (
              <p className="text-xs text-gray-600 text-center py-4">Nenhuma interação registrada</p>
            ) : (
              <div className="space-y-2">
                {interacoes.map((i: any) => (
                  <div key={i.id} className="flex gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                    <span className="text-sm">
                      {i.tipo === 'mensagem'
                        ? '💬'
                        : i.tipo === 'ligacao'
                          ? '📞'
                          : i.tipo === 'email'
                            ? '📧'
                            : i.tipo === 'call'
                              ? '🎥'
                              : i.tipo === 'proposta'
                                ? '📋'
                                : '📝'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white">{i.descricao}</p>
                      <p className="text-[10px] text-gray-600 mt-1">
                        {format(new Date(i.criado_em), "dd/MM 'às' HH:mm")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </>
  )
}

// ==================== MODAL NOVO LEAD ====================

function ModalNovoLead({
  aberto,
  onFechar,
  onSalvo,
}: {
  aberto: boolean
  onFechar: () => void
  onSalvo: () => void
}) {
  const [form, setForm] = useState({
    nome: '',
    telefone: '',
    instagram: '',
    email: '',
    origem: 'instagram',
    temperatura: 'frio',
    observacoes: '',
  })
  const [salvando, setSalvando] = useState(false)

  const salvar = async () => {
    if (!form.nome.trim()) return
    setSalvando(true)
    await supabase.from('captacoes').insert({
      nome: form.nome,
      telefone: form.telefone || null,
      instagram: form.instagram || null,
      email: form.email || null,
      origem: form.origem,
      temperatura: form.temperatura,
      status: 'novo',
      observacoes: form.observacoes || null,
    })
    setForm({ nome: '', telefone: '', instagram: '', email: '', origem: 'instagram', temperatura: 'frio', observacoes: '' })
    setSalvando(false)
    onSalvo()
  }

  const inputClass =
    'w-full bg-[#111] border border-white/5 rounded-xl px-4 py-3 text-white outline-none focus:border-[#00E620] transition-colors text-base'

  return (
    <BottomSheet
      aberto={aberto}
      onFechar={onFechar}
      titulo="Novo Lead"
      botaoPrimario={{
        label: 'Salvar Lead',
        onClick: salvar,
        disabled: !form.nome.trim(),
        loading: salvando,
        loadingLabel: 'Salvando...',
      }}
    >
      <div className="space-y-3">
        <div className="space-y-1.5">
          <label className="text-sm text-gray-400 font-medium">Nome *</label>
          <input
            value={form.nome}
            onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
            placeholder="Nome do lead"
            className={inputClass}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm text-gray-400 font-medium">Telefone</label>
          <input
            value={form.telefone}
            onChange={(e) => setForm((f) => ({ ...f, telefone: e.target.value }))}
            placeholder="(11) 99999-9999"
            className={inputClass}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm text-gray-400 font-medium">Instagram</label>
          <input
            value={form.instagram}
            onChange={(e) => setForm((f) => ({ ...f, instagram: e.target.value }))}
            placeholder="@usuario"
            className={inputClass}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm text-gray-400 font-medium">Email</label>
          <input
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            placeholder="email@exemplo.com"
            className={inputClass}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-sm text-gray-400 font-medium">Origem</label>
            <select
              value={form.origem}
              onChange={(e) => setForm((f) => ({ ...f, origem: e.target.value }))}
              className={inputClass}
            >
              <option value="instagram">Instagram</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="indicacao">Indicação</option>
              <option value="trafego_pago">Tráfego Pago</option>
              <option value="outro">Outro</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm text-gray-400 font-medium">Temperatura</label>
            <select
              value={form.temperatura}
              onChange={(e) => setForm((f) => ({ ...f, temperatura: e.target.value }))}
              className={inputClass}
            >
              <option value="frio">🧊 Frio</option>
              <option value="morno">🌡️ Morno</option>
              <option value="quente">🔥 Quente</option>
            </select>
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm text-gray-400 font-medium">Observações</label>
          <textarea
            value={form.observacoes}
            onChange={(e) => setForm((f) => ({ ...f, observacoes: e.target.value }))}
            placeholder="Anotações sobre o lead..."
            rows={3}
            className={`${inputClass} resize-none`}
          />
        </div>
      </div>
    </BottomSheet>
  )
}
