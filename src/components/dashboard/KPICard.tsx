import { useEffect, ReactNode } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { ArrowUp, ArrowDown } from '@phosphor-icons/react'

interface KPICardProps {
  icon: ReactNode
  label: string
  value: number
  prefix?: string
  suffix?: string
  change?: number
  changeLabel?: string
}

function AnimatedNumber({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) {
  const motionValue = useMotionValue(0)
  const rounded = useTransform(motionValue, (v) =>
    suffix === '%' ? v.toFixed(1) : Math.round(v).toLocaleString('pt-BR')
  )

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration: 1.2,
      ease: 'easeOut',
    })
    return controls.stop
  }, [value, motionValue])

  return (
    <span className="flex items-baseline gap-1">
      {prefix && <span className="text-lg text-gray-400 font-body">{prefix}</span>}
      <motion.span className="text-3xl font-display tracking-wide text-white">
        {rounded}
      </motion.span>
      {suffix && <span className="text-lg text-gray-400 font-body">{suffix}</span>}
    </span>
  )
}

export default function KPICard({ icon, label, value, prefix, suffix, change, changeLabel }: KPICardProps) {
  const isPositive = (change ?? 0) >= 0

  return (
    <motion.div
      whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(0, 230, 32, 0.15)' }}
      className="glow-surface relative bg-surface/50 backdrop-blur-md border border-white/5 rounded-card p-5 overflow-hidden group hover:border-brand-green/20 transition-colors"
    >
      {/* Glow background */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-brand-green/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 rounded-xl bg-brand-green/10 flex items-center justify-center text-brand-green">
            {icon}
          </div>
          {change !== undefined && (
            <div className={`flex items-center gap-1 text-xs font-medium ${isPositive ? 'text-brand-green' : 'text-red-400'}`}>
              {isPositive ? <ArrowUp size={12} weight="bold" /> : <ArrowDown size={12} weight="bold" />}
              <span>{Math.abs(change)}%</span>
            </div>
          )}
        </div>

        <AnimatedNumber value={value} prefix={prefix} suffix={suffix} />
        <p className="text-sm text-gray-500 mt-1">{label}</p>
        {changeLabel && (
          <p className="text-xs text-gray-600 mt-1">{changeLabel}</p>
        )}
      </div>
    </motion.div>
  )
}
