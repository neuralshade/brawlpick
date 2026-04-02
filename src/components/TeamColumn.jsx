// src/components/TeamColumn.jsx
import { slotLabels, getBrawlerImage } from "../constants";

export default function TeamColumn({
  teamName,
  teamClass,
  startIndex,
  teamSlots,
  firstPickTeam,
  nextPickIndex,
  orderLabels,
  activeSlot,
  searchTerm,
  filteredBrawlers,
  selectedHeroes,
  toggleSlot,
  setSearchTerm,
  handleSlotChange,
  glowClass
}) {
  const isFirstPick = (teamClass === "red-team" && firstPickTeam === "red") || 
                      (teamClass === "blue-team" && firstPickTeam === "blue");

  return (
    <div className={`team-column ${teamClass}`}>
      <div className="team-header">
        <span>{teamName}</span>
        <small>{isFirstPick ? "First Pick" : "Pick 2"}</small>
      </div>
      <div className="slot-row">
        {teamSlots.map((hero, localIndex) => {
          const globalIndex = localIndex + startIndex;
          const isNext = globalIndex === nextPickIndex;
          
          return (
            <article key={globalIndex} className={`slot-card ${isNext ? `next-pick ${glowClass}` : ""}`}>
              <div className="slot-label">{slotLabels[globalIndex]}</div>
              <div className="slot-top-row">
                <div className="slot-info">
                  {hero && getBrawlerImage(hero) ? (
                    <img src={getBrawlerImage(hero)} alt={hero} className="slot-avatar" />
                  ) : (
                    <div className="slot-avatar empty">?</div>
                  )}
                  <div className="slot-order-block">
                    <div className="slot-order">{orderLabels[globalIndex]}</div>
                    {hero && <div className="slot-brawler-name">{hero}</div>}
                  </div>
                </div>
                <button type="button" className="choose-button" onClick={() => toggleSlot(globalIndex)}>
                  {activeSlot === globalIndex ? "Close" : "Pick"}
                </button>
              </div>
              
              {activeSlot === globalIndex && (
                <div className="picker-container">
                  <div className="picker-search">
                    <input
                      type="text"
                      placeholder="Search brawler..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <div className="picker-grid">
                    {filteredBrawlers.map((brawler) => {
                      const optionDisabled = selectedHeroes.has(brawler) && brawler !== hero;
                      return (
                        <button
                          key={brawler}
                          type="button"
                          className={`brawler-option ${hero === brawler ? "selected" : ""}`}
                          onClick={() => handleSlotChange(globalIndex, brawler)}
                          disabled={optionDisabled}
                        >
                          <img src={getBrawlerImage(brawler)} alt={brawler} />
                          <span>{brawler}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}