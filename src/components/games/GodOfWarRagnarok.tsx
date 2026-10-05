import React, { useRef, useEffect, useState } from 'react';
import { RotateCcw, Volume2, VolumeX, Flame, Shield, Heart } from 'lucide-react';
import { gameSound } from '../../utils/gameSound';

interface DraugrEnemy {
  id: number;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  speed: number;
  frozen: boolean;
}

export const GodOfWarRagnarok: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [kratosHp, setKratosHp] = useState(100);
  const [rage, setRage] = useState(100);
  const [enemiesSlain, setEnemiesSlain] = useState(0);
  const [highScore, setHighScore] = useState(() => parseInt(localStorage.getItem('gow_ragnarok_high_score') || '0', 10));
  const [gameState, setGameState] = useState<'playing' | 'gameover'>('playing');
  const [soundOn, setSoundOn] = useState(true);

  // Leviathan Axe Physics
  const axeRef = useRef({
    x: 180,
    y: 300,
    vx: 0,
    vy: 0,
    rotation: 0,
    isThrown: false,
    isRecalling: false
  });

  const enemiesRef = useRef<DraugrEnemy[]>([]);
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

  const spawnEnemy = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = canvas.width || 600;
    const h = canvas.height || 600;

    enemiesRef.current.push({
      id: Math.random(),
      x: w + 50,
      y: h * 0.72 - 35,
      hp: 40,
      maxHp: 40,
      speed: Math.random() * 1.5 + 2.2,
      frozen: false
    });
  };

  const startNewGame = () => {
    gameSound.init();
    setKratosHp(100);
    setRage(100);
    setEnemiesSlain(0);
    resizeCanvas();

    const canvas = canvasRef.current;
    const h = canvas?.height || 600;

    axeRef.current = {
      x: 180,
      y: h * 0.72 - 45,
      vx: 0,
      vy: 0,
      rotation: 0,
      isThrown: false,
      isRecalling: false
    };

    enemiesRef.current = [];
    spawnEnemy();
    setGameState('playing');
    if (soundOn) gameSound.playStart();
  };

  const throwOrRecallAxe = () => {
    if (gameState !== 'playing') return;
    const axe = axeRef.current;

    if (!axe.isThrown && !axe.isRecalling) {
      // Throw Axe Forward
      axe.isThrown = true;
      axe.vx = 18;
      axe.vy = 0;
      if (soundOn) gameSound.playBladeHit();
    } else if (axe.isThrown && !axe.isRecalling) {
      // Recall Axe Backward
      axe.isRecalling = true;
      if (soundOn) gameSound.playBladeClank();
    }
  };

  const activateSpartanRage = () => {
    if (gameState !== 'playing' || rage < 50) return;
    setRage(0);
    if (soundOn) gameSound.playScore();

    // Kill all on-screen Draugr with fire burst
    enemiesRef.current.forEach(e => {
      e.hp = 0;
      e.x = -300;
      setEnemiesSlain(s => s + 1);
    });
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
      if (e.key === ' ' || e.key.toLowerCase() === 'k' || e.key.toLowerCase() === 'j') throwOrRecallAxe();
      if (e.key.toLowerCase() === 'r' || e.key.toLowerCase() === 'f') activateSpartanRage();
    };

    window.addEventListener('keydown', handleKeyDown);

    let frame = 0;

    const loop = () => {
      const w = canvas.width;
      const h = canvas.height;
      const groundY = h * 0.72;
      const kratosX = 160;
      const kratosY = groundY - 45;
      const axe = axeRef.current;
      frame++;

      // Rage build up
      setRage(r => Math.min(100, r + 0.18));

      // Snows of Midgard Background
      const snowGrad = ctx.createLinearGradient(0, 0, 0, h);
      snowGrad.addColorStop(0, '#0f172a');
      snowGrad.addColorStop(0.5, '#1e293b');
      snowGrad.addColorStop(1, '#0c1929');
      ctx.fillStyle = snowGrad;
      ctx.fillRect(0, 0, w, h);

      // Distant Nordic Mountain Peaks
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      ctx.lineTo(w * 0.3, groundY - 120);
      ctx.lineTo(w * 0.65, groundY - 180);
      ctx.lineTo(w, groundY - 80);
      ctx.lineTo(w, groundY);
      ctx.fill();

      // Snowy Ground
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(0, groundY, w, h - groundY);
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(0, groundY + 8, w, 4);

      // Spawn Draugr
      if (frame % 75 === 0 && enemiesRef.current.length < 4) {
        spawnEnemy();
      }

      // Update Leviathan Axe
      if (axe.isThrown && !axe.isRecalling) {
        axe.x += axe.vx;
        axe.rotation += 0.45;
        if (axe.x > w - 40) {
          axe.isRecalling = true; // Auto-recall at edge
        }
      } else if (axe.isRecalling) {
        axe.rotation -= 0.55;
        const dx = kratosX + 15 - axe.x;
        const dy = kratosY - axe.y;
        axe.x += dx * 0.22;
        axe.y += dy * 0.22;

        if (Math.hypot(dx, dy) < 25) {
          axe.isThrown = false;
          axe.isRecalling = false;
          axe.x = kratosX + 15;
          axe.y = kratosY;
          axe.rotation = 0;
          if (soundOn) gameSound.playBladeHit();
        }
      } else {
        axe.x = kratosX + 15;
        axe.y = kratosY;
      }

      // Update & Draw Draugr Enemies
      enemiesRef.current.forEach((enemy) => {
        if (!enemy.frozen) {
          enemy.x -= enemy.speed;
        }

        // Draw Draugr (Norse Ice Undead)
        ctx.save();
        ctx.translate(enemy.x, enemy.y);

        ctx.fillStyle = '#38bdf8';
        ctx.shadowColor = '#00f3ff';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(-18, -32, 36, 48, 6) : ctx.rect(-18, -32, 36, 48);
        ctx.fill();

        // Glowing Blue Eyes
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-6, -20, 3, 0, Math.PI * 2);
        ctx.arc(6, -20, 3, 0, Math.PI * 2);
        ctx.fill();

        // Health bar
        const hpRatio = Math.max(0, enemy.hp / enemy.maxHp);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(-18, -42, 36 * hpRatio, 4);
        ctx.restore();

        // Axe Hit Check (Both on throw AND on recall!)
        if (axe.isThrown || axe.isRecalling) {
          if (Math.hypot(axe.x - enemy.x, axe.y - enemy.y) < 45) {
            enemy.hp -= axe.isRecalling ? 35 : 22; // Recalling axe deals heavy damage!
            enemy.frozen = true;
            setTimeout(() => { enemy.frozen = false; }, 600);

            if (enemy.hp <= 0) {
              enemy.x = -300;
              setEnemiesSlain(s => {
                const ns = s + 1;
                if (ns > highScore) {
                  setHighScore(ns);
                  localStorage.setItem('gow_ragnarok_high_score', ns.toString());
                }
                return ns;
              });
              if (soundOn) gameSound.playScore();
            } else {
              if (soundOn) gameSound.playBladeHit();
            }
          }
        }

        // Draugr hits Kratos
        if (enemy.x <= kratosX + 30 && enemy.x >= kratosX - 25) {
          enemy.x = -200;
          setKratosHp(hp => {
            const nhp = hp - 25;
            if (nhp <= 0) {
              setGameState('gameover');
              if (soundOn) gameSound.playGameOver();
              return 0;
            } else {
              if (soundOn) gameSound.playBladeClank();
              return nhp;
            }
          });
        }
      });
      enemiesRef.current = enemiesRef.current.filter(e => e.x > -100);

      // Draw Kratos (Tattooed Spartan Warrior)
      ctx.save();
      ctx.translate(kratosX, kratosY);

      // Armor Body
      ctx.fillStyle = '#64748b';
      ctx.fillRect(-16, -22, 32, 44);

      // Red Spartan Tattoo on Shoulder
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(-14, -20, 8, 18);

      // Head & Beard
      ctx.fillStyle = '#fed7aa';
      ctx.beginPath();
      ctx.arc(0, -32, 12, 0, Math.PI * 2);
      ctx.fill();

      // Dark Beard
      ctx.fillStyle = '#451a03';
      ctx.fillRect(-8, -26, 16, 12);
      ctx.restore();

      // Draw Leviathan Axe (Glowing Frost Blue)
      ctx.save();
      ctx.translate(axe.x, axe.y);
      ctx.rotate(axe.rotation);

      // Axe Handle
      ctx.fillStyle = '#78350f';
      ctx.fillRect(-4, -18, 8, 36);

      // Glowing Frost Axe Blade
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#00f3ff';
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.moveTo(4, -18);
      ctx.lineTo(24, -28);
      ctx.lineTo(24, -6);
      ctx.closePath();
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

  const handleCanvasClick = () => {
    throwOrRecallAxe();
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-black overflow-hidden select-none">
      <div className="relative w-full h-full overflow-hidden bg-black flex flex-col items-center justify-center touch-none">
        <canvas ref={canvasRef} onClick={handleCanvasClick} className="w-full h-full block cursor-pointer touch-none" />

        {/* God of War HUD */}
        {gameState === 'playing' && (
          <div className="absolute top-4 left-4 z-10 flex items-center gap-3 bg-slate-950/85 px-4 py-2 rounded-2xl border border-cyan-500/30 backdrop-blur-md shadow-xl font-serif text-xs text-white pointer-events-auto">
            <div className="text-red-500 font-bold flex items-center gap-1">
              <Heart size={14} />
              <span>KRATOS HP: {kratosHp}%</span>
            </div>
            <span className="text-slate-700">|</span>
            <div className="text-cyan-400 font-bold">DRAUGR SLAIN: {enemiesSlain}</div>
            <span className="text-slate-700">|</span>
            <div className="text-amber-400 font-bold flex items-center gap-1">
              <Flame size={14} />
              <span>RAGE: {Math.floor(rage)}%</span>
            </div>
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
              {soundOn ? <Volume2 size={15} className="text-cyan-400" /> : <VolumeX size={15} className="text-rose-400" />}
            </button>
          </div>
        )}

        {/* Action Controls (Throw/Recall Axe & Spartan Rage) */}
        {gameState === 'playing' && (
          <div className="absolute bottom-5 right-4 z-20 flex items-center gap-3 pointer-events-auto">
            <button
              onClick={(e) => { e.stopPropagation(); activateSpartanRage(); }}
              disabled={rage < 50}
              className={`px-6 py-4 rounded-2xl font-black text-xs flex items-center gap-1.5 shadow-2xl transition active:scale-95 cursor-pointer touch-manipulation ${
                rage >= 50 ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-red-600/50 animate-pulse' : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Flame size={18} />
              <span>স্পার্টান রেজ (RAGE)</span>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); throwOrRecallAxe(); }}
              className="px-7 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-2xl shadow-cyan-500/50 active:scale-95 cursor-pointer touch-manipulation"
            >
              <span>🪓 কুঠার নিক্ষেপ / রিকল (AXE)</span>
            </button>
          </div>
        )}

        {/* Game Over Screen */}
        {gameState === 'gameover' && (
          <div 
            onClick={startNewGame}
            className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-30 cursor-pointer pointer-events-auto"
          >
            <h3 className="text-4xl font-black text-red-600 mb-2 font-serif uppercase tracking-widest">FALLEN IN VALHALLA</h3>
            <p className="text-lg text-cyan-400 mb-1 font-serif">নিহত ড্রাউগার: {enemiesSlain} টি</p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                startNewGame();
              }}
              className="px-10 py-3.5 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-sm transition shadow-lg shadow-cyan-500/40 flex items-center gap-2 active:scale-95 animate-pulse cursor-pointer font-serif"
            >
              <RotateCcw size={18} />
              <span>আবার যুদ্ধ করুন (RETRY)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
