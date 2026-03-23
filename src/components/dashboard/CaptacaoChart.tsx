import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { format, subDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useLeadsStore } from '../../store/leadsStore'
import { ChartBar } from '@phosphor-icons/react'

export default function CaptacaoChart() {
  const leads = useLeadsStore((s) => s.leads)

  // Calcular captações REAIS dos últimos 30 dias
  const data = Array.from({ length: 30 }, (_, i) => {
    const date = subDays(new Date(), 29 - i)
    const dateStr = format(date, 'yyyy-MM-dd')

    const total = leads.filter((l) => {
      const leadDate = format(new Date(l.criadoEm), 'yyyy-MM-dd')
      return leadDate === dateStr
    }).length

    return {
      date: format(date, 'dd/MM', { locale: ptBR }),
      captacoes: total,
    }
  })

  const temDados = leads.length > 0

  return (
    <div className="glow-surface relative overflow-hidden bg-surface/50 backdrop-blur-md border border-white/5 rounded-card p-5">
      <h3 className="text-sm font-medium text-gray-400 mb-4">Captações — Últimos 30 dias</h3>

      {!temDados ? (
        <div className="h-[240px] flex flex-col items-center justify-center gap-3 text-gray-600">
          <ChartBar size={32} className="opacity-30" />
          <p className="text-sm">Nenhuma captação registrada ainda</p>
          <p className="text-xs text-gray-700">Os dados aparecerão aqui conforme você registrar leads</p>
        </div>
      ) : (
        <div className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00E620" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#00E620" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
              <XAxis
                dataKey="date"
                tick={{ fill: '#555', fontSize: 11 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.05)' }}
                tickLine={false}
                interval={4}
              />
              <YAxis
                tick={{ fill: '#555', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={30}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  background: '#1A1A1A',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  fontSize: '13px',
                  color: '#fff',
                }}
              />
              <Area
                type="monotone"
                dataKey="captacoes"
                stroke="#00E620"
                strokeWidth={2}
                fill="url(#greenGradient)"
                dot={false}
                activeDot={{ r: 4, fill: '#00E620', stroke: '#0A0A0A', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
