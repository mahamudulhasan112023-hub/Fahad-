import React, { useRef, useEffect, useState } from 'react';
import { Play, RotateCcw, Volume2, VolumeX, Trophy, Zap } from 'lucide-react';
import { gameSound } from '../../utils/gameSound';

export const GeometryDashLite: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('geometry_dash_high_score') || '0', 10);
  });
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [soundOn, setSoundOn] = useState(true);

  const playerYRef = useRef(320);
  const playerVyRef = useRef(0);
  const isGroundedRef = useRef(true);
  const obstaclesRef = useRef<{ x: number; type: 'spike' | 'block' }[]>([]);
  const animFrameRef = useRef<number | null>(null);

  const startNewGame = () => {
    setScore(0);
    playerYRef.current = 320;
    playerVyRef.current = 0;
    isGroundedRef.current = true;
    obstaclesRef.current = [];

    for (let i = 1; i <= 10; i++) {
      obstaclesRef.current.push({
        x: 400 + i * 280,
        type: Math.random() < 0.6 ? 'spike' : 'block'
      });
    }

    setGameState('playing');
    if (soundOn) gameSound.playStart();
  };

  const jump = () => {
    if (gameState !== 'playing') return;
    if (isGroundedRef.current) {
      playerVyRef.current = -12;
      isGroundedRef.current = false;
      if (soundOn) gameSound.playJump();
    }
  };

  useEffect(() => {
    if (gameState !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w') {
        jump();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    const loop = () => {
      const w = canvas.width;
      const h = canvas.height;
      const groundY = 350;

      ctx.fillStyle = '#0a0d18';
      ctx.fillRect(0, 0, w, h);

      // Neon Ground Floor
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, groundY, w, h - groundY);
      ctx.strokeStyle = '#00f3ff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      ctx.lineTo(w, groundY);
      ctx.stroke();

      // Gravity & Physics
      playerVyRef.current += 0.65;
      playerYRef.current += playerVyRef.current;

      if (playerYRef.current >= groundY - 30) {
        playerYRef.current = groundY - 30;
        playerVyRef.current = 0;
        isGroundedRef.current = true;
      }

      // Move & Draw Obstacles
      let gameOverHit = false;

      obstaclesRef.current.forEach((obs) => {
        obs.x -= 6.5;

        if (obs.x < -40) {
          obs.x = w + Math.random() * 200 + 200;
          obs.type = Math.random() < 0.6 ? 'spike' : 'block';
          setScore((s) => {
            const ns = s + 10;
            if (ns > highScore) {
              setHighScore(ns);
              localStorage.setItem('geometry_dash_high_score', ns.toString());
            }
            return ns;
          });
        }

        if (obs.type === 'spike') {
          // Spike Triangle
          ctx.fillStyle = '#ff0055';
          ctx.shadowColor = '#ff0055';
          ctx.shadowBlur = 12;

          ctx.beginPath();
          ctx.moveTo(obs.x, groundY);
          ctx.lineTo(obs.x + 20, groundY - 35);
          ctx.lineTo(obs.x + 40, groundY);
          ctx.closePath();
          ctx.fill();

          // Hitbox check
          if (obs.x < 125 && obs.x + 35 > 95 && playerYRef.current > groundY - 40) {
            gameOverHit = true;
          }
        } else {
          // Block Box
          ctx.fillStyle = '#38bdf8';
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 10;
          ctx.fillRect(obs.x, groundY - 35, 35, 35);

          if (obs.x < 125 && obs.x + 35 > 95 && playerYRef.current > groundY - 45) {
            gameOverHit = true;
          }
        }
      });

      if (gameOverHit) {
        setGameState('gameover');
        if (soundOn) gameSound.playGameOver();
        return;
      }

      // Draw Player Cube
      ctx.save();
      ctx.fillStyle = '#ffe600';
      ctx.shadowColor = '#ffe600';
      ctx.shadowBlur = 15;

      ctx.fillRect(100, playerYRef.current, 30, 30);

      // Inner Eye
      ctx.fillStyle = '#000000';
      ctx.fillRect(118, playerYRef.current + 8, 6, 6);

      ctx.restore();

      animFrameRef.current = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [gameState, soundOn, highScore]);

  return (
    <div className="w-full max-w-2xl mx-auto bg-[#0a0e1a] border border-cyan-500/30 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col items-center">
      <div className="w-full flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap className="text-cyan-400 w-6 h-6 animate-pulse" />
          <h3 className="text-lg font-black text-white tracking-wide">Geometry Dash Lite</h3>
        </div>
        <button
          onClick={() => setSoundOn(!soundOn)}
          className="p-1.5 rounded-xl bg-slate-900 border border-slate-700 text-cyan-400 hover:text-white transition"
        >
          {soundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>
      </div>

      <div
        onClick={jump}
        className="relative w-full aspect-[4/3] bg-black rounded-2xl overflow-hidden border border-cyan-500/40 shadow-inner cursor-pointer select-none"
      >
        <canvas ref={canvasRef} width={600} height={450} className="w-full h-full" />

        {gameState === 'idle' && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center pointer-events-auto">
            <Zap size={48} className="text-cyan-400 mb-3 animate-bounce" />
            <h4 className="text-xl font-extrabold text-white mb-1">জিডিওমেট্রি ড্যাশ</h4>
            <p className="text-xs text-cyan-300 max-w-sm mb-6 leading-relaxed">
              স্ক্রিনে ট্যাপ বা স্পেসবার চেপে লাফিয়ে স্পাইক ও ব্লক বাধা অতিক্রম করুন!
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
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fade-in pointer-events-auto">
            <h4 className="text-2xl font-black text-rose-500 mb-2">স্পাইকে ধাক্কা লেগেছে!</h4>
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

      <div className="w-full flex items-center justify-between mt-3 text-xs text-gray-400 font-mono">
        <div>স্কোর: <span className="text-cyan-400 font-bold">{score}</span></div>
        <div>হাই স্কোর: <span className="text-amber-400 font-bold">{highScore}</span></div>
      </div>
    </div>
  );
};
