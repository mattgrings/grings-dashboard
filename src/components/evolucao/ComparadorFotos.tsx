import { useState, useRef, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowsHorizontal, Camera, X } from '@phosphor-icons/react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// ==================== TYPES ====================

interface FotoComparacao {
  url: string
  data: Date | string
  legenda?: string
  peso?: number
}

interface ComparadorFotosProps {
  fotoAntes: FotoComparacao
  fotoDepois: FotoComparacao
}

interface FotoSelecionavel {
  id: string
  url: string
  data: Date | string
  legenda?: string
  tipo?: string
}

interface SeletorComparacaoProps {
  fotos: FotoSelecionavel[]
  onCompare: (antes: FotoSelecionavel, depois: FotoSelecionavel) => void
}

// ==================== HELPERS ====================

function formatDate(date: Date | string): string {
  return format(new Date(date), 'dd/MM/yyyy', { locale: ptBR })
}

// ==================== COMPARADOR FOTOS ====================

export default function ComparadorFotos({ fotoAntes, fotoDepois }: ComparadorFotosProps) {
  const [sliderPos, setSliderPos] = useState(50)
  const containerRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)

  const handleMove = useCallback((clientX: number) => {
    if (!isDragging.current) return
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    const pos = ((clientX - rect.left) / rect.width) * 100
    setSliderPos(Math.min(Math.max(pos, 0), 100))
  }, [])

  const handleStart = useCallback(() => {
    isDragging.current = true
  }, [])

  const handleEnd = useCallback(() => {
    isDragging.current = false
  }, [])

  // Mouse events
  const handleMouseDown = useCallback(() => {
    handleStart()
  }, [handleStart])

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      handleMove(e.clientX)
    },
    [handleMove]
  )

  const handleMouseUp = useCallback(() => {
    handleEnd()
  }, [handleEnd])

  // Touch events
  const handleTouchStart = useCallback(() => {
    handleStart()
  }, [handleStart])

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handleMove(e.touches[0].clientX)
      }
    },
    [handleMove]
  )

  const handleTouchEnd = useCallback(() => {
    handleEnd()
  }, [handleEnd])

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('touchmove', handleTouchMove, { passive: true })
    document.addEventListener('touchend', handleTouchEnd)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd])

  const hasAntesFoto = fotoAntes.url !== ''
  const hasDepoisFoto = fotoDepois.url !== ''
  const hasBothPeso =
    fotoAntes.peso !== undefined &&
    fotoAntes.peso !== null &&
    fotoDepois.peso !== undefined &&
    fotoDepois.peso !== null
  const variacao = hasBothPeso ? fotoDepois.peso! - fotoAntes.peso! : 0

  return (
    <div className="space-y-4">
      {/* Comparison Slider */}
      <div
        ref={containerRef}
        className="relative bg-[#111111] border border-white/5 rounded-2xl overflow-hidden aspect-[3/4] cursor-ew-resize select-none"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {/* ANTES image (full background) */}
        {hasAntesFoto ? (
          <img
            src={fotoAntes.url}
            alt={fotoAntes.legenda || 'Antes'}
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            draggable={false}
          />
        ) : (
          <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-blue-900/30 to-blue-800/10 flex flex-col items-center justify-center pointer-events-none">
            <Camera size={48} className="text-blue-400/40 mb-2" />
            <span className="text-xs text-blue-400/60 font-medium">Foto Antes</span>
          </div>
        )}

        {/* DEPOIS image (clipped) */}
        <div
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
        >
          {hasDepoisFoto ? (
            <img
              src={fotoDepois.url}
              alt={fotoDepois.legenda || 'Depois'}
              className="absolute inset-0 w-full h-full object-cover"
              draggable={false}
            />
          ) : (
            <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-green-900/30 to-green-800/10 flex flex-col items-center justify-center">
              <Camera size={48} className="text-[#00E620]/40 mb-2" />
              <span className="text-xs text-[#00E620]/60 font-medium">Foto Depois</span>
            </div>
          )}
        </div>

        {/* Vertical divider line */}
        <div
          className="absolute top-0 bottom-0 w-[2px] bg-[#00E620] pointer-events-none z-10"
          style={{ left: `${sliderPos}%`, transform: 'translateX(-50%)' }}
        />

        {/* Circular handle */}
        <div
          className="absolute top-1/2 z-20 w-10 h-10 rounded-full bg-[#00E620] flex items-center justify-center shadow-[0_0_15px_rgba(0,230,32,0.4)] pointer-events-none"
          style={{
            left: `${sliderPos}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <ArrowsHorizontal size={20} weight="bold" className="text-black" />
        </div>

        {/* Date labels at top */}
        <div className="absolute top-3 left-3 z-10">
          <span className="px-2 py-1 rounded-md bg-black/60 backdrop-blur-sm text-[10px] text-gray-300 font-medium">
            {formatDate(fotoAntes.data)}
          </span>
        </div>
        <div className="absolute top-3 right-3 z-10">
          <span className="px-2 py-1 rounded-md bg-black/60 backdrop-blur-sm text-[10px] text-gray-300 font-medium">
            {formatDate(fotoDepois.data)}
          </span>
        </div>

        {/* ANTES / DEPOIS labels at bottom */}
        <div className="absolute bottom-3 left-3 z-10">
          <span className="px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-sm text-xs text-blue-400 font-semibold uppercase tracking-wider">
            Antes
          </span>
        </div>
        <div className="absolute bottom-3 right-3 z-10">
          <span className="px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-sm text-xs text-[#00E620] font-semibold uppercase tracking-wider">
            Depois
          </span>
        </div>
      </div>

      {/* Stat cards (only if both have peso) */}
      {hasBothPeso && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-surface/50 border border-white/5 rounded-xl p-3 text-center">
            <span className="text-[10px] text-gray-500 block mb-1">Peso antes</span>
            <span className="text-lg font-display text-white">{fotoAntes.peso} kg</span>
          </div>
          <div
            className={`border rounded-xl p-3 text-center ${
              variacao < 0
                ? 'bg-green-500/5 border-green-500/10'
                : variacao > 0
                ? 'bg-red-500/5 border-red-500/10'
                : 'bg-surface/50 border-white/5'
            }`}
          >
            <span className="text-[10px] text-gray-500 block mb-1">Variacao</span>
            <span
              className={`text-lg font-display ${
                variacao < 0 ? 'text-[#00E620]' : variacao > 0 ? 'text-red-400' : 'text-gray-400'
              }`}
            >
              {variacao > 0 ? '+' : ''}
              {variacao.toFixed(1)} kg
            </span>
          </div>
          <div className="bg-surface/50 border border-white/5 rounded-xl p-3 text-center">
            <span className="text-[10px] text-gray-500 block mb-1">Peso atual</span>
            <span className="text-lg font-display text-white">{fotoDepois.peso} kg</span>
          </div>
        </div>
      )}
    </div>
  )
}

// ==================== SELETOR COMPARACAO ====================

export function SeletorComparacao({ fotos, onCompare }: SeletorComparacaoProps) {
  const [antes, setAntes] = useState<FotoSelecionavel | null>(null)
  const [depois, setDepois] = useState<FotoSelecionavel | null>(null)

  const step = !antes ? 1 : !depois ? 2 : 3

  const handleSelect = (foto: FotoSelecionavel) => {
    if (!antes) {
      setAntes(foto)
    } else if (!depois) {
      if (foto.id === antes.id) return
      setDepois(foto)
    }
  }

  const handleClear = () => {
    setAntes(null)
    setDepois(null)
  }

  const handleCompare = () => {
    if (antes && depois) {
      onCompare(antes, depois)
    }
  }

  const getStepLabel = (): string => {
    if (step === 1) return '1. Selecione ANTES'
    if (step === 2) return '2. Selecione DEPOIS'
    return 'Comparar!'
  }

  return (
    <div className="space-y-4">
      {/* Step indicator */}
      <div className="flex items-center justify-between">
        <motion.span
          key={step}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm font-medium text-white"
        >
          {getStepLabel()}
        </motion.span>
        {(antes || depois) && (
          <button
            onClick={handleClear}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            <X size={12} />
            Limpar
          </button>
        )}
      </div>

      {/* Step dots */}
      <div className="flex items-center gap-2">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-1 flex-1 rounded-full transition-colors ${
              s <= step ? 'bg-[#00E620]' : 'bg-white/10'
            }`}
          />
        ))}
      </div>

      {/* Photo grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {fotos.map((foto) => {
          const isAntes = antes?.id === foto.id
          const isDepois = depois?.id === foto.id
          const isSelected = isAntes || isDepois
          const isDisabled = step === 3 && !isSelected

          return (
            <motion.button
              key={foto.id}
              whileHover={{ scale: isDisabled ? 1 : 1.02 }}
              whileTap={{ scale: isDisabled ? 1 : 0.98 }}
              onClick={() => !isDisabled && handleSelect(foto)}
              className={`relative rounded-xl overflow-hidden border-2 transition-all text-left ${
                isAntes
                  ? 'border-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.2)]'
                  : isDepois
                  ? 'border-[#00E620] shadow-[0_0_10px_rgba(0,230,32,0.2)]'
                  : isDisabled
                  ? 'border-white/5 opacity-40 cursor-not-allowed'
                  : 'border-white/5 hover:border-white/20 cursor-pointer'
              }`}
              disabled={isDisabled}
            >
              {/* Photo placeholder */}
              <div className="aspect-[3/4] bg-gradient-to-br from-white/[0.04] to-white/[0.01] flex flex-col items-center justify-center p-3">
                {foto.url ? (
                  <img
                    src={foto.url}
                    alt={foto.legenda || 'Foto'}
                    className="absolute inset-0 w-full h-full object-cover"
                    draggable={false}
                  />
                ) : (
                  <>
                    <Camera size={28} className="text-white/20 mb-2" />
                    <span className="text-[10px] text-gray-500 text-center leading-tight">
                      {formatDate(foto.data)}
                    </span>
                    {foto.legenda && (
                      <span className="text-[10px] text-gray-600 text-center mt-0.5 line-clamp-2">
                        {foto.legenda}
                      </span>
                    )}
                  </>
                )}
              </div>

              {/* Bottom info bar */}
              <div className="px-2.5 py-2 bg-black/40 backdrop-blur-sm">
                <p className="text-[10px] text-gray-400 truncate">
                  {foto.legenda || foto.tipo || 'Sem legenda'}
                </p>
                <p className="text-[9px] text-gray-600">{formatDate(foto.data)}</p>
              </div>

              {/* Selection badge */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    isAntes
                      ? 'bg-blue-400 text-black'
                      : 'bg-[#00E620] text-black'
                  }`}
                >
                  {isAntes ? 'Antes' : 'Depois'}
                </motion.div>
              )}
            </motion.button>
          )
        })}
      </div>

      {/* Compare button */}
      {step === 3 && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={handleCompare}
          className="w-full py-3 rounded-xl bg-[#00E620] text-black font-semibold text-sm hover:brightness-110 transition-all shadow-[0_0_20px_rgba(0,230,32,0.3)]"
        >
          Comparar Fotos
        </motion.button>
      )}
    </div>
  )
}
