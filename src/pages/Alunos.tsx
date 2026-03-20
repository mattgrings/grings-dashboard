import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Plus, MagnifyingGlass, FunnelSimple, Barbell, Heart,
  TrendUp, FirstAid, Lightning,
} from '@phosphor-icons/react'
import { useAlunosStore } from '../store/alunosStore'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import { useToast } from '../components/ui/Toast'
import type { StatusAluno, ObjetivoAluno } from '../types'

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 15, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 25 } },
}

const statusColors: Record<StatusAluno, string> = {
  ativo: 'bg-brand-green/15 text-brand-green border-brand-green/20',
  pausado: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
  cancelado: 'bg-red-500/15 text-red-400 border-red-500/20',
}

const statusLabels: Record<StatusAluno, string> = {
  ativo: 'Ativo',
  pausado: 'Pausado',
  cancelado: 'Cancelado',
}

const objetivoIcons: Record<ObjetivoAluno, typeof Barbell> = {
  emagrecimento: TrendUp,
  hipertrofia: Barbell,
  saude: Heart,
  performance: Lightning,
  reabilitacao: FirstAid,
}

const objetivoLabels: Record<ObjetivoAluno, string> = {
  emagrecimento: 'Emagrecimento',
  hipertrofia: 'Hipertrofia',
  saude: 'Saúde',
  performance: 'Performance',
  reabilitacao: 'Reabilitação',
}

