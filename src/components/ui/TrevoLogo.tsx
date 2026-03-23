import { motion } from 'framer-motion'

export default function TrevoLogo() {
  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: 200, height: 200 }}
    >
      {/* SVG do trevo girando */}
      <motion.div
        className="absolute inset-0"
        animate={{ rotate: 360 }}
        transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
      >
        <svg
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <defs>
            <linearGradient id="trevo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00E620" stopOpacity="0.9" />
              <stop offset="25%" stopColor="#00FF40" stopOpacity="0.6" />
              <stop offset="50%" stopColor="#00E620" stopOpacity="0.2" />
              <stop offset="75%" stopColor="#00FF40" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#00E620" stopOpacity="0.9" />
            </linearGradient>
            <filter id="glow-trevo">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Folha superior direita */}
          <circle
            cx="137" cy="63" r="35"
            stroke="url(#trevo-grad)" strokeWidth="2.5"
            fill="none" filter="url(#glow-trevo)"
          />
          {/* Folha inferior direita */}
          <circle
            cx="137" cy="137" r="35"
            stroke="url(#trevo-grad)" strokeWidth="2.5"
            fill="none" filter="url(#glow-trevo)"
          />
          {/* Folha inferior esquerda */}
          <circle
            cx="63" cy="137" r="35"
            stroke="url(#trevo-grad)" strokeWidth="2.5"
            fill="none" filter="url(#glow-trevo)"
          />
          {/* Folha superior esquerda */}
          <circle
            cx="63" cy="63" r="35"
            stroke="url(#trevo-grad)" strokeWidth="2.5"
            fill="none" filter="url(#glow-trevo)"
          />

          {/* Hastes do trevo */}
          <line x1="100" y1="100" x2="137" y2="63" stroke="#00E620" strokeWidth="1.5" strokeOpacity="0.4" filter="url(#glow-trevo)" />
          <line x1="100" y1="100" x2="137" y2="137" stroke="#00E620" strokeWidth="1.5" strokeOpacity="0.4" filter="url(#glow-trevo)" />
          <line x1="100" y1="100" x2="63" y2="137" stroke="#00E620" strokeWidth="1.5" strokeOpacity="0.4" filter="url(#glow-trevo)" />
          <line x1="100" y1="100" x2="63" y2="63" stroke="#00E620" strokeWidth="1.5" strokeOpacity="0.4" filter="url(#glow-trevo)" />

          {/* Pontos LED nas pontas */}
          {[
            { cx: 163, cy: 40 },
            { cx: 163, cy: 160 },
            { cx: 37, cy: 160 },
            { cx: 37, cy: 40 },
          ].map((p, i) => (
            <motion.circle
              key={i}
              cx={p.cx}
              cy={p.cy}
              r="4"
              fill="#00E620"
              filter="url(#glow-trevo)"
              animate={{ opacity: [1, 0.3, 1], r: [4, 6, 4] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
            />
          ))}
        </svg>
      </motion.div>

      {/* Segundo trevo — gira na direção oposta */}
      <motion.div
        className="absolute inset-0 scale-75"
        animate={{ rotate: -360 }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      >
        <svg
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full opacity-40"
        >
          <circle cx="137" cy="63" r="35" stroke="#00E620" strokeWidth="1" fill="none" />
          <circle cx="137" cy="137" r="35" stroke="#00E620" strokeWidth="1" fill="none" />
          <circle cx="63" cy="137" r="35" stroke="#00E620" strokeWidth="1" fill="none" />
          <circle cx="63" cy="63" r="35" stroke="#00E620" strokeWidth="1" fill="none" />
        </svg>
      </motion.div>

      {/* Glow de fundo pulsante */}
      <motion.div
        className="absolute rounded-full blur-3xl"
        style={{
          width: 120,
          height: 120,
          background: 'radial-gradient(circle, rgba(0,230,32,0.3), transparent)',
        }}
        animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Logo centralizada */}
      <motion.img
        src="/logo.png"
        alt="Grings Team"
        className="relative z-10 object-contain"
        style={{
          width: 110,
          height: 110,
          filter: 'drop-shadow(0 0 20px rgba(0,230,32,0.7))',
        }}
        animate={{
          filter: [
            'drop-shadow(0 0 20px rgba(0,230,32,0.5))',
            'drop-shadow(0 0 35px rgba(0,230,32,0.9))',
            'drop-shadow(0 0 20px rgba(0,230,32,0.5))',
          ],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  )
}
