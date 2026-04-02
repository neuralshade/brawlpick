import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import MatchMaker from './pages/MatchMaker';
import Statistics from './pages/Statistics';

function App() {
  const [savedComps, setSavedComps] = useState([]);

  return (
    <BrowserRouter>
      {/* Barra de Navegação estilizada seguindo o design do MatchMaker */}
      <nav className="main-navbar">
        <Link to="/" className="nav-link">
          MATCH MAKER
        </Link>
        <Link to="/stats" className="nav-link">
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