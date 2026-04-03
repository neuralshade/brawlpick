import React, { useMemo, useState, useEffect } from "react";
import styled from "styled-components";
import {
  TEAM_RED,
  TEAM_BLUE,
  MAP_MODE_OPTIONS,
  BRAWLERS,
  slotLabels,
} from "../constants";
import MapSelector from "../components/MapSelector";
import TeamColumn from "../components/TeamColumn";
import { AppShell, PickGrid, BaseCard } from "../styles/Shared";

const TopCentered = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 1.75rem;
`;

const BanColumn = styled.div`
  width: 100%;
  background: rgba(0, 0, 0, 0.25);
  border: 2px solid #000;
  padding: 1.25rem;
  box-shadow: 0 24px 40px rgba(15, 23, 42, 0.06);
`;

const TeamHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1rem;
  color: #fff;
  text-shadow:
    0 0 2px #000,
    0 0 4px #000,
    1px 1px 0 #000,
    -1px -1px 0 #000,
    2px 2px 4px rgba(0, 0, 0, 0.7);
`;

const BanRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 1rem;
`;

const BanCard = styled.article`
  width: 100%;
  padding: 1rem;
  background: #fff;
  border: 2px solid #000;
  box-shadow: 0 24px 40px rgba(15, 23, 42, 0.06);
`;

const BanSelect = styled.select`
  width: 100%;
  padding: 0.75rem;
  background: #fff;
  color: #0f172a;
  border: 1px solid #cbd5e1;
  border-radius: 0.5rem;
  font-family: inherit;
  font-size: 0.95rem;
`;

const NotesTextarea = styled.textarea`
  width: 100%;
  padding: 12px;
  background: #fff;
  color: #0f172a;
  border: 2px solid #000;
  min-height: 80px;
  font-family: inherit;
  font-size: 1rem;
  resize: vertical;
`;

const ActionsCard = styled.section`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;

  @media (max-width: 480px) {
    justify-content: space-between;
  }
`;

const ToastMessage = styled.span`
  color: #10b981;
  font-size: 0.95rem;
  font-weight: bold;
  animation: fadeIn 0.3s ease;
