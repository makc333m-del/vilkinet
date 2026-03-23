import React, { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Dashboard from './pages/Dashboard'
import Employees from './pages/Employees'
import Restaurants from './pages/Restaurants'
import KnowledgeBase from './pages/KnowledgeBase'


function App() {
  const [session, setSession] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    // Проверяем текущую сессию при загрузке
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
    // Слушаем изменения (вход/выход)
    supabase.auth.onAuthStateChange((_event, session) => setSession(session))
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) alert(error.message)
  }

  const handleLogout = () => supabase.auth.signOut()

  // Если пользователь вошел — показываем Dashboard и кнопку Выхода
  const [view, setView] = useState('dashboard');

  if (session) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
        <nav style={{ background: '#1f2937', color: 'white', padding: '10px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <strong style={{ marginRight: '20px' }}>ВилкиНет Систем</strong>
            <button onClick={() => setView('dashboard')} style={{ background: 'none', color: view === 'dashboard' ? '#ef4444' : 'white', border: 'none', cursor: 'pointer', marginRight: '10px' }}>Дашборд</button>
            <button onClick={() => setView('employees')} style={{ background: 'none', color: view === 'employees' ? '#ef4444' : 'white', border: 'none', cursor: 'pointer' }}>Сотрудники</button>
            <button onClick={() => setView('restaurants')} style={{ background: 'none', color: view === 'restaurants' ? '#ef4444' : 'white', border: 'none', cursor: 'pointer', marginRight: '10px' }}>Рестораны</button>
            <button onClick={() => setView('kb')} style={{ background: 'none', color: view === 'kb' ? '#ef4444' : 'white', border: 'none', cursor: 'pointer', marginRight: '10px' }}>Обучение</button>
          </div>
          <button onClick={handleLogout} style={{ background: 'transparent', color: 'white', border: '1px solid white', padding: '4px 12px', cursor: 'pointer' }}>Выйти</button>
        </nav>

        {view === 'dashboard' && <Dashboard />}
        {view === 'employees' && <Employees />}
        {view === 'restaurants' && <Restaurants />}
        {view === 'kb' && <KnowledgeBase />}
      </div>
    )
  }

  // Если не вошел — показываем форму (твой прошлый код)
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f3f4f6' }}>
      <form onSubmit={handleLogin} style={{ background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <h2 style={{ textAlign: 'center' }}>Вход в админку</h2>
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={{ display: 'block', width: '100%', marginBottom: '10px', padding: '8px' }} />
        <input type="password" placeholder="Пароль" value={password} onChange={e => setPassword(e.target.value)} style={{ display: 'block', width: '100%', marginBottom: '10px', padding: '8px' }} />
        <button type="submit" style={{ width: '100%', padding: '10px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px' }}>Войти</button>
      </form>
    </div>
  )
}

export default App