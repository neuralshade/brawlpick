import React, { useRef, useMemo, useState } from "react";
import { MAP_MODE_OPTIONS, getBrawlerImage } from "../constants";

export default function Statistics({ savedComps, setSavedComps }) {
  const [error, setError] = useState("");
  const [showToast, setShowToast] = useState("");
  const fileInputRef = useRef(null);

  const [filterMap, setFilterMap] = useState("All");
  const [filterMode, setFilterMode] = useState("All");
  const [activeTab, setActiveTab] = useState("general"); // 'general', 'advanced', 'tierlist'

  const filteredComps = useMemo(() => {
    return savedComps.filter((match) => {
      const matchMap = filterMap === "All" || match.mapMode?.map === filterMap;
      const matchMode =
        filterMode === "All" || match.mapMode?.mode === filterMode;
      return matchMap && matchMode;
    });
  }, [savedComps, filterMap, filterMode]);

  // Funções de Arquivo (Upload / Export) omitidas para brevidade, mantenha as suas originais
  const handleFileUpload = (event) => {
    /* Seu código existente */
  };
  const exportDatabase = () => {
    /* Seu código existente */
  };

  // --- 1. ESTATÍSTICAS BÁSICAS ---
  const totalMatches = filteredComps.length;
  const finishedMatches = filteredComps.filter(
    (m) => m.result === "win" || m.result === "loss",
  );

  const fpAdvantage = useMemo(() => {
    let blueFpWins = 0,
      blueFpPlayed = 0;
    let redFpWins = 0,
      redFpPlayed = 0;

    finishedMatches.forEach((match) => {
      const blueWon = match.result === "win";
      if (match.firstPickTeam === "blue") {
        blueFpPlayed++;
        if (blueWon) blueFpWins++;
      } else {
        redFpPlayed++;
        if (blueWon) redFpWins++;
      }
    });

    return {
      blueFpWr:
        blueFpPlayed > 0 ? ((blueFpWins / blueFpPlayed) * 100).toFixed(1) : 0,
      redFpWr:
        redFpPlayed > 0 ? ((redFpWins / redFpPlayed) * 100).toFixed(1) : 0,
    };
  }, [finishedMatches]);

  const brawlerStats = useMemo(() => {
    const stats = {};

    filteredComps.forEach((match) => {
      const blueWon = match.result === "win";
      const isFinished = match.result === "win" || match.result === "loss";

      const blueHeroes = match.slots
        .slice(3, 6)
        .map((s) => s.hero)
        .filter(Boolean);
      const redHeroes = match.slots
        .slice(0, 3)
        .map((s) => s.hero)
        .filter(Boolean);
      const allBans = [
        ...(match.bans?.red || []),
        ...(match.bans?.blue || []),
      ].filter(Boolean);

      // Função auxiliar para inicializar status
      const initBrawler = (hero) => {
        if (!stats[hero])
          stats[hero] = { picks: 0, bans: 0, played: 0, wins: 0 };
      };

      // Contabiliza Picks e Win Rates (Azul vs Vermelho)
      blueHeroes.forEach((hero) => {
        initBrawler(hero);
        stats[hero].picks++;
        if (isFinished) {
          stats[hero].played++;
          if (blueWon) stats[hero].wins++;
        }
      });

      redHeroes.forEach((hero) => {
        initBrawler(hero);
        stats[hero].picks++;
        if (isFinished) {
          stats[hero].played++;
          if (!blueWon) stats[hero].wins++; // Se azul perdeu, vermelho ganhou
        }
      });

      // Contabiliza Bans
      allBans.forEach((hero) => {
        initBrawler(hero);
        stats[hero].bans++;
      });
    });

    return Object.entries(stats).map(([name, data]) => {
      const presence =
        totalMatches > 0
          ? (((data.picks + data.bans) / totalMatches) * 100).toFixed(1)
          : 0;
      const winRate =
        data.played > 0 ? ((data.wins / data.played) * 100).toFixed(1) : 0;
      return { name, ...data, presence, winRate };
    });
  }, [filteredComps, totalMatches]);

  // --- 2. ESTATÍSTICAS AVANÇADAS (Sinergia e Counters) ---
  const advancedStats = useMemo(() => {
    const synergies = {};
    const counters = {};

    finishedMatches.forEach((match) => {
      const blueWon = match.result === "win";
      const blueHeroes = match.slots
        .slice(3, 6)
        .map((s) => s.hero)
        .filter(Boolean)
        .sort();
      const redHeroes = match.slots
        .slice(0, 3)
        .map((s) => s.hero)
        .filter(Boolean);

      // Sinergias (Duplas no Time Azul)
      for (let i = 0; i < blueHeroes.length; i++) {
        for (let j = i + 1; j < blueHeroes.length; j++) {
          const pair = `${blueHeroes[i]} & ${blueHeroes[j]}`;
          if (!synergies[pair]) synergies[pair] = { played: 0, wins: 0 };
          synergies[pair].played++;
          if (blueWon) synergies[pair].wins++;
        }
      }

      // Counters (Azul vs Vermelho)
      blueHeroes.forEach((bh) => {
        redHeroes.forEach((rh) => {
          const matchup = `${bh} (You) vs ${rh} (Enm)`;
          if (!counters[matchup]) counters[matchup] = { played: 0, wins: 0 };
          counters[matchup].played++;
          if (blueWon) counters[matchup].wins++;
        });
      });
    });

    const formatStats = (obj) =>
      Object.entries(obj)
        .filter(([_, d]) => d.played >= 2) // Mínimo de 2 partidas para não poluir
        .map(([name, d]) => ({
          name,
          played: d.played,
          wr: ((d.wins / d.played) * 100).toFixed(1),
        }))
        .sort((a, b) => b.wr - a.wr || b.played - a.played);

    return {
      synergies: formatStats(synergies),
      counters: formatStats(counters),
    };
  }, [finishedMatches]);

  // --- 3. TIER LIST AUTOMÁTICA ---
  const tierList = useMemo(() => {
    const tiers = { S: [], A: [], B: [], C: [] };
    brawlerStats.forEach((b) => {
      if (b.played < 2) return; // Precisa de amostragem mínima
      const wr = parseFloat(b.winRate);
      const pr = parseFloat(b.presence);

      if (wr >= 60 && pr >= 20) tiers.S.push(b);
      else if (wr >= 50 && pr >= 10) tiers.A.push(b);
      else if (wr >= 45) tiers.B.push(b);
      else tiers.C.push(b);
    });
    return tiers;
  }, [brawlerStats]);

  const uniqueModes = ["All", ...new Set(MAP_MODE_OPTIONS.map((m) => m.mode))];
  const uniqueMaps = ["All", ...new Set(MAP_MODE_OPTIONS.map((m) => m.map))];

  return (
    <main className="app-shell stats-main">
      {/* Cabeçalho e Filtros Omitidos por brevidade - Mantenha o seu HTML de Filtros aqui */}
      <section
        className="map-mode-card filters-section"
        style={{ background: "rgba(0,0,0,0.4)", border: "2px solid #000" }}
      >
        <h3 className="map-mode-group-title" style={{ fontSize: "1.2rem" }}>
          Analysis Filters
        </h3>
        {/* Seus selects de mapa e modo */}
      </section>

      {/* Navegação de Abas */}
      <nav
        className="stats-tabs"
        style={{ display: "flex", gap: "10px", margin: "20px 0" }}
      >
        <button
          onClick={() => setActiveTab("general")}
          className={activeTab === "general" ? "active-tab" : ""}
        >
          General Stats
        </button>
        <button
          onClick={() => setActiveTab("advanced")}
          className={activeTab === "advanced" ? "active-tab" : ""}
        >
          Synergies & Counters
        </button>
        <button
          onClick={() => setActiveTab("tierlist")}
          className={activeTab === "tierlist" ? "active-tab" : ""}
        >
          Auto Tier List
        </button>
      </nav>

      {/* ABA 1: GERAL */}
      {activeTab === "general" && (
        <div className="stats-panels-grid">
          {/* Vantagem de First Pick */}
          <div
            className="map-mode-card"
            style={{ gridColumn: "1 / -1", borderColor: "#f59e0b" }}
          >
            <h3 className="map-mode-group-title" style={{ color: "#f59e0b" }}>
              Win Rate by First Pick
            </h3>
            <div
              style={{
                display: "flex",
                justifyContent: "space-around",
                color: "#fff",
              }}
            >
              <div>
                <strong>Blue FP Win Rate:</strong> {fpAdvantage.blueFpWr}%
              </div>
              <div>
                <strong>Red FP Win Rate:</strong> {fpAdvantage.redFpWr}%
              </div>
            </div>
          </div>

          <div
            className="map-mode-card panel-bans"
            style={{ borderColor: "#ef4444" }}
          >
            <h3 className="map-mode-group-title" style={{ color: "#ef4444" }}>
              Presence Rate (Pick+Ban)
            </h3>
            <ul className="stats-list">
              {[...brawlerStats]
                .sort((a, b) => b.presence - a.presence)
                .slice(0, 10)
                .map((b, i) => (
                  <li key={i} className="stats-list-item">
                    <span>{b.name}</span>
                    <strong>
                      {b.presence}%{" "}
                      <span className="stats-list-subvalue">
                        ({b.picks}P / {b.bans}B)
                      </span>
                    </strong>
                  </li>
                ))}
            </ul>
          </div>

          <div
            className="map-mode-card panel-winrate"
            style={{ borderColor: "#10b981" }}
          >
            <h3 className="map-mode-group-title" style={{ color: "#10b981" }}>
              True Win Rate
            </h3>
            <span className="panel-subtitle" style={{ color: "#fff" }}>
              (Corrected: Blue perspective)
            </span>
            <ul className="stats-list">
              {[...brawlerStats]
                .filter((b) => b.played > 0)
                .sort((a, b) => b.winRate - a.winRate)
                .slice(0, 15)
                .map((b, i) => (
                  <li key={i} className="stats-list-item">
                    <span>{b.name}</span>
                    <strong>
                      {b.winRate}%{" "}
                      <span className="stats-list-subvalue">
                        ({b.played} games)
                      </span>
                    </strong>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      )}

      {/* ABA 2: AVANÇADO */}
      {activeTab === "advanced" && (
        <div className="stats-panels-grid">
          <div className="map-mode-card" style={{ borderColor: "#8b5cf6" }}>
            <h3 className="map-mode-group-title" style={{ color: "#8b5cf6" }}>
              Best Synergies (Blue Team)
            </h3>
            <ul className="stats-list">
              {advancedStats.synergies.slice(0, 10).map((s, i) => (
                <li key={i} className="stats-list-item">
                  <span>{s.name}</span>
                  <strong>
                    {s.wr}%{" "}
                    <span className="stats-list-subvalue">
                      ({s.played} games)
                    </span>
                  </strong>
                </li>
              ))}
            </ul>
          </div>
          <div className="map-mode-card" style={{ borderColor: "#ec4899" }}>
            <h3 className="map-mode-group-title" style={{ color: "#ec4899" }}>
              Best Counters (You vs Enemy)
            </h3>
            <ul className="stats-list">
              {advancedStats.counters.slice(0, 10).map((c, i) => (
                <li key={i} className="stats-list-item">
                  <span>{c.name}</span>
                  <strong>
                    {c.wr}%{" "}
                    <span className="stats-list-subvalue">
                      ({c.played} games)
                    </span>
                  </strong>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* ABA 3: TIER LIST */}
      {activeTab === "tierlist" && (
        <div className="tierlist-container">
          {Object.entries(tierList).map(([tier, brawlers]) => (
            <div
              key={tier}
              className="tier-row"
              style={{
                display: "flex",
                marginBottom: "10px",
                background: "rgba(0,0,0,0.5)",
                borderRadius: "8px",
              }}
            >
              <div
                className={`tier-label tier-${tier}`}
                style={{
                  padding: "20px",
                  fontSize: "24px",
                  fontWeight: "bold",
                  width: "80px",
                  textAlign: "center",
                  borderRight: "2px solid #000",
                }}
              >
                {tier}
              </div>
              <div
                className="tier-brawlers"
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "8px",
                  padding: "10px",
                }}
              >
                {brawlers.map((b) => (
                  <div key={b.name} style={{ textAlign: "center" }}>
                    <img
                      src={getBrawlerImage(b.name)}
                      alt={b.name}
                      style={{
                        width: "40px",
                        borderRadius: "5px",
                        border: "1px solid #475569",
                      }}
                    />
                    <div style={{ fontSize: "10px", color: "#fff" }}>
                      {b.winRate}%
                    </div>
                  </div>
                ))}
                {brawlers.length === 0 && (
                  <span style={{ color: "#64748b", margin: "auto" }}>
                    No data
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
