import { useEffect, useRef } from "react";
import { RotateCcw, Home, Star } from "lucide-react";
import { audioHelper } from "../utils/audio";

export default function VictoryScreen({
  streak,
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
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width || canvas.offsetWidth || 300;
      canvas.height = rect.height || canvas.offsetHeight || 400;
    };
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    class Confetti {
      constructor(x, y, angle, spread) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 8 + 6;
        this.color = `hsl(${Math.random() * 360}, 95%, 60%)`;
        
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
    
    const spawnBurst = (x, y, angle, spread, count = 40) => {
      for (let i = 0; i < count; i++) {
        particles.push(new Confetti(x, y, angle, spread));
      }
    };

    spawnBurst(0, canvas.height, -45, 30, 60);
    spawnBurst(canvas.width, canvas.height, -135, 30, 60);

    let timer = 0;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      if (Math.random() < 0.2 && particles.length < 150) {
        particles.push(new Confetti(Math.random() * canvas.width, -10, 90, 40));
      }

      timer++;
      if (timer % 90 === 0 && particles.length < 100) {
        spawnBurst(0, canvas.height, -45, 25, 20);
        spawnBurst(canvas.width, canvas.height, -135, 25, 20);
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.update();
        p.draw();
        if (p.opacity <= 0 || p.y > canvas.height + 20 || p.x < -20 || p.x > canvas.width + 20) {
          particles.splice(i, 1);
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

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

  return (
    <div className="screen-dialog fade-in">
      <canvas ref={canvasRef} className="confetti-canvas"></canvas>

      <div className="dialog-banner victory">
        <h2>VICTORY!</h2>
      </div>

      <div className="new-highscore-badge scale-up" style={{ margin: "15px 0" }}>
        <Star size={14} fill="currentColor" />
        <span>100% CAUGHT!</span>
        <Star size={14} fill="currentColor" />
      </div>

      <p style={{ fontSize: "1.1rem", fontWeight: "600", margin: "10px 0" }}>
        Excellent job! You caught all {streak} Pokémon without making a single duplicate scan!
      </p>

      <div className="dialog-actions" style={{ zIndex: 10, position: "relative", marginTop: "20px" }}>
        <button 
          className="dialog-btn primary-dialog-btn" 
          onClick={() => { audioHelper.playClick(); onPlayAgain(); }}
        >
          <RotateCcw size={16} />
          <span>PLAY AGAIN</span>
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
