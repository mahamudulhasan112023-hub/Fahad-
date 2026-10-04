import React, { useRef, useEffect, useState } from 'react';
import { Play, RotateCcw, Volume2, VolumeX, Trophy, Sparkles } from 'lucide-react';
import { gameSound } from '../../utils/gameSound';

const COLORS = ['#00f3ff', '#ff0055', '#ffe600', '#a855f7'];

export const ColorSwitchRush: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('color_switch_high_score') || '0', 10);
  });
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [soundOn, setSoundOn] = useState(true);

  const ballYRef = useRef(350);
  const ballVyRef = useRef(0);
  const ballColorIndexRef = useRef(0);
  const obstaclesRef = useRef<{ y: number; angle: number }[]>([]);
  const animFrameRef = useRef<number | null>(null);

  const startNewGame = () => {
    setScore(0);
    ballYRef.current = 350;
    ballVyRef.current = 0;
    ballColorIndexRef.current = Math.floor(Math.random() * COLORS.length);
    obstaclesRef.current = [];

    for (let i = 0; i < 5; i++) {
      obstaclesRef.current.push({
        y: 200 - i * 220,
        angle: 0
      });
    }

    setGameState('playing');
    if (soundOn) gameSound.playStart();
  };

  const handleJump = () => {
    if (gameState !== 'playing') return;
    ballVyRef.current = -7.5;
    if (soundOn) gameSound.playJump();
  };

  useEffect(() => {
    if (gameState !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const loop = () => {
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;

      ctx.fillStyle = '#0a0d18';
      ctx.fillRect(0, 0, w, h);

      // Ball Physics
      ballVyRef.current += 0.32; // gravity
      ballYRef.current += ballVyRef.current;

      if (ballYRef.current > h + 30) {
        setGameState('gameover');
        if (soundOn) gameSound.playGameOver();
        return;
      }

      const cameraY = ballYRef.current - 250;

      // Draw & Check Obstacles
      obstaclesRef.current.forEach((obs) => {
        obs.angle += 0.03;

        const screenY = obs.y - cameraY;
        const radius = 80;

        ctx.save();
        ctx.translate(cx, screenY);

        for (let i = 0; i < 4; i++) {
          const startA = obs.angle + (i * Math.PI) / 2;
          const endA = startA + Math.PI / 2;

          ctx.strokeStyle = COLORS[i];
          ctx.lineWidth = 14;
          ctx.shadowColor = COLORS[i];
          ctx.shadowBlur = 10;

          ctx.beginPath();
          ctx.arc(0, 0, radius, startA, endA);
          ctx.stroke();
        }
        ctx.restore();

        // Check Ball Collision with obstacle boundary
        if (Math.abs(ballYRef.current - obs.y) < 15) {
          // Check color match
          const ballColor = COLORS[ballColorIndexRef.current];
          // Top hit or bottom hit color calculation
          const passedColorIndex = Math.floor(((obs.angle % (Math.PI * 2)) + Math.PI * 2) / (Math.PI / 2)) % 4;

          if (COLORS[passedColorIndex] !== ballColor) {
            setGameState('gameover');
            if (soundOn) gameSound.playGameOver();
            return;
          } else {
            // Check scoring checkpoint
            setScore((s) => {
              const ns = s + 10;
              if (ns > highScore) {
                setHighScore(ns);
                localStorage.setItem('color_switch_high_score', ns.toString());
              }
              return ns;
            });
            // Switch ball color
            ballColorIndexRef.current = (ballColorIndexRef.current + 1) % COLORS.length;
            obs.y -= 1100; // push up
            if (soundOn) gameSound.playMerge();
          }
        }
      });

      // Draw Ball
      const screenBallY = ballYRef.current - cameraY;
      const bColor = COLORS[ballColorIndexRef.current];

      ctx.fillStyle = bColor;
      ctx.shadowColor = bColor;
      ctx.shadowBlur = 18;

      ctx.beginPath();
      ctx.arc(cx, screenBallY, 12, 0, Math.PI * 2);
      ctx.fill();

      animFrameRef.current = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [gameState, soundOn, highScore]);

  return (
    <div className="w-full max-w-2xl mx-auto bg-[#0a0e1a] border border-purple-500/30 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col items-center">
      <div className="w-full flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="text-purple-400 w-6 h-6 animate-pulse" />
          <h3 className="text-lg font-black text-white tracking-wide">Color Switch Rush</h3>
        </div>
        <button
          onClick={() => setSoundOn(!soundOn)}
          className="p-1.5 rounded-xl bg-slate-900 border border-slate-700 text-purple-400 hover:text-white transition"
        >
          {soundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>
      </div>

      <div
        onClick={handleJump}
        className="relative w-full aspect-[4/3] bg-black rounded-2xl overflow-hidden border border-purple-500/40 shadow-inner cursor-pointer select-none"
      >
        <canvas ref={canvasRef} width={600} height={450} className="w-full h-full" />

        {gameState === 'idle' && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center pointer-events-auto">
            <Sparkles size={48} className="text-purple-400 mb-3 animate-bounce" />
            <h4 className="text-xl font-extrabold text-white mb-1">কালার সুইচ রাশ</h4>
            <p className="text-xs text-purple-300 max-w-sm mb-6 leading-relaxed">
              ক্লিক বা ট্যাপ করে বলটি লাফিয়ে তুলুন! বলের সাথে রিংয়ের সঠিক রঙ মিলিয়ে পার হোন।
            </p>
            <button
              onClick={startNewGame}
              className="px-6 py-2.5 rounded-full bg-purple-500 hover:bg-purple-400 text-slate-950 font-black text-sm transition shadow-lg shadow-purple-500/30 flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Play size={16} fill="currentColor" />
              <span>খেলা শুরু করুন</span>
            </button>
          </div>
        )}

        {gameState === 'gameover' && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fade-in pointer-events-auto">
            <h4 className="text-2xl font-black text-rose-500 mb-2">ভুল রঙে লেগেছে!</h4>
            <p className="text-sm text-gray-300 mb-1">আপনার স্কোয়ার: <span className="font-bold text-purple-400">{score}</span></p>
            <p className="text-xs text-amber-400 mb-6 flex items-center gap-1">
              <Trophy size={14} /> সেরা স্কোর: {highScore}
            </p>
            <button
              onClick={startNewGame}
              className="px-6 py-2.5 rounded-full bg-purple-500 hover:bg-purple-400 text-slate-950 font-black text-sm transition shadow-lg shadow-purple-500/30 flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <RotateCcw size={16} />
              <span>আবার চেষ্টা করুন</span>
            </button>
          </div>
        )}
      </div>

      <div className="w-full flex items-center justify-between mt-3 text-xs text-gray-400 font-mono">
        <div>স্কোর: <span className="text-purple-400 font-bold">{score}</span></div>
        <div>হাই স্কোর: <span className="text-amber-400 font-bold">{highScore}</span></div>
      </div>
    </div>
  );
};
