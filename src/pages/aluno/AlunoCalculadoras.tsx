import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
// recharts removed — macros calculator removed

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 25 } },
}

type TabKey = 'imc' | 'tmb' | 'gordura'
type Sexo = 'masculino' | 'feminino'

interface IMCResult {
  value: number
  classification: string
  color: string
}

interface TMBResult {
  tmb: number
  gct: number
  emagrecer: number
  ganhar: number
}

const tabs: { key: TabKey; label: string }[] = [
  { key: 'imc', label: 'IMC' },
  { key: 'tmb', label: 'Calorias' },
  { key: 'gordura', label: '% Gordura' },
]

const activityLevels = [
  { emoji: '\u{1F6CB}\uFE0F', label: 'Sedentario', multiplier: 1.2 },
  { emoji: '\u{1F6B6}', label: 'Leve', multiplier: 1.375 },
  { emoji: '\u{1F3C3}', label: 'Moderado', multiplier: 1.55 },
  { emoji: '\u{1F4AA}', label: 'Intenso', multiplier: 1.725 },
  { emoji: '\u{1F525}', label: 'Muito intenso', multiplier: 1.9 },
]

function getIMCClassification(imc: number): { classification: string; color: string } {
  if (imc < 18.5) return { classification: 'Abaixo do peso', color: 'text-blue-400' }
  if (imc < 25) return { classification: 'Peso normal', color: 'text-[#00E620]' }
  if (imc < 30) return { classification: 'Sobrepeso', color: 'text-yellow-400' }
  if (imc < 35) return { classification: 'Obesidade Grau I', color: 'text-orange-400' }
  return { classification: 'Obesidade Grau II+', color: 'text-red-400' }
}

function getIMCBarColor(imc: number): string {
  if (imc < 18.5) return '#60A5FA'
  if (imc < 25) return '#00E620'
  if (imc < 30) return '#FACC15'
  if (imc < 35) return '#FB923C'
  return '#F87171'
}

function getIMCPercent(imc: number): number {
  const clamped = Math.max(10, Math.min(45, imc))
  return ((clamped - 10) / 35) * 100
}


const bodyFatRangesMen = [
  { label: '8-10%', midpoint: 9 },
  { label: '12-15%', midpoint: 13.5 },
  { label: '18-20%', midpoint: 19 },
  { label: '25-28%', midpoint: 26.5 },
  { label: '30-35%', midpoint: 32.5 },
  { label: '38%+', midpoint: 40 },
]

const bodyFatRangesWomen = [
  { label: '15-18%', midpoint: 16.5 },
  { label: '20-23%', midpoint: 21.5 },
  { label: '25-28%', midpoint: 26.5 },
  { label: '30-33%', midpoint: 31.5 },
  { label: '35-40%', midpoint: 37.5 },
  { label: '42%+', midpoint: 44 },
]

function getBodyFatClassification(midpoint: number, sexo: Sexo): { label: string; color: string } {
  if (sexo === 'masculino') {
    if (midpoint < 15) return { label: 'Atletico', color: 'text-[#00E620]' }
    if (midpoint <= 20) return { label: 'Fitness', color: 'text-blue-400' }
    if (midpoint <= 25) return { label: 'Saudavel', color: 'text-yellow-400' }
    return { label: 'Acima', color: 'text-red-400' }
  }
  if (midpoint < 22) return { label: 'Atletico', color: 'text-[#00E620]' }
  if (midpoint <= 28) return { label: 'Fitness', color: 'text-blue-400' }
  if (midpoint <= 32) return { label: 'Saudavel', color: 'text-yellow-400' }
  return { label: 'Acima', color: 'text-red-400' }
}

function getBodyFatBgColor(midpoint: number, sexo: Sexo): string {
  if (sexo === 'masculino') {
    if (midpoint < 15) return 'bg-green-500/15 border-green-500/30'
    if (midpoint <= 20) return 'bg-blue-500/15 border-blue-500/30'
    if (midpoint <= 25) return 'bg-yellow-500/15 border-yellow-500/30'
    return 'bg-red-500/15 border-red-500/30'
  }
  if (midpoint < 22) return 'bg-green-500/15 border-green-500/30'
  if (midpoint <= 28) return 'bg-blue-500/15 border-blue-500/30'
  if (midpoint <= 32) return 'bg-yellow-500/15 border-yellow-500/30'
  return 'bg-red-500/15 border-red-500/30'
}

// ==================== INPUT COMPONENT ====================

interface NumberInputProps {
  label: string
  value: string
  onChange: (val: string) => void
  placeholder?: string
  suffix?: string
}

function NumberInput({ label, value, onChange, placeholder, suffix }: NumberInputProps) {
  return (
    <div>
      <label className="block text-sm text-gray-400 mb-1.5">
        {label} {suffix && <span className="text-gray-600">({suffix})</span>}
      </label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? '0'}
        className="w-full bg-[#111111] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#00E620]/50 focus:ring-2 focus:ring-[#00E620]/20"
      />
    </div>
  )
}

