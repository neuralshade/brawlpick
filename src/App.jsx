import { useMemo, useState } from "react";

const brawlerFiles = import.meta.glob("./assets/brawlers/*.webp", {
  eager: true,
  import: "default",
});

const BRAWLER_IMAGES = Object.fromEntries(
  Object.entries(brawlerFiles).map(([path, url]) => {
    const fileName = path
      .replace(/\\/g, "/")
      .split("/")
      .pop()
      .replace(".webp", "");
    return [fileName, url];
  }),
);

const normalizeBrawlerName = (name) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");

const prettyBrawlerName = (fileName) =>
  fileName
    .replace(/_/g, " ")
    .replace(/(^|\s)\S/g, (char) => char.toUpperCase());

const BRAWLERS = Object.keys(BRAWLER_IMAGES).sort().map(prettyBrawlerName);

const getBrawlerImage = (name) => BRAWLER_IMAGES[normalizeBrawlerName(name)];

const slotLabels = ["Red 1", "Red 2", "Red 3", "Blue 1", "Blue 2", "Blue 3"];

const MAP_MODE_OPTIONS = [
  { map: "Hard Rock Mine", mode: "Gem Grab" },
  { map: "Minecart Madness", mode: "Gem Grab" },
  { map: "Double Swoosh", mode: "Gem Grab" },
  { map: "Stonewall Brawl", mode: "Gem Grab" },
  { map: "Deathcap Trap", mode: "Gem Grab" },
  { map: "Undermine", mode: "Gem Grab" },
  { map: "Rustic Arcade", mode: "Gem Grab" },
  { map: "Acute Angle", mode: "Gem Grab" },
  { map: "Backyard Bowl", mode: "Brawl Ball" },
  { map: "Pinhole Punt", mode: "Brawl Ball" },
  { map: "Sneaky Fields", mode: "Brawl Ball" },
  { map: "Super Beach", mode: "Brawl Ball" },
  { map: "Center Stage", mode: "Brawl Ball" },
  { map: "Galaxy Arena", mode: "Brawl Ball" },
  { map: "Retropolis", mode: "Brawl Ball" },
  { map: "Triple Dribble", mode: "Brawl Ball" },
  { map: "Goldarm Gulch", mode: "Knockout" },
  { map: "Belle's Rock", mode: "Knockout" },
  { map: "New Horizons", mode: "Knockout" },
  { map: "Out in the Open", mode: "Knockout" },
  { map: "Flaring Phoenix", mode: "Knockout" },
  { map: "Healthy Middle Ground", mode: "Knockout" },
  { map: "Flowing River", mode: "Knockout" },
  { map: "Between the Rivers", mode: "Knockout" },
  { map: "Hot Potato", mode: "Heist" },
  { map: "Safe Zone", mode: "Heist" },
  { map: "Kaboom Canyon", mode: "Heist" },
  { map: "Bridge Too Far", mode: "Heist" },
  { map: "G.G. Mortuary", mode: "Heist" },
  { map: "Pit Stop", mode: "Heist" },
  { map: "Ring of Fire", mode: "Hot Zone" },
  { map: "Dueling Beetles", mode: "Hot Zone" },
  { map: "Open Zone", mode: "Hot Zone" },
  { map: "Parallel Plays", mode: "Hot Zone" },
  { map: "Split", mode: "Hot Zone" },
  { map: "Rush", mode: "Hot Zone" },
];

