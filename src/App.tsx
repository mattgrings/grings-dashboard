import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ToastProvider } from './components/ui/Toast'
import ScrollRestoration from './components/ui/ScrollRestoration'
import Layout from './components/layout/Layout'
import AlunoLayout from './components/layout/AlunoLayout'
import Dashboard from './pages/Dashboard'
import Captacoes from './pages/Captacoes'
import Relatorios from './pages/Relatorios'
import Alunos from './pages/Alunos'
import PerfilAluno from './pages/PerfilAluno'
import Tarefas from './pages/Tarefas'
import Financeiro from './pages/Financeiro'
import SocialSelling from './pages/SocialSelling'
import Frequencia from './pages/Frequencia'
import Feedbacks from './pages/Feedbacks'
import Treinos from './pages/Treinos'
import Chat from './pages/Chat'
import Configuracoes from './pages/Configuracoes'
import AlunoDashboard from './pages/aluno/AlunoDashboard'
import AlunoTreino from './pages/aluno/AlunoTreino'
import AlunoDieta from './pages/aluno/AlunoDieta'
import AlunoEvolucao from './pages/aluno/AlunoEvolucao'
import AlunoCalculadoras from './pages/aluno/AlunoCalculadoras'
import AlunoFrequencia from './pages/aluno/AlunoFrequencia'
import AlunoFeedback from './pages/aluno/AlunoFeedback'
import Login from './pages/Login'
import RedefinirSenha from './pages/RedefinirSenha'
import AuthCallback from './pages/AuthCallback'
import { useAuthStore } from './store/authStore'
import InstallPrompt from './components/ui/InstallPrompt'
import Logo from './components/ui/Logo'
import GreenLedBackground from './components/ui/GreenLedBackground'

/* ───────── SplashScreen ───────── */
function SplashScreen() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center relative">
      <GreenLedBackground />
      <div className="text-center space-y-4 relative z-10">
        <Logo size="lg" animated />
        <p className="text-gray-600 text-sm animate-pulse">Carregando...</p>
      </div>
    </div>
  )
}

/* ───────── App ───────── */
export default function App() {
  const inicializado = useAuthStore((s) => s.inicializado)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const user = useAuthStore((s) => s.user)
  const inicializar = useAuthStore((s) => s.inicializar)

  // Safety timeout — nunca trava no splash por mais de 4s
  const [forcarSaida, setForcarSaida] = useState(false)

  useEffect(() => {
    inicializar()
  }, [inicializar])

  useEffect(() => {
    if (inicializado) return
    const timer = setTimeout(() => setForcarSaida(true), 4000)
    return () => clearTimeout(timer)
  }, [inicializado])

  // Mostra splash até inicializar (ou timeout)
  if (!inicializado && !forcarSaida) {
    return <SplashScreen />
  }

  // Não autenticado — mostra login
  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/redefinir-senha" element={<RedefinirSenha />} />
        <Route
          path="*"
          element={
            <>
              <Login />
              <InstallPrompt />
            </>
          }
        />
      </Routes>
    )
  }

  // Autenticado
  const isAluno = user?.role === 'aluno'

  return (
    <ToastProvider>
      <ScrollRestoration />
      <InstallPrompt />
      <Routes>
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/redefinir-senha" element={<RedefinirSenha />} />

        {isAluno ? (
          <>
            <Route path="/aluno" element={<AlunoLayout />}>
              <Route index element={<AlunoDashboard />} />
              <Route path="treino" element={<AlunoTreino />} />
              <Route path="dieta" element={<AlunoDieta />} />
              <Route path="evolucao" element={<AlunoEvolucao />} />
              <Route path="frequencia" element={<AlunoFrequencia />} />
              <Route path="calculadoras" element={<AlunoCalculadoras />} />
              <Route path="feedback" element={<AlunoFeedback />} />
              <Route path="chat" element={<Chat />} />
            </Route>
            <Route path="*" element={<Navigate to="/aluno" replace />} />
          </>
        ) : (
          <>
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/captacoes" element={<Captacoes />} />
              <Route path="/alunos" element={<Alunos />} />
              <Route path="/alunos/:id" element={<PerfilAluno />} />
              <Route path="/frequencia" element={<Frequencia />} />
              <Route path="/tarefas" element={<Tarefas />} />
              <Route path="/financeiro" element={<Financeiro />} />
              <Route path="/social" element={<SocialSelling />} />
              <Route path="/relatorios" element={<Relatorios />} />
              <Route path="/feedbacks" element={<Feedbacks />} />
              <Route path="/treinos" element={<Treinos />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/configuracoes" element={<Configuracoes />} />
            </Route>
            <Route path="/aluno" element={<AlunoLayout />}>
              <Route index element={<AlunoDashboard />} />
              <Route path="treino" element={<AlunoTreino />} />
              <Route path="dieta" element={<AlunoDieta />} />
              <Route path="evolucao" element={<AlunoEvolucao />} />
              <Route path="frequencia" element={<AlunoFrequencia />} />
              <Route path="calculadoras" element={<AlunoCalculadoras />} />
              <Route path="feedback" element={<AlunoFeedback />} />
              <Route path="chat" element={<Chat />} />
            </Route>
          </>
        )}
      </Routes>
    </ToastProvider>
  )
}
