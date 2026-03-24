import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Calculator, Pencil, X } from '@phosphor-icons/react'
import BottomSheet from '../ui/BottomSheet'
import type { Aluno } from '../../types'

interface ModalEditarAlunoProps {
  aberto: boolean
  aluno: Aluno | null
  onFechar: () => void
  onSalvo: (dadosAtualizados: Partial<Aluno>) => void
}

type Aba = 'dados' | 'plano' | 'fisico'

export default function ModalEditarAluno({
  aberto,
  aluno,
  onFechar,
  onSalvo,
}: ModalEditarAlunoProps) {
  const [aba, setAba] = useState<Aba>('dados')
  const [salvando, setSalvando] = useState(false)
  const [sucesso, setSucesso] = useState(false)

  const [form, setForm] = useState({
    nome: '',
    telefone: '',
    instagram: '',
    pesoInicial: '',
    alturaM: '',
    objetivo: '' as string,
    status: 'ativo' as string,
    plano: '',
    vencimento: '',
    dataInicio: '',
    observacoes: '',
  })

  useEffect(() => {
    if (aberto && aluno) {
      setForm({
        nome: aluno.nome ?? '',
        telefone: aluno.telefone ?? '',
        instagram: aluno.instagram ?? '',
        pesoInicial: String(aluno.pesoInicial ?? ''),
        alturaM: String(aluno.alturaM ?? ''),
        objetivo: aluno.objetivo ?? '',
        status: aluno.status ?? 'ativo',
        plano: aluno.plano ?? '',
        vencimento: aluno.vencimento ?? '',
        dataInicio: aluno.dataInicio
          ? new Date(aluno.dataInicio).toISOString().split('T')[0]
          : '',
        observacoes: aluno.observacoes ?? '',
      })
      setSucesso(false)
      setAba('dados')
    }
  }, [aberto, aluno])

  const set = (campo: string, valor: string | boolean) =>
    setForm((f) => ({ ...f, [campo]: valor }))

  const handleSalvar = () => {
    if (!aluno) return
    setSalvando(true)

    const dados: Partial<Aluno> = {
      nome: form.nome.trim(),
      telefone: form.telefone.trim(),
      instagram: form.instagram.trim() || undefined,
      pesoInicial: form.pesoInicial ? Number(form.pesoInicial) : undefined,
      alturaM: form.alturaM ? Number(form.alturaM) : undefined,
      objetivo: form.objetivo as Aluno['objetivo'],
      status: form.status as Aluno['status'],
      plano: (form.plano || undefined) as Aluno['plano'],
      vencimento: form.vencimento || undefined,
      dataInicio: form.dataInicio ? new Date(form.dataInicio) : aluno.dataInicio,
      observacoes: form.observacoes.trim() || undefined,
      atualizadoEm: new Date(),
    }

    onSalvo(dados)
    setSalvando(false)
    setSucesso(true)
    setTimeout(() => {
      setSucesso(false)
      onFechar()
    }, 1200)
  }

  // IMC calculado
  const imcCalc =
    form.pesoInicial && form.alturaM
      ? (Number(form.pesoInicial) / Math.pow(Number(form.alturaM), 2)).toFixed(1)
      : null

  const inputClass =
    'w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 outline-none focus:border-[#00E620] transition-colors text-base'

  return (
    <BottomSheet
      aberto={aberto}
      onFechar={onFechar}
      titulo={`Editar: ${aluno?.nome ?? 'Aluno'}`}
      botaoPrimario={{
        label: sucesso
          ? 'Salvo!'
          : salvando
          ? 'Salvando...'
          : 'Salvar Alteracoes',
        loading: salvando,
        onClick: handleSalvar,
      }}
    >
      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {(
          [
            { id: 'dados', label: 'Dados' },
            { id: 'plano', label: 'Plano' },
            { id: 'fisico', label: 'Fisico' },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            onClick={() => setAba(t.id)}
            className={`flex-1 py-2.5 rounded-xl text-xs font-medium border transition-all touch-manipulation ${
              aba === t.id
                ? 'border-[#00E620] bg-[#00E620]/10 text-[#00E620]'
                : 'border-white/10 text-gray-400'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ABA DADOS */}
        {aba === 'dados' && (
          <motion.div
            key="dados"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <label className="text-sm text-gray-400 font-medium">Nome *</label>
              <input
                value={form.nome}
                onChange={(e) => set('nome', e.target.value)}
                className={inputClass}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm text-gray-400 font-medium">Telefone</label>
              <input
                value={form.telefone}
                onChange={(e) => set('telefone', e.target.value)}
                type="tel"
                className={inputClass}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm text-gray-400 font-medium">Instagram</label>
              <input
                value={form.instagram}
                onChange={(e) => set('instagram', e.target.value)}
                placeholder="@usuario"
                className={inputClass}
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <label className="text-sm text-gray-400 font-medium">Status</label>
              <div className="flex gap-2">
                {(
                  [
                    { id: 'ativo', label: 'Ativo', cor: 'bg-[#00E620]' },
                    { id: 'pausado', label: 'Pausado', cor: 'bg-yellow-500' },
                    { id: 'cancelado', label: 'Cancelado', cor: 'bg-red-500' },
                  ] as const
                ).map((s) => (
                  <button
                    key={s.id}
                    onClick={() => set('status', s.id)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-medium border transition-all touch-manipulation ${
                      form.status === s.id
                        ? `${s.cor} text-black font-bold border-transparent`
                        : 'border-white/10 text-gray-400'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Objetivo */}
            <div className="space-y-2">
              <label className="text-sm text-gray-400 font-medium">Objetivo</label>
              <div className="flex flex-wrap gap-2">
                {[
                  'emagrecimento',
                  'hipertrofia',
                  'saude',
                  'performance',
                  'reabilitacao',
                ].map((obj) => (
                  <button
                    key={obj}
                    onClick={() =>
                      set('objetivo', form.objetivo === obj ? '' : obj)
                    }
                    className={`px-3 py-2 rounded-xl text-xs border transition-all touch-manipulation capitalize ${
                      form.objetivo === obj
                        ? 'bg-[#00E620] text-black font-bold border-[#00E620]'
                        : 'border-white/10 text-gray-400'
                    }`}
                  >
                    {obj}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm text-gray-400 font-medium">
                Observacoes
              </label>
              <textarea
                value={form.observacoes}
                onChange={(e) => set('observacoes', e.target.value)}
                placeholder="Lesoes, restricoes, informacoes..."
                rows={3}
                className={`${inputClass} resize-none`}
              />
            </div>
          </motion.div>
        )}

        {/* ABA PLANO */}
        {aba === 'plano' && (
          <motion.div
            key="plano"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            {/* Plano contratado */}
            <div className="space-y-2">
              <label className="text-sm text-gray-400 font-medium">
                Plano contratado
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  'Mensal',
                  'Trimestral',
                  'Semestral',
                  'Anual',
                  'Personal',
                  'Parceria',
                ].map((p) => (
                  <button
                    key={p}
                    onClick={() => set('plano', form.plano === p ? '' : p)}
                    className={`px-3 py-2.5 rounded-xl text-sm border transition-all touch-manipulation ${
                      form.plano === p
                        ? 'bg-[#00E620] text-black font-bold border-[#00E620]'
                        : 'border-white/10 text-gray-400 hover:border-[#00E620]/40'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Datas */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm text-gray-400">Data inicio</label>
                <input
                  type="date"
                  value={form.dataInicio}
                  onChange={(e) => set('dataInicio', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm text-gray-400">Vencimento</label>
                <input
                  type="date"
                  value={form.vencimento}
                  onChange={(e) => set('vencimento', e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* ABA FISICO */}
        {aba === 'fisico' && (
          <motion.div
            key="fisico"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm text-gray-400">Peso (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={form.pesoInicial}
                  onChange={(e) => set('pesoInicial', e.target.value)}
                  placeholder="75.5"
                  className={`${inputClass} text-center`}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm text-gray-400">Altura (m)</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.alturaM}
                  onChange={(e) => set('alturaM', e.target.value)}
                  placeholder="1.75"
                  className={`${inputClass} text-center`}
                />
              </div>
            </div>

            {/* IMC calculado */}
            {imcCalc && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-3 rounded-xl bg-[#00E620]/10 border border-[#00E620]/20 flex items-center gap-3"
              >
                <Calculator size={20} className="text-[#00E620]" />
                <div>
                  <p className="font-bold text-white">IMC: {imcCalc}</p>
                  <p className="text-xs text-gray-400">
                    {Number(imcCalc) < 18.5
                      ? 'Abaixo do peso'
                      : Number(imcCalc) < 25
                      ? 'Peso normal'
                      : Number(imcCalc) < 30
                      ? 'Sobrepeso'
                      : 'Obesidade'}
                  </p>
                </div>
              </motion.div>
            )}

            <div className="p-3 rounded-xl bg-[#111111] border border-white/5">
              <p className="text-xs text-gray-500">
                O peso e IMC serao atualizados automaticamente quando o aluno
                registrar novos pesos na area de Evolucao.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </BottomSheet>
  )
}
