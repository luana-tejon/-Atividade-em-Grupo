import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Home from './pages/Home.jsx'
import Detalhes from './pages/Detalhes.jsx'
import Favoritos from './pages/Favoritos.jsx'
import NaoEncontrado from './pages/NaoEncontrado.jsx'
import './App.css'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="anime/:id" element={<Detalhes />} />
        <Route path="favoritos" element={<Favoritos />} />
        <Route path="*" element={<NaoEncontrado />} />
      </Route>
    </Routes>
  )
}

export default App
