import { useState } from 'react'
import { useLeadsStore } from '../../store/leadsStore'
import { useChamadasStore } from '../../store/chamadasStore'
import { useGoogleCalendar } from '../../hooks/useGoogleCalendar'
import { useNotionCalendar } from '../../hooks/useNotionCalendar'
import { useToast } from '../ui/Toast'
import Button from '../ui/Button'
import { GoogleLogo, NotionLogo, CheckCircle } from '@phosphor-icons/react'

interface EventModalProps {
  onClose: () => void
  defaultDate?: Date
}

export default function EventModal({ onClose, defaultDate }: EventModalProps) {
  const leads = useLeadsStore((s) => s.leads)
  const addChamada = useChamadasStore((s) => s.addChamada)
  const updateLead = useLeadsStore((s) => s.updateLead)
  const { syncEvent, loading: gcalLoading, synced: gcalSynced } = useGoogleCalendar()
  const { syncEntry, loading: notionLoading, synced: notionSynced } = useNotionCalendar()
  const { showToast } = useToast()

  const [leadId, setLeadId] = useState('')
  const [searchLead, setSearchLead] = useState('')
  const [date, setDate] = useState(defaultDate ? defaultDate.toISOString().split('T')[0] : '')
  const [time, setTime] = useState('')
  const [duration, setDuration] = useState('30')
  const [notes, setNotes] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)

  const filteredLeads = leads.filter(
    (l) =>
      l.status !== 'convertido' &&
      l.status !== 'perdido' &&
      (searchLead === '' || l.nome.toLowerCase().includes(searchLead.toLowerCase()))
  )

  const selectedLead = leads.find((l) => l.id === leadId)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!leadId || !date || !time) return

    const dataHora = new Date(`${date}T${time}`)
    addChamada({
      leadId,
      dataHora,
      duracao: parseInt(duration),
      status: 'agendada',
      notas: notes || undefined,
    })
    updateLead(leadId, { status: 'agendado' })
    showToast('Chamada agendada com sucesso!')
    onClose()
  }

  const handleGoogleSync = async () => {
    if (!selectedLead || !date || !time) return
    await syncEvent(selectedLead.nome, `${date}T${time}`, parseInt(duration))
    showToast('Sincronizado com Google Calendar!')
  }

  const handleNotionSync = async () => {
    if (!selectedLead || !date || !time) return
    await syncEntry(selectedLead.nome, selectedLead.telefone, `${date}T${time}`, 'agendada')
    showToast('Sincronizado com Notion Calendar!')
  }

  const inputClass =
    'w-full px-4 py-2.5 bg-surface border border-white/5 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-brand-green/30 focus:shadow-glow-green-sm transition-all'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Lead autocomplete */}
      <div className="relative">
        <label className="block text-xs text-gray-400 mb-1.5">Lead *</label>
        {selectedLead ? (
          <div className="flex items-center gap-3 p-3 bg-surface rounded-xl border border-brand-green/20">
            <div className="w-8 h-8 rounded-full bg-brand-green/15 flex items-center justify-center text-brand-green text-xs font-bold">
              {selectedLead.nome.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="text-sm text-white">{selectedLead.nome}</p>
              <p className="text-xs text-gray-500">{selectedLead.telefone}</p>
            </div>
            <button type="button" onClick={() => { setLeadId(''); setSearchLead('') }} className="text-xs text-gray-500 hover:text-white">Trocar</button>
          </div>
        ) : (
          <div className="relative">
            <input
              type="text"
              value={searchLead}
              onChange={(e) => { setSearchLead(e.target.value); setShowDropdown(true) }}
              onFocus={() => setShowDropdown(true)}
              placeholder="Buscar lead por nome..."
              className={inputClass}
            />
            {showDropdown && filteredLeads.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-surface-raised border border-white/10 rounded-xl max-h-48 overflow-y-auto z-10 shadow-xl">
                {filteredLeads.map((lead) => (
                  <button
                    key={lead.id}
                    type="button"
                    onClick={() => { setLeadId(lead.id); setSearchLead(''); setShowDropdown(false) }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 transition-colors text-left"
                  >
                    <div className="w-7 h-7 rounded-full bg-brand-green/15 flex items-center justify-center text-brand-green text-[10px] font-bold">
                      {lead.nome.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm text-white">{lead.nome}</p>
                      <p className="text-xs text-gray-500">{lead.telefone}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-400 mb-1.5">Data *</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} required />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1.5">Horário *</label>
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className={inputClass} required />
        </div>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1.5">Duração</label>
        <select value={duration} onChange={(e) => setDuration(e.target.value)} className={inputClass}>
          <option value="15">15 minutos</option>
          <option value="30">30 minutos</option>
          <option value="45">45 minutos</option>
          <option value="60">60 minutos</option>
        </select>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1.5">Notas</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notas da chamada..." rows={2} className={`${inputClass} resize-none`} />
      </div>

      {/* Integration buttons */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleGoogleSync}
          disabled={gcalLoading || !selectedLead}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-surface border border-white/5 rounded-xl text-xs text-gray-400 hover:text-white hover:border-white/10 transition-all disabled:opacity-30"
        >
          {gcalSynced ? <CheckCircle size={14} className="text-brand-green" /> : <GoogleLogo size={14} />}
          {gcalSynced ? 'Sincronizado' : 'Google Calendar'}
        </button>
        <button
          type="button"
          onClick={handleNotionSync}
          disabled={notionLoading || !selectedLead}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-surface border border-white/5 rounded-xl text-xs text-gray-400 hover:text-white hover:border-white/10 transition-all disabled:opacity-30"
        >
          {notionSynced ? <CheckCircle size={14} className="text-brand-green" /> : <NotionLogo size={14} />}
          {notionSynced ? 'Sincronizado' : 'Notion Calendar'}
        </button>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onClose} className="flex-1">Cancelar</Button>
        <Button type="submit" className="flex-1" disabled={!leadId || !date || !time}>Agendar Chamada</Button>
      </div>
    </form>
  )
}
