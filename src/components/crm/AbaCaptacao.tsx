import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Plus,
  UserPlus,
  WhatsappLogo,
  Users,
  ClockCounterClockwise,
  Info,
  X,
  User,
  InstagramLogo,
  Phone,
  Envelope,
} from '@phosphor-icons/react'
import { format, subDays, addDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { supabase } from '../../lib/supabase'
import { deletarComDesfazer } from '../../lib/deletarComDesfazer'
import BottomSheet from '../ui/BottomSheet'
import type { LeadCRM, CaptacaoVolume } from '../../pages/CRM'

interface Props {
  leads: LeadCRM[]
  captacoesVolume: CaptacaoVolume[]
  onAtualizar: () => void
}

export default function AbaCaptacao({ leads, captacoesVolume, onAtualizar }: Props) {
  const [modalVolume, setModalVolume] = useState(false)
  const [modalLead, setModalLead] = useState(false)

  const hoje = format(new Date(), 'yyyy-MM-dd')
  const captacoesHoje = captacoesVolume
    .filter((c) => c.data === hoje)
    .reduce((acc, c) => acc + c.quantidade, 0)
  const leadsHoje = leads.filter(
    (l) => l.criado_em && format(new Date(l.criado_em), 'yyyy-MM-dd') === hoje
  ).length

  return (
    <div className="space-y-5">
      {/* Banner do dia */}
      <div
        className="relative overflow-hidden rounded-2xl p-5 border border-[#00E620]/20"
        style={{
          background: 'linear-gradient(135deg, rgba(0,230,32,0.12), rgba(0,230,32,0.03))',
        }}
      >
        <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full blur-2xl bg-[#00E620]/15 pointer-events-none" />
        <div className="relative">
          <p className="text-gray-400 text-sm mb-3">
            Hoje, {format(new Date(), "dd 'de' MMMM", { locale: ptBR })}
          </p>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-4xl font-display text-[#00E620]">{captacoesHoje + leadsHoje}</p>
              <p className="text-xs text-gray-500">total captados</p>
            </div>
            <div className="w-px h-12 bg-white/10" />
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{captacoesHoje}</p>
              <p className="text-xs text-gray-500">por volume</p>
            </div>
            <div className="w-px h-12 bg-white/10" />
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{leadsHoje}</p>
              <p className="text-xs text-gray-500">com dados</p>
            </div>
          </div>
        </div>
      </div>

      {/* Dois botões de entrada */}
      <div className="grid grid-cols-2 gap-3">
        {/* Captação por volume */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setModalVolume(true)}
          className="relative overflow-hidden flex flex-col items-center gap-3
                     py-6 rounded-2xl border-2 border-[#00E620] bg-[#00E620]/[0.08]
                     touch-manipulation"
          style={{ boxShadow: '0 0 20px rgba(0,230,32,0.15)' }}
        >
          <div className="w-14 h-14 rounded-2xl bg-[#00E620]/20 flex items-center justify-center">
            <Plus size={30} color="#00E620" weight="bold" />
          </div>
          <div className="text-center">
            <p className="font-bold text-[#00E620] text-base">Captação Rápida</p>
            <p className="text-gray-500 text-xs mt-1 leading-relaxed px-2">
              Registrar quantidade sem precisar de dados da pessoa
            </p>
          </div>
          <span className="text-xs text-[#00E620]/60 bg-[#00E620]/10 px-2 py-0.5 rounded-full">
            Mais usado
          </span>
        </motion.button>

        {/* Lead qualificado */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setModalLead(true)}
          className="flex flex-col items-center gap-3 py-6 rounded-2xl
                     border border-white/10 hover:border-[#00E620]/30 transition-all
                     touch-manipulation bg-[#161616]"
        >
          <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center">
            <UserPlus size={28} className="text-gray-400" />
          </div>
          <div className="text-center">
            <p className="font-bold text-white text-base">Lead Qualificado</p>
            <p className="text-gray-500 text-xs mt-1 leading-relaxed px-2">
              Pessoa que respondeu — adicionar com nome e dados
            </p>
          </div>
        </motion.button>
      </div>

      {/* Histórico de captações por volume */}
      <HistoricoCaptacoesVolume captacoesVolume={captacoesVolume} onAtualizar={onAtualizar} />

      {/* Leads qualificados recentes */}
      {leads.filter((l) => l.status === 'novo' || l.status === 'abordado').length > 0 && (
        <div className="space-y-3">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <Users size={18} color="#00E620" />
            Leads qualificados recentes
          </h3>
          {leads
            .filter((l) => l.status === 'novo' || l.status === 'abordado')
            .slice(0, 5)
            .map((lead) => (
              <div
                key={lead.id}
                className="flex items-center gap-3 p-3 bg-[#161616] border border-white/5 rounded-xl"
              >
                <div className="w-9 h-9 rounded-lg bg-[#00E620]/20 flex items-center justify-center text-[#00E620] font-bold text-sm flex-shrink-0">
                  {lead.nome?.charAt(0).toUpperCase() ?? '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white text-sm truncate">
                    {lead.nome ?? 'Sem nome'}
                  </p>
                  <p className="text-gray-500 text-xs capitalize">
                    {lead.origem} · {lead.status?.replace('_', ' ')}
                  </p>
                </div>
                {lead.telefone && (
                  <a
                    href={`https://wa.me/55${lead.telefone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-lg bg-[#00E620]/15 flex items-center justify-center touch-manipulation"
                  >
                    <WhatsappLogo size={18} color="#00E620" weight="fill" />
                  </a>
                )}
              </div>
            ))}
        </div>
      )}

      {/* Modal captação por volume */}
      <ModalCaptacaoVolume
        aberto={modalVolume}
        onFechar={() => setModalVolume(false)}
        onSalvo={() => {
          setModalVolume(false)
          onAtualizar()
        }}
      />

      {/* Modal lead qualificado */}
      <ModalLeadQualificado
        aberto={modalLead}
        onFechar={() => setModalLead(false)}
        onSalvo={() => {
          setModalLead(false)
          onAtualizar()
        }}
      />
    </div>
  )
}

// ==================== HISTORICO CAPTACOES VOLUME ====================

function HistoricoCaptacoesVolume({
  captacoesVolume,
  onAtualizar,
}: {
  captacoesVolume: CaptacaoVolume[]
  onAtualizar: () => void
}) {
  const porData = captacoesVolume.reduce(
    (acc, c) => {
      if (!acc[c.data]) acc[c.data] = []
      acc[c.data].push(c)
      return acc
    },
    {} as Record<string, CaptacaoVolume[]>
  )

  const datas = Object.keys(porData)
    .sort((a, b) => b.localeCompare(a))
    .slice(0, 7)

  if (datas.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500 text-sm border border-dashed border-white/10 rounded-2xl">
        Nenhuma captação registrada ainda
      </div>
    )
  }

  const hojeStr = format(new Date(), 'yyyy-MM-dd')
  const ontemStr = format(subDays(new Date(), 1), 'yyyy-MM-dd')

  const canalEmoji: Record<string, string> = {
    instagram: '📸',
    tiktok: '🎵',
    whatsapp: '💬',
    indicacao: '👥',
    outro: '📦',
  }

  return (
    <div className="space-y-3">
      <h3 className="font-bold text-white text-sm flex items-center gap-2">
        <ClockCounterClockwise size={18} color="#00E620" />
        Histórico de captação
      </h3>

      {datas.map((data) => {
        const itens = porData[data]
        const total = itens.reduce((acc, c) => acc + c.quantidade, 0)
        const isHoje = data === hojeStr
        const isOntem = data === ontemStr

        return (
          <div
            key={data}
            className={`bg-[#161616] border rounded-2xl p-4 ${
              isHoje ? 'border-[#00E620]/30' : 'border-white/5'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <p className="font-bold text-white text-sm">
                  {isHoje
                    ? 'Hoje'
                    : isOntem
                      ? 'Ontem'
                      : format(new Date(data + 'T12:00:00'), "dd 'de' MMM", { locale: ptBR })}
                </p>
                {isHoje && (
                  <span className="text-xs bg-[#00E620]/15 text-[#00E620] px-2 py-0.5 rounded-full font-medium">
                    hoje
                  </span>
                )}
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-[#00E620]">{total}</p>
                <p className="text-xs text-gray-600">pessoa{total !== 1 ? 's' : ''}</p>
              </div>
            </div>

            {/* Detalhes por canal */}
            <div className="flex flex-wrap gap-2">
              {itens.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#111] border border-white/5"
                >
                  <span className="text-sm">{canalEmoji[item.canal] ?? '📦'}</span>
                  <span className="text-white text-sm font-bold">{item.quantidade}</span>
                  <span className="text-gray-600 text-xs capitalize">{item.canal}</span>
                  <button
                    onClick={() =>
                      deletarComDesfazer(
                        item.id,
                        'captacoes_volume',
                        item,
                        onAtualizar,
                        `Registro de ${item.quantidade} captação${item.quantidade !== 1 ? 'ões' : ''} excluído`
                      )
                    }
                    className="ml-1 text-gray-600 hover:text-red-400 transition-colors touch-manipulation"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>

            {/* Observações */}
            {itens.some((i) => i.observacoes) && (
              <div className="mt-2 pt-2 border-t border-white/5">
                {itens
                  .filter((i) => i.observacoes)
                  .map((item) => (
                    <p key={item.id} className="text-xs text-gray-500 italic">
                      💬 {item.observacoes}
                    </p>
                  ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ==================== MODAL CAPTACAO VOLUME ====================

function ModalCaptacaoVolume({
  aberto,
  onFechar,
  onSalvo,
}: {
  aberto: boolean
  onFechar: () => void
  onSalvo: () => void
}) {
  const [quantidade, setQuantidade] = useState(1)
  const [canal, setCanal] = useState('instagram')
  const [data, setData] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [observacoes, setObservacoes] = useState('')
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    if (aberto) {
      setQuantidade(1)
      setCanal('instagram')
      setData(format(new Date(), 'yyyy-MM-dd'))
      setObservacoes('')
    }
  }, [aberto])

  const handleSalvar = async () => {
    if (quantidade < 1) return
    setSalvando(true)

    const { error } = await supabase.from('captacoes_volume').insert({
      quantidade,
      canal,
      data,
      observacoes: observacoes.trim() || null,
    })

    setSalvando(false)
    if (!error) onSalvo()
  }

  const canais = [
    { id: 'instagram', label: '📸 Instagram' },
    { id: 'tiktok', label: '🎵 TikTok' },
    { id: 'whatsapp', label: '💬 WhatsApp' },
    { id: 'indicacao', label: '👥 Indicação' },
    { id: 'outro', label: '📦 Outro' },
  ]

  return (
    <BottomSheet
      aberto={aberto}
      onFechar={onFechar}
      titulo="Registrar Captação"
      botaoPrimario={{
        label: salvando
          ? 'Registrando...'
          : `Registrar ${quantidade} captação${quantidade !== 1 ? 'ões' : ''}`,
        loading: salvando,
        disabled: quantidade < 1 || salvando,
        onClick: handleSalvar,
      }}
    >
      <div className="space-y-6">
        {/* Info */}
        <div className="flex gap-3 p-4 rounded-xl bg-[#00E620]/[0.08] border border-[#00E620]/20">
          <Info size={18} color="#00E620" className="flex-shrink-0 mt-0.5" />
          <p className="text-sm text-gray-400 leading-relaxed">
            Use para registrar quantas pessoas você abordou hoje, mesmo que não tenham respondido.
            Sem precisar de nenhum dado pessoal.
          </p>
        </div>

        {/* Quantidade */}
        <div className="space-y-3">
          <label className="text-sm text-gray-400 font-medium">
            Quantas pessoas você captou/abordou?
          </label>

          <div className="flex items-center gap-4 justify-center">
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() => setQuantidade((q) => Math.max(1, q - 1))}
              className="w-16 h-16 rounded-2xl bg-[#111] border border-white/10
                         flex items-center justify-center text-white text-2xl
                         hover:border-[#00E620] transition-colors touch-manipulation font-bold"
            >
              −
            </motion.button>

            <div className="text-center">
              <motion.p
                key={quantidade}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-6xl font-display text-[#00E620]"
              >
                {quantidade}
              </motion.p>
              <p className="text-gray-500 text-xs mt-1">pessoa{quantidade !== 1 ? 's' : ''}</p>
            </div>

            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() => setQuantidade((q) => q + 1)}
              className="w-16 h-16 rounded-2xl bg-[#00E620] flex items-center
                         justify-center text-black text-2xl font-bold
                         shadow-[0_0_20px_rgba(0,230,32,0.4)] touch-manipulation"
            >
              +
            </motion.button>
          </div>

          {/* Atalhos rápidos */}
          <div className="flex gap-2 justify-center flex-wrap">
            {[5, 10, 15, 20, 30, 50].map((n) => (
              <button
                key={n}
                onClick={() => setQuantidade(n)}
                className={`px-3 py-1.5 rounded-xl text-sm border transition-all touch-manipulation ${
                  quantidade === n
                    ? 'border-[#00E620] bg-[#00E620]/15 text-[#00E620] font-bold'
                    : 'border-white/10 text-gray-400 hover:border-[#00E620]/40'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Canal */}
        <div className="space-y-2">
          <label className="text-sm text-gray-400 font-medium">Canal de captação</label>
          <div className="grid grid-cols-3 gap-2">
            {canais.map((c) => (
              <motion.button
                key={c.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCanal(c.id)}
                className={`py-2.5 rounded-xl text-xs border transition-all touch-manipulation ${
                  canal === c.id
                    ? 'border-[#00E620] bg-[#00E620]/15 text-[#00E620] font-bold'
                    : 'border-white/10 text-gray-400'
                }`}
              >
                {c.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Data */}
        <div className="space-y-1.5">
          <label className="text-sm text-gray-400 font-medium">Data</label>
          <input
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            className="w-full bg-[#111] border border-white/5 rounded-xl px-4 py-3
                       text-white outline-none focus:border-[#00E620] transition-colors"
          />
        </div>

        {/* Observações */}
        <div className="space-y-1.5">
          <label className="text-sm text-gray-400 font-medium">
            Observações <span className="text-gray-600 font-normal">(opcional)</span>
          </label>
          <textarea
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            placeholder="Ex: Stories de transformação converteram bem, nicho fitness feminino..."
            rows={2}
            className="w-full bg-[#111] border border-white/5 rounded-xl px-4 py-3
                       text-white placeholder:text-gray-600 outline-none resize-none
                       focus:border-[#00E620] transition-colors text-base"
          />
        </div>
      </div>
    </BottomSheet>
  )
}

// ==================== MODAL LEAD QUALIFICADO ====================

function ModalLeadQualificado({
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
    temperatura: 'morno',
    observacoes: '',
    data_followup: '',
  })
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    if (aberto) {
      setForm({
        nome: '',
        telefone: '',
        instagram: '',
        email: '',
        origem: 'instagram',
        temperatura: 'morno',
        observacoes: '',
        data_followup: '',
      })
    }
  }, [aberto])

  const set = (campo: string, valor: string) => setForm((f) => ({ ...f, [campo]: valor }))

  const podeSalvar = form.nome.trim() || form.telefone.trim() || form.instagram.trim()

  const handleSalvar = async () => {
    if (!podeSalvar) return
    setSalvando(true)

    const { error } = await supabase.from('captacoes').insert({
      nome: form.nome.trim() || null,
      telefone: form.telefone.trim() || null,
      instagram: form.instagram.trim() || null,
      email: form.email.trim() || null,
      origem: form.origem,
      temperatura: form.temperatura,
      observacoes: form.observacoes.trim() || null,
      data_followup: form.data_followup || null,
      status: 'abordado',
    })

    setSalvando(false)
    if (!error) onSalvo()
  }

  const campos = [
    { campo: 'nome', placeholder: 'Nome da pessoa', Icon: User, type: 'text' },
    { campo: 'instagram', placeholder: '@usuario', Icon: InstagramLogo, type: 'text' },
    { campo: 'telefone', placeholder: '(51) 99999-9999', Icon: Phone, type: 'tel' },
    { campo: 'email', placeholder: 'email@exemplo.com', Icon: Envelope, type: 'email' },
  ] as const

  return (
    <BottomSheet
      aberto={aberto}
      onFechar={onFechar}
      titulo="Lead Qualificado"
      botaoPrimario={{
        label: salvando ? 'Salvando...' : 'Adicionar Lead',
        loading: salvando,
        disabled: !podeSalvar || salvando,
        onClick: handleSalvar,
      }}
    >
      <div className="space-y-5">
        <div className="flex gap-3 p-3 rounded-xl bg-blue-500/[0.08] border border-blue-500/20">
          <Info size={16} color="#3B82F6" className="flex-shrink-0 mt-0.5" />
          <p className="text-xs text-blue-400">
            Pessoa que respondeu ou demonstrou interesse. Preencha o que tiver — pelo menos um campo
            de identificação.
          </p>
        </div>

        {/* Identificação */}
        <div className="space-y-3">
          <p className="text-sm text-gray-400 font-medium">
            Identificação <span className="text-gray-600 font-normal">(preencha o que tiver)</span>
          </p>

          {campos.map((c) => {
            const val = (form as any)[c.campo] as string
            return (
              <div
                key={c.campo}
                className={`flex items-center gap-2 border rounded-xl px-3 transition-all ${
                  val
                    ? 'border-[#00E620]/50 shadow-[0_0_8px_rgba(0,230,32,0.1)]'
                    : 'border-white/5'
                }`}
              >
                <c.Icon size={18} className={val ? 'text-[#00E620]' : 'text-gray-600'} />
                <input
                  type={c.type}
                  value={val}
                  onChange={(e) => set(c.campo, e.target.value)}
                  placeholder={c.placeholder}
                  className="flex-1 bg-transparent py-3.5 text-white placeholder:text-gray-600 outline-none text-base"
                />
              </div>
            )
          })}
        </div>

        {/* Origem */}
        <div className="space-y-2">
          <label className="text-sm text-gray-400 font-medium">De onde veio?</label>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'instagram', label: '📸 Instagram' },
              { id: 'tiktok', label: '🎵 TikTok' },
              { id: 'whatsapp', label: '💬 WhatsApp' },
              { id: 'indicacao', label: '👥 Indicação' },
              { id: 'outro', label: '📦 Outro' },
            ].map((o) => (
              <button
                key={o.id}
                onClick={() => set('origem', o.id)}
                className={`px-3 py-2 rounded-xl text-xs border transition-all touch-manipulation ${
                  form.origem === o.id
                    ? 'border-[#00E620] bg-[#00E620]/15 text-[#00E620] font-bold'
                    : 'border-white/10 text-gray-400'
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        {/* Temperatura */}
        <div className="space-y-2">
          <label className="text-sm text-gray-400 font-medium">Nível de interesse</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'frio', emoji: '🧊', desc: 'Não respondeu ainda' },
              { id: 'morno', emoji: '🌡️', desc: 'Demonstrou interesse' },
              { id: 'quente', emoji: '🔥', desc: 'Quer saber mais' },
            ].map((t) => (
              <motion.button
                key={t.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => set('temperatura', t.id)}
                className={`p-3 rounded-xl border text-center transition-all touch-manipulation ${
                  form.temperatura === t.id ? 'border-[#00E620] bg-[#00E620]/10' : 'border-white/10'
                }`}
              >
                <p className="text-lg mb-0.5">{t.emoji}</p>
                <p
                  className={`text-xs font-bold ${
                    form.temperatura === t.id ? 'text-[#00E620]' : 'text-white'
                  }`}
                >
                  {t.id.charAt(0).toUpperCase() + t.id.slice(1)}
                </p>
                <p className="text-gray-600 text-[10px] mt-0.5 leading-tight">{t.desc}</p>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Follow-up */}
        <div className="space-y-1.5">
          <label className="text-sm text-gray-400 font-medium">
            Agendar follow-up <span className="text-gray-600 font-normal">(opcional)</span>
          </label>
          <div className="flex gap-2 flex-wrap mb-2">
            {[
              { label: 'Amanhã', dias: 1 },
              { label: 'Em 2 dias', dias: 2 },
              { label: 'Em 3 dias', dias: 3 },
              { label: 'Em 1 sem', dias: 7 },
            ].map((op) => {
              const dataAlvo = format(addDays(new Date(), op.dias), 'yyyy-MM-dd')
              return (
                <button
                  key={op.dias}
                  onClick={() => set('data_followup', dataAlvo)}
                  className={`px-3 py-1.5 rounded-xl text-xs border transition-all touch-manipulation ${
                    form.data_followup === dataAlvo
                      ? 'border-[#00E620] bg-[#00E620]/15 text-[#00E620] font-bold'
                      : 'border-white/10 text-gray-400'
                  }`}
                >
                  {op.label}
                </button>
              )
            })}
          </div>
          <input
            type="date"
            value={form.data_followup}
            onChange={(e) => set('data_followup', e.target.value)}
            className="w-full bg-[#111] border border-white/5 rounded-xl px-4 py-3
                       text-white outline-none focus:border-[#00E620] transition-colors"
          />
        </div>

        {/* Observações */}
        <div className="space-y-1.5">
          <label className="text-sm text-gray-400 font-medium">
            Observações <span className="text-gray-600 font-normal">(opcional)</span>
          </label>
          <textarea
            value={form.observacoes}
            onChange={(e) => set('observacoes', e.target.value)}
            placeholder="O que ela disse, objeções, contexto..."
            rows={2}
            className="w-full bg-[#111] border border-white/5 rounded-xl px-4 py-3
                       text-white placeholder:text-gray-600 outline-none resize-none
                       focus:border-[#00E620] transition-colors text-base"
          />
        </div>
      </div>
    </BottomSheet>
  )
}
