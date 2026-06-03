import { ArrowLeft, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { audioHelper } from "../utils/audio";

export default function StatsBar({
  matchedCount,
  totalPairs,
  bestStreak,
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
          className="lcd-btn" 
          onClick={() => handleActionClick(onGoBack)}
          title="Return to Main Menu"
        >
          <ArrowLeft size={10} />
          <span>MENU</span>
        </button>
      </div>

      <div className="stats-center">
        <div className="stat-pill">
          <span className="stat-label">CAUGHT</span>
          <span className="stat-val">{matchedCount} / {totalPairs}</span>
        </div>
        <div className="stat-pill">
          <span className="stat-label">BEST</span>
          <span className="stat-val">{bestStreak}</span>
        </div>
      </div>

      <div className="stats-right">
        <button 
          className="lcd-btn" 
          onClick={() => handleActionClick(toggleSound)}
          title={soundEnabled ? "Mute Game" : "Unmute Game"}
        >
          {soundEnabled ? <Volume2 size={10} /> : <VolumeX size={10} />}
        </button>
        
        <button 
          className="lcd-btn" 
          onClick={() => handleActionClick(onRestart)}
          title="Reset Game"
        >
          <RotateCcw size={10} />
          <span>RESET</span>
        </button>
      </div>
    </div>
  );
}
