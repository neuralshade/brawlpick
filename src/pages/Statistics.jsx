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
    <main className="app-shell stats-main">
      
      {/* CABEÇALHO E CONTROLES DE ARQUIVO */}
      <section className="map-mode-card stats-header-card">
        <div className="stats-header-content">
          <div>
            <h1 className="stats-title">📊 Dashboard Estatístico</h1>
            <p className="stats-subtitle">Base Total: <b>{savedComps?.length || 0}</b> registros.</p>
          </div>
          
          <div className="stats-actions">
            <input type="file" accept=".json" className="hidden-input" ref={fileInputRef} onChange={handleFileUpload} />
            <button className="btn-open" onClick={() => fileInputRef.current.click()}>
              📂 Abrir JSON
            </button>
            <button className="btn-save" onClick={exportDatabase}>
              💾 Salvar JSON
            </button>
          </div>
        </div>
        {showToast && <div className="toast-message toast-success" style={{marginTop: '10px'}}>{showToast}</div>}
        {error && <div className="stats-toast-error">{error}</div>}
      </section>

      {/* FILTROS */}
      <section className="filters-section">
        <h3 className="filters-title">Filtros de Análise</h3>
        <div className="filters-grid">
          <div className="filter-group">
            <label className="filter-label">Filtrar por Modo:</label>
            <select className="filter-select" value={filterMode} onChange={(e) => { setFilterMode(e.target.value); setFilterMap('Todos'); }}>
              {uniqueModes.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div className="filter-group">
            <label className="filter-label">Filtrar por Mapa:</label>
            <select className="filter-select" value={filterMap} onChange={(e) => setFilterMap(e.target.value)}>
              {uniqueMaps.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>
        <p className="filter-result-text">Exibindo <b>{filteredComps.length}</b> drafts que correspondem ao filtro.</p>
      </section>

      {/* PAINÉIS DE ESTATÍSTICAS */}
      <div className="stats-panels-grid">
        
        {/* PANEL: MAIS BANIDOS */}
        <div className="stats-panel panel-bans">
          <h3 className="panel-title title-bans">Taxa de Banimento (Ban Rate)</h3>
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

        {/* PANEL: MAIS ESCOLHIDOS */}
        <div className="stats-panel panel-picks">
          <h3 className="panel-title title-picks">Mais Escolhidos (Pick Rate)</h3>
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

        {/* PANEL: WIN RATE */}
        <div className="stats-panel panel-winrate">
          <h3 className="panel-title title-winrate">Win Rate por Brawler</h3>
          <span className="panel-subtitle">(Apenas Brawlers com partidas jogadas)</span>
          {winRateStats.length > 0 ? (
            <ul className="stats-list">
              {winRateStats.map((b, i) => (
                <li key={i} className="stats-list-item">
                  <span>{b.name}</span>
                  <strong>{b.winRate}% <span className="stats-list-subvalue">({b.played} jogos)</span></strong>
                </li>
              ))}
            </ul>
          ) : <p className="empty-text">Nenhuma partida jogada neste mapa ainda.</p>}
        </div>
      </div>

      {/* ÁREA DE REGISTRO E ANOTAÇÕES */}
      <section className="notes-feed-section">
        <h2 className="notes-feed-title">📝 Anotações e Alimentação de Dados</h2>
        <p className="notes-feed-subtitle">Abaixo estão as composições deste filtro. Registre vitórias ou derrotas para calcular o Win Rate real!</p>
        
        <div className="notes-list">
          {filteredComps.map((comp, idx) => (
            <div key={comp.id} className="note-card">
              <div className="note-header">
                <div>
                  <h4 className="note-map-title">{comp.mapMode.map} - {comp.mapMode.mode}</h4>
                  <p className="note-text">
                    <strong>Anotação do Draft: </strong> {comp.notes ? comp.notes : "Sem anotações registradas."}
                  </p>
                  <p className="note-stats">
                    Jogos: {comp.stats.matchesPlayed} | Vitórias: {comp.stats.wins} | Derrotas: {comp.stats.losses}
                  </p>
                </div>
                <div className="note-actions">
                  <button className="btn-win" onClick={() => registerResult(idx, 'win')}>+ Vitória</button>
                  <button className="btn-loss" onClick={() => registerResult(idx, 'loss')}>+ Derrota</button>
                </div>
              </div>
            </div>
          ))}
          {filteredComps.length === 0 && <p className="empty-text">Nenhuma comp para avaliar.</p>}
        </div>
      </section>

    </main>
  );
}