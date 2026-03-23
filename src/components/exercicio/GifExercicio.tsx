import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  UploadSimple,
  Trash,
  Link as LinkIcon,
  Image,
  ArrowsClockwise,
} from '@phosphor-icons/react'
import { supabase } from '../../lib/supabase'

interface GifExercicioProps {
  gifUrl?: string
  gifBase64?: string
  onChange: (data: { gifUrl: string; gifBase64: string }) => void
  editavel?: boolean
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function GifExercicio({
  gifUrl,
  gifBase64,
  onChange,
  editavel = false,
}: GifExercicioProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [carregando, setCarregando] = useState(false)
  const [modoUrl, setModoUrl] = useState(false)
  const [urlInput, setUrlInput] = useState(gifUrl ?? '')

  const gifFinal = gifBase64 || gifUrl

  const handleUploadGif = async (file: File) => {
    if (!file.type.includes('gif') && !file.type.startsWith('image/')) {
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      return
    }

    setCarregando(true)

    // Tenta upload no Supabase Storage
    const nomeArquivo = `gif-exercicio-${Date.now()}.gif`
    const { data, error } = await supabase.storage
      .from('exercicios-gifs')
      .upload(nomeArquivo, file, { upsert: true })

    if (!error && data) {
      const { data: urlData } = supabase.storage
        .from('exercicios-gifs')
        .getPublicUrl(nomeArquivo)
      onChange({ gifUrl: urlData.publicUrl, gifBase64: '' })
    } else {
      // Fallback: base64
      const base64 = await fileToBase64(file)
      onChange({ gifUrl: '', gifBase64: base64 })
    }

    setCarregando(false)
  }

  return (
    <div className="space-y-2">
      <label className="text-sm text-gray-400 font-medium flex items-center gap-2">
        GIF de demonstração do exercício
      </label>

      {/* Preview do GIF */}
      {gifFinal ? (
        <div className="relative rounded-2xl overflow-hidden border border-white/5 bg-[#111111] aspect-video">
          <img
            src={gifFinal}
            alt="Demonstração do exercício"
            className="w-full h-full object-contain"
          />

          {/* Overlay com opções */}
          {editavel && (
            <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00E620]
                           text-black font-bold text-sm touch-manipulation"
              >
                <UploadSimple size={18} />
                Trocar GIF
              </button>
              <button
                type="button"
                onClick={() => onChange({ gifUrl: '', gifBase64: '' })}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/80
                           text-white font-bold text-sm touch-manipulation"
              >
                <Trash size={18} />
                Remover
              </button>
            </div>
          )}

          {/* Badge GIF */}
          <div className="absolute top-2 left-2 bg-black/60 text-[#00E620] text-xs font-bold px-2 py-1 rounded-lg">
            GIF
          </div>
        </div>
      ) : editavel ? (
        /* Estado vazio — área de upload */
        <div className="rounded-2xl border-2 border-dashed border-white/10 bg-[#111111] aspect-video flex flex-col items-center justify-center gap-3 text-gray-500">
          <div className="w-14 h-14 rounded-2xl bg-[#0A0A0A] flex items-center justify-center">
            <Image size={30} className="opacity-50" />
          </div>

          <div className="text-center px-4">
            <p className="text-sm font-medium">Adicionar GIF do exercício</p>
            <p className="text-xs opacity-60 mt-1">Arraste um GIF aqui ou use uma URL</p>
          </div>

          <div className="flex gap-2">
            <motion.button
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => inputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00E620]
                         text-black font-bold text-sm touch-manipulation"
            >
              <UploadSimple size={18} />
              Upload GIF
            </motion.button>

            <button
              type="button"
              onClick={() => setModoUrl(!modoUrl)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10
                         text-gray-500 text-sm touch-manipulation hover:text-white
                         hover:border-[#00E620] transition-all"
            >
              <LinkIcon size={18} />
              Colar URL
            </button>
          </div>

          {/* Input de URL */}
          <AnimatePresence>
            {modoUrl && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="w-full px-4 overflow-hidden"
              >
                <div className="flex gap-2">
                  <input
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://..."
                    type="url"
                    className="flex-1 h-10 rounded-xl bg-[#0A0A0A] border border-white/10
                               text-white text-sm px-3 outline-none focus:border-[#00E620]
                               transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (urlInput.trim()) onChange({ gifUrl: urlInput.trim(), gifBase64: '' })
                    }}
                    className="h-10 px-4 rounded-xl bg-[#00E620] text-black font-bold text-sm touch-manipulation"
                  >
                    OK
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {carregando && (
            <div className="flex items-center gap-2 text-[#00E620] text-sm">
              <ArrowsClockwise size={16} className="animate-spin" />
              Enviando GIF...
            </div>
          )}
        </div>
      ) : null}

      {/* Input oculto */}
      <input
        ref={inputRef}
        type="file"
        accept="image/gif,image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleUploadGif(file)
        }}
      />
    </div>
  )
}
