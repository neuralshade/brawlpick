import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import MatchMaker from './pages/MatchMaker';
import Statistics from './pages/Statistics';

function App() {
  const [savedComps, setSavedComps] = useState([]);

  return (
    <BrowserRouter>
      {/* Barra de Navegação estilizada seguindo o design do MatchMaker */}
      <nav style={{ 
        display: 'flex', 
        gap: '30px', 
        padding: '15px 30px', 
        background: 'rgba(0, 0, 0, 0.25)',
        borderBottom: '2px solid #000',
        boxShadow: '0 24px 40px rgba(15, 23, 42, 0.06)'
      }}>
        <Link to="/" style={{ 
          color: 'white', 
          textDecoration: 'none', 
          fontWeight: 'bold', 
          fontSize: '18px',
          textShadow: '0 0 2px #000, 0 0 4px #000, 1px 1px 0 #000, -1px -1px 0 #000, 2px 2px 4px rgba(0, 0, 0, 0.7)'
        }}>
          MATCH MAKER
        </Link>
        <Link to="/stats" style={{ 
          color: 'white', 
          textDecoration: 'none', 
          fontWeight: 'bold', 
          fontSize: '18px',
          textShadow: '0 0 2px #000, 0 0 4px #000, 1px 1px 0 #000, -1px -1px 0 #000, 2px 2px 4px rgba(0, 0, 0, 0.7)'
        }}>
          STATISTICS
        </Link>
      </nav>

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