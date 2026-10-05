import React, { useRef, useEffect, useState } from 'react';
import { RotateCcw, Volume2, VolumeX, Footprints, Flame, Sparkles } from 'lucide-react';
import { gameSound } from '../../utils/gameSound';

interface TempleHazard {
  id: number;
  lane: number; // 0, 1, 2
  z: number;
  type: 'fire_arch' | 'spike_log' | 'gold_coin';
  collected?: boolean;
}

export const TempleRunEscape: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [coins, setCoins] = useState(0);
  const [distance, setDistance] = useState(0);
  const [highScore, setHighScore] = useState(() => parseInt(localStorage.getItem('temple_run_high_score') || '0', 10));
  const [gameState, setGameState] = useState<'playing' | 'gameover'>('playing');
  const [soundOn, setSoundOn] = useState(true);

  const playerRef = useRef({
    lane: 1,
    yOffset: 0,
    vy: 0,
    isJumping: false,
    isSliding: false,
    slideTimer: 0
  });

  const hazardsRef = useRef<TempleHazard[]>([]);
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
    setDistance(0);
    resizeCanvas();

    playerRef.current = {
      lane: 1,
      yOffset: 0,
      vy: 0,
      isJumping: false,
      isSliding: false,
      slideTimer: 0
    };

    hazardsRef.current = [];
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
      p.vy = -15;
      p.isSliding = false;
      if (soundOn) gameSound.playJump();
    }
  };

  const slide = () => {
    if (gameState !== 'playing') return;
    const p = playerRef.current;
    p.isSliding = true;
    p.slideTimer = 22;
    p.isJumping = false;
    p.yOffset = 0;
    p.vy = 0;
    if (soundOn) gameSound.playBounce();
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
      if (e.key === 'ArrowDown' || e.key.toLowerCase() === 's') slide();
    };

    window.addEventListener('keydown', handleKeyDown);

    let frame = 0;

    const loop = () => {
      const w = canvas.width;
      const h = canvas.height;
      const p = playerRef.current;
      frame++;

      const curDist = Math.floor(frame * 1.3);
      setDistance(curDist);
      if (curDist > highScore) {
        setHighScore(curDist);
        localStorage.setItem('temple_run_high_score', curDist.toString());
      }

      if (p.isJumping) {
        p.yOffset += p.vy;
        p.vy += 0.8;
        if (p.yOffset >= 0) {
          p.yOffset = 0;
          p.vy = 0;
          p.isJumping = false;
        }
      }

      if (p.isSliding) {
        p.slideTimer--;
        if (p.slideTimer <= 0) p.isSliding = false;
      }

      const horizonY = h * 0.35;
      const groundY = h * 0.84;

      // Temple Ancient Jungle Backdrop
      const jungleGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
      jungleGrad.addColorStop(0, '#064e3b');
      jungleGrad.addColorStop(1, '#022c22');
      ctx.fillStyle = jungleGrad;
      ctx.fillRect(0, 0, w, horizonY);

      // Ancient Golden Sun
      ctx.fillStyle = '#f59e0b';
      ctx.shadowColor = '#fbbf24';
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.arc(w / 2, horizonY - 40, 32, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Ancient Stone Pathway Ground
      ctx.fillStyle = '#1c1917';
      ctx.fillRect(0, horizonY, w, h - horizonY);

      // 3 Perspective Temple Stone Lanes
      const pathwayTopW = Math.min(200, w * 0.38);
      const pathwayBottomW = Math.min(460, w * 0.82);

      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.moveTo(w / 2 - pathwayTopW / 2, horizonY);
      ctx.lineTo(w / 2 + pathwayTopW / 2, horizonY);
      ctx.lineTo(w / 2 + pathwayBottomW / 2, h);
      ctx.lineTo(w / 2 - pathwayBottomW / 2, h);
      ctx.closePath();
      ctx.fill();

      // Stone Planks Lines
      const speed = 1.4;
      const offset = (frame * speed * 2) % 30;
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 3;
      for (let y = horizonY + offset; y < h; y += 30) {
        const factor = (y - horizonY) / (h - horizonY);
        const curW = pathwayTopW + (pathwayBottomW - pathwayTopW) * factor;
        ctx.beginPath();
        ctx.moveTo(w / 2 - curW / 2, y);
        ctx.lineTo(w / 2 + curW / 2, y);
        ctx.stroke();
      }

      // Spawn Hazards
      if (frame % 46 === 0) {
        const lane = Math.floor(Math.random() * 3);
        const r = Math.random();
        const type = r < 0.4 ? 'gold_coin' : r < 0.7 ? 'fire_arch' : 'spike_log';
        hazardsRef.current.push({
          id: Math.random(),
          lane,
          z: 100,
          type,
          collected: false
        });
      }

      hazardsRef.current.sort((a, b) => b.z - a.z);

      // Update & Draw Hazards
      hazardsRef.current.forEach((haz) => {
        haz.z -= 1.6;

        const factor = (100 - haz.z) / 100;
        const curY = horizonY + (groundY - horizonY) * factor;
        const curPathW = pathwayTopW + (pathwayBottomW - pathwayTopW) * factor;
        const curLaneW = curPathW / 3;
        const curX = (w / 2 - curPathW / 2) + (haz.lane + 0.5) * curLaneW;
        const scale = 0.3 + factor * 0.7;

        if (haz.type === 'gold_coin' && !haz.collected) {
          ctx.save();
          ctx.translate(curX, curY - 20 * scale);
          ctx.fillStyle = '#eab308';
          ctx.shadowColor = '#facc15';
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(0, 0, 14 * scale, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          if (haz.z < 18 && haz.z > 0 && haz.lane === p.lane) {
            haz.collected = true;
            setCoins(c => c + 1);
            if (soundOn) gameSound.playScore();
          }
        } else if (haz.type === 'fire_arch') {
          // Fire Arch (Must Slide Under!)
          ctx.save();
          ctx.translate(curX, curY);
          ctx.fillStyle = '#ea580c';
          ctx.shadowColor = '#f97316';
          ctx.shadowBlur = 15;
          ctx.fillRect(-35 * scale, -55 * scale, 70 * scale, 18 * scale);
          ctx.fillStyle = '#78350f';
          ctx.fillRect(-35 * scale, -37 * scale, 8 * scale, 37 * scale);
          ctx.fillRect(27 * scale, -37 * scale, 8 * scale, 37 * scale);
          ctx.restore();

          if (haz.z < 18 && haz.z > 2 && haz.lane === p.lane) {
            if (!p.isSliding) {
              setGameState('gameover');
              if (soundOn) gameSound.playGameOver();
            }
          }
        } else if (haz.type === 'spike_log') {
          // Spiked Log (Must Jump Over!)
          ctx.save();
          ctx.translate(curX, curY);
          ctx.fillStyle = '#451a03';
          ctx.fillRect(-35 * scale, -18 * scale, 70 * scale, 18 * scale);
          ctx.fillStyle = '#ef4444';
          // Spikes
          ctx.beginPath();
          ctx.moveTo(-25 * scale, -18 * scale); ctx.lineTo(-20 * scale, -30 * scale); ctx.lineTo(-15 * scale, -18 * scale);
          ctx.moveTo(15 * scale, -18 * scale); ctx.lineTo(20 * scale, -30 * scale); ctx.lineTo(25 * scale, -18 * scale);
          ctx.fill();
          ctx.restore();

          if (haz.z < 18 && haz.z > 2 && haz.lane === p.lane) {
            if (!p.isJumping) {
              setGameState('gameover');
              if (soundOn) gameSound.playGameOver();
            }
          }
        }
      });
      hazardsRef.current = hazardsRef.current.filter(h => h.z > -10);

      // Draw Guy Dangerous (Temple Explorer)
      const playerLaneW = pathwayBottomW / 3;
      const playerX = (w / 2 - pathwayBottomW / 2) + (p.lane + 0.5) * playerLaneW;
      const playerY = groundY + p.yOffset;

      ctx.save();
      ctx.translate(playerX, playerY);

      if (p.isSliding) {
        ctx.fillStyle = '#d97706';
        ctx.beginPath();
        ctx.ellipse(0, -10, 24, 10, 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Explorer Vest (Khaki)
        ctx.fillStyle = '#d97706';
        ctx.fillRect(-14, -38, 28, 30);

        // Head
        ctx.fillStyle = '#fed7aa';
        ctx.beginPath(); ctx.arc(0, -48, 10, 0, Math.PI * 2); ctx.fill();

        // Fedora Explorer Hat
        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.ellipse(0, -54, 18, 5, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      animFrameRef.current = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [gameState, soundOn]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-black overflow-hidden select-none">
      <div className="relative w-full h-full overflow-hidden bg-black flex flex-col items-center justify-center touch-none">
        <canvas ref={canvasRef} className="w-full h-full block touch-none" />

        {/* Temple Run HUD */}
        {gameState === 'playing' && (
          <div className="absolute top-4 left-4 z-10 flex items-center gap-3 bg-stone-950/85 px-4 py-2 rounded-2xl border border-amber-500/30 backdrop-blur-md shadow-xl font-mono text-xs text-white pointer-events-auto">
            <div className="text-yellow-400 font-bold">কয়েন: {coins} 🪙</div>
            <span className="text-stone-700">|</span>
            <div className="text-amber-400 font-bold">দূরত্ব: {distance}m</div>
            <span className="text-stone-700">|</span>
            <button
              onClick={() => {
                setSoundOn(s => {
                  const next = !s;
                  gameSound.enabled = next;
                  return next;
                });
              }}
              className="p-1 rounded bg-stone-800 text-white hover:bg-stone-700"
            >
              {soundOn ? <Volume2 size={15} className="text-amber-400" /> : <VolumeX size={15} className="text-rose-400" />}
            </button>
          </div>
        )}

        {/* Action Controls for Mobile & PC */}
        {gameState === 'playing' && (
          <div className="absolute bottom-5 inset-x-4 z-20 flex justify-between items-center pointer-events-none">
            <div className="flex gap-2 pointer-events-auto">
              <button
                onClick={(e) => { e.stopPropagation(); moveLeft(); }}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-stone-900/90 active:bg-amber-500 text-white font-bold text-xl border border-amber-500/40 shadow-xl flex items-center justify-center active:scale-95 cursor-pointer touch-manipulation"
              >
                ◀
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); moveRight(); }}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-stone-900/90 active:bg-amber-500 text-white font-bold text-xl border border-amber-500/40 shadow-xl flex items-center justify-center active:scale-95 cursor-pointer touch-manipulation"
              >
                ▶
              </button>
            </div>
            <div className="flex gap-2 pointer-events-auto">
              <button
                onClick={(e) => { e.stopPropagation(); slide(); }}
                className="px-5 py-4 rounded-2xl bg-stone-900/90 active:bg-amber-600 text-white font-bold text-xs border border-amber-500/40 shadow-xl flex items-center gap-1 active:scale-95 cursor-pointer touch-manipulation"
              >
                <span>স্লাইড (SLIDE)</span>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); jump(); }}
                className="px-6 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 text-stone-950 font-black text-xs shadow-2xl active:scale-95 cursor-pointer touch-manipulation flex items-center gap-1"
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
            className="absolute inset-0 bg-stone-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-30 cursor-pointer pointer-events-auto"
          >
            <h3 className="text-4xl font-black text-red-500 mb-2 uppercase tracking-widest font-mono">DEMON MONKEY CAUGHT YOU!</h3>
            <p className="text-lg text-yellow-400 mb-1 font-mono">অতিক্রান্ত দূরত্ব: {distance}m</p>
            <p className="text-xs text-stone-400 mb-6 font-mono">সর্বোচ্চ রেকর্ড: {highScore}m</p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                startNewGame();
              }}
              className="px-10 py-3.5 rounded-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-sm transition shadow-lg shadow-amber-500/40 flex items-center gap-2 active:scale-95 animate-pulse cursor-pointer font-mono"
            >
              <RotateCcw size={18} />
              <span>আবার পালান (RETRY)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
