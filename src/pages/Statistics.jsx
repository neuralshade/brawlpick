import React, { useRef, useMemo, useState } from 'react';

export default function Statistics({ savedComps, setSavedComps }) {
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const rawData = JSON.parse(e.target.result);
        
        // Formatação/Normalização dos dados recebidos
        const dataArray = Array.isArray(rawData) ? rawData : [rawData];
        
        const formattedData = dataArray.map(comp => ({
          id: comp.id || Date.now() + Math.random(),
          firstPickTeam: comp.firstPickTeam || 'TEAM_RED',
          mapMode: comp.mapMode || { map: 'Desconhecido', mode: 'Desconhecido' },
          slots: Array.isArray(comp.slots) ? comp.slots : [],
          stats: comp.stats || { matchesPlayed: 0, wins: 0, losses: 0, winRate: 0 }
        }));

        setSavedComps(formattedData);
        setError('');
      } catch (err) {
        setError('Erro ao processar o arquivo JSON. Verifique se o formato é válido.');
      }
    };

    reader.readAsText(file);
    event.target.value = null;
  };

  const brawlerStats = useMemo(() => {
    if (!Array.isArray(savedComps)) return [];
    
    const counts = {};
    savedComps.forEach(comp => {
      if (comp.slots) {
        comp.slots.forEach(s => {
          if (s.hero) {
            counts[s.hero] = (counts[s.hero] || 0) + 1;
          }
        });
      }
    });
    
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [savedComps]);

  return (
    <main className="app-shell">
      <section className="map-mode-card">
        <div className="map-mode-header" style={{ marginBottom: '1rem', flexDirection: 'column', alignItems: 'flex-start' }}>
          <h1 style={{ 
            color: '#fff', 
            margin: 0,
            textShadow: '0 0 2px #000, 0 0 4px #000, 1px 1px 0 #000, -1px -1px 0 #000, 2px 2px 4px rgba(0, 0, 0, 0.7)'
          }}>
            📊 Estatísticas e Base de Dados Local
          </h1>
          <p style={{ color: '#cbd5e1', fontSize: '1rem', marginTop: '0.5rem' }}>
            A base de dados atual possui <b>{savedComps?.length || 0}</b> composições.
          </p>
        </div>
        
        <div className="actions-card" style={{ justifyContent: 'flex-start', margin: 0 }}>
          <input 
            type="file" 
            accept=".json" 
            style={{ display: 'none' }} 
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
          <button onClick={() => fileInputRef.current.click()}>
            📂 Abrir/Atualizar JSON
          </button>
        </div>
        
        {error && <div style={{ color: '#f87171', marginTop: '1rem', fontWeight: 'bold' }}>{error}</div>}
      </section>

      {savedComps && savedComps.length > 0 && (
        <section className="pick-grid" style={{ gridTemplateColumns: '1fr' }}>
          <div className="team-column">
            <div className="team-header">
              <h2 style={{ margin: 0 }}>🏆 Brawlers Mais Escolhidos</h2>
              <span style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>Baseado na memória compartilhada</span>
            </div>
            
            <div className="slot-row" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }}>
              {brawlerStats.length > 0 ? (
                brawlerStats.map(([name, count]) => (
                  <div key={name} className="slot-card" style={{ textAlign: 'center', gap: '0.5rem' }}>
                    <div className="slot-brawler-name" style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
                      {name}
                    </div>
                    <div className="slot-order" style={{ fontSize: '1.4rem', color: '#2563eb', fontWeight: 'bold' }}>
                      {count} {count === 1 ? 'Pick' : 'Picks'}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ color: 'white', textAlign: 'center', width: '100%', padding: '2rem' }}>
                  Nenhum brawler encontrado nos dados.
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}