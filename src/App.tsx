import { Routes, Route } from 'react-router-dom'
import { ToastProvider } from './components/ui/Toast'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import Captacoes from './pages/Captacoes'
import Chamadas from './pages/Chamadas'
import Agenda from './pages/Agenda'
import Relatorios from './pages/Relatorios'
import Alunos from './pages/Alunos'
import PerfilAluno from './pages/PerfilAluno'
import Financeiro from './pages/Financeiro'
import Login from './pages/Login'
import { useAuthStore } from './store/authStore'

export default function App() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  if (!isAuthenticated) {
    return <Login />
  }

  return (
    <ToastProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/captacoes" element={<Captacoes />} />
          <Route path="/chamadas" element={<Chamadas />} />
          <Route path="/agenda" element={<Agenda />} />
          <Route path="/alunos" element={<Alunos />} />
          <Route path="/alunos/:id" element={<PerfilAluno />} />
          <Route path="/financeiro" element={<Financeiro />} />
          <Route path="/relatorios" element={<Relatorios />} />
        </Route>
      </Routes>
    </ToastProvider>
  )
}
