import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Ruler,
  Plus,
  TrendDown,
  TrendUp,
  Equals,
} from '@phosphor-icons/react'
import BottomSheet from '../../components/ui/BottomSheet'
import { useMedidasStore } from '../../store/medidasStore'
import { useAuthStore } from '../../store/authStore'
import type { Circunferencias } from '../../types/medidas'

const CAMPOS_CIRCUNFERENCIA: { key: keyof Circunferencias; label: string }[] = [
  { key: 'peitoral', label: 'Peitoral' },
  { key: 'cintura', label: 'Cintura' },
  { key: 'abdomen', label: 'Abdômen' },
  { key: 'quadril', label: 'Quadril' },
  { key: 'bracoDireito', label: 'Braço Direito' },
  { key: 'bracoEsquerdo', label: 'Braço Esquerdo' },
  { key: 'coxaDireita', label: 'Coxa Direita' },
  { key: 'coxaEsquerda', label: 'Coxa Esquerda' },
  { key: 'panturrilhaDireita', label: 'Panturrilha Dir.' },
  { key: 'panturrilhaEsquerda', label: 'Panturrilha Esq.' },
]

export default function AlunoMedidas() {
  const [modalAberto, setModalAberto] = useState(false)
  const user = useAuthStore((s) => s.user)
  const alunoId = user?.id ?? ''
  const medidas = useMedidasStore((s) => s.getMedidasByAluno(alunoId))
  const addMedida = useMedidasStore((s) => s.addMedida)

  const [peso, setPeso] = useState('')
  const [altura, setAltura] = useState('')
  const [gordura, setGordura] = useState('')
  const [circunferencias, setCircunferencias] = useState<Circunferencias>({})

  const handleSalvar = () => {
    if (!peso) return
    addMedida({
      alunoId,
      data: new Date().toISOString(),
      peso: Number(peso),
      altura: altura ? Number(altura) : undefined,
      gorduraCorporal: gordura ? Number(gordura) : undefined,
      circunferencias,
      registradoPor: 'aluno',
    })
    setModalAberto(false)
    setPeso('')
    setAltura('')
    setGordura('')
    setCircunferencias({})
  }

  const ultima = medidas[0]
  const penultima = medidas[1]

  const diffPeso =
    ultima && penultima ? +(ultima.peso - penultima.peso).toFixed(1) : null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display text-white">Medidas</h1>
          <p className="text-gray-500 text-sm">Acompanhe sua evolução corporal</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setModalAberto(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#00E620] text-black font-bold text-sm shadow-[0_0_15px_rgba(0,230,32,0.3)] touch-manipulation"
        >
          <Plus size={18} weight="bold" />
          Nova Medida
        </motion.button>
      </div>

      {/* Current stats */}
      {ultima && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            label="Peso"
            valor={`${ultima.peso} kg`}
            diff={diffPeso}
          />
          <StatCard
            label="IMC"
            valor={ultima.imc ? `${ultima.imc}` : '—'}
          />
          <StatCard
            label="% Gordura"
            valor={ultima.gorduraCorporal ? `${ultima.gorduraCorporal}%` : '—'}
          />
          <StatCard
            label="Registros"
            valor={`${medidas.length}`}
          />
        </div>
      )}

      {/* History */}
      <div className="space-y-3">
        <h3 className="text-white font-bold">Histórico</h3>
        {medidas.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <Ruler size={48} className="mx-auto text-gray-600" />
            <p className="text-white font-bold">Nenhuma medida registrada</p>
            <p className="text-gray-500 text-sm">
              Registre suas medidas para acompanhar seu progresso.
            </p>
          </div>
        ) : (
          medidas.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#161616] border border-white/5 rounded-2xl p-4 space-y-2"
            >
              <div className="flex items-center justify-between">
                <p className="text-white font-medium text-sm">
                  {new Date(m.data).toLocaleDateString('pt-BR')}
                </p>
                <span className="text-[#00E620] font-bold">{m.peso} kg</span>
              </div>
              <div className="flex gap-3 flex-wrap text-xs text-gray-400">
                {m.imc && <span>IMC: {m.imc}</span>}
                {m.gorduraCorporal && <span>%G: {m.gorduraCorporal}%</span>}
                {Object.entries(m.circunferencias).map(
                  ([key, val]) =>
                    val && (
                      <span key={key}>
                        {CAMPOS_CIRCUNFERENCIA.find((c) => c.key === key)?.label}: {val}cm
                      </span>
                    )
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Modal Nova Medida */}
      <BottomSheet
        aberto={modalAberto}
        onFechar={() => setModalAberto(false)}
        titulo="Nova Medida"
        botaoPrimario={{
          label: 'Salvar Medida',
          disabled: !peso,
          onClick: handleSalvar,
        }}
      >
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-sm text-gray-400 font-medium">Peso (kg) *</label>
            <input
              type="number"
              step="0.1"
              value={peso}
              onChange={(e) => setPeso(e.target.value)}
              placeholder="70.5"
              className="w-full bg-[#111111] border border-white/10 rounded-xl py-3 px-4 text-white outline-none focus:border-[#00E620] transition-colors"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm text-gray-400 font-medium">Altura (m)</label>
            <input
              type="number"
              step="0.01"
              value={altura}
              onChange={(e) => setAltura(e.target.value)}
              placeholder="1.75"
              className="w-full bg-[#111111] border border-white/10 rounded-xl py-3 px-4 text-white outline-none focus:border-[#00E620] transition-colors"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm text-gray-400 font-medium">% Gordura Corporal</label>
          <input
            type="number"
            step="0.1"
            value={gordura}
            onChange={(e) => setGordura(e.target.value)}
            placeholder="15.0"
            className="w-full bg-[#111111] border border-white/10 rounded-xl py-3 px-4 text-white outline-none focus:border-[#00E620] transition-colors"
          />
        </div>

        <div className="space-y-2">
          <p className="text-sm text-gray-400 font-medium">Circunferências (cm)</p>
          <div className="grid grid-cols-2 gap-3">
            {CAMPOS_CIRCUNFERENCIA.map((campo) => (
              <div key={campo.key} className="space-y-1">
                <label className="text-xs text-gray-500">{campo.label}</label>
                <input
                  type="number"
                  step="0.1"
                  value={circunferencias[campo.key] ?? ''}
                  onChange={(e) =>
                    setCircunferencias((c) => ({
                      ...c,
                      [campo.key]: e.target.value ? Number(e.target.value) : undefined,
                    }))
                  }
                  placeholder="—"
                  className="w-full bg-[#111111] border border-white/10 rounded-xl py-2.5 px-3 text-white text-sm outline-none focus:border-[#00E620] transition-colors"
                />
              </div>
            ))}
          </div>
        </div>
      </BottomSheet>
    </motion.div>
  )
}

function StatCard({
  label,
  valor,
  diff,
}: {
  label: string
  valor: string
  diff?: number | null
}) {
  return (
    <div className="bg-[#161616] border border-white/5 rounded-2xl p-4">
      <p className="text-gray-500 text-xs uppercase tracking-wider">{label}</p>
      <p className="text-white font-bold text-xl mt-1">{valor}</p>
      {diff !== null && diff !== undefined && (
        <div
          className={`flex items-center gap-1 text-xs mt-1 ${
            diff < 0
              ? 'text-[#00E620]'
              : diff > 0
                ? 'text-red-400'
                : 'text-gray-500'
          }`}
        >
          {diff < 0 ? (
            <TrendDown size={12} />
          ) : diff > 0 ? (
            <TrendUp size={12} />
          ) : (
            <Equals size={12} />
          )}
          <span>
            {diff > 0 ? '+' : ''}
            {diff} kg
          </span>
        </div>
      )}
    </div>
  )
}
