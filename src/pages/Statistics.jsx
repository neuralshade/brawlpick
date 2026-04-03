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
`;

const TabButton = styled.button`
  padding: 10px 16px;
  border-radius: 8px;
  border: none;
  background: ${(props) => (props.$active ? "#3b82f6" : "#222")};
  color: #fff;
  cursor: pointer;
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

  const fpAdvantage = useMemo(() => {
    let blueFpWins = 0,
      blueFpPlayed = 0,
      redFpWins = 0,
      redFpPlayed = 0;
    finishedMatches.forEach((match) => {
      const blueWon = match.result === "win";
      if (match.firstPickTeam === "blue") {
        blueFpPlayed++;
        if (blueWon) blueFpWins++;
      } else {
        redFpPlayed++;
        if (!blueWon) redFpWins++;
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
    const initBrawler = (hero) => {
      if (!stats[hero]) stats[hero] = { picks: 0, bans: 0, played: 0, wins: 0 };
    };

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
          if (!blueWon) stats[hero].wins++;
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
    }));
  }, [filteredComps, totalMatches]);

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

    return {
      synergies: formatStats(synergies),
      counters: formatStats(counters),
    };
  }, [finishedMatches]);

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

  return (
    <AppShell style={{ paddingBottom: "50px" }}>
      <FilterSection>
        <GroupTitle $size="1.2rem">Analysis Filters</GroupTitle>
        {/* Adicione os <select> reais aqui se precisar no futuro */}
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
          $active={activeTab === "tierlist"}
          onClick={() => setActiveTab("tierlist")}
        >
          Auto Tier List
        </TabButton>
      </TabsNav>

      {activeTab === "general" && (
        <PanelsGrid>
          <Panel style={{ gridColumn: "1 / -1" }} $color="#f59e0b">
            <GroupTitle $color="#f59e0b">Win Rate by First Pick</GroupTitle>
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
          </Panel>

          <Panel $color="#ef4444" $bg="#2d0a0a">
            <GroupTitle $color="#ef4444">Presence Rate (Pick+Ban)</GroupTitle>
            <StatsList>
              {[...brawlerStats]
                .sort((a, b) => b.presence - a.presence)
                .slice(0, 10)
                .map((b, i) => (
                  <StatsItem key={i}>
                    <span>{b.name}</span>
                    <strong>
                      {b.presence}%{" "}
                      <span className="subvalue">
                        ({b.picks}P / {b.bans}B)
                      </span>
                    </strong>
                  </StatsItem>
                ))}
            </StatsList>
          </Panel>

          <Panel $color="#10b981" $bg="#0a2d1a">
            <GroupTitle $color="#10b981">True Win Rate</GroupTitle>
            <span
              style={{
                fontSize: "0.8rem",
                color: "#aaa",
                display: "block",
                marginBottom: "10px",
                marginTop: "-10px",
              }}
            >
              (Corrected: Blue perspective)
            </span>
            <StatsList>
              {[...brawlerStats]
                .filter((b) => b.played > 0)
                .sort((a, b) => b.winRate - a.winRate)
                .slice(0, 15)
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
              {advancedStats.synergies.slice(0, 10).map((s, i) => (
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
              {advancedStats.counters.slice(0, 10).map((c, i) => (
                <StatsItem key={i}>
                  <span>{c.name}</span>
                  <strong>
                    {c.wr}% <span className="subvalue">({c.played} games)</span>
                  </strong>
                </StatsItem>
              ))}
            </StatsList>
          </Panel>
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
