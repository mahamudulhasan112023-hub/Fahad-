import React, { useState, useEffect } from 'react';
import { RotateCcw, Volume2, VolumeX, Sparkles, Trophy, Undo2, PlusCircle } from 'lucide-react';
import { gameSound } from '../../utils/gameSound';

type LiquidColor = 'cyan' | 'magenta' | 'yellow' | 'emerald' | 'purple' | 'orange';

const COLOR_MAP: Record<LiquidColor, { bg: string; shadow: string; label: string }> = {
  cyan: { bg: '#00f3ff', shadow: '#00f3ff', label: 'নীল' },
  magenta: { bg: '#ec4899', shadow: '#f43f5e', label: 'গোলাপি' },
  yellow: { bg: '#eab308', shadow: '#facc15', label: 'হলুদ' },
  emerald: { bg: '#10b981', shadow: '#34d399', label: 'সবুজ' },
  purple: { bg: '#a855f7', shadow: '#c084fc', label: 'বেগুনি' },
  orange: { bg: '#f97316', shadow: '#fb923c', label: 'কমলা' }
};

interface Tube {
  id: number;
  layers: LiquidColor[]; // Max 4 layers per tube
}

export const WaterSortColorPuzzle: React.FC = () => {
  const [level, setLevel] = useState(1);
  const [tubes, setTubes] = useState<Tube[]>([]);
  const [selectedTubeIndex, setSelectedTubeIndex] = useState<number | null>(null);
  const [history, setHistory] = useState<Tube[][]>([]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() =>
    parseInt(localStorage.getItem('water_sort_high_score') || '0', 10)
  );
  const [isLevelWon, setIsLevelWon] = useState(false);
  const [soundOn, setSoundOn] = useState(true);

  const initLevel = (lvl: number) => {
    setIsLevelWon(false);
    setSelectedTubeIndex(null);
    setHistory([]);

    const colors: LiquidColor[] = ['cyan', 'magenta', 'yellow', 'emerald', 'purple', 'orange'];
    const activeColors = colors.slice(0, Math.min(6, 3 + Math.floor(lvl / 2)));
    const allLayers: LiquidColor[] = [];

    activeColors.forEach(c => {
      for (let i = 0; i < 4; i++) {
        allLayers.push(c);
      }
    });

    // Shuffle
    for (let i = allLayers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allLayers[i], allLayers[j]] = [allLayers[j], allLayers[i]];
    }

    const newTubes: Tube[] = [];
    for (let i = 0; i < activeColors.length; i++) {
      newTubes.push({
        id: i,
        layers: allLayers.slice(i * 4, (i + 1) * 4)
      });
    }

    // Add 2 empty tubes for pouring
    newTubes.push({ id: activeColors.length, layers: [] });
    newTubes.push({ id: activeColors.length + 1, layers: [] });

    setTubes(newTubes);
  };

  const startNewGame = () => {
    gameSound.init();
    setScore(0);
    setLevel(1);
    initLevel(1);
    if (soundOn) gameSound.playStart();
  };

  useEffect(() => {
    startNewGame();
  }, []);

  const addExtraTube = () => {
    if (tubes.length >= 8) return;
    setTubes(prev => [...prev, { id: prev.length, layers: [] }]);
    if (soundOn) gameSound.playScore();
  };

  const checkWinCondition = (currentTubes: Tube[]) => {
    const isWon = currentTubes.every(t => {
      if (t.layers.length === 0) return true;
      if (t.layers.length === 4 && t.layers.every(c => c === t.layers[0])) return true;
      return false;
    });

    if (isWon) {
      setIsLevelWon(true);
      setScore(s => {
        const ns = s + 500;
        if (ns > highScore) {
          setHighScore(ns);
          localStorage.setItem('water_sort_high_score', ns.toString());
        }
        return ns;
      });
      if (soundOn) gameSound.playWin();
    }
  };

  const handleTubeClick = (index: number) => {
    if (isLevelWon) return;

    if (selectedTubeIndex === null) {
      // Pick up tube if not empty
      if (tubes[index].layers.length > 0) {
        setSelectedTubeIndex(index);
        if (soundOn) gameSound.playPop();
      }
    } else {
      if (selectedTubeIndex === index) {
        // Deselect tube
        setSelectedTubeIndex(null);
      } else {
        // Attempt Pour from selectedTube to target tube
        const sourceTube = tubes[selectedTubeIndex];
        const targetTube = tubes[index];

        const sourceTopColor = sourceTube.layers[sourceTube.layers.length - 1];
        const targetTopColor = targetTube.layers[targetTube.layers.length - 1];

        // Valid pour if target is empty OR top colors match AND target not full (< 4)
        if (targetTube.layers.length < 4 && (!targetTopColor || targetTopColor === sourceTopColor)) {
          // Save history for undo
          setHistory(h => [...h, tubes.map(t => ({ ...t, layers: [...t.layers] }))]);

          const newTubes = tubes.map(t => ({ ...t, layers: [...t.layers] }));

          // Pour matching consecutive colors
          while (
            newTubes[selectedTubeIndex].layers.length > 0 &&
            newTubes[index].layers.length < 4 &&
            newTubes[selectedTubeIndex].layers[newTubes[selectedTubeIndex].layers.length - 1] === sourceTopColor
          ) {
            const popped = newTubes[selectedTubeIndex].layers.pop()!;
            newTubes[index].layers.push(popped);
          }

          setTubes(newTubes);
          if (soundOn) gameSound.playBounce();
          checkWinCondition(newTubes);
        } else {
          // Invalid pour
          if (soundOn) gameSound.playBladeClank();
        }
        setSelectedTubeIndex(null);
      }
    }
  };

  const undoMove = () => {
    if (history.length === 0) return;
    const last = history[history.length - 1];
    setTubes(last);
    setHistory(h => h.slice(0, -1));
    setSelectedTubeIndex(null);
    if (soundOn) gameSound.playPop();
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#070b19] p-3 select-none overflow-hidden touch-none">
      {/* Water Sort Header HUD */}
      <div className="w-full max-w-md flex items-center justify-between bg-slate-950/85 px-4 py-2 rounded-2xl border border-cyan-500/30 shadow-xl mb-4 font-mono text-xs text-white">
        <div className="text-cyan-400 font-bold flex items-center gap-1.5">
          <Sparkles size={16} />
          <span>লেভেল {level}</span>
        </div>
        <div className="text-yellow-400 font-bold">স্কোর: {score}</div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={undoMove}
            disabled={history.length === 0}
            className={`p-1.5 rounded-lg transition ${
              history.length > 0 ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-slate-900 text-slate-600'
            }`}
            title="আগের অবস্থায় ফিরুন"
          >
            <Undo2 size={14} />
          </button>
          <button
            onClick={addExtraTube}
            disabled={tubes.length >= 8}
            className="p-1.5 rounded-lg bg-slate-800 text-emerald-400 hover:bg-slate-700"
            title="অতিরিক্ত টিউব যোগ করুন"
          >
            <PlusCircle size={14} />
          </button>
          <button
            onClick={() => initLevel(level)}
            className="p-1.5 rounded-lg bg-slate-800 text-white hover:bg-slate-700"
            title="লেভেল রিস্টার্ট করুন"
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
            className="p-1.5 rounded-lg bg-slate-800 text-white hover:bg-slate-700"
          >
            {soundOn ? <Volume2 size={14} className="text-cyan-400" /> : <VolumeX size={14} className="text-rose-400" />}
          </button>
        </div>
      </div>

      {/* Test Tubes Display Grid */}
      <div className="w-full max-w-lg flex flex-wrap items-end justify-center gap-4 sm:gap-6 p-4 mb-4">
        {tubes.map((tube, index) => {
          const isSelected = selectedTubeIndex === index;

          return (
            <button
              key={tube.id}
              onClick={() => handleTubeClick(index)}
              className={`relative flex flex-col justify-end items-center rounded-b-3xl border-2 border-white/30 bg-slate-900/60 p-1 transition-all duration-200 cursor-pointer touch-manipulation ${
                isSelected
                  ? '-translate-y-4 ring-4 ring-cyan-400 shadow-xl shadow-cyan-500/40 border-cyan-300'
                  : 'hover:border-white/60'
              }`}
              style={{
                width: '52px',
                height: '160px',
                borderTop: 'none'
              }}
            >
              {/* Rim at top */}
              <div className="absolute -top-1.5 inset-x-0 mx-auto w-[56px] h-3 rounded-full border border-white/40 bg-white/10" />

              {/* Liquid Layers (bottom to top) */}
              <div className="w-full flex flex-col-reverse items-center gap-0.5 rounded-b-2xl overflow-hidden">
                {tube.layers.map((col, lIdx) => {
                  const colorConfig = COLOR_MAP[col] || COLOR_MAP.cyan;
                  return (
                    <div
                      key={lIdx}
                      className="w-full h-8 transition-all duration-300 relative shadow-inner"
                      style={{
                        backgroundColor: colorConfig.bg,
                        boxShadow: `inset 0 -2px 6px ${colorConfig.shadow}`
                      }}
                    >
                      <div className="absolute top-0 inset-x-0 h-1 bg-white/30 rounded-full" />
                    </div>
                  );
                })}
              </div>
            </button>
          );
        })}
      </div>

      {/* Helpful Instructions */}
      <div className="text-xs font-mono text-cyan-300 bg-slate-950/80 px-4 py-2 rounded-full border border-white/10 text-center max-w-sm">
        💡 এক বোতল থেকে অন্য বোতলে একই রঙের তরল ঢেলে রঙগুলো সাজান!
      </div>

      {/* Level Won Modal */}
      {isLevelWon && (
        <div 
          onClick={() => {
            const nextLvl = level + 1;
            setLevel(nextLvl);
            initLevel(nextLvl);
          }}
          className="absolute inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-40 cursor-pointer pointer-events-auto"
        >
          <Trophy size={60} className="text-yellow-400 mb-3 animate-bounce" />
          <h3 className="text-3xl font-black text-cyan-400 mb-2 uppercase">লেভেল কমপ্লিট! 🎉</h3>
          <p className="text-lg text-yellow-300 mb-1 font-mono">মোট স্কোর: {score}</p>
          <p className="text-xs text-slate-400 mb-6 font-mono">সর্বোচ্চ স্কোর: {highScore}</p>
          <button
            onClick={(e) => {
              e.stopPropagation();
              const nextLvl = level + 1;
              setLevel(nextLvl);
              initLevel(nextLvl);
            }}
            className="px-10 py-3.5 rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400 text-slate-950 font-black text-sm transition shadow-lg shadow-cyan-500/40 flex items-center gap-2 active:scale-95 animate-pulse cursor-pointer"
          >
            <RotateCcw size={18} />
            <span>পরবর্তী লেভেল খেলুন (NEXT LEVEL)</span>
          </button>
        </div>
      )}
    </div>
  );
};
