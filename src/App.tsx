import { Routes, Route, Navigate } from 'react-router-dom'
import { ToastProvider } from './components/ui/Toast'
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
import Configuracoes from './pages/Configuracoes'
import AlunoDashboard from './pages/aluno/AlunoDashboard'
import AlunoTreino from './pages/aluno/AlunoTreino'
import AlunoDieta from './pages/aluno/AlunoDieta'
import AlunoEvolucao from './pages/aluno/AlunoEvolucao'
import AlunoCalculadoras from './pages/aluno/AlunoCalculadoras'
import AlunoFrequencia from './pages/aluno/AlunoFrequencia'
import AlunoFeedback from './pages/aluno/AlunoFeedback'
import Login from './pages/Login'
import { useAuthStore } from './store/authStore'
import InstallPrompt from './components/ui/InstallPrompt'

export default function App() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const user = useAuthStore((s) => s.user)

  if (!isAuthenticated) {
    return (
      <>
        <Login />
        <InstallPrompt />
      </>
    )
  }

  const isAluno = user?.role === 'aluno'

  return (
    <ToastProvider>
      <InstallPrompt />
      <Routes>
        {isAluno ? (
          <>
            {/* Aluno routes */}
            <Route path="/aluno" element={<AlunoLayout />}>
              <Route index element={<AlunoDashboard />} />
              <Route path="treino" element={<AlunoTreino />} />
              <Route path="dieta" element={<AlunoDieta />} />
              <Route path="evolucao" element={<AlunoEvolucao />} />
              <Route path="frequencia" element={<AlunoFrequencia />} />
              <Route path="calculadoras" element={<AlunoCalculadoras />} />
              <Route path="feedback" element={<AlunoFeedback />} />
            </Route>
            <Route path="*" element={<Navigate to="/aluno" replace />} />
          </>
        ) : (
          <>
            {/* Admin routes */}
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
              <Route path="/configuracoes" element={<Configuracoes />} />
            </Route>
            {/* Aluno routes also accessible for admin */}
            <Route path="/aluno" element={<AlunoLayout />}>
              <Route index element={<AlunoDashboard />} />
              <Route path="treino" element={<AlunoTreino />} />
              <Route path="dieta" element={<AlunoDieta />} />
              <Route path="evolucao" element={<AlunoEvolucao />} />
              <Route path="frequencia" element={<AlunoFrequencia />} />
              <Route path="calculadoras" element={<AlunoCalculadoras />} />
              <Route path="feedback" element={<AlunoFeedback />} />
            </Route>
          </>
        )}
      </Routes>
    </ToastProvider>
  )
}
