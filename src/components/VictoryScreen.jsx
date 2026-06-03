import { useEffect, useRef } from "react";
import { RotateCcw, Home, Star } from "lucide-react";
import { audioHelper } from "../utils/audio";

export default function VictoryScreen({
  difficulty,
  moves,
  accuracy,
  isHighScore,
  onPlayAgain,
  onGoHome
}) {
  const canvasRef = useRef(null);

  // Play victory sound once on mount
  useEffect(() => {
    audioHelper.playVictory();
  }, []);

  // Canvas confetti animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    // Particle class simulating colorful paper confetti
    class Confetti {
      constructor(x, y, angle, spread) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 8 + 6;
        this.color = `hsl(${Math.random() * 360}, 95%, 60%)`;
        
        // Initial velocity vector based on angle and spread
        const speed = Math.random() * 15 + 10;
        const radAngle = (angle + (Math.random() * spread - spread / 2)) * (Math.PI / 180);
        this.vx = Math.cos(radAngle) * speed;
        this.vy = Math.sin(radAngle) * speed;
        
        this.gravity = 0.35;
        this.drag = 0.98;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = Math.random() * 10 - 5;
        this.opacity = 1;
        this.fade = Math.random() * 0.01 + 0.005;
      }

      update() {
        this.vx *= this.drag;
        this.vy *= this.drag;
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;
        this.rotation += this.rotationSpeed;
        
        if (this.y > canvas.height - 20) {
          this.opacity -= this.fade;
        }
      }

      draw() {
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.opacity);
        ctx.translate(this.x, this.y);
        ctx.rotate((this.rotation * Math.PI) / 180);
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
        ctx.restore();
      }
    }

    const particles = [];
    
    // Spawn burst function
    const spawnBurst = (x, y, angle, spread, count = 40) => {
      for (let i = 0; i < count; i++) {
        particles.push(new Confetti(x, y, angle, spread));
      }
    };

    // Shoot fountains initially
    spawnBurst(0, canvas.height, -45, 30, 60);
    spawnBurst(canvas.width, canvas.height, -135, 30, 60);

    // Periodic smaller bursts on click/randomly
    let timer = 0;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Randomly spawn gentle drifting particles from top
      if (Math.random() < 0.2 && particles.length < 150) {
        particles.push(new Confetti(Math.random() * canvas.width, -10, 90, 40));
      }

      // Intermittent bursts from corners
      timer++;
      if (timer % 90 === 0 && particles.length < 100) {
        spawnBurst(0, canvas.height, -45, 25, 20);
        spawnBurst(canvas.width, canvas.height, -135, 25, 20);
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.update();
        p.draw();
        // Remove dead/off-screen particles
        if (p.opacity <= 0 || p.y > canvas.height + 20 || p.x < -20 || p.x > canvas.width + 20) {
          particles.splice(i, 1);
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // Spawn on mouse click
    const handleCanvasClick = (e) => {
      spawnBurst(e.clientX, e.clientY, -90, 360, 25);
    };
    window.addEventListener("click", handleCanvasClick);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("click", handleCanvasClick);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Determine Pokémon trainer badge based on moves
  const getBadgeInfo = () => {
    let tier = "Poké Ball";
    let desc = "Keep practicing to improve your memory!";
    let color = "#ef4444";
    let iconClass = "poke-ball-badge";

    if (difficulty === "easy") {
      if (moves <= 8) {
        tier = "Master Ball";
        desc = "Incredible! A true Legendary match!";
        color = "#a855f7";
        iconClass = "master-ball-badge";
      } else if (moves <= 12) {
        tier = "Ultra Ball";
        desc = "Amazing memory skills!";
        color = "#eab308";
        iconClass = "ultra-ball-badge";
      } else if (moves <= 16) {
        tier = "Great Ball";
        desc = "Great job, solid catching!";
        color = "#3b82f6";
        iconClass = "great-ball-badge";
      }
    } else if (difficulty === "medium") {
      if (moves <= 11) {
        tier = "Master Ball";
        desc = "Flawless! Master-tier memory!";
        color = "#a855f7";
        iconClass = "master-ball-badge";
      } else if (moves <= 16) {
        tier = "Ultra Ball";
        desc = "Superb! Highly efficient!";
        color = "#eab308";
        iconClass = "ultra-ball-badge";
      } else if (moves <= 22) {
        tier = "Great Ball";
        desc = "Nice work, well done!";
        color = "#3b82f6";
        iconClass = "great-ball-badge";
      }
    } else {
      // hard
      if (moves <= 18) {
        tier = "Master Ball";
        desc = "Unbelievable! Pure Champion status!";
        color = "#a855f7";
        iconClass = "master-ball-badge";
      } else if (moves <= 26) {
        tier = "Ultra Ball";
        desc = "Outstanding focus and mapping!";
        color = "#eab308";
        iconClass = "ultra-ball-badge";
      } else if (moves <= 36) {
        tier = "Great Ball";
        desc = "Impressive completion!";
        color = "#3b82f6";
        iconClass = "great-ball-badge";
      }
    }

    return { tier, desc, color, iconClass };
  };

  const badge = getBadgeInfo();

  return (
    <div className="victory-container fade-in">
      <canvas ref={canvasRef} className="confetti-canvas"></canvas>

      <div className="victory-card">
        {/* Confetti Banner */}
        <div className="victory-banner">
          <h2>VICTORY!</h2>
        </div>

        {/* Dynamic Badge Display */}
        <div className="badge-display">
          <div className={`badge-icon-wrapper ${badge.iconClass}`}>
            <div className="badge-inner-ball"></div>
          </div>
          <h3 className="badge-tier" style={{ color: badge.color }}>
            {badge.tier} Tier
          </h3>
          <p className="badge-desc">{badge.desc}</p>
        </div>

        {/* High Score Celebration */}
        {isHighScore && (
          <div className="new-highscore-badge scale-up">
            <Star size={16} fill="currentColor" />
            <span>NEW HIGH SCORE!</span>
            <Star size={16} fill="currentColor" />
          </div>
        )}

        {/* Stats Grid */}
        <div className="victory-stats-grid">
          <div className="victory-stat-box">
            <span className="v-stat-val">{moves}</span>
            <span className="v-stat-lbl">Total Moves</span>
          </div>
          <div className="victory-stat-box">
            <span className="v-stat-val">{accuracy}%</span>
            <span className="v-stat-lbl">Accuracy</span>
          </div>
          <div className="victory-stat-box">
            <span className="v-stat-val">
              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </span>
            <span className="v-stat-lbl">Difficulty</span>
          </div>
        </div>

        {/* Actions */}
        <div className="victory-actions">
          <button 
            className="victory-btn play-again-btn" 
            onClick={() => { audioHelper.playClick(); onPlayAgain(); }}
          >
            <RotateCcw size={18} />
            <span>PLAY AGAIN</span>
          </button>
          
          <button 
            className="victory-btn home-btn" 
            onClick={() => { audioHelper.playClick(); onGoHome(); }}
          >
            <Home size={18} />
            <span>MAIN MENU</span>
          </button>
        </div>
      </div>
    </div>
  );
}
