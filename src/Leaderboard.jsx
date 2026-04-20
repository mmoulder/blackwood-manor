import { useState } from "react";
import { useAllTeams } from "./useGameSync";

const TEAM_COLORS = {
  "Team Raven": "#c084fc",
  "Team Falcon": "#60a5fa",
  "Team Serpent": "#34d399",
  "Team Wolf":   "#fb923c",
};

const TOTAL_CLUES = 10;

export default function Leaderboard() {
  const [teams, setTeams] = useState({});
  useAllTeams(setTeams);

  const sorted = Object.entries(teams).sort(
    ([, a], [, b]) => (b.solvedCount || 0) - (a.solvedCount || 0)
  );

  if (sorted.length === 0) return null;

  return (
    <div style={{
      position: "fixed", bottom: 20, right: 20,
      background: "#221e19", border: "1px solid #3d3528",
      padding: "16px 20px", minWidth: 220, zIndex: 50,
      fontFamily: "'JetBrains Mono', monospace",
    }}>
      <div style={{ fontSize: 9, letterSpacing: 3, color: "#6a5e4a", marginBottom: 12 }}>
        LIVE STANDINGS
      </div>
      {sorted.map(([name, data]) => {
        const pct = ((data.solvedCount || 0) / TOTAL_CLUES) * 100;
        const color = TEAM_COLORS[name] || "#c8913a";
        const won = data.accusation?.correct;
        return (
          <div key={name} style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
              <span style={{ fontSize: 12, color: won ? "#4aaa6a" : color }}>
                {won ? "✓ " : ""}{name}
              </span>
              <span style={{ fontSize: 11, color: "#8a7d68" }}>
                {data.solvedCount || 0}/{TOTAL_CLUES}
              </span>
            </div>
            <div style={{ height: 4, background: "#3d3528", borderRadius: 2 }}>
              <div style={{
                height: "100%", borderRadius: 2,
                width: `${pct}%`, background: won ? "#4aaa6a" : color,
                transition: "width 0.5s ease",
              }} />
            </div>
            {data.accusation && !won && (
              <div style={{ fontSize: 10, color: "#c04040", marginTop: 3 }}>
                ✗ Wrong accusation
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
