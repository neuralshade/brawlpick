import React, { useState, useRef, useEffect } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import styled from "styled-components";
import { GlobalStyles } from "./styles/GlobalStyles";
import MatchMaker from "./pages/MatchMaker";
import Statistics from "./pages/Statistics";
import Matches from "./pages/Matches";

const NavContainer = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 30px;
  background: rgba(0, 0, 0, 0.25);
  border-bottom: 2px solid #000;
  box-shadow: 0 24px 40px rgba(15, 23, 42, 0.06);

  @media (max-width: 768px) {
    flex-direction: column;
    padding: 15px;
    gap: 20px;
  }
`;

const LinksGroup = styled.div`
  display: flex;
  gap: 30px;

  @media (max-width: 480px) {
    gap: 15px;
    flex-wrap: wrap;
    justify-content: center;
  }
`;

const ActionsGroup = styled.div`
  display: flex;
  gap: 15px;

  @media (max-width: 480px) {
    flex-direction: column;
    width: 100%;
    gap: 10px;
  }
`;

const ActionButton = styled.button`
  background: #2563eb;
  color: white;
  border: 2px solid #000;
  padding: 8px 16px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #1d4ed8;
  }

  @media (max-width: 480px) {
    width: 100%;
    padding: 12px;
  }
`;

const NavLink = styled(Link)`
  color: white;
  text-decoration: none;
  font-size: 18px;
  text-shadow:
    0 0 2px #000,
    0 0 4px #000,
    1px 1px 0 #000,
    -1px -1px 0 #000,
    2px 2px 4px rgba(0, 0, 0, 0.7);

  @media (max-width: 480px) {
    font-size: 16px;
  }
`;

function App() {
  const fileInputRef = useRef(null);

  // 1. Inicializa o estado lendo do localStorage (se houver dados guardados)
  const [savedComps, setSavedComps] = useState(() => {
    try {
      const localData = localStorage.getItem("brawlpick_data_cache");
      return localData ? JSON.parse(localData) : [];
    } catch (error) {
      console.error("Erro ao ler do localStorage", error);
      return [];
    }
  });

  // 2. Efeito para guardar os dados no localStorage sempre que houver alterações
  useEffect(() => {
    try {
      localStorage.setItem("brawlpick_data_cache", JSON.stringify(savedComps));
    } catch (error) {
      console.error("Erro ao guardar no localStorage", error);
    }
  }, [savedComps]);

  // Função para exportar os dados guardados (Backup)
  const handleExport = () => {
    const dataStr = JSON.stringify(savedComps, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "brawlpick_backup.json"; 
    a.click();
    URL.revokeObjectURL(url);
  };

  // Função para importar e ler um JSON (Restaurar backup)
  const handleImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);
        if (Array.isArray(json)) {
          setSavedComps(json); // Ao atualizar o estado aqui, o useEffect trata de gravar no localStorage
          alert("Ficheiro JSON carregado e restaurado com sucesso!");
        } else {
          alert("Formato inválido. O JSON tem de ser um array de dados.");
        }
      } catch (err) {
        alert("Erro ao ler o ficheiro JSON.");
      }
    };
    reader.readAsText(file);
    event.target.value = ""; // Limpar o input para permitir carregar o mesmo ficheiro novamente
  };

  return (
    <BrowserRouter>
      <GlobalStyles />
      <NavContainer>
        <LinksGroup>
          <NavLink to="/">MATCH MAKER</NavLink>
          <NavLink to="/matches">MATCHES</NavLink>
          <NavLink to="/stats">STATISTICS</NavLink>
        </LinksGroup>
        <ActionsGroup>
          <ActionButton onClick={() => fileInputRef.current.click()}>
            Open
          </ActionButton>
          <input
            type="file"
            accept=".json"
            style={{ display: "none" }}
            ref={fileInputRef}
            onChange={handleImport}
          />
          <ActionButton onClick={handleExport}>Backup</ActionButton>
        </ActionsGroup>
      </NavContainer>

      <Routes>
        <Route
          path="/"
          element={
            <MatchMaker savedComps={savedComps} setSavedComps={setSavedComps} />
          }
        />
        <Route
          path="/matches"
          element={
            <Matches savedComps={savedComps} setSavedComps={setSavedComps} />
          }
        />
        <Route
          path="/stats"
          element={
            <Statistics savedComps={savedComps} setSavedComps={setSavedComps} />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;