`;

const SaveButton = styled.button`
  width: 100%;
  padding: 15px;
  font-size: 1.2rem;
  border: none;
  border-radius: 0.95rem;
  color: #ffffff;
  background: #2563eb;
  cursor: pointer;
  box-shadow: 0 14px 30px rgba(37, 99, 235, 0.18);
  transition: background 0.2s;

  &:hover:not(:disabled) {
    background: #1d4ed8;
  }
  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`;

function MatchMaker({ savedComps, setSavedComps }) {
  const [firstPickTeam, setFirstPickTeam] = useState(TEAM_RED);
  const [slots, setSlots] = useState(Array(6).fill(""));
  const [banSlots, setBanSlots] = useState(Array(6).fill(""));
  const [activeSlot, setActiveSlot] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMapMode, setSelectedMapMode] = useState(MAP_MODE_OPTIONS[0]);
  const [notes, setNotes] = useState("");
  const [showToast, setShowToast] = useState("");

  const selectedHeroes = useMemo(
    () => new Set([...slots.filter(Boolean), ...banSlots.filter(Boolean)]),
    [slots, banSlots],
  );

  const orderSequence = useMemo(
    () =>
      firstPickTeam === TEAM_RED ? [0, 3, 4, 1, 2, 5] : [3, 0, 1, 4, 5, 2],
    [firstPickTeam],
  );

  const nextPickIndex = useMemo(
    () => orderSequence.find((index) => !slots[index]),
    [orderSequence, slots],
  );

  const orderLabels = useMemo(() => {
    const labels = [
      "First Pick",
      "Pick 2",
      "Pick 3",
      "Pick 4",
      "Pick 5",
      "Last Pick",
    ];
    return orderSequence.reduce((map, slot, index) => {
      map[slot] = labels[index];
      return map;
    }, {});
  }, [orderSequence]);

  const toggleSlot = (index) => {
    if (activeSlot === index) setActiveSlot(null);
    else {
      setActiveSlot(index);
      setSearchTerm("");
    }
  };

  const handleSlotChange = (index, value) => {
    const next = [...slots];
    next[index] = value;
    setSlots(next);
    setActiveSlot(null);
    setSearchTerm("");
  };

  const handleBanChange = (index, value) => {
    const nextBans = [...banSlots];
    nextBans[index] = value;
    setBanSlots(nextBans);
  };

  const canSave = slots.every(Boolean) && banSlots.every(Boolean);

  const registerMatch = () => {
    if (!canSave) return;
    setSavedComps((prev) => [
      {
        id: Date.now(),
        date: new Date().toISOString(),
        firstPickTeam,
        mapMode: selectedMapMode,
        notes: notes,
        bans: { red: banSlots.slice(0, 3), blue: banSlots.slice(3, 6) },
        slots: slots.map((hero, index) => ({
          slot: slotLabels[index] || `Slot ${index + 1}`,
          hero,
          order: orderLabels[index] || `Pick ${index + 1}`,
        })),
        result: null,
      },
      ...prev,
    ]);

    setSlots(Array(6).fill(""));
    setBanSlots(Array(6).fill(""));
    setNotes("");
    setShowToast("Match successfully registered!");
  };

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const filteredBrawlers = useMemo(() => {
    if (!searchTerm) return BRAWLERS;
    return BRAWLERS.filter((b) =>
      b.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [searchTerm]);

  const commonTeamProps = {
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
  };

  return (
    <AppShell>
      <MapSelector
        selectedMapMode={selectedMapMode}
        setSelectedMapMode={setSelectedMapMode}
      />

      <PickGrid style={{ marginBottom: "1.5rem" }}>
        <BanColumn>
          <TeamHeader>
            <span>BLUE TEAM BANS</span>
          </TeamHeader>
          <BanRow>
            {[3, 4, 5].map((idx) => (
              <BanCard key={`blue-ban-${idx}`}>
                <BanSelect
                  value={banSlots[idx]}
                  onChange={(e) => handleBanChange(idx, e.target.value)}
                >
                  <option value="">Ban...</option>
                  {BRAWLERS.map((b) => {
                    const isPicked = slots.includes(b);
                    const isBannedByBlue = banSlots.slice(3, 6).includes(b);
                    return (
                      <option
                        key={b}
                        value={b}
                        disabled={
                          isPicked || (isBannedByBlue && banSlots[idx] !== b)
                        }
                      >
                        {b}
                      </option>
                    );
                  })}
                </BanSelect>
              </BanCard>
            ))}
          </BanRow>
        </BanColumn>

        <BanColumn>
          <TeamHeader>
            <span>RED TEAM BANS</span>
          </TeamHeader>
          <BanRow>
            {[0, 1, 2].map((idx) => (
              <BanCard key={`red-ban-${idx}`}>
                <BanSelect
                  value={banSlots[idx]}
                  onChange={(e) => handleBanChange(idx, e.target.value)}
                >
                  <option value="">Ban...</option>
                  {BRAWLERS.map((b) => {
                    const isPicked = slots.includes(b);
                    const isBannedByRed = banSlots.slice(0, 3).includes(b);
                    return (
                      <option
                        key={b}
                        value={b}
                        disabled={
                          isPicked || (isBannedByRed && banSlots[idx] !== b)
                        }
                      >
                        {b}
                      </option>
                    );
                  })}
                </BanSelect>
              </BanCard>
            ))}
          </BanRow>
        </BanColumn>
      </PickGrid>

      <PickGrid>
        <TeamColumn
          teamName="BLUE TEAM"
          teamClass="blue-team"
          glowClass="blue-glow"
          startIndex={3}
          teamSlots={slots.slice(3, 6)}
          {...commonTeamProps}
        />
        <TeamColumn
          teamName="RED TEAM"
          teamClass="red-team"
          glowClass="red-glow"
          startIndex={0}
          teamSlots={slots.slice(0, 3)}
          {...commonTeamProps}
        />
      </PickGrid>

      <BaseCard style={{ padding: "1.25rem" }}>
        <NotesTextarea
          placeholder="Strategic notes for this map/draft (e.g., Rotate through the left bush, focus on mid control...)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </BaseCard>

      <ActionsCard>
        {showToast && <ToastMessage>{showToast}</ToastMessage>}
        <SaveButton disabled={!canSave} onClick={registerMatch}>
          Register Match
        </SaveButton>
      </ActionsCard>
    </AppShell>
  );
}

export default MatchMaker;
