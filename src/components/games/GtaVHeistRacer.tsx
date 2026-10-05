import React, { useRef, useEffect, useState } from 'react';
import { RotateCcw, Volume2, VolumeX, Car, Zap, Shield, DollarSign } from 'lucide-react';
import { gameSound } from '../../utils/gameSound';

interface TrafficCar {
  id: number;
  lane: number;
  y: number;
  speed: number;
  color: string;
  isPolice: boolean;
}

interface CashDrop {
  id: number;
  lane: number;
  y: number;
  collected: boolean;
}

export const GtaVHeistRacer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [cash, setCash] = useState(0);
  const [wantedStars, setWantedStars] = useState(3);
  const [armor, setArmor] = useState(100);
  const [highScore, setHighScore] = useState(() => parseInt(localStorage.getItem('gtav_high_score') || '0', 10));
  const [gameState, setGameState] = useState<'playing' | 'gameover'>('playing');
  const [soundOn, setSoundOn] = useState(true);
  const [hasNos, setHasNos] = useState(true);

  // Player state: 3 lanes (0: left, 1: center, 2: right)
  const playerRef = useRef({
    lane: 1,
    currentX: 0,
    nosActive: false,
    nosTimer: 0
  });

  const trafficRef = useRef<TrafficCar[]>([]);
  const cashDropsRef = useRef<CashDrop[]>([]);
  const roadOffsetRef = useRef(0);
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

  const startNewGame = () => {
    gameSound.init();
    setCash(0);
    setArmor(100);
    setWantedStars(3);
    setHasNos(true);
    resizeCanvas();

    playerRef.current = {
      lane: 1,
      currentX: 0,
      nosActive: false,
      nosTimer: 0
    };

    trafficRef.current = [];
    cashDropsRef.current = [];
    setGameState('playing');
    if (soundOn) gameSound.playStart();
  };

  const moveLeft = () => {
    if (gameState !== 'playing') return;
    playerRef.current.lane = Math.max(0, playerRef.current.lane - 1);
    if (soundOn) gameSound.playPop();
  };

  const moveRight = () => {
    if (gameState !== 'playing') return;
    playerRef.current.lane = Math.min(2, playerRef.current.lane + 1);
    if (soundOn) gameSound.playPop();
  };

  const activateNos = () => {
    if (gameState !== 'playing' || !hasNos) return;
    playerRef.current.nosActive = true;
    playerRef.current.nosTimer = 80;
    setHasNos(false);
    if (soundOn) gameSound.playScore();
    setTimeout(() => {
      setHasNos(true);
    }, 4500);
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

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') moveLeft();
      if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') moveRight();
      if (e.key === ' ' || e.key === 'ArrowUp' || e.key.toLowerCase() === 'w') activateNos();
    };

    window.addEventListener('keydown', handleKeyDown);

    let frame = 0;

    const loop = () => {
      const w = canvas.width;
      const h = canvas.height;
      const roadWidth = Math.min(420, w - 30);
      const roadLeft = (w - roadWidth) / 2;
      const roadRight = roadLeft + roadWidth;
      const laneStep = roadWidth / 3;
      const p = playerRef.current;

      frame++;
      const speed = p.nosActive ? 14 : 7.5;

      if (p.nosActive) {
        p.nosTimer--;
        if (p.nosTimer <= 0) p.nosActive = false;
      }

      // Calculate exact lane centers
      const targetX = roadLeft + (p.lane + 0.5) * laneStep;
      if (p.currentX === 0) p.currentX = targetX;
      p.currentX += (targetX - p.currentX) * 0.25;

      const playerY = h - 110;

      // Dark Asphalt
      ctx.fillStyle = '#0a0d16';
      ctx.fillRect(0, 0, w, h);

      // Los Santos Road
      ctx.fillStyle = '#171d2b';
      ctx.fillRect(roadLeft, 0, roadWidth, h);

      // Yellow Sidelines
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(roadLeft, 0, 5, h);
      ctx.fillRect(roadRight - 5, 0, 5, h);

      // White Dashed Center Lanes
      roadOffsetRef.current = (roadOffsetRef.current + speed) % 50;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      for (let l = 1; l < 3; l++) {
        const lx = roadLeft + l * laneStep;
        for (let y = -roadOffsetRef.current; y < h; y += 50) {
          ctx.fillRect(lx - 2, y, 4, 26);
        }
      }

      // Spawn Police & Traffic Cars
      if (frame % (p.nosActive ? 35 : 55) === 0) {
        const lane = Math.floor(Math.random() * 3);
        const isPolice = Math.random() < 0.45;
        const colors = ['#dc2626', '#2563eb', '#16a34a', '#d97706'];

        trafficRef.current.push({
          id: Math.random(),
          lane,
          y: -90,
          speed: Math.random() * 2 + 3,
          color: isPolice ? '#0f172a' : colors[Math.floor(Math.random() * colors.length)],
          isPolice
        });
      }

      // Spawn Cash Briefcases
      if (frame % 85 === 0) {
        const lane = Math.floor(Math.random() * 3);
        cashDropsRef.current.push({
          id: Math.random(),
          lane,
          y: -50,
          collected: false
        });
      }

      // Update & Draw Cash Drops
      cashDropsRef.current.forEach((cashItem) => {
        cashItem.y += speed;
        const cx = roadLeft + (cashItem.lane + 0.5) * laneStep;

        if (!cashItem.collected) {
          ctx.save();
          ctx.fillStyle = '#10b981';
          ctx.shadowColor = '#10b981';
          ctx.shadowBlur = 12;
          ctx.fillRect(cx - 15, cashItem.y - 12, 30, 24);

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 14px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('$', cx, cashItem.y + 5);
          ctx.restore();

          // Pickup check
          if (cashItem.lane === p.lane && Math.abs(cashItem.y - playerY) < 45) {
            cashItem.collected = true;
            setCash(c => {
              const nc = c + 5000;
              if (nc > highScore) {
                setHighScore(nc);
                localStorage.setItem('gtav_high_score', nc.toString());
              }
              return nc;
            });
            if (soundOn) gameSound.playScore();
          }
        }
      });
      cashDropsRef.current = cashDropsRef.current.filter(c => c.y < h + 60);

      // Update & Draw Traffic / Police Cars
      trafficRef.current.forEach((car) => {
        car.y += (speed - car.speed);
        const carX = roadLeft + (car.lane + 0.5) * laneStep;

        // Draw Car Body
        ctx.save();
        ctx.fillStyle = car.color;
        ctx.shadowColor = car.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(carX - 20, car.y - 35, 40, 70, 8) : ctx.rect(carX - 20, car.y - 35, 40, 70);
        ctx.fill();

        // Windshields
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(carX - 16, car.y - 14, 32, 16);

        // Police Siren Flasher
        if (car.isPolice) {
          ctx.fillStyle = frame % 10 < 5 ? '#ef4444' : '#3b82f6';
          ctx.shadowColor = frame % 10 < 5 ? '#ef4444' : '#3b82f6';
          ctx.shadowBlur = 16;
          ctx.fillRect(carX - 12, car.y - 2, 24, 6);
        }
        ctx.restore();

        // Crash Collision Check
        if (car.lane === p.lane && Math.abs(car.y - playerY) < 65) {
          car.y = h + 200; // Knock out car
          setArmor(a => {
            const nextA = a - 35;
            if (nextA <= 0) {
              setGameState('gameover');
              if (soundOn) gameSound.playGameOver();
              return 0;
            } else {
              if (soundOn) gameSound.playBladeClank();
              return nextA;
            }
          });
        }
      });
      trafficRef.current = trafficRef.current.filter(c => c.y < h + 120);

      // Draw Player Sports Car
      ctx.save();
      ctx.translate(p.currentX, playerY);

      // NOS flames
      if (p.nosActive) {
        ctx.fillStyle = '#00f3ff';
        ctx.shadowColor = '#00f3ff';
        ctx.shadowBlur = 25;
        ctx.beginPath();
        ctx.moveTo(-12, 35); ctx.lineTo(-16, 60 + Math.random() * 10); ctx.lineTo(-8, 35);
        ctx.moveTo(12, 35); ctx.lineTo(16, 60 + Math.random() * 10); ctx.lineTo(8, 35);
        ctx.fill();
      }

      // Sports Car Body
      ctx.fillStyle = '#eab308';
      ctx.shadowColor = '#eab308';
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(-22, -38, 44, 76, 10) : ctx.rect(-22, -38, 44, 76);
      ctx.fill();

      // Carbon Hood & Roof
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-16, -20, 32, 40);

      // Windshield & Headlights
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(-14, -16, 28, 14);

      // Headlight Beams
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.beginPath();
      ctx.moveTo(-18, -38); ctx.lineTo(-50, -140); ctx.lineTo(-5, -140); ctx.lineTo(-12, -38);
      ctx.moveTo(18, -38); ctx.lineTo(50, -140); ctx.lineTo(5, -140); ctx.lineTo(12, -38);
      ctx.fill();

      ctx.restore();

      animFrameRef.current = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [gameState, soundOn]);

  // Handle Touch Tap / Click on Canvas
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x < rect.width / 2) {
      moveLeft();
    } else {
      moveRight();
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-black overflow-hidden select-none">
      <div className="relative w-full h-full overflow-hidden bg-black flex flex-col items-center justify-center touch-none">
        <canvas ref={canvasRef} onClick={handleCanvasClick} className="w-full h-full block cursor-pointer touch-none" />

        {/* GTA V HUD Header */}
        {gameState === 'playing' && (
          <div className="absolute top-4 left-4 z-10 flex items-center gap-3 bg-slate-950/85 px-4 py-2 rounded-2xl border border-slate-800 backdrop-blur-md shadow-xl font-mono text-xs text-white pointer-events-auto">
            <div className="text-emerald-400 font-bold flex items-center gap-1">
              <DollarSign size={16} />
              <span>${cash.toLocaleString()}</span>
            </div>
            <span className="text-slate-700">|</span>
            <div className="text-amber-400 font-bold flex items-center gap-1">
              <span>WANTED:</span>
              <span className="text-yellow-400 text-sm">{'★'.repeat(wantedStars)}</span>
            </div>
            <span className="text-slate-700">|</span>
            <div className="text-sky-400 font-bold flex items-center gap-1">
              <Shield size={14} />
              <span>{armor}%</span>
            </div>
            <span className="text-slate-700">|</span>
            <button
              onClick={() => {
                setSoundOn(s => {
                  const next = !s;
                  gameSound.enabled = next;
                  return next;
                });
              }}
              className="p-1 rounded bg-slate-800 text-white hover:bg-slate-700"
            >
              {soundOn ? <Volume2 size={15} className="text-emerald-400" /> : <VolumeX size={15} className="text-rose-400" />}
            </button>
          </div>
        )}

        {/* Action Controls for Mobile & PC */}
        {gameState === 'playing' && (
          <div className="absolute bottom-5 inset-x-4 z-20 flex justify-between items-center pointer-events-none">
            <div className="flex gap-2 pointer-events-auto">
              <button
                onClick={(e) => { e.stopPropagation(); moveLeft(); }}
                className="w-16 h-16 rounded-2xl bg-slate-900/90 active:bg-amber-500 text-white font-bold text-2xl border border-amber-500/40 shadow-xl flex items-center justify-center active:scale-95 cursor-pointer touch-manipulation"
                title="বামে সরুন"
              >
                ◀
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); moveRight(); }}
                className="w-16 h-16 rounded-2xl bg-slate-900/90 active:bg-amber-500 text-white font-bold text-2xl border border-amber-500/40 shadow-xl flex items-center justify-center active:scale-95 cursor-pointer touch-manipulation"
                title="ডানে সরুন"
              >
                ▶
              </button>
            </div>
            <div className="pointer-events-auto">
              <button
                onClick={(e) => { e.stopPropagation(); activateNos(); }}
                className={`px-7 py-5 rounded-3xl font-black text-sm flex items-center gap-2 shadow-2xl transition active:scale-95 cursor-pointer touch-manipulation ${
                  hasNos
                    ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/50'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Zap size={20} />
                <span>{hasNos ? 'NOS বুস্ট!' : 'চার্জিং...'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Busted / Wasted Game Over */}
        {gameState === 'gameover' && (
          <div 
            onClick={startNewGame}
            className="absolute inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-30 cursor-pointer pointer-events-auto"
          >
            <h3 className="text-4xl font-black text-rose-600 mb-2 tracking-widest uppercase">WASTED</h3>
            <p className="text-lg text-emerald-400 mb-2 font-mono">লুট করা টাকা: ${cash.toLocaleString()}</p>
            <p className="text-xs text-slate-400 mb-6 font-mono">সর্বোচ্চ ক্যাশ: ${highScore.toLocaleString()}</p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                startNewGame();
              }}
              className="px-10 py-3.5 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm transition shadow-lg shadow-amber-500/40 flex items-center gap-2 active:scale-95 animate-pulse cursor-pointer"
            >
              <RotateCcw size={18} />
              <span>আবার খেলুন (RETRY)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
