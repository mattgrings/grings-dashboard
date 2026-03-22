import { motion } from 'framer-motion'

interface LogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  animated?: boolean
}

const sizeClasses = {
  xs: 'h-8 w-auto',
  sm: 'h-12 w-auto',
  md: 'h-16 w-auto',
  lg: 'h-24 w-auto',
  xl: 'h-36 w-auto',
  '2xl': 'h-48 w-auto',
}

export default function Logo({ size = 'md', animated = false }: LogoProps) {
  return (
    <div className="relative inline-flex items-center justify-center">
      {animated && (
        <>
          <motion.div
            className="absolute rounded-2xl blur-3xl"
            style={{
              inset: '-20%',
              background:
                'radial-gradient(circle, rgba(0,230,32,0.35) 0%, transparent 70%)',
            }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute rounded-2xl"
            style={{
              inset: '-4px',
              background:
                'linear-gradient(135deg, rgba(0,230,32,0.3), transparent, rgba(0,230,32,0.15))',
              borderRadius: '20px',
            }}
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          />
        </>
      )}
      <motion.img
        src="/logo.png"
        alt="Grings Team"
        className={`${sizeClasses[size]} object-contain relative z-10 drop-shadow-2xl`}
        style={{
          filter: animated
            ? 'drop-shadow(0 0 24px rgba(0,230,32,0.6))'
            : 'drop-shadow(0 0 8px rgba(0,230,32,0.3))',
          maxWidth: '100%',
        }}
        whileHover={{
          filter:
            'drop-shadow(0 0 32px rgba(0,230,32,0.9)) brightness(1.15)',
          scale: 1.04,
        }}
        transition={{ duration: 0.25 }}
      />
    </div>
  )
}
