import React from "react";
import styled from "styled-components";
import { TEAM_RED, TEAM_BLUE, getBrawlerImage } from "../constants";
import { AppShell, GroupTitle, BaseCard, PickGrid } from "../styles/Shared";

const Subtitle = styled.p`
  color: #fff;
  text-shadow: 1px 1px 2px #000;
  margin-bottom: 2rem;
`;

const NotesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const MatchHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const MatchInfo = styled.div`
  p {
    margin: 0.5rem 0;
  }
  .notes {
    color: #cbd5e1;
    font-style: italic;
  }
  .meta {
    color: #94a3b8;
    font-size: 0.9rem;
    margin: 0;
  }
`;

const Actions = styled.div`
  display: flex;
  gap: 10px;
`;

const ActionBtn = styled.button`
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  background: ${(props) => (props.$type === "win" ? "#10b981" : "#ef4444")};
  opacity: ${(props) => (props.$dimmed ? 0.5 : 1)};
`;

const TeamCol = styled.div`
  width: 100%;
  background: rgba(0, 0, 0, 0.25);
  border: 2px solid #000;
  padding: 1.25rem;
  box-shadow: 0 24px 40px rgba(15, 23, 42, 0.06);
`;

const ColHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  margin-bottom: 1rem;
  color: #fff;
  text-shadow:
    0 0 2px #000,
    0 0 4px #000,
    1px 1px 0 #000,
    -1px -1px 0 #000,
    2px 2px 4px rgba(0, 0, 0, 0.7);
`;

const BansRow = styled.div`
  display: flex;
  gap: 8px;
  padding: 8px;
  background: rgba(0, 0, 0, 0.2);
  margin-bottom: 12px;
  align-items: center;

  span {
    font-size: 1rem;
    color: #94a3b8;
    font-weight: bold;
  }
`;

const BanImg = styled.img`
  width: 38px;
  height: 38px;
  border: 2px solid #000000;
  object-fit: cover;
  background-color: #ffffff;
`;

const SlotRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
`;

const SlotCard = styled.article`
  width: 100%;
  padding: 1.25rem;
  background: #fff;
  border: 2px solid #000;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
`;

const SlotInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.9rem;
`;

const SlotAvatar = styled.img`
  width: 52px;
  height: 52px;
  background: #ffffff;
  border: 2px solid #000000;
  object-fit: cover;
`;

const OrderBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.85rem;
  color: #3c455c;

  strong {
    font-size: 0.95rem;
    color: #0f172a;
  }
`;

const EmptyText = styled.p`
  color: #aaa;
`;

export default function Matches({ savedComps, setSavedComps }) {
  const registerResult = (id, result) => {
    const newComps = savedComps.map((comp) =>
      comp.id === id ? { ...comp, result } : comp,
    );
    setSavedComps(newComps);
  };

  return (
    <AppShell>
      <GroupTitle $size="1.5rem" style={{ marginBottom: "1rem" }}>
        Match History
      </GroupTitle>
      <Subtitle>
        View details and set match results to generate statistics.
      </Subtitle>

      <NotesList>
        {savedComps.map((match) => {
          const dateStr = new Date(match.date || match.id).toLocaleDateString();
          const redSlots = match.slots.slice(0, 3);
          const blueSlots = match.slots.slice(3, 6);
          const redBans = match.bans?.red || [];
          const blueBans = match.bans?.blue || [];

          return (
            <BaseCard key={match.id}>
              <MatchHeader>
                <MatchInfo>
                  <GroupTitle
                    $size="1.2rem"
                    $color="#f59e0b"
                    style={{ margin: 0 }}
                  >
                    {match.mapMode.map} - {match.mapMode.mode}
                  </GroupTitle>
                  <p className="notes">
                    <strong>Notes: </strong>{" "}
                    {match.notes ? match.notes : "No notes."}
                  </p>
                  <p className="meta">
                    <strong>Date:</strong> {dateStr} | <strong>Status:</strong>{" "}
                    {match.result === "win"
                      ? "🟢 Win"
                      : match.result === "loss"
                        ? "🔴 Loss"
                        : "⚪ Pending"}
                  </p>
                </MatchInfo>
                <Actions>
                  <ActionBtn
                    $type="win"
                    $dimmed={match.result === "loss"}
                    onClick={() => registerResult(match.id, "win")}
                  >
                    {match.result === "win" ? "Win Saved" : "Mark Win"}
                  </ActionBtn>
                  <ActionBtn
                    $type="loss"
                    $dimmed={match.result === "win"}
                    onClick={() => registerResult(match.id, "loss")}
                  >
                    {match.result === "loss" ? "Loss Saved" : "Mark Loss"}
                  </ActionBtn>
                </Actions>
              </MatchHeader>

              <PickGrid>
                {/* BLUE TEAM */}
                <TeamCol>
                  <ColHeader>
                    <span>
                      BLUE TEAM {match.firstPickTeam === TEAM_BLUE && "(FP)"}
                    </span>
                  </ColHeader>
                  {blueBans.length > 0 && (
                    <BansRow>
                      <span>BANS:</span>
                      {blueBans.map((ban, idx) =>
                        ban ? (
                          <BanImg
                            key={idx}
                            src={getBrawlerImage(ban)}
                            title={ban}
                          />
                        ) : null,
                      )}
                    </BansRow>
                  )}
                  <SlotRow>
                    {blueSlots.map((item) => (
                      <SlotCard key={item.slot}>
                        <SlotInfo>
                          <SlotAvatar
                            src={getBrawlerImage(item.hero)}
                            alt={item.hero}
                          />
                          <OrderBlock>
                            <span>{item.order}</span>
                            <strong>{item.hero}</strong>
                          </OrderBlock>
                        </SlotInfo>
                      </SlotCard>
                    ))}
                  </SlotRow>
                </TeamCol>

                {/* RED TEAM */}
                <TeamCol>
                  <ColHeader>
                    <span>
                      RED TEAM {match.firstPickTeam === TEAM_RED && "(FP)"}
                    </span>
                  </ColHeader>
                  {redBans.length > 0 && (
                    <BansRow>
                      <span>BANS:</span>
                      {redBans.map((ban, idx) =>
                        ban ? (
                          <BanImg
                            key={idx}
                            src={getBrawlerImage(ban)}
                            title={ban}
                          />
                        ) : null,
                      )}
                    </BansRow>
                  )}
                  <SlotRow>
                    {redSlots.map((item) => (
                      <SlotCard key={item.slot}>
                        <SlotInfo>
                          <SlotAvatar
                            src={getBrawlerImage(item.hero)}
                            alt={item.hero}
                          />
                          <OrderBlock>
                            <span>{item.order}</span>
                            <strong>{item.hero}</strong>
                          </OrderBlock>
                        </SlotInfo>
                      </SlotCard>
                    ))}
                  </SlotRow>
                </TeamCol>
              </PickGrid>
            </BaseCard>
          );
        })}
        {savedComps.length === 0 && (
          <EmptyText>No matches registered yet.</EmptyText>
        )}
      </NotesList>
    </AppShell>
  );
}
