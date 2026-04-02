// src/App.jsx
import { useMemo, useState, useEffect } from "react";
import { TEAM_RED, TEAM_BLUE, MAP_MODE_OPTIONS, BRAWLERS, slotLabels } from "./constants";
import MapSelector from "./components/MapSelector";
import TeamColumn from "./components/TeamColumn";
import HistoryCard from "./components/HistoryCard";

function App() {
  const [firstPickTeam, setFirstPickTeam] = useState(TEAM_RED);
  const [slots, setSlots] = useState(Array(6).fill(""));
  const [savedComps, setSavedComps] = useState([]);
  const [activeSlot, setActiveSlot] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMapMode, setSelectedMapMode] = useState(MAP_MODE_OPTIONS[0]);
  const [showToast, setShowToast] = useState(false);

  const selectedHeroes = useMemo(() => new Set(slots.filter(Boolean)), [slots]);

  const orderSequence = useMemo(
    () => (firstPickTeam === TEAM_RED ? [0, 3, 4, 1, 2, 5] : [3, 0, 1, 4, 5, 2]),
    [firstPickTeam]
  );

  const nextPickIndex = useMemo(
    () => orderSequence.find((index) => !slots[index]),
    [orderSequence, slots]
  );

  const orderLabels = useMemo(() => {
    const labels = ["First Pick", "Pick 2", "Pick 3", "Pick 4", "Pick 5", "Last Pick"];
    return orderSequence.reduce((map, slot, index) => {
      map[slot] = labels[index];
      return map;
    }, {});
  }, [orderSequence]);

  const toggleSlot = (index) => {
    if (activeSlot === index) {
      setActiveSlot(null);
    } else {
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

  const canSave = slots.every(Boolean);

  const saveComposition = () => {
    if (!canSave) return;
    setSavedComps((prev) => [
      {
        id: Date.now(),
        firstPickTeam,
        mapMode: selectedMapMode,
        slots: slots.map((hero, index) => ({
          slot: slotLabels[index],
          hero,
          order: orderLabels[index],
        })),
      },
      ...prev,
    ]);
    setSlots(Array(6).fill(""));
    setShowToast(true);
  };

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const filteredBrawlers = useMemo(() => {
    if (!searchTerm) return BRAWLERS;
    return BRAWLERS.filter((b) => b.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [searchTerm]);

  // Props comuns compartilhadas entre as colunas dos times
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
    handleSlotChange
  };

  return (
    <main className="app-shell">
      <div className="fp-top">
        <div className="slider-control fp-alone">
          <div className="slider-label">FP</div>
          <button
            type="button"
            className={`toggle-switch ${firstPickTeam}`}
            onClick={() => setFirstPickTeam(firstPickTeam === TEAM_RED ? TEAM_BLUE : TEAM_RED)}
            aria-label="Toggle first pick between red and blue"
          >
            <span className="switch-track" />
            <span className="switch-thumb" />
          </button>
          <div className="slider-status">
            {firstPickTeam === TEAM_RED ? "Red" : "Blue"}
          </div>
        </div>
      </div>

      <MapSelector 
        selectedMapMode={selectedMapMode} 
        setSelectedMapMode={setSelectedMapMode} 
      />

      <section className="pick-grid">
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
      </section>

      <section className="actions-card">
        {showToast && <span className="toast-message">Composition saved!</span>}
        <button disabled={!canSave} onClick={saveComposition}>
          Save composition
        </button>
      </section>

      <HistoryCard savedComps={savedComps} />
      
    </main>
  );
}

export default App;