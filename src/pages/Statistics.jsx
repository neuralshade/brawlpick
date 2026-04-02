import React, { useRef, useMemo, useState } from 'react';
import { MAP_MODE_OPTIONS } from '../constants';

export default function Statistics({ savedComps, setSavedComps }) {
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState('');
  const fileInputRef = useRef(null);

  // Filtros
  const [filterMap, setFilterMap] = useState('Todos');
  const [filterMode, setFilterMode] = useState('Todos');

  // Filtra as composições conforme Mapa e Modo
  const filteredComps = useMemo(() => {
    return savedComps.filter(comp => {
      const matchMap = filterMap === 'Todos' || comp.mapMode?.map === filterMap;
      const matchMode = filterMode === 'Todos' || comp.mapMode?.mode === filterMode;
      return matchMap && matchMode;
    });
  }, [savedComps, filterMap, filterMode]);

  // --------- FUNÇÕES DE ARQUIVO (Migradas) ---------
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const rawData = JSON.parse(e.target.result);
        const dataArray = Array.isArray(rawData) ? rawData : [rawData];
        const formattedData = dataArray.map(comp => ({
          id: comp.id || Date.now() + Math.random(),
          firstPickTeam: comp.firstPickTeam || 'TEAM_RED',
          mapMode: comp.mapMode || { map: 'Desconhecido', mode: 'Desconhecido' },
          notes: comp.notes || '',
          bans: comp.bans || { red: [], blue: [] },
          slots: Array.isArray(comp.slots) ? comp.slots : [],
          stats: comp.stats || { matchesPlayed: 0, wins: 0, losses: 0, winRate: 0 }
        }));
        setSavedComps(formattedData);
        setError('');
        setShowToast(`Arquivo carregado com ${formattedData.length} registros!`);
      } catch (err) {
        setError('Erro ao processar o arquivo JSON. Verifique se o formato é válido.');
      }
    };
    reader.readAsText(file);
    event.target.value = null;
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
    setShowToast("Arquivo JSON exportado com sucesso!");
  };

  // --------- CÁLCULO DE ESTATÍSTICAS ---------
  
  // Taxa de Pick Geral
  const pickStats = useMemo(() => {
    const counts = {};
    filteredComps.forEach(comp => {
      if (comp.slots) {
        comp.slots.forEach(s => {
          if (s.hero) counts[s.hero] = (counts[s.hero] || 0) + 1;
        });
      }
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [filteredComps]);

  // Taxa de Banimento (Ban Rate)
  const banStats = useMemo(() => {
    const counts = {};
    let totalMatches = filteredComps.length;
    filteredComps.forEach(comp => {
      if (comp.bans) {
        const allBans = [...(comp.bans.red || []), ...(comp.bans.blue || [])];
        allBans.forEach(b => {
          if (b) counts[b] = (counts[b] || 0) + 1;
        });
      }
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count, rate: totalMatches > 0 ? ((count / totalMatches) * 100).toFixed(1) : 0 }))
      .sort((a, b) => b.count - a.count);
  }, [filteredComps]);

  // Taxa de Vitória (Win Rate)
  const winRateStats = useMemo(() => {
    const stats = {};
    filteredComps.forEach(comp => {
      const played = comp.stats?.matchesPlayed || 0;
      const wins = comp.stats?.wins || 0;
      if (comp.slots && played > 0) {
        comp.slots.forEach(s => {
          if (s.hero) {
            if (!stats[s.hero]) stats[s.hero] = { played: 0, wins: 0 };
            stats[s.hero].played += played;
            stats[s.hero].wins += wins;
          }
        });
      }
    });
    return Object.entries(stats)
      .map(([name, data]) => ({ name, played: data.played, winRate: ((data.wins / data.played) * 100).toFixed(1) }))
      .sort((a, b) => parseFloat(b.winRate) - parseFloat(a.winRate));
  }, [filteredComps]);

  // Alimentar sistema de vitórias/derrotas para teste
  const registerResult = (compIndex, result) => {
    const newComps = [...savedComps];
    // Acha o index real na base principal
    const realIndex = savedComps.findIndex(c => c.id === filteredComps[compIndex].id);
    if (realIndex > -1) {
      newComps[realIndex].stats.matchesPlayed += 1;
      if (result === 'win') newComps[realIndex].stats.wins += 1;
      else newComps[realIndex].stats.losses += 1;
      newComps[realIndex].stats.winRate = ((newComps[realIndex].stats.wins / newComps[realIndex].stats.matchesPlayed) * 100).toFixed(1);
      setSavedComps(newComps);
      setShowToast(`Resultado registrado para a comp de ${newComps[realIndex].mapMode.map}!`);
    }
  };

  // Gerar lista única de Modos e Mapas
  const uniqueModes = ['Todos', ...new Set(MAP_MODE_OPTIONS.map(m => m.mode))];
  const uniqueMaps = ['Todos', ...new Set(MAP_MODE_OPTIONS.map(m => m.map))];

  return (
    <main className="app-shell" style={{ paddingBottom: '50px' }}>
      
      {/* CABEÇALHO E CONTROLES DE ARQUIVO */}
      <section className="map-mode-card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ color: '#fff', margin: 0 }}>📊 Dashboard Estatístico</h1>
            <p style={{ color: '#cbd5e1', fontSize: '0.9rem', margin: '5px 0' }}>Base Total: <b>{savedComps?.length || 0}</b> registros.</p>
          </div>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <input type="file" accept=".json" style={{ display: 'none' }} ref={fileInputRef} onChange={handleFileUpload} />
            <button onClick={() => fileInputRef.current.click()} style={{ background: '#3b82f6', border: 'none', padding: '10px 16px', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}>
              📂 Abrir JSON
            </button>
            <button onClick={exportDatabase} style={{ background: '#10b981', border: 'none', padding: '10px 16px', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}>
              💾 Salvar JSON
            </button>
          </div>
        </div>
        {showToast && <div style={{ color: '#10b981', marginTop: '10px', fontWeight: 'bold' }}>{showToast}</div>}
        {error && <div style={{ color: '#f87171', marginTop: '10px', fontWeight: 'bold' }}>{error}</div>}
      </section>

      {/* FILTROS */}
      <section style={{ background: '#1a1a2e', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #444' }}>
        <h3 style={{ color: '#fff', marginTop: 0 }}>Filtros de Análise</h3>
        <div style={{ display: 'flex', gap: '20px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ color: '#aaa', display: 'block', marginBottom: '5px' }}>Filtrar por Modo:</label>
            <select value={filterMode} onChange={(e) => { setFilterMode(e.target.value); setFilterMap('Todos'); }} style={{ width: '100%', padding: '8px', background: '#222', color: '#fff', borderRadius: '4px' }}>
              {uniqueModes.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ color: '#aaa', display: 'block', marginBottom: '5px' }}>Filtrar por Mapa:</label>
            <select value={filterMap} onChange={(e) => setFilterMap(e.target.value)} style={{ width: '100%', padding: '8px', background: '#222', color: '#fff', borderRadius: '4px' }}>
              {uniqueMaps.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>
        <p style={{ color: '#10b981', fontSize: '0.9rem', marginTop: '10px' }}>Exibindo <b>{filteredComps.length}</b> drafts que correspondem ao filtro.</p>
      </section>

      {/* PAINÉIS DE ESTATÍSTICAS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        
        {/* PANEL: MAIS BANIDOS */}
        <div style={{ background: '#2d0a0a', padding: '15px', borderRadius: '8px', border: '1px solid #ef4444' }}>
          <h3 style={{ color: '#ef4444', marginTop: 0 }}>🚫 Taxa de Banimento (Ban Rate)</h3>
          {banStats.length > 0 ? (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#fff' }}>
              {banStats.map((b, i) => (
                <li key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #444' }}>
                  <span>{b.name}</span>
                  <strong>{b.rate}% <span style={{fontSize: '0.8rem', color: '#aaa'}}>({b.count} bans)</span></strong>
                </li>
              ))}
            </ul>
          ) : <p style={{ color: '#aaa' }}>Sem dados de ban para este filtro.</p>}
        </div>

        {/* PANEL: MAIS ESCOLHIDOS */}
        <div style={{ background: '#0a1a2d', padding: '15px', borderRadius: '8px', border: '1px solid #3b82f6' }}>
          <h3 style={{ color: '#3b82f6', marginTop: 0 }}>✅ Mais Escolhidos (Pick Rate)</h3>
          {pickStats.length > 0 ? (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#fff' }}>
              {pickStats.slice(0, 10).map(([name, count], i) => (
                <li key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #444' }}>
                  <span>{name}</span>
                  <strong>{count} picks</strong>
                </li>
              ))}
            </ul>
          ) : <p style={{ color: '#aaa' }}>Sem dados de pick para este filtro.</p>}
        </div>

        {/* PANEL: WIN RATE */}
        <div style={{ background: '#0a2d1a', padding: '15px', borderRadius: '8px', border: '1px solid #10b981' }}>
          <h3 style={{ color: '#10b981', marginTop: 0 }}>🏆 Win Rate por Brawler</h3>
          <p style={{ fontSize: '0.8rem', color: '#aaa', marginTop: '-10px' }}>(Apenas Brawlers com partidas jogadas)</p>
          {winRateStats.length > 0 ? (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#fff' }}>
              {winRateStats.map((b, i) => (
                <li key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #444' }}>
                  <span>{b.name}</span>
                  <strong>{b.winRate}% <span style={{fontSize: '0.8rem', color: '#aaa'}}>({b.played} jogos)</span></strong>
                </li>
              ))}
            </ul>
          ) : <p style={{ color: '#aaa' }}>Nenhuma partida jogada neste mapa ainda.</p>}
        </div>
      </div>

      {/* ÁREA DE REGISTRO E ANOTAÇÕES */}
      <section style={{ marginTop: '30px' }}>
        <h2 style={{ color: '#fff' }}>📝 Anotações e Alimentação de Dados</h2>
        <p style={{ color: '#aaa', fontSize: '0.9rem' }}>Abaixo estão as composições deste filtro. Registre vitórias ou derrotas para calcular o Win Rate real!</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {filteredComps.map((comp, idx) => (
            <div key={comp.id} style={{ background: '#222', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #f59e0b' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h4 style={{ margin: '0 0 5px 0', color: '#f59e0b' }}>{comp.mapMode.map} - {comp.mapMode.mode}</h4>
                  <p style={{ margin: 0, color: '#ddd', fontSize: '0.9rem', fontStyle: 'italic' }}>
                    <strong>Anotação do Draft: </strong> {comp.notes ? comp.notes : "Sem anotações registradas."}
                  </p>
                  <p style={{ margin: '5px 0 0 0', color: '#aaa', fontSize: '0.8rem' }}>
                    Jogos: {comp.stats.matchesPlayed} | Vitórias: {comp.stats.wins} | Derrotas: {comp.stats.losses}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => registerResult(idx, 'win')} style={{ background: '#10b981', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>+ Vitória</button>
                  <button onClick={() => registerResult(idx, 'loss')} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>+ Derrota</button>
                </div>
              </div>
            </div>
          ))}
          {filteredComps.length === 0 && <p style={{ color: '#aaa' }}>Nenhuma comp para avaliar.</p>}
        </div>
      </section>

    </main>
  );
}