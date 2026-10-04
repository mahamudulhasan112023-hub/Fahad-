import React, { useRef, useEffect, useState } from 'react';
import { Play, RotateCcw, Volume2, VolumeX, Trophy, Sword, Zap, ShieldAlert } from 'lucide-react';
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

interface TrailPoint {
  x: number;
  y: number;
  life: number;
}

export const CyberBladeNinja: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('cyber_blade_high_score') || '0', 10);
  });
  const [lives, setLives] = useState(3);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [soundOn, setSoundOn] = useState(true);

  const orbsRef = useRef<Orb[]>([]);
  const trailRef = useRef<TrailPoint[]>([]);
  const isMouseDownRef = useRef(false);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const startNewGame = () => {
    setScore(0);
    setLives(3);
    orbsRef.current = [];
    trailRef.current = [];
    setGameState('playing');
    if (soundOn) gameSound.playStart();
  };

  useEffect(() => {
    if (gameState !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let spawnTimer = 0;
    let orbIdCounter = 0;

    const spawnOrb = () => {
      const w = canvas.width;
      const h = canvas.height;
      const isBomb = Math.random() < 0.2;
      const isBonus = !isBomb && Math.random() < 0.15;

      const colors = ['#00f3ff', '#ff0055', '#39ff14', '#ffe600', '#a855f7'];
      const color = isBomb ? '#ef4444' : isBonus ? '#f59e0b' : colors[Math.floor(Math.random() * colors.length)];

      orbsRef.current.push({
        id: ++orbIdCounter,
        x: Math.random() * (w - 100) + 50,
        y: h + 30,
        vx: (Math.random() - 0.5) * 4,
        vy: -(Math.random() * 4 + 10),
        radius: isBomb ? 22 : isBonus ? 18 : 25,
        color,
        type: isBomb ? 'bomb' : isBonus ? 'bonus' : 'orb',
        sliced: false
      });
    };

    const checkSlice = (p1: { x: number; y: number }, p2: { x: number; y: number }) => {
      orbsRef.current.forEach((orb) => {
        if (orb.sliced) return;

        // Distance from point to line segment
        const dist = Math.hypot(orb.x - p2.x, orb.y - p2.y);
        if (dist < orb.radius + 15) {
          orb.sliced = true;
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
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Spawner
      spawnTimer++;
      if (spawnTimer % 45 === 0) {
        spawnOrb();
      }

      // Update & Draw Orbs
      orbsRef.current.forEach((orb) => {
        orb.x += orb.vx;
        orb.y += orb.vy;
        orb.vy += 0.22; // gravity

        ctx.save();
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);

        if (orb.sliced) {
          ctx.fillStyle = 'rgba(255,255,255,0.2)';
          ctx.fill();
        } else {
          ctx.fillStyle = orb.color;
          ctx.shadowColor = orb.color;
          ctx.shadowBlur = 15;
          ctx.fill();

          ctx.lineWidth = 2;
          ctx.strokeStyle = '#ffffff';
          ctx.stroke();
        }
        ctx.restore();
      });

      // Remove offscreen
      orbsRef.current = orbsRef.current.filter((o) => o.y < h + 60);

      // Trail decay & draw
      trailRef.current.forEach((tp) => (tp.life -= 0.08));
      trailRef.current = trailRef.current.filter((tp) => tp.life > 0);

      if (trailRef.current.length > 1) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(trailRef.current[0].x, trailRef.current[0].y);
        for (let i = 1; i < trailRef.current.length; i++) {
          ctx.lineTo(trailRef.current[i].x, trailRef.current[i].y);
        }
        ctx.strokeStyle = '#00f3ff';
        ctx.lineWidth = 6;
        ctx.shadowColor = '#00f3ff';
        ctx.shadowBlur = 20;
        ctx.lineCap = 'round';
        ctx.stroke();
        ctx.restore();
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [gameState, soundOn, highScore]);

  // Touch & Mouse Handlers
  const handlePointerMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (gameState !== 'playing') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();

    let clientX = 0;
    let clientY = 0;

    if ('touches' in e) {
      if (e.touches.length === 0) return;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = (clientX - rect.left) * (canvas.width / rect.width);
    const y = (clientY - rect.top) * (canvas.height / rect.height);

    trailRef.current.push({ x, y, life: 1.0 });

    if (lastPosRef.current) {
      // Check slice collision
      const p1 = lastPosRef.current;
      const p2 = { x, y };

      orbsRef.current.forEach((orb) => {
        if (orb.sliced) return;
        const d = Math.hypot(orb.x - x, orb.y - y);
        if (d < orb.radius + 15) {
          orb.sliced = true;
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
          } else {
            if (soundOn) gameSound.playBladeHit();
            setScore((s) => {
              const ns = s + (orb.type === 'bonus' ? 50 : 10);
              if (ns > highScore) {
                setHighScore(ns);
                localStorage.setItem('cyber_blade_high_score', ns.toString());
              }
              return ns;
            });
          }
        }
      });
    }

    lastPosRef.current = { x, y };
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-[#0a0e1a] border border-cyan-500/30 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col items-center">
      {/* Top Header */}
      <div className="w-full flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sword className="text-cyan-400 w-6 h-6 animate-pulse" />
          <h3 className="text-lg font-black text-white tracking-wide">Cyber Blade Ninja</h3>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-rose-400 text-sm font-bold bg-rose-950/40 border border-rose-500/30 px-2.5 py-1 rounded-full">
            <ShieldAlert size={14} />
            <span>লাইফ: {'❤️'.repeat(lives)}</span>
          </div>
          <button
            onClick={() => setSoundOn(!soundOn)}
            className="p-1.5 rounded-xl bg-slate-900 border border-slate-700 text-cyan-400 hover:text-white transition"
          >
            {soundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="relative w-full aspect-[4/3] bg-black rounded-2xl overflow-hidden border border-cyan-500/40 shadow-inner">
        <canvas
          ref={canvasRef}
          width={600}
          height={450}
          onMouseMove={handlePointerMove}
          onTouchMove={handlePointerMove}
          className="w-full h-full cursor-crosshair touch-none"
        />

        {gameState === 'idle' && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
            <Sword size={48} className="text-cyan-400 mb-3 animate-bounce" />
            <h4 className="text-xl font-extrabold text-white mb-1">সাইবার ব্লেড নিনজা</h4>
            <p className="text-xs text-cyan-300 max-w-sm mb-6 leading-relaxed">
              মাউস বা আঙুল টেনে দ্রুত আকাশে ভাসমান নিওন অরর্বগুলো কেটে দিন! লাল বোমা এড়িয়ে চলুন।
            </p>
            <button
              onClick={startNewGame}
              className="px-6 py-2.5 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-sm transition shadow-lg shadow-cyan-500/30 flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Play size={16} fill="currentColor" />
              <span>খেলা শুরু করুন</span>
            </button>
          </div>
        )}

        {gameState === 'gameover' && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fade-in">
            <h4 className="text-2xl font-black text-rose-500 mb-2">গেম ওভার!</h4>
            <p className="text-sm text-gray-300 mb-1">আপনার স্কোয়ার: <span className="font-bold text-cyan-400">{score}</span></p>
            <p className="text-xs text-amber-400 mb-6 flex items-center gap-1">
              <Trophy size={14} /> সেরা স্কোর: {highScore}
            </p>
            <button
              onClick={startNewGame}
              className="px-6 py-2.5 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-sm transition shadow-lg shadow-cyan-500/30 flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <RotateCcw size={16} />
              <span>আবার চেষ্টা করুন</span>
            </button>
          </div>
        )}
      </div>

      {/* Bottom Bar Stats */}
      <div className="w-full flex items-center justify-between mt-3 text-xs text-gray-400 font-mono">
        <div>স্কোর: <span className="text-cyan-400 font-bold">{score}</span></div>
        <div>হাই স্কোর: <span className="text-amber-400 font-bold">{highScore}</span></div>
      </div>
    </div>
  );
};
