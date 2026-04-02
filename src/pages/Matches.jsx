import React from 'react';
import { TEAM_RED, TEAM_BLUE, getBrawlerImage } from "../constants";

export default function Matches({ savedComps, setSavedComps }) {
  const registerResult = (id, result) => {
    const newComps = savedComps.map(comp => 
      comp.id === id ? { ...comp, result } : comp
    );
    setSavedComps(newComps);
  };

  return (
    <main className="app-shell matches-main">
      <div className="map-mode-group-title" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
        Histórico de Partidas
      </div>
      <p style={{ color: '#fff', textShadow: '1px 1px 2px #000', marginBottom: '2rem' }}>
        Visualize os detalhes e defina os resultados das partidas para gerar estatísticas.
      </p>
      
      <div className="notes-list">
        {savedComps.map((match) => {
          const dateStr = new Date(match.date || match.id).toLocaleDateString();
          const redSlots = match.slots.slice(0, 3);
          const blueSlots = match.slots.slice(3, 6);

          return (
            <div key={match.id} className="map-mode-card">
              <div className="map-mode-header" style={{ marginBottom: '1rem', alignItems: 'flex-start' }}>
                <div>
                  <h4 className="map-mode-group-title" style={{ margin: 0, fontSize: '1.2rem', color: '#f59e0b' }}>
                    {match.mapMode.map} - {match.mapMode.mode}
                  </h4>
                  <p style={{ color: '#cbd5e1', margin: '0.5rem 0', fontStyle: 'italic' }}>
                    <strong>Notas: </strong> {match.notes ? match.notes : "Sem notas."}
                  </p>
                  <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.9rem' }}>
                    <strong>Data:</strong> {dateStr} | <strong>Status:</strong> {
                      match.result === 'win' ? '🟢 Vitória' : match.result === 'loss' ? '🔴 Derrota' : '⚪ Pendente'
                    }
                  </p>
                </div>
                <div className="note-actions">
                  <button 
                    style={{ opacity: match.result === 'loss' ? 0.5 : 1 }} 
                    className="btn-win" 
                    onClick={() => registerResult(match.id, 'win')}
                  >
                    {match.result === 'win' ? 'Vitória Salva' : 'Marcar Vitória'}
                  </button>
                  <button 
                    style={{ opacity: match.result === 'win' ? 0.5 : 1 }} 
                    className="btn-loss" 
                    onClick={() => registerResult(match.id, 'loss')}
                  >
                    {match.result === 'loss' ? 'Derrota Salva' : 'Marcar Derrota'}
                  </button>
                </div>
              </div>

              <div className="pick-grid">
                <div className="team-column blue-team">
                  <div className="team-header">
                    <span>TIME AZUL {match.firstPickTeam === TEAM_BLUE && '(FP)'}</span>
                  </div>
                  <div className="slot-row">
                    {blueSlots.map((item) => (
                      <article key={item.slot} className="slot-card slot-top-row">
                        <div className="slot-info">
                          <img src={getBrawlerImage(item.hero)} alt={item.hero} className="slot-avatar" />
                          <div className="slot-order-block">
                            <span className="slot-order">{item.order}</span>
                            <span className="slot-brawler-name"><strong>{item.hero}</strong></span>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>

                <div className="team-column red-team">
                  <div className="team-header">
                    <span>TIME VERMELHO {match.firstPickTeam === TEAM_RED && '(FP)'}</span>
                  </div>
                  <div className="slot-row">
                    {redSlots.map((item) => (
                      <article key={item.slot} className="slot-card slot-top-row">
                        <div className="slot-info">
                          <img src={getBrawlerImage(item.hero)} alt={item.hero} className="slot-avatar" />
                          <div className="slot-order-block">
                            <span className="slot-order">{item.order}</span>
                            <span className="slot-brawler-name"><strong>{item.hero}</strong></span>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {savedComps.length === 0 && <p className="empty-text">Nenhuma partida registrada ainda.</p>}
      </div>
    </main>
  );
}