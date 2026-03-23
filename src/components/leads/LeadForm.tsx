import { useState } from 'react'
import { useLeadsStore } from '../../store/leadsStore'
import { useToast } from '../ui/Toast'
import Button from '../ui/Button'
import type { Lead, OrigemLead, StatusLead } from '../../types'

interface LeadFormProps {
  lead?: Lead | null
  onClose: () => void
}

export default function LeadForm({ lead, onClose }: LeadFormProps) {
  const addLead = useLeadsStore((s) => s.addLead)
  const updateLead = useLeadsStore((s) => s.updateLead)
  const { showToast } = useToast()

  const [nome, setNome] = useState(lead?.nome ?? '')
  const [telefone, setTelefone] = useState(lead?.telefone ?? '')
  const [instagram, setInstagram] = useState(lead?.instagram ?? '')
  const [email, setEmail] = useState(lead?.email ?? '')
  const [origem, setOrigem] = useState<OrigemLead>(lead?.origem ?? 'instagram')
  const [status, setStatus] = useState<StatusLead>(lead?.status ?? 'novo')
  const [observacoes, setObservacoes] = useState(lead?.observacoes ?? '')

  const isEditing = !!lead

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!nome.trim() || !telefone.trim()) return

    const data = {
      nome: nome.trim(),
      telefone: telefone.trim(),
      instagram: instagram.trim() || undefined,
      email: email.trim() || undefined,
      origem,
      status,
      observacoes: observacoes.trim() || undefined,
    }

    if (isEditing) {
      updateLead(lead.id, data)
      showToast('Lead atualizado com sucesso!')
    } else {
      addLead(data)
      showToast('Lead cadastrado com sucesso!')
    }

    onClose()
  }

  const inputClass =
    'w-full px-4 py-2.5 bg-surface border border-white/5 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-brand-green/30 focus:shadow-glow-green-sm transition-all'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs text-gray-400 mb-1.5">Nome *</label>
        <input
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Nome do lead"
          className={inputClass}
          required
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1.5">Telefone *</label>
        <input
          type="tel"
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
          placeholder="(00) 00000-0000"
          className={inputClass}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-400 mb-1.5">Instagram</label>
          <input
            type="text"
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            placeholder="@usuario"
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1.5">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@exemplo.com"
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-400 mb-1.5">Origem</label>
          <select
            value={origem}
            onChange={(e) => setOrigem(e.target.value as OrigemLead)}
            className={inputClass}
          >
            <option value="instagram">Instagram</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="indicacao">Indicação</option>
            <option value="trafego_pago">Tráfego Pago</option>
            <option value="outro">Outro</option>
          </select>
        </div>
        {isEditing && (
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as StatusLead)}
              className={inputClass}
            >
              <option value="novo">Novo</option>
              <option value="contactado">Contactado</option>
              <option value="agendado">Agendado</option>
              <option value="convertido">Convertido</option>
              <option value="perdido">Perdido</option>
            </select>
          </div>
        )}
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1.5">Observações</label>
        <textarea
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          placeholder="Notas sobre o lead..."
          rows={3}
          className={`${inputClass} resize-none`}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
          Cancelar
        </Button>
        <Button type="submit" className="flex-1">
          {isEditing ? 'Salvar Alterações' : 'Cadastrar Lead'}
        </Button>
      </div>
    </form>
  )
}
