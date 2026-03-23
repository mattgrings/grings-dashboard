import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  EnvelopeSimple,
  Lock,
  Eye,
  EyeSlash,
  ArrowLeft,
  Warning,
} from '@phosphor-icons/react'
import { useAuthStore } from '../store/authStore'
import { supabase } from '../lib/supabase'
import InputGlow from '../components/ui/InputGlow'
import GreenLedBackground from '../components/ui/GreenLedBackground'
import TrevoLogo from '../components/ui/TrevoLogo'

type Modo = 'login' | 'esqueci'

function FormEsqueciSenha({ onVoltar }: { onVoltar: () => void }) {
  const [email, setEmail] = useState('')
  const [enviado, setEnviado] = useState(false)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setErro('')
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback`,
      })
      if (error) throw new Error(error.message)
      setEnviado(true)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao enviar email.'
      setErro(message)
    } finally {
      setLoading(false)
    }
  }

  if (enviado) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-4"
      >
        <div className="bg-[#00E620]/10 border border-[#00E620]/20 rounded-xl p-4 text-center space-y-2">
          <p className="text-[#00E620] font-medium">Email enviado!</p>
          <p className="text-gray-400 text-sm">
            Verifique sua caixa de entrada para redefinir a senha.
          </p>
        </div>
        <button
          onClick={onVoltar}
          className="w-full text-sm text-gray-500 hover:text-white transition-colors flex items-center justify-center gap-2"
        >
          <ArrowLeft size={16} />
          Voltar ao login
        </button>
      </motion.div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <InputGlow
        icon={EnvelopeSimple}
        type="email"
        placeholder="Seu email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
      />

      {erro && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5"
        >
          <Warning size={16} weight="fill" />
          {erro}
        </motion.div>
      )}

      <motion.button
        type="submit"
        disabled={loading}
        whileTap={{ scale: 0.97 }}
        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#00E620] to-[#00CC00]
                   text-black font-bold text-sm tracking-wide transition-all
                   disabled:opacity-50 touch-manipulation"
      >
        {loading ? 'Enviando...' : 'Solicitar redefinição'}
      </motion.button>

      <button
        type="button"
        onClick={onVoltar}
        className="w-full text-sm text-gray-500 hover:text-white transition-colors flex items-center justify-center gap-2"
      >
        <ArrowLeft size={16} />
        Voltar ao login
      </button>
    </form>
  )
}

export default function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)
  const [modo, setModo] = useState<Modo>('login')

  const login = useAuthStore((s) => s.login)
  const loginComGoogle = useAuthStore((s) => s.loginComGoogle)
  const loginComApple = useAuthStore((s) => s.loginComApple)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !senha) {
      setErro('Preencha todos os campos.')
      return
    }
    setLoading(true)
    setErro('')
    try {
      await login(email, senha)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao entrar. Verifique email e senha.'
      setErro(message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      await loginComGoogle()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao conectar com Google.'
      setErro(message)
    }
  }

  const handleAppleLogin = async () => {
    try {
      await loginComApple()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao conectar com Apple.'
      setErro(message)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        background: 'linear-gradient(145deg, #080808 0%, #0a0a0a 50%, #0d0d0d 100%)',
      }}
    >
      <GreenLedBackground />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-sm"
      >
        <div
          className="bg-white/[0.03] backdrop-blur-xl border border-[#00E620]/20
                     rounded-3xl p-8 shadow-[0_0_80px_rgba(0,230,32,0.08)]"
        >
          {/* TREVO + LOGO */}
          <div className="flex justify-center mb-8">
            <TrevoLogo />
          </div>

          {/* Título */}
          <AnimatePresence mode="wait">
            <motion.div
              key={modo}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-center mb-6"
            >
              <h1 className="text-2xl font-display text-white">
                {modo === 'login' ? 'Entrar na conta' : 'Recuperar acesso'}
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Grings Team · Consultoria Fitness
              </p>
            </motion.div>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.div
              key={modo}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {modo === 'login' && (
                <>
                  {/* OAuth — Google e Apple */}
                  <div className="space-y-3 mb-5">
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.97 }}
                      onClick={handleGoogleLogin}
                      className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl
                                 bg-white text-gray-800 font-semibold text-sm
                                 hover:bg-gray-100 transition-all touch-manipulation
                                 shadow-[0_2px_12px_rgba(0,0,0,0.15)]"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      Continuar com Google
                    </motion.button>

                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.97 }}
                      onClick={handleAppleLogin}
                      className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl
                                 bg-black text-white font-semibold text-sm border border-white/10
                                 hover:bg-zinc-900 transition-all touch-manipulation"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                      </svg>
                      Continuar com Apple
                    </motion.button>
                  </div>

                  {/* Divisor */}
                  <div className="flex items-center gap-3 mb-5">
                    <div className="flex-1 h-px bg-white/10" />
                    <span className="text-gray-600 text-xs">ou entre com email</span>
                    <div className="flex-1 h-px bg-white/10" />
                  </div>

                  {/* Form email/senha */}
                  <form onSubmit={handleLogin} className="space-y-3">
                    <InputGlow
                      icon={EnvelopeSimple}
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                    />
                    <InputGlow
                      icon={Lock}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      autoComplete="current-password"
                      rightElement={
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-gray-500 hover:text-gray-300 transition-colors"
                        >
                          {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                        </button>
                      }
                    />

                    {/* Erro */}
                    <AnimatePresence>
                      {erro && (
                        <motion.div
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center gap-2 text-red-400 text-sm
                                     bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5"
                        >
                          <Warning size={16} weight="fill" />
                          {erro}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <motion.button
                      type="submit"
                      disabled={loading}
                      whileTap={{ scale: 0.97 }}
                      className="w-full py-4 rounded-2xl bg-[#00E620] text-black font-bold text-base
                                 shadow-[0_0_25px_rgba(0,230,32,0.4)] touch-manipulation
                                 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {loading ? 'Entrando...' : 'Entrar'}
                    </motion.button>
                  </form>

                  <button
                    onClick={() => { setModo('esqueci'); setErro('') }}
                    className="w-full text-center text-sm text-gray-500 hover:text-[#00E620]
                               transition-colors mt-4 touch-manipulation"
                  >
                    Esqueci minha senha
                  </button>
                </>
              )}

              {modo === 'esqueci' && (
                <FormEsqueciSenha onVoltar={() => setModo('login')} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-700 mt-4">
          Grings Team © {new Date().getFullYear()} · Consultoria Fitness
        </p>
      </motion.div>
    </div>
  )
}
