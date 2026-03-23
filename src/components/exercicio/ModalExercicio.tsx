import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Barbell, X, YoutubeLogo, Link as LinkIcon, Image,
  Warning, ArrowSquareOut, Target, CheckCircle,
} from '@phosphor-icons/react'
import BottomSheet from '../ui/BottomSheet'
import type { ExercicioBiblioteca, GrupoMuscularBib } from '../../data/exerciciosBiblioteca'

type Equipamento = ExercicioBiblioteca['equipamento']
type Dificuldade = ExercicioBiblioteca['dificuldade']

interface ModalExercicioProps {
  aberto: boolean
  exercicio: ExercicioBiblioteca | null
  onFechar: () => void
  onSalvar: (dados: Partial<ExercicioBiblioteca> & { custom?: boolean }) => void
}

const GRUPOS = [
  { id: 'peito', emoji: '🫁', label: 'Peito' },
  { id: 'costas', emoji: '🔙', label: 'Costas' },
  { id: 'ombros', emoji: '🦴', label: 'Ombros' },
  { id: 'biceps', emoji: '💪', label: 'Bíceps' },
  { id: 'triceps', emoji: '🦾', label: 'Tríceps' },
  { id: 'quadriceps', emoji: '🦵', label: 'Quadríceps' },
  { id: 'posterior', emoji: '🦵', label: 'Posterior' },
  { id: 'gluteos', emoji: '🍑', label: 'Glúteos' },
  { id: 'panturrilha', emoji: '👟', label: 'Panturrilha' },
  { id: 'abdomen', emoji: '🎯', label: 'Abdômen' },
  { id: 'cardio', emoji: '❤️', label: 'Cardio' },
  { id: 'funcional', emoji: '⚡', label: 'Funcional' },
] as const

const EQUIPAMENTOS = [
  { id: 'barra', label: '🏋️ Barra' },
  { id: 'halteres', label: '💪 Halteres' },
  { id: 'maquina', label: '⚙️ Máquina' },
  { id: 'cabo', label: '🔗 Cabo' },
  { id: 'peso_corpo', label: '🧍 Peso corporal' },
  { id: 'outro', label: '📦 Outro' },
] as const

const DIFICULDADES = [
  { id: 'iniciante', label: 'Iniciante', emoji: '🟢' },
  { id: 'intermediario', label: 'Intermediário', emoji: '🟡' },
  { id: 'avancado', label: 'Avançado', emoji: '🔴' },
] as const

interface FormState {
  nome: string
  grupoMuscular: GrupoMuscularBib | ''
  equipamento: Equipamento
  dificuldade: Dificuldade
  instrucoes: string
  dicas: string
  errosComuns: string
  linkVideo: string
  gifUrl: string
  musculosSecund: string
}

const emptyForm: FormState = {
  nome: '', grupoMuscular: '', equipamento: 'outro',
  dificuldade: 'iniciante', instrucoes: '',
  dicas: '', errosComuns: '', linkVideo: '',
  gifUrl: '', musculosSecund: '',
}

