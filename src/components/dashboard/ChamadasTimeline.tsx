import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts'

const data = [
  { name: 'Agendadas', value: 5, color: '#3B82F6' },
  { name: 'Realizadas', value: 8, color: '#00E620' },
  { name: 'Faltaram', value: 2, color: '#EF4444' },
  { name: 'Remarcadas', value: 3, color: '#EAB308' },
]

export default function ChamadasTimeline() {
  return (
    <div className="glow-surface relative overflow-hidden bg-surface/50 backdrop-blur-md border border-white/5 rounded-card p-5">
      <h3 className="text-sm font-medium text-gray-400 mb-4">Chamadas da Semana</h3>
      <div className="h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barSize={40}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fill: '#888', fontSize: 12 }}
              axisLine={{ stroke: 'rgba(255,255,255,0.05)' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#555', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={30}
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
            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.color} fillOpacity={0.8} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
