import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { EnvelopeSimple, Lock, Eye, EyeSlash } from '@phosphor-icons/react'
import { useAuthStore } from '../store/authStore'

export default function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const login = useAuthStore((s) => s.login)
  const user = useAuthStore((s) => s.user)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  // Redirect based on role after login
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'aluno') {
        window.location.href = '/aluno'
      } else {
        window.location.href = '/'
      }
    }
  }, [isAuthenticated, user])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email || !senha) {
      setError('Preencha todos os campos.')
      return
    }

    const success = login(email, senha)
    if (!success) {
      setError('Email ou senha incorretos.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: 'linear-gradient(145deg, #080808 0%, #0a0a0a 50%, #0d0d0d 100%)' }}
    >
      {/* Background particles */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-[#00E620]/30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0, 0.6, 0],
              scale: [0, 1.5, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md mx-4 relative z-10"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <img src="/logo.png" alt="Grings Team" className="h-20 object-contain mb-3" />
          <motion.div
            className="w-24 h-1 rounded-full bg-[#00E620]/40"
            animate={{
              boxShadow: [
                '0 0 10px rgba(0, 230, 32, 0.2)',
                '0 0 25px rgba(0, 230, 32, 0.5)',
                '0 0 10px rgba(0, 230, 32, 0.2)',
              ],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <h1 className="font-display text-4xl text-white tracking-widest mt-4">GRINGS TEAM</h1>
          <p className="text-gray-500 text-sm mt-1">Consultoria Fitness</p>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="relative">
              <EnvelopeSimple
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#111111] border border-white/10 rounded-xl px-4 py-3 pl-11 text-white placeholder-gray-600 focus:border-[#00E620]/50 focus:outline-none focus:ring-2 focus:ring-[#00E620]/20 transition-all"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"
              />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full bg-[#111111] border border-white/10 rounded-xl px-4 py-3 pl-11 pr-11 text-white placeholder-gray-600 focus:border-[#00E620]/50 focus:outline-none focus:ring-2 focus:ring-[#00E620]/20 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
              >
                {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: [0, -5, 5, -5, 5, 0] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="text-red-400 text-sm text-center"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Submit */}
            <motion.button
              type="submit"
              whileHover={{
                scale: 1.02,
                boxShadow: '0 0 25px rgba(0, 230, 32, 0.4)',
              }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#00E620] to-[#00CC00] text-black font-bold text-sm tracking-wide transition-all"
            >
              Entrar
            </motion.button>
          </form>
        </div>

        {/* Test credentials hint */}
        <div className="mt-6 text-center space-y-1">
          <p className="text-gray-600 text-xs">Credenciais de teste:</p>
          <p className="text-gray-500 text-xs">
            Admin: <span className="text-gray-400">admin@grings.com</span> / <span className="text-gray-400">admin123</span>
          </p>
          <p className="text-gray-500 text-xs">
            Aluno: <span className="text-gray-400">ana@aluno.com</span> / <span className="text-gray-400">ana123</span>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