// ==================== TAB 1: IMC ====================

function TabIMC() {
  const [peso, setPeso] = useState('')
  const [altura, setAltura] = useState('')
  const [result, setResult] = useState<IMCResult | null>(null)

  const handleCalc = () => {
    const p = parseFloat(peso)
    const a = parseFloat(altura)
    if (!p || !a || a <= 0) return
    const alturaM = a / 100
    const imc = p / (alturaM * alturaM)
    const { classification, color } = getIMCClassification(imc)
    setResult({ value: imc, classification, color })
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <NumberInput label="Peso" suffix="kg" value={peso} onChange={setPeso} />
        <NumberInput label="Altura" suffix="cm" value={altura} onChange={setAltura} />
      </div>

      <button
        onClick={handleCalc}
        className="bg-[#00E620] text-black font-semibold rounded-xl px-6 py-3 hover:bg-[#00E620]/90 transition-colors text-sm"
      >
        Calcular IMC
      </button>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-[#111111] border border-white/5 rounded-xl p-6 space-y-4"
          >
            <div className="text-center">
              <span className="font-display text-5xl text-white tracking-wider">
                {result.value.toFixed(1)}
              </span>
              <div className="mt-3">
                <span
                  className={`inline-flex px-3 py-1 rounded-xl text-sm font-semibold ${result.color}`}
                  style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                >
                  {result.classification}
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="space-y-2">
              <div
                className="relative w-full h-3 rounded-full overflow-hidden"
                style={{
                  background:
                    'linear-gradient(to right, #60A5FA 0%, #00E620 25%, #FACC15 50%, #FB923C 70%, #F87171 100%)',
                }}
              >
                <motion.div
                  initial={{ left: '0%' }}
                  animate={{ left: `${getIMCPercent(result.value)}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded-full border-2 border-white shadow-lg"
                  style={{ backgroundColor: getIMCBarColor(result.value) }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-600">
                <span>10</span>
                <span>18.5</span>
                <span>25</span>
                <span>30</span>
                <span>35</span>
                <span>45</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ==================== TAB 2: TMB/GCT ====================

function TabTMB() {
  const [peso, setPeso] = useState('')
  const [altura, setAltura] = useState('')
  const [idade, setIdade] = useState('')
  const [sexo, setSexo] = useState<Sexo>('masculino')
  const [activityIdx, setActivityIdx] = useState(0)
  const [result, setResult] = useState<TMBResult | null>(null)

  const handleCalc = () => {
    const p = parseFloat(peso)
    const a = parseFloat(altura)
    const i = parseFloat(idade)
    if (!p || !a || !i) return

    let tmb: number
    if (sexo === 'masculino') {
      tmb = 10 * p + 6.25 * a - 5 * i + 5
    } else {
      tmb = 10 * p + 6.25 * a - 5 * i - 161
    }

    const gct = tmb * activityLevels[activityIdx].multiplier
    setResult({
      tmb: Math.round(tmb),
      gct: Math.round(gct),
      emagrecer: Math.round(gct - 500),
      ganhar: Math.round(gct + 300),
    })
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <NumberInput label="Peso" suffix="kg" value={peso} onChange={setPeso} />
        <NumberInput label="Altura" suffix="cm" value={altura} onChange={setAltura} />
        <NumberInput label="Idade" suffix="anos" value={idade} onChange={setIdade} />
      </div>

      {/* Sexo */}
      <div>
        <label className="block text-sm text-gray-400 mb-1.5">Sexo</label>
        <div className="flex gap-2">
          {(['masculino', 'feminino'] as Sexo[]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSexo(s)}
              className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                sexo === s
                  ? 'bg-[#00E620] text-black'
                  : 'bg-[#111111] text-gray-400 border border-white/10 hover:text-white'
              }`}
            >
              {s === 'masculino' ? 'Masculino' : 'Feminino'}
            </button>
          ))}
        </div>
      </div>

      {/* Activity Level */}
      <div>
        <label className="block text-sm text-gray-400 mb-1.5">Nivel de atividade</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {activityLevels.map((level, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActivityIdx(idx)}
              className={`px-3 py-3 rounded-xl text-sm font-medium transition-all text-center ${
                activityIdx === idx
                  ? 'bg-[#00E620] text-black'
                  : 'bg-[#111111] text-gray-400 border border-white/10 hover:text-white'
              }`}
            >
              <span className="text-lg block mb-1">{level.emoji}</span>
              {level.label}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleCalc}
        className="bg-[#00E620] text-black font-semibold rounded-xl px-6 py-3 hover:bg-[#00E620]/90 transition-colors text-sm"
      >
        Calcular
      </button>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div className="bg-[#111111] border border-white/5 rounded-xl p-4">
              <p className="text-sm text-gray-400 mb-1">TMB</p>
              <span className="font-display text-3xl text-white tracking-wider">{result.tmb}</span>
              <span className="text-sm text-gray-500 ml-2">kcal</span>
              <p className="text-xs text-gray-600 mt-1">Metabolismo basal</p>
            </div>
            <div className="bg-[#111111] border border-[#00E620]/20 rounded-xl p-4">
              <p className="text-sm text-gray-400 mb-1">GCT</p>
              <span className="font-display text-3xl text-[#00E620] tracking-wider">{result.gct}</span>
              <span className="text-sm text-gray-500 ml-2">kcal</span>
              <p className="text-xs text-gray-600 mt-1">Gasto total diario</p>
            </div>
            <div className="bg-[#111111] border border-white/5 rounded-xl p-4">
              <p className="text-sm text-gray-400 mb-1">Meta emagrecer</p>
              <span className="font-display text-3xl text-yellow-400 tracking-wider">
                {result.emagrecer}
              </span>
              <span className="text-sm text-gray-500 ml-2">kcal</span>
              <p className="text-xs text-gray-600 mt-1">GCT - 500 kcal</p>
            </div>
            <div className="bg-[#111111] border border-white/5 rounded-xl p-4">
              <p className="text-sm text-gray-400 mb-1">Meta ganhar massa</p>
              <span className="font-display text-3xl text-blue-400 tracking-wider">{result.ganhar}</span>
              <span className="text-sm text-gray-500 ml-2">kcal</span>
              <p className="text-xs text-gray-600 mt-1">GCT + 300 kcal</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ==================== TAB 3: % GORDURA ====================

function TabGordura() {
  const [sexo, setSexo] = useState<Sexo>('masculino')
  const [selected, setSelected] = useState<number | null>(null)

  const ranges = sexo === 'masculino' ? bodyFatRangesMen : bodyFatRangesWomen

  const selectedRange = selected !== null ? ranges[selected] : null
  const classification = selectedRange
    ? getBodyFatClassification(selectedRange.midpoint, sexo)
    : null

  return (
    <div className="space-y-6">
      {/* Sexo toggle */}
      <div>
        <label className="block text-sm text-gray-400 mb-1.5">Sexo</label>
        <div className="flex gap-2">
          {(['masculino', 'feminino'] as Sexo[]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setSexo(s)
                setSelected(null)
              }}
              className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                sexo === s
                  ? 'bg-[#00E620] text-black'
                  : 'bg-[#111111] text-gray-400 border border-white/10 hover:text-white'
              }`}
            >
              {s === 'masculino' ? 'Masculino' : 'Feminino'}
            </button>
          ))}
        </div>
      </div>

      {/* Body fat cards grid */}
      <div>
        <label className="block text-sm text-gray-400 mb-3">
          Selecione a faixa que mais se aproxima
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {ranges.map((range, idx) => {
            const isSelected = selected === idx
            const bgColor = getBodyFatBgColor(range.midpoint, sexo)
            const cls = getBodyFatClassification(range.midpoint, sexo)
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setSelected(idx)}
                className={`relative rounded-xl p-4 transition-all border text-center ${
                  isSelected
                    ? `${bgColor} ring-2 ring-white/20`
                    : 'bg-[#111111] border-white/5 hover:border-white/10'
                }`}
              >
                <span className="font-display text-2xl text-white tracking-wider block mb-2">
                  {range.label}
                </span>
                <span className={`text-xs font-medium ${cls.color}`}>{cls.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Result */}
      <AnimatePresence>
        {selectedRange && classification && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-[#111111] border border-white/5 rounded-xl p-6 text-center space-y-3"
          >
            <p className="text-sm text-gray-400">Faixa selecionada</p>
            <span className="font-display text-4xl text-white tracking-wider block">
              {selectedRange.label}
            </span>
            <span
              className={`inline-flex px-4 py-1.5 rounded-xl text-sm font-semibold ${classification.color}`}
              style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
            >
              {classification.label}
            </span>
            <p className="text-xs text-gray-600">
              {sexo === 'masculino' ? 'Referencia masculina' : 'Referencia feminina'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ==================== MAIN PAGE ====================

export default function AlunoCalculadoras() {
  const [activeTab, setActiveTab] = useState<TabKey>('imc')

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={cardVariants}>
        <h1 className="font-display text-2xl md:text-3xl text-white tracking-wider">
          CALCULADORAS
        </h1>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={cardVariants} className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-[#00E620] text-black'
                : 'bg-[#111111] text-gray-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </motion.div>

      {/* Content */}
      <motion.div variants={cardVariants}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'imc' && <TabIMC />}
            {activeTab === 'tmb' && <TabTMB />}
            {activeTab === 'gordura' && <TabGordura />}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}
