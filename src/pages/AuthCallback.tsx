import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import Logo from '../components/ui/Logo'
import GreenLedBackground from '../components/ui/GreenLedBackground'

export default function AuthCallback() {
  const navigate = useNavigate()
  const carregarPerfil = useAuthStore((s) => s.carregarPerfil)

  useEffect(() => {
    const handleCallback = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession()

      if (error || !session) {
        navigate('/', { replace: true })
        return
      }

      await carregarPerfil()

      const { data: perfil } = await supabase
        .from('perfis')
        .select('perfil')
        .eq('id', session.user.id)
        .single()

      navigate(perfil?.perfil === 'admin' ? '/' : '/aluno', { replace: true })
    }

    handleCallback()
  }, [navigate, carregarPerfil])

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center relative">
      <GreenLedBackground />
      <div className="text-center space-y-4 relative z-10">
        <Logo size="lg" animated />
        <p className="text-gray-500 text-sm animate-pulse">Entrando na sua conta...</p>
      </div>
    </div>
  )
}
