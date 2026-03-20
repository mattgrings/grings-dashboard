import { motion } from 'framer-motion'
import { DownloadSimple, Phone, CheckCircle, Percent, UsersThree } from '@phosphor-icons/react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { useLeadsStore } from '../store/leadsStore'
import { useChamadasStore } from '../store/chamadasStore'
import KPICard from '../components/dashboard/KPICard'
import CaptacaoChart from '../components/dashboard/CaptacaoChart'
import ChamadasTimeline from '../components/dashboard/ChamadasTimeline'
import RecentLeads from '../components/dashboard/RecentLeads'

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 25 } },
}

const origemData = [
  { name: 'Instagram', value: 35, color: '#E1306C' },
  { name: 'WhatsApp', value: 25, color: '#25D366' },
  { name: 'Indicação', value: 20, color: '#06B6D4' },
  { name: 'Tráfego Pago', value: 15, color: '#F97316' },
  { name: 'Outro', value: 5, color: '#6B7280' },
]

export default function Dashboard() {
  const leads = useLeadsStore((s) => s.leads)
  const chamadas = useChamadasStore((s) => s.chamadas)

  const today = new Date()
  const todayLeads = leads.filter((l) => {
    const d = new Date(l.criadoEm)
    return d.toDateString() === today.toDateString()
  })

  const todayChamadas = chamadas.filter((c) => {
    const d = new Date(c.dataHora)
    return d.toDateString() === today.toDateString() && c.status === 'agendada'
  })

  const realizadas = chamadas.filter((c) => c.status === 'realizada')
  const convertidos = leads.filter((l) => l.status === 'convertido')
  const activeLeads = leads.filter((l) => l.status !== 'perdido')

  const taxaConversao = leads.length > 0 ? (convertidos.length / leads.length) * 100 : 0

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
        <motion.div variants={cardVariants}>
          <KPICard
            icon={<DownloadSimple size={22} weight="duotone" />}
            label="Captações Hoje"
            value={todayLeads.length}
            change={12}
            changeLabel="vs ontem"
          />
        </motion.div>
        <motion.div variants={cardVariants}>
          <KPICard
            icon={<Phone size={22} weight="duotone" />}
            label="Chamadas Hoje"
            value={todayChamadas.length}
            change={5}
            changeLabel="agendadas"
          />
        </motion.div>
        <motion.div variants={cardVariants}>
          <KPICard
            icon={<CheckCircle size={22} weight="duotone" />}
            label="Chamadas Realizadas"
            value={realizadas.length}
            change={8}
            changeLabel="esta semana"
          />
        </motion.div>
        <motion.div variants={cardVariants}>
          <KPICard
            icon={<Percent size={22} weight="duotone" />}
            label="Taxa de Conversão"
            value={taxaConversao}
            suffix="%"
            change={3.2}
          />
        </motion.div>
        <motion.div variants={cardVariants}>
          <KPICard
            icon={<UsersThree size={22} weight="duotone" />}
            label="Leads Ativos"
            value={activeLeads.length}
            change={15}
            changeLabel="este mês"
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
            <h3 className="text-sm font-medium text-gray-400 mb-4">Origem dos Leads</h3>
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
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-gray-400">{item.name}</span>
                  </div>
                  <span className="text-white font-medium">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Chamadas Chart + Recent */}
      <motion.div variants={cardVariants}>
        <ChamadasTimeline />
      </motion.div>

      <motion.div variants={cardVariants}>
        <RecentLeads />
      </motion.div>
    </motion.div>
  )
}
