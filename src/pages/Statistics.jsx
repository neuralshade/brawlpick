import React, { useState, useRef, useMemo } from 'react';

export default function Statistics() {
  const [savedComps, setSavedComps] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  // Função para ler e processar o arquivo JSON local
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);
        setSavedComps(json);
        setError('');
      } catch (err) {
        setError('Erro ao processar o arquivo JSON. Verifique se o formato está correto.');
        setSavedComps(null);
      }
    };

    reader.readAsText(file);
  };

  // Processamento de dados em memória (Exemplo: Contagem de Picks por Brawler)
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
    
    // Transforma o objeto em array e ordena do mais escolhido para o menos escolhido
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [savedComps]);

  return (
    <main className="app-shell">
      {/* Seção de Upload com visual inspirado na seleção de mapas */}
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
            Carregue um arquivo JSON com o histórico de composições para visualizar estatísticas detalhadas.
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
            📂 Abrir Base de Dados Local
          </button>
          
          {savedComps && (
            <span className="toast-message" style={{ display: 'flex', alignItems: 'center' }}>
              Base carregada com sucesso! ({savedComps.length} composições lidas)
            </span>
          )}
        </div>
        
        {error && <div style={{ color: '#f87171', marginTop: '1rem', fontWeight: 'bold' }}>{error}</div>}
      </section>

      {/* Painel de Resultados estilo "Team Column" da página principal */}
      {savedComps && (
        <section className="pick-grid" style={{ gridTemplateColumns: '1fr' }}>
          <div className="team-column">
            <div className="team-header">
              <h2 style={{ margin: 0 }}>🏆 Brawlers Mais Escolhidos</h2>
              <span style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>Baseado no histórico carregado</span>
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