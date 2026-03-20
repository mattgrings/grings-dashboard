import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import { useCursorGlow } from '../../hooks/useCursorGlow'

export default function Layout() {
  useCursorGlow()

  return (
    <div className="min-h-screen bg-bg">
      <Sidebar />
      <div className="ml-[240px] transition-all duration-300">
        <Header />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
