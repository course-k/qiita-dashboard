import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Articles from './pages/Articles'

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 flex items-center gap-6 h-14">
            <span className="font-bold text-gray-900">Qiita Dashboard</span>
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `text-sm ${isActive ? 'text-green-600 font-medium' : 'text-gray-500 hover:text-gray-900'}`
              }
            >
              ダッシュボード
            </NavLink>
            <NavLink
              to="/articles"
              className={({ isActive }) =>
                `text-sm ${isActive ? 'text-green-600 font-medium' : 'text-gray-500 hover:text-gray-900'}`
              }
            >
              記事一覧
            </NavLink>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-6 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/articles" element={<Articles />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
