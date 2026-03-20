import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Area, AreaChart,
} from 'recharts'

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

const tooltipStyle = {
  background: '#1A1A1A',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '12px',
  fontSize: '13px',
  color: '#fff',
}

// Mock weekly data
const weeklyData = [
  { name: 'Sem 1', captacoes: 12, conversoes: 3 },
  { name: 'Sem 2', captacoes: 18, conversoes: 5 },
  { name: 'Sem 3', captacoes: 15, conversoes: 4 },
  { name: 'Sem 4', captacoes: 22, conversoes: 7 },
]

const monthlyData = [
  { name: 'Out', captacoes: 45, conversoes: 12 },
  { name: 'Nov', captacoes: 52, conversoes: 15 },
  { name: 'Dez', captacoes: 38, conversoes: 10 },
  { name: 'Jan', captacoes: 60, conversoes: 18 },
  { name: 'Fev', captacoes: 55, conversoes: 16 },
  { name: 'Mar', captacoes: 48, conversoes: 14 },
]

const comparecimentoData = [
  { name: 'Realizadas', value: 65, color: '#00E620' },
  { name: 'Faltaram', value: 20, color: '#EF4444' },
  { name: 'Remarcadas', value: 15, color: '#EAB308' },
]

const conversaoPorOrigem = [
  { name: 'Instagram', taxa: 28, total: 35 },
  { name: 'WhatsApp', taxa: 35, total: 25 },
  { name: 'Indicação', taxa: 45, total: 20 },
  { name: 'Tráfego Pago', taxa: 22, total: 15 },
  { name: 'Outro', taxa: 15, total: 5 },
]

// Heatmap data: hours vs days
const heatmapData = (() => {
  const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
  const hours = ['08h', '09h', '10h', '11h', '12h', '13h', '14h', '15h', '16h', '17h', '18h']
  const result: { day: string; hour: string; value: number }[] = []
  days.forEach((day) => {
    hours.forEach((hour) => {
      result.push({ day, hour, value: Math.floor(Math.random() * 10) })
    })
  })
  return result
})()

export default function Relatorios() {
  const [period, setPeriod] = useState<'semanal' | 'mensal'>('semanal')
  const data = period === 'semanal' ? weeklyData : monthlyData

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display tracking-wider text-white">RELATÓRIOS</h2>
          <p className="text-sm text-gray-500">Análise de desempenho da consultoria</p>
        </div>
        <div className="flex bg-surface border border-white/5 rounded-xl p-0.5">
          <button
            onClick={() => setPeriod('semanal')}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${period === 'semanal' ? 'bg-brand-green text-black' : 'text-gray-400 hover:text-white'}`}
          >
            Semanal
          </button>
          <button
            onClick={() => setPeriod('mensal')}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${period === 'mensal' ? 'bg-brand-green text-black' : 'text-gray-400 hover:text-white'}`}
          >
            Mensal
          </button>
        </div>
      </div>

      {/* Captações por período */}
      <motion.div variants={cardVariants} className="bg-surface/50 backdrop-blur-md border border-white/5 rounded-card p-5">
        <h3 className="text-sm font-medium text-gray-400 mb-4">
          Captações por {period === 'semanal' ? 'Semana' : 'Mês'}
        </h3>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="captGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00E620" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#00E620" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
              <XAxis dataKey="name" tick={{ fill: '#888', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#555', fontSize: 11 }} axisLine={false} tickLine={false} width={30} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="captacoes" stroke="#00E620" strokeWidth={2} fill="url(#captGrad)" name="Captações" />
              <Area type="monotone" dataKey="conversoes" stroke="#00CC00" strokeWidth={2} fill="none" strokeDasharray="5 5" name="Conversões" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Taxa de comparecimento */}
        <motion.div variants={cardVariants} className="bg-surface/50 backdrop-blur-md border border-white/5 rounded-card p-5">
          <h3 className="text-sm font-medium text-gray-400 mb-4">Taxa de Comparecimento</h3>
          <div className="flex items-center gap-6">
            <div className="h-[180px] w-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={comparecimentoData} cx="50%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={3} dataKey="value" stroke="none">
                    {comparecimentoData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3 flex-1">
              {comparecimentoData.map((item) => (
                <div key={item.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-gray-400">{item.name}</span>
                    </div>
                    <span className="text-white font-medium">{item.value}%</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${item.value}%`, backgroundColor: item.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Taxa de conversão por origem */}
        <motion.div variants={cardVariants} className="bg-surface/50 backdrop-blur-md border border-white/5 rounded-card p-5">
          <h3 className="text-sm font-medium text-gray-400 mb-4">Conversão por Origem</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={conversaoPorOrigem} layout="vertical" barSize={16}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#555', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 50]} tickFormatter={(v) => `${v}%`} />
                <YAxis type="category" dataKey="name" tick={{ fill: '#888', fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
                <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [`${value}%`, 'Taxa']} />
                <Bar dataKey="taxa" radius={[0, 8, 8, 0]} fill="#00E620" fillOpacity={0.7} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Heatmap */}
      <motion.div variants={cardVariants} className="bg-surface/50 backdrop-blur-md border border-white/5 rounded-card p-5">
        <h3 className="text-sm font-medium text-gray-400 mb-4">Melhor Dia/Horário para Captação</h3>
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            {/* Header */}
            <div className="grid grid-cols-[50px_repeat(11,1fr)] gap-1 mb-1">
              <div />
              {['08h', '09h', '10h', '11h', '12h', '13h', '14h', '15h', '16h', '17h', '18h'].map((h) => (
                <div key={h} className="text-center text-[10px] text-gray-600">{h}</div>
              ))}
            </div>
            {/* Rows */}
            {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((day) => (
              <div key={day} className="grid grid-cols-[50px_repeat(11,1fr)] gap-1 mb-1">
                <div className="text-xs text-gray-500 flex items-center">{day}</div>
                {heatmapData
                  .filter((d) => d.day === day)
                  .map((cell, i) => {
                    const opacity = Math.min(cell.value / 10, 1)
                    return (
                      <motion.div
                        key={i}
                        whileHover={{ scale: 1.3 }}
                        className="aspect-square rounded-md"
                        style={{
                          backgroundColor: `rgba(0, 230, 32, ${opacity * 0.7 + 0.05})`,
                        }}
                        title={`${cell.day} ${cell.hour}: ${cell.value} captações`}
                      />
                    )
                  })}
              </div>
            ))}
            {/* Legend */}
            <div className="flex items-center justify-end gap-1 mt-3">
              <span className="text-[10px] text-gray-600">Menos</span>
              {[0.05, 0.2, 0.4, 0.6, 0.8].map((op, i) => (
                <div key={i} className="w-3 h-3 rounded-sm" style={{ backgroundColor: `rgba(0, 230, 32, ${op})` }} />
              ))}
              <span className="text-[10px] text-gray-600">Mais</span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
