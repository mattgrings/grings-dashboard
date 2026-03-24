import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, Eye, EyeSlash, Warning, CheckCircle } from '@phosphor-icons/react'
import { supabase } from '../lib/supabase'
import GreenLedBackground from '../components/ui/GreenLedBackground'
import Logo from '../components/ui/Logo'

export default function RedefinirSenha() {
  const navigate = useNavigate()
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [mostrar, setMostrar] = useState(false)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro('')

    if (novaSenha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres')
      return
    }
    if (novaSenha !== confirmar) {
      setErro('As senhas não coincidem')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: novaSenha })
      if (error) throw new Error(error.message)
      setSucesso(true)
      setTimeout(() => navigate('/', { replace: true }), 2500)
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : 'Erro ao redefinir senha')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(145deg, #080808 0%, #0a0a0a 50%, #0d0d0d 100%)' }}
    >
      <GreenLedBackground />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-sm"
      >
        <div className="bg-white/[0.03] backdrop-blur-xl border border-[#00E620]/20 rounded-3xl p-8 shadow-[0_0_80px_rgba(0,230,32,0.08)]">
          <div className="flex justify-center mb-8">
            <Logo size="lg" />
          </div>

          {sucesso ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-4"
            >
              <CheckCircle size={48} weight="fill" className="text-[#00E620] mx-auto" />
              <p className="text-white font-medium">Senha redefinida com sucesso!</p>
              <p className="text-gray-500 text-sm">Redirecionando...</p>
            </motion.div>
          ) : (
            <>
              <div className="text-center mb-6">
                <h1 className="text-2xl font-display text-white">Nova senha</h1>
                <p className="text-gray-500 text-sm mt-1">Digite sua nova senha</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm text-gray-400 font-medium">Nova senha</label>
                  <div className={`flex items-center gap-2 border rounded-xl px-3 transition-all ${
                    novaSenha ? 'border-[#00E620] shadow-[0_0_12px_rgba(0,230,32,0.15)]' : 'border-white/10'
                  }`}>
                    <Lock size={18} className={novaSenha ? 'text-[#00E620]' : 'text-gray-600'} />
                    <input
                      type={mostrar ? 'text' : 'password'}
                      value={novaSenha}
                      onChange={(e) => { setNovaSenha(e.target.value); setErro('') }}
                      placeholder="••••••••"
                      className="flex-1 bg-transparent py-3.5 text-white placeholder:text-gray-600 outline-none text-base"
                    />
                    <button type="button" onClick={() => setMostrar(!mostrar)} className="p-1 touch-manipulation">
                      {mostrar
                        ? <EyeSlash size={18} className="text-gray-600 hover:text-white transition-colors" />
                        : <Eye size={18} className="text-gray-600 hover:text-white transition-colors" />
                      }
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm text-gray-400 font-medium">Confirmar senha</label>
                  <div className={`flex items-center gap-2 border rounded-xl px-3 transition-all ${
                    confirmar ? 'border-[#00E620] shadow-[0_0_12px_rgba(0,230,32,0.15)]' : 'border-white/10'
                  }`}>
                    <Lock size={18} className={confirmar ? 'text-[#00E620]' : 'text-gray-600'} />
                    <input
                      type={mostrar ? 'text' : 'password'}
                      value={confirmar}
                      onChange={(e) => { setConfirmar(e.target.value); setErro('') }}
                      placeholder="••••••••"
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
                  disabled={loading || !novaSenha || !confirmar}
                  whileTap={{ scale: 0.97 }}
                  className="w-full py-4 rounded-2xl font-bold text-base text-black bg-[#00E620] transition-all touch-manipulation disabled:opacity-40 disabled:cursor-not-allowed enabled:shadow-[0_0_25px_rgba(0,230,32,0.4)]"
                >
                  {loading ? 'Salvando...' : 'Redefinir senha'}
                </motion.button>
              </form>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}
