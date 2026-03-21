import { motion } from 'framer-motion'

interface CronometroDisplayProps {
  segundos: number
}

export default function CronometroDisplay({ segundos }: CronometroDisplayProps) {
  const horas = Math.floor(segundos / 3600)
  const minutos = Math.floor((segundos % 3600) / 60)
  const segs = segundos % 60

  const fmt = (n: number) => String(n).padStart(2, '0')

  return (
    <div className="flex items-baseline gap-1">
      {horas > 0 && (
        <>
          <span className="font-display text-5xl text-white tabular-nums">
            {fmt(horas)}
          </span>
          <span className="text-2xl text-gray-500 font-bold">:</span>
        </>
      )}
      <span className="font-display text-5xl text-white tabular-nums">
        {fmt(minutos)}
      </span>
      <span className="text-2xl text-gray-500 font-bold">:</span>
      <motion.span
        key={segs}
        initial={{ y: -4, opacity: 0.6 }}
        animate={{ y: 0, opacity: 1 }}
        className="font-display text-5xl tabular-nums"
        style={{
          color: '#00E620',
          textShadow: '0 0 20px rgba(0,230,32,0.5)',
        }}
      >
        {fmt(segs)}
      </motion.span>
    </div>
  )
}
