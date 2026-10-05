import React, { useRef, useEffect, useState } from 'react';
import { RotateCcw, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { gameSound } from '../../utils/gameSound';

interface Orb {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  type: 'orb' | 'bomb' | 'bonus';
  sliced: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
}

interface BladePoint {
  x: number;
  y: number;
  life: number;
}

export const CyberBladeNinja: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('cyber_blade_high_score') || '0', 10);
  });
  const [gameState, setGameState] = useState<'playing' | 'gameover'>('playing');
  const [soundOn, setSoundOn] = useState(true);

  const orbsRef = useRef<Orb[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const trailRef = useRef<BladePoint[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const isPointerDownRef = useRef(false);

  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    const width = Math.floor(parent?.clientWidth || window.innerWidth);
    const height = Math.floor(parent?.clientHeight || window.innerHeight);

    if (Math.abs(canvas.width - width) > 2 || Math.abs(canvas.height - height) > 2) {
      canvas.width = width;
      canvas.height = height;
    }
  };

  const startNewGame = () => {
    gameSound.init();
    setScore(0);
    setLives(3);
    orbsRef.current = [];
    particlesRef.current = [];
    trailRef.current = [];
    resizeCanvas();
    setGameState('playing');
    if (soundOn) gameSound.playStart();
  };

  useEffect(() => {
    resizeCanvas();
    startNewGame();
    const handleResize = () => resizeCanvas();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (gameState !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let spawnTimer = 0;
    let orbIdCounter = 0;

    const spawnOrb = () => {
      const w = canvas.width || window.innerWidth;
      const h = canvas.height || window.innerHeight;
      const isBomb = Math.random() < 0.18;
      const isBonus = !isBomb && Math.random() < 0.15;

      const colors = ['#00f3ff', '#ff0055', '#39ff14', '#ffe600', '#a855f7'];
      const color = isBomb ? '#ef4444' : isBonus ? '#f59e0b' : colors[Math.floor(Math.random() * colors.length)];
      const radius = isBomb ? 28 : isBonus ? 24 : 30;

      orbsRef.current.push({
        id: ++orbIdCounter,
        x: Math.random() * Math.max(100, w - 140) + 70,
        y: h + 40,
        vx: (Math.random() - 0.5) * 4.5,
        vy: -(Math.random() * 4 + 13),
        radius,
        color,
        type: isBomb ? 'bomb' : isBonus ? 'bonus' : 'orb',
        sliced: false
      });
    };

    const loop = () => {
      const w = canvas.width;
      const h = canvas.height;

      // Dark futuristic grid canvas
      ctx.fillStyle = '#060a17';
      ctx.fillRect(0, 0, w, h);

      // Subtle background grid
      ctx.strokeStyle = 'rgba(0, 243, 255, 0.05)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 40) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }
      for (let y = 0; y < h; y += 40) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }

      // Spawn orbs steadily
      spawnTimer++;
      if (spawnTimer % 40 === 0) {
        spawnOrb();
        if (Math.random() < 0.4) spawnOrb();
      }

      // Update & Render Flying Orbs
      orbsRef.current.forEach((orb) => {
        orb.x += orb.vx;
        orb.y += orb.vy;
        orb.vy += 0.26; // Gravity

        if (!orb.sliced) {
          ctx.save();
          ctx.fillStyle = orb.color;
          ctx.shadowColor = orb.color;
          ctx.shadowBlur = 18;

          ctx.beginPath();
          ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
          ctx.fill();

          // Highlight
          ctx.fillStyle = '#ffffff';
          ctx.shadowBlur = 0;
          ctx.beginPath();
          ctx.arc(orb.x - orb.radius * 0.35, orb.y - orb.radius * 0.35, orb.radius * 0.28, 0, Math.PI * 2);
          ctx.fill();

          if (orb.type === 'bomb') {
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 18px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('💣', orb.x, orb.y);
          } else if (orb.type === 'bonus') {
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 16px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('★', orb.x, orb.y);
          }

          ctx.restore();
        }
      });

      // Remove offscreen orbs
      orbsRef.current = orbsRef.current.filter((o) => o.y < h + 120);

      // Update & Render Slice Particles
      particlesRef.current.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15;
        p.alpha -= 0.03;

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
      particlesRef.current = particlesRef.current.filter((p) => p.alpha > 0);

      // Render Blade Light Trail
      if (trailRef.current.length > 1) {
        ctx.save();
        for (let i = 1; i < trailRef.current.length; i++) {
          const pt1 = trailRef.current[i - 1];
          const pt2 = trailRef.current[i];

          ctx.strokeStyle = '#00f3ff';
          ctx.lineWidth = pt2.life * 10;
          ctx.shadowColor = '#00f3ff';
          ctx.shadowBlur = 18;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(pt1.x, pt1.y);
          ctx.lineTo(pt2.x, pt2.y);
          ctx.stroke();
        }
        ctx.restore();
      }

      // Fade blade trail points
      trailRef.current.forEach((pt) => {
        pt.life -= 0.09;
      });
      trailRef.current = trailRef.current.filter((pt) => pt.life > 0);

      animFrameRef.current = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [gameState, soundOn]);

  // Touch & Mouse Slicing Handler with scaled resolution
  const handlePointerAction = (clientX: number, clientY: number) => {
    if (gameState !== 'playing') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / (rect.width || 1);
    const scaleY = canvas.height / (rect.height || 1);

    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    trailRef.current.push({ x, y, life: 1.0 });

    orbsRef.current.forEach((orb) => {
      if (orb.sliced) return;

      const d = Math.hypot(orb.x - x, orb.y - y);
      if (d < orb.radius + 38) {
        orb.sliced = true;

        // Spawn slice explosion particles
        for (let i = 0; i < 14; i++) {
          particlesRef.current.push({
            x: orb.x,
            y: orb.y,
            vx: (Math.random() - 0.5) * 10,
            vy: (Math.random() - 0.5) * 10,
            radius: Math.random() * 4 + 2,
            color: orb.color,
            alpha: 1.0
          });
        }

        if (orb.type === 'bomb') {
          if (soundOn) gameSound.playBladeClank();
          setLives((l) => {
            const newL = l - 1;
            if (newL <= 0) {
              setGameState('gameover');
              if (soundOn) gameSound.playGameOver();
            }
            return newL;
          });
        } else if (orb.type === 'bonus') {
          if (soundOn) gameSound.playScore();
          setScore((s) => {
            const ns = s + 50;
            if (ns > highScore) {
              setHighScore(ns);
              localStorage.setItem('cyber_blade_high_score', ns.toString());
            }
            return ns;
          });
        } else {
          if (soundOn) gameSound.playBladeHit();
          setScore((s) => {
            const ns = s + 10;
            if (ns > highScore) {
              setHighScore(ns);
              localStorage.setItem('cyber_blade_high_score', ns.toString());
            }
            return ns;
          });
        }
      }
    });
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-black overflow-hidden select-none">
      <div 
        onMouseDown={(e) => {
          isPointerDownRef.current = true;
          handlePointerAction(e.clientX, e.clientY);
        }}
        onMouseUp={() => { isPointerDownRef.current = false; }}
        onMouseMove={(e) => {
          handlePointerAction(e.clientX, e.clientY);
        }}
        onTouchStart={(e) => {
          isPointerDownRef.current = true;
          if (e.touches.length > 0) handlePointerAction(e.touches[0].clientX, e.touches[0].clientY);
        }}
        onTouchEnd={() => { isPointerDownRef.current = false; }}
        onTouchMove={(e) => {
          if (e.touches.length > 0) handlePointerAction(e.touches[0].clientX, e.touches[0].clientY);
        }}
        className="relative w-full h-full overflow-hidden bg-black flex flex-col items-center justify-center cursor-crosshair touch-none"
      >
        <canvas ref={canvasRef} className="w-full h-full block cursor-crosshair touch-none" />

        {/* HUD Header */}
        {gameState === 'playing' && (
          <div className="absolute top-4 left-4 flex items-center gap-3 text-xs text-white font-mono z-10 bg-slate-950/80 px-4 py-2 rounded-full border border-slate-800 backdrop-blur-md shadow-lg pointer-events-auto">
            <div>লাইফ: {'❤️'.repeat(Math.max(0, lives))}</div>
            <div className="text-slate-500">|</div>
            <div>স্কোর: <span className="text-cyan-400 font-bold">{score}</span></div>
            <div className="text-slate-500">|</div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSoundOn(s => {
                  const next = !s;
                  gameSound.enabled = next;
                  return next;
                });
              }}
              className="p-1 rounded bg-slate-800 text-white hover:bg-slate-700 transition"
              title="সাউন্ড অন/অফ"
            >
              {soundOn ? <Volume2 size={15} className="text-emerald-400" /> : <VolumeX size={15} className="text-rose-400" />}
            </button>
          </div>
        )}

        {/* Game Instruction Hint */}
        {gameState === 'playing' && (
          <div className="absolute bottom-4 inset-x-0 mx-auto w-max z-10 bg-slate-950/80 px-5 py-2 rounded-full border border-white/10 text-xs font-mono text-cyan-300 text-center pointer-events-none shadow-lg">
            আঙুল বা মাউস টেনে বল কাটুন! 💣 বোমা এড়িয়ে চলুন!
          </div>
        )}

        {/* Game Over Screen */}
        {gameState === 'gameover' && (
          <div 
            onClick={startNewGame}
            className="absolute inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20 cursor-pointer pointer-events-auto"
          >
            <h3 className="text-3xl font-black text-rose-500 mb-2">গেম ওভার!</h3>
            <p className="text-sm text-gray-300 mb-2">স্কোর: <span className="font-bold text-cyan-400 text-xl">{score}</span></p>
            <p className="text-xs text-slate-400 mb-6 font-mono">সর্বোচ্চ স্কোর: {highScore}</p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                startNewGame();
              }}
              className="px-10 py-3.5 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-sm transition shadow-lg shadow-cyan-500/40 flex items-center gap-2 active:scale-95 animate-pulse cursor-pointer"
            >
              <RotateCcw size={18} />
              <span>আবার খেলুন (ক্লিক করুন)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
