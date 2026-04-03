import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import styled from "styled-components";
import { GlobalStyles } from "./styles/GlobalStyles";
import MatchMaker from "./pages/MatchMaker";
import Statistics from "./pages/Statistics";
import Matches from "./pages/Matches";

const MainNavbar = styled.nav`
  display: flex;
  gap: 30px;
  padding: 15px 30px;
  background: rgba(0, 0, 0, 0.25);
  border-bottom: 2px solid #000;
  box-shadow: 0 24px 40px rgba(15, 23, 42, 0.06);
`;

const NavLink = styled(Link)`
  color: white;
  text-decoration: none;
  font-weight: bold;
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

  return (
    <BrowserRouter>
      <GlobalStyles />
      <MainNavbar>
        <NavLink to="/">MATCH MAKER</NavLink>
        <NavLink to="/matches">MATCHES</NavLink>
        <NavLink to="/stats">STATISTICS</NavLink>
      </MainNavbar>

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
