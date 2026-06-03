import { useState } from "react";
import { audioHelper } from "../utils/audio";
import { Award, Play, Volume2, VolumeX, Moon, Sun } from "lucide-react";

export default function Menu({ onStartGame, theme, toggleTheme, soundEnabled, toggleSound }) {
  const [difficulty, setDifficulty] = useState("medium"); // easy, medium, hard
  const [highScores] = useState(() => {
    const storedScores = localStorage.getItem("pokememory_highscores");
    if (storedScores) {
      try {
        return JSON.parse(storedScores);
      } catch (e) {
        console.error("Error loading high scores", e);
      }
    }
    return { easy: [], medium: [], hard: [] };
  });
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const handleDifficultySelect = (diff) => {
    audioHelper.playClick();
    setDifficulty(diff);
  };

  const handleStart = () => {
    audioHelper.playClick();
    onStartGame(difficulty);
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
          {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <button 
          className="settings-btn" 
          onClick={() => { audioHelper.playClick(); toggleSound(); }}
          title={soundEnabled ? "Mute Sounds" : "Enable Sounds"}
        >
          {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
        </button>
      </div>

      {/* Pulsing Logo Title */}
      <div className="logo-area">
        <div className="pokeball-spinner"></div>
        <h1 className="game-title">
          <span className="title-poke">Poké</span>
          <span className="title-memory">Memory</span>
        </h1>
        <p className="game-subtitle">Train Your Brain. Catch 'Em All.</p>
      </div>

      <div className="menu-card">
        {/* Difficulty Selection */}
        <div className="menu-section">
          <h3>Choose Difficulty</h3>
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
            Matches needed: {difficulty === "easy" ? 6 : difficulty === "medium" ? 8 : 12}
          </p>
        </div>

        {/* Action Button */}
        <button className="start-btn pulse" onClick={handleStart}>
          <Play size={24} fill="currentColor" />
          START GAME
        </button>

        {/* High Scores Toggle */}
        <button 
          className="leaderboard-toggle-btn"
          onClick={() => { audioHelper.playClick(); setShowLeaderboard(!showLeaderboard); }}
        >
          <Award size={18} />
          {showLeaderboard ? "Hide High Scores" : "Show High Scores"}
        </button>

        {/* Leaderboards */}
        {showLeaderboard && (
          <div className="leaderboard-section fade-in">
            <h4 className="leaderboard-title">
              Top 5 Leaderboard - {difficulty.toUpperCase()}
            </h4>
            <div className="score-list">
              {highScores[difficulty] && highScores[difficulty].length > 0 ? (
                highScores[difficulty].map((score, index) => (
                  <div key={index} className="score-row">
                    <span className="score-rank">#{index + 1}</span>
                    <span className="score-date">
                      {new Date(score.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                    <span className="score-stats">
                      <strong>{score.moves}</strong> moves ({score.accuracy}%)
                    </span>
                  </div>
                ))
              ) : (
                <div className="empty-scores">No scores yet. Be the first!</div>
              )}
            </div>
          </div>
        )}
      </div>
      
      <div className="footer-credits">
        Powered by PokeAPI • Synthesized 8-Bit Audio
      </div>
    </div>
  );
}
