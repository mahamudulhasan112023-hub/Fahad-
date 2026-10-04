import React, { useRef, useEffect, useState } from 'react';
import { Play, RotateCcw, Volume2, VolumeX, Trophy, Flame } from 'lucide-react';
import { gameSound } from '../../utils/gameSound';

export const SubwayRunner: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('subway_runner_high_score') || '0', 10);
  });
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [soundOn, setSoundOn] = useState(true);

  const laneRef = useRef<number>(1); // 0: left, 1: center, 2: right
  const isJumpingRef = useRef(false);
  const jumpYRef = useRef(0);
  const obstaclesRef = useRef<{ id: number; lane: number; y: number; type: 'barrier' | 'coin' }[]>([]);
  const animFrameRef = useRef<number | null>(null);

  const startNewGame = () => {
    setScore(0);
    setCoins(0);
    laneRef.current = 1;
    isJumpingRef.current = false;
    jumpYRef.current = 0;
    obstaclesRef.current = [];
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
    let jumpVelocity = 0;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') {
        if (laneRef.current > 0) {
          laneRef.current -= 1;
          if (soundOn) gameSound.playBounce();
        }
      }
      if (e.key === 'ArrowRight' || e.key === 'd') {
        if (laneRef.current < 2) {
          laneRef.current += 1;
          if (soundOn) gameSound.playBounce();
        }
      }
      if ((e.key === 'ArrowUp' || e.key === ' ' || e.key === 'w') && !isJumpingRef.current) {
        isJumpingRef.current = true;
        jumpVelocity = 14;
        if (soundOn) gameSound.playJump();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    const loop = () => {
      const w = canvas.width;
      const h = canvas.height;

      // Dark Subway Tunnel
      ctx.fillStyle = '#080c18';
      ctx.fillRect(0, 0, w, h);

      // 3 Track Lanes
      const laneWidth = w / 3;

      for (let i = 0; i <= 3; i++) {
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(i * laneWidth, 0);
        ctx.lineTo(i * laneWidth, h);
        ctx.stroke();
      }

      // Track dashed lines
      ctx.strokeStyle = '#334155';
      ctx.setLineDash([20, 15]);
      ctx.beginPath();
      ctx.moveTo(laneWidth, 0);
      ctx.lineTo(laneWidth, h);
      ctx.moveTo(laneWidth * 2, 0);
      ctx.lineTo(laneWidth * 2, h);
      ctx.stroke();
      ctx.setLineDash([]);

      // Update Jump Physics
      if (isJumpingRef.current) {
        jumpYRef.current += jumpVelocity;
        jumpVelocity -= 0.8;
        if (jumpYRef.current <= 0) {
          jumpYRef.current = 0;
          isJumpingRef.current = false;
        }
      }

      // Spawner
      spawnTimer++;
      if (spawnTimer % 35 === 0) {
        const lane = Math.floor(Math.random() * 3);
        const isCoin = Math.random() < 0.6;
        obstaclesRef.current.push({
          id: Math.random(),
          lane,
          y: -40,
          type: isCoin ? 'coin' : 'barrier'
        });
      }

      // Move & Draw Obstacles
      let gameOverHit = false;

      obstaclesRef.current.forEach((obs) => {
        obs.y += 6 + Math.min(10, spawnTimer / 200);

        const obsX = obs.lane * laneWidth + laneWidth / 2;

        if (obs.type === 'coin') {
          ctx.fillStyle = '#f59e0b';
          ctx.shadowColor = '#f59e0b';
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(obsX, obs.y, 12, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = '#ef4444';
          ctx.shadowColor = '#ef4444';
          ctx.shadowBlur = 12;
          ctx.fillRect(obsX - 35, obs.y - 15, 70, 30);
        }

        // Collision Check near player Y (h - 80)
        if (obs.y > h - 110 && obs.y < h - 50 && obs.lane === laneRef.current) {
          if (obs.type === 'barrier' && jumpYRef.current < 25) {
            gameOverHit = true;
          } else if (obs.type === 'coin') {
            obs.y = h + 200; // consumed
            setCoins((c) => c + 1);
            setScore((s) => {
              const ns = s + 20;
              if (ns > highScore) {
                setHighScore(ns);
                localStorage.setItem('subway_runner_high_score', ns.toString());
              }
              return ns;
            });
            if (soundOn) gameSound.playScore();
          }
        }
      });

      if (gameOverHit) {
        setGameState('gameover');
        if (soundOn) gameSound.playGameOver();
        return;
      }

      // Remove offscreen
      obstaclesRef.current = obstaclesRef.current.filter((o) => o.y < h + 50);

      // Draw Player Runner
      const playerX = laneRef.current * laneWidth + laneWidth / 2;
      const playerY = h - 80 - jumpYRef.current;

      ctx.save();
      ctx.fillStyle = '#10b981';
      ctx.shadowColor = '#10b981';
      ctx.shadowBlur = 15;

      ctx.beginPath();
      ctx.arc(playerX, playerY, 20, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(playerX + 5, playerY - 4, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      setScore((s) => s + 1);
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
    if (laneRef.current < 2) {
      laneRef.current += 1;
      if (soundOn) gameSound.playBounce();
    }
  };

  const jump = () => {
    if (!isJumpingRef.current) {
      isJumpingRef.current = true;
      if (soundOn) gameSound.playJump();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-[#0a0e1a] border border-emerald-500/30 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col items-center">
      <div className="w-full flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Flame className="text-emerald-400 w-6 h-6 animate-pulse" />
          <h3 className="text-lg font-black text-white tracking-wide">Subway Runner 2D</h3>
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
            <Flame size={48} className="text-emerald-400 mb-3 animate-bounce" />
            <h4 className="text-xl font-extrabold text-white mb-1">সাবওয়ে রানার</h4>
            <p className="text-xs text-emerald-300 max-w-sm mb-6 leading-relaxed">
              ৩টি লেনে দৌড়ে লাল বাধা এড়ান, কয়েন তুলুন এবং জাম্প বাটন দিয়ে উঁচুতে লাফ দিন!
            </p>
            <button
              onClick={startNewGame}
              className="px-6 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm transition shadow-lg shadow-emerald-500/30 flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Play size={16} fill="currentColor" />
              <span>রান শুরু করুন</span>
            </button>
          </div>
        )}

        {gameState === 'gameover' && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fade-in">
            <h4 className="text-2xl font-black text-rose-500 mb-2">ধাক্কা খেয়েছেন!</h4>
            <p className="text-sm text-gray-300 mb-1">আপনার স্কোয়ার: <span className="font-bold text-emerald-400">{score}</span></p>
            <p className="text-xs text-amber-400 mb-6 flex items-center gap-1">
              <Trophy size={14} /> সেরা স্কোর: {highScore} • সংগ্রহীত কয়েন: {coins}
            </p>
            <button
              onClick={startNewGame}
              className="px-6 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm transition shadow-lg shadow-emerald-500/30 flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <RotateCcw size={16} />
              <span>আবার দৌড়ান</span>
            </button>
          </div>
        )}

        {/* Mobile Control Buttons */}
        {gameState === 'playing' && (
          <div className="absolute bottom-3 inset-x-3 flex justify-between gap-2 pointer-events-auto">
            <button
              onClick={moveLeft}
              className="flex-1 py-2.5 bg-emerald-700/80 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-lg border border-emerald-400/40 active:scale-95 cursor-pointer"
            >
              ◀ বামে
            </button>
            <button
              onClick={jump}
              className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg active:scale-95 cursor-pointer"
            >
              ⬆️ লাফ দিন
            </button>
            <button
              onClick={moveRight}
              className="flex-1 py-2.5 bg-emerald-700/80 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-lg border border-emerald-400/40 active:scale-95 cursor-pointer"
            >
              ডানে ▶
            </button>
          </div>
        )}
      </div>

      <div className="w-full flex items-center justify-between mt-3 text-xs text-gray-400 font-mono">
        <div>কয়েন: <span className="text-amber-400 font-bold">{coins}</span> | স্কোর: <span className="text-emerald-400 font-bold">{score}</span></div>
        <div>হাই স্কোর: <span className="text-amber-400 font-bold">{highScore}</span></div>
      </div>
    </div>
  );
};
