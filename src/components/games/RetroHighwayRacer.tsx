import React, { useRef, useEffect, useState } from 'react';
import { Play, RotateCcw, Volume2, VolumeX, Trophy, Car } from 'lucide-react';
import { gameSound } from '../../utils/gameSound';

interface TrafficCar {
  id: number;
  lane: number;
  y: number;
  speed: number;
  color: string;
}

export const RetroHighwayRacer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('retro_highway_high_score') || '0', 10);
  });
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [soundOn, setSoundOn] = useState(true);

  const laneRef = useRef(1); // 0, 1, 2, 3
  const playerYRef = useRef(350);
  const trafficRef = useRef<TrafficCar[]>([]);
  const animFrameRef = useRef<number | null>(null);

  const startNewGame = () => {
    setScore(0);
    laneRef.current = 1;
    trafficRef.current = [];

    for (let i = 0; i < 4; i++) {
      trafficRef.current.push({
        id: Math.random(),
        lane: Math.floor(Math.random() * 4),
        y: -i * 140 - 100,
        speed: Math.random() * 2 + 4,
        color: ['#ef4444', '#f59e0b', '#a855f7', '#10b981'][Math.floor(Math.random() * 4)]
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

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'ArrowLeft' || e.key === 'a') && laneRef.current > 0) {
        laneRef.current -= 1;
        if (soundOn) gameSound.playBounce();
      }
      if ((e.key === 'ArrowRight' || e.key === 'd') && laneRef.current < 3) {
        laneRef.current += 1;
        if (soundOn) gameSound.playBounce();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    let frameCount = 0;

    const loop = () => {
      const w = canvas.width;
      const h = canvas.height;
      const laneWidth = w / 4;

      ctx.fillStyle = '#080d19';
      ctx.fillRect(0, 0, w, h);

      // Highway Asphalt Road & Dashed Lines
      frameCount += 8;
      ctx.strokeStyle = '#00f3ff';
      ctx.lineWidth = 2;
      ctx.setLineDash([20, 20]);
      ctx.lineDashOffset = -frameCount;

      for (let i = 1; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(i * laneWidth, 0);
        ctx.lineTo(i * laneWidth, h);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      // Move & Draw Traffic Cars
      let crash = false;

      trafficRef.current.forEach((tc) => {
        tc.y += tc.speed;

        if (tc.y > h + 60) {
          tc.y = -80;
          tc.lane = Math.floor(Math.random() * 4);
          tc.speed = Math.random() * 2 + 4;
          setScore((s) => {
            const ns = s + 15;
            if (ns > highScore) {
              setHighScore(ns);
              localStorage.setItem('retro_highway_high_score', ns.toString());
            }
            return ns;
          });
        }

        const cx = tc.lane * laneWidth + laneWidth / 2;

        ctx.fillStyle = tc.color;
        ctx.shadowColor = tc.color;
        ctx.shadowBlur = 12;

        ctx.beginPath();
        ctx.roundRect(cx - 20, tc.y - 35, 40, 70, 8);
        ctx.fill();

        // Car Headlights
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(cx - 15, tc.y + 25, 8, 6);
        ctx.fillRect(cx + 7, tc.y + 25, 8, 6);

        // Crash check with player (player at laneRef.current, y ~ 350)
        if (tc.lane === laneRef.current && Math.abs(tc.y - playerYRef.current) < 55) {
          crash = true;
        }
      });

      if (crash) {
        setGameState('gameover');
        if (soundOn) gameSound.playGameOver();
        return;
      }

      // Draw Player Sports Car
      const px = laneRef.current * laneWidth + laneWidth / 2;
      const py = playerYRef.current;

      ctx.save();
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 18;

      ctx.beginPath();
      ctx.roundRect(px - 22, py - 35, 44, 70, 10);
      ctx.fill();

      // Taillights
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(px - 18, py + 28, 10, 5);
      ctx.fillRect(px + 8, py + 28, 10, 5);

      // Windshield
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(px - 14, py - 10, 28, 20);

      ctx.restore();

      animFrameRef.current = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [gameState, soundOn, highScore]);

  const moveLeft = () => {
    if (laneRef.current > 0) {
      laneRef.current -= 1;
      if (soundOn) gameSound.playBounce();
    }
  };

  const moveRight = () => {
    if (laneRef.current < 3) {
      laneRef.current += 1;
      if (soundOn) gameSound.playBounce();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-[#0a0e1a] border border-cyan-500/30 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col items-center">
      <div className="w-full flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Car className="text-cyan-400 w-6 h-6 animate-pulse" />
          <h3 className="text-lg font-black text-white tracking-wide">Retro Highway Racer</h3>
        </div>
        <button
          onClick={() => setSoundOn(!soundOn)}
          className="p-1.5 rounded-xl bg-slate-900 border border-slate-700 text-cyan-400 hover:text-white transition"
        >
          {soundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>
      </div>

      <div className="relative w-full aspect-[4/3] bg-black rounded-2xl overflow-hidden border border-cyan-500/40 shadow-inner game-playing-active">
        <canvas ref={canvasRef} width={600} height={450} className="w-full h-full" />

        {gameState === 'idle' && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center pointer-events-auto">
            <Car size={48} className="text-cyan-400 mb-3 animate-bounce" />
            <h4 className="text-xl font-extrabold text-white mb-1">রেট্রো স্পিড রেসার</h4>
            <p className="text-xs text-cyan-300 max-w-sm mb-6 leading-relaxed">
              ৪টি লেন ধরে দ্রুত গাড়ি ড্রাইভ করুন! অনকামিং যানবাহন এড়িয়ে হাইওয়ে রিকর্ড গড়ুন।
            </p>
            <button
              onClick={startNewGame}
              className="px-6 py-2.5 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-sm transition shadow-lg shadow-cyan-500/30 flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Play size={16} fill="currentColor" />
              <span>রেস শুরু করুন</span>
            </button>
          </div>
        )}

        {gameState === 'gameover' && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fade-in pointer-events-auto">
            <h4 className="text-2xl font-black text-rose-500 mb-2">গাড়ি অ্যাক্সিডেন্ট হয়েছে!</h4>
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

        {/* Control Buttons for touch / mobile */}
        {gameState === 'playing' && (
          <div className="absolute bottom-3 inset-x-3 flex justify-between gap-4 pointer-events-auto">
            <button
              onClick={moveLeft}
              className="flex-1 py-3 bg-cyan-600/80 hover:bg-cyan-500 text-slate-950 font-black text-xs rounded-xl shadow-lg border border-cyan-400/50 active:scale-95 cursor-pointer"
            >
              ◀ বাম লেন
            </button>
            <button
              onClick={moveRight}
              className="flex-1 py-3 bg-cyan-600/80 hover:bg-cyan-500 text-slate-950 font-black text-xs rounded-xl shadow-lg border border-cyan-400/50 active:scale-95 cursor-pointer"
            >
              ডান লেন ▶
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
