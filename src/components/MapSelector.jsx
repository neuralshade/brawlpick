import React from "react";
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
  transition:
    border-color 0.2s ease,
    background 0.2s ease,
    transform 0.2s ease;

  &:hover {
    border-color: #2563eb;
    background: #eff6ff;
  }
`;

export default function MapSelector({ selectedMapMode, setSelectedMapMode }) {
  const GROUPED_MAPS = MAP_MODE_OPTIONS.reduce((acc, option) => {
    if (!acc[option.mode]) acc[option.mode] = [];
    acc[option.mode].push(option);
    return acc;
  }, {});

  return (
    <BaseCard>
      <Header>
        <div>
          <span>MAP & MODE</span>
        </div>
        <SelectedText>
          {selectedMapMode.map} · {selectedMapMode.mode}
        </SelectedText>
      </Header>

      <GroupsContainer>
        {Object.entries(GROUPED_MAPS).map(([mode, maps]) => (
          <div key={mode}>
            <GroupTitle>
              {getModeIcon(mode) && (
                <ModeIcon src={getModeIcon(mode)} alt={mode} />
              )}
              <span>{mode}</span>
            </GroupTitle>
            <Grid>
              {maps.map((option) => (
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
        ))}
      </GroupsContainer>
    </BaseCard>
  );
}
