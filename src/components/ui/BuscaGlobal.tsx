import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MagnifyingGlass,
  X,
  User,
  ListChecks,
  CurrencyDollar,
  Funnel,
} from '@phosphor-icons/react'
import { useNavigate } from 'react-router-dom'
import { useAlunosStore } from '../../store/alunosStore'
import { useTarefasStore } from '../../store/tarefasStore'
import { useFinanceiroStore } from '../../store/financeiroStore'
import { useLeadsStore } from '../../store/leadsStore'

interface ResultadoBusca {
  id: string
  tipo: 'aluno' | 'tarefa' | 'venda' | 'lead'
  titulo: string
  subtitulo: string
  path: string
}

const tipoIcons = {
  aluno: User,
  tarefa: ListChecks,
  venda: CurrencyDollar,
  lead: Funnel,
}

const tipoLabels = {
  aluno: 'Aluno',
  tarefa: 'Tarefa',
  venda: 'Venda',
  lead: 'Lead',
}

export default function BuscaGlobal() {
  const [query, setQuery] = useState('')
  const [resultados, setResultados] = useState<ResultadoBusca[]>([])
  const [aberto, setAberto] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  const alunos = useAlunosStore((s) => s.alunos)
  const tarefas = useTarefasStore((s) => s.tarefas)
  const meses = useFinanceiroStore((s) => s.meses)
  const leads = useLeadsStore((s) => s.leads)

  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResultados([])
      return
    }

    const q = query.toLowerCase()
    const results: ResultadoBusca[] = []

    // Search alunos
    alunos
      .filter((a) => a.nome.toLowerCase().includes(q) || a.email?.toLowerCase().includes(q))
      .slice(0, 3)
      .forEach((a) =>
        results.push({
          id: a.id,
          tipo: 'aluno',
          titulo: a.nome,
          subtitulo: a.objetivo,
          path: `/alunos/${a.id}`,
        })
      )

    // Search tarefas
    tarefas
      .filter((t) => t.titulo.toLowerCase().includes(q))
      .slice(0, 3)
      .forEach((t) =>
        results.push({
          id: t.id,
          tipo: 'tarefa',
          titulo: t.titulo,
          subtitulo: t.prioridade,
          path: '/tarefas',
        })
      )

    // Search vendas
    meses.forEach((m) =>
      m.vendas
        .filter((v) => v.clienteNome.toLowerCase().includes(q))
        .slice(0, 2)
        .forEach((v) =>
          results.push({
            id: v.id,
            tipo: 'venda',
            titulo: v.clienteNome,
            subtitulo: `R$ ${v.valor}`,
            path: '/financeiro',
          })
        )
    )

    // Search leads
    leads
      .filter((l) => l.nome.toLowerCase().includes(q))
      .slice(0, 3)
      .forEach((l) =>
        results.push({
          id: l.id,
          tipo: 'lead',
          titulo: l.nome,
          subtitulo: l.origem,
          path: '/captacoes',
        })
      )

    setResultados(results.slice(0, 8))
  }, [query, alunos, tarefas, meses, leads])

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setAberto(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div className="relative" ref={containerRef}>
      <div
        className={`flex items-center gap-2 bg-[#141414] border rounded-xl px-3 py-2 transition-all ${
          aberto && query
            ? 'border-[#00E620] shadow-[0_0_10px_rgba(0,230,32,0.15)]'
            : 'border-white/5'
        }`}
      >
        <MagnifyingGlass size={16} className="text-gray-500 shrink-0" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setAberto(true)
          }}
          onFocus={() => setAberto(true)}
          placeholder="Buscar alunos, tarefas..."
          className="bg-transparent text-white placeholder:text-gray-600
                     outline-none text-sm w-36 focus:w-52 transition-all"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('')
              setResultados([])
            }}
          >
            <X size={14} className="text-gray-500 hover:text-white transition-colors" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {aberto && resultados.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="absolute top-11 left-0 w-72 bg-[#1A1A1A] border border-white/10
                       rounded-2xl shadow-xl overflow-hidden z-50"
          >
            {resultados.map((r) => {
              const Icon = tipoIcons[r.tipo]
              return (
                <button
                  key={`${r.tipo}-${r.id}`}
                  onClick={() => {
                    navigate(r.path)
                    setQuery('')
                    setAberto(false)
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5
                             hover:bg-white/5 transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[#00E620]">
                    <Icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{r.titulo}</p>
                    <p className="text-[10px] text-gray-500">{r.subtitulo}</p>
                  </div>
                  <span className="text-[10px] text-gray-600 px-1.5 py-0.5 rounded bg-white/5">
                    {tipoLabels[r.tipo]}
                  </span>
                </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
