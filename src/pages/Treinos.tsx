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
} from '@phosphor-icons/react'
import GradienteHeader from '../components/ui/GradienteHeader'
import ExercicioCard from '../components/treino/ExercicioCard'
import {
  EXERCICIOS_BIBLIOTECA,
  GRUPOS_MUSCULARES,
  type GrupoMuscularBib,
} from '../data/exerciciosBiblioteca'
import { TEMPLATES_TREINO, type TemplateTreino } from '../data/templatesTreino'
import { useTreinoStore } from '../store/treinoStore'
import { useAlunosStore } from '../store/alunosStore'

type Aba = 'treinos' | 'biblioteca' | 'templates'

// ── Aba Treinos dos Alunos ──
function AbaTreinosAlunos() {
  const planos = useTreinoStore((s) => s.planos)
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
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#00E620] text-black
                     font-bold text-sm shadow-[0_0_15px_rgba(0,230,32,0.3)] touch-manipulation"
        >
          <Plus size={18} weight="bold" />
          Novo Treino
        </motion.button>
      </div>

      {planos.length === 0 ? (
        <div className="text-center py-16 space-y-4">
          <div className="w-20 h-20 rounded-2xl bg-[#00E620]/10 flex items-center justify-center mx-auto">
            <Barbell size={40} className="text-[#00E620]" />
          </div>
          <div>
            <p className="text-white font-bold text-lg">Nenhum treino criado</p>
            <p className="text-gray-500 text-sm mt-1">
              Crie treinos para seus {alunosAtivos.length} aluno(s) ativo(s) ou use um template pronto.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {planos.map((plano) => {
            const aluno = alunos.find((a) => a.id === plano.alunoId)
            return (
              <motion.div
                key={plano.id}
                whileHover={{ y: -2 }}
                className="bg-[#161616] border border-white/5 rounded-2xl p-5 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-white font-bold">{plano.nome}</h3>
                    <p className="text-gray-500 text-sm mt-0.5">
                      {aluno?.nome ?? 'Aluno'} · {plano.exercicios.length} exercícios
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      plano.ativo
                        ? 'bg-[#00E620]/20 text-[#00E620]'
                        : 'bg-gray-700/50 text-gray-400'
                    }`}
                  >
                    {plano.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                {plano.descricao && (
                  <p className="text-gray-400 text-sm">{plano.descricao}</p>
                )}
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
      {/* Search */}
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

      {/* Group filter chips */}
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

      {/* Exercise list */}
      <div className="space-y-3">
        {filtrados.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            Nenhum exercício encontrado.
          </p>
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

// ── Aba Templates ──
function AbaTemplates() {
  return (
    <div className="space-y-4">
      <p className="text-gray-400 text-sm">
        Templates prontos para copiar e usar com seus alunos.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {TEMPLATES_TREINO.map((template) => (
          <TemplateCard key={template.id} template={template} />
        ))}
      </div>
    </div>
  )
}

function TemplateCard({ template }: { template: TemplateTreino }) {
  return (
    <motion.div
      whileHover={{ y: -3, boxShadow: '0 12px 40px rgba(0,230,32,0.12)' }}
      className="bg-[#161616] border border-white/5 rounded-2xl p-5 relative overflow-hidden group"
    >
      {/* Decorative gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#00E620]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      <div className="relative space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-bold text-white">{template.nome}</h3>
            <p className="text-gray-500 text-sm mt-0.5">{template.descricao}</p>
          </div>
          <span
            className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ${
              template.nivel === 'iniciante'
                ? 'bg-[#00E620]/20 text-[#00E620]'
                : template.nivel === 'intermediario'
                  ? 'bg-yellow-500/20 text-yellow-400'
                  : 'bg-red-500/20 text-red-400'
            }`}
          >
            {template.nivel}
          </span>
        </div>

        {/* Treinos list */}
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

        {/* Buttons */}
        <div className="flex gap-2 pt-1">
          <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#111111] border border-white/5 text-gray-400 text-sm hover:text-white hover:border-[#00E620]/30 transition-all touch-manipulation">
            <Copy size={16} />
            Copiar
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#00E620] text-black font-bold text-sm touch-manipulation shadow-[0_0_15px_rgba(0,230,32,0.3)]">
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

  const tabs: { id: Aba; label: string; icon: typeof Users }[] = [
    { id: 'treinos', label: 'Treinos dos Alunos', icon: Users },
    { id: 'biblioteca', label: 'Biblioteca', icon: BookOpen },
    { id: 'templates', label: 'Templates', icon: Copy },
  ]

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <GradienteHeader
        icone={Barbell}
        titulo="Treinos"
        subtitulo="Gerencie treinos, biblioteca de exercícios e templates"
      />

      {/* Tabs */}
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

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={aba}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          {aba === 'treinos' && <AbaTreinosAlunos />}
          {aba === 'biblioteca' && <AbaBiblioteca />}
          {aba === 'templates' && <AbaTemplates />}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}