export default function Alunos() {
  const navigate = useNavigate()
  const alunos = useAlunosStore((s) => s.alunos)
  const addAluno = useAlunosStore((s) => s.addAluno)
  const fotos = useAlunosStore((s) => s.fotos)
  const treinos = useAlunosStore((s) => s.treinos)
  const { showToast } = useToast()

  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<StatusAluno | ''>('')
  const [filterObjetivo, setFilterObjetivo] = useState<ObjetivoAluno | ''>('')

  // Form state
  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [instagram, setInstagram] = useState('')
  const [email, setEmail] = useState('')
  const [dataNascimento, setDataNascimento] = useState('')
  const [objetivo, setObjetivo] = useState<ObjetivoAluno>('emagrecimento')
  const [pesoInicial, setPesoInicial] = useState('')
  const [alturaM, setAlturaM] = useState('')
  const [observacoes, setObservacoes] = useState('')

  const filtered = useMemo(() => {
    return alunos.filter((a) => {
      const matchSearch = !search ||
        a.nome.toLowerCase().includes(search.toLowerCase()) ||
        a.telefone.includes(search) ||
        a.instagram?.toLowerCase().includes(search.toLowerCase())
      const matchStatus = !filterStatus || a.status === filterStatus
      const matchObjetivo = !filterObjetivo || a.objetivo === filterObjetivo
      return matchSearch && matchStatus && matchObjetivo
    })
  }, [alunos, search, filterStatus, filterObjetivo])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!nome.trim() || !telefone.trim()) return

    addAluno({
      nome: nome.trim(),
      telefone: telefone.trim(),
      instagram: instagram.trim() || undefined,
      email: email.trim() || undefined,
      dataNascimento: dataNascimento || undefined,
      objetivo,
      status: 'ativo',
      dataInicio: new Date(),
      observacoes: observacoes.trim() || undefined,
      pesoInicial: pesoInicial ? parseFloat(pesoInicial) : undefined,
      alturaM: alturaM ? parseFloat(alturaM) : undefined,
    })

    showToast('Aluno cadastrado com sucesso!')
    setShowForm(false)
    setNome(''); setTelefone(''); setInstagram(''); setEmail('')
    setDataNascimento(''); setPesoInicial(''); setAlturaM(''); setObservacoes('')
  }

  const inputClass =
    'w-full px-4 py-2.5 bg-surface border border-white/5 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-brand-green/30 focus:shadow-glow-green-sm transition-all'

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display tracking-wider text-white">ALUNOS</h2>
          <p className="text-sm text-gray-500">
            {alunos.filter((a) => a.status === 'ativo').length} ativos de {alunos.length} total
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus size={16} weight="bold" />
          Novo Aluno
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, telefone, Instagram..."
            className="pl-9 pr-4 py-2.5 bg-surface border border-white/5 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-brand-green/30 w-full transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <FunnelSimple size={16} className="text-gray-500" />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as StatusAluno | '')} className="px-3 py-2.5 bg-surface border border-white/5 rounded-xl text-sm text-gray-400 focus:outline-none focus:border-brand-green/30">
            <option value="">Todos status</option>
            <option value="ativo">Ativo</option>
            <option value="pausado">Pausado</option>
            <option value="cancelado">Cancelado</option>
          </select>
          <select value={filterObjetivo} onChange={(e) => setFilterObjetivo(e.target.value as ObjetivoAluno | '')} className="px-3 py-2.5 bg-surface border border-white/5 rounded-xl text-sm text-gray-400 focus:outline-none focus:border-brand-green/30">
            <option value="">Todos objetivos</option>
            <option value="emagrecimento">Emagrecimento</option>
            <option value="hipertrofia">Hipertrofia</option>
            <option value="saude">Saúde</option>
            <option value="performance">Performance</option>
            <option value="reabilitacao">Reabilitação</option>
          </select>
        </div>
      </div>

      {/* Alunos Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-600">
          <Barbell size={48} className="mb-3 opacity-30" />
          <p className="text-sm">Nenhum aluno encontrado</p>
        </div>
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((aluno) => {
            const Icon = objetivoIcons[aluno.objetivo]
            const alunoFotos = fotos.filter((f) => f.alunoId === aluno.id).length
            const alunoTreinos = treinos.filter((t) => t.alunoId === aluno.id).length
            const initials = aluno.nome.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()

            return (
              <motion.div
                key={aluno.id}
                variants={cardVariants}
                whileHover={{ scale: 1.01, boxShadow: '0 0 25px rgba(0, 230, 32, 0.12)' }}
                onClick={() => navigate(`/alunos/${aluno.id}`)}
                className="bg-surface/50 backdrop-blur-md border border-white/5 rounded-card p-5 cursor-pointer hover:border-brand-green/15 transition-colors"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-brand-green/15 flex items-center justify-center text-brand-green text-sm font-bold shrink-0">
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-sm font-semibold text-white truncate">{aluno.nome}</h3>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${statusColors[aluno.status]}`}>
                        {statusLabels[aluno.status]}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">{aluno.telefone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/[0.03] rounded-lg">
                    <Icon size={13} className="text-brand-green" />
                    <span className="text-[11px] text-gray-400">{objetivoLabels[aluno.objetivo]}</span>
                  </div>
                  {aluno.pesoInicial && (
                    <div className="px-2.5 py-1 bg-white/[0.03] rounded-lg">
                      <span className="text-[11px] text-gray-400">{aluno.pesoInicial}kg</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px] text-gray-600 pt-3 border-t border-white/5">
                  <span>Desde {format(new Date(aluno.dataInicio), "MMM yyyy", { locale: ptBR })}</span>
                  <div className="flex items-center gap-3">
                    <span>{alunoFotos} fotos</span>
                    <span>{alunoTreinos} treinos</span>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      )}

      {/* New Aluno Modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Novo Aluno">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Nome *</label>
            <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome completo" className={inputClass} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Telefone *</label>
              <input type="tel" value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="(00) 00000-0000" className={inputClass} required />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Instagram</label>
              <input type="text" value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="@usuario" className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@exemplo.com" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Data de Nascimento</label>
              <input type="date" value={dataNascimento} onChange={(e) => setDataNascimento(e.target.value)} className={inputClass} />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Objetivo</label>
            <select value={objetivo} onChange={(e) => setObjetivo(e.target.value as ObjetivoAluno)} className={inputClass}>
              <option value="emagrecimento">Emagrecimento</option>
              <option value="hipertrofia">Hipertrofia</option>
              <option value="saude">Saúde</option>
              <option value="performance">Performance</option>
              <option value="reabilitacao">Reabilitação</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Peso Inicial (kg)</label>
              <input type="number" step="0.1" value={pesoInicial} onChange={(e) => setPesoInicial(e.target.value)} placeholder="70.5" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Altura (m)</label>
              <input type="number" step="0.01" value={alturaM} onChange={(e) => setAlturaM(e.target.value)} placeholder="1.70" className={inputClass} />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Observações</label>
            <textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} placeholder="Restrições, objetivos específicos..." rows={3} className={`${inputClass} resize-none`} />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setShowForm(false)} className="flex-1">Cancelar</Button>
            <Button type="submit" className="flex-1">Cadastrar Aluno</Button>
          </div>
        </form>
      </Modal>
    </motion.div>
  )
}
