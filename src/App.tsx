import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import DashboardPage from './pages/DashboardPage'
import CatalogPage from './pages/CatalogPage'
import CoursePage from './pages/CoursePage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<DashboardPage />} />
        <Route path="courses" element={<CatalogPage />} />
        <Route path="courses/:id" element={<CoursePage />} />
      </Route>
    </Routes>
  )
}

export default App
