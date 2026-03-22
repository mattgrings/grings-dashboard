import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User,
  Users,
  Bell,
  Database,
  Warning,
  Gear,
  Eye,
  EyeSlash,
  Key,
  Copy,
  Check,
  Trash,
  CloudCheck,
} from '@phosphor-icons/react'
import InputGlow from '../components/ui/InputGlow'
import FotoPerfilUpload from '../components/ui/FotoPerfilUpload'
import GradienteHeader from '../components/ui/GradienteHeader'
import { useAuthStore } from '../store/authStore'

type Aba = 'perfil' | 'contas' | 'notificacoes' | 'banco' | 'perigo'

const tabs: { id: Aba; label: string; icon: typeof User }[] = [
  { id: 'perfil', label: 'Meu Perfil', icon: User },
  { id: 'contas', label: 'Contas', icon: Users },
  { id: 'notificacoes', label: 'Notificações', icon: Bell },
  { id: 'banco', label: 'Banco de Dados', icon: Database },
  { id: 'perigo', label: 'Zona de Perigo', icon: Warning },
]

function AbaPerfilAdmin() {
  const user = useAuthStore((s) => s.user)
  const [nome, setNome] = useState(user?.nome ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [senhaAtual, setSenhaAtual] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [salvo, setSalvo] = useState(false)

  const handleSalvar = () => {
    setSalvo(true)
    setTimeout(() => setSalvo(false), 2000)
  }

  return (
    <div className="space-y-6 max-w-lg">
      <div className="flex items-center gap-4">
        <FotoPerfilUpload
          fotoAtual={user?.avatar}
          nome={user?.nome ?? 'Admin'}
          tamanho="lg"
          onFotoSelecionada={() => {}}
        />
        <div>
          <h3 className="text-white font-bold">{user?.nome}</h3>
          <p className="text-gray-500 text-sm">{user?.email}</p>
          <span className="text-xs text-[#00E620] bg-[#00E620]/10 px-2 py-0.5 rounded mt-1 inline-block">
            Administrador
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <InputGlow
          label="Nome"
          icon={User}
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />
        <InputGlow
          label="Email"
          icon={User}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div className="pt-4 border-t border-white/5">
          <h4 className="text-white font-medium text-sm mb-3">Alterar senha</h4>
          <div className="space-y-3">
            <InputGlow
              label="Senha atual"
              icon={Key}
              type={mostrarSenha ? 'text' : 'password'}
              value={senhaAtual}
              onChange={(e) => setSenhaAtual(e.target.value)}
              rightElement={
                <button
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="text-gray-500 hover:text-white transition-colors"
                >
                  {mostrarSenha ? <EyeSlash size={16} /> : <Eye size={16} />}
                </button>
              }
            />
            <InputGlow
              label="Nova senha"
              icon={Key}
              type={mostrarSenha ? 'text' : 'password'}
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
            />
          </div>
        </div>
      </div>

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={handleSalvar}
        className="px-6 py-3 bg-[#00E620] text-black font-bold rounded-xl
                   shadow-[0_0_20px_rgba(0,230,32,0.3)] hover:brightness-110
                   transition-all flex items-center gap-2"
      >
        {salvo ? <Check size={18} /> : <Gear size={18} />}
        {salvo ? 'Salvo!' : 'Salvar alterações'}
      </motion.button>
    </div>
  )
}

function AbaGestaoContas() {
  const users = useAuthStore((s) => s.users)
  const [copiado, setCopiado] = useState('')

  const alunos = users.filter((u) => u.role === 'aluno')

  const gerarCodigo = () => {
    const codigo = crypto.randomUUID().slice(0, 8).toUpperCase()
    navigator.clipboard.writeText(codigo)
    setCopiado(codigo)
    setTimeout(() => setCopiado(''), 3000)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-white font-bold">Contas de Alunos</h3>
          <p className="text-gray-500 text-sm">{alunos.length} alunos registrados</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={gerarCodigo}
          className="px-4 py-2 bg-[#00E620]/10 text-[#00E620] rounded-xl text-sm
                     font-medium hover:bg-[#00E620]/20 transition-colors
                     flex items-center gap-2"
        >
          <Key size={16} />
          Gerar código de convite
        </motion.button>
      </div>

      {copiado && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#00E620]/10 border border-[#00E620]/20 rounded-xl p-3
                     flex items-center justify-between"
        >
          <div>
            <p className="text-xs text-gray-400">Código copiado!</p>
            <p className="text-white font-mono font-bold">{copiado}</p>
          </div>
          <Copy size={16} className="text-[#00E620]" />
        </motion.div>
      )}

      <div className="space-y-2">
        {alunos.map((u) => (
          <div
            key={u.id}
            className="bg-[#141414] border border-white/5 rounded-xl p-3
                       flex items-center gap-3"
          >
            <div className="w-9 h-9 rounded-full bg-[#00E620]/10 flex items-center justify-center
                            text-[#00E620] text-xs font-bold">
              {u.nome.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white font-medium">{u.nome}</p>
              <p className="text-xs text-gray-500">{u.email}</p>
            </div>
            <span className="px-2 py-0.5 text-[10px] bg-[#00E620]/10 text-[#00E620] rounded-full">
              Ativo
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function AbaNotificacoes() {
  const [configs, setConfigs] = useState({
    feedback: true,
    treino_concluido: true,
    novo_aluno: true,
    vencimento: true,
    reset_senha: true,
  })

  return (
    <div className="space-y-4 max-w-lg">
      <h3 className="text-white font-bold">Preferências de Notificação</h3>
      <p className="text-gray-500 text-sm">Escolha quais notificações deseja receber</p>

      {[
        { key: 'feedback' as const, label: 'Feedbacks dos alunos', desc: 'Quando um aluno enviar feedback pós-treino' },
        { key: 'treino_concluido' as const, label: 'Treinos concluídos', desc: 'Quando um aluno finalizar um treino' },
        { key: 'novo_aluno' as const, label: 'Novos alunos', desc: 'Quando um aluno criar conta' },
        { key: 'vencimento' as const, label: 'Vencimentos', desc: 'Alertas de planos próximos do vencimento' },
        { key: 'reset_senha' as const, label: 'Reset de senha', desc: 'Solicitações de reset de senha' },
      ].map((item) => (
        <div
          key={item.key}
          className="flex items-center justify-between p-3 bg-[#141414] border border-white/5 rounded-xl"
        >
          <div>
            <p className="text-sm text-white font-medium">{item.label}</p>
            <p className="text-xs text-gray-500">{item.desc}</p>
          </div>
          <button
            onClick={() =>
              setConfigs((c) => ({ ...c, [item.key]: !c[item.key] }))
            }
            className={`relative w-11 h-6 rounded-full transition-colors ${
              configs[item.key] ? 'bg-[#00E620]' : 'bg-gray-700'
            }`}
          >
            <motion.div
              animate={{ x: configs[item.key] ? 20 : 2 }}
              className="absolute top-1 w-4 h-4 rounded-full bg-white shadow"
            />
          </button>
        </div>
      ))}
    </div>
  )
}

function AbaBancoDados() {
  return (
    <div className="space-y-4 max-w-lg">
      <h3 className="text-white font-bold">Status da Conexão</h3>

      <div className="bg-[#141414] border border-white/5 rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-3">
          <CloudCheck size={20} className="text-[#00E620]" />
          <div>
            <p className="text-sm text-white font-medium">Supabase</p>
            <p className="text-xs text-gray-500">Conectado · Sincronizando</p>
          </div>
          <span className="ml-auto px-2 py-0.5 text-[10px] bg-[#00E620]/10 text-[#00E620] rounded-full">
            Online
          </span>
        </div>
      </div>

      <div className="bg-[#141414] border border-white/5 rounded-xl p-4">
        <h4 className="text-sm text-white font-medium mb-2">Stores Sincronizados</h4>
        <div className="space-y-1.5">
          {[
            'grings-auth',
            'grings-alunos',
            'grings-leads',
            'grings-financeiro',
            'grings-tarefas',
            'grings-frequencia',
            'grings-social',
            'grings-feedbacks',
            'grings-notificacoes',
            'grings-cronometro',
          ].map((store) => (
            <div key={store} className="flex items-center justify-between text-xs">
              <span className="text-gray-400 font-mono">{store}</span>
              <span className="text-[#00E620]">✓</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function AbaZonaDePerigo() {
  const [confirmar, setConfirmar] = useState('')

  const handleReset = () => {
    if (confirmar !== 'RESETAR') return
    // Clear all stores
    const keys = [
      'grings-auth',
      'grings-alunos',
      'grings-leads',
      'grings-financeiro',
      'grings-tarefas',
      'grings-frequencia',
      'grings-social',
      'grings-feedbacks',
      'grings-notificacoes',
      'grings-cronometro',
      'grings-cargas',
    ]
    keys.forEach((k) => localStorage.removeItem(k))
    window.location.reload()
  }

  return (
    <div className="space-y-6 max-w-lg">
      <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <Warning size={24} className="text-red-400" />
          <h3 className="text-red-400 font-bold">Reset Total de Dados</h3>
        </div>
        <p className="text-sm text-gray-400">
          Esta ação irá apagar <strong className="text-white">TODOS</strong> os dados
          locais do dashboard: alunos, treinos, dietas, financeiro, tarefas, frequência,
          feedbacks e notificações. Esta ação não pode ser desfeita.
        </p>

        <div className="space-y-3">
          <p className="text-xs text-gray-500">
            Digite <strong className="text-red-400">RESETAR</strong> para confirmar:
          </p>
          <input
            type="text"
            value={confirmar}
            onChange={(e) => setConfirmar(e.target.value)}
            placeholder="RESETAR"
            className="w-full bg-[#111111] border border-red-500/20 rounded-xl px-4 py-3
                       text-white placeholder:text-gray-700 outline-none
                       focus:border-red-500 transition-colors"
          />
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleReset}
            disabled={confirmar !== 'RESETAR'}
            className="w-full py-3 bg-red-500 text-white font-bold rounded-xl
                       disabled:opacity-30 disabled:cursor-not-allowed
                       hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
          >
            <Trash size={18} />
            Resetar todos os dados
          </motion.button>
        </div>
      </div>
    </div>
  )
}

export default function Configuracoes() {
  const [aba, setAba] = useState<Aba>('perfil')

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <GradienteHeader
        icone={Gear}
        titulo="Configurações"
        subtitulo="Gerencie sua plataforma"
      />

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setAba(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm
                        whitespace-nowrap transition-all border ${
                          aba === tab.id
                            ? 'bg-[#00E620]/10 border-[#00E620]/30 text-[#00E620]'
                            : 'bg-[#141414] border-white/5 text-gray-400 hover:text-white'
                        }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={aba}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.15 }}
        >
          {aba === 'perfil' && <AbaPerfilAdmin />}
          {aba === 'contas' && <AbaGestaoContas />}
          {aba === 'notificacoes' && <AbaNotificacoes />}
          {aba === 'banco' && <AbaBancoDados />}
          {aba === 'perigo' && <AbaZonaDePerigo />}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}
