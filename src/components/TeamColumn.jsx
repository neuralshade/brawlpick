import React from "react";
import styled, { css } from "styled-components";
import { slotLabels, getBrawlerImage } from "../constants";

const ColumnContainer = styled.div`
  width: 100%;
  background: rgba(0, 0, 0, 0.25);
  border: 2px solid #000;
  padding: 1.25rem;
  box-shadow: 0 24px 40px rgba(15, 23, 42, 0.06);
`;

const FpButton = styled.button`
  margin-top: 0.5rem;
  padding: 0.4rem 0.8rem;
  background: ${(props) =>
    props.$active ? "#fbbf24" : "rgba(255, 255, 255, 0.2)"};
  color: ${(props) => (props.$active ? "#000" : "#fff")};
  border: 1px solid
    ${(props) => (props.$active ? "#f59e0b" : "rgba(255, 255, 255, 0.4)")};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${(props) =>
      props.$active ? "#f59e0b" : "rgba(255, 255, 255, 0.3)"};
  }
`;

const TeamHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  margin-bottom: 1rem;
  color: #fff;
  text-shadow:
    0 0 2px #000,
    0 0 4px #000,
    1px 1px 0 #000,
    -1px -1px 0 #000,
    2px 2px 4px rgba(0, 0, 0, 0.7);
`;

const SlotRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;

  @media (max-width: 800px) {
    justify-content: stretch;
  }
`;

const SlotCard = styled.article`
  width: 100%;
  padding: 1.25rem;
  background: #fff;
  border: 2px solid #000;
  box-shadow: 0 24px 40px rgba(15, 23, 42, 0.06);
  display: grid;
  gap: 0.85rem;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;

  ${(props) =>
    props.$isNext &&
    props.$glow === "blue-glow" &&
    css`
      transform: translateY(-2px);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.18);
    `}

  ${(props) =>
    props.$isNext &&
    props.$glow === "red-glow" &&
    css`
      transform: translateY(-2px);
      box-shadow: 0 0 0 3px rgba(248, 113, 113, 0.18);
    `}
`;

const SlotLabel = styled.div`
  color: #0f172a;
`;

const SlotTopRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
`;

const SlotInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.9rem;
`;

const SlotAvatar = styled.img`
  width: 52px;
  height: 52px;
  border-radius: 0.95rem;
  background: #ffffff;
  border: 1px solid #d1d5db;
  object-fit: cover;
`;

const EmptyAvatar = styled.div`
  width: 52px;
  height: 52px;
  border-radius: 0.95rem;
  background: #ffffff;
  border: 1px solid #d1d5db;
  display: grid;
  place-items: center;
  color: #64748b;
`;

const SlotOrderBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const SlotOrder = styled.div`
  font-size: 0.85rem;
  color: #3c455c;
`;

const SlotBrawlerName = styled.div`
  font-size: 0.95rem;
  color: #0f172a;
`;

const ChooseButton = styled.button`
  padding: 0.75rem 1rem;
  border: 1px solid #cbd5e1;
  background: #ffffff;
  color: #0f172a;
  cursor: pointer;
  transition:
    background 0.2s ease,
    border-color 0.2s ease;
  white-space: nowrap;

  &:hover:not(:disabled) {
    background: #eef2ff;
  }
`;

const PickerSearch = styled.div`
  margin: 0.5rem 0;
  input {
    width: 100%;
    padding: 0.5rem;
    border-radius: 0.5rem;
    border: 1px solid #cbd5e1;
    font-size: 0.9rem;
  }
`;

const PickerGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(76px, 1fr));
  gap: 0.65rem;
  margin-top: 0.5rem;
  max-height: 250px;
  overflow-y: auto;
  padding-right: 0.5rem;
`;

const BrawlerOption = styled.button`
  display: grid;
  gap: 0.45rem;
  padding: 0.65rem;
  border: 1px solid ${(props) => (props.$selected ? "#2563eb" : "#e2e8f0")};
  border-radius: 0.95rem;
  background: #ffffff;
  color: #0f172a;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;

  ${(props) =>
    props.$selected &&
    css`
      box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.12);
    `}

  &:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }

  img {
    width: 100%;
    height: 58px;
    object-fit: contain;
  }

  span {
    font-size: 0.7rem;
    text-align: center;
  }
`;

export default function TeamColumn({
  teamName,
  teamClass,
  startIndex,
  teamSlots,
  firstPickTeam,
  nextPickIndex,
  orderLabels,
  activeSlot,
  searchTerm,
  filteredBrawlers,
  selectedHeroes,
  toggleSlot,
  setSearchTerm,
  handleSlotChange,
  glowClass,
  teamId,
  setFirstPickTeam,
}) {
  const isFirstPick = firstPickTeam === teamId;

  return (
    <ColumnContainer>
      <TeamHeader>
        <span>{teamName}</span>
        <FpButton
          type="button"
          $active={isFirstPick}
          onClick={() => setFirstPickTeam(teamId)}
        >
          {isFirstPick ? "First Pick" : "Second Pick"}
        </FpButton>
      </TeamHeader>
      <SlotRow>
        {teamSlots.map((hero, localIndex) => {
          const globalIndex = localIndex + startIndex;
          const isNext = globalIndex === nextPickIndex;

          return (
            <SlotCard key={globalIndex} $isNext={isNext} $glow={glowClass}>
              <SlotLabel>{slotLabels[globalIndex]}</SlotLabel>
              <SlotTopRow>
                <SlotInfo>
                  {hero && getBrawlerImage(hero) ? (
                    <SlotAvatar src={getBrawlerImage(hero)} alt={hero} />
                  ) : (
                    <EmptyAvatar>?</EmptyAvatar>
                  )}
                  <SlotOrderBlock>
                    <SlotOrder>{orderLabels[globalIndex]}</SlotOrder>
                    {hero && <SlotBrawlerName>{hero}</SlotBrawlerName>}
                  </SlotOrderBlock>
                </SlotInfo>
                <ChooseButton
                  type="button"
                  onClick={() => toggleSlot(globalIndex)}
                >
                  {activeSlot === globalIndex ? "Close" : "Pick"}
                </ChooseButton>
              </SlotTopRow>

              {activeSlot === globalIndex && (
                <div>
                  <PickerSearch>
                    <input
                      type="text"
                      placeholder="Search brawler..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      autoFocus
                    />
                  </PickerSearch>
                  <PickerGrid>
                    {filteredBrawlers.map((brawler) => {
                      const optionDisabled =
                        selectedHeroes.has(brawler) && brawler !== hero;
                      return (
                        <BrawlerOption
                          key={brawler}
                          type="button"
                          $selected={hero === brawler}
                          onClick={() => handleSlotChange(globalIndex, brawler)}
                          disabled={optionDisabled}
                        >
                          <img src={getBrawlerImage(brawler)} alt={brawler} />
                          <span>{brawler}</span>
                        </BrawlerOption>
                      );
                    })}
                  </PickerGrid>
                </div>
              )}
            </SlotCard>
          );
        })}
      </SlotRow>
    </ColumnContainer>
  );
}
