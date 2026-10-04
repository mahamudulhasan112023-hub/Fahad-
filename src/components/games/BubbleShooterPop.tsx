import React, { useRef, useEffect, useState } from 'react';
import { Play, RotateCcw, Volume2, VolumeX, Trophy, Sparkles } from 'lucide-react';
import { gameSound } from '../../utils/gameSound';

const BUBBLE_COLORS = ['#00f3ff', '#ff0055', '#ffe600', '#10b981', '#a855f7'];

interface Bubble {
  row: number;
  col: number;
  color: string;
}

export const BubbleShooterPop: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('bubble_shooter_high_score') || '0', 10);
  });
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [soundOn, setSoundOn] = useState(true);

  const gridRef = useRef<(string | null)[][]>([]);
  const cannonAngleRef = useRef(-Math.PI / 2);
  const currentBubbleColorRef = useRef('#00f3ff');
  const activeBulletRef = useRef<{ x: number; y: number; vx: number; vy: number; color: string } | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const startNewGame = () => {
    setScore(0);
    currentBubbleColorRef.current = BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)];
    activeBulletRef.current = null;

    // Initialize 8 rows x 10 cols grid with random bubbles in top 4 rows
    gridRef.current = [];
    for (let r = 0; r < 8; r++) {
      gridRef.current[r] = [];
      for (let c = 0; c < 10; c++) {
        if (r < 4) {
          gridRef.current[r][c] = BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)];
        } else {
          gridRef.current[r][c] = null;
        }
      }
    }

    setGameState('playing');
    if (soundOn) gameSound.playStart();
  };

  useEffect(() => {
    if (gameState !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      const x = (clientX - rect.left) * (canvas.width / rect.width);
      const y = (clientY - rect.top) * (canvas.height / rect.height);

      const dx = x - 300;
      const dy = y - 410;
      cannonAngleRef.current = Math.atan2(dy, dx);
    };

    const handlePointerDown = () => {
      if (activeBulletRef.current || gameState !== 'playing') return;

      const speed = 12;
      activeBulletRef.current = {
        x: 300,
        y: 410,
        vx: Math.cos(cannonAngleRef.current) * speed,
        vy: Math.sin(cannonAngleRef.current) * speed,
        color: currentBubbleColorRef.current
      };

      currentBubbleColorRef.current = BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)];
      if (soundOn) gameSound.playBounce();
    };

    canvas.addEventListener('mousemove', handlePointerMove);
    canvas.addEventListener('mousedown', handlePointerDown);

    canvas.addEventListener('touchmove', handlePointerMove);
    canvas.addEventListener('touchstart', handlePointerDown);

    const loop = () => {
      const w = canvas.width;
      const h = canvas.height;

      ctx.fillStyle = '#070b19';
      ctx.fillRect(0, 0, w, h);

      // Draw Grid Bubbles
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 10; c++) {
          const color = gridRef.current[r]?.[c];
          if (!color) continue;

          const bx = c * 58 + 30;
          const by = r * 45 + 30;

          ctx.fillStyle = color;
          ctx.shadowColor = color;
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(bx, by, 20, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Move Active Bullet
      const bullet = activeBulletRef.current;
      if (bullet) {
        bullet.x += bullet.vx;
        bullet.y += bullet.vy;

        // Wall Bounce
        if (bullet.x < 20 || bullet.x > w - 20) bullet.vx *= -1;

        // Top Hit or Collision with Grid Bubbles
        let landed = false;
        if (bullet.y < 30) landed = true;

        for (let r = 0; r < 8; r++) {
          for (let c = 0; c < 10; c++) {
            if (!gridRef.current[r]?.[c]) continue;
            const bx = c * 58 + 30;
            const by = r * 45 + 30;
            if (Math.hypot(bullet.x - bx, bullet.y - by) < 36) {
              landed = true;
            }
          }
        }

        if (landed) {
          const targetCol = Math.max(0, Math.min(9, Math.floor(bullet.x / 58)));
          const targetRow = Math.max(0, Math.min(7, Math.floor(bullet.y / 45)));

          gridRef.current[targetRow][targetCol] = bullet.color;
          activeBulletRef.current = null;

          if (soundOn) gameSound.playMerge();

          setScore((s) => {
            const ns = s + 30;
            if (ns > highScore) {
              setHighScore(ns);
              localStorage.setItem('bubble_shooter_high_score', ns.toString());
            }
            return ns;
          });

          // Check Gameover if bubbles reach bottom
          if (targetRow >= 7) {
            setGameState('gameover');
            if (soundOn) gameSound.playGameOver();
            return;
          }
        } else {
          // Draw Bullet
          ctx.fillStyle = bullet.color;
          ctx.shadowColor = bullet.color;
          ctx.shadowBlur = 15;
          ctx.beginPath();
          ctx.arc(bullet.x, bullet.y, 20, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Draw Cannon & Next Bubble
      ctx.save();
      ctx.translate(300, 410);
      ctx.rotate(cannonAngleRef.current);
      ctx.fillStyle = '#334155';
      ctx.fillRect(0, -10, 40, 20);
      ctx.restore();

      ctx.fillStyle = currentBubbleColorRef.current;
      ctx.shadowColor = currentBubbleColorRef.current;
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(300, 410, 20, 0, Math.PI * 2);
      ctx.fill();

      animFrameRef.current = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      canvas.removeEventListener('mousemove', handlePointerMove);
      canvas.removeEventListener('mousedown', handlePointerDown);

      canvas.removeEventListener('touchmove', handlePointerMove);
      canvas.removeEventListener('touchstart', handlePointerDown);

      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [gameState, soundOn, highScore]);

  return (
    <div className="w-full max-w-2xl mx-auto bg-[#0a0e1a] border border-cyan-500/30 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col items-center">
      <div className="w-full flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="text-cyan-400 w-6 h-6 animate-pulse" />
          <h3 className="text-lg font-black text-white tracking-wide">Bubble Shooter Pop</h3>
        </div>
        <button
          onClick={() => setSoundOn(!soundOn)}
          className="p-1.5 rounded-xl bg-slate-900 border border-slate-700 text-cyan-400 hover:text-white transition"
        >
          {soundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>
      </div>

      <div className="relative w-full aspect-[4/3] bg-black rounded-2xl overflow-hidden border border-cyan-500/40 shadow-inner select-none cursor-crosshair">
        <canvas ref={canvasRef} width={600} height={450} className="w-full h-full" />

        {gameState === 'idle' && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center pointer-events-auto">
            <Sparkles size={48} className="text-cyan-400 mb-3 animate-bounce" />
            <h4 className="text-xl font-extrabold text-white mb-1">বাবল শুটার পপ</h4>
            <p className="text-xs text-cyan-300 max-w-sm mb-6 leading-relaxed">
              লেজার ক্যানন তাক করে একই রঙের বাবল শুট করে পপ করুন এবং নতুন রেকর্ড গড়ুন!
            </p>
            <button
              onClick={startNewGame}
              className="px-6 py-2.5 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-sm transition shadow-lg shadow-cyan-500/30 flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Play size={16} fill="currentColor" />
              <span>শুট শুরু করুন</span>
            </button>
          </div>
        )}

        {gameState === 'gameover' && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fade-in pointer-events-auto">
            <h4 className="text-2xl font-black text-rose-500 mb-2">বাবল নিচে পৌঁছেছে!</h4>
            <p className="text-sm text-gray-300 mb-1">আপনার স্কোয়ার: <span className="font-bold text-cyan-400">{score}</span></p>
            <p className="text-xs text-amber-400 mb-6 flex items-center gap-1">
              <Trophy size={14} /> সেরা স্কোর: {highScore}
            </p>
            <button
              onClick={startNewGame}
              className="px-6 py-2.5 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-sm transition shadow-lg shadow-cyan-500/30 flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <RotateCcw size={16} />
              <span>আবার খেলুন</span>
            </button>
          </div>
        )}
      </div>

      <div className="w-full flex items-center justify-between mt-3 text-xs text-gray-400 font-mono">
        <div>স্কোর: <span className="text-cyan-400 font-bold">{score}</span></div>
        <div>হাই স্কোর: <span className="text-amber-400 font-bold">{highScore}</span></div>
      </div>
    </div>
  );
};
