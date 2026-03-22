import { motion } from 'framer-motion'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  animated?: boolean
}

const sizes = {
  sm: 'h-8',
  md: 'h-12',
  lg: 'h-20',
  xl: 'h-32',
}

export default function Logo({ size = 'md', animated = false }: LogoProps) {
  return (
    <div className="relative inline-flex items-center justify-center">
      {animated && (
        <motion.div
          className="absolute inset-0 blur-2xl rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(0,230,32,0.35), transparent)',
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
      <motion.img
        src="/logo.png"
        alt="Grings Team"
        className={`${sizes[size]} w-auto object-contain relative z-10`}
        whileHover={{
          filter: 'brightness(1.3) drop-shadow(0 0 16px rgba(0,230,32,0.8))',
          scale: 1.05,
        }}
        transition={{ duration: 0.2 }}
      />
    </div>
  )
}
