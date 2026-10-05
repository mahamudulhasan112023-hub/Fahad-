import React, { useRef, useEffect, useState } from 'react';
import { RotateCcw, Volume2, VolumeX, Footprints, Sparkles, Zap } from 'lucide-react';
import { gameSound } from '../../utils/gameSound';

interface SubwayObstacle {
  id: number;
  lane: number; // 0: Left, 1: Center, 2: Right
  z: number;    // Distance into screen (100 -> 0)
  type: 'train' | 'barrier' | 'coin';
  collected?: boolean;
}

export const SubwaySurfersParkour: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [coins, setCoins] = useState(0);
  const [score, setScore] = useState(0);
  const [hasHoverboard, setHasHoverboard] = useState(false);
  const [highScore, setHighScore] = useState(() => parseInt(localStorage.getItem('subway_surfers_high_score') || '0', 10));
  const [gameState, setGameState] = useState<'playing' | 'gameover'>('playing');
  const [soundOn, setSoundOn] = useState(true);

  // Player State (3 lanes: 0: Left, 1: Center, 2: Right)
  const playerRef = useRef({
    lane: 1,
    yOffset: 0,
    vy: 0,
    isJumping: false,
    isRolling: false,
    rollTimer: 0
  });

  const obstaclesRef = useRef<SubwayObstacle[]>([]);
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
    setCoins(0);
    setScore(0);
    setHasHoverboard(false);
    resizeCanvas();

    playerRef.current = {
      lane: 1,
      yOffset: 0,
      vy: 0,
      isJumping: false,
      isRolling: false,
      rollTimer: 0
    };

    obstaclesRef.current = [];
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

  const jump = () => {
    if (gameState !== 'playing') return;
    const p = playerRef.current;
    if (!p.isJumping) {
      p.isJumping = true;
      p.vy = -16;
      p.isRolling = false;
      if (soundOn) gameSound.playJump();
    }
  };

  const roll = () => {
    if (gameState !== 'playing') return;
    const p = playerRef.current;
    p.isRolling = true;
    p.rollTimer = 22;
    p.isJumping = false;
    p.yOffset = 0;
    p.vy = 0;
    if (soundOn) gameSound.playBounce();
  };

  const activateHoverboard = () => {
    setHasHoverboard(true);
    if (soundOn) gameSound.playScore();
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
      if (e.key === 'ArrowUp' || e.key === ' ' || e.key.toLowerCase() === 'w') jump();
      if (e.key === 'ArrowDown' || e.key.toLowerCase() === 's') roll();
    };

    window.addEventListener('keydown', handleKeyDown);

    let frame = 0;

    const loop = () => {
      const w = canvas.width;
      const h = canvas.height;
      const p = playerRef.current;
      frame++;

      const curScore = Math.floor(frame * 1.5);
      setScore(curScore);
      if (curScore > highScore) {
        setHighScore(curScore);
        localStorage.setItem('subway_surfers_high_score', curScore.toString());
      }

      // Jump & Roll physics
      if (p.isJumping) {
        p.yOffset += p.vy;
        p.vy += 0.85; // Gravity
        if (p.yOffset >= 0) {
          p.yOffset = 0;
          p.vy = 0;
          p.isJumping = false;
        }
      }

      if (p.isRolling) {
        p.rollTimer--;
        if (p.rollTimer <= 0) p.isRolling = false;
      }

      // 3D Perspective Subway Ground
      const horizonY = h * 0.35;
      const groundY = h * 0.85;

      // Sky
      const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
      skyGrad.addColorStop(0, '#0284c7');
      skyGrad.addColorStop(1, '#38bdf8');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, horizonY);

      // Track Ground
      ctx.fillStyle = '#334155';
      ctx.fillRect(0, horizonY, w, h - horizonY);

      // 3 Perspective Subway Tracks
      const trackWidthTop = Math.min(220, w * 0.4);
      const trackWidthBottom = Math.min(480, w * 0.85);
      const centerTopX = w / 2;
      const centerBottomX = w / 2;

      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.moveTo(centerTopX - trackWidthTop / 2, horizonY);
      ctx.lineTo(centerTopX + trackWidthTop / 2, horizonY);
      ctx.lineTo(centerBottomX + trackWidthBottom / 2, h);
      ctx.lineTo(centerBottomX - trackWidthBottom / 2, h);
      ctx.closePath();
      ctx.fill();

      // Rail Sleeper Lines
      const speed = 1.4;
      const offset = (frame * speed * 2) % 30;
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 3;
      for (let y = horizonY + offset; y < h; y += 30) {
        const factor = (y - horizonY) / (h - horizonY);
        const curW = trackWidthTop + (trackWidthBottom - trackWidthTop) * factor;
        ctx.beginPath();
        ctx.moveTo(centerTopX - curW / 2, y);
        ctx.lineTo(centerTopX + curW / 2, y);
        ctx.stroke();
      }

      // Rails
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 4;
      for (let l = 0; l <= 3; l++) {
        const tX = centerTopX - trackWidthTop / 2 + (trackWidthTop / 3) * l;
        const bX = centerBottomX - trackWidthBottom / 2 + (trackWidthBottom / 3) * l;
        ctx.beginPath();
        ctx.moveTo(tX, horizonY);
        ctx.lineTo(bX, h);
        ctx.stroke();
      }

      // Spawn Obstacles (Trains, Barriers, Gold Coins)
      if (frame % 45 === 0) {
        const lane = Math.floor(Math.random() * 3);
        const r = Math.random();
        const type = r < 0.4 ? 'coin' : r < 0.75 ? 'barrier' : 'train';
        obstaclesRef.current.push({
          id: Math.random(),
          lane,
          z: 100,
          type,
          collected: false
        });
      }

      // Sort obstacles by depth (z)
      obstaclesRef.current.sort((a, b) => b.z - a.z);

      // Update & Draw Obstacles
      obstaclesRef.current.forEach((obs) => {
        obs.z -= 1.6;

        const factor = (100 - obs.z) / 100;
        const curY = horizonY + (groundY - horizonY) * factor;
        const curTrackW = trackWidthTop + (trackWidthBottom - trackWidthTop) * factor;
        const curLaneW = curTrackW / 3;
        const curX = (w / 2 - curTrackW / 2) + (obs.lane + 0.5) * curLaneW;
        const scale = 0.3 + factor * 0.7;

        if (obs.type === 'coin' && !obs.collected) {
          // Gold Coin
          ctx.save();
          ctx.translate(curX, curY - 20 * scale);
          ctx.fillStyle = '#eab308';
          ctx.shadowColor = '#facc15';
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(0, 0, 14 * scale, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.font = `bold ${Math.floor(12 * scale)}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillText('★', 0, 4 * scale);
          ctx.restore();

          // Coin Collection Check
          if (obs.z < 18 && obs.z > 0 && obs.lane === p.lane) {
            obs.collected = true;
            setCoins(c => c + 1);
            if (soundOn) gameSound.playScore();
          }
        } else if (obs.type === 'barrier') {
          // Red High Barrier (Must Roll Under)
          ctx.save();
          ctx.translate(curX, curY);
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(-35 * scale, -55 * scale, 70 * scale, 18 * scale);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(-35 * scale, -37 * scale, 10 * scale, 37 * scale);
          ctx.fillRect(25 * scale, -37 * scale, 10 * scale, 37 * scale);
          ctx.restore();

          // Collision Check
          if (obs.z < 18 && obs.z > 2 && obs.lane === p.lane) {
            if (!p.isRolling) {
              if (hasHoverboard) {
                setHasHoverboard(false);
                obs.z = -20;
                if (soundOn) gameSound.playBladeClank();
              } else {
                setGameState('gameover');
                if (soundOn) gameSound.playGameOver();
              }
            }
          }
        } else if (obs.type === 'train') {
          // Subway Train (Must Dodge or Jump on top)
          ctx.save();
          ctx.translate(curX, curY);
          ctx.fillStyle = '#2563eb';
          ctx.beginPath();
          ctx.roundRect ? ctx.roundRect(-42 * scale, -85 * scale, 84 * scale, 85 * scale, 8) : ctx.rect(-42 * scale, -85 * scale, 84 * scale, 85 * scale);
          ctx.fill();

          // Train Headlights
          ctx.fillStyle = '#fef08a';
          ctx.shadowColor = '#fef08a';
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.arc(-22 * scale, -25 * scale, 8 * scale, 0, Math.PI * 2);
          ctx.arc(22 * scale, -25 * scale, 8 * scale, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          // Train Collision
          if (obs.z < 20 && obs.z > 2 && obs.lane === p.lane) {
            if (hasHoverboard) {
              setHasHoverboard(false);
              obs.z = -20;
              if (soundOn) gameSound.playBladeClank();
            } else {
              setGameState('gameover');
              if (soundOn) gameSound.playGameOver();
            }
          }
        }
      });
      obstaclesRef.current = obstaclesRef.current.filter(o => o.z > -10);

      // Draw Subway Runner Character (Jake Style)
      const playerFactor = 0.9;
      const playerLaneW = trackWidthBottom / 3;
      const playerX = (w / 2 - trackWidthBottom / 2) + (p.lane + 0.5) * playerLaneW;
      const playerY = groundY + p.yOffset;

      ctx.save();
      ctx.translate(playerX, playerY);

      // Hoverboard
      if (hasHoverboard) {
        ctx.fillStyle = '#ec4899';
        ctx.shadowColor = '#ec4899';
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.ellipse(0, 5, 34, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      if (p.isRolling) {
        // Rolling sphere
        ctx.fillStyle = '#3b82f6';
        ctx.beginPath();
        ctx.arc(0, -18, 18, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Body (Blue Hoodie)
        ctx.fillStyle = '#2563eb';
        ctx.fillRect(-16, -42, 32, 32);

        // Cap / Head (Red Cap Turned Backward)
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.arc(0, -52, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(-14, -50, 20, 6);

        // Legs / Sneakers
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-12, -10, 8, 14);
        ctx.fillRect(4, -10, 8, 14);
      }
      ctx.restore();

      animFrameRef.current = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [gameState, soundOn, hasHoverboard]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-black overflow-hidden select-none">
      <div className="relative w-full h-full overflow-hidden bg-black flex flex-col items-center justify-center touch-none">
        <canvas ref={canvasRef} className="w-full h-full block touch-none" />

        {/* Subway Surfers HUD */}
        {gameState === 'playing' && (
          <div className="absolute top-4 left-4 z-10 flex items-center gap-3 bg-slate-950/85 px-4 py-2 rounded-2xl border border-sky-500/30 backdrop-blur-md shadow-xl font-mono text-xs text-white pointer-events-auto">
            <div className="text-yellow-400 font-bold">কয়েন: {coins} 🪙</div>
            <span className="text-slate-700">|</span>
            <div className="text-cyan-400 font-bold">স্কোর: {score}</div>
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
              {soundOn ? <Volume2 size={15} className="text-cyan-400" /> : <VolumeX size={15} className="text-rose-400" />}
            </button>
          </div>
        )}

        {/* Action Controls for Mobile & PC */}
        {gameState === 'playing' && (
          <div className="absolute bottom-5 inset-x-4 z-20 flex justify-between items-center pointer-events-none">
            <div className="flex gap-2 pointer-events-auto">
              <button
                onClick={(e) => { e.stopPropagation(); moveLeft(); }}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-900/90 active:bg-sky-500 text-white font-bold text-xl border border-sky-500/40 shadow-xl flex items-center justify-center active:scale-95 cursor-pointer touch-manipulation"
              >
                ◀
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); moveRight(); }}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-900/90 active:bg-sky-500 text-white font-bold text-xl border border-sky-500/40 shadow-xl flex items-center justify-center active:scale-95 cursor-pointer touch-manipulation"
              >
                ▶
              </button>
            </div>
            <div className="flex gap-2 pointer-events-auto">
              <button
                onClick={(e) => { e.stopPropagation(); roll(); }}
                className="px-5 py-4 rounded-2xl bg-slate-900/90 active:bg-amber-500 text-white font-bold text-xs border border-amber-500/40 shadow-xl flex items-center gap-1 active:scale-95 cursor-pointer touch-manipulation"
              >
                <span>রোল (ROLL)</span>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); jump(); }}
                className="px-6 py-4 rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-400 text-slate-950 font-black text-xs shadow-2xl active:scale-95 cursor-pointer touch-manipulation flex items-center gap-1"
              >
                <Footprints size={18} />
                <span>লাফ দিন (JUMP)</span>
              </button>
            </div>
          </div>
        )}

        {/* Game Over Screen */}
        {gameState === 'gameover' && (
          <div 
            onClick={startNewGame}
            className="absolute inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-30 cursor-pointer pointer-events-auto"
          >
            <h3 className="text-4xl font-black text-rose-500 mb-2 uppercase tracking-widest font-mono">CAUGHT!</h3>
            <p className="text-lg text-yellow-400 mb-1 font-mono">মোট কয়েন: {coins} 🪙</p>
            <p className="text-xs text-slate-400 mb-6 font-mono">সর্বোচ্চ স্কোর: {highScore}</p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                startNewGame();
              }}
              className="px-10 py-3.5 rounded-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-sm transition shadow-lg shadow-sky-500/40 flex items-center gap-2 active:scale-95 animate-pulse cursor-pointer"
            >
              <RotateCcw size={18} />
              <span>আবার দৌড়ান (RETRY)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
