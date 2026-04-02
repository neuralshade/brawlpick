// src/components/MapSelector.jsx
import { MAP_MODE_OPTIONS, getModeIcon } from "../constants";

export default function MapSelector({ selectedMapMode, setSelectedMapMode }) {
  const GROUPED_MAPS = MAP_MODE_OPTIONS.reduce((acc, option) => {
    if (!acc[option.mode]) acc[option.mode] = [];
    acc[option.mode].push(option);
    return acc;
  }, {});

  return (
    <section className="map-mode-card">
      <div className="map-mode-header">
        <div><span>MAP & MODE</span></div>
        <div className="map-mode-selected">
          {selectedMapMode.map} · {selectedMapMode.mode}
        </div>
      </div>

      <div className="map-groups-container">
        {Object.entries(GROUPED_MAPS).map(([mode, maps]) => (
          <div key={mode} className="map-mode-group">
            <h3 className="map-mode-group-title">
              {getModeIcon(mode) && <img src={getModeIcon(mode)} alt={mode} className="mode-icon" />}
              <span>{mode}</span>
            </h3>
            <div className="map-mode-grid">
              {maps.map((option) => (
                <button
                  key={option.map}
                  type="button"
                  className={`map-mode-option ${selectedMapMode.map === option.map ? "selected" : ""}`}
                  onClick={() => setSelectedMapMode(option)}
                >
                  <div className="map-mode-name">{option.map}</div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}