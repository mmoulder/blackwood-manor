import { useState } from "react";
import { resetGame, useAllTeams } from "./useGameSync";

export default function Admin() {
  const [teams, setTeams] = useState({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [message, setMessage] = useState("");

  useAllTeams(setTeams);

  const handleReset = async () => {
    setResetting(true);
    setMessage("");
    try {
      await resetGame();
      setMessage("✓ Game reset successfully!");
      setShowConfirm(false);
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage(`✗ Error: ${error.message}`);
    } finally {
      setResetting(false);
    }
  };

  const teamCount = Object.keys(teams).length;
  const totalProgress = Object.values(teams).reduce((sum, team) => sum + (team.solvedCount || 0), 0);

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #1a1612 0%, #2d2419 100%)",
      padding: "40px 20px",
      fontFamily: "'JetBrains Mono', monospace",
    }}>
      <div style={{
        maxWidth: 600,
        margin: "0 auto",
        background: "#221e19",
        border: "1px solid #3d3528",
        borderRadius: 8,
        padding: 32,
      }}>
        <h1 style={{
          fontSize: 24,
          color: "#c8913a",
          marginBottom: 8,
          letterSpacing: 2,
        }}>
          GAME ADMIN
        </h1>
        <div style={{
          fontSize: 11,
          color: "#6a5e4a",
          marginBottom: 32,
          letterSpacing: 1,
        }}>
          Blackwood Manor Control Panel
        </div>

        <div style={{
          background: "#1a1612",
          border: "1px solid #3d3528",
          borderRadius: 6,
          padding: 20,
          marginBottom: 24,
        }}>
          <div style={{ fontSize: 10, color: "#6a5e4a", marginBottom: 12, letterSpacing: 2 }}>
            CURRENT STATUS
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <div style={{ fontSize: 11, color: "#8a7d68", marginBottom: 4 }}>Active Teams</div>
              <div style={{ fontSize: 20, color: "#c8913a", fontWeight: "bold" }}>{teamCount}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: "#8a7d68", marginBottom: 4 }}>Total Clues Solved</div>
              <div style={{ fontSize: 20, color: "#c8913a", fontWeight: "bold" }}>{totalProgress}</div>
            </div>
          </div>

          {teamCount > 0 && (
            <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid #3d3528" }}>
              <div style={{ fontSize: 10, color: "#6a5e4a", marginBottom: 12, letterSpacing: 2 }}>
                TEAM DETAILS
              </div>
              {Object.entries(teams).map(([name, data]) => (
                <div key={name} style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "8px 0",
                  borderBottom: "1px solid #2d2419",
                }}>
                  <span style={{ fontSize: 12, color: "#c8913a" }}>{name}</span>
                  <div style={{ fontSize: 11, color: "#8a7d68" }}>
                    {data.solvedCount || 0} clues
                    {data.accusation && (
                      <span style={{ marginLeft: 8, color: data.accusation.correct ? "#4aaa6a" : "#c04040" }}>
                        {data.accusation.correct ? "✓ Won" : "✗ Wrong"}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{
          background: "#1a1612",
          border: "1px solid #3d3528",
          borderRadius: 6,
          padding: 20,
        }}>
          <div style={{ fontSize: 10, color: "#6a5e4a", marginBottom: 12, letterSpacing: 2 }}>
            DANGER ZONE
          </div>
          <div style={{ fontSize: 12, color: "#8a7d68", marginBottom: 16, lineHeight: 1.6 }}>
            This will permanently delete all team progress, solved clues, and accusations.
            This action cannot be undone.
          </div>

          {!showConfirm ? (
            <button
              onClick={() => setShowConfirm(true)}
              style={{
                background: "#3d3528",
                color: "#c8913a",
                border: "1px solid #6a5e4a",
                padding: "12px 24px",
                borderRadius: 4,
                fontSize: 12,
                letterSpacing: 1,
                cursor: "pointer",
                fontFamily: "'JetBrains Mono', monospace",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "#4d4538";
                e.target.style.borderColor = "#c8913a";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "#3d3528";
                e.target.style.borderColor = "#6a5e4a";
              }}
            >
              RESET GAME
            </button>
          ) : (
            <div>
              <div style={{ fontSize: 13, color: "#c04040", marginBottom: 12, fontWeight: "bold" }}>
                ⚠ Are you absolutely sure?
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <button
                  onClick={handleReset}
                  disabled={resetting}
                  style={{
                    background: "#c04040",
                    color: "#fff",
                    border: "1px solid #c04040",
                    padding: "12px 24px",
                    borderRadius: 4,
                    fontSize: 12,
                    letterSpacing: 1,
                    cursor: resetting ? "not-allowed" : "pointer",
                    fontFamily: "'JetBrains Mono', monospace",
                    opacity: resetting ? 0.6 : 1,
                  }}
                >
                  {resetting ? "RESETTING..." : "YES, RESET"}
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  disabled={resetting}
                  style={{
                    background: "#3d3528",
                    color: "#8a7d68",
                    border: "1px solid #6a5e4a",
                    padding: "12px 24px",
                    borderRadius: 4,
                    fontSize: 12,
                    letterSpacing: 1,
                    cursor: resetting ? "not-allowed" : "pointer",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  CANCEL
                </button>
              </div>
            </div>
          )}

          {message && (
            <div style={{
              marginTop: 16,
              padding: 12,
              background: message.startsWith("✓") ? "#1a3a2a" : "#3a1a1a",
              border: `1px solid ${message.startsWith("✓") ? "#4aaa6a" : "#c04040"}`,
              borderRadius: 4,
              fontSize: 12,
              color: message.startsWith("✓") ? "#4aaa6a" : "#c04040",
            }}>
              {message}
            </div>
          )}
        </div>

        <div style={{ marginTop: 32, textAlign: "center" }}>
          <a
            href="/"
            style={{
              color: "#8a7d68",
              fontSize: 12,
              textDecoration: "none",
              letterSpacing: 1,
            }}
            onMouseEnter={(e) => e.target.style.color = "#c8913a"}
            onMouseLeave={(e) => e.target.style.color = "#8a7d68"}
          >
            ← BACK TO GAME
          </a>
        </div>
      </div>
    </div>
  );
}
