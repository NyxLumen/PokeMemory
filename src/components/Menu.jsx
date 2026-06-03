import { useState } from "react";
import { audioHelper } from "../utils/audio";
import { Play, Volume2, VolumeX, Moon, Sun, Award } from "lucide-react";

export default function Menu({ onStartGame, theme, toggleTheme, soundEnabled, toggleSound }) {
  const [difficulty, setDifficulty] = useState("medium"); // easy, medium, hard
  const [bestStreaks] = useState(() => {
    const storedStreaks = localStorage.getItem("pokememory_best_streaks");
    if (storedStreaks) {
      try {
        return JSON.parse(storedStreaks);
      } catch (e) {
        console.error("Error loading best streaks", e);
      }
    }
    return { easy: 0, medium: 0, hard: 0 };
  });

  const handleDifficultySelect = (diff) => {
    audioHelper.playClick();
    setDifficulty(diff);
  };

  const handleStart = () => {
    audioHelper.playClick();
    onStartGame(difficulty);
  };

  const difficultyMax = {
    easy: 6,
    medium: 9,
    hard: 12
  };

  return (
    <div className="menu-container fade-in">
      {/* Settings Row */}
      <div className="menu-settings">
        <button 
          className="settings-btn" 
          onClick={() => { audioHelper.playClick(); toggleTheme(); }}
          title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button 
          className="settings-btn" 
          onClick={() => { audioHelper.playClick(); toggleSound(); }}
          title={soundEnabled ? "Mute Sound/BGM" : "Enable Sound/BGM"}
        >
          {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>
      </div>

      {/* Pulsing Logo Title */}
      <div className="logo-area">
        <div className="pokeball-spinner"></div>
        <h1 className="game-title">
          <span className="title-poke">Poké</span>
          <span className="title-memory">Memory</span>
        </h1>
        <p className="game-subtitle">Avoid Double Clicks. Catch 'Em All.</p>
      </div>

      <div className="menu-card">
        {/* Difficulty Selection */}
        <div className="menu-section">
          <h3>Difficulty</h3>
          <div className="difficulty-grid">
            {["easy", "medium", "hard"].map((diff) => (
              <button
                key={diff}
                className={`difficulty-btn ${diff} ${difficulty === diff ? "active" : ""}`}
                onClick={() => handleDifficultySelect(diff)}
              >
                <div className="pokeball-dot"></div>
                {diff.toUpperCase()}
              </button>
            ))}
          </div>
          <p className="difficulty-desc">
            Cards to clear: {difficultyMax[difficulty]}
          </p>
        </div>

        {/* Best Streak display */}
        <div className="menu-section" style={{ textAlign: "center", background: "rgba(0,0,0,0.15)", padding: "10px", borderRadius: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
            <Award size={14} style={{ color: "var(--pokedex-led-yellow)" }} />
            <span>BEST STREAK</span>
          </div>
          <div style={{ fontSize: "1.2rem", fontWeight: "800", marginTop: "4px", fontFamily: "var(--font-retro)", color: "var(--pokedex-led-yellow)" }}>
            {bestStreaks[difficulty] || 0} / {difficultyMax[difficulty]}
          </div>
        </div>

        {/* Action Button */}
        <button className="start-btn pulse" onClick={handleStart}>
          <Play size={20} fill="currentColor" />
          START GAME
        </button>
      </div>
    </div>
  );
}
