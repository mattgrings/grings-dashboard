import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Camera, ArrowsClockwise } from '@phosphor-icons/react'

interface FotoPerfilUploadProps {
  fotoAtual?: string | null
  nome: string
  tamanho?: 'sm' | 'md' | 'lg' | 'xl'
  onFotoSelecionada?: (base64: string) => void
  editavel?: boolean
}

const tamanhos = {
  sm: 'w-14 h-14 text-xl',
  md: 'w-20 h-20 text-2xl',
  lg: 'w-28 h-28 text-4xl',
  xl: 'w-36 h-36 text-5xl',
}

async function comprimirImagem(file: File, maxW: number, maxH: number): Promise<File> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      let { width, height } = img

      if (width > maxW) {
        height = (height * maxW) / width
        width = maxW
      }
      if (height > maxH) {
        width = (width * maxH) / height
        height = maxH
      }

      canvas.width = width
      canvas.height = height
      canvas.getContext('2d')!.drawImage(img, 0, 0, width, height)
      canvas.toBlob(
        (blob) => {
          resolve(new File([blob!], file.name, { type: 'image/jpeg' }))
        },
        'image/jpeg',
        0.85
      )
    }
    img.src = URL.createObjectURL(file)
  })
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.readAsDataURL(file)
  })
}

export default function FotoPerfilUpload({
  fotoAtual,
  nome,
  tamanho = 'md',
  onFotoSelecionada,
  editavel = true,
}: FotoPerfilUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(fotoAtual ?? null)
  const [carregando, setCarregando] = useState(false)

  const iniciais = nome
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join('')

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return
    if (file.size > 5 * 1024 * 1024) {
      alert('Foto muito grande. Máximo 5MB.')
      return
    }

    setCarregando(true)
    const comprimida = await comprimirImagem(file, 400, 400)
    const base64 = await fileToBase64(comprimida)
    setPreview(base64)
    onFotoSelecionada?.(base64)
    setCarregando(false)
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className={`relative ${tamanhos[tamanho]} flex-shrink-0`}>
        {/* Photo or initials */}
        <div
          className={`${tamanhos[tamanho]} rounded-full overflow-hidden
                      border-2 border-[#00E620]/40
                      shadow-[0_0_20px_rgba(0,230,32,0.2)]`}
        >
          {preview ? (
            <img src={preview} alt={nome} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#00E620]/30 to-[#00E620]/10 flex items-center justify-center font-bold text-[#00E620]">
              {iniciais}
            </div>
          )}

          {/* Loading overlay */}
          {carregando && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <ArrowsClockwise size={24} className="text-[#00E620] animate-spin" />
            </div>
          )}
        </div>

        {/* Camera button */}
        {editavel && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => inputRef.current?.click()}
            className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#00E620]
                       flex items-center justify-center
                       shadow-[0_0_12px_rgba(0,230,32,0.5)] touch-manipulation"
          >
            <Camera size={16} color="#000" weight="bold" />
          </motion.button>
        )}
      </div>

      {/* Hidden input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
        }}
      />

      {editavel && (
        <button
          onClick={() => inputRef.current?.click()}
          className="text-xs text-[#00E620] hover:brightness-125 transition-all
                     touch-manipulation underline underline-offset-4"
        >
          {preview ? 'Trocar foto' : 'Adicionar foto'}
        </button>
      )}
    </div>
  )
}
