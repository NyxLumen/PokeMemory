import { ArrowLeft, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { audioHelper } from "../utils/audio";

export default function StatsBar({
  matchedCount,
  totalPairs,
  moves,
  accuracy,
  soundEnabled,
  toggleSound,
  onRestart,
  onGoBack
}) {
  const handleActionClick = (action) => {
    audioHelper.playClick();
    action();
  };

  return (
    <div className="stats-bar fade-in">
      <div className="stats-left">
        <button 
          className="icon-btn back-btn" 
          onClick={() => handleActionClick(onGoBack)}
          title="Return to Menu"
        >
          <ArrowLeft size={18} />
          <span>Menu</span>
        </button>
      </div>

      <div className="stats-center">
        <div className="stat-pill">
          <span className="stat-label">Pairs</span>
          <span className="stat-val">{matchedCount} / {totalPairs}</span>
        </div>
        <div className="stat-pill">
          <span className="stat-label">Moves</span>
          <span className="stat-val">{moves}</span>
        </div>
        <div className="stat-pill">
          <span className="stat-label">Accuracy</span>
          <span className="stat-val">{accuracy}%</span>
        </div>
      </div>

      <div className="stats-right">
        <button 
          className="icon-btn sound-toggle" 
          onClick={() => handleActionClick(toggleSound)}
          title={soundEnabled ? "Mute sound effects and BGM" : "Enable sound effects and BGM"}
        >
          {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>
        
        <button 
          className="icon-btn restart-btn" 
          onClick={() => handleActionClick(onRestart)}
          title="Restart Game"
        >
          <RotateCcw size={18} />
          <span>Reset</span>
        </button>
      </div>
    </div>
  );
}
