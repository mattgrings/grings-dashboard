import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  DownloadSimple,
  Percent,
  UsersThree,
  Barbell,
  CurrencyDollar,
  ChartLineUp,
  ChartBar,
} from '@phosphor-icons/react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { useLeadsStore } from '../store/leadsStore'
import { useAlunosStore } from '../store/alunosStore'
import { useFinanceiroStore } from '../store/financeiroStore'
import { useFeedbackStore } from '../store/feedbackStore'
import KPICard from '../components/dashboard/KPICard'
import CaptacaoChart from '../components/dashboard/CaptacaoChart'
import RecentLeads from '../components/dashboard/RecentLeads'
import GradienteHeader from '../components/ui/GradienteHeader'

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 300, damping: 25 },
  },
}

const ORIGEM_COLORS: Record<string, string> = {
  instagram: '#E1306C',
  whatsapp: '#25D366',
  indicacao: '#06B6D4',
  trafego_pago: '#F97316',
  outro: '#6B7280',
}

const ORIGEM_LABELS: Record<string, string> = {
  instagram: 'Instagram',
  whatsapp: 'WhatsApp',
  indicacao: 'Indicação',
  trafego_pago: 'Tráfego Pago',
  outro: 'Outro',
}

export default function Dashboard() {
  const leads = useLeadsStore((s) => s.leads)
  const alunos = useAlunosStore((s) => s.alunos)
  const meses = useFinanceiroStore((s) => s.meses)
  const naoLidosFeedback = useFeedbackStore((s) => s.getNaoLidos())

  const today = new Date()
  const todayLeads = leads.filter((l) => {
    const d = new Date(l.criadoEm)
    return d.toDateString() === today.toDateString()
  })

  const convertidos = leads.filter((l) => l.status === 'convertido')
  const activeLeads = leads.filter((l) => l.status !== 'perdido')
  const alunosAtivos = alunos.filter((a) => a.status === 'ativo')
  const taxaConversao =
    leads.length > 0 ? (convertidos.length / leads.length) * 100 : 0

  // Receita do mês atual — calculada dos dados reais
  const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
  const mesAtual = meses.find((m) => m.mes === currentMonth)
  const receitaMes = mesAtual
    ? mesAtual.vendas.reduce((sum, v) => sum + v.valor, 0)
    : 0

  // Origem dos leads — calculada dos dados reais
  const origemData = useMemo(() => {
    if (leads.length === 0) return []

    const contagem: Record<string, number> = {}
    leads.forEach((l) => {
      contagem[l.origem] = (contagem[l.origem] || 0) + 1
    })

    return Object.entries(contagem)
      .map(([origem, count]) => ({
        name: ORIGEM_LABELS[origem] ?? origem,
        value: Math.round((count / leads.length) * 100),
        color: ORIGEM_COLORS[origem] ?? '#6B7280',
      }))
      .sort((a, b) => b.value - a.value)
  }, [leads])

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <GradienteHeader
        icone={ChartLineUp}
        titulo="Dashboard"
        subtitulo="Visão geral do seu negócio"
      />

      {/* KPI Cards — valores 100% reais, sem change hardcoded */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
        <motion.div variants={cardVariants}>
          <KPICard
            icon={<DownloadSimple size={22} weight="duotone" />}
            label="Captações Hoje"
            value={todayLeads.length}
          />
        </motion.div>
        <motion.div variants={cardVariants}>
          <KPICard
            icon={<Barbell size={22} weight="duotone" />}
            label="Alunos Ativos"
            value={alunosAtivos.length}
          />
        </motion.div>
        <motion.div variants={cardVariants}>
          <KPICard
            icon={<CurrencyDollar size={22} weight="duotone" />}
            label="Receita do Mês"
            value={receitaMes}
            prefix="R$"
          />
        </motion.div>
        <motion.div variants={cardVariants}>
          <KPICard
            icon={<Percent size={22} weight="duotone" />}
            label="Taxa de Conversão"
            value={taxaConversao}
            suffix="%"
          />
        </motion.div>
        <motion.div variants={cardVariants}>
          <KPICard
            icon={<UsersThree size={22} weight="duotone" />}
            label="Leads Ativos"
            value={activeLeads.length}
          />
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <motion.div variants={cardVariants} className="lg:col-span-2">
          <CaptacaoChart />
        </motion.div>
        <motion.div variants={cardVariants}>
          <div className="bg-surface/50 backdrop-blur-md border border-white/5 rounded-card p-5 h-full">
            <h3 className="text-sm font-medium text-gray-400 mb-4">
              Origem dos Leads
            </h3>

            {origemData.length === 0 ? (
              <div className="h-[180px] flex flex-col items-center justify-center gap-3 text-gray-600">
                <ChartBar size={32} className="opacity-30" />
                <p className="text-sm">Sem dados de origem ainda</p>
              </div>
            ) : (
              <>
                <div className="h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={origemData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={3}
                        dataKey="value"
                        stroke="none"
                      >
                        {origemData.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: '#1A1A1A',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '12px',
                          fontSize: '13px',
                          color: '#fff',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-1.5 mt-2">
                  {origemData.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-gray-400">{item.name}</span>
                      </div>
                      <span className="text-white font-medium">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>

      {/* Feedbacks badge */}
      {naoLidosFeedback > 0 && (
        <motion.div
          variants={cardVariants}
          className="bg-[#00E620]/5 border border-[#00E620]/20 rounded-2xl p-4
                     flex items-center justify-between"
        >
          <div>
            <p className="text-white font-medium text-sm">
              Novos feedbacks de alunos
            </p>
            <p className="text-gray-400 text-xs">
              {naoLidosFeedback} feedback(s) aguardando leitura
            </p>
          </div>
          <a
            href="/feedbacks"
            className="px-4 py-2 bg-[#00E620]/10 text-[#00E620] rounded-xl text-sm
                       font-medium hover:bg-[#00E620]/20 transition-colors"
          >
            Ver feedbacks
          </a>
        </motion.div>
      )}

      <motion.div variants={cardVariants}>
        <RecentLeads />
      </motion.div>
    </motion.div>
  )
}
