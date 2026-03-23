import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  EnvelopeSimple, Lock, Eye, EyeSlash,
  Warning, CheckCircle, XCircle, Info, Key,
} from '@phosphor-icons/react'
import BottomSheet from '../ui/BottomSheet'
import { criarContaAluno, calcularForcaSenha } from '../../lib/criarContaAluno'

interface AlunoParaAcesso {
  nome: string
  email?: string
  fotoUrl?: string
  temAcesso?: boolean
}

interface ModalAcessoAppProps {
  aberto: boolean
  aluno: AlunoParaAcesso | null
  onFechar: () => void
  onSucesso: () => void
}

const forcaCores = ['', 'bg-red-500', 'bg-yellow-500', 'bg-blue-500', 'bg-[#00E620]']

export default function ModalAcessoApp({ aberto, aluno, onFechar, onSucesso }: ModalAcessoAppProps) {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState(false)

  const modo = aluno?.temAcesso ? 'redefinir' : 'criar'
  const forca = calcularForcaSenha(senha)
  const senhasOk = senha.length >= 6 && senha === confirmar

  useEffect(() => {
    if (aberto) {
      setEmail(aluno?.email ?? '')
      setSenha('')
      setConfirmar('')
      setErro('')
      setSucesso(false)
      setMostrarSenha(false)
    }
  }, [aberto, aluno])

  const handleSalvar = async () => {
    if (!email.trim().includes('@')) {
      setErro('Email inválido')
      return
    }
    if (senha.length < 6) {
      setErro('Senha deve ter pelo menos 6 caracteres')
      return
    }
    if (senha !== confirmar) {
      setErro('As senhas não coincidem')
      return
    }

    setSalvando(true)
    setErro('')

    const resultado = await criarContaAluno({
      nome: aluno!.nome,
      email: email.trim().toLowerCase(),
      senha,
    })

    setSalvando(false)

    if (!resultado.sucesso) {
      setErro(resultado.erro ?? 'Erro ao criar acesso')
      return
    }

    setSucesso(true)
    setTimeout(() => { onSucesso(); onFechar() }, 2500)
  }

  const initials = aluno?.nome
    ? aluno.nome.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : ''

  const inputBase = 'flex-1 bg-transparent py-3.5 text-white placeholder:text-gray-600 outline-none text-base'

  return (
    <BottomSheet
      aberto={aberto}
      onFechar={onFechar}
      titulo="Acesso ao App"
      botaoPrimario={!sucesso ? {
        label: salvando
          ? 'Salvando...'
          : modo === 'criar' ? 'Criar Acesso' : 'Redefinir Acesso',
        loading: salvando,
        disabled: !senhasOk || !email || salvando,
        onClick: handleSalvar,
      } : undefined}
      botaoSecundario={!sucesso ? { label: 'Cancelar', onClick: onFechar } : undefined}
    >
      {sucesso ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="py-8 text-center space-y-4"
        >
          <div className="w-20 h-20 rounded-full bg-[#00E620]/20 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(0,230,32,0.3)]">
            <CheckCircle size={40} className="text-[#00E620]" weight="fill" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Acesso criado!</h3>
            <p className="text-gray-400 text-sm mt-2">
              {aluno?.nome} já pode entrar no app com:
            </p>
            <div className="mt-3 p-4 bg-[#111111] rounded-xl border border-[#00E620]/20 space-y-2 text-left">
              <div className="flex items-center gap-2">
                <EnvelopeSimple size={16} className="text-gray-400 flex-shrink-0" />
                <span className="text-white text-sm font-medium">{email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock size={16} className="text-gray-400 flex-shrink-0" />
                <span className="text-white text-sm">
                  {'•'.repeat(Math.min(senha.length, 12))}
                </span>
              </div>
            </div>
            <p className="text-gray-600 text-xs mt-3">
              📱 Compartilhe estas credenciais com o aluno via WhatsApp
            </p>
          </div>
        </motion.div>
      ) : (
        <div className="space-y-5">
          {/* Info do aluno */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-[#111111]">
            <div className="w-10 h-10 rounded-full bg-[#00E620]/15 flex items-center justify-center text-[#00E620] text-xs font-bold flex-shrink-0">
              {initials}
            </div>
            <div>
              <p className="font-bold text-white">{aluno?.nome}</p>
              <p className="text-gray-400 text-xs">
                {modo === 'criar'
                  ? 'Criar credenciais de acesso ao app'
                  : 'Redefinir credenciais de acesso'}
              </p>
            </div>
          </div>

          {/* Banner explicativo */}
          <div className="flex gap-3 p-4 rounded-xl bg-[#00E620]/[0.08] border border-[#00E620]/20">
            <Info size={20} className="text-[#00E620] flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-white">Como funciona</p>
              <p className="text-xs text-gray-400 leading-relaxed">
                Defina um email e senha abaixo. O aluno usará essas credenciais
                para entrar no app. Compartilhe via WhatsApp após criar.
              </p>
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-sm text-gray-400 font-medium">Email de acesso</label>
            <div className={`flex items-center gap-2 border rounded-xl px-3 transition-all ${
              email.includes('@') ? 'border-[#00E620]/50' : 'border-white/10'
            }`}>
              <EnvelopeSimple size={18}
                className={email.includes('@') ? 'text-[#00E620]' : 'text-gray-600'} />
              <input
                value={email}
                onChange={e => { setEmail(e.target.value); setErro('') }}
                type="email"
                placeholder="email@exemplo.com"
                autoCapitalize="none"
                className={inputBase}
              />
            </div>
          </div>

          {/* Senha */}
          <div className="space-y-1.5">
            <label className="text-sm text-gray-400 font-medium">
              Senha <span className="text-gray-600 font-normal">(mín. 6 caracteres)</span>
            </label>
            <div className={`flex items-center gap-2 border rounded-xl px-3 transition-all ${
              senha.length >= 6 ? 'border-[#00E620]/50' : 'border-white/10'
            }`}>
              <Lock size={18} className={senha.length >= 6 ? 'text-[#00E620]' : 'text-gray-600'} />
              <input
                value={senha}
                onChange={e => { setSenha(e.target.value); setErro('') }}
                type={mostrarSenha ? 'text' : 'password'}
                placeholder="Definir senha do aluno"
                className={inputBase}
              />
              <button type="button"
                onClick={() => setMostrarSenha(m => !m)}
                className="touch-manipulation p-1">
                {mostrarSenha
                  ? <EyeSlash size={18} className="text-gray-600" />
                  : <Eye size={18} className="text-gray-600" />
                }
              </button>
            </div>
            {/* Barra de força */}
            {senha.length > 0 && (
              <div className="flex gap-1">
                {[1, 2, 3, 4].map(n => (
                  <div key={n}
                    className={`flex-1 h-1 rounded-full transition-all ${
                      forca >= n ? forcaCores[forca] : 'bg-white/5'
                    }`} />
                ))}
              </div>
            )}
          </div>

          {/* Confirmar senha */}
          <div className="space-y-1.5">
            <label className="text-sm text-gray-400 font-medium">Confirmar senha</label>
            <div className={`flex items-center gap-2 border rounded-xl px-3 transition-all ${
              confirmar && confirmar === senha
                ? 'border-[#00E620]/50'
                : confirmar && confirmar !== senha
                  ? 'border-red-500/50'
                  : 'border-white/10'
            }`}>
              <Lock size={18} className={
                confirmar === senha && confirmar ? 'text-[#00E620]' : 'text-gray-600'
              } />
              <input
                value={confirmar}
                onChange={e => { setConfirmar(e.target.value); setErro('') }}
                type={mostrarSenha ? 'text' : 'password'}
                placeholder="Repetir a senha"
                className={inputBase}
              />
              {confirmar && (
                confirmar === senha
                  ? <CheckCircle size={18} className="text-[#00E620]" weight="fill" />
                  : <XCircle size={18} className="text-red-400" weight="fill" />
              )}
            </div>
            {confirmar && confirmar !== senha && (
              <p className="text-xs text-red-400">As senhas não coincidem</p>
            )}
          </div>

          {/* Resumo das credenciais */}
          {senhasOk && email.includes('@') && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-[#00E620]/[0.08] border border-[#00E620]/20 space-y-2"
            >
              <p className="text-xs font-medium text-[#00E620] flex items-center gap-1.5">
                <CheckCircle size={14} weight="fill" />
                Credenciais prontas para compartilhar
              </p>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-400 w-14">Email:</span>
                  <span className="text-white font-medium">{email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-400 w-14">Senha:</span>
                  <span className="text-white font-medium">
                    {mostrarSenha ? senha : '•'.repeat(senha.length)}
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Erro */}
          <AnimatePresence>
            {erro && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5">
                  <Warning size={16} weight="fill" />
                  {erro}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </BottomSheet>
  )
}
