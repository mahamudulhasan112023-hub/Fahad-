import React, { useRef, useEffect, useState } from 'react';
import { Play, RotateCcw, Volume2, VolumeX, Trophy, Rocket } from 'lucide-react';
import { gameSound } from '../../utils/gameSound';

export const CyberJetFlight: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('cyber_jet_high_score') || '0', 10);
  });
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [soundOn, setSoundOn] = useState(true);

  const jetXRef = useRef(300);
  const jetYRef = useRef(320);
  const towersRef = useRef<{ x: number; y: number; width: number; height: number }[]>([]);
  const animFrameRef = useRef<number | null>(null);

  const startNewGame = () => {
    setScore(0);
    jetXRef.current = 300;
    jetYRef.current = 320;
    towersRef.current = [];

    for (let i = 0; i < 5; i++) {
      towersRef.current.push({
        x: Math.random() * 500 + 50,
        y: -i * 120,
        width: 60,
        height: 120
      });
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

      jetXRef.current = (clientX - rect.left) * (canvas.width / rect.width);
      jetYRef.current = (clientY - rect.top) * (canvas.height / rect.height);
    };

    canvas.addEventListener('mousemove', handlePointerMove);
    canvas.addEventListener('touchmove', handlePointerMove);

    const loop = () => {
      const w = canvas.width;
      const h = canvas.height;

      ctx.fillStyle = '#050814';
      ctx.fillRect(0, 0, w, h);

      // Cyber city grid background lines
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.1)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }

      // Move & Draw City Towers
      let collision = false;

      towersRef.current.forEach((t) => {
        t.y += 5.5;
        if (t.y > h + 50) {
          t.y = -100;
          t.x = Math.random() * 480 + 60;
          setScore((s) => {
            const ns = s + 20;
            if (ns > highScore) {
              setHighScore(ns);
              localStorage.setItem('cyber_jet_high_score', ns.toString());
            }
            return ns;
          });
        }

        // Draw Cyber Skyscraper
        ctx.fillStyle = '#1e1b4b';
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#a855f7';
        ctx.shadowBlur = 10;

        ctx.fillRect(t.x - t.width / 2, t.y, t.width, t.height);
        ctx.strokeRect(t.x - t.width / 2, t.y, t.width, t.height);

        // Check Collision with Jet
        if (
          Math.abs(jetXRef.current - t.x) < t.width / 2 + 15 &&
          Math.abs(jetYRef.current - (t.y + t.height / 2)) < t.height / 2 + 15
        ) {
          collision = true;
        }
      });

      if (collision) {
        setGameState('gameover');
        if (soundOn) gameSound.playGameOver();
        return;
      }

      // Draw Cyber Jet
      const jx = jetXRef.current;
      const jy = jetYRef.current;

      ctx.save();
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 18;

      ctx.beginPath();
      ctx.moveTo(jx, jy - 18);
      ctx.lineTo(jx - 15, jy + 15);
      ctx.lineTo(jx + 15, jy + 15);
      ctx.closePath();
      ctx.fill();

      // Jet Thruster Flame
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(jx, jy + 20, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      animFrameRef.current = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      canvas.removeEventListener('mousemove', handlePointerMove);
      canvas.removeEventListener('touchmove', handlePointerMove);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [gameState, soundOn, highScore]);

  return (
    <div className="w-full max-w-2xl mx-auto bg-[#0a0e1a] border border-purple-500/30 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col items-center">
      <div className="w-full flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Rocket className="text-purple-400 w-6 h-6 animate-pulse" />
          <h3 className="text-lg font-black text-white tracking-wide">Cyber Jet Flight</h3>
        </div>
        <button
          onClick={() => setSoundOn(!soundOn)}
          className="p-1.5 rounded-xl bg-slate-900 border border-slate-700 text-purple-400 hover:text-white transition"
        >
          {soundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>
      </div>

      <div className="relative w-full aspect-[4/3] bg-black rounded-2xl overflow-hidden border border-purple-500/40 shadow-inner select-none cursor-crosshair">
        <canvas ref={canvasRef} width={600} height={450} className="w-full h-full" />

        {gameState === 'idle' && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center pointer-events-auto">
            <Rocket size={48} className="text-purple-400 mb-3 animate-bounce" />
            <h4 className="text-xl font-extrabold text-white mb-1">সাইবার জেট ফ্লাইটিং</h4>
            <p className="text-xs text-purple-300 max-w-sm mb-6 leading-relaxed">
              মাউস বা আঙুল ঘুরিয়ে সাইবার জেট চালান। শহরের বহুতল বিল্ডিংগুলো এড়িয়ে চলুন!
            </p>
            <button
              onClick={startNewGame}
              className="px-6 py-2.5 rounded-full bg-purple-500 hover:bg-purple-400 text-slate-950 font-black text-sm transition shadow-lg shadow-purple-500/30 flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Play size={16} fill="currentColor" />
              <span>ফ্লাইট শুরু করুন</span>
            </button>
          </div>
        )}

        {gameState === 'gameover' && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fade-in pointer-events-auto">
            <h4 className="text-2xl font-black text-rose-500 mb-2">বিল্ডিংয়ে ক্র্যাশ করেছেন!</h4>
            <p className="text-sm text-gray-300 mb-1">আপনার স্কোয়ার: <span className="font-bold text-purple-400">{score}</span></p>
            <p className="text-xs text-amber-400 mb-6 flex items-center gap-1">
              <Trophy size={14} /> সেরা স্কোর: {highScore}
            </p>
            <button
              onClick={startNewGame}
              className="px-6 py-2.5 rounded-full bg-purple-500 hover:bg-purple-400 text-slate-950 font-black text-sm transition shadow-lg shadow-purple-500/30 flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <RotateCcw size={16} />
              <span>আবার উড্ডয়ন করুন</span>
            </button>
          </div>
        )}
      </div>

      <div className="w-full flex items-center justify-between mt-3 text-xs text-gray-400 font-mono">
        <div>স্কোর: <span className="text-purple-400 font-bold">{score}</span></div>
        <div>हाई স্কোর: <span className="text-amber-400 font-bold">{highScore}</span></div>
      </div>
    </div>
  );
};
