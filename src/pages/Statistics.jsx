import React, { useRef, useMemo, useState } from "react";
import styled from "styled-components";
import { MAP_MODE_OPTIONS, getBrawlerImage } from "../constants";
import { AppShell, BaseCard, GroupTitle } from "../styles/Shared";

const FilterSection = styled(BaseCard)`
  background: rgba(0, 0, 0, 0.4);
  border: 2px solid #000;
`;

const TabsNav = styled.nav`
  display: flex;
  gap: 10px;
  margin: 20px 0;
  flex-wrap: wrap;
`;

const TabButton = styled.button`
  padding: 10px 16px;
  border-radius: 8px;
  border: none;
  background: ${(props) => (props.$active ? "#3b82f6" : "#222")};
  color: #fff;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: ${(props) => (props.$active ? "#3b82f6" : "#333")};
  }
`;

const PanelsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
`;

const Panel = styled(BaseCard)`
  border-color: ${(props) => props.$color || "#000"};
  background: ${(props) => props.$bg || "rgba(0,0,0,0.25)"};
`;

const StatsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  color: #fff;
`;

const StatsItem = styled.li`
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #444;

  .subvalue {
    font-size: 0.8rem;
    color: #aaa;
  }
`;

const TierRow = styled.div`
  display: flex;
  margin-bottom: 10px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 8px;
`;

const TierLabel = styled.div`
  padding: 20px;
  font-size: 24px;
  font-weight: bold;
  width: 80px;
  text-align: center;
  border-right: 2px solid #000;
  color: #fff;
`;

const TierBrawlers = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 10px;

  .empty {
    color: #64748b;
    margin: auto;
  }
`;

const BrawlerIconWrapper = styled.div`
  text-align: center;
  img {
    width: 40px;
    border-radius: 5px;
    border: 1px solid #475569;
  }
  div {
    font-size: 10px;
    color: #fff;
  }
