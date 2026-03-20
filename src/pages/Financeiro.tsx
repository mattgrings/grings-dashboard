import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CurrencyDollar,
  Plus,
  TrendUp,
  Target,
  ChartBar,
  Coins,
  PencilSimple,
  Trash,
  X,
} from '@phosphor-icons/react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useFinanceiroStore } from '../store/financeiroStore'
import KPICard from '../components/dashboard/KPICard'
import type { Venda, TipoVenda } from '../types'

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 25 } },
}

const formatBRL = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const servicoOptions = [
  'Consultoria Mensal',
  'Plano Trimestral',
  'Plano Semestral',
  'Plano Anual',
  'Avulso',
]

const tipoBadge: Record<TipoVenda, { label: string; bg: string; text: string }> = {
  confirmada: { label: 'Confirmada', bg: 'bg-green-500/15', text: 'text-green-400' },
  sinal: { label: 'Sinal', bg: 'bg-yellow-500/15', text: 'text-yellow-400' },
  pendente: { label: 'Pendente', bg: 'bg-gray-500/15', text: 'text-gray-400' },
  cancelada: { label: 'Cancelada', bg: 'bg-red-500/15', text: 'text-red-400' },
}

export default function Financeiro() {
  const { meses, mesAtualId, setMesAtual, addVenda, deleteVenda, updateVenda, setMeta, addMes } =
    useFinanceiroStore()

  const [modalOpen, setModalOpen] = useState(false)
  const [editingVenda, setEditingVenda] = useState<Venda | null>(null)
  const [editingMeta, setEditingMeta] = useState(false)
  const [metaInput, setMetaInput] = useState('')

  const mesAtual = useMemo(
    () => meses.find((m) => m.id === mesAtualId),
    [meses, mesAtualId]
  )

  const vendas = mesAtual?.vendas ?? []
  const meta = mesAtual?.meta ?? 0

  const faturamento = useMemo(() => {
    return vendas.reduce((acc, v) => {
      if (v.tipo === 'confirmada') return acc + v.valor
      if (v.tipo === 'sinal') return acc + (v.valorSinal ?? 0)
      return acc
    }, 0)
  }, [vendas])

  const percentMeta = meta > 0 ? (faturamento / meta) * 100 : 0
  const metaColor =
    percentMeta >= 100 ? 'text-green-400' : percentMeta >= 70 ? 'text-yellow-400' : 'text-red-400'
  const barColor =
    percentMeta >= 100 ? '#00E620' : percentMeta >= 70 ? '#EAB308' : '#EF4444'

  const totalVendas = vendas.filter((v) => v.tipo === 'confirmada').length
  const totalSinais = vendas.filter((v) => v.tipo === 'sinal').length

  const chartData = useMemo(() => {
    const sorted = [...meses].sort((a, b) => a.mes.localeCompare(b.mes))
    const last6 = sorted.slice(-6)
    return last6.map((m) => {
      const fat = m.vendas.reduce((acc, v) => {
        if (v.tipo === 'confirmada') return acc + v.valor
        if (v.tipo === 'sinal') return acc + (v.valorSinal ?? 0)
        return acc
      }, 0)
      const monthDate = parseISO(`${m.mes}-01`)
      return {
        name: format(monthDate, 'MMM/yy', { locale: ptBR }),
        Faturamento: fat,
        Meta: m.meta,
      }
    })
  }, [meses])

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value
    if (val === '__new__') {
      const now = new Date()
      const nextMonths: string[] = []
      for (let i = 1; i <= 3; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() + i, 1)
        const id = format(d, 'yyyy-MM')
        if (!meses.find((m) => m.id === id)) nextMonths.push(id)
      }
      if (nextMonths.length > 0) {
        const newId = nextMonths[0]
        addMes({ id: newId, mes: newId, meta: 10000, vendas: [] })
        setMesAtual(newId)
      }
    } else {
      setMesAtual(val)
    }
  }

  const handleSaveMeta = () => {
    const val = parseFloat(metaInput)
    if (!isNaN(val) && val > 0 && mesAtualId) {
      setMeta(mesAtualId, val)
    }
    setEditingMeta(false)
  }

  const handleDelete = (vendaId: string) => {
    if (mesAtualId) deleteVenda(mesAtualId, vendaId)
  }

  const handleEdit = (venda: Venda) => {
    setEditingVenda(venda)
    setModalOpen(true)
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h1 className="font-display text-3xl text-white tracking-wider">FINANCEIRO</h1>
          <select
            value={mesAtualId}
            onChange={handleMonthChange}
            className="bg-[#161616] border border-white/10 text-white text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-[#00E620]/50"
          >
            {meses
              .slice()
              .sort((a, b) => b.mes.localeCompare(a.mes))
              .map((m) => {
                const monthDate = parseISO(`${m.mes}-01`)
                return (
                  <option key={m.id} value={m.id}>
                    {format(monthDate, "MMMM 'de' yyyy", { locale: ptBR })}
                  </option>
                )
              })}
            <option value="__new__">+ Novo Mês</option>
          </select>
        </div>
        <button
          onClick={() => {
            setEditingVenda(null)
            setModalOpen(true)
          }}
          className="flex items-center gap-2 bg-[#00E620] text-black font-semibold px-4 py-2.5 rounded-xl hover:bg-[#00E620]/90 transition-colors text-sm"
        >
          <Plus size={18} weight="bold" />
          Nova Venda
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div variants={cardVariants}>
          <KPICard
            icon={<Coins size={22} weight="duotone" />}
            label="Faturamento"
            value={faturamento}
            prefix="R$"
            changeLabel={formatBRL(faturamento)}
          />
        </motion.div>
        <motion.div variants={cardVariants}>
          <div
            className="relative bg-surface/50 backdrop-blur-md border border-white/5 rounded-card p-5 overflow-hidden group hover:border-brand-green/20 transition-colors cursor-pointer"
            onClick={() => {
              setMetaInput(meta.toString())
              setEditingMeta(true)
            }}
          >
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-brand-green/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-brand-green/10 flex items-center justify-center text-brand-green">
                  <Target size={22} weight="duotone" />
                </div>
                <PencilSimple size={14} className="text-gray-500 group-hover:text-gray-300 transition-colors" />
              </div>
              <span className="text-3xl font-display tracking-wide text-white">{formatBRL(meta)}</span>
              <p className="text-sm text-gray-500 mt-1">Meta do Mês</p>
            </div>
          </div>
        </motion.div>
        <motion.div variants={cardVariants}>
          <div className="relative bg-surface/50 backdrop-blur-md border border-white/5 rounded-card p-5 overflow-hidden group hover:border-brand-green/20 transition-colors">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-brand-green/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-brand-green/10 flex items-center justify-center text-brand-green">
                  <TrendUp size={22} weight="duotone" />
                </div>
              </div>
              <span className={`text-3xl font-display tracking-wide ${metaColor}`}>
                {percentMeta.toFixed(1)}%
              </span>
              <p className="text-sm text-gray-500 mt-1">% da Meta</p>
            </div>
          </div>
        </motion.div>
        <motion.div variants={cardVariants}>
          <KPICard
            icon={<ChartBar size={22} weight="duotone" />}
            label="Vendas / Sinais"
            value={totalVendas + totalSinais}
            changeLabel={`${totalVendas} confirmadas, ${totalSinais} sinais`}
          />
        </motion.div>
      </div>

      {/* Progress Bar */}
      <motion.div variants={cardVariants}>
        <div className="bg-surface/50 backdrop-blur-md border border-white/5 rounded-card p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-400">Progresso da Meta</h3>
            <span className={`text-sm font-semibold ${metaColor}`}>{percentMeta.toFixed(1)}%</span>
          </div>
          <div className="w-full h-4 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(percentMeta, 100)}%` }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{ backgroundColor: barColor }}
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {percentMeta >= 100
              ? 'Meta atingida!'
              : `Faltam ${formatBRL(meta - faturamento)} para a meta`}
          </p>
        </div>
      </motion.div>

      {/* Chart */}
      <motion.div variants={cardVariants}>
        <div className="bg-surface/50 backdrop-blur-md border border-white/5 rounded-card p-5">
          <h3 className="text-sm font-medium text-gray-400 mb-4">Faturamento vs Meta</h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barGap={4}>
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                  tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    background: '#1A1A1A',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    fontSize: '13px',
                    color: '#fff',
                  }}
                  formatter={(value: number) => formatBRL(value)}
                />
                <Legend
                  wrapperStyle={{ fontSize: '12px', color: '#9CA3AF' }}
                />
                <Bar dataKey="Faturamento" fill="#00E620" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Meta" fill="#374151" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>

      {/* Vendas Table */}
      <motion.div variants={cardVariants}>
        <div className="bg-surface/50 backdrop-blur-md border border-white/5 rounded-card overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5">
            <h3 className="text-sm font-medium text-gray-400">Vendas do Mês</h3>
          </div>
          {vendas.length === 0 ? (
            <div className="px-5 py-12 text-center text-gray-500 text-sm">
              Nenhuma venda registrada neste mês.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Serviço</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                    <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {vendas.map((venda) => {
                    const badge = tipoBadge[venda.tipo]
                    return (
                      <tr
                        key={venda.id}
                        className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="px-5 py-3.5 text-white font-medium">{venda.clienteNome}</td>
                        <td className="px-5 py-3.5 text-gray-400">{venda.servico}</td>
                        <td className="px-5 py-3.5 text-white font-medium">{formatBRL(venda.valor)}</td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium ${badge.bg} ${badge.text}`}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-gray-400">
                          {format(parseISO(venda.dataVenda), 'dd/MM/yyyy')}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEdit(venda)}
                              className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-colors"
                            >
                              <PencilSimple size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(venda.id)}
                              className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            >
                              <Trash size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>

      {/* Modal Nova Venda */}
      <AnimatePresence>
        {modalOpen && (
          <VendaModal
            venda={editingVenda}
            onClose={() => {
              setModalOpen(false)
              setEditingVenda(null)
            }}
            onSave={(data) => {
              if (editingVenda) {
                updateVenda(mesAtualId, editingVenda.id, data)
              } else {
                addVenda(mesAtualId, data)
              }
              setModalOpen(false)
              setEditingVenda(null)
            }}
          />
        )}
      </AnimatePresence>

      {/* Modal Editar Meta */}
      <AnimatePresence>
        {editingMeta && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backdropFilter: 'blur(8px)' }}
          >
            <div className="absolute inset-0 bg-black/60" onClick={() => setEditingMeta(false)} />
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="relative bg-[#111111] border border-white/10 rounded-2xl p-6 w-full max-w-sm"
            >
              <h2 className="font-display text-xl text-white tracking-wider mb-4">EDITAR META</h2>
              <label className="block text-sm text-gray-400 mb-2">Meta do Mês (R$)</label>
              <input
                type="number"
                value={metaInput}
                onChange={(e) => setMetaInput(e.target.value)}
                className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#00E620]/50"
              />
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setEditingMeta(false)}
                  className="px-4 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 text-sm transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveMeta}
                  className="px-4 py-2 rounded-xl bg-[#00E620] text-black font-semibold text-sm hover:bg-[#00E620]/90 transition-colors"
                >
                  Salvar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ==================== VENDA MODAL ====================

interface VendaModalProps {
  venda: Venda | null
  onClose: () => void
  onSave: (data: Omit<Venda, 'id'>) => void
}

function VendaModal({ venda, onClose, onSave }: VendaModalProps) {
  const [clienteNome, setClienteNome] = useState(venda?.clienteNome ?? '')
  const [servico, setServico] = useState(venda?.servico ?? 'Consultoria Mensal')
  const [valor, setValor] = useState(venda?.valor?.toString() ?? '')
  const [tipo, setTipo] = useState<TipoVenda>(venda?.tipo ?? 'confirmada')
  const [valorSinal, setValorSinal] = useState(venda?.valorSinal?.toString() ?? '')
  const [valorRestante, setValorRestante] = useState(venda?.valorRestante?.toString() ?? '')
  const [dataVenda, setDataVenda] = useState(venda?.dataVenda ?? format(new Date(), 'yyyy-MM-dd'))
  const [observacoes, setObservacoes] = useState(venda?.observacoes ?? '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!clienteNome.trim() || !valor) return

    const data: Omit<Venda, 'id'> = {
      clienteNome: clienteNome.trim(),
      servico,
      valor: parseFloat(valor),
      tipo,
      dataVenda,
      observacoes: observacoes.trim() || undefined,
    }

    if (tipo === 'sinal') {
      data.valorSinal = parseFloat(valorSinal) || 0
      data.valorRestante = parseFloat(valorRestante) || 0
    }

    onSave(data)
  }

  const tipoButtons: { value: TipoVenda; label: string }[] = [
    { value: 'confirmada', label: 'Confirmada' },
    { value: 'sinal', label: 'Sinal' },
    { value: 'pendente', label: 'Pendente' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backdropFilter: 'blur(8px)' }}
    >
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="relative bg-[#111111] border border-white/10 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl text-white tracking-wider">
            {venda ? 'EDITAR VENDA' : 'NOVA VENDA'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Cliente */}
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Nome do Cliente</label>
            <input
              type="text"
              value={clienteNome}
              onChange={(e) => setClienteNome(e.target.value)}
              placeholder="Nome do cliente"
              required
              className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#00E620]/50"
            />
          </div>

          {/* Serviço */}
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Serviço</label>
            <select
              value={servico}
              onChange={(e) => setServico(e.target.value)}
              className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#00E620]/50"
            >
              {servicoOptions.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Valor */}
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Valor (R$)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">R$</span>
              <input
                type="number"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                placeholder="0,00"
                required
                min="0"
                step="0.01"
                className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#00E620]/50"
              />
            </div>
          </div>

          {/* Tipo */}
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Tipo</label>
            <div className="flex gap-2">
              {tipoButtons.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setTipo(t.value)}
                  className={`flex-1 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    tipo === t.value
                      ? t.value === 'confirmada'
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : t.value === 'sinal'
                        ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                        : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                      : 'bg-white/5 text-gray-500 border border-white/5 hover:border-white/10'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sinal fields */}
          <AnimatePresence>
            {tipo === 'sinal' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden space-y-4"
              >
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">Valor do Sinal (R$)</label>
                    <input
                      type="number"
                      value={valorSinal}
                      onChange={(e) => setValorSinal(e.target.value)}
                      placeholder="0,00"
                      min="0"
                      step="0.01"
                      className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#00E620]/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">Valor Restante (R$)</label>
                    <input
                      type="number"
                      value={valorRestante}
                      onChange={(e) => setValorRestante(e.target.value)}
                      placeholder="0,00"
                      min="0"
                      step="0.01"
                      className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#00E620]/50"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Data */}
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Data da Venda</label>
            <input
              type="date"
              value={dataVenda}
              onChange={(e) => setDataVenda(e.target.value)}
              className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#00E620]/50"
            />
          </div>

          {/* Observações */}
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Observações</label>
            <textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Observações adicionais..."
              rows={3}
              className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#00E620]/50 resize-none"
            />
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 text-sm transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00E620] text-black font-semibold text-sm hover:bg-[#00E620]/90 transition-colors"
            >
              <CurrencyDollar size={18} weight="bold" />
              {venda ? 'Salvar Alterações' : 'Registrar Venda'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}
