import { useMemo, useState, useEffect, useRef } from "react";
import { TEAM_RED, TEAM_BLUE, MAP_MODE_OPTIONS, BRAWLERS, slotLabels } from "../constants";
import MapSelector from "../components/MapSelector";
import TeamColumn from "../components/TeamColumn";
import HistoryCard from "../components/HistoryCard";

function MatchMaker({ savedComps, setSavedComps }) {
  const [firstPickTeam, setFirstPickTeam] = useState(TEAM_RED);
  const [slots, setSlots] = useState(Array(6).fill(""));
  const [activeSlot, setActiveSlot] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMapMode, setSelectedMapMode] = useState(MAP_MODE_OPTIONS[0]);
  const [showToast, setShowToast] = useState(""); // Alterado para string para mensagens dinâmicas
  const fileInputRef = useRef(null);

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
    setShowToast("Composição salva na memória!");
  };

  // --- NOVAS FUNÇÕES DE ARQUIVO JSON --- //
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);
        setSavedComps(json);
        setShowToast(`Arquivo carregado: ${json.length} comps`);
      } catch (err) {
        alert('Erro ao processar o arquivo JSON.');
      }
    };
    reader.readAsText(file);
    event.target.value = null; // reseta o input
  };

  const exportDatabase = () => {
    if (savedComps.length === 0) {
      alert("A base de dados está vazia.");
      return;
    }
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(savedComps, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `brawl_comps_${new Date().getTime()}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    setShowToast("Arquivo JSON exportado!");
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
      <div className="fp-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="slider-control fp-alone">
          <div className="slider-label">FP</div>
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

        {/* Botões de controle de arquivo no topo */}
        <div style={{ display: 'flex', gap: '10px' }}>
           <input 
              type="file" 
              accept=".json" 
              style={{ display: 'none' }} 
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
            <button 
              onClick={() => fileInputRef.current.click()}
              style={{ background: '#3b82f6', border: 'none', padding: '8px 16px', borderRadius: '4px', color: 'white', cursor: 'pointer' }}
            >
              📂 Abrir JSON
            </button>
            <button 
              onClick={exportDatabase}
              style={{ background: '#10b981', border: 'none', padding: '8px 16px', borderRadius: '4px', color: 'white', cursor: 'pointer' }}
            >
              💾 Salvar JSON
            </button>
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
        {showToast && <span className="toast-message">{showToast}</span>}
        <button disabled={!canSave} onClick={saveComposition}>
          Salvar Pick na Memória
        </button>
      </section>

      <HistoryCard savedComps={savedComps} />
    </main>
  );
}

export default MatchMaker;