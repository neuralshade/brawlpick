import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import MatchMaker from './pages/MatchMaker';
import Statistics from './pages/Statistics';

function App() {
  // Estado global da base de dados em memória
  const [savedComps, setSavedComps] = useState([]);

  return (
    <BrowserRouter>
      {/* Barra de Navegação (Menu) */}
      <nav style={{ 
        display: 'flex', 
        gap: '20px', 
        padding: '15px 30px', 
        background: '#1a1a2e',
        borderBottom: '2px solid #0f3460'
      }}>
        <Link to="/" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold', fontSize: '18px' }}>
          🎮 Match Maker
        </Link>
        <Link to="/stats" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold', fontSize: '18px' }}>
          📊 Estatísticas
        </Link>
      </nav>

      {/* Configuração das Rotas passando o estado compartilhado */}
      <Routes>
        <Route 
          path="/" 
          element={<MatchMaker savedComps={savedComps} setSavedComps={setSavedComps} />} 
        />
        <Route 
          path="/stats" 
          element={<Statistics savedComps={savedComps} setSavedComps={setSavedComps} />} 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;