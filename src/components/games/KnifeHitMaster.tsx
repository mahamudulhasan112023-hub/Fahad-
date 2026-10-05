import React, { useRef, useEffect, useState } from 'react';
import { RotateCcw, Volume2, VolumeX, Sparkles, Sword } from 'lucide-react';
import { gameSound } from '../../utils/gameSound';

interface EmbeddedKnife {
  angle: number;
}

interface AppleTarget {
  angle: number;
  sliced: boolean;
}

export const KnifeHitMaster: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [knivesLeft, setKnivesLeft] = useState(8);
  const [stage, setStage] = useState(1);
  const [apples, setApples] = useState(0);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => parseInt(localStorage.getItem('knife_hit_high_score') || '0', 10));
  const [gameState, setGameState] = useState<'playing' | 'gameover'>('playing');
  const [soundOn, setSoundOn] = useState(true);

  // Wheel state
  const wheelRef = useRef({
    angle: 0,
    speed: 0.038,
    radius: 75
  });

  const embeddedKnivesRef = useRef<EmbeddedKnife[]>([]);
  const applesRef = useRef<AppleTarget[]>([]);
  const flyingKnifeRef = useRef<{ y: number; isFlying: boolean }>({ y: 0, isFlying: false });
  const animFrameRef = useRef<number | null>(null);

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

  const initStage = (st: number) => {
    setStage(st);
    setKnivesLeft(7 + Math.min(5, st));
    embeddedKnivesRef.current = [];
    applesRef.current = [];

    // Pre-place a couple of initial obstacle knives
    const preCount = Math.min(4, Math.floor(st / 2));
    for (let i = 0; i < preCount; i++) {
      embeddedKnivesRef.current.push({
        angle: (Math.PI * 2 * i) / preCount + Math.random() * 0.4
      });
    }

    // Place an apple
    if (Math.random() < 0.75) {
      applesRef.current.push({
        angle: Math.random() * Math.PI * 2,
        sliced: false
      });
    }

    wheelRef.current.speed = (Math.random() < 0.5 ? 1 : -1) * (0.035 + st * 0.005);
  };

  const startNewGame = () => {
    gameSound.init();
    setScore(0);
    setApples(0);
    resizeCanvas();
    initStage(1);
    setGameState('playing');
    if (soundOn) gameSound.playStart();
  };

  const throwKnife = () => {
    if (gameState !== 'playing' || flyingKnifeRef.current.isFlying || knivesLeft <= 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    flyingKnifeRef.current = {
      y: canvas.height - 110,
      isFlying: true
    };
    if (soundOn) gameSound.playPop();
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

    let frame = 0;

    const loop = () => {
      const w = canvas.width;
      const h = canvas.height;
      const wheelX = w / 2;
      const wheelY = h * 0.32;
      const wheel = wheelRef.current;
      const fk = flyingKnifeRef.current;
      frame++;

      // Rotate Wheel
      wheel.angle += wheel.speed;
      if (frame % 160 === 0) {
        // Change rotation direction dynamically
        wheel.speed = -wheel.speed;
      }

      // Dark Neon Background
      ctx.fillStyle = '#060914';
      ctx.fillRect(0, 0, w, h);

      // Subtle backdrop circular pulse
      ctx.strokeStyle = 'rgba(0, 243, 255, 0.08)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(wheelX, wheelY, wheel.radius + 60, 0, Math.PI * 2);
      ctx.stroke();

      // Draw Rotating Wooden Log Wheel
      ctx.save();
      ctx.translate(wheelX, wheelY);
      ctx.rotate(wheel.angle);

      // Wood Tree Trunk
      ctx.fillStyle = '#78350f';
      ctx.shadowColor = '#d97706';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(0, 0, wheel.radius, 0, Math.PI * 2);
      ctx.fill();

      // Tree Rings
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, wheel.radius * 0.7, 0, Math.PI * 2);
      ctx.arc(0, 0, wheel.radius * 0.4, 0, Math.PI * 2);
      ctx.stroke();

      // Draw Embedded Knives
      embeddedKnivesRef.current.forEach((k) => {
        ctx.save();
        ctx.rotate(k.angle);
        ctx.fillStyle = '#e2e8f0';
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 10;
        ctx.fillRect(-4, wheel.radius - 8, 8, 48);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-3, wheel.radius + 32, 6, 16);
        ctx.restore();
      });

      // Draw Apples on wheel
      applesRef.current.forEach((app) => {
        if (!app.sliced) {
          ctx.save();
          ctx.rotate(app.angle);
          ctx.fillStyle = '#ef4444';
          ctx.shadowColor = '#ef4444';
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(0, wheel.radius + 12, 12, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      });

      ctx.restore();

      // Update Flying Knife
      if (fk.isFlying) {
        fk.y -= 28;

        // Check if reached wheel
        if (fk.y <= wheelY + wheel.radius) {
          fk.isFlying = false;

          // Calculate current impact angle relative to wheel
          const impactAngle = (Math.PI / 2) - wheel.angle;
          const normalizedImpact = (impactAngle % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);

          // Check if hit another knife!
          let hitOtherKnife = false;
          embeddedKnivesRef.current.forEach((k) => {
            const kNorm = (k.angle % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
            const diff = Math.abs(kNorm - normalizedImpact);
            const angleDiff = Math.min(diff, Math.PI * 2 - diff);
            if (angleDiff < 0.24) {
              hitOtherKnife = true;
            }
          });

          if (hitOtherKnife) {
            // Deflected! Game Over!
            setGameState('gameover');
            if (soundOn) gameSound.playBladeClank();
          } else {
            // Embedded Knife Successfully!
            embeddedKnivesRef.current.push({ angle: impactAngle });

            // Check if sliced apple
            applesRef.current.forEach((app) => {
              if (!app.sliced) {
                const aNorm = (app.angle % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
                const diff = Math.abs(aNorm - normalizedImpact);
                if (Math.min(diff, Math.PI * 2 - diff) < 0.35) {
                  app.sliced = true;
                  setApples(a => a + 1);
                  if (soundOn) gameSound.playScore();
                }
              }
            });

            setScore(s => {
              const ns = s + 10;
              if (ns > highScore) {
                setHighScore(ns);
                localStorage.setItem('knife_hit_high_score', ns.toString());
              }
              return ns;
            });

            if (soundOn) gameSound.playBladeHit();

            setKnivesLeft(kl => {
              const nextKl = kl - 1;
              if (nextKl <= 0) {
                // Stage cleared!
                setTimeout(() => {
                  initStage(stage + 1);
                  if (soundOn) gameSound.playWin();
                }, 400);
              }
              return nextKl;
            });
          }
        }
      }

      // Draw Ready / Flying Knife
      const knifeDrawY = fk.isFlying ? fk.y : h - 110;
      ctx.save();
      ctx.translate(wheelX, knifeDrawY);
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#00f3ff';
      ctx.shadowBlur = 15;
      ctx.fillRect(-5, -45, 10, 52);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-4, 7, 8, 20);
      ctx.restore();

      animFrameRef.current = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [gameState, soundOn, knivesLeft, stage]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-black overflow-hidden select-none">
      <div 
        onClick={throwKnife}
        className="relative w-full h-full overflow-hidden bg-black flex flex-col items-center justify-center cursor-pointer touch-none"
      >
        <canvas ref={canvasRef} className="w-full h-full block cursor-pointer touch-none" />

        {/* Knife Hit HUD */}
        {gameState === 'playing' && (
          <div className="absolute top-4 left-4 z-10 flex items-center gap-3 bg-slate-950/85 px-4 py-2 rounded-2xl border border-rose-500/30 backdrop-blur-md shadow-xl font-mono text-xs text-white pointer-events-auto">
            <div className="text-cyan-400 font-bold">লেভেল: {stage}</div>
            <span className="text-slate-700">|</span>
            <div className="text-rose-400 font-bold">ছুরি বাকি: {knivesLeft} 🗡️</div>
            <span className="text-slate-700">|</span>
            <div className="text-amber-400 font-bold">আপেল: {apples} 🍎</div>
            <span className="text-slate-700">|</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSoundOn(s => {
                  const next = !s;
                  gameSound.enabled = next;
                  return next;
                });
              }}
              className="p-1 rounded bg-slate-800 text-white hover:bg-slate-700"
            >
              {soundOn ? <Volume2 size={15} className="text-rose-400" /> : <VolumeX size={15} className="text-slate-500" />}
            </button>
          </div>
        )}

        {/* Big On-Screen Knife Throw Button */}
        {gameState === 'playing' && (
          <div className="absolute bottom-6 inset-x-0 mx-auto w-max z-20 pointer-events-auto">
            <button
              onClick={(e) => {
                e.stopPropagation();
                throwKnife();
              }}
              className="px-10 py-5 rounded-3xl bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-500 text-slate-950 font-black text-sm flex items-center gap-2 shadow-2xl shadow-rose-600/50 active:scale-95 cursor-pointer touch-manipulation select-none"
            >
              <Sword size={22} />
              <span>ছুরি নিক্ষেপ করুন (HIT)</span>
            </button>
          </div>
        )}

        {/* Game Over Screen */}
        {gameState === 'gameover' && (
          <div 
            onClick={startNewGame}
            className="absolute inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-30 cursor-pointer pointer-events-auto"
          >
            <h3 className="text-4xl font-black text-rose-500 mb-2 uppercase tracking-widest font-mono">DEFLECTED!</h3>
            <p className="text-lg text-amber-400 mb-1 font-mono">ফাইনাল স্কোর: {score}</p>
            <p className="text-xs text-slate-400 mb-6 font-mono">সর্বোচ্চ রেকর্ড: {highScore}</p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                startNewGame();
              }}
              className="px-10 py-3.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-black text-sm transition shadow-lg shadow-rose-600/40 flex items-center gap-2 active:scale-95 animate-pulse cursor-pointer"
            >
              <RotateCcw size={18} />
              <span>আবার ছুরি মারুন (RETRY)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
