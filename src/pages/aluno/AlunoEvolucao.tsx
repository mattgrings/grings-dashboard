import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, ChartLineUp, Plus, Calculator, Pencil, Trash, X } from '@phosphor-icons/react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { useAuthStore } from '../../store/authStore'
import { supabase } from '../../lib/supabase'
import BottomSheet from '../../components/ui/BottomSheet'

interface RegistroPeso {
  id: string
  aluno_id: string
  peso_kg: number
  data: string
  imc: number | null
  observ: string
  criado_em: string
}

interface FotoEvolucao {
  id: string
  aluno_id: string
  url: string
  data_foto: string
  peso_kg: number | null
  tipo_foto: string
  observacoes: string
  enviada_por: string
  criado_em: string
}

const formatDate = (d: string) => {
  const date = new Date(d + 'T12:00:00')
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

export default function AlunoEvolucao() {
  const perfil = useAuthStore((s) => s.perfil)
  const alunoId = perfil?.id ?? ''

  const [registros, setRegistros] = useState<RegistroPeso[]>([])
  const [fotos, setFotos] = useState<FotoEvolucao[]>([])
  const [carregando, setCarregando] = useState(true)
  const [modalPeso, setModalPeso] = useState(false)
  const [editando, setEditando] = useState(false)
  const [enviandoFoto, setEnviandoFoto] = useState(false)
  const inputFotoRef = useRef<HTMLInputElement>(null)

  // Form peso
  const [peso, setPeso] = useState('')
  const [altura, setAltura] = useState('')
  const [dataPeso, setDataPeso] = useState(new Date().toISOString().split('T')[0])
  const [obs, setObs] = useState('')
  const [salvando, setSalvando] = useState(false)

  // Metas
  const [metaPeso, setMetaPeso] = useState('')
  const [alturaAtual, setAlturaAtual] = useState('')

  const carregarPesos = useCallback(async () => {
    if (!alunoId) return
    setCarregando(true)

    const { data } = await supabase
      .from('registros_peso')
      .select('*')
      .eq('aluno_id', alunoId)
      .order('data', { ascending: true })

    if (data) setRegistros(data)

    // Carregar perfil para altura/meta
    const { data: p } = await supabase
      .from('perfis')
      .select('altura_cm, meta_peso_kg')
      .eq('id', alunoId)
      .single()

    if (p) {
      setAlturaAtual(String(p.altura_cm ?? ''))
      setAltura(String(p.altura_cm ?? ''))
      setMetaPeso(String(p.meta_peso_kg ?? ''))
    }

    setCarregando(false)
  }, [alunoId])

  const carregarFotos = useCallback(async () => {
    if (!alunoId) return
    const { data } = await supabase
      .from('fotos_evolucao')
      .select('*')
      .eq('aluno_id', alunoId)
      .order('data_foto', { ascending: false })

    if (data) setFotos(data)
  }, [alunoId])

  useEffect(() => {
    carregarPesos()
    carregarFotos()
  }, [carregarPesos, carregarFotos])

  // IMC calculado
  const imc = peso && altura
    ? (Number(peso) / Math.pow(Number(altura) / 100, 2)).toFixed(1)
    : null

  const handleSalvarPeso = async () => {
    if (!peso || !alunoId) return
    setSalvando(true)

    const { error } = await supabase.from('registros_peso').insert({
      aluno_id: alunoId,
      peso_kg: Number(peso),
      data: dataPeso,
      imc: imc ? Number(imc) : null,
      observ: obs,
    })

    if (!error) {
      // Atualizar perfil com peso atual
      await supabase.from('perfis').update({
        peso_kg: Number(peso),
        altura_cm: altura ? Number(altura) : null,
        imc: imc ? Number(imc) : null,
      }).eq('id', alunoId)
    }

    setSalvando(false)
    if (!error) {
      setModalPeso(false)
      setPeso('')
      setObs('')
      setDataPeso(new Date().toISOString().split('T')[0])
      carregarPesos()
    }
  }

  const salvarMeta = async () => {
    if (!alunoId) return
    await supabase.from('perfis').update({
      meta_peso_kg: metaPeso ? Number(metaPeso) : null,
      altura_cm: alturaAtual ? Number(alturaAtual) : null,
    }).eq('id', alunoId)
    setEditando(false)
    carregarPesos()
  }

  const deletarPeso = async (id: string) => {
    await supabase.from('registros_peso').delete().eq('id', id)
    carregarPesos()
  }

  const handleUploadFoto = async (file: File) => {
    if (!file || !alunoId) return
    setEnviandoFoto(true)

    const nomeArquivo = `${alunoId}/${Date.now()}-${file.name}`
    const { error: uploadError } = await supabase.storage
      .from('fotos-evolucao')
      .upload(nomeArquivo, file, { upsert: false })

    if (uploadError) {
      console.error('Erro no upload:', uploadError)
      setEnviandoFoto(false)
      return
    }

    const { data: urlData } = supabase.storage
      .from('fotos-evolucao')
      .getPublicUrl(nomeArquivo)

    await supabase.from('fotos_evolucao').insert({
      aluno_id: alunoId,
      url: urlData.publicUrl,
      data_foto: new Date().toISOString().split('T')[0],
      enviada_por: 'aluno',
    })

    // Notificação para o admin
    const { data: alunoData } = await supabase
      .from('perfis')
      .select('nome')
      .eq('id', alunoId)
      .single()

    await supabase.from('notificacoes').insert({
      tipo: 'nova_foto',
      titulo: `Nova foto de ${alunoData?.nome ?? 'aluno'}`,
      mensagem: `${alunoData?.nome} enviou uma nova foto de evolucao`,
      aluno_id: alunoId,
      lida: false,
    }).catch(() => {})

    setEnviandoFoto(false)
    carregarFotos()
  }

  // Dados para o gráfico
  const dadosGrafico = registros.map((r) => ({
    data: formatDate(r.data),
    peso: r.peso_kg,
  }))

  // Resumo
  const pesoAtual = registros.length > 0 ? registros[registros.length - 1].peso_kg : null
  const pesoInicial = registros.length > 0 ? registros[0].peso_kg : null
  const imcAtual = registros.length > 0 ? registros[registros.length - 1].imc : null
  const semDados = !pesoAtual && !metaPeso

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#00E620]/10 flex items-center justify-center">
            <ChartLineUp size={22} className="text-[#00E620]" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-display text-white tracking-wider">MINHA EVOLUCAO</h1>
            <p className="text-gray-500 text-sm">Acompanhe seu progresso ao longo do tempo</p>
          </div>
        </div>
      </motion.div>

      {/* ── RESUMO DO PROGRESSO ─────────────────── */}
      {semDados && !editando ? (
        <div className="bg-[#111111] border border-dashed border-white/10 rounded-2xl p-5 text-center space-y-3">
          <ChartLineUp size={32} className="mx-auto text-gray-600 opacity-40" />
          <p className="text-gray-400 text-sm">
            Adicione suas informacoes para ver o resumo do progresso
          </p>
          <button
            onClick={() => setEditando(true)}
            className="px-4 py-2 rounded-xl border border-[#00E620]/30 text-[#00E620] text-sm touch-manipulation hover:bg-[#00E620]/10 transition-all"
          >
            + Preencher dados
          </button>
        </div>
      ) : (
        <div className="bg-[#111111] border border-white/5 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white">Resumo do Progresso</h3>
            <button
              onClick={() => setEditando(!editando)}
              className="text-xs text-[#00E620] hover:brightness-125 transition-all touch-manipulation flex items-center gap-1"
            >
              {editando ? <X size={14} /> : <Pencil size={14} />}
              {editando ? 'Fechar' : 'Editar metas'}
            </button>
          </div>

          {editando ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-400">Altura (cm)</label>
                  <input
                    type="number"
                    value={alturaAtual}
                    onChange={(e) => setAlturaAtual(e.target.value)}
                    placeholder="Ex: 175"
                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-3 py-2.5 text-white text-center outline-none focus:border-[#00E620] transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-400">Meta de peso (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={metaPeso}
                    onChange={(e) => setMetaPeso(e.target.value)}
                    placeholder="Ex: 70"
                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-3 py-2.5 text-white text-center outline-none focus:border-[#00E620] transition-colors"
                  />
                </div>
              </div>
              <button
                onClick={salvarMeta}
                className="w-full py-2.5 rounded-xl bg-[#00E620] text-black font-bold text-sm touch-manipulation"
              >
                Salvar
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Peso atual', valor: pesoAtual ? `${pesoAtual} kg` : '-', icone: 'balance', cor: '#00E620' },
                { label: 'Peso inicial', valor: pesoInicial ? `${pesoInicial} kg` : '-', icone: 'calendar', cor: '#888' },
                {
                  label: 'IMC',
                  valor: imcAtual ? Number(imcAtual).toFixed(1) : '-',
                  icone: 'chart',
                  cor: imcAtual
                    ? Number(imcAtual) < 18.5 ? '#3B82F6'
                    : Number(imcAtual) < 25 ? '#00E620'
                    : Number(imcAtual) < 30 ? '#FFB800'
                    : '#FF4444'
                    : '#888',
                },
                { label: 'Meta', valor: metaPeso ? `${metaPeso} kg` : '-', icone: 'target', cor: '#FFB800' },
              ].map((item) => (
                <div key={item.label} className="bg-[#0A0A0A] rounded-xl p-3 text-center">
                  <p className="text-lg font-bold" style={{ color: item.cor }}>
                    {item.valor}
                  </p>
                  <p className="text-xs text-gray-500">{item.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── GRAFICO DE PESO ──────────────────────── */}
      <div className="bg-[#111111] border border-white/5 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-white flex items-center gap-2">
            <ChartLineUp size={20} className="text-[#00E620]" />
            Peso ao longo do tempo
          </h3>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setModalPeso(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#00E620] text-black font-bold text-xs touch-manipulation shadow-[0_0_10px_rgba(0,230,32,0.3)]"
          >
            <Plus size={16} weight="bold" />
            Registrar peso
          </motion.button>
        </div>

        {carregando ? (
          <div className="py-12 text-center">
            <div className="w-8 h-8 border-2 border-[#00E620] border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : dadosGrafico.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <ChartLineUp size={40} className="mx-auto text-gray-600 opacity-30" />
            <p className="text-gray-400 text-sm">Nenhum registro ainda</p>
            <p className="text-gray-600 text-xs">Registre seu peso para ver o grafico de evolucao</p>
            <button
              onClick={() => setModalPeso(true)}
              className="px-4 py-2 rounded-xl border border-[#00E620]/30 text-[#00E620] text-sm touch-manipulation hover:bg-[#00E620]/10 transition-all"
            >
              + Adicionar primeiro registro
            </button>
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={dadosGrafico} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="data" tick={{ fontSize: 11, fill: '#666' }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#666' }}
                  axisLine={false}
                  tickLine={false}
                  domain={['dataMin - 2', 'dataMax + 2']}
                  unit="kg"
                />
                <Tooltip
                  contentStyle={{
                    background: '#141414',
                    border: '1px solid rgba(0,230,32,0.2)',
                    borderRadius: 12,
                  }}
                  labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                  formatter={(v: number) => [`${v} kg`, 'Peso']}
                />
                <Line
                  type="monotone"
                  dataKey="peso"
                  stroke="#00E620"
                  strokeWidth={2.5}
                  dot={{ fill: '#00E620', r: 5, strokeWidth: 0 }}
                  activeDot={{ r: 7, fill: '#00E620' }}
                />
              </LineChart>
            </ResponsiveContainer>

            {/* Lista de registros */}
            <div className="space-y-2 pt-2 border-t border-white/5">
              <p className="text-xs text-gray-400 font-medium">Historico</p>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {[...registros].reverse().map((r) => (
                  <div key={r.id} className="flex items-center justify-between bg-[#0A0A0A] rounded-xl px-3 py-2">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-white">{r.peso_kg} kg</span>
                      {r.imc && <span className="text-xs text-gray-500">IMC {Number(r.imc).toFixed(1)}</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">{formatDate(r.data)}</span>
                      <button
                        onClick={() => deletarPeso(r.id)}
                        className="p-1 rounded-lg text-gray-600 hover:text-red-400 transition-colors touch-manipulation"
                      >
                        <Trash size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── FOTOS DE EVOLUCAO ────────────────────── */}
      <div className="bg-[#111111] border border-white/5 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-white flex items-center gap-2">
            <Camera size={20} className="text-[#00E620]" />
            Fotos de Evolucao
          </h3>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => inputFotoRef.current?.click()}
            disabled={enviandoFoto}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#00E620] text-black font-bold text-xs touch-manipulation disabled:opacity-50"
          >
            {enviandoFoto ? (
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <Plus size={16} weight="bold" />
            )}
            {enviandoFoto ? 'Enviando...' : 'Adicionar foto'}
          </motion.button>
        </div>

        <input
          ref={inputFotoRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleUploadFoto(file)
            e.target.value = ''
          }}
        />

        {fotos.length === 0 ? (
          <div className="py-10 text-center space-y-2">
            <Camera size={36} className="mx-auto text-gray-600 opacity-30" />
            <p className="text-gray-400 text-sm">Nenhuma foto ainda</p>
            <button
              onClick={() => inputFotoRef.current?.click()}
              className="text-xs text-[#00E620] hover:brightness-125 transition-all touch-manipulation"
            >
              + Adicionar primeira foto
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {fotos.map((foto) => (
              <div key={foto.id} className="relative aspect-square group">
                <img
                  src={foto.url}
                  alt="Evolucao"
                  className="w-full h-full object-cover rounded-xl"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent rounded-b-xl px-2 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-white text-xs">
                    {formatDate(foto.data_foto)}
                  </p>
                  {foto.tipo_foto && foto.tipo_foto !== 'frente' && (
                    <p className="text-gray-300 text-[10px] capitalize">{foto.tipo_foto}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── MODAL REGISTRAR PESO ─────────────────── */}
      <BottomSheet
        aberto={modalPeso}
        onFechar={() => setModalPeso(false)}
        titulo="Registrar Peso"
        botaoPrimario={{
          label: salvando ? 'Salvando...' : 'Salvar Registro',
          loading: salvando,
          disabled: !peso || salvando,
          onClick: handleSalvarPeso,
        }}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm text-gray-400">Peso (kg) *</label>
              <input
                type="number"
                step="0.1"
                value={peso}
                onChange={(e) => setPeso(e.target.value)}
                placeholder="Ex: 75.5"
                className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-white text-center text-xl font-bold outline-none focus:border-[#00E620] transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm text-gray-400">Altura (cm)</label>
              <input
                type="number"
                value={altura}
                onChange={(e) => setAltura(e.target.value)}
                placeholder="Ex: 175"
                className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-white text-center text-xl font-bold outline-none focus:border-[#00E620] transition-colors"
              />
            </div>
          </div>

          {/* IMC calculado */}
          <AnimatePresence>
            {imc && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-[#00E620]/10 border border-[#00E620]/20"
              >
                <Calculator size={20} className="text-[#00E620]" />
                <div>
                  <p className="text-sm font-bold text-white">IMC: {imc}</p>
                  <p className="text-xs text-gray-400">
                    {Number(imc) < 18.5
                      ? 'Abaixo do peso'
                      : Number(imc) < 25
                      ? 'Peso normal'
                      : Number(imc) < 30
                      ? 'Sobrepeso'
                      : 'Obesidade'}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-1.5">
            <label className="text-sm text-gray-400">Data</label>
            <input
              type="date"
              value={dataPeso}
              onChange={(e) => setDataPeso(e.target.value)}
              className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#00E620] transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm text-gray-400">Observacoes (opcional)</label>
            <textarea
              value={obs}
              onChange={(e) => setObs(e.target.value)}
              placeholder="Como voce esta se sentindo..."
              rows={2}
              className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 outline-none resize-none focus:border-[#00E620] transition-colors text-base"
            />
          </div>
        </div>
      </BottomSheet>
    </div>
  )
}
