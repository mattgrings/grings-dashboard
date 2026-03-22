import type { Icon as PhosphorIcon } from '@phosphor-icons/react'

interface GradienteHeaderProps {
  icone: PhosphorIcon
  titulo: string
  subtitulo?: string
  corIcone?: string
}

export default function GradienteHeader({
  icone: Icone,
  titulo,
  subtitulo,
  corIcone = '#00E620',
}: GradienteHeaderProps) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl p-6 mb-6 border border-white/5"
      style={{
        background: `linear-gradient(135deg, ${corIcone}18 0%, ${corIcone}08 40%, transparent 100%)`,
      }}
    >
      {/* Decorative orbs */}
      <div
        className="absolute -top-8 -right-8 w-32 h-32 rounded-full blur-3xl"
        style={{ background: `${corIcone}15` }}
      />
      <div
        className="absolute -bottom-4 left-12 w-20 h-20 rounded-full blur-2xl"
        style={{ background: `${corIcone}08` }}
      />

      <div className="relative flex items-center gap-4">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{
            background: `linear-gradient(135deg, ${corIcone}30, ${corIcone}10)`,
            border: `1px solid ${corIcone}30`,
            boxShadow: `0 0 20px ${corIcone}20`,
          }}
        >
          <Icone size={28} color={corIcone} weight="fill" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-display text-white">{titulo}</h1>
          {subtitulo && <p className="text-gray-500 text-sm mt-0.5">{subtitulo}</p>}
        </div>
      </div>
    </div>
  )
}
