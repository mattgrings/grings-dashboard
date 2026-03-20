import { useState, useMemo } from 'react'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CaretLeft, CaretRight } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import type { Chamada } from '../../types'

interface CalendarWidgetProps {
  chamadas: Chamada[]
  selectedDate: Date
  onSelectDate: (date: Date) => void
}

export default function CalendarWidget({ chamadas, selectedDate, onSelectDate }: CalendarWidgetProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 0 })
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 0 })
    const result: Date[] = []
    let day = start
    while (day <= end) {
      result.push(day)
      day = addDays(day, 1)
    }
    return result
  }, [currentMonth])

  const getChamadasForDay = (date: Date) => {
    return chamadas.filter((c) => isSameDay(new Date(c.dataHora), date))
  }

  return (
    <div className="glow-surface relative overflow-hidden bg-surface/50 backdrop-blur-md border border-white/5 rounded-card p-5">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
          <CaretLeft size={16} />
        </button>
        <h3 className="text-sm font-medium text-white capitalize">
          {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
        </h3>
        <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
          <CaretRight size={16} />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
          <div key={day} className="text-center text-xs text-gray-600 py-1">{day}</div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => {
          const isCurrentMonth = isSameMonth(day, currentMonth)
          const isSelected = isSameDay(day, selectedDate)
          const isToday = isSameDay(day, new Date())
          const dayChamadas = getChamadasForDay(day)
          const hasEvents = dayChamadas.length > 0

          return (
            <motion.button
              key={i}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelectDate(day)}
              className={`relative aspect-square flex flex-col items-center justify-center rounded-lg text-xs transition-all ${
                !isCurrentMonth ? 'text-gray-700' :
                isSelected ? 'bg-brand-green text-black font-bold shadow-glow-green-sm' :
                isToday ? 'bg-brand-green/10 text-brand-green font-medium' :
                'text-gray-300 hover:bg-white/5'
              }`}
            >
              {format(day, 'd')}
              {hasEvents && !isSelected && (
                <div className="absolute bottom-1 flex gap-0.5">
                  {dayChamadas.slice(0, 3).map((_, j) => (
                    <div key={j} className="w-1 h-1 rounded-full bg-brand-green" />
                  ))}
                </div>
              )}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
