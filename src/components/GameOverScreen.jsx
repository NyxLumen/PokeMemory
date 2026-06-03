import { useEffect } from "react";
import { RotateCcw, Home } from "lucide-react";
import { audioHelper } from "../utils/audio";

export default function GameOverScreen({
  streak,
  maxStreak,
  duplicatePokemon,
  onPlayAgain,
  onGoHome
}) {
  
  // Play game over buzz on mount
  useEffect(() => {
    audioHelper.playMismatch();
  }, []);

  return (
    <div className="screen-dialog fade-in">
      <div className="dialog-banner gameover">
        <h2>GAME OVER</h2>
      </div>

      {duplicatePokemon && (
        <div className="duplicate-card-display scale-up">
          <span className="duplicate-label">Double Clicked!</span>
          <img 
            src={duplicatePokemon.sprite} 
            alt={duplicatePokemon.name} 
            className="duplicate-sprite"
            onError={(e) => {
              e.target.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${duplicatePokemon.id}.png`;
            }}
          />
          <h3 className="duplicate-name">{duplicatePokemon.name}</h3>
        </div>
      )}

      <div className="dialog-stats">
        <div className="dialog-stat-box" style={{ borderRight: "1px solid var(--border-glass)", paddingRight: "15px" }}>
          <span className="d-lbl">FINAL STREAK</span>
          <span className="d-val" style={{ color: "#ff3e3e" }}>{streak}</span>
        </div>
        <div className="dialog-stat-box" style={{ paddingLeft: "15px" }}>
          <span className="d-lbl">TARGET</span>
          <span className="d-val">{maxStreak}</span>
        </div>
      </div>

      <div className="dialog-actions">
        <button 
          className="dialog-btn primary-dialog-btn" 
          onClick={() => { audioHelper.playClick(); onPlayAgain(); }}
        >
          <RotateCcw size={16} />
          <span>TRY AGAIN</span>
        </button>
        <button 
          className="dialog-btn secondary-dialog-btn" 
          onClick={() => { audioHelper.playClick(); onGoHome(); }}
        >
          <Home size={16} />
          <span>MENU</span>
        </button>
      </div>
    </div>
  );
}
