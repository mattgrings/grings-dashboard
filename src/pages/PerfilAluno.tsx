import { useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  ArrowLeft, Camera, Barbell, ForkKnife, Plus, Trash, CalendarBlank,
  InstagramLogo, Phone, EnvelopeSimple, User, ImageSquare,
} from '@phosphor-icons/react'
import { useAlunosStore } from '../store/alunosStore'
import { useToast } from '../components/ui/Toast'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import type {
  FotoProgresso,
  GrupoMuscular, Exercicio, Refeicao,
} from '../types'

type Tab = 'fotos' | 'treino' | 'dieta'

const tabConfig = [
  { key: 'fotos' as Tab, label: 'Fotos', icon: Camera },
  { key: 'treino' as Tab, label: 'Treino', icon: Barbell },
  { key: 'dieta' as Tab, label: 'Dieta', icon: ForkKnife },
]

export default function PerfilAluno() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { showToast } = useToast()

  const aluno = useAlunosStore((s) => s.alunos.find((a) => a.id === id))
  const fotos = useAlunosStore((s) => s.fotos.filter((f) => f.alunoId === id).sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()))
  const treinos = useAlunosStore((s) => s.treinos.filter((t) => t.alunoId === id).sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()))
  const dietas = useAlunosStore((s) => s.dietas.filter((d) => d.alunoId === id).sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()))
  const addFoto = useAlunosStore((s) => s.addFoto)
  const deleteFoto = useAlunosStore((s) => s.deleteFoto)
  const addTreino = useAlunosStore((s) => s.addTreino)
  const deleteTreino = useAlunosStore((s) => s.deleteTreino)
  const addDieta = useAlunosStore((s) => s.addDieta)
  const deleteDieta = useAlunosStore((s) => s.deleteDieta)

  const [activeTab, setActiveTab] = useState<Tab>('fotos')
  const [showFotoModal, setShowFotoModal] = useState(false)
  const [showTreinoModal, setShowTreinoModal] = useState(false)
  const [showDietaModal, setShowDietaModal] = useState(false)
  const [expandedTreino, setExpandedTreino] = useState<string | null>(null)
  const [expandedDieta, setExpandedDieta] = useState<string | null>(null)

  // Foto form
  const fileRef = useRef<HTMLInputElement>(null)
  const [fotoPreview, setFotoPreview] = useState<string>('')
  const [fotoLegenda, setFotoLegenda] = useState('')
  const [fotoTipo, setFotoTipo] = useState<FotoProgresso['tipo']>('frente')
  const [fotoData, setFotoData] = useState(format(new Date(), 'yyyy-MM-dd'))

  // Treino form
  const [treinoTitulo, setTreinoTitulo] = useState('')
  const [treinoDescricao, setTreinoDescricao] = useState('')
  const [treinoData, setTreinoData] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [treinoGrupos, setTreinoGrupos] = useState<GrupoMuscular[]>([{ nome: '', exercicios: [{ nome: '', series: 3, repeticoes: '12' }] }])

  // Dieta form
  const [dietaTitulo, setDietaTitulo] = useState('')
  const [dietaDescricao, setDietaDescricao] = useState('')
  const [dietaData, setDietaData] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [dietaRefeicoes, setDietaRefeicoes] = useState<Refeicao[]>([{ nome: '', alimentos: [''] }])
  const [dietaCalorias, setDietaCalorias] = useState('')
  const [dietaProteina, setDietaProteina] = useState('')
  const [dietaCarbo, setDietaCarbo] = useState('')
  const [dietaGordura, setDietaGordura] = useState('')

  if (!aluno) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <User size={48} className="mb-3 opacity-30" />
        <p>Aluno não encontrado</p>
        <Button variant="ghost" onClick={() => navigate('/alunos')} className="mt-4">Voltar</Button>
      </div>
    )
  }

  const initials = aluno.nome.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setFotoPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleAddFoto = (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) return
    addFoto({ alunoId: id, url: fotoPreview, legenda: fotoLegenda || undefined, data: new Date(fotoData), tipo: fotoTipo })
    showToast('Foto adicionada!')
    setShowFotoModal(false)
    setFotoPreview(''); setFotoLegenda('')
  }

  const handleAddTreino = (e: React.FormEvent) => {
    e.preventDefault()
    if (!id || !treinoTitulo.trim()) return
    const detalhes = treinoGrupos.filter((g) => g.nome.trim() && g.exercicios.some((ex) => ex.nome.trim()))
    addTreino({ alunoId: id, data: new Date(treinoData), titulo: treinoTitulo.trim(), descricao: treinoDescricao.trim(), detalhes })
    showToast('Treino adicionado!')
    setShowTreinoModal(false)
    setTreinoTitulo(''); setTreinoDescricao('')
    setTreinoGrupos([{ nome: '', exercicios: [{ nome: '', series: 3, repeticoes: '12' }] }])
  }

  const handleAddDieta = (e: React.FormEvent) => {
    e.preventDefault()
    if (!id || !dietaTitulo.trim()) return
    const refeicoes = dietaRefeicoes.filter((r) => r.nome.trim() && r.alimentos.some((a) => a.trim()))
    const macros = dietaCalorias ? {
      calorias: parseInt(dietaCalorias), proteina: parseInt(dietaProteina) || 0,
      carboidrato: parseInt(dietaCarbo) || 0, gordura: parseInt(dietaGordura) || 0,
    } : undefined
    addDieta({ alunoId: id, data: new Date(dietaData), titulo: dietaTitulo.trim(), descricao: dietaDescricao.trim(), refeicoes, macros })
    showToast('Dieta adicionada!')
    setShowDietaModal(false)
    setDietaTitulo(''); setDietaDescricao('')
    setDietaRefeicoes([{ nome: '', alimentos: [''] }])
    setDietaCalorias(''); setDietaProteina(''); setDietaCarbo(''); setDietaGordura('')
  }

  const addGrupo = () => setTreinoGrupos([...treinoGrupos, { nome: '', exercicios: [{ nome: '', series: 3, repeticoes: '12' }] }])
  const addExercicio = (gi: number) => {
    const g = [...treinoGrupos]
    g[gi].exercicios.push({ nome: '', series: 3, repeticoes: '12' })
    setTreinoGrupos(g)
  }
  const updateGrupoNome = (gi: number, nome: string) => {
    const g = [...treinoGrupos]; g[gi].nome = nome; setTreinoGrupos(g)
  }
  const updateExercicio = (gi: number, ei: number, field: keyof Exercicio, value: string | number) => {
    const g = [...treinoGrupos]
    const ex = { ...g[gi].exercicios[ei], [field]: value } as Exercicio
    g[gi].exercicios[ei] = ex
    setTreinoGrupos(g)
  }

  const addRefeicao = () => setDietaRefeicoes([...dietaRefeicoes, { nome: '', alimentos: [''] }])
  const updateRefeicaoNome = (ri: number, nome: string) => {
    const r = [...dietaRefeicoes]; r[ri].nome = nome; setDietaRefeicoes(r)
  }
  const updateRefeicaoHorario = (ri: number, horario: string) => {
    const r = [...dietaRefeicoes]; r[ri].horario = horario; setDietaRefeicoes(r)
  }
  const addAlimento = (ri: number) => {
    const r = [...dietaRefeicoes]; r[ri].alimentos.push(''); setDietaRefeicoes(r)
  }
  const updateAlimento = (ri: number, ai: number, value: string) => {
    const r = [...dietaRefeicoes]; r[ri].alimentos[ai] = value; setDietaRefeicoes(r)
  }

  const inputClass = 'w-full px-4 py-2.5 bg-surface border border-white/5 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-brand-green/30 focus:shadow-glow-green-sm transition-all'
  const inputSm = 'px-3 py-2 bg-surface border border-white/5 rounded-lg text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-brand-green/30 transition-all'

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Back button */}
      <button onClick={() => navigate('/alunos')} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
        <ArrowLeft size={16} /> Voltar para Alunos
      </button>

      {/* Profile Header */}
      <div className="bg-surface/50 backdrop-blur-md border border-white/5 rounded-card p-6">
        <div className="flex items-start gap-5">
          <div className="w-20 h-20 rounded-2xl bg-brand-green/15 flex items-center justify-center text-brand-green text-2xl font-bold shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-display tracking-wider text-white">{aluno.nome.toUpperCase()}</h1>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                aluno.status === 'ativo' ? 'bg-brand-green/15 text-brand-green border-brand-green/20' :
                aluno.status === 'pausado' ? 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20' :
                'bg-red-500/15 text-red-400 border-red-500/20'
              }`}>
                {aluno.status === 'ativo' ? 'Ativo' : aluno.status === 'pausado' ? 'Pausado' : 'Cancelado'}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mb-3">
              <span className="flex items-center gap-1"><Phone size={12} /> {aluno.telefone}</span>
              {aluno.instagram && <span className="flex items-center gap-1"><InstagramLogo size={12} /> {aluno.instagram}</span>}
              {aluno.email && <span className="flex items-center gap-1"><EnvelopeSimple size={12} /> {aluno.email}</span>}
              <span className="flex items-center gap-1"><CalendarBlank size={12} /> Desde {format(new Date(aluno.dataInicio), "dd MMM yyyy", { locale: ptBR })}</span>
            </div>

            <div className="flex flex-wrap gap-3">
              {aluno.pesoInicial && (
                <div className="px-3 py-1.5 bg-white/[0.03] rounded-lg border border-white/5">
                  <span className="text-[10px] text-gray-500 block">Peso Inicial</span>
                  <span className="text-sm text-white font-medium">{aluno.pesoInicial} kg</span>
                </div>
              )}
              {aluno.alturaM && (
                <div className="px-3 py-1.5 bg-white/[0.03] rounded-lg border border-white/5">
                  <span className="text-[10px] text-gray-500 block">Altura</span>
                  <span className="text-sm text-white font-medium">{aluno.alturaM} m</span>
                </div>
              )}
              {aluno.pesoInicial && aluno.alturaM && (
                <div className="px-3 py-1.5 bg-white/[0.03] rounded-lg border border-white/5">
                  <span className="text-[10px] text-gray-500 block">IMC</span>
                  <span className="text-sm text-white font-medium">{(aluno.pesoInicial / (aluno.alturaM * aluno.alturaM)).toFixed(1)}</span>
                </div>
              )}
              <div className="px-3 py-1.5 bg-brand-green/5 rounded-lg border border-brand-green/10">
                <span className="text-[10px] text-gray-500 block">Objetivo</span>
                <span className="text-sm text-brand-green font-medium capitalize">{aluno.objetivo}</span>
              </div>
            </div>

            {aluno.observacoes && (
              <p className="text-xs text-gray-400 mt-3 p-3 bg-white/[0.02] rounded-lg border border-white/5">{aluno.observacoes}</p>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-surface/50 border border-white/5 rounded-xl p-1">
        {tabConfig.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === key ? 'bg-brand-green text-black' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Icon size={16} weight={activeTab === key ? 'fill' : 'regular'} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {/* ==================== FOTOS ==================== */}
        {activeTab === 'fotos' && (
          <motion.div key="fotos" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-400">{fotos.length} fotos de progresso</h3>
              <Button size="sm" onClick={() => setShowFotoModal(true)}>
                <Plus size={14} /> Adicionar Foto
              </Button>
            </div>

            {fotos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-600 bg-surface/30 rounded-card border border-white/5">
                <ImageSquare size={48} className="mb-3 opacity-30" />
                <p className="text-sm">Nenhuma foto de progresso ainda</p>
                <p className="text-xs text-gray-700 mt-1">Adicione fotos para acompanhar a evolução</p>
              </div>
            ) : (
              <>
                {/* Group fotos by date */}
                {Object.entries(
                  fotos.reduce((acc, foto) => {
                    const key = format(new Date(foto.data), 'yyyy-MM-dd')
                    if (!acc[key]) acc[key] = []
                    acc[key].push(foto)
                    return acc
                  }, {} as Record<string, FotoProgresso[]>)
                ).map(([dateKey, dateFotos]) => (
                  <div key={dateKey}>
                    <h4 className="text-xs text-gray-500 mb-2 font-medium">
                      {format(new Date(dateKey), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {dateFotos.map((foto) => (
                        <motion.div
                          key={foto.id}
                          whileHover={{ scale: 1.02 }}
                          className="relative group bg-surface/50 border border-white/5 rounded-xl overflow-hidden"
                        >
                          {foto.url ? (
                            <img src={foto.url} alt={foto.legenda || 'Progresso'} className="w-full aspect-[3/4] object-cover" />
                          ) : (
                            <div className="w-full aspect-[3/4] bg-gradient-to-br from-brand-green/10 to-brand-green/5 flex items-center justify-center">
                              <Camera size={32} className="text-brand-green/30" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                            <span className="text-xs text-white font-medium">{foto.legenda || foto.tipo}</span>
                            <span className="text-[10px] text-gray-400 capitalize">{foto.tipo}</span>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteFoto(foto.id); showToast('Foto removida', 'info') }}
                            className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/50 text-gray-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Trash size={12} />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ))}
              </>
            )}
          </motion.div>
        )}

        {/* ==================== TREINO ==================== */}
        {activeTab === 'treino' && (
          <motion.div key="treino" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-400">{treinos.length} atualizações de treino</h3>
              <Button size="sm" onClick={() => setShowTreinoModal(true)}>
                <Plus size={14} /> Novo Treino
              </Button>
            </div>

            {treinos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-600 bg-surface/30 rounded-card border border-white/5">
                <Barbell size={48} className="mb-3 opacity-30" />
                <p className="text-sm">Nenhum treino registrado</p>
              </div>
            ) : (
              <div className="space-y-3">
                {treinos.map((treino) => (
                  <motion.div
                    key={treino.id}
                    className="bg-surface/50 border border-white/5 rounded-card overflow-hidden"
                  >
                    <button
                      onClick={() => setExpandedTreino(expandedTreino === treino.id ? null : treino.id)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-white/[0.02] transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <Barbell size={14} className="text-brand-green" />
                          <h4 className="text-sm font-semibold text-white">{treino.titulo}</h4>
                        </div>
                        <p className="text-xs text-gray-500">
                          {format(new Date(treino.data), "dd MMM yyyy", { locale: ptBR })}
                          {treino.descricao && ` — ${treino.descricao}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteTreino(treino.id); showToast('Treino removido', 'info') }}
                          className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 transition-colors"
                        >
                          <Trash size={14} />
                        </button>
                        <span className={`text-gray-500 transition-transform ${expandedTreino === treino.id ? 'rotate-180' : ''}`}>▾</span>
                      </div>
                    </button>

                    <AnimatePresence>
                      {expandedTreino === treino.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 space-y-3">
                            {treino.detalhes.map((grupo, gi) => (
                              <div key={gi} className="bg-white/[0.02] rounded-xl p-3 border border-white/5">
                                <h5 className="text-xs font-semibold text-brand-green mb-2 uppercase tracking-wider">{grupo.nome}</h5>
                                <div className="space-y-1.5">
                                  {grupo.exercicios.map((ex, ei) => (
                                    <div key={ei} className="flex items-center justify-between text-xs">
                                      <span className="text-gray-300">{ex.nome}</span>
                                      <div className="flex items-center gap-2 text-gray-500">
                                        <span>{ex.series}x{ex.repeticoes}</span>
                                        {ex.carga && <span className="text-brand-green/70">{ex.carga}</span>}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                {grupo.exercicios.some((ex) => ex.observacao) && (
                                  <div className="mt-2 pt-2 border-t border-white/5">
                                    {grupo.exercicios.filter((ex) => ex.observacao).map((ex, i) => (
                                      <p key={i} className="text-[10px] text-yellow-500/70">⚠ {ex.nome}: {ex.observacao}</p>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ==================== DIETA ==================== */}
        {activeTab === 'dieta' && (
          <motion.div key="dieta" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-400">{dietas.length} planos alimentares</h3>
              <Button size="sm" onClick={() => setShowDietaModal(true)}>
                <Plus size={14} /> Nova Dieta
              </Button>
            </div>

            {dietas.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-600 bg-surface/30 rounded-card border border-white/5">
                <ForkKnife size={48} className="mb-3 opacity-30" />
                <p className="text-sm">Nenhum plano alimentar registrado</p>
              </div>
            ) : (
              <div className="space-y-3">
                {dietas.map((dieta) => (
                  <motion.div
                    key={dieta.id}
                    className="bg-surface/50 border border-white/5 rounded-card overflow-hidden"
                  >
                    <button
                      onClick={() => setExpandedDieta(expandedDieta === dieta.id ? null : dieta.id)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-white/[0.02] transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <ForkKnife size={14} className="text-brand-green" />
                          <h4 className="text-sm font-semibold text-white">{dieta.titulo}</h4>
                        </div>
                        <p className="text-xs text-gray-500">
                          {format(new Date(dieta.data), "dd MMM yyyy", { locale: ptBR })}
                          {dieta.macros && ` — ${dieta.macros.calorias}kcal`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteDieta(dieta.id); showToast('Dieta removida', 'info') }}
                          className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 transition-colors"
                        >
                          <Trash size={14} />
                        </button>
                        <span className={`text-gray-500 transition-transform ${expandedDieta === dieta.id ? 'rotate-180' : ''}`}>▾</span>
                      </div>
                    </button>

                    <AnimatePresence>
                      {expandedDieta === dieta.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 space-y-3">
                            {dieta.descricao && (
                              <p className="text-xs text-gray-400 italic">{dieta.descricao}</p>
                            )}

                            {/* Macros */}
                            {dieta.macros && (
                              <div className="grid grid-cols-4 gap-2">
                                <div className="p-2.5 bg-white/[0.02] rounded-xl border border-white/5 text-center">
                                  <span className="text-lg font-display text-white">{dieta.macros.calorias}</span>
                                  <p className="text-[10px] text-gray-500">kcal</p>
                                </div>
                                <div className="p-2.5 bg-red-500/5 rounded-xl border border-red-500/10 text-center">
                                  <span className="text-lg font-display text-red-400">{dieta.macros.proteina}g</span>
                                  <p className="text-[10px] text-gray-500">Proteína</p>
                                </div>
                                <div className="p-2.5 bg-yellow-500/5 rounded-xl border border-yellow-500/10 text-center">
                                  <span className="text-lg font-display text-yellow-400">{dieta.macros.carboidrato}g</span>
                                  <p className="text-[10px] text-gray-500">Carbo</p>
                                </div>
                                <div className="p-2.5 bg-blue-500/5 rounded-xl border border-blue-500/10 text-center">
                                  <span className="text-lg font-display text-blue-400">{dieta.macros.gordura}g</span>
                                  <p className="text-[10px] text-gray-500">Gordura</p>
                                </div>
                              </div>
                            )}

                            {/* Refeições */}
                            {dieta.refeicoes.map((ref, ri) => (
                              <div key={ri} className="bg-white/[0.02] rounded-xl p-3 border border-white/5">
                                <div className="flex items-center gap-2 mb-2">
                                  <h5 className="text-xs font-semibold text-brand-green">{ref.nome}</h5>
                                  {ref.horario && <span className="text-[10px] text-gray-600">{ref.horario}</span>}
                                </div>
                                <ul className="space-y-1">
                                  {ref.alimentos.map((alimento, ai) => (
                                    <li key={ai} className="text-xs text-gray-400 flex items-start gap-1.5">
                                      <span className="text-brand-green/50 mt-0.5">•</span>
                                      {alimento}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================== MODALS ==================== */}

      {/* Foto Modal */}
      <Modal isOpen={showFotoModal} onClose={() => setShowFotoModal(false)} title="Adicionar Foto de Progresso">
        <form onSubmit={handleAddFoto} className="space-y-4">
          <div
            onClick={() => fileRef.current?.click()}
            className="w-full aspect-[3/4] max-h-64 bg-surface rounded-xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center cursor-pointer hover:border-brand-green/30 transition-colors overflow-hidden"
          >
            {fotoPreview ? (
              <img src={fotoPreview} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <>
                <Camera size={32} className="text-gray-600 mb-2" />
                <p className="text-xs text-gray-500">Clique para selecionar foto</p>
              </>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Tipo</label>
              <select value={fotoTipo} onChange={(e) => setFotoTipo(e.target.value as FotoProgresso['tipo'])} className={inputClass}>
                <option value="frente">Frente</option>
                <option value="costas">Costas</option>
                <option value="lateral">Lateral</option>
                <option value="outro">Outro</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Data</label>
              <input type="date" value={fotoData} onChange={(e) => setFotoData(e.target.value)} className={inputClass} />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Legenda</label>
            <input type="text" value={fotoLegenda} onChange={(e) => setFotoLegenda(e.target.value)} placeholder="Ex: 30 dias de treino" className={inputClass} />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setShowFotoModal(false)} className="flex-1">Cancelar</Button>
            <Button type="submit" className="flex-1">Salvar Foto</Button>
          </div>
        </form>
      </Modal>

      {/* Treino Modal */}
      <Modal isOpen={showTreinoModal} onClose={() => setShowTreinoModal(false)} title="Novo Treino">
        <form onSubmit={handleAddTreino} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Título *</label>
              <input type="text" value={treinoTitulo} onChange={(e) => setTreinoTitulo(e.target.value)} placeholder="Ex: Treino A - Push" className={inputClass} required />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Data</label>
              <input type="date" value={treinoData} onChange={(e) => setTreinoData(e.target.value)} className={inputClass} />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Descrição</label>
            <input type="text" value={treinoDescricao} onChange={(e) => setTreinoDescricao(e.target.value)} placeholder="Fase de progressão..." className={inputClass} />
          </div>

          {/* Grupos musculares */}
          {treinoGrupos.map((grupo, gi) => (
            <div key={gi} className="p-3 bg-white/[0.02] rounded-xl border border-white/5 space-y-2">
              <input type="text" value={grupo.nome} onChange={(e) => updateGrupoNome(gi, e.target.value)} placeholder="Grupo muscular (ex: Peito)" className={`${inputSm} w-full font-medium`} />
              {grupo.exercicios.map((ex, ei) => (
                <div key={ei} className="grid grid-cols-[1fr_60px_60px_70px] gap-1.5">
                  <input type="text" value={ex.nome} onChange={(e) => updateExercicio(gi, ei, 'nome', e.target.value)} placeholder="Exercício" className={inputSm} />
                  <input type="number" value={ex.series} onChange={(e) => updateExercicio(gi, ei, 'series', parseInt(e.target.value) || 0)} placeholder="Séries" className={`${inputSm} text-center`} />
                  <input type="text" value={ex.repeticoes} onChange={(e) => updateExercicio(gi, ei, 'repeticoes', e.target.value)} placeholder="Reps" className={`${inputSm} text-center`} />
                  <input type="text" value={ex.carga || ''} onChange={(e) => updateExercicio(gi, ei, 'carga', e.target.value)} placeholder="Carga" className={`${inputSm} text-center`} />
                </div>
              ))}
              <button type="button" onClick={() => addExercicio(gi)} className="text-[10px] text-brand-green hover:underline">+ Exercício</button>
            </div>
          ))}
          <button type="button" onClick={addGrupo} className="text-xs text-brand-green hover:underline">+ Grupo Muscular</button>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setShowTreinoModal(false)} className="flex-1">Cancelar</Button>
            <Button type="submit" className="flex-1">Salvar Treino</Button>
          </div>
        </form>
      </Modal>

      {/* Dieta Modal */}
      <Modal isOpen={showDietaModal} onClose={() => setShowDietaModal(false)} title="Novo Plano Alimentar">
        <form onSubmit={handleAddDieta} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Título *</label>
              <input type="text" value={dietaTitulo} onChange={(e) => setDietaTitulo(e.target.value)} placeholder="Ex: Plano Cutting" className={inputClass} required />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Data</label>
              <input type="date" value={dietaData} onChange={(e) => setDietaData(e.target.value)} className={inputClass} />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Descrição</label>
            <input type="text" value={dietaDescricao} onChange={(e) => setDietaDescricao(e.target.value)} placeholder="Deficit calórico de 500kcal..." className={inputClass} />
          </div>

          {/* Macros */}
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Macros (opcional)</label>
            <div className="grid grid-cols-4 gap-2">
              <input type="number" value={dietaCalorias} onChange={(e) => setDietaCalorias(e.target.value)} placeholder="kcal" className={inputSm} />
              <input type="number" value={dietaProteina} onChange={(e) => setDietaProteina(e.target.value)} placeholder="Prot (g)" className={inputSm} />
              <input type="number" value={dietaCarbo} onChange={(e) => setDietaCarbo(e.target.value)} placeholder="Carbo (g)" className={inputSm} />
              <input type="number" value={dietaGordura} onChange={(e) => setDietaGordura(e.target.value)} placeholder="Gord (g)" className={inputSm} />
            </div>
          </div>

          {/* Refeições */}
          {dietaRefeicoes.map((ref, ri) => (
            <div key={ri} className="p-3 bg-white/[0.02] rounded-xl border border-white/5 space-y-2">
              <div className="grid grid-cols-[1fr_80px] gap-2">
                <input type="text" value={ref.nome} onChange={(e) => updateRefeicaoNome(ri, e.target.value)} placeholder="Refeição (ex: Almoço)" className={`${inputSm} font-medium`} />
                <input type="time" value={ref.horario || ''} onChange={(e) => updateRefeicaoHorario(ri, e.target.value)} className={inputSm} />
              </div>
              {ref.alimentos.map((alimento, ai) => (
                <input key={ai} type="text" value={alimento} onChange={(e) => updateAlimento(ri, ai, e.target.value)} placeholder="Alimento" className={inputSm + ' w-full'} />
              ))}
              <button type="button" onClick={() => addAlimento(ri)} className="text-[10px] text-brand-green hover:underline">+ Alimento</button>
            </div>
          ))}
          <button type="button" onClick={addRefeicao} className="text-xs text-brand-green hover:underline">+ Refeição</button>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setShowDietaModal(false)} className="flex-1">Cancelar</Button>
            <Button type="submit" className="flex-1">Salvar Dieta</Button>
          </div>
        </form>
      </Modal>
    </motion.div>
  )
}
