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
  const [notes, setNotes] = useState(""); // Novo estado para anotações do mapa
  const [showToast, setShowToast] = useState("");

  // Heróis selecionados (tanto pickados quanto banidos) ficam indisponíveis
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

  // Permite salvar apenas se todos os picks e bans estiverem preenchidos
  const canSave = slots.every(Boolean) && banSlots.every(Boolean);

  const saveComposition = () => {
    if (!canSave) return;
    setSavedComps((prev) => [
      {
        id: Date.now(),
        firstPickTeam,
        mapMode: selectedMapMode,
        notes: notes, // Salvando a anotação do mapa específico
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
    
    // Reseta o draft
    setSlots(Array(6).fill(""));
    setBanSlots(Array(6).fill(""));
    setNotes("");
    setShowToast("Composição e Bans salvos na memória!");
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

      {/* --- FASE DE BANS --- */}
      <section style={{ margin: '15px 0', padding: '15px', background: '#1a1a2e', borderRadius: '12px', border: '2px solid #0f3460' }}>
        <h3 style={{ textAlign: 'center', color: '#fff', marginTop: 0 }}>Fase de Banimentos</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          
          <div style={{ flex: 1, minWidth: '150px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ color: '#ef4444', fontWeight: 'bold' }}>Bans do Red Team</span>
            {[0, 1, 2].map(idx => (
              <select key={`red-ban-${idx}`} value={banSlots[idx]} onChange={(e) => handleBanChange(idx, e.target.value)} style={{ padding: '8px', background: '#2d0000', color: '#fff', borderRadius: '4px', border: '1px solid #ef4444' }}>
                <option value="">Selecionar Ban...</option>
                {BRAWLERS.map(b => <option key={b} value={b} disabled={selectedHeroes.has(b) && banSlots[idx] !== b}>{b}</option>)}
              </select>
            ))}
          </div>

          <div style={{ flex: 1, minWidth: '150px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>Bans do Blue Team</span>
            {[3, 4, 5].map(idx => (
              <select key={`blue-ban-${idx}`} value={banSlots[idx]} onChange={(e) => handleBanChange(idx, e.target.value)} style={{ padding: '8px', background: '#00102d', color: '#fff', borderRadius: '4px', border: '1px solid #3b82f6' }}>
                <option value="">Selecionar Ban...</option>
                {BRAWLERS.map(b => <option key={b} value={b} disabled={selectedHeroes.has(b) && banSlots[idx] !== b}>{b}</option>)}
              </select>
            ))}
          </div>

        </div>
      </section>
      {/* --- FIM DA FASE DE BANS --- */}

      <section className="pick-grid">
        <TeamColumn teamName="BLUE TEAM" teamClass="blue-team" glowClass="blue-glow" startIndex={3} teamSlots={slots.slice(3, 6)} {...commonTeamProps} />
        <TeamColumn teamName="RED TEAM" teamClass="red-team" glowClass="red-glow" startIndex={0} teamSlots={slots.slice(0, 3)} {...commonTeamProps} />
      </section>

      {/* --- ANOTAÇÕES DO MAPA --- */}
      <section style={{ padding: '0 10px' }}>
        <textarea 
          placeholder="Anotações estratégicas para este mapa/draft (Ex: Rotacionar pelo mato esquerdo, focar controle do mid...)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          style={{ width: '100%', padding: '12px', background: '#111', color: '#fff', border: '1px solid #444', borderRadius: '8px', minHeight: '80px', fontFamily: 'inherit' }}
        />
      </section>

      <section className="actions-card">
        {showToast && <span className="toast-message" style={{ color: '#10b981', fontWeight: 'bold' }}>{showToast}</span>}
        <button disabled={!canSave} onClick={saveComposition} style={{ opacity: canSave ? 1 : 0.5, cursor: canSave ? 'pointer' : 'not-allowed', width: '100%', padding: '15px', fontSize: '1.2rem', marginTop: '10px' }}>
          Salvar Draft na Memória
        </button>
      </section>

      <HistoryCard savedComps={savedComps} />
    </main>
  );
}

export default MatchMaker;