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
      <section className="notes-feed-section">
        <h2 className="notes-feed-title">Match History</h2>
        <p className="notes-feed-subtitle">
          View match details and set the result of each match to generate accurate statistics.
        </p>
        
        <div className="notes-list">
          {savedComps.map((match) => {
            const dateStr = new Date(match.date || match.id).toLocaleDateString();
            const redSlots = match.slots.slice(0, 3);
            const blueSlots = match.slots.slice(3, 6);

            return (
              <div key={match.id} className="note-card" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
                <div className="note-header">
                  <div>
                    <h4 className="note-map-title">{match.mapMode.map} - {match.mapMode.mode}</h4>
                    <p className="note-text">
                      <strong>Notes: </strong> {match.notes ? match.notes : "No notes."}
                    </p>
                    <p className="note-stats">
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
                      {match.result === 'win' ? 'Win Recorded' : 'Mark Win'}
                    </button>
                    <button 
                      style={{ opacity: match.result === 'win' ? 0.5 : 1 }} 
                      className="btn-loss" 
                      onClick={() => registerResult(match.id, 'loss')}
                    >
                      {match.result === 'loss' ? 'Loss Recorded' : 'Mark Loss'}
                    </button>
                  </div>
                </div>

                {/* Exibição da Composição/Detalhes do Time */}
                <div className="saved-teams" style={{ marginTop: '1.5rem' }}>
                  <div className="saved-team red-team">
                    <h3>
                      Red Team
                      {match.firstPickTeam === TEAM_RED && <span className="saved-team-badge red">FP</span>}
                    </h3>
                    <ul>
                      {redSlots.map((item) => (
                        <li key={item.slot} className="saved-slot-row">
                          <img src={getBrawlerImage(item.hero)} alt={item.hero} className="saved-slot-avatar" />
                          <div>
                            <div className="saved-slot-order">{item.order}</div>
                            <div className="saved-slot-name">{item.hero}</div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="saved-team blue-team">
                    <h3>
                      Blue Team
                      {match.firstPickTeam === TEAM_BLUE && <span className="saved-team-badge blue">FP</span>}
                    </h3>
                    <ul>
                      {blueSlots.map((item) => (
                        <li key={item.slot} className="saved-slot-row">
                          <img src={getBrawlerImage(item.hero)} alt={item.hero} className="saved-slot-avatar" />
                          <div>
                            <div className="saved-slot-order">{item.order}</div>
                            <div className="saved-slot-name">{item.hero}</div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
          {savedComps.length === 0 && <p className="empty-text">No matches found.</p>}
        </div>
      </section>
    </main>
  );
}