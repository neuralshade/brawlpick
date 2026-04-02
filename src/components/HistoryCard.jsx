// src/components/HistoryCard.jsx
import { TEAM_RED, TEAM_BLUE, getBrawlerImage } from "../constants";

export default function HistoryCard({ savedComps }) {
  if (savedComps.length === 0) return null;

  return (
    <section className="history-card">
      <h2>Saved compositions</h2>
      <div className="saved-list">
        {savedComps.map((comp) => {
          const redSlots = comp.slots.slice(0, 3);
          const blueSlots = comp.slots.slice(3, 6);
          
          return (
            <article key={comp.id} className="saved-item">
              <div style={{ marginBottom: "1rem", paddingBottom: "0.75rem", borderBottom: "1px solid #cbd5e1" }}>
                <span style={{ color: "#0f172a" }}>{comp.mapMode.map}</span>
                <span style={{ color: "#64748b", marginLeft: "0.5rem", fontSize: "0.9rem" }}>
                  · {comp.mapMode.mode}
                </span>
              </div>
              <div className="saved-teams">
                {/* Red Team History */}
                <div className="saved-team red-team">
                  <h3>
                    Red Team
                    {comp.firstPickTeam === TEAM_RED && <span className="saved-team-badge red">FP</span>}
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
                {/* Blue Team History */}
                <div className="saved-team blue-team">
                  <h3>
                    Blue Team
                    {comp.firstPickTeam === TEAM_BLUE && <span className="saved-team-badge blue">FP</span>}
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
            </article>
          );
        })}
      </div>
    </section>
  );
}