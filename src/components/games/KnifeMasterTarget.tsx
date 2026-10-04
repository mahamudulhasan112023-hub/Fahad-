import React, { useRef, useEffect, useState } from 'react';
import { Play, RotateCcw, Volume2, VolumeX, Trophy, Target } from 'lucide-react';
import { gameSound } from '../../utils/gameSound';

export const KnifeMasterTarget: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('knife_master_high_score') || '0', 10);
  });
  const [knivesLeft, setKnivesLeft] = useState(7);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [soundOn, setSoundOn] = useState(true);

  const wheelAngleRef = useRef(0);
  const stuckKnivesRef = useRef<number[]>([]); // angles of stuck knives
  const flyingKnifeYRef = useRef<number | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const startNewGame = () => {
    setScore(0);
    setKnivesLeft(7);
    wheelAngleRef.current = 0;
    stuckKnivesRef.current = [];
    flyingKnifeYRef.current = null;
    setGameState('playing');
    if (soundOn) gameSound.playStart();
  };

  const throwKnife = () => {
    if (gameState !== 'playing' || flyingKnifeYRef.current !== null) return;
    flyingKnifeYRef.current = 360;
    if (soundOn) gameSound.playBladeHit();
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
      const cy = 150;
      const radius = 65;

      ctx.fillStyle = '#060a17';
      ctx.fillRect(0, 0, w, h);

      // Rotate Wheel
      wheelAngleRef.current += 0.035;

      // Draw Rotating Log Wheel
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(wheelAngleRef.current);

      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 4;
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 15;

      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Log inner rings
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, radius - 18, 0, Math.PI * 2);
      ctx.stroke();

      // Draw Stuck Knives on wheel
      stuckKnivesRef.current.forEach((angle) => {
        ctx.save();
        ctx.rotate(angle);
        ctx.fillStyle = '#ef4444';
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 10;

        ctx.fillRect(-3, radius, 6, 45);
        ctx.restore();
      });

      ctx.restore();

      // Flying Knife logic
      if (flyingKnifeYRef.current !== null) {
        flyingKnifeYRef.current -= 22;

        if (flyingKnifeYRef.current <= cy + radius) {
          // Check collision with existing stuck knives
          const hitAngle = -wheelAngleRef.current + Math.PI / 2;
          let hitStuck = false;

          stuckKnivesRef.current.forEach((stuckA) => {
            let diff = Math.abs(((stuckA - hitAngle + Math.PI) % (Math.PI * 2)) - Math.PI);
            if (diff < 0.25) {
              hitStuck = true;
            }
          });

          if (hitStuck) {
            setGameState('gameover');
            if (soundOn) gameSound.playBladeClank();
            return;
          }

          // Successfully pinned knife!
          stuckKnivesRef.current.push(hitAngle);
          flyingKnifeYRef.current = null;

          setKnivesLeft((k) => {
            const nextK = k - 1;
            if (nextK <= 0) {
              // Level cleared!
              if (soundOn) gameSound.playScore();
              stuckKnivesRef.current = [];
              return 8;
            }
            return nextK;
          });

          setScore((s) => {
            const ns = s + 10;
            if (ns > highScore) {
              setHighScore(ns);
              localStorage.setItem('knife_master_high_score', ns.toString());
            }
            return ns;
          });

          if (soundOn) gameSound.playSmash();
        } else {
          // Draw Flying Knife
          ctx.save();
          ctx.fillStyle = '#38bdf8';
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 15;
          ctx.fillRect(cx - 3, flyingKnifeYRef.current, 6, 45);
          ctx.restore();
        }
      }

      // Draw Ready Knife at bottom if not flying
      if (flyingKnifeYRef.current === null) {
        ctx.save();
        ctx.fillStyle = '#38bdf8';
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 15;
        ctx.fillRect(cx - 3, 360, 6, 45);
        ctx.restore();
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [gameState, soundOn, highScore]);

  return (
    <div className="w-full max-w-2xl mx-auto bg-[#0a0e1a] border border-amber-500/30 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col items-center">
      <div className="w-full flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target className="text-amber-400 w-6 h-6 animate-pulse" />
          <h3 className="text-lg font-black text-white tracking-wide">Knife Master Target</h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-amber-400 bg-amber-950/50 border border-amber-500/30 px-3 py-1 rounded-full font-bold">
            🔪 বাকি: {knivesLeft}
          </span>
          <button
            onClick={() => setSoundOn(!soundOn)}
            className="p-1.5 rounded-xl bg-slate-900 border border-slate-700 text-amber-400 hover:text-white transition"
          >
            {soundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
        </div>
      </div>

      <div
        onClick={throwKnife}
        className="relative w-full aspect-[4/3] bg-black rounded-2xl overflow-hidden border border-amber-500/40 shadow-inner select-none cursor-none game-playing-active"
      >
        <canvas ref={canvasRef} width={600} height={450} className="w-full h-full cursor-none" />

        {gameState === 'idle' && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center pointer-events-auto">
            <Target size={48} className="text-amber-400 mb-3 animate-bounce" />
            <h4 className="text-xl font-extrabold text-white mb-1">নাইফ হিট মাস্টার</h4>
            <p className="text-xs text-amber-300 max-w-sm mb-6 leading-relaxed">
              স্ক্রিনে ক্লিক বা ট্যাপ করে ঘুরে থাকা চাকতিতে চাকু মারুন! আগের চাকুর সাথে আঘাত লাগা যাবে না।
            </p>
            <button
              onClick={startNewGame}
              className="px-6 py-2.5 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm transition shadow-lg shadow-amber-500/30 flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Play size={16} fill="currentColor" />
              <span>চাকু মারা শুরু করুন</span>
            </button>
          </div>
        )}

        {gameState === 'gameover' && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fade-in pointer-events-auto">
            <h4 className="text-2xl font-black text-rose-500 mb-2">আগের চাকুতে আঘাত লেগেছে!</h4>
            <p className="text-sm text-gray-300 mb-1">আপনার স্কোয়ার: <span className="font-bold text-amber-400">{score}</span></p>
            <p className="text-xs text-amber-400 mb-6 flex items-center gap-1">
              <Trophy size={14} /> সেরা স্কোর: {highScore}
            </p>
            <button
              onClick={startNewGame}
              className="px-6 py-2.5 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm transition shadow-lg shadow-amber-500/30 flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <RotateCcw size={16} />
              <span>আবার চেষ্টা করুন</span>
            </button>
          </div>
        )}
      </div>

      <div className="w-full flex items-center justify-between mt-3 text-xs text-gray-400 font-mono">
        <div>স্কোর: <span className="text-amber-400 font-bold">{score}</span></div>
        <div>হাই স্কোর: <span className="text-amber-400 font-bold">{highScore}</span></div>
      </div>
    </div>
  );
};