export default function ModalExercicio({ aberto, exercicio, onFechar, onSalvar }: ModalExercicioProps) {
  const editando = exercicio !== null
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [form, setForm] = useState<FormState>(emptyForm)

  useEffect(() => {
    if (aberto) {
      if (exercicio) {
        setForm({
          nome: exercicio.nome ?? '',
          grupoMuscular: exercicio.grupoMuscular ?? '',
          equipamento: exercicio.equipamento ?? 'outro',
          dificuldade: exercicio.dificuldade ?? 'iniciante',
          instrucoes: (exercicio as any).instrucoes ?? '',
          dicas: (exercicio as any).dicas ?? '',
          errosComuns: (exercicio as any).errosComuns ?? '',
          linkVideo: exercicio.linkVideo ?? '',
          gifUrl: exercicio.gifUrl ?? '',
          musculosSecund: (exercicio as any).musculosSecundarios ?? '',
        })
      } else {
        setForm(emptyForm)
      }
      setErro('')
    }
  }, [aberto, exercicio])

  const set = (campo: keyof FormState, valor: string) =>
    setForm(f => ({ ...f, [campo]: valor }))

  const podeSalvar = form.nome.trim().length > 0 && form.grupoMuscular !== ''

  const handleSalvar = async () => {
    if (!podeSalvar) {
      setErro('Nome e grupo muscular são obrigatórios')
      return
    }
    setSalvando(true)
    setErro('')
    try {
      onSalvar({
        nome: form.nome.trim(),
        grupoMuscular: form.grupoMuscular as GrupoMuscularBib,
        equipamento: form.equipamento,
        dificuldade: form.dificuldade,
        instrucoes: form.instrucoes.trim() || undefined,
        linkVideo: form.linkVideo.trim() || undefined,
        gifUrl: form.gifUrl.trim() || undefined,
        custom: true,
      })
    } catch (err: any) {
      setErro(err.message ?? 'Erro ao salvar')
    } finally {
      setSalvando(false)
    }
  }

  const inputBase = 'flex-1 bg-transparent py-3.5 text-white placeholder:text-gray-600 outline-none text-base'

  return (
    <BottomSheet
      aberto={aberto}
      onFechar={onFechar}
      titulo={editando ? `Editar: ${exercicio?.nome}` : 'Novo Exercício'}
      botaoPrimario={{
        label: salvando ? 'Salvando...' : editando ? 'Salvar Alterações' : 'Criar Exercício',
        loading: salvando,
        disabled: !podeSalvar || salvando,
        onClick: handleSalvar,
      }}
      botaoSecundario={{ label: 'Cancelar', onClick: onFechar }}
    >
      <div className="space-y-5">
        {/* Nome */}
        <div className="space-y-1.5">
          <label className="text-sm text-gray-400 font-medium">Nome do exercício *</label>
          <div className={`flex items-center gap-2 border rounded-xl px-3 transition-all ${
            form.nome ? 'border-[#00E620]/60' : 'border-white/10'
          }`}>
            <Barbell size={18} className={form.nome ? 'text-[#00E620]' : 'text-gray-600'} />
            <input
              value={form.nome}
              onChange={e => { set('nome', e.target.value); setErro('') }}
              placeholder="Ex: Supino Reto com Barra"
              className={inputBase}
            />
            {form.nome && (
              <button onClick={() => set('nome', '')} className="touch-manipulation">
                <X size={16} className="text-gray-600" />
              </button>
            )}
          </div>
        </div>

        {/* Grupo Muscular */}
        <div className="space-y-2">
          <label className="text-sm text-gray-400 font-medium">Grupo muscular *</label>
          <div className="grid grid-cols-3 gap-2">
            {GRUPOS.map(g => (
              <motion.button key={g.id}
                whileTap={{ scale: 0.93 }}
                onClick={() => set('grupoMuscular', g.id)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs border transition-all touch-manipulation ${
                  form.grupoMuscular === g.id
                    ? 'border-[#00E620] bg-[#00E620]/10 text-[#00E620] font-bold'
                    : 'border-white/10 bg-[#111111] text-gray-400 hover:border-[#00E620]/30'
                }`}
              >
                <span className="text-base">{g.emoji}</span>
                <span className="truncate">{g.label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Equipamento */}
        <div className="space-y-2">
          <label className="text-sm text-gray-400 font-medium">Equipamento</label>
          <div className="flex flex-wrap gap-2">
            {EQUIPAMENTOS.map(eq => (
              <motion.button key={eq.id}
                whileTap={{ scale: 0.93 }}
                onClick={() => set('equipamento', eq.id)}
                className={`px-3 py-2 rounded-xl text-xs border transition-all touch-manipulation ${
                  form.equipamento === eq.id
                    ? 'border-[#00E620] bg-[#00E620]/10 text-[#00E620] font-bold'
                    : 'border-white/10 text-gray-400'
                }`}
              >
                {eq.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Dificuldade */}
        <div className="space-y-2">
          <label className="text-sm text-gray-400 font-medium">Dificuldade</label>
          <div className="grid grid-cols-3 gap-2">
            {DIFICULDADES.map(d => (
              <motion.button key={d.id}
                whileTap={{ scale: 0.93 }}
                onClick={() => set('dificuldade', d.id)}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs border transition-all touch-manipulation ${
                  form.dificuldade === d.id
                    ? 'border-[#00E620] bg-[#00E620]/10 text-[#00E620] font-bold'
                    : 'border-white/10 text-gray-400'
                }`}
              >
                <span>{d.emoji}</span>
                {d.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Link de Vídeo */}
        <div className="space-y-1.5">
          <label className="text-sm text-gray-400 font-medium flex items-center gap-2">
            <YoutubeLogo size={16} color="#FF4444" />
            Link de vídeo
            <span className="text-gray-600 font-normal">(YouTube, Shorts, Reels...)</span>
          </label>
          <div className={`flex items-center gap-2 border rounded-xl px-3 transition-all ${
            form.linkVideo ? 'border-red-500/40' : 'border-white/10'
          }`}>
            <LinkIcon size={18} className={form.linkVideo ? 'text-red-400' : 'text-gray-600'} />
            <input
              value={form.linkVideo}
              onChange={e => set('linkVideo', e.target.value)}
              placeholder="https://youtube.com/shorts/..."
              type="url"
              className={inputBase}
            />
            {form.linkVideo && (
              <div className="flex gap-1">
                <a href={form.linkVideo} target="_blank" rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-red-500/15 flex items-center justify-center touch-manipulation">
                  <ArrowSquareOut size={16} className="text-red-400" />
                </a>
                <button onClick={() => set('linkVideo', '')}
                  className="w-8 h-8 rounded-lg bg-[#111111] flex items-center justify-center touch-manipulation text-gray-600">
                  <X size={14} />
                </button>
              </div>
            )}
          </div>
          {form.linkVideo && (
            <p className="text-xs text-gray-600 flex items-center gap-1">
              <CheckCircle size={12} className="text-[#00E620]" />
              Link adicionado — o aluno poderá assistir no app
            </p>
          )}
        </div>

        {/* GIF */}
        <div className="space-y-1.5">
          <label className="text-sm text-gray-400 font-medium flex items-center gap-2">
            <Image size={16} className="text-gray-400" />
            GIF de demonstração
            <span className="text-gray-600 font-normal">(URL de imagem GIF)</span>
          </label>

          {form.gifUrl ? (
            <div className="space-y-2">
              <div className="rounded-xl overflow-hidden aspect-video bg-[#111111] border border-[#00E620]/30">
                <img src={form.gifUrl} alt="Preview GIF"
                  className="w-full h-full object-contain"
                  onError={() => set('gifUrl', '')} />
              </div>
              <div className="flex gap-2">
                <input
                  value={form.gifUrl}
                  onChange={e => set('gifUrl', e.target.value)}
                  placeholder="URL do GIF..."
                  className="flex-1 h-9 rounded-xl bg-[#111111] border border-[#00E620]/30 text-white text-sm px-3 outline-none focus:border-[#00E620] transition-colors" />
                <button onClick={() => set('gifUrl', '')}
                  className="h-9 px-3 rounded-xl bg-red-500/20 text-red-400 text-sm touch-manipulation border border-red-500/20">
                  Remover
                </button>
              </div>
            </div>
          ) : (
            <div className={`flex items-center gap-2 border rounded-xl px-3 transition-all border-white/10`}>
              <Image size={18} className="text-gray-600" />
              <input
                value={form.gifUrl}
                onChange={e => set('gifUrl', e.target.value)}
                placeholder="https://i.giphy.com/... ou qualquer URL de GIF"
                type="url"
                className={inputBase} />
            </div>
          )}
          <p className="text-xs text-gray-600">Cole a URL de qualquer GIF de demonstração do exercício</p>
        </div>

        {/* Instruções */}
        <div className="space-y-1.5">
          <label className="text-sm text-gray-400 font-medium">📋 Instruções de execução</label>
          <textarea
            value={form.instrucoes}
            onChange={e => set('instrucoes', e.target.value)}
            placeholder="Descreva o passo a passo da execução correta..."
            rows={4}
            className="w-full bg-[#111111] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 outline-none resize-none focus:border-[#00E620] transition-colors text-base leading-relaxed" />
          <p className="text-xs text-gray-600 text-right">{form.instrucoes.length} caracteres</p>
        </div>

        {/* Dicas */}
        <div className="space-y-1.5">
          <label className="text-sm text-gray-400 font-medium">💡 Dicas de execução</label>
          <textarea
            value={form.dicas}
            onChange={e => set('dicas', e.target.value)}
            placeholder="Dicas para sentir mais o músculo, melhorar a amplitude..."
            rows={3}
            className="w-full bg-[#111111] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 outline-none resize-none focus:border-[#00E620] transition-colors text-base" />
        </div>

        {/* Erros Comuns */}
        <div className="space-y-1.5">
          <label className="text-sm text-gray-400 font-medium">⚠️ Erros comuns para evitar</label>
          <textarea
            value={form.errosComuns}
            onChange={e => set('errosComuns', e.target.value)}
            placeholder="Erros frequentes que o aluno deve evitar..."
            rows={3}
            className="w-full bg-[#111111] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 outline-none resize-none focus:border-[#00E620] transition-colors text-base" />
        </div>

        {/* Músculos Secundários */}
        <div className="space-y-1.5">
          <label className="text-sm text-gray-400 font-medium">🎯 Músculos secundários trabalhados</label>
          <div className={`flex items-center gap-2 border rounded-xl px-3 transition-all ${
            form.musculosSecund ? 'border-[#00E620]/40' : 'border-white/10'
          }`}>
            <Target size={18} className="text-gray-600" />
            <input
              value={form.musculosSecund}
              onChange={e => set('musculosSecund', e.target.value)}
              placeholder="Ex: Ombro anterior, Abdômen"
              className={inputBase} />
          </div>
        </div>

        {/* Erro global */}
        <AnimatePresence>
          {erro && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5"
            >
              <Warning size={16} weight="fill" />
              {erro}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </BottomSheet>
  )
}
