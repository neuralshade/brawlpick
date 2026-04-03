import React, { useState, useRef } from "react";
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

  @media (max-width: 600px) {
    flex-direction: column;
    gap: 15px;
  }
`;

const LinksGroup = styled.div`
  display: flex;
  gap: 30px;
`;

const ActionsGroup = styled.div`
  display: flex;
  gap: 15px;
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
`;

function App() {
  const [savedComps, setSavedComps] = useState([]);
  const fileInputRef = useRef(null);

  // Função para exportar os dados guardados
  const handleExport = () => {
    const dataStr = JSON.stringify(savedComps, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "brawlpick_data.json"; // Nome estático para facilitar sobreposição
    a.click();
    URL.revokeObjectURL(url);
  };

  // Função para importar e ler um JSON
  const handleImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);
        if (Array.isArray(json)) {
          setSavedComps(json);
          alert("Ficheiro JSON carregado com sucesso!");
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
            Carregar JSON
          </ActionButton>
          <input
            type="file"
            accept=".json"
            style={{ display: "none" }}
            ref={fileInputRef}
            onChange={handleImport}
          />
          <ActionButton onClick={handleExport}>Guardar JSON</ActionButton>
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
