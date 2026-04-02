import { useMemo, useState, useEffect } from "react";
import { TEAM_RED, TEAM_BLUE, MAP_MODE_OPTIONS, BRAWLERS, slotLabels } from "../constants";
import MapSelector from "../components/MapSelector";
import TeamColumn from "../components/TeamColumn";
import HistoryCard from "../components/HistoryCard";

function MatchMaker({ savedComps, setSavedComps }) {
  const [firstPickTeam, setFirstPickTeam] = useState(TEAM_RED);
  const [slots, setSlots] = useState(Array(6).fill(""));
  const [banSlots, setBanSlots] = useState(Array(6).fill("")); // 0-2: Red Bans, 3-5: Blue Bans
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

  const saveComposition = () => {
    if (!canSave) return;
    setSavedComps((prev) => [
      {
        id: Date.now(),
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
        stats: { matchesPlayed: 0, wins: 0, losses: 0, winRate: 0 } 
      },
      ...prev,
    ]);
    
    setSlots(Array(6).fill(""));
    setBanSlots(Array(6).fill(""));
    setNotes("");
    setShowToast("Draft successfully saved to memory!");
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
      <div className="fp-top" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
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

      {/* --- BAN PHASE --- */}
      <section className="pick-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="team-column blue-team">
          <div className="team-header">
            <span>BLUE TEAM BANS</span>
          </div>
          <div className="slot-row" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))' }}>
            {[3, 4, 5].map(idx => (
              <article key={`blue-ban-${idx}`} className="slot-card" style={{ padding: '1rem' }}>
                <select 
                  value={banSlots[idx]} 
                  onChange={(e) => handleBanChange(idx, e.target.value)} 
                  style={{ width: '100%', padding: '0.75rem', background: '#fff', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '0.5rem', fontFamily: 'inherit', fontSize: '0.95rem' }}
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
          <div className="slot-row" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))' }}>
            {[0, 1, 2].map(idx => (
              <article key={`red-ban-${idx}`} className="slot-card" style={{ padding: '1rem' }}>
                <select 
                  value={banSlots[idx]} 
                  onChange={(e) => handleBanChange(idx, e.target.value)} 
                  style={{ width: '100%', padding: '0.75rem', background: '#fff', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '0.5rem', fontFamily: 'inherit', fontSize: '0.95rem' }}
                >
                  <option value="">Ban...</option>
                  {BRAWLERS.map(b => <option key={b} value={b} disabled={selectedHeroes.has(b) && banSlots[idx] !== b}>{b}</option>)}
                </select>
              </article>
            ))}
          </div>
        </div>
      </section>
      {/* --- END BAN PHASE --- */}

      <section className="pick-grid">
        <TeamColumn teamName="BLUE TEAM" teamClass="blue-team" glowClass="blue-glow" startIndex={3} teamSlots={slots.slice(3, 6)} {...commonTeamProps} />
        <TeamColumn teamName="RED TEAM" teamClass="red-team" glowClass="red-glow" startIndex={0} teamSlots={slots.slice(0, 3)} {...commonTeamProps} />
      </section>

      {/* --- DRAFT NOTES --- */}
      <section className="map-mode-card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <textarea 
          placeholder="Strategic notes for this map/draft (e.g., Rotate through the left bush, focus on mid control...)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          style={{ width: '100%', padding: '12px', background: '#fff', color: '#0f172a', border: '2px solid #000', borderRadius: '0', minHeight: '80px', fontFamily: 'inherit', fontSize: '1rem' }}
        />
      </section>

      <section className="actions-card">
        {showToast && <span className="toast-message" style={{ color: '#10b981', fontWeight: 'bold' }}>{showToast}</span>}
        <button disabled={!canSave} onClick={saveComposition} style={{ opacity: canSave ? 1 : 0.5, cursor: canSave ? 'pointer' : 'not-allowed', width: '100%', padding: '15px', fontSize: '1.2rem', marginTop: '10px' }}>
          Save Draft to Memory
        </button>
      </section>

      <HistoryCard savedComps={savedComps} />
    </main>
  );
}

export default MatchMaker;