function App() {
  const [firstPickTeam, setFirstPickTeam] = useState("red");
  const [slots, setSlots] = useState(Array(6).fill(""));
  const [savedComps, setSavedComps] = useState([]);
  const [activeSlot, setActiveSlot] = useState(null);
  const [selectedMapMode, setSelectedMapMode] = useState(MAP_MODE_OPTIONS[0]);

  const selectedHeroes = useMemo(() => new Set(slots.filter(Boolean)), [slots]);

  const orderSequence = useMemo(
    () => (firstPickTeam === "red" ? [0, 3, 4, 1, 2, 5] : [3, 0, 1, 4, 5, 2]),
    [firstPickTeam],
  );

  const nextPickIndex = useMemo(
    () => orderSequence.find((index) => !slots[index]),
    [orderSequence, slots],
  );

  const orderLabels = useMemo(() => {
    const labels = [
      "First Pick",
      "Pick 2",
      "Pick 3",
      "Pick 4",
      "Pick 5",
      "Last Pick",
    ];
    return orderSequence.reduce((map, slot, index) => {
      map[slot] = labels[index];
      return map;
    }, {});
  }, [orderSequence]);

  const handleSlotChange = (index, value) => {
    const next = [...slots];
    next[index] = value;
    setSlots(next);
    setActiveSlot(null);
  };

  const redTeam = slots.slice(0, 3);
  const blueTeam = slots.slice(3, 6);
  const canSave = slots.every(Boolean);

  const saveComposition = () => {
    if (!canSave) return;
    setSavedComps((prev) => [
      {
        id: Date.now(),
        firstPickTeam,
        mapMode: selectedMapMode,
        slots: slots.map((hero, index) => ({
          slot: slotLabels[index],
          hero,
          order: orderLabels[index],
        })),
      },
      ...prev,
    ]);
    setSlots(Array(6).fill(""));
  };

  const GROUPED_MAPS = MAP_MODE_OPTIONS.reduce((acc, option) => {
    if (!acc[option.mode]) {
      acc[option.mode] = [];
    }
    acc[option.mode].push(option);
    return acc;
  }, {});

  const mapFiles = import.meta.glob("./assets/maps/*", {
    eager: true,
    import: "default",
  });

  const MAP_ICONS = Object.fromEntries(
    Object.entries(mapFiles).map(([path, url]) => {
      const fileName = path
        .replace(/\\/g, "/")
        .split("/")
        .pop()
        .replace(/\.[^/.]+$/, ""); // Remove qualquer extensão (.webp, .png, etc)
      return [fileName, url];
    }),
  );

  const getModeIcon = (modeName) => MAP_ICONS[modeName.replace(/ /g, "_")];

  return (
    <main className="app-shell">
      <div className="fp-top">
        <div className="slider-control fp-alone">
          <div className="slider-label">FP</div>
          <button
            type="button"
            className={`toggle-switch ${firstPickTeam}`}
            onClick={() =>
              setFirstPickTeam(firstPickTeam === "red" ? "blue" : "red")
            }
            aria-label="Toggle first pick between red and blue"
          >
            <span className="switch-track" />
            <span className="switch-thumb" />
          </button>
          <div className="slider-status">
            {firstPickTeam === "red" ? "Red" : "Blue"}
          </div>
        </div>
      </div>

      <section className="map-mode-card">
        <div className="map-mode-header">
          <div>
            <span>MAP & MODE</span>
          </div>
          <div className="map-mode-selected">
            {selectedMapMode.map} · {selectedMapMode.mode}
          </div>
        </div>

        {/* NOVA RENDERIZAÇÃO AGRUPADA */}
        <div className="map-groups-container">
          {Object.entries(GROUPED_MAPS).map(([mode, maps]) => (
            <div key={mode} className="map-mode-group">
              <h3 className="map-mode-group-title">
                {getModeIcon(mode) && (
                  <img
                    src={getModeIcon(mode)}
                    alt={mode}
                    className="mode-icon"
                  />
                )}
                <span>{mode}</span>
              </h3>
              <div className="map-mode-grid">
                {maps.map((option) => (
                  <button
                    key={option.map}
                    type="button"
                    className={`map-mode-option ${
                      selectedMapMode.map === option.map ? "selected" : ""
                    }`}
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

      <section className="pick-grid">
        <div className="team-column blue-team">
          <div className="team-header">
            <span>BLUE TEAM</span>
            <small>{firstPickTeam === "blue" ? "First Pick" : "Pick 2"}</small>
          </div>
          <div className="slot-row">
            {blueTeam.map((hero, index) => {
              const globalIndex = index + 3;
              const isNext = globalIndex === nextPickIndex;
              return (
                <article
                  key={globalIndex}
                  className={`slot-card ${isNext ? "next-pick blue-glow" : ""}`}
                >
                  <div className="slot-label">{slotLabels[index + 3]}</div>
                  <div className="slot-top-row">
                    <div className="slot-info">
                      {hero && getBrawlerImage(hero) ? (
                        <img
                          src={getBrawlerImage(hero)}
                          alt={hero}
                          className="slot-avatar"
                        />
                      ) : (
                        <div className="slot-avatar empty">?</div>
                      )}
                      <div className="slot-order-block">
                        <div className="slot-order">
                          {orderLabels[index + 3]}
                        </div>
                        {hero && (
                          <div className="slot-brawler-name">{hero}</div>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="choose-button"
                      onClick={() =>
                        setActiveSlot(
                          activeSlot === globalIndex ? null : globalIndex,
                        )
                      }
                    >
                      {activeSlot === globalIndex ? "Close" : "Pick"}
                    </button>
                  </div>
                  {activeSlot === globalIndex && (
                    <div className="picker-grid">
                      {BRAWLERS.map((brawler) => {
                        const optionDisabled =
                          selectedHeroes.has(brawler) && brawler !== hero;
                        return (
                          <button
                            key={brawler}
                            type="button"
                            className={`brawler-option ${
                              hero === brawler ? "selected" : ""
                            }`}
                            onClick={() =>
                              handleSlotChange(globalIndex, brawler)
                            }
                            disabled={optionDisabled}
                          >
                            <img src={getBrawlerImage(brawler)} alt={brawler} />
                            <span>{brawler}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </div>

        <div className="team-column red-team">
          <div className="team-header">
            <span>RED TEAM</span>
            <small>{firstPickTeam === "red" ? "First Pick" : "Pick 2"}</small>
          </div>
          <div className="slot-row">
            {redTeam.map((hero, index) => {
              const globalIndex = index;
              const isNext = globalIndex === nextPickIndex;
              return (
                <article
                  key={globalIndex}
                  className={`slot-card ${isNext ? "next-pick red-glow" : ""}`}
                >
                  <div className="slot-label">{slotLabels[index]}</div>
                  <div className="slot-top-row">
                    <div className="slot-info">
                      {hero && getBrawlerImage(hero) ? (
                        <img
                          src={getBrawlerImage(hero)}
                          alt={hero}
                          className="slot-avatar"
                        />
                      ) : (
                        <div className="slot-avatar empty">?</div>
                      )}
                      <div className="slot-order-block">
                        <div className="slot-order">{orderLabels[index]}</div>
                        {hero && (
                          <div className="slot-brawler-name">{hero}</div>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="choose-button"
                      onClick={() =>
                        setActiveSlot(
                          activeSlot === globalIndex ? null : globalIndex,
                        )
                      }
                    >
                      {activeSlot === globalIndex ? "Close" : "Pick"}
                    </button>
                  </div>
                  {activeSlot === globalIndex && (
                    <div className="picker-grid">
                      {BRAWLERS.map((brawler) => {
                        const optionDisabled =
                          selectedHeroes.has(brawler) && brawler !== hero;
                        return (
                          <button
                            key={brawler}
                            type="button"
                            className={`brawler-option ${
                              hero === brawler ? "selected" : ""
                            }`}
                            onClick={() =>
                              handleSlotChange(globalIndex, brawler)
                            }
                            disabled={optionDisabled}
                          >
                            <img src={getBrawlerImage(brawler)} alt={brawler} />
                            <span>{brawler}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="actions-card">
        <button disabled={!canSave} onClick={saveComposition}>
          Save composition
        </button>
      </section>

      {savedComps.length > 0 && (
        <section className="history-card">
          <h2>Saved compositions</h2>
          <div className="saved-list">
            {savedComps.map((comp) => {
              const redSlots = comp.slots.slice(0, 3);
              const blueSlots = comp.slots.slice(3, 6);
              return (
                <article key={comp.id} className="saved-item">
                  <div
                    className="saved-map-info"
                    style={{
                      marginBottom: "1rem",
                      paddingBottom: "0.75rem",
                      borderBottom: "1px solid #cbd5e1",
                    }}
                  >
                    <span style={{ color: "#0f172a" }}>{comp.mapMode.map}</span>
                    <span
                      style={{
                        color: "#64748b",
                        marginLeft: "0.5rem",
                        fontSize: "0.9rem",
                      }}
                    >
                      · {comp.mapMode.mode}
                    </span>
                  </div>
                  <div className="saved-teams">
                    <div className="saved-team red-team">
                      <h3>
                        Red Team
                        {comp.firstPickTeam === "red" && (
                          <span className="saved-team-badge red">FP</span>
                        )}
                      </h3>
                      <ul>
                        {redSlots.map((item) => (
                          <li key={item.slot} className="saved-slot-row">
                            <img
                              src={getBrawlerImage(item.hero)}
                              alt={item.hero}
                              className="saved-slot-avatar"
                            />
                            <div>
                              <div className="saved-slot-order">
                                {item.order}
                              </div>
                              <div className="saved-slot-name">{item.hero}</div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="saved-team blue-team">
                      <h3>
                        Blue Team
                        {comp.firstPickTeam === "blue" && (
                          <span className="saved-team-badge blue">FP</span>
                        )}
                      </h3>
                      <ul>
                        {blueSlots.map((item) => (
                          <li key={item.slot} className="saved-slot-row">
                            <img
                              src={getBrawlerImage(item.hero)}
                              alt={item.hero}
                              className="saved-slot-avatar"
                            />
                            <div>
                              <div className="saved-slot-order">
                                {item.order}
                              </div>
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
      )}
    </main>
  );
}

export default App;
