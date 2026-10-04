import React, { useRef, useEffect, useState } from 'react';
import { Play, RotateCcw, Volume2, VolumeX, Trophy, Zap } from 'lucide-react';
import { gameSound } from '../../utils/gameSound';

export const NeonSnakeX: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('neon_snake_high_score') || '0', 10);
  });
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [soundOn, setSoundOn] = useState(true);

  const snakeRef = useRef<{ x: number; y: number }[]>([]);
  const dirRef = useRef<{ x: number; y: number }>({ x: 1, y: 0 });
  const foodRef = useRef<{ x: number; y: number; color: string }>({ x: 200, y: 200, color: '#00f3ff' });
  const animFrameRef = useRef<number | null>(null);

  const startNewGame = () => {
    setScore(0);
    snakeRef.current = [
      { x: 120, y: 200 },
      { x: 100, y: 200 },
      { x: 80, y: 200 }
    ];
    dirRef.current = { x: 1, y: 0 };
    spawnFood();
    setGameState('playing');
    if (soundOn) gameSound.playStart();
  };

  const spawnFood = () => {
    const colors = ['#00f3ff', '#ff0055', '#39ff14', '#ffe600', '#a855f7'];
    foodRef.current = {
      x: Math.floor(Math.random() * 25 + 2) * 20,
      y: Math.floor(Math.random() * 18 + 2) * 20,
      color: colors[Math.floor(Math.random() * colors.length)]
    };
  };

  useEffect(() => {
    if (gameState !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const cur = dirRef.current;
      if ((e.key === 'ArrowUp' || e.key === 'w') && cur.y === 0) dirRef.current = { x: 0, y: -1 };
      if ((e.key === 'ArrowDown' || e.key === 's') && cur.y === 0) dirRef.current = { x: 0, y: 1 };
      if ((e.key === 'ArrowLeft' || e.key === 'a') && cur.x === 0) dirRef.current = { x: -1, y: 0 };
      if ((e.key === 'ArrowRight' || e.key === 'd') && cur.x === 0) dirRef.current = { x: 1, y: 0 };
    };

    window.addEventListener('keydown', handleKeyDown);

    let stepTimer = 0;

    const loop = () => {
      const w = canvas.width;
      const h = canvas.height;

      ctx.fillStyle = '#050914';
      ctx.fillRect(0, 0, w, h);

      // Grid Lines
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.05)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 20) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      stepTimer++;
      if (stepTimer % 6 === 0) {
        // Move Snake Head
        const head = { ...snakeRef.current[0] };
        head.x += dirRef.current.x * 20;
        head.y += dirRef.current.y * 20;

        // Screen Wrap / Border Check
        if (head.x < 0 || head.x >= w || head.y < 0 || head.y >= h) {
          setGameState('gameover');
          if (soundOn) gameSound.playGameOver();
          return;
        }

        // Self collision check
        for (let i = 0; i < snakeRef.current.length; i++) {
          if (snakeRef.current[i].x === head.x && snakeRef.current[i].y === head.y) {
            setGameState('gameover');
            if (soundOn) gameSound.playGameOver();
            return;
          }
        }

        snakeRef.current.unshift(head);

        // Check Food Eat
        if (Math.abs(head.x - foodRef.current.x) < 15 && Math.abs(head.y - foodRef.current.y) < 15) {
          setScore((s) => {
            const ns = s + 10;
            if (ns > highScore) {
              setHighScore(ns);
              localStorage.setItem('neon_snake_high_score', ns.toString());
            }
            return ns;
          });
          spawnFood();
          if (soundOn) gameSound.playEat();
        } else {
          snakeRef.current.pop();
        }
      }

      // Draw Food
      const food = foodRef.current;
      ctx.fillStyle = food.color;
      ctx.shadowColor = food.color;
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(food.x + 10, food.y + 10, 8, 0, Math.PI * 2);
      ctx.fill();

      // Draw Snake Body
      snakeRef.current.forEach((seg, idx) => {
        ctx.fillStyle = idx === 0 ? '#10b981' : '#34d399';
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = idx === 0 ? 15 : 6;

        ctx.fillRect(seg.x + 1, seg.y + 1, 18, 18);
      });

      animFrameRef.current = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [gameState, soundOn, highScore]);

  const changeDir = (x: number, y: number) => {
    if (dirRef.current.x !== -x && dirRef.current.y !== -y) {
      dirRef.current = { x, y };
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-[#0a0e1a] border border-emerald-500/30 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col items-center">
      <div className="w-full flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap className="text-emerald-400 w-6 h-6 animate-pulse" />
          <h3 className="text-lg font-black text-white tracking-wide">Neon Snake X</h3>
        </div>
        <button
          onClick={() => setSoundOn(!soundOn)}
          className="p-1.5 rounded-xl bg-slate-900 border border-slate-700 text-emerald-400 hover:text-white transition"
        >
          {soundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>
      </div>

      <div className="relative w-full aspect-[4/3] bg-black rounded-2xl overflow-hidden border border-emerald-500/40 shadow-inner">
        <canvas ref={canvasRef} width={600} height={450} className="w-full h-full" />

        {gameState === 'idle' && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
            <Zap size={48} className="text-emerald-400 mb-3 animate-bounce" />
            <h4 className="text-xl font-extrabold text-white mb-1">নিওন স্নেক এক্স</h4>
            <p className="text-xs text-emerald-300 max-w-sm mb-6 leading-relaxed">
              অ্যারো কি বা বাটন দিয়ে স্নেক নিয়ন্ত্রণ করুন। নিওন স্পার্ক খেলেই শরীরের আকার বৃদ্ধি পাবে!
            </p>
            <button
              onClick={startNewGame}
              className="px-6 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm transition shadow-lg shadow-emerald-500/30 flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Play size={16} fill="currentColor" />
              <span>খেলা শুরু করুন</span>
            </button>
          </div>
        )}

        {gameState === 'gameover' && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fade-in">
            <h4 className="text-2xl font-black text-rose-500 mb-2">গেম ওভার!</h4>
            <p className="text-sm text-gray-300 mb-1">আপনার স্কোয়ার: <span className="font-bold text-emerald-400">{score}</span></p>
            <p className="text-xs text-amber-400 mb-6 flex items-center gap-1">
              <Trophy size={14} /> সেরা স্কোর: {highScore}
            </p>
            <button
              onClick={startNewGame}
              className="px-6 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm transition shadow-lg shadow-emerald-500/30 flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <RotateCcw size={16} />
              <span>আবার খেলুন</span>
            </button>
          </div>
        )}

        {/* D-Pad controls for touch */}
        {gameState === 'playing' && (
          <div className="absolute bottom-3 right-3 flex flex-col items-center gap-1 pointer-events-auto">
            <button
              onClick={() => changeDir(0, -1)}
              className="w-9 h-9 bg-emerald-700/80 hover:bg-emerald-600 text-white font-black text-xs rounded-lg active:scale-90"
            >
              ▲
            </button>
            <div className="flex gap-1">
              <button
                onClick={() => changeDir(-1, 0)}
                className="w-9 h-9 bg-emerald-700/80 hover:bg-emerald-600 text-white font-black text-xs rounded-lg active:scale-90"
              >
                ◀
              </button>
              <button
                onClick={() => changeDir(0, 1)}
                className="w-9 h-9 bg-emerald-700/80 hover:bg-emerald-600 text-white font-black text-xs rounded-lg active:scale-90"
              >
                ▼
              </button>
              <button
                onClick={() => changeDir(1, 0)}
                className="w-9 h-9 bg-emerald-700/80 hover:bg-emerald-600 text-white font-black text-xs rounded-lg active:scale-90"
              >
                ▶
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="w-full flex items-center justify-between mt-3 text-xs text-gray-400 font-mono">
        <div>স্কোর: <span className="text-emerald-400 font-bold">{score}</span></div>
        <div>হাই স্কোর: <span className="text-amber-400 font-bold">{highScore}</span></div>
      </div>
    </div>
  );
};
