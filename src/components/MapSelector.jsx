import React, { useState } from "react";
import styled from "styled-components";
import { MAP_MODE_OPTIONS, getModeIcon } from "../constants";
import { BaseCard, GroupTitle } from "../styles/Shared";

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;

  span {
    font-size: 1rem;
    color: #fff;
  }
`;

const SelectedText = styled.div`
  font-size: 0.95rem;
  color: #fff;
  white-space: nowrap;
`;

const GroupsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-top: 1rem;
`;

const ModeIcon = styled.img`
  width: 24px;
  height: 24px;
  object-fit: contain;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 0.5rem;
`;

const OptionButton = styled.button`
  text-align: left;
  padding: 0.9rem;
  border: 2px solid ${(props) => (props.$selected ? "#2563eb" : "#000")};
  background: ${(props) => (props.$selected ? "#eff6ff" : "#f8fafc")};
  color: #0f172a;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: ${(props) => (props.$selected ? "bold" : "normal")};
  transition:
    border-color 0.2s ease,
    background 0.2s ease,
    transform 0.2s ease;

  &:hover {
    border-color: #2563eb;
    background: #eff6ff;
  }
`;

const BackButton = styled.button`
  background: transparent;
  border: 1px solid #cbd5e1;
  color: #fff;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
  font-weight: bold;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const ActiveModeHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
`;

export default function MapSelector({ selectedMapMode, setSelectedMapMode }) {
  // Estado para controlar qual modo está selecionado na visualização
  const [activeMode, setActiveMode] = useState(null);

  const GROUPED_MAPS = MAP_MODE_OPTIONS.reduce((acc, option) => {
    if (!acc[option.mode]) acc[option.mode] = [];
    acc[option.mode].push(option);
    return acc;
  }, {});

  return (
    <BaseCard style={{ marginBottom: "1.5rem" }}>
      <Header>
        <div>
          <span>MAP & MODE</span>
        </div>
        <SelectedText>
          {selectedMapMode.map} · {selectedMapMode.mode}
        </SelectedText>
      </Header>

      <GroupsContainer>
        {!activeMode ? (
          // ETAPA 1: Mostrar apenas os Modos
          <div>
            <GroupTitle style={{ marginBottom: "1rem" }}>
              Select a Game Mode
            </GroupTitle>
            <Grid>
              {Object.keys(GROUPED_MAPS).map((mode) => (
                <OptionButton
                  key={mode}
                  type="button"
                  $selected={selectedMapMode.mode === mode}
                  onClick={() => setActiveMode(mode)}
                >
                  {getModeIcon(mode) && (
                    <ModeIcon src={getModeIcon(mode)} alt={mode} />
                  )}
                  <div>{mode}</div>
                </OptionButton>
              ))}
            </Grid>
          </div>
        ) : (
          // ETAPA 2: Mostrar os Mapas do Modo selecionado e o botão de Voltar
          <div>
            <ActiveModeHeader>
              <BackButton onClick={() => setActiveMode(null)}>
                ← Voltar
              </BackButton>
              <GroupTitle style={{ marginBottom: 0 }}>
                {getModeIcon(activeMode) && (
                  <ModeIcon src={getModeIcon(activeMode)} alt={activeMode} />
                )}
                <span>{activeMode} Maps</span>
              </GroupTitle>
            </ActiveModeHeader>
            <Grid>
              {GROUPED_MAPS[activeMode].map((option) => (
                <OptionButton
                  key={option.map}
                  type="button"
                  $selected={selectedMapMode.map === option.map}
                  onClick={() => setSelectedMapMode(option)}
                >
                  <div>{option.map}</div>
                </OptionButton>
              ))}
            </Grid>
          </div>
        )}
      </GroupsContainer>
    </BaseCard>
  );
}