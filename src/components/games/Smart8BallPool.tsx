import React, { useRef, useEffect, useState } from 'react';
import { RotateCcw, Volume2, VolumeX, Sparkles, Target, Zap } from 'lucide-react';
import { gameSound } from '../../utils/gameSound';

interface Ball {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  number: number;
  isPocketed: boolean;
  isCue: boolean;
}

interface Pocket {
  x: number;
  y: number;
  radius: number;
}

export const Smart8BallPool: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState(0);
  const [ballsPocketed, setBallsPocketed] = useState(0);
  const [shotsTaken, setShotsTaken] = useState(0);
  const [power, setPower] = useState(45); // 10 to 100
  const [aimAngle, setAimAngle] = useState(0); // In radians
  const [highScore, setHighScore] = useState(() =>
    parseInt(localStorage.getItem('smart_pool_high_score') || '0', 10)
  );
  const [soundOn, setSoundOn] = useState(true);

  const ballsRef = useRef<Ball[]>([]);
  const pocketsRef = useRef<Pocket[]>([]);
  const isAimingRef = useRef(false);
  const isMovingRef = useRef(false);
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

  const setupTable = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const w = canvas.width;
    const h = canvas.height;
    const tableW = Math.min(540, w - 30);
    const tableH = Math.min(320, h * 0.5);
    const tableLeft = (w - tableW) / 2;
    const tableTop = (h - tableH) / 2;

    // 6 Pockets
    pocketsRef.current = [
      { x: tableLeft + 16, y: tableTop + 16, radius: 20 },
      { x: tableLeft + tableW / 2, y: tableTop + 12, radius: 18 },
      { x: tableLeft + tableW - 16, y: tableTop + 16, radius: 20 },
      { x: tableLeft + 16, y: tableTop + tableH - 16, radius: 20 },
      { x: tableLeft + tableW / 2, y: tableTop + tableH - 12, radius: 18 },
      { x: tableLeft + tableW - 16, y: tableTop + tableH - 16, radius: 20 }
    ];

    const balls: Ball[] = [];
    const ballRadius = 11;

    // White Cue Ball
    balls.push({
      id: 0,
      x: tableLeft + tableW * 0.28,
      y: tableTop + tableH * 0.5,
      vx: 0,
      vy: 0,
      radius: ballRadius,
      color: '#ffffff',
      number: 0,
      isPocketed: false,
      isCue: true
    });

    // Triangle Rack on right side
    const rackStartX = tableLeft + tableW * 0.72;
    const rackStartY = tableTop + tableH * 0.5;
    const colors = [
      '#eab308', '#2563eb', '#dc2626', '#7c3aed', '#f97316',
      '#16a34a', '#991b1b', '#0f172a', '#eab308', '#2563eb'
    ];

    let ballIndex = 1;
    for (let col = 0; col < 4; col++) {
      const startColY = rackStartY - (col * (ballRadius + 1));
      for (let row = 0; row <= col; row++) {
        const isEightBall = col === 2 && row === 1;
        balls.push({
          id: ballIndex,
          x: rackStartX + col * (ballRadius * 1.85),
          y: startColY + row * (ballRadius * 2 + 1),
          vx: 0,
          vy: 0,
          radius: ballRadius,
          color: isEightBall ? '#0f172a' : colors[(ballIndex - 1) % colors.length],
          number: isEightBall ? 8 : ballIndex,
          isPocketed: false,
          isCue: false
        });
        ballIndex++;
      }
    }

    ballsRef.current = balls;
  };

  const startNewGame = () => {
    gameSound.init();
    setScore(0);
    setBallsPocketed(0);
    setShotsTaken(0);
    resizeCanvas();
    setupTable();
    if (soundOn) gameSound.playStart();
  };

  const shootCueBall = () => {
    const cueBall = ballsRef.current.find(b => b.isCue && !b.isPocketed);
    if (!cueBall || isMovingRef.current) return;

    const force = (power / 100) * 18 + 4;
    cueBall.vx = Math.cos(aimAngle) * force;
    cueBall.vy = Math.sin(aimAngle) * force;

    setShotsTaken(s => s + 1);
    if (soundOn) gameSound.playPop();
  };

  useEffect(() => {
    resizeCanvas();
    startNewGame();
    const handleResize = () => {
      resizeCanvas();
      setupTable();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const loop = () => {
      const w = canvas.width;
      const h = canvas.height;
      const tableW = Math.min(540, w - 30);
      const tableH = Math.min(320, h * 0.5);
      const tableLeft = (w - tableW) / 2;
      const tableTop = (h - tableH) / 2;
      const tableRight = tableLeft + tableW;
      const tableBottom = tableTop + tableH;
      const cushionMargin = 22;

      // Dark Luxury Billiard Room Background
      ctx.fillStyle = '#060a14';
      ctx.fillRect(0, 0, w, h);

      // Wooden Table Frame
      ctx.fillStyle = '#451a03';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 25;
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(tableLeft - 18, tableTop - 18, tableW + 36, tableH + 36, 16) : ctx.rect(tableLeft - 18, tableTop - 18, tableW + 36, tableH + 36);
      ctx.fill();

      // Green Baize Felt Play Surface
      ctx.fillStyle = '#15803d';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(tableLeft, tableTop, tableW, tableH, 8) : ctx.rect(tableLeft, tableTop, tableW, tableH);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Inner Cushion Border
      ctx.strokeStyle = '#166534';
      ctx.lineWidth = 4;
      ctx.strokeRect(tableLeft + cushionMargin, tableTop + cushionMargin, tableW - cushionMargin * 2, tableH - cushionMargin * 2);

      // Draw Pockets (Deep Black with Gold Rim)
      pocketsRef.current.forEach(p => {
        ctx.fillStyle = '#020617';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 2;
        ctx.stroke();
      });

      // Update Physics for Balls
      let anyBallMoving = false;
      const balls = ballsRef.current;

      balls.forEach(b => {
        if (b.isPocketed) return;

        if (Math.hypot(b.vx, b.vy) > 0.08) {
          anyBallMoving = true;
          b.x += b.vx;
          b.y += b.vy;
          b.vx *= 0.985; // Felt friction
          b.vy *= 0.985;
        } else {
          b.vx = 0;
          b.vy = 0;
        }

        // Cushion Bounce
        const minX = tableLeft + cushionMargin + b.radius;
        const maxX = tableRight - cushionMargin - b.radius;
        const minY = tableTop + cushionMargin + b.radius;
        const maxY = tableBottom - cushionMargin - b.radius;

        if (b.x < minX) { b.x = minX; b.vx = -b.vx * 0.85; }
        if (b.x > maxX) { b.x = maxX; b.vx = -b.vx * 0.85; }
        if (b.y < minY) { b.y = minY; b.vy = -b.vy * 0.85; }
        if (b.y > maxY) { b.y = maxY; b.vy = -b.vy * 0.85; }

        // Check if ball falls into pocket
        pocketsRef.current.forEach(pocket => {
          if (Math.hypot(b.x - pocket.x, b.y - pocket.y) < pocket.radius + 2) {
            b.isPocketed = true;
            b.vx = 0;
            b.vy = 0;

            if (b.isCue) {
              // Scratch! Reset cue ball
              setTimeout(() => {
                b.isPocketed = false;
                b.x = tableLeft + tableW * 0.28;
                b.y = tableTop + tableH * 0.5;
                b.vx = 0;
                b.vy = 0;
              }, 600);
              if (soundOn) gameSound.playBladeClank();
            } else {
              setBallsPocketed(bp => bp + 1);
              setScore(s => {
                const ns = s + (b.number === 8 ? 500 : 100);
                if (ns > highScore) {
                  setHighScore(ns);
                  localStorage.setItem('smart_pool_high_score', ns.toString());
                }
                return ns;
              });
              if (soundOn) gameSound.playScore();
            }
          }
        });
      });

      // Ball-to-Ball Elastic Collisions
      for (let i = 0; i < balls.length; i++) {
        for (let j = i + 1; j < balls.length; j++) {
          const b1 = balls[i];
          const b2 = balls[j];
          if (b1.isPocketed || b2.isPocketed) continue;

          const dx = b2.x - b1.x;
          const dy = b2.y - b1.y;
          const dist = Math.hypot(dx, dy);

          if (dist < b1.radius + b2.radius && dist > 0) {
            const angle = Math.atan2(dy, dx);
            const overlap = (b1.radius + b2.radius) - dist;

            // Separate overlapping balls
            b1.x -= Math.cos(angle) * overlap * 0.5;
            b1.y -= Math.sin(angle) * overlap * 0.5;
            b2.x += Math.cos(angle) * overlap * 0.5;
            b2.y += Math.sin(angle) * overlap * 0.5;

            // Elastic velocity transfer
            const v1x = b1.vx * Math.cos(angle) + b1.vy * Math.sin(angle);
            const v1y = -b1.vx * Math.sin(angle) + b1.vy * Math.cos(angle);
            const v2x = b2.vx * Math.cos(angle) + b2.vy * Math.sin(angle);
            const v2y = -b2.vx * Math.sin(angle) + b2.vy * Math.cos(angle);

            b1.vx = v2x * Math.cos(angle) - v1y * Math.sin(angle);
            b1.vy = v2x * Math.sin(angle) + v1y * Math.cos(angle);
            b2.vx = v1x * Math.cos(angle) - v2y * Math.sin(angle);
            b2.vy = v1x * Math.sin(angle) + v2y * Math.cos(angle);

            if (soundOn && (Math.abs(v1x) > 0.5 || Math.abs(v2x) > 0.5)) {
              gameSound.playPop();
            }
          }
        }
      }

      isMovingRef.current = anyBallMoving;

      // Draw Balls
      balls.forEach(b => {
        if (b.isPocketed) return;

        ctx.save();
        ctx.translate(b.x, b.y);

        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        ctx.ellipse(2, 3, b.radius, b.radius * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Ball Body
        ctx.fillStyle = b.color;
        ctx.beginPath();
        ctx.arc(0, 0, b.radius, 0, Math.PI * 2);
        ctx.fill();

        // Specular highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.arc(-b.radius * 0.35, -b.radius * 0.35, b.radius * 0.3, 0, Math.PI * 2);
        ctx.fill();

        // Ball Number Circle
        if (!b.isCue) {
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(0, 0, b.radius * 0.5, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#0f172a';
          ctx.font = 'bold 8px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(b.number.toString(), 0, 0);
        }
        ctx.restore();
      });

      // Draw Smart Aiming Guideline & Cue Stick
      const cueBall = balls.find(b => b.isCue && !b.isPocketed);
      if (cueBall && !anyBallMoving) {
        ctx.save();

        // Laser Aim Guide Line
        ctx.strokeStyle = '#00f3ff';
        ctx.shadowColor = '#00f3ff';
        ctx.shadowBlur = 10;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(cueBall.x, cueBall.y);
        ctx.lineTo(
          cueBall.x + Math.cos(aimAngle) * 160,
          cueBall.y + Math.sin(aimAngle) * 160
        );
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.shadowBlur = 0;

        // Cue Stick
        const cueDist = 22 + (power / 100) * 20;
        const stickStartX = cueBall.x - Math.cos(aimAngle) * cueDist;
        const stickStartY = cueBall.y - Math.sin(aimAngle) * cueDist;
        const stickEndX = cueBall.x - Math.cos(aimAngle) * (cueDist + 150);
        const stickEndY = cueBall.y - Math.sin(aimAngle) * (cueDist + 150);

        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(stickStartX, stickStartY);
        ctx.lineTo(stickEndX, stickEndY);
        ctx.stroke();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(stickStartX, stickStartY);
        ctx.lineTo(stickStartX - Math.cos(aimAngle) * 12, stickStartY - Math.sin(aimAngle) * 12);
        ctx.stroke();

        ctx.restore();
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [soundOn, power, aimAngle]);

  const handlePointerAim = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / (rect.width || 1);
    const scaleY = canvas.height / (rect.height || 1);

    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    const cueBall = ballsRef.current.find(b => b.isCue && !b.isPocketed);
    if (cueBall) {
      const angle = Math.atan2(y - cueBall.y, x - cueBall.x);
      setAimAngle(angle);
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#050814] select-none overflow-hidden touch-none">
      {/* Pool Header HUD */}
      <div className="w-full max-w-lg flex items-center justify-between bg-slate-950/85 px-4 py-2 rounded-2xl border border-emerald-500/30 shadow-xl mb-2 font-mono text-xs text-white">
        <div className="text-emerald-400 font-bold flex items-center gap-1">
          <Target size={15} />
          <span>স্কোর: {score}</span>
        </div>
        <div className="text-yellow-400 font-bold">পকেট বল: {ballsPocketed}/10 🎱</div>
        <div className="text-cyan-400 font-bold">শট: {shotsTaken}</div>
        <div className="flex items-center gap-2">
          <button
            onClick={startNewGame}
            className="p-1 rounded bg-slate-800 text-white hover:bg-slate-700"
            title="নতুন টেবিল সাজান"
          >
            <RotateCcw size={14} />
          </button>
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
            {soundOn ? <Volume2 size={14} className="text-emerald-400" /> : <VolumeX size={14} className="text-rose-400" />}
          </button>
        </div>
      </div>

      {/* Billiard Table Canvas */}
      <div 
        onMouseDown={(e) => {
          isAimingRef.current = true;
          handlePointerAim(e.clientX, e.clientY);
        }}
        onMouseMove={(e) => {
          if (isAimingRef.current) handlePointerAim(e.clientX, e.clientY);
        }}
        onMouseUp={() => { isAimingRef.current = false; }}
        onTouchStart={(e) => {
          if (e.touches.length > 0) handlePointerAim(e.touches[0].clientX, e.touches[0].clientY);
        }}
        onTouchMove={(e) => {
          if (e.touches.length > 0) handlePointerAim(e.touches[0].clientX, e.touches[0].clientY);
        }}
        className="relative w-full max-w-2xl flex-grow flex items-center justify-center cursor-crosshair touch-none"
      >
        <canvas ref={canvasRef} className="w-full h-full block cursor-crosshair touch-none" />
      </div>

      {/* Controls Bar (Aim Fine-Tune, Power Slider, Shoot Button) */}
      <div className="w-full max-w-lg bg-slate-950/90 p-3 rounded-2xl border border-white/10 shadow-2xl flex items-center justify-between gap-3 mt-1 pointer-events-auto">
        {/* Aim Rotator Buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setAimAngle(a => a - 0.08)}
            className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-emerald-600 text-white font-bold text-lg flex items-center justify-center active:scale-95 cursor-pointer touch-manipulation"
            title="বামে অ্যাঙ্গেল ঘোরান"
          >
            ↺
          </button>
          <button
            onClick={() => setAimAngle(a => a + 0.08)}
            className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-emerald-600 text-white font-bold text-lg flex items-center justify-center active:scale-95 cursor-pointer touch-manipulation"
            title="ডানে অ্যাঙ্গেল ঘোরান"
          >
            ↻
          </button>
        </div>

        {/* Power Slider */}
        <div className="flex flex-col items-center flex-grow px-2">
          <div className="flex justify-between w-full text-[10px] font-mono text-slate-400 mb-1">
            <span>পাওয়ার (POWER)</span>
            <span className="text-emerald-400 font-bold">{power}%</span>
          </div>
          <input
            type="range"
            min="15"
            max="100"
            value={power}
            onChange={(e) => setPower(parseInt(e.target.value, 10))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
          />
        </div>

        {/* Shoot Button */}
        <button
          onClick={shootCueBall}
          className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-xl shadow-emerald-500/40 active:scale-95 cursor-pointer touch-manipulation"
        >
          <Zap size={16} />
          <span>স্ট্রাইক (HIT)</span>
        </button>
      </div>
    </div>
  );
};
