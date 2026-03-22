import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  EnvelopeSimple,
  Lock,
  Eye,
  EyeSlash,
  ArrowLeft,
  Key,
  User,
} from '@phosphor-icons/react'
import { useAuthStore } from '../store/authStore'
import Logo from '../components/ui/Logo'
import InputGlow from '../components/ui/InputGlow'
import GreenLedBackground from '../components/ui/GreenLedBackground'

type Modo = 'login' | 'esqueci' | 'criar'

export default function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [modo, setModo] = useState<Modo>('login')

  // Create account
  const [criarNome, setCriarNome] = useState('')
  const [criarEmail, setCriarEmail] = useState('')
  const [criarSenha, setCriarSenha] = useState('')
  const [criarCodigo, setCriarCodigo] = useState('')

  // Forgot password
  const [esqueciEmail, setEsqueciEmail] = useState('')
  const [esqueciEnviado, setEsqueciEnviado] = useState(false)

  const login = useAuthStore((s) => s.login)
  const register = useAuthStore((s) => s.register)
  const user = useAuthStore((s) => s.user)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'aluno') {
        window.location.href = '/aluno'
      } else {
        window.location.href = '/'
      }
    }
  }, [isAuthenticated, user])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email || !senha) {
      setError('Preencha todos os campos.')
      return
    }
    setLoading(true)
    setTimeout(() => {
      const success = login(email, senha)
      if (!success) {
        setError('Email ou senha incorretos.')
      }
      setLoading(false)
    }, 400)
  }

  const handleCriarConta = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!criarCodigo || !criarNome || !criarEmail || !criarSenha) {
      setError('Preencha todos os campos.')
      return
    }
    if (criarSenha.length < 4) {
      setError('A senha deve ter pelo menos 4 caracteres.')
      return
    }
    setLoading(true)
    setTimeout(() => {
      const success = register({
        nome: criarNome,
        email: criarEmail,
        senha: criarSenha,
        role: 'aluno',
      })
      if (success) {
        login(criarEmail, criarSenha)
      } else {
        setError('Este email já está em uso.')
      }
      setLoading(false)
    }, 400)
  }

  const handleEsqueciSenha = (e: React.FormEvent) => {
    e.preventDefault()
    setEsqueciEnviado(true)
  }

  const changeModo = (m: Modo) => {
    setModo(m)
    setError('')
    setEmail('')
    setSenha('')
    setCriarNome('')
    setCriarEmail('')
    setCriarSenha('')
    setCriarCodigo('')
    setEsqueciEmail('')
    setEsqueciEnviado(false)
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        background:
          'linear-gradient(145deg, #080808 0%, #0a0a0a 50%, #0d0d0d 100%)',
      }}
    >
      <GreenLedBackground />

      {/* Central gradient */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="w-[600px] h-[600px] rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(0,230,32,0.06) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
        className="relative z-10 w-full max-w-md"
      >
        <div
          className="bg-white/[0.03] backdrop-blur-xl border border-white/10
                     rounded-3xl p-8 shadow-[0_0_60px_rgba(0,230,32,0.1)]"
        >
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Logo size="xl" animated />
          </div>

          {/* Animated title */}
          <AnimatePresence mode="wait">
            <motion.div
              key={modo}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-center mb-8"
            >
              <h1 className="text-3xl font-display text-white">
                {modo === 'login' && 'Bem-vindo de volta'}
                {modo === 'esqueci' && 'Recuperar acesso'}
                {modo === 'criar' && 'Criar nova conta'}
              </h1>
              <p className="text-gray-500 mt-1 text-sm">
                {modo === 'login' && 'Entre na sua conta Grings Team'}
                {modo === 'esqueci' && 'Informe seu email para redefinição'}
                {modo === 'criar' && 'Configure seu login pela primeira vez'}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Forms */}
          <AnimatePresence mode="wait">
            <motion.div
              key={modo}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {modo === 'login' && (
                <form onSubmit={handleLogin} className="space-y-4">
                  <InputGlow
                    icon={EnvelopeSimple}
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <InputGlow
                    icon={Lock}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Senha"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    rightElement={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-gray-500 hover:text-gray-300 transition-colors"
                      >
                        {showPassword ? (
                          <EyeSlash size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    }
                  />

                  <AnimatePresence>
                    {error && (
                      <motion.p
                        initial={{ opacity: 0, x: -10 }}
                        animate={{
                          opacity: 1,
                          x: [0, -5, 5, -5, 5, 0],
                        }}
                        exit={{ opacity: 0 }}
                        className="text-red-400 text-sm text-center"
                      >
                        {error}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{
                      scale: 1.02,
                      boxShadow: '0 0 25px rgba(0, 230, 32, 0.4)',
                    }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#00E620] to-[#00CC00]
                               text-black font-bold text-sm tracking-wide transition-all
                               disabled:opacity-50"
                  >
                    {loading ? 'Entrando...' : 'Entrar'}
                  </motion.button>
                </form>
              )}

              {modo === 'criar' && (
                <form onSubmit={handleCriarConta} className="space-y-4">
                  <InputGlow
                    icon={Key}
                    placeholder="Código de convite"
                    value={criarCodigo}
                    onChange={(e) =>
                      setCriarCodigo(e.target.value.toUpperCase())
                    }
                  />
                  <InputGlow
                    icon={User}
                    placeholder="Seu nome completo"
                    value={criarNome}
                    onChange={(e) => setCriarNome(e.target.value)}
                  />
                  <InputGlow
                    icon={EnvelopeSimple}
                    type="email"
                    placeholder="Seu email"
                    value={criarEmail}
                    onChange={(e) => setCriarEmail(e.target.value)}
                  />
                  <InputGlow
                    icon={Lock}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Criar senha"
                    value={criarSenha}
                    onChange={(e) => setCriarSenha(e.target.value)}
                    rightElement={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-gray-500 hover:text-gray-300 transition-colors"
                      >
                        {showPassword ? (
                          <EyeSlash size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    }
                  />

                  <AnimatePresence>
                    {error && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-red-400 text-sm text-center"
                      >
                        {error}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{
                      scale: 1.02,
                      boxShadow: '0 0 25px rgba(0, 230, 32, 0.4)',
                    }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#00E620] to-[#00CC00]
                               text-black font-bold text-sm tracking-wide transition-all
                               disabled:opacity-50"
                  >
                    {loading ? 'Criando...' : 'Criar conta'}
                  </motion.button>
                </form>
              )}

              {modo === 'esqueci' && (
                <form onSubmit={handleEsqueciSenha} className="space-y-4">
                  {esqueciEnviado ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-[#00E620]/10 border border-[#00E620]/20 rounded-xl p-4 text-center space-y-2"
                    >
                      <p className="text-[#00E620] font-medium">
                        Solicitação enviada!
                      </p>
                      <p className="text-gray-400 text-sm">
                        Entre em contato com seu consultor para redefinir a
                        senha.
                      </p>
                    </motion.div>
                  ) : (
                    <>
                      <InputGlow
                        icon={EnvelopeSimple}
                        type="email"
                        placeholder="Seu email"
                        value={esqueciEmail}
                        onChange={(e) => setEsqueciEmail(e.target.value)}
                      />
                      <motion.button
                        type="submit"
                        whileHover={{
                          scale: 1.02,
                          boxShadow: '0 0 25px rgba(0, 230, 32, 0.4)',
                        }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#00E620] to-[#00CC00]
                                   text-black font-bold text-sm tracking-wide transition-all"
                      >
                        Solicitar redefinição
                      </motion.button>
                    </>
                  )}
                </form>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation links */}
          {modo === 'login' && (
            <div className="mt-6 space-y-3 text-center">
              <button
                onClick={() => changeModo('esqueci')}
                className="text-sm text-gray-500 hover:text-[#00E620] transition-colors
                           underline underline-offset-4"
              >
                Esqueci minha senha
              </button>
              <div className="text-xs text-gray-600">
                Código de acesso recebido do seu consultor?{' '}
                <button
                  onClick={() => changeModo('criar')}
                  className="text-[#00E620] hover:brightness-125 transition-all font-medium"
                >
                  Criar conta
                </button>
              </div>
            </div>
          )}

          {modo !== 'login' && (
            <button
              onClick={() => changeModo('login')}
              className="mt-6 w-full text-sm text-gray-500 hover:text-white
                         transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft size={16} />
              Voltar ao login
            </button>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-700 mt-4">
          Grings Team © {new Date().getFullYear()} · Consultoria Fitness
        </p>
      </motion.div>
    </div>
  )
}
