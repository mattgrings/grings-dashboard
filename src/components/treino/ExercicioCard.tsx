import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Pencil,
  Trash,
  YoutubeLogo,
  Link as LinkIcon,
  X,
} from '@phosphor-icons/react'
import type { ExercicioBiblioteca, GrupoMuscularBib } from '../../data/exerciciosBiblioteca'

const grupoCorMap: Record<GrupoMuscularBib, string> = {
  peito: '#FF6B6B',
  costas: '#4ECDC4',
  ombros: '#FFE66D',
  biceps: '#A8E6CF',
  triceps: '#FF8B94',
  abdomen: '#96CEB4',
  quadriceps: '#88D8B0',
  posterior: '#FFAAA5',
  gluteos: '#FF8C94',
  panturrilha: '#A8D8EA',
  antebraco: '#FFEAA7',
  cardio: '#00E620',
  funcional: '#DDA0DD',
}

interface ExercicioCardProps {
  exercicio: ExercicioBiblioteca
  onEditar?: () => void
  onRemover?: () => void
  compact?: boolean
}

function ModalVideo({
  url,
  titulo,
  onFechar,
}: {
  url: string
  titulo: string
  onFechar: () => void
}) {
  const embedUrl = url
    .replace('youtube.com/shorts/', 'youtube.com/embed/')
    .replace('youtu.be/', 'youtube.com/embed/')
    .replace('watch?v=', 'embed/')

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
      onClick={onFechar}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-[#161616] rounded-2xl overflow-hidden w-full max-w-sm border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <h3 className="font-bold text-white text-sm truncate">{titulo}</h3>
          <button onClick={onFechar} className="touch-manipulation ml-2 flex-shrink-0">
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        <div className="aspect-[9/16] w-full">
          <iframe
            src={embedUrl}
            className="w-full h-full"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media"
          />
        </div>
      </motion.div>
    </div>
  )
}

export default function ExercicioCard({
  exercicio,
  onEditar,
  onRemover,
  compact = false,
}: ExercicioCardProps) {
  const [videoAberto, setVideoAberto] = useState(false)
  const cor = grupoCorMap[exercicio.grupoMuscular] ?? '#00E620'

  return (
    <>
      <motion.div
        whileHover={{ y: -2, boxShadow: `0 8px 30px ${cor}20` }}
        className="bg-[#161616] border border-white/5 rounded-2xl p-4 transition-all relative overflow-hidden"
      >
        {/* Colored left bar */}
        <div
          className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
          style={{ background: cor }}
        />

        <div className="pl-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-white text-base leading-tight">
                {exercicio.nome}
              </h3>
              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ background: `${cor}20`, color: cor }}
                >
                  {exercicio.grupoMuscular.replace('_', ' ')}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#111111] text-gray-400 capitalize">
                  {exercicio.equipamento.replace('_', ' ')}
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    exercicio.dificuldade === 'iniciante'
                      ? 'bg-[#00E620]/20 text-[#00E620]'
                      : exercicio.dificuldade === 'intermediario'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-red-500/20 text-red-400'
                  }`}
                >
                  {exercicio.dificuldade}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-1 flex-shrink-0">
              {exercicio.linkVideo && (
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setVideoAberto(true)}
                  className="w-9 h-9 rounded-xl bg-red-500/20 border border-red-500/30
                             flex items-center justify-center text-red-400
                             hover:bg-red-500/30 transition-all touch-manipulation"
                >
                  <YoutubeLogo size={20} weight="fill" />
                </motion.button>
              )}
              {onEditar && (
                <button
                  onClick={onEditar}
                  className="w-9 h-9 rounded-xl bg-[#111111] flex items-center justify-center
                             text-gray-500 hover:text-[#00E620] transition-colors touch-manipulation"
                >
                  <Pencil size={18} />
                </button>
              )}
              {onRemover && (
                <button
                  onClick={onRemover}
                  className="w-9 h-9 rounded-xl bg-[#111111] flex items-center justify-center
                             text-gray-500 hover:text-red-400 transition-colors touch-manipulation"
                >
                  <Trash size={18} />
                </button>
              )}
            </div>
          </div>

          {/* Add video link hint */}
          {!compact && !exercicio.linkVideo && onEditar && (
            <button
              onClick={onEditar}
              className="mt-3 flex items-center gap-2 text-xs text-gray-600
                         hover:text-[#00E620] transition-colors touch-manipulation"
            >
              <LinkIcon size={14} />
              Adicionar vídeo de referência
            </button>
          )}
        </div>
      </motion.div>

      {/* Video modal */}
      {videoAberto && exercicio.linkVideo && (
        <ModalVideo
          url={exercicio.linkVideo}
          titulo={exercicio.nome}
          onFechar={() => setVideoAberto(false)}
        />
      )}
    </>
  )
}
