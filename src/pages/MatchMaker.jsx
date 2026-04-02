import { useMemo, useState, useEffect } from "react";
import { TEAM_RED, TEAM_BLUE, MAP_MODE_OPTIONS, BRAWLERS, slotLabels } from "../constants";
import MapSelector from "../components/MapSelector";
import TeamColumn from "../components/TeamColumn";

function MatchMaker({ savedComps, setSavedComps }) {
  const [firstPickTeam, setFirstPickTeam] = useState(TEAM_RED);
  const [slots, setSlots] = useState(Array(6).fill(""));
  const [banSlots, setBanSlots] = useState(Array(6).fill(""));
  const [activeSlot, setActiveSlot] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMapMode, setSelectedMapMode] = useState(MAP_MODE_OPTIONS[0]);
  const [notes, setNotes] = useState("");
  const [showToast, setShowToast] = useState("");

  const selectedHeroes = useMemo(() => 
    new Set([...slots.filter(Boolean), ...banSlots.filter(Boolean)]), 
  [slots, banSlots]);

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
    if (activeSlot === index) setActiveSlot(null);
    else { setActiveSlot(index); setSearchTerm(""); }
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
        bans: {
          red: banSlots.slice(0, 3),
          blue: banSlots.slice(3, 6)
        },
        slots: slots.map((hero, index) => ({
          slot: slotLabels[index] || `Slot ${index + 1}`,
          hero,
          order: orderLabels[index] || `Pick ${index + 1}`,
        })),
        result: null
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
    return BRAWLERS.filter((b) => b.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [searchTerm]);

  const commonTeamProps = {
    firstPickTeam, nextPickIndex, orderLabels, activeSlot, searchTerm,
    filteredBrawlers, selectedHeroes, toggleSlot, setSearchTerm, handleSlotChange
  };

  return (
    <main className="app-shell">
      <div className="fp-top fp-top-centered">
        <div className="slider-control fp-alone">
          <div className="slider-label">First Pick</div>
          <button
            type="button"
            className={`toggle-switch ${firstPickTeam}`}
            onClick={() => setFirstPickTeam(firstPickTeam === TEAM_RED ? TEAM_BLUE : TEAM_RED)}
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

      <section className="pick-grid ban-section">
        <div className="team-column blue-team">
          <div className="team-header">
            <span>BLUE TEAM BANS</span>
          </div>
          <div className="slot-row ban-slot-row">
            {[3, 4, 5].map(idx => (
              <article key={`blue-ban-${idx}`} className="slot-card ban-slot-card">
                <select 
                  className="ban-select"
                  value={banSlots[idx]} 
                  onChange={(e) => handleBanChange(idx, e.target.value)} 
                >
                  <option value="">Ban...</option>
                  {BRAWLERS.map(b => <option key={b} value={b} disabled={selectedHeroes.has(b) && banSlots[idx] !== b}>{b}</option>)}
                </select>
              </article>
            ))}
          </div>
        </div>

        <div className="team-column red-team">
          <div className="team-header">
            <span>RED TEAM BANS</span>
          </div>
          <div className="slot-row ban-slot-row">
            {[0, 1, 2].map(idx => (
              <article key={`red-ban-${idx}`} className="slot-card ban-slot-card">
                <select 
                  className="ban-select"
                  value={banSlots[idx]} 
                  onChange={(e) => handleBanChange(idx, e.target.value)} 
                >
                  <option value="">Ban...</option>
                  {BRAWLERS.map(b => <option key={b} value={b} disabled={selectedHeroes.has(b) && banSlots[idx] !== b}>{b}</option>)}
                </select>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="pick-grid">
        <TeamColumn teamName="BLUE TEAM" teamClass="blue-team" glowClass="blue-glow" startIndex={3} teamSlots={slots.slice(3, 6)} {...commonTeamProps} />
        <TeamColumn teamName="RED TEAM" teamClass="red-team" glowClass="red-glow" startIndex={0} teamSlots={slots.slice(0, 3)} {...commonTeamProps} />
      </section>

      <section className="map-mode-card notes-section">
        <textarea 
          className="notes-textarea"
          placeholder="Strategic notes for this map/draft (e.g., Rotate through the left bush, focus on mid control...)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </section>

      <section className="actions-card">
        {showToast && <span className="toast-message toast-success">{showToast}</span>}
        <button className="save-draft-btn" disabled={!canSave} onClick={registerMatch}>
          Register Match
        </button>
      </section>
    </main>
  );
}

export default MatchMaker;