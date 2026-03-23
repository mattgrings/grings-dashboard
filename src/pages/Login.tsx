import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  EnvelopeSimple,
  Lock,
  Eye,
  EyeSlash,
  ArrowLeft,
  Warning,
  ArrowsClockwise,
} from '@phosphor-icons/react'
import { useAuthStore } from '../store/authStore'
import { supabase } from '../lib/supabase'
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
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <div className="text-center mb-6">
        <h1 className="text-2xl font-display text-white">Recuperar acesso</h1>
        <p className="text-gray-500 text-sm mt-1">Grings Team</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm text-gray-400 font-medium">Email</label>
          <div className={`flex items-center gap-2 border rounded-xl px-3 transition-all ${
            email ? 'border-[#00E620] shadow-[0_0_12px_rgba(0,230,32,0.15)]' : 'border-white/10'
          }`}>
            <EnvelopeSimple size={18} className={email ? 'text-[#00E620]' : 'text-gray-600'} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              autoComplete="email"
              className="flex-1 bg-transparent py-3.5 text-white placeholder:text-gray-600 outline-none text-base"
            />
          </div>
        </div>

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
    </motion.div>
  )
}

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)
  const [modo, setModo] = useState<Modo>('login')

  const login = useAuthStore((s) => s.login)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !senha.trim()) {
      setErro('Preencha email e senha')
      return
    }
    setLoading(true)
    setErro('')
    try {
      const perfil = await login(email.trim(), senha)
      navigate(perfil.perfil === 'admin' ? '/' : '/aluno')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : ''
      if (msg.includes('Invalid login credentials')) {
        setErro('Email ou senha incorretos')
      } else if (msg.includes('Email not confirmed')) {
        setErro('Conta não confirmada. Contate o administrador.')
      } else {
        setErro('Erro ao entrar. Tente novamente.')
      }
    } finally {
      setLoading(false)
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

          <AnimatePresence mode="wait">
            {modo === 'login' ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="text-center mb-6">
                  <h1 className="text-2xl font-display text-white">Bem-vindo</h1>
                  <p className="text-gray-500 text-sm mt-1">
                    Entre com seu email e senha
                  </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-sm text-gray-400 font-medium">Email</label>
                    <div className={`flex items-center gap-2 border rounded-xl px-3 transition-all ${
                      email ? 'border-[#00E620] shadow-[0_0_12px_rgba(0,230,32,0.15)]' : 'border-white/10'
                    }`}>
                      <EnvelopeSimple size={18} className={email ? 'text-[#00E620]' : 'text-gray-600'} />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setErro('') }}
                        placeholder="seu@email.com"
                        autoComplete="email"
                        autoCapitalize="none"
                        className="flex-1 bg-transparent py-3.5 text-white placeholder:text-gray-600 outline-none text-base"
                      />
                    </div>
                  </div>

                  {/* Senha */}
                  <div className="space-y-1.5">
                    <label className="text-sm text-gray-400 font-medium">Senha</label>
                    <div className={`flex items-center gap-2 border rounded-xl px-3 transition-all ${
                      senha ? 'border-[#00E620] shadow-[0_0_12px_rgba(0,230,32,0.15)]' : 'border-white/10'
                    }`}>
                      <Lock size={18} className={senha ? 'text-[#00E620]' : 'text-gray-600'} />
                      <input
                        type={mostrarSenha ? 'text' : 'password'}
                        value={senha}
                        onChange={(e) => { setSenha(e.target.value); setErro('') }}
                        placeholder="••••••••"
                        autoComplete="current-password"
                        className="flex-1 bg-transparent py-3.5 text-white placeholder:text-gray-600 outline-none text-base"
                      />
                      <button
                        type="button"
                        onClick={() => setMostrarSenha(!mostrarSenha)}
                        className="touch-manipulation p-1"
                      >
                        {mostrarSenha
                          ? <EyeSlash size={18} className="text-gray-600 hover:text-white transition-colors" />
                          : <Eye size={18} className="text-gray-600 hover:text-white transition-colors" />
                        }
                      </button>
                    </div>
                  </div>

                  {/* Erro */}
                  <AnimatePresence>
                    {erro && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: -8, height: 0 }}
                        className="flex items-center gap-2 text-red-400 text-sm
                                   bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5"
                      >
                        <Warning size={16} weight="fill" />
                        {erro}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Botão Entrar */}
                  <motion.button
                    type="submit"
                    disabled={loading || !email || !senha}
                    whileTap={{ scale: 0.97 }}
                    className="w-full py-4 rounded-2xl font-bold text-base text-black
                               bg-[#00E620] transition-all touch-manipulation
                               disabled:opacity-40 disabled:cursor-not-allowed
                               enabled:shadow-[0_0_25px_rgba(0,230,32,0.4)]"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <ArrowsClockwise size={20} className="animate-spin" />
                        Entrando...
                      </span>
                    ) : 'Entrar'}
                  </motion.button>
                </form>

                <button
                  onClick={() => { setModo('esqueci'); setErro('') }}
                  className="w-full text-center text-sm text-gray-500 hover:text-[#00E620]
                             transition-colors mt-4 touch-manipulation py-2"
                >
                  Esqueci minha senha
                </button>
              </motion.div>
            ) : (
              <FormEsqueciSenha key="esqueci" onVoltar={() => setModo('login')} />
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-700 mt-4">
          Grings Team · Consultoria Fitness © {new Date().getFullYear()}
        </p>
      </motion.div>
    </div>
  )
}