`;

export default function Statistics({ savedComps, setSavedComps }) {
  const [filterMap, setFilterMap] = useState("All");
  const [filterMode, setFilterMode] = useState("All");
  const [activeTab, setActiveTab] = useState("general");

  const filteredComps = useMemo(() => {
    return savedComps.filter((match) => {
      const matchMap = filterMap === "All" || match.mapMode?.map === filterMap;
      const matchMode =
        filterMode === "All" || match.mapMode?.mode === filterMode;
      return matchMap && matchMode;
    });
  }, [savedComps, filterMap, filterMode]);

  const totalMatches = filteredComps.length;
  const finishedMatches = filteredComps.filter(
    (m) => m.result === "win" || m.result === "loss",
  );

  // Vantagem de Lado e Vantagem de First Pick
  const matchAdvantages = useMemo(() => {
    let blueFpWins = 0,
      blueFpPlayed = 0;
    let redFpWins = 0,
      redFpPlayed = 0;
    let blueSideWins = 0,
      redSideWins = 0;
    const totalFinished = finishedMatches.length;

    finishedMatches.forEach((match) => {
      const blueWon = match.result === "win";

      // Estatísticas de Lado (Assumindo que a perspetiva da app é sempre a Equipa Azul)
      if (blueWon) blueSideWins++;
      else redSideWins++;

      // Estatísticas de First Pick
      if (match.firstPickTeam === "blue") {
        blueFpPlayed++;
        if (blueWon) blueFpWins++;
      } else {
        redFpPlayed++;
        if (!blueWon) redFpWins++; // Correção implementada: se azul perdeu, redFp ganhou
      }
    });

    return {
      blueFpWr:
        blueFpPlayed > 0 ? ((blueFpWins / blueFpPlayed) * 100).toFixed(1) : 0,
      redFpWr:
        redFpPlayed > 0 ? ((redFpWins / redFpPlayed) * 100).toFixed(1) : 0,
      blueSideWr:
        totalFinished > 0
          ? ((blueSideWins / totalFinished) * 100).toFixed(1)
          : 0,
      redSideWr:
        totalFinished > 0
          ? ((redSideWins / totalFinished) * 100).toFixed(1)
          : 0,
    };
  }, [finishedMatches]);

  // Estatísticas Gerais dos Brawlers (Inclui Ban Rate, Pick Rate e Mods)
  const brawlerStats = useMemo(() => {
    const stats = {};
    const initBrawler = (hero) => {
      if (!stats[hero])
        stats[hero] = { picks: 0, bans: 0, played: 0, wins: 0, modeStats: {} };
    };

    filteredComps.forEach((match) => {
      const blueWon = match.result === "win";
      const isFinished = match.result === "win" || match.result === "loss";
      const mode = match.mapMode?.mode || "Unknown";

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

      const updateHeroMode = (hero, isWin) => {
        if (!stats[hero].modeStats[mode]) {
          stats[hero].modeStats[mode] = { played: 0, wins: 0 };
        }
        stats[hero].modeStats[mode].played++;
        if (isWin) stats[hero].modeStats[mode].wins++;
      };

      blueHeroes.forEach((hero) => {
        initBrawler(hero);
        stats[hero].picks++;
        if (isFinished) {
          stats[hero].played++;
          if (blueWon) stats[hero].wins++;
          updateHeroMode(hero, blueWon);
        }
      });

      redHeroes.forEach((hero) => {
        initBrawler(hero);
        stats[hero].picks++;
        if (isFinished) {
          stats[hero].played++;
          if (!blueWon) stats[hero].wins++;
          updateHeroMode(hero, !blueWon);
        }
      });

      allBans.forEach((hero) => {
        initBrawler(hero);
        stats[hero].bans++;
      });
    });

    return Object.entries(stats).map(([name, data]) => ({
      name,
      ...data,
      presence:
        totalMatches > 0
          ? (((data.picks + data.bans) / totalMatches) * 100).toFixed(1)
          : 0,
      winRate:
        data.played > 0 ? ((data.wins / data.played) * 100).toFixed(1) : 0,
      banRate:
        totalMatches > 0 ? ((data.bans / totalMatches) * 100).toFixed(1) : 0,
      pickRate:
        totalMatches > 0 ? ((data.picks / totalMatches) * 100).toFixed(1) : 0,
    }));
  }, [filteredComps, totalMatches]);

  // Estatísticas Avançadas (Melhores e Piores)
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

      for (let i = 0; i < blueHeroes.length; i++) {
        for (let j = i + 1; j < blueHeroes.length; j++) {
          const pair = `${blueHeroes[i]} & ${blueHeroes[j]}`;
          if (!synergies[pair]) synergies[pair] = { played: 0, wins: 0 };
          synergies[pair].played++;
          if (blueWon) synergies[pair].wins++;
        }
      }
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
        .filter(([_, d]) => d.played >= 2)
        .map(([name, d]) => ({
          name,
          played: d.played,
          wr: ((d.wins / d.played) * 100).toFixed(1),
        }))
        .sort((a, b) => b.wr - a.wr || b.played - a.played);

    const formattedSynergies = formatStats(synergies);
    const formattedCounters = formatStats(counters);

    return {
      bestSynergies: formattedSynergies,
      worstSynergies: [...formattedSynergies].reverse(),
      bestCounters: formattedCounters,
      worstCounters: [...formattedCounters].reverse(),
    };
  }, [finishedMatches]);

  // Tier List Automática
  const tierList = useMemo(() => {
    const tiers = { S: [], A: [], B: [], C: [] };
    brawlerStats.forEach((b) => {
      if (b.played < 2) return;
      const wr = parseFloat(b.winRate);
      const pr = parseFloat(b.presence);
      if (wr >= 60 && pr >= 20) tiers.S.push(b);
      else if (wr >= 50 && pr >= 10) tiers.A.push(b);
      else if (wr >= 45) tiers.B.push(b);
      else tiers.C.push(b);
    });
    return tiers;
  }, [brawlerStats]);

  // Agrupamento dos melhores Brawlers por Modo de Jogo
  const topByMode = useMemo(() => {
    const modes = {};
    brawlerStats.forEach((b) => {
      Object.entries(b.modeStats).forEach(([mode, stats]) => {
        if (stats.played >= 2) {
          // Mínimo de 2 jogos para evitar dados enviesados
          if (!modes[mode]) modes[mode] = [];
          modes[mode].push({
            name: b.name,
            wr: ((stats.wins / stats.played) * 100).toFixed(1),
            played: stats.played,
          });
        }
      });
    });

    // Ordenar do melhor Win Rate para o pior
    Object.keys(modes).forEach((m) => {
      modes[m].sort((a, b) => b.wr - a.wr || b.played - a.played);
    });

    return modes;
  }, [brawlerStats]);

  return (
    <AppShell style={{ paddingBottom: "50px" }}>
      <FilterSection>
        <GroupTitle $size="1.2rem">Analysis Filters</GroupTitle>
        <div style={{ color: "#aaa", fontSize: "0.9rem" }}>
          Total Matches Recorded: {totalMatches} | Finished Matches:{" "}
          {finishedMatches.length}
        </div>
      </FilterSection>

      <TabsNav>
        <TabButton
          $active={activeTab === "general"}
          onClick={() => setActiveTab("general")}
        >
          General Stats
        </TabButton>
        <TabButton
          $active={activeTab === "advanced"}
          onClick={() => setActiveTab("advanced")}
        >
          Synergies & Counters
        </TabButton>
        <TabButton
          $active={activeTab === "modes"}
          onClick={() => setActiveTab("modes")}
        >
          Best by Mode
        </TabButton>
        <TabButton
          $active={activeTab === "tierlist"}
          onClick={() => setActiveTab("tierlist")}
        >
          Auto Tier List
        </TabButton>
      </TabsNav>

      {activeTab === "general" && (
        <PanelsGrid>
          <Panel style={{ gridColumn: "1 / -1" }} $color="#f59e0b">
            <GroupTitle $color="#f59e0b">Advantage Analysis</GroupTitle>
            <div
              style={{
                display: "flex",
                justifyContent: "space-around",
                flexWrap: "wrap",
                color: "#fff",
                gap: "20px",
              }}
            >
              <div
                style={{
                  background: "rgba(0,0,0,0.3)",
                  padding: "15px",
                  borderRadius: "8px",
                  flex: 1,
                  minWidth: "200px",
                }}
              >
                <h4
                  style={{
                    margin: "0 0 10px 0",
                    borderBottom: "1px solid #444",
                    paddingBottom: "5px",
                  }}
                >
                  By First Pick
                </h4>
                <div>
                  <strong>Blue FP Win Rate:</strong> {matchAdvantages.blueFpWr}%
                </div>
                <div>
                  <strong>Red FP Win Rate:</strong> {matchAdvantages.redFpWr}%
                </div>
              </div>
              <div
                style={{
                  background: "rgba(0,0,0,0.3)",
                  padding: "15px",
                  borderRadius: "8px",
                  flex: 1,
                  minWidth: "200px",
                }}
              >
                <h4
                  style={{
                    margin: "0 0 10px 0",
                    borderBottom: "1px solid #444",
                    paddingBottom: "5px",
                  }}
                >
                  By Map Side
                </h4>
                <div>
                  <strong>Blue Side (Left) WR:</strong>{" "}
                  {matchAdvantages.blueSideWr}%
                </div>
                <div>
                  <strong>Red Side (Right) WR:</strong>{" "}
                  {matchAdvantages.redSideWr}%
                </div>
              </div>
            </div>
          </Panel>

          <Panel $color="#ef4444" $bg="#2d0a0a">
            <GroupTitle $color="#ef4444">Top Bans (Ban Rate)</GroupTitle>
            <StatsList>
              {[...brawlerStats]
                .sort((a, b) => b.banRate - a.banRate)
                .slice(0, 10)
                .map((b, i) => (
                  <StatsItem key={i}>
                    <span>{b.name}</span>
                    <strong>
                      {b.banRate}% <span className="subvalue">({b.bans}B)</span>
                    </strong>
                  </StatsItem>
                ))}
            </StatsList>
          </Panel>

          <Panel $color="#3b82f6" $bg="#0a192d">
            <GroupTitle $color="#3b82f6">Top Picks (Pick Rate)</GroupTitle>
            <StatsList>
              {[...brawlerStats]
                .sort((a, b) => b.pickRate - a.pickRate)
                .slice(0, 10)
                .map((b, i) => (
                  <StatsItem key={i}>
                    <span>{b.name}</span>
                    <strong>
                      {b.pickRate}%{" "}
                      <span className="subvalue">({b.picks}P)</span>
                    </strong>
                  </StatsItem>
                ))}
            </StatsList>
          </Panel>

          <Panel
            style={{ gridColumn: "1 / -1" }}
            $color="#10b981"
            $bg="#0a2d1a"
          >
            <GroupTitle $color="#10b981">True Win Rate (Overall)</GroupTitle>
            <StatsList
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "0 20px",
              }}
            >
              {[...brawlerStats]
                .filter((b) => b.played > 0)
                .sort((a, b) => b.winRate - a.winRate)
                .slice(0, 20)
                .map((b, i) => (
                  <StatsItem key={i}>
                    <span>{b.name}</span>
                    <strong>
                      {b.winRate}%{" "}
                      <span className="subvalue">({b.played} games)</span>
                    </strong>
                  </StatsItem>
                ))}
            </StatsList>
          </Panel>
        </PanelsGrid>
      )}

      {activeTab === "advanced" && (
        <PanelsGrid>
          <Panel $color="#8b5cf6">
            <GroupTitle $color="#8b5cf6">Best Synergies (Blue Team)</GroupTitle>
            <StatsList>
              {advancedStats.bestSynergies.slice(0, 10).map((s, i) => (
                <StatsItem key={i}>
                  <span>{s.name}</span>
                  <strong>
                    {s.wr}% <span className="subvalue">({s.played} games)</span>
                  </strong>
                </StatsItem>
              ))}
            </StatsList>
          </Panel>

          <Panel $color="#ec4899">
            <GroupTitle $color="#ec4899">
              Best Counters (You vs Enemy)
            </GroupTitle>
            <StatsList>
              {advancedStats.bestCounters.slice(0, 10).map((c, i) => (
                <StatsItem key={i}>
                  <span>{c.name}</span>
                  <strong>
                    {c.wr}% <span className="subvalue">({c.played} games)</span>
                  </strong>
                </StatsItem>
              ))}
            </StatsList>
          </Panel>

          <Panel $color="#6b7280" $bg="#1f2937">
            <GroupTitle $color="#9ca3af">Worst Synergies (Avoid)</GroupTitle>
            <StatsList>
              {advancedStats.worstSynergies.slice(0, 10).map((s, i) => (
                <StatsItem key={i}>
                  <span>{s.name}</span>
                  <strong style={{ color: "#f87171" }}>
                    {s.wr}% <span className="subvalue">({s.played} games)</span>
                  </strong>
                </StatsItem>
              ))}
            </StatsList>
          </Panel>

          <Panel $color="#6b7280" $bg="#1f2937">
            <GroupTitle $color="#9ca3af">
              Worst Matchups (Enemy Counters You)
            </GroupTitle>
            <StatsList>
              {advancedStats.worstCounters.slice(0, 10).map((c, i) => (
                <StatsItem key={i}>
                  <span>{c.name}</span>
                  <strong style={{ color: "#f87171" }}>
                    {c.wr}% <span className="subvalue">({c.played} games)</span>
                  </strong>
                </StatsItem>
              ))}
            </StatsList>
          </Panel>
        </PanelsGrid>
      )}

      {activeTab === "modes" && (
        <PanelsGrid>
          {Object.entries(topByMode).length > 0 ? (
            Object.entries(topByMode).map(([mode, brawlers]) => (
              <Panel key={mode} $color="#14b8a6">
                <GroupTitle $color="#14b8a6">{mode}</GroupTitle>
                <StatsList>
                  {brawlers.slice(0, 5).map((b, i) => (
                    <StatsItem key={i}>
                      <span>{b.name}</span>
                      <strong>
                        {b.wr}%{" "}
                        <span className="subvalue">({b.played} games)</span>
                      </strong>
                    </StatsItem>
                  ))}
                  {brawlers.length === 0 && (
                    <span style={{ color: "#aaa" }}>Not enough data</span>
                  )}
                </StatsList>
              </Panel>
            ))
          ) : (
            <div style={{ color: "#aaa", padding: "20px" }}>
              No mode specific data available yet (requires min. 2 games per
              brawler in a mode).
            </div>
          )}
        </PanelsGrid>
      )}

      {activeTab === "tierlist" && (
        <div>
          {Object.entries(tierList).map(([tier, brawlers]) => (
            <TierRow key={tier}>
              <TierLabel className={`tier-${tier}`}>{tier}</TierLabel>
              <TierBrawlers>
                {brawlers.map((b) => (
                  <BrawlerIconWrapper key={b.name}>
                    <img src={getBrawlerImage(b.name)} alt={b.name} />
                    <div>{b.winRate}%</div>
                  </BrawlerIconWrapper>
                ))}
                {brawlers.length === 0 && (
                  <span className="empty">No data</span>
                )}
              </TierBrawlers>
            </TierRow>
          ))}
        </div>
      )}
    </AppShell>
  );
}
