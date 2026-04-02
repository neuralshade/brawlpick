import React, { useRef, useMemo, useState } from 'react';
import { MAP_MODE_OPTIONS } from '../constants';

export default function Statistics({ savedComps, setSavedComps }) {
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState('');
  const fileInputRef = useRef(null);

  const [filterMap, setFilterMap] = useState('Todos');
  const [filterMode, setFilterMode] = useState('Todos');

  const filteredComps = useMemo(() => {
    return savedComps.filter(match => {
      const matchMap = filterMap === 'Todos' || match.mapMode?.map === filterMap;
      const matchMode = filterMode === 'Todos' || match.mapMode?.mode === filterMode;
      return matchMap && matchMode;
    });
  }, [savedComps, filterMap, filterMode]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const rawData = JSON.parse(e.target.result);
        const dataArray = Array.isArray(rawData) ? rawData : [rawData];
        const formattedData = dataArray.map(match => ({
          id: match.id || Date.now() + Math.random(),
          date: match.date || new Date(match.id || Date.now()).toISOString(),
          firstPickTeam: match.firstPickTeam || 'TEAM_RED',
          mapMode: match.mapMode || { map: 'Desconhecido', mode: 'Desconhecido' },
          notes: match.notes || '',
          bans: match.bans || { red: [], blue: [] },
          slots: Array.isArray(match.slots) ? match.slots : [],
          result: match.result || null 
        }));
        setSavedComps(formattedData);
        setError('');
        setShowToast(`Arquivo carregado com ${formattedData.length} partidas!`);
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
    downloadAnchorNode.setAttribute("download", `brawl_matches_${new Date().getTime()}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    setShowToast("Arquivo JSON exportado com sucesso!");
  };

  const pickStats = useMemo(() => {
    const counts = {};
    filteredComps.forEach(match => {
      if (match.slots) {
        match.slots.forEach(s => {
          if (s.hero) counts[s.hero] = (counts[s.hero] || 0) + 1;
        });
      }
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [filteredComps]);

  const banStats = useMemo(() => {
    const counts = {};
    let totalMatches = filteredComps.length;
    filteredComps.forEach(match => {
      if (match.bans) {
        const allBans = [...(match.bans.red || []), ...(match.bans.blue || [])];
        allBans.forEach(b => {
          if (b) counts[b] = (counts[b] || 0) + 1;
        });
      }
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count, rate: totalMatches > 0 ? ((count / totalMatches) * 100).toFixed(1) : 0 }))
      .sort((a, b) => b.count - a.count);
  }, [filteredComps]);

  const winRateStats = useMemo(() => {
    const stats = {};
    filteredComps.forEach(match => {
      if (match.result === 'win' || match.result === 'loss') {
        if (match.slots) {
          match.slots.forEach(s => {
            if (s.hero) {
              if (!stats[s.hero]) stats[s.hero] = { played: 0, wins: 0 };
              stats[s.hero].played += 1;
              if (match.result === 'win') stats[s.hero].wins += 1;
            }
          });
        }
      }
    });
    return Object.entries(stats)
      .map(([name, data]) => ({ name, played: data.played, winRate: ((data.wins / data.played) * 100).toFixed(1) }))
      .sort((a, b) => parseFloat(b.winRate) - parseFloat(a.winRate));
  }, [filteredComps]);

  const uniqueModes = ['Todos', ...new Set(MAP_MODE_OPTIONS.map(m => m.mode))];
  const uniqueMaps = ['Todos', ...new Set(MAP_MODE_OPTIONS.map(m => m.map))];

  return (
    <main className="app-shell stats-main">
      <section className="map-mode-card stats-header-card">
        <div className="stats-header-content">
          <div>
            <h1 className="stats-title map-mode-group-title" style={{ fontSize: '1.5rem', margin: 0 }}>
              Dashboard Estatístico
            </h1>
            <p className="stats-subtitle" style={{ color: '#fff', textShadow: '1px 1px 2px #000' }}>
              Base Total: <b>{savedComps?.length || 0}</b> partidas.
            </p>
          </div>
          
          <div className="stats-actions">
            <input type="file" accept=".json" className="hidden-input" ref={fileInputRef} onChange={handleFileUpload} />
            <button className="btn-open" onClick={() => fileInputRef.current.click()}>📂 Abrir JSON</button>
            <button className="btn-save" onClick={exportDatabase}>💾 Salvar JSON</button>
          </div>
        </div>
        {showToast && <div className="toast-message toast-success" style={{marginTop: '10px'}}>{showToast}</div>}
        {error && <div className="stats-toast-error">{error}</div>}
      </section>

      <section className="map-mode-card filters-section" style={{ background: 'rgba(0,0,0,0.4)', border: '2px solid #000' }}>
        <h3 className="map-mode-group-title" style={{ fontSize: '1.2rem' }}>Filtros de Análise</h3>
        <div className="filters-grid">
          <div className="filter-group">
            <label className="filter-label" style={{ color: '#fff' }}>Filtrar por Modo:</label>
            <select className="filter-select" value={filterMode} onChange={(e) => { setFilterMode(e.target.value); setFilterMap('Todos'); }}>
              {uniqueModes.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div className="filter-group">
            <label className="filter-label" style={{ color: '#fff' }}>Filtrar por Mapa:</label>
            <select className="filter-select" value={filterMap} onChange={(e) => setFilterMap(e.target.value)}>
              {uniqueMaps.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>
        <p className="filter-result-text" style={{ textShadow: '1px 1px 2px #000' }}>
          Exibindo <b>{filteredComps.length}</b> partidas que correspondem ao filtro.
        </p>
      </section>

      <div className="stats-panels-grid">
        <div className="map-mode-card panel-bans" style={{ borderColor: '#ef4444', borderWidth: '2px' }}>
          <h3 className="map-mode-group-title" style={{ color: '#ef4444' }}>Taxa de Banimento</h3>
          {banStats.length > 0 ? (
            <ul className="stats-list">
              {banStats.map((b, i) => (
                <li key={i} className="stats-list-item">
                  <span>{b.name}</span>
                  <strong>{b.rate}% <span className="stats-list-subvalue">({b.count} bans)</span></strong>
                </li>
              ))}
            </ul>
          ) : <p className="empty-text">Sem dados de ban para este filtro.</p>}
        </div>

        <div className="map-mode-card panel-picks" style={{ borderColor: '#3b82f6', borderWidth: '2px' }}>
          <h3 className="map-mode-group-title" style={{ color: '#3b82f6' }}>Mais Escolhidos</h3>
          {pickStats.length > 0 ? (
            <ul className="stats-list">
              {pickStats.slice(0, 10).map(([name, count], i) => (
                <li key={i} className="stats-list-item">
                  <span>{name}</span>
                  <strong>{count} picks</strong>
                </li>
              ))}
            </ul>
          ) : <p className="empty-text">Sem dados de pick para este filtro.</p>}
        </div>

        <div className="map-mode-card panel-winrate" style={{ borderColor: '#10b981', borderWidth: '2px' }}>
          <h3 className="map-mode-group-title" style={{ color: '#10b981' }}>Win Rate</h3>
          <span className="panel-subtitle" style={{ color: '#fff' }}>(Partidas com resultado definido)</span>
          {winRateStats.length > 0 ? (
            <ul className="stats-list">
              {winRateStats.map((b, i) => (
                <li key={i} className="stats-list-item">
                  <span>{b.name}</span>
                  <strong>{b.winRate}% <span className="stats-list-subvalue">({b.played} jogos)</span></strong>
                </li>
              ))}
            </ul>
          ) : <p className="empty-text">Nenhuma partida finalizada neste filtro.</p>}
        </div>
      </div>
    </main>
  );
}