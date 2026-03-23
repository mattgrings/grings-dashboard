import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Barbell,
  BookOpen,
  Copy,
  Users,
  MagnifyingGlass,
  Plus,
  UserPlus,
  FolderOpen,
  ArrowLeft,
  Trash,
  DownloadSimple,
} from '@phosphor-icons/react'
import GradienteHeader from '../components/ui/GradienteHeader'
import ExercicioCard from '../components/treino/ExercicioCard'
import CriadorPlano from '../components/treino/CriadorPlano'
import Modal from '../components/ui/Modal'
import {
  EXERCICIOS_BIBLIOTECA,
  GRUPOS_MUSCULARES,
  type GrupoMuscularBib,
} from '../data/exerciciosBiblioteca'
import { useTreinoStore } from '../store/treinoStore'
import { usePlanoTreinoStore } from '../store/planoTreinoStore'
import { useAlunosStore } from '../store/alunosStore'
import { useTemplateStore, type TemplateComPasta } from '../store/templateStore'
import { useToast } from '../components/ui/Toast'
import type { PlanoTreinoCompleto } from '../types/treino'

type Aba = 'treinos' | 'biblioteca' | 'templates'

// ── Aba Treinos dos Alunos ──
function AbaTreinosAlunos({ onCriarPlano }: { onCriarPlano: () => void }) {
  const planos = usePlanoTreinoStore((s) => s.planos)
  const alunos = useAlunosStore((s) => s.alunos)
  const alunosAtivos = alunos.filter((a) => a.status === 'ativo')

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-gray-400 text-sm">
          {planos.length} plano(s) de treino cadastrados
        </p>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onCriarPlano}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#00E620] text-black
                     font-bold text-sm shadow-[0_0_15px_rgba(0,230,32,0.3)] touch-manipulation"
        >
          <Plus size={18} weight="bold" />
          Novo Plano
        </motion.button>
      </div>

      {planos.length === 0 ? (
        <div className="text-center py-16 space-y-4">
          <div className="w-20 h-20 rounded-2xl bg-[#00E620]/10 flex items-center justify-center mx-auto">
            <Barbell size={40} className="text-[#00E620]" />
          </div>
          <div>
            <p className="text-white font-bold text-lg">Nenhum plano criado</p>
            <p className="text-gray-500 text-sm mt-1">
              Crie planos de treino para seus {alunosAtivos.length} aluno(s) ativo(s) ou use um template.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {planos.map((plano) => {
            const aluno = alunos.find((a) => a.id === plano.alunoId)
            const totalExercicios = plano.treinos.reduce(
              (sum, t) => sum + t.exercicios.length, 0
            )
            return (
              <motion.div
                key={plano.id}
                whileHover={{ y: -2 }}
                className="bg-[#161616] border border-white/5 rounded-2xl p-5 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-white font-bold truncate">{plano.nome}</h3>
                    <p className="text-gray-500 text-sm mt-0.5">
                      {aluno?.nome ?? 'Aluno'} · {plano.treinos.length} dia(s) · {totalExercicios} exercícios
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ${
                      plano.ativo
                        ? 'bg-[#00E620]/20 text-[#00E620]'
                        : 'bg-gray-700/50 text-gray-400'
                    }`}
                  >
                    {plano.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </div>

                <div className="flex gap-2 flex-wrap">
                  {plano.treinos.map((t, i) => (
                    <span
                      key={t.id}
                      className="w-8 h-8 rounded-lg bg-[#00E620]/20 text-[#00E620] text-xs font-bold flex items-center justify-center"
                    >
                      {String.fromCharCode(65 + i)}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="truncate">{plano.objetivo} · {plano.nivel}</span>
                  <span className="flex-shrink-0">Início: {new Date(plano.dataInicio).toLocaleDateString('pt-BR')}</span>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Aba Biblioteca ──
function AbaBiblioteca() {
  const [busca, setBusca] = useState('')
  const [grupoFiltro, setGrupoFiltro] = useState<GrupoMuscularBib | 'todos'>('todos')
  const exerciciosCustom = useTreinoStore((s) => s.exerciciosCustom)

  const todosExercicios = useMemo(
    () => [...EXERCICIOS_BIBLIOTECA, ...exerciciosCustom],
    [exerciciosCustom]
  )

  const filtrados = useMemo(() => {
    return todosExercicios.filter((ex) => {
      const matchBusca = busca === '' || ex.nome.toLowerCase().includes(busca.toLowerCase())
      const matchGrupo = grupoFiltro === 'todos' || ex.grupoMuscular === grupoFiltro
      return matchBusca && matchGrupo
    })
  }, [todosExercicios, busca, grupoFiltro])

  return (
    <div className="space-y-4">
      <div className="relative">
        <MagnifyingGlass
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
        />
        <input
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar exercício..."
          className="w-full bg-[#111111] border border-white/10 rounded-xl pl-10 pr-4 py-3
                     text-white placeholder:text-gray-600 outline-none
                     focus:border-[#00E620]/50 transition-colors"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        <button
          onClick={() => setGrupoFiltro('todos')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all border ${
            grupoFiltro === 'todos'
              ? 'bg-[#00E620] text-black border-[#00E620]'
              : 'bg-[#111111] text-gray-400 border-white/5 hover:text-white'
          }`}
        >
          Todos ({todosExercicios.length})
        </button>
        {GRUPOS_MUSCULARES.map((g) => {
          const count = todosExercicios.filter((e) => e.grupoMuscular === g.id).length
          if (count === 0) return null
          return (
            <button
              key={g.id}
              onClick={() => setGrupoFiltro(g.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all border ${
                grupoFiltro === g.id
                  ? 'text-black font-bold border-transparent'
                  : 'bg-[#111111] text-gray-400 border-white/5 hover:text-white'
              }`}
              style={
                grupoFiltro === g.id
                  ? { background: g.cor, borderColor: g.cor }
                  : undefined
              }
            >
              {g.label} ({count})
            </button>
          )
        })}
      </div>

      <div className="space-y-3">
        {filtrados.length === 0 ? (
          <p className="text-center text-gray-500 py-8">Nenhum exercício encontrado.</p>
        ) : (
          filtrados.map((ex) => <ExercicioCard key={ex.id} exercicio={ex} />)
        )}
      </div>

      <p className="text-center text-gray-600 text-xs pt-2">
        {filtrados.length} de {todosExercicios.length} exercícios
      </p>
    </div>
  )
}

// ── Aba Templates (com Pastas) ──
function AbaTemplates() {
  const { showToast } = useToast()
  const pastas = useTemplateStore((s) => s.pastas)
  const templates = useTemplateStore((s) => s.templates)
  const addPasta = useTemplateStore((s) => s.addPasta)
  const deletePasta = useTemplateStore((s) => s.deletePasta)
  const duplicateTemplate = useTemplateStore((s) => s.duplicateTemplate)
  const deleteTemplate = useTemplateStore((s) => s.deleteTemplate)
  const addTemplate = useTemplateStore((s) => s.addTemplate)
  const addPlano = usePlanoTreinoStore((s) => s.addPlano)
  const planos = usePlanoTreinoStore((s) => s.planos)
  const alunos = useAlunosStore((s) => s.alunos)
  const alunosAtivos = alunos.filter((a) => a.status === 'ativo')

  const [pastaAberta, setPastaAberta] = useState<string | null>(null)
  const [modalNovaPasta, setModalNovaPasta] = useState(false)
  const [novaPastaNome, setNovaPastaNome] = useState('')
  const [novaPastaCor, setNovaPastaCor] = useState('#00E620')
  const [modalUsarAluno, setModalUsarAluno] = useState<TemplateComPasta | null>(null)
  const [modalImportar, setModalImportar] = useState(false)
  const [importAlunoId, setImportAlunoId] = useState('')
  const [importPlanoId, setImportPlanoId] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const pastaAtual = pastas.find((p) => p.id === pastaAberta)
  const templatesFiltrados = pastaAberta
    ? templates.filter((t) => t.pastaId === pastaAberta)
    : templates.filter((t) => !t.pastaId)

  const templatesSemPasta = templates.filter((t) => !t.pastaId)

  const coresDisponiveis = ['#00E620', '#FFB800', '#3B82F6', '#FF4444', '#A855F7', '#EC4899', '#14B8A6']

  const handleCriarPasta = () => {
    if (!novaPastaNome.trim()) return
    addPasta(novaPastaNome.trim(), novaPastaCor)
    setNovaPastaNome('')
    setModalNovaPasta(false)
    showToast('Pasta criada!')
  }

  const handleCopiar = (t: TemplateComPasta) => {
    duplicateTemplate(t.id)
    showToast('Template duplicado!')
  }

  const handleUsarParaAluno = (template: TemplateComPasta, alunoId: string) => {
    const now = new Date().toISOString()
    addPlano({
      alunoId,
      nome: template.nome,
      descricao: template.descricao,
      objetivo: template.objetivo,
      nivel: template.nivel,
      treinos: template.treinos.map((t) => ({
        id: crypto.randomUUID(),
        nome: t.nome,
        diasSemana: [],
        duracaoEstimadaMinutos: 60,
        observacoesGerais: '',
        exercicios: t.exercicios.map((ex, idx) => ({
          id: crypto.randomUUID(),
          exercicioId: ex.nome,
          exercicio: {
            id: ex.nome,
            nome: ex.nome,
            grupoMuscular: 'peito' as const,
            equipamento: 'barra' as const,
            dificuldade: 'intermediario' as const,
            instrucoes: '',
            dicas: '',
            errosComuns: '',
            custom: false,
            criadoEm: now,
          },
          series: Array.from({ length: ex.series }, (_, si) => ({
            numeroSerie: si + 1,
            repeticoes: ex.repeticoes,
            tempoDescanso: parseInt(ex.descanso) || 60,
            tipoSerie: 'normal' as const,
          })),
          observacoesAdmin: '',
          ordem: idx,
        })),
        ativo: true,
      })),
      dataInicio: now.split('T')[0],
      ativo: true,
      observacoesGerais: '',
      criadoPor: 'Admin',
    })
    setModalUsarAluno(null)
    showToast('Plano criado a partir do template!')
  }

  const handleImportarTreino = () => {
    if (!importAlunoId || !importPlanoId) return
    const plano = planos.find((p) => p.id === importPlanoId)
    if (!plano) return

    addTemplate({
      nome: `${plano.nome} (Importado)`,
      descricao: `Importado do aluno`,
      objetivo: plano.objetivo,
      nivel: plano.nivel,
      diasSemana: [],
      treinos: plano.treinos.map((t, i) => ({
        letra: String.fromCharCode(65 + i),
        nome: t.nome,
        exercicios: t.exercicios.map((ex) => ({
          nome: ex.exercicio.nome,
          series: ex.series.length,
          repeticoes: ex.series[0]?.repeticoes ?? '10-12',
          descanso: `${ex.series[0]?.tempoDescanso ?? 60}s`,
        })),
      })),
      pastaId: pastaAberta,
    })
    setModalImportar(false)
    setImportAlunoId('')
    setImportPlanoId('')
    showToast('Treino importado como template!')
  }

  const planosDoAluno = planos.filter((p) => p.alunoId === importAlunoId)

  const inputClass =
    'w-full px-4 py-2.5 bg-[#111111] border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#00E620]/50 transition-colors'

  return (
    <div className="space-y-4">
      {/* Header + Actions */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        {pastaAberta ? (
          <button
            onClick={() => setPastaAberta(null)}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors touch-manipulation"
          >
            <ArrowLeft size={18} />
            <span className="text-sm font-medium">{pastaAtual?.nome ?? 'Voltar'}</span>
          </button>
        ) : (
          <p className="text-gray-400 text-sm">
            {templates.length} template(s) · {pastas.length} pasta(s)
          </p>
        )}
        <div className="flex gap-2">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setModalImportar(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#111111] border border-white/10
                       text-gray-400 text-xs hover:text-white hover:border-[#00E620]/30 transition-all touch-manipulation"
          >
            <DownloadSimple size={16} />
            Importar de Aluno
          </motion.button>
          {!pastaAberta && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setModalNovaPasta(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#00E620] text-black
                         font-bold text-xs shadow-[0_0_10px_rgba(0,230,32,0.3)] touch-manipulation"
            >
              <Plus size={16} weight="bold" />
              Nova Pasta
            </motion.button>
          )}
        </div>
      </div>

      {/* Pastas (only at root level) */}
      {!pastaAberta && pastas.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {pastas.map((pasta) => {
            const count = templates.filter((t) => t.pastaId === pasta.id).length
            return (
              <motion.button
                key={pasta.id}
                whileTap={{ scale: 0.97 }}
                onClick={() => setPastaAberta(pasta.id)}
                className="group bg-[#161616] border border-white/5 rounded-2xl p-4 text-left
                           hover:border-white/10 transition-all touch-manipulation relative overflow-hidden"
              >
                <div
                  className="absolute inset-0 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity"
                  style={{ background: pasta.cor }}
                />
                <div className="relative">
                  <FolderOpen size={28} style={{ color: pasta.cor }} className="mb-2" />
                  <p className="text-white font-bold text-sm truncate">{pasta.nome}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{count} template(s)</p>
                </div>
              </motion.button>
            )
          })}
        </div>
      )}

      {/* Templates without folder (root) or inside folder */}
      {!pastaAberta && templatesSemPasta.length > 0 && (
        <>
          {pastas.length > 0 && (
            <p className="text-gray-500 text-xs font-medium uppercase tracking-wider pt-2">Sem pasta</p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templatesSemPasta.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onCopiar={() => handleCopiar(template)}
                onUsarAluno={() => setModalUsarAluno(template)}
                onDeletar={() => setConfirmDeleteId(template.id)}
              />
            ))}
          </div>
        </>
      )}

      {pastaAberta && (
        <div className="space-y-4">
          {templatesFiltrados.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <FolderOpen size={48} className="mx-auto text-gray-600" />
              <p className="text-gray-500 text-sm">Pasta vazia. Importe um treino ou mova templates para cá.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templatesFiltrados.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onCopiar={() => handleCopiar(template)}
                  onUsarAluno={() => setModalUsarAluno(template)}
                  onDeletar={() => setConfirmDeleteId(template.id)}
                />
              ))}
            </div>
          )}

          <button
            onClick={() => {
              deletePasta(pastaAberta)
              setPastaAberta(null)
              showToast('Pasta removida. Templates movidos para raiz.')
            }}
            className="w-full py-3 rounded-xl border border-red-500/20 text-red-400 text-sm flex items-center justify-center gap-2 touch-manipulation hover:bg-red-500/10 transition-all"
          >
            <Trash size={16} />
            Excluir pasta
          </button>
        </div>
      )}

      {/* Criar Pasta Modal */}
      <Modal isOpen={modalNovaPasta} onClose={() => setModalNovaPasta(false)} title="Nova Pasta">
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Nome da pasta *</label>
            <input
              type="text"
              value={novaPastaNome}
              onChange={(e) => setNovaPastaNome(e.target.value)}
              placeholder="Ex: Hipertrofia, Emagrecimento..."
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Cor</label>
            <div className="flex gap-2">
              {coresDisponiveis.map((cor) => (
                <button
                  key={cor}
                  onClick={() => setNovaPastaCor(cor)}
                  className={`w-8 h-8 rounded-full border-2 transition-all touch-manipulation ${
                    novaPastaCor === cor ? 'border-white scale-110' : 'border-transparent'
                  }`}
                  style={{ background: cor }}
                />
              ))}
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleCriarPasta}
            disabled={!novaPastaNome.trim()}
            className="w-full py-3 rounded-xl bg-[#00E620] text-black font-bold disabled:opacity-40 touch-manipulation"
          >
            Criar Pasta
          </motion.button>
        </div>
      </Modal>

      {/* Usar para Aluno Modal */}
      <Modal
        isOpen={!!modalUsarAluno}
        onClose={() => setModalUsarAluno(null)}
        title="Usar para Aluno"
      >
        <div className="space-y-3">
          <p className="text-gray-400 text-sm">
            Selecione o aluno para aplicar <strong className="text-white">{modalUsarAluno?.nome}</strong>
          </p>
          {alunosAtivos.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-6">Nenhum aluno ativo cadastrado.</p>
          ) : (
            alunosAtivos.map((aluno) => (
              <motion.button
                key={aluno.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => modalUsarAluno && handleUsarParaAluno(modalUsarAluno, aluno.id)}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-[#111111] border border-white/5
                           hover:border-[#00E620]/30 transition-all text-left touch-manipulation"
              >
                <div className="w-10 h-10 rounded-full bg-[#00E620]/15 flex items-center justify-center text-[#00E620] text-xs font-bold flex-shrink-0">
                  {aluno.nome.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-white text-sm font-medium truncate">{aluno.nome}</p>
                  <p className="text-gray-500 text-xs">{aluno.objetivo}</p>
                </div>
                <UserPlus size={18} className="text-[#00E620] flex-shrink-0 ml-auto" />
              </motion.button>
            ))
          )}
        </div>
      </Modal>

      {/* Importar Treino de Aluno */}
      <Modal
        isOpen={modalImportar}
        onClose={() => { setModalImportar(false); setImportAlunoId(''); setImportPlanoId('') }}
        title="Importar Treino de Aluno"
      >
        <div className="space-y-4">
          <p className="text-gray-400 text-sm">
            Copie o treino de um aluno e salve como template reutilizável.
          </p>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Selecionar aluno</label>
            <select
              value={importAlunoId}
              onChange={(e) => { setImportAlunoId(e.target.value); setImportPlanoId('') }}
              className={inputClass}
            >
              <option value="">Escolher aluno...</option>
              {alunosAtivos.map((a) => (
                <option key={a.id} value={a.id}>{a.nome}</option>
              ))}
            </select>
          </div>
          {importAlunoId && (
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Selecionar treino</label>
              {planosDoAluno.length === 0 ? (
                <p className="text-gray-500 text-sm py-3">Nenhum plano criado para este aluno.</p>
              ) : (
                <select value={importPlanoId} onChange={(e) => setImportPlanoId(e.target.value)} className={inputClass}>
                  <option value="">Escolher plano...</option>
                  {planosDoAluno.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nome} ({p.treinos.length} dias)
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleImportarTreino}
            disabled={!importAlunoId || !importPlanoId}
            className="w-full py-3 rounded-xl bg-[#00E620] text-black font-bold disabled:opacity-40 touch-manipulation"
          >
            Importar como Template
          </motion.button>
        </div>
      </Modal>

      {/* Confirmar Delete */}
      <Modal
        isOpen={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        title="Excluir Template"
      >
        <div className="space-y-4">
          <p className="text-gray-400 text-sm">
            Tem certeza que deseja excluir permanentemente este template? Esta ação não pode ser desfeita.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setConfirmDeleteId(null)}
              className="flex-1 py-3 rounded-xl border border-white/10 text-gray-400 font-medium touch-manipulation"
            >
              Cancelar
            </button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                if (confirmDeleteId) {
                  deleteTemplate(confirmDeleteId)
                  setConfirmDeleteId(null)
                  showToast('Template excluído!')
                }
              }}
              className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold touch-manipulation"
            >
              Excluir
            </motion.button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

function TemplateCard({
  template,
  onCopiar,
  onUsarAluno,
  onDeletar,
}: {
  template: TemplateComPasta
  onCopiar: () => void
  onUsarAluno: () => void
  onDeletar: () => void
}) {
  return (
    <motion.div
      whileHover={{ y: -3, boxShadow: '0 12px 40px rgba(0,230,32,0.12)' }}
      className="bg-[#161616] border border-white/5 rounded-2xl p-5 relative overflow-hidden group"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#00E620]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      <div className="relative space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-bold text-white truncate">{template.nome}</h3>
            <p className="text-gray-500 text-sm mt-0.5 line-clamp-2">{template.descricao}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                template.nivel === 'iniciante'
                  ? 'bg-[#00E620]/20 text-[#00E620]'
                  : template.nivel === 'intermediario'
                    ? 'bg-yellow-500/20 text-yellow-400'
                    : 'bg-red-500/20 text-red-400'
              }`}
            >
              {template.nivel}
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); onDeletar() }}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-600 hover:text-red-400 hover:bg-red-400/10 transition-colors touch-manipulation"
            >
              <Trash size={14} />
            </button>
          </div>
        </div>
        <div className="space-y-1">
          {template.treinos.map((t) => (
            <div key={t.letra} className="flex items-center gap-2 text-sm text-gray-400">
              <div className="w-6 h-6 rounded-lg bg-[#00E620]/20 text-[#00E620] text-xs font-bold flex items-center justify-center flex-shrink-0">
                {t.letra}
              </div>
              <span className="truncate">
                {t.nome} ({t.exercicios.length} exercícios)
              </span>
            </div>
          ))}
        </div>
        <div className="flex gap-2 pt-1">
          <button
            onClick={onCopiar}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#111111] border border-white/5 text-gray-400 text-sm hover:text-white hover:border-[#00E620]/30 transition-all touch-manipulation"
          >
            <Copy size={16} />
            Copiar
          </button>
          <button
            onClick={onUsarAluno}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#00E620] text-black font-bold text-sm touch-manipulation shadow-[0_0_15px_rgba(0,230,32,0.3)]"
          >
            <UserPlus size={16} />
            Usar para aluno
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// ── Página Principal ──
export default function Treinos() {
  const [aba, setAba] = useState<Aba>('treinos')
  const [criadorAberto, setCriadorAberto] = useState(false)
  const addPlano = usePlanoTreinoStore((s) => s.addPlano)

  const tabs: { id: Aba; label: string; icon: typeof Users }[] = [
    { id: 'treinos', label: 'Treinos dos Alunos', icon: Users },
    { id: 'biblioteca', label: 'Biblioteca', icon: BookOpen },
    { id: 'templates', label: 'Templates', icon: Copy },
  ]

  const handleSalvarPlano = (plano: PlanoTreinoCompleto) => {
    addPlano(plano)
    setCriadorAberto(false)
  }

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <GradienteHeader
          icone={Barbell}
          titulo="Treinos"
          subtitulo="Gerencie treinos, biblioteca de exercícios e templates"
        />

        <div className="flex gap-2 overflow-x-auto pb-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setAba(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm whitespace-nowrap transition-all border touch-manipulation ${
                aba === tab.id
                  ? 'bg-[#00E620] text-black font-bold border-[#00E620] shadow-[0_0_15px_rgba(0,230,32,0.3)]'
                  : 'bg-[#111111] border-white/5 text-gray-400 hover:text-white'
              }`}
            >
              <tab.icon size={18} weight={aba === tab.id ? 'fill' : 'regular'} />
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={aba}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {aba === 'treinos' && (
              <AbaTreinosAlunos onCriarPlano={() => setCriadorAberto(true)} />
            )}
            {aba === 'biblioteca' && <AbaBiblioteca />}
            {aba === 'templates' && <AbaTemplates />}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {criadorAberto && (
        <CriadorPlano
          onSalvar={handleSalvarPlano}
          onFechar={() => setCriadorAberto(false)}
        />
      )}
    </>
  )
}
