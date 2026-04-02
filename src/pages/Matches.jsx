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
        Match History
      </div>
      <p style={{ color: '#fff', textShadow: '1px 1px 2px #000', marginBottom: '2rem' }}>
        View details and set match results to generate statistics.
      </p>
      
      <div className="notes-list">
        {savedComps.map((match) => {
          const dateStr = new Date(match.date || match.id).toLocaleDateString();
          const redSlots = match.slots.slice(0, 3);
          const blueSlots = match.slots.slice(3, 6);
          
          // Recupera os bans (com fallback para arrays vazios caso sejam partidas antigas salvas sem bans)
          const redBans = match.bans?.red || [];
          const blueBans = match.bans?.blue || [];

          return (
            <div key={match.id} className="map-mode-card">
              <div className="map-mode-header" style={{ marginBottom: '1rem', alignItems: 'flex-start' }}>
                <div>
                  <h4 className="map-mode-group-title" style={{ margin: 0, fontSize: '1.2rem', color: '#f59e0b' }}>
                    {match.mapMode.map} - {match.mapMode.mode}
                  </h4>
                  <p style={{ color: '#cbd5e1', margin: '0.5rem 0', fontStyle: 'italic' }}>
                    <strong>Notes: </strong> {match.notes ? match.notes : "No notes."}
                  </p>
                  <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.9rem' }}>
                    <strong>Date:</strong> {dateStr} | <strong>Status:</strong> {
                      match.result === 'win' ? '🟢 Win' : match.result === 'loss' ? '🔴 Loss' : '⚪ Pending'
                    }
                  </p>
                </div>
                <div className="note-actions">
                  <button 
                    style={{ opacity: match.result === 'loss' ? 0.5 : 1 }} 
                    className="btn-win" 
                    onClick={() => registerResult(match.id, 'win')}
                  >
                    {match.result === 'win' ? 'Win Saved' : 'Mark Win'}
                  </button>
                  <button 
                    style={{ opacity: match.result === 'win' ? 0.5 : 1 }} 
                    className="btn-loss" 
                    onClick={() => registerResult(match.id, 'loss')}
                  >
                    {match.result === 'loss' ? 'Loss Saved' : 'Mark Loss'}
                  </button>
                </div>
              </div>

              <div className="pick-grid">
                {/* BLUE TEAM */}
                <div className="team-column blue-team">
                  <div className="team-header">
                    <span>BLUE TEAM {match.firstPickTeam === TEAM_BLUE && '(FP)'}</span>
                  </div>
                  
                  {/* Seção de Bans do Time Azul */}
                  {blueBans.length > 0 && (
                    <div style={{ display: 'flex', gap: '8px', padding: '8px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', marginBottom: '12px', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 'bold' }}>BANS:</span>
                      {blueBans.map((ban, idx) => (
                        ban ? <img key={`blue-ban-${idx}`} src={getBrawlerImage(ban)} alt={ban} title={ban} style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid #ef4444', objectFit: 'cover' }} /> : null
                      ))}
                    </div>
                  )}

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

                {/* RED TEAM */}
                <div className="team-column red-team">
                  <div className="team-header">
                    <span>RED TEAM {match.firstPickTeam === TEAM_RED && '(FP)'}</span>
                  </div>

                  {/* Seção de Bans do Time Vermelho */}
                  {redBans.length > 0 && (
                    <div style={{ display: 'flex', gap: '8px', padding: '8px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', marginBottom: '12px', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 'bold' }}>BANS:</span>
                      {redBans.map((ban, idx) => (
                        ban ? <img key={`red-ban-${idx}`} src={getBrawlerImage(ban)} alt={ban} title={ban} style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid #ef4444', objectFit: 'cover' }} /> : null
                      ))}
                    </div>
                  )}

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
        {savedComps.length === 0 && <p className="empty-text">No matches registered yet.</p>}
      </div>
    </main>
  );
}