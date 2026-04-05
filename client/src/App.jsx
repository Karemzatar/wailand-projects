import { useState } from 'react'
import Login from './components/Login'
import AdminDashboard from './components/AdminDashboard'
import ProjectDashboard from './components/ProjectDashboard'

function App() {
  const [userState, setUserState] = useState({
    role: null, // 'admin' | 'user' | null
    project: null
  })

  // We act as a SPA with simple state-based routing
  if (userState.role === 'admin') {
    return <AdminDashboard onLogout={() => setUserState({ role: null, project: null })} />
  }

  if (userState.role === 'user') {
    return <ProjectDashboard project={userState.project} onLogout={() => setUserState({ role: null, project: null })} />
  }

  return <Login onLogin={(role, project) => setUserState({ role, project })} />
}

export default App
