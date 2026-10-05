import React, { useRef, useEffect, useState } from 'react';
import { RotateCcw, Volume2, VolumeX, Flame, Shield, Heart } from 'lucide-react';
import { gameSound } from '../../utils/gameSound';

interface Monster {
  id: number;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  speed: number;
  name: string;
}

export const WitcherMonsterHunt: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [vitality, setVitality] = useState(100);
  const [monstersSlain, setMonstersSlain] = useState(0);
  const [potions, setPotions] = useState(3);
  const [stamina, setStamina] = useState(100);
  const [highScore, setHighScore] = useState(() => parseInt(localStorage.getItem('witcher_high_score') || '0', 10));
  const [gameState, setGameState] = useState<'playing' | 'gameover'>('playing');
  const [soundOn, setSoundOn] = useState(true);

  const playerRef = useRef({
    x: 160,
    isSwinging: false,
    swingTimer: 0
  });

  const monstersRef = useRef<Monster[]>([]);
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

  const spawnMonster = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = canvas.width || 600;
    const h = canvas.height || 600;

    const names = ['Drowner', 'Ghoul', 'Griffin', 'Wraith'];
    const name = names[Math.floor(Math.random() * names.length)];

    monstersRef.current.push({
      id: Math.random(),
      x: w + 50,
      y: h * 0.72 - 35,
      hp: 35,
      maxHp: 35,
      speed: Math.random() * 1.5 + 2.5,
      name
    });
  };

  const startNewGame = () => {
    gameSound.init();
    setVitality(100);
    setMonstersSlain(0);
    setPotions(3);
    setStamina(100);
    resizeCanvas();

    playerRef.current = {
      x: 160,
      isSwinging: false,
      swingTimer: 0
    };

    monstersRef.current = [];
    spawnMonster();
    setGameState('playing');
    if (soundOn) gameSound.playStart();
  };

  const swordSlash = () => {
    if (gameState !== 'playing') return;
    const p = playerRef.current;
    if (p.isSwinging) return;

    p.isSwinging = true;
    p.swingTimer = 18;
    if (soundOn) gameSound.playBladeHit();

    // Damage front monster with generous reach
    monstersRef.current.forEach((m) => {
      if (m.x < p.x + 160 && m.x > p.x - 30) {
        m.hp -= 20;
        if (m.hp <= 0) {
          m.x = -300;
          setMonstersSlain(s => {
            const ns = s + 1;
            if (ns > highScore) {
              setHighScore(ns);
              localStorage.setItem('witcher_high_score', ns.toString());
            }
            return ns;
          });
          if (soundOn) gameSound.playScore();
        }
      }
    });
  };

  const castIgni = () => {
    if (gameState !== 'playing' || stamina < 45) return;
    setStamina(st => st - 45);
    if (soundOn) gameSound.playBladeClank();

    monstersRef.current.forEach((m) => {
      m.hp -= 30;
      if (m.hp <= 0) {
        m.x = -300;
        setMonstersSlain(s => s + 1);
        if (soundOn) gameSound.playScore();
      }
    });
  };

  const usePotion = () => {
    if (gameState !== 'playing' || potions <= 0 || vitality >= 100) return;
    setPotions(p => p - 1);
    setVitality(v => Math.min(100, v + 50));
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
      if (e.key === ' ' || e.key.toLowerCase() === 'j') swordSlash();
      if (e.key.toLowerCase() === 'f' || e.key.toLowerCase() === 'k') castIgni();
      if (e.key.toLowerCase() === 'q') usePotion();
    };

    window.addEventListener('keydown', handleKeyDown);

    let frame = 0;

    const loop = () => {
      const w = canvas.width;
      const h = canvas.height;
      const groundY = h * 0.72;
      const p = playerRef.current;
      frame++;

      setStamina(s => Math.min(100, s + 0.35));

      // Velen Swamps Background
      const swampGrad = ctx.createLinearGradient(0, 0, 0, h);
      swampGrad.addColorStop(0, '#022c22');
      swampGrad.addColorStop(0.4, '#064e3b');
      swampGrad.addColorStop(1, '#052e16');
      ctx.fillStyle = swampGrad;
      ctx.fillRect(0, 0, w, h);

      // Dead Trees ground
      ctx.fillStyle = '#021f15';
      ctx.fillRect(0, groundY, w, h - groundY);

      // Fog layer
      ctx.fillStyle = 'rgba(16, 185, 129, 0.08)';
      ctx.fillRect(0, groundY - 80, w, 80);

      // Spawn monsters
      if (frame % 80 === 0 && monstersRef.current.length < 4) {
        spawnMonster();
      }

      // Player timers
      if (p.isSwinging) {
        p.swingTimer--;
        if (p.swingTimer <= 0) p.isSwinging = false;
      }

      // Update & Draw Monsters
      monstersRef.current.forEach((m) => {
        m.x -= m.speed;

        // Draw Monster
        ctx.save();
        ctx.translate(m.x, m.y);

        ctx.fillStyle = '#047857';
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(-20, -35, 40, 50, 8) : ctx.rect(-20, -35, 40, 50);
        ctx.fill();

        ctx.fillStyle = '#10b981';
        ctx.fillRect(-28, -10, 10, 8);
        ctx.fillRect(18, -10, 10, 8);

        ctx.fillStyle = '#ef4444';
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(-8, -25, 4, 0, Math.PI * 2);
        ctx.arc(8, -25, 4, 0, Math.PI * 2);
        ctx.fill();

        const hpRatio = Math.max(0, m.hp / m.maxHp);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(-22, -45, 44 * hpRatio, 5);
        ctx.restore();

        // Hit Witcher
        if (m.x <= p.x + 35 && m.x >= p.x - 30) {
          m.x = -200;
          setVitality(v => {
            const nv = v - 25;
            if (nv <= 0) {
              setGameState('gameover');
              if (soundOn) gameSound.playGameOver();
              return 0;
            } else {
              if (soundOn) gameSound.playBladeClank();
              return nv;
            }
          });
        }
      });
      monstersRef.current = monstersRef.current.filter(m => m.x > -100);

      // Draw Geralt
      ctx.save();
      ctx.translate(p.x, groundY - 45);

      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-14, -20, 28, 42);

      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.arc(0, -30, 12, 0, Math.PI * 2);
      ctx.fill();

      // Silver Sword
      ctx.save();
      ctx.translate(12, -8);
      ctx.rotate(p.isSwinging ? 1.2 : -0.4);
      ctx.fillStyle = '#e2e8f0';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = p.isSwinging ? 25 : 8;
      ctx.fillRect(0, -42, 6, 48);
      ctx.restore();

      ctx.restore();

      animFrameRef.current = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [gameState, soundOn]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x > rect.width * 0.4) {
      swordSlash();
    } else {
      castIgni();
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-black overflow-hidden select-none">
      <div className="relative w-full h-full overflow-hidden bg-black flex flex-col items-center justify-center touch-none">
        <canvas ref={canvasRef} onClick={handleCanvasClick} className="w-full h-full block cursor-pointer touch-none" />

        {/* Witcher HUD */}
        {gameState === 'playing' && (
          <div className="absolute top-4 left-4 z-10 flex items-center gap-3 bg-stone-950/85 px-4 py-2 rounded-2xl border border-emerald-900/50 backdrop-blur-md shadow-xl font-serif text-xs text-white pointer-events-auto">
            <div className="text-red-500 font-bold flex items-center gap-1">
              <Heart size={14} />
              <span>VITALITY: {vitality}%</span>
            </div>
            <span className="text-stone-700">|</span>
            <div className="text-amber-400 font-bold">SLAIN: {monstersSlain}</div>
            <span className="text-stone-700">|</span>
            <div className="text-yellow-400 font-bold">STAMINA: {Math.floor(stamina)}%</div>
            <span className="text-stone-700">|</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSoundOn(s => {
                  const next = !s;
                  gameSound.enabled = next;
                  return next;
                });
              }}
              className="p-1 rounded bg-stone-800 text-white hover:bg-stone-700"
            >
              {soundOn ? <Volume2 size={15} className="text-emerald-400" /> : <VolumeX size={15} className="text-rose-400" />}
            </button>
          </div>
        )}

        {/* Action Controls */}
        {gameState === 'playing' && (
          <div className="absolute bottom-5 right-4 z-20 flex items-center gap-2 pointer-events-auto">
            <button
              onClick={(e) => { e.stopPropagation(); usePotion(); }}
              disabled={potions <= 0 || vitality >= 100}
              className={`px-4 py-4 rounded-2xl font-black text-xs flex flex-col items-center shadow-xl active:scale-95 cursor-pointer touch-manipulation ${
                potions > 0 && vitality < 100 ? 'bg-emerald-600 text-white hover:bg-emerald-500' : 'bg-stone-800 text-stone-500 cursor-not-allowed'
              }`}
            >
              <span>🧪 পোশন ({potions})</span>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); castIgni(); }}
              disabled={stamina < 45}
              className={`px-5 py-4 rounded-2xl font-black text-xs flex items-center gap-1 shadow-2xl transition active:scale-95 cursor-pointer touch-manipulation ${
                stamina >= 45 ? 'bg-orange-600 hover:bg-orange-500 text-white shadow-orange-600/50' : 'bg-stone-800 text-stone-500 cursor-not-allowed'
              }`}
            >
              <Flame size={16} />
              <span>ইগনি (IGNI)</span>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); swordSlash(); }}
              className="px-6 py-4 rounded-2xl bg-gradient-to-r from-slate-200 to-slate-400 hover:from-white text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-2xl active:scale-95 cursor-pointer touch-manipulation"
            >
              <span>সিলভার সোর্ড ⚔️</span>
            </button>
          </div>
        )}

        {/* Game Over Screen */}
        {gameState === 'gameover' && (
          <div 
            onClick={startNewGame}
            className="absolute inset-0 bg-stone-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-30 cursor-pointer pointer-events-auto"
          >
            <h3 className="text-4xl font-black text-rose-600 mb-2 font-serif uppercase tracking-widest">WITCHER FALLEN</h3>
            <p className="text-lg text-emerald-400 mb-1 font-serif">শিকার করা দানব: {monstersSlain} টি</p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                startNewGame();
              }}
              className="px-10 py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm transition shadow-lg shadow-emerald-600/40 flex items-center gap-2 active:scale-95 animate-pulse cursor-pointer font-serif"
            >
              <RotateCcw size={18} />
              <span>আবার শিকারে বের হন (RETRY)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
