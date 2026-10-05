import React, { useRef, useEffect, useState } from 'react';
import { RotateCcw, Volume2, VolumeX, Sparkles, RefreshCw, Trophy } from 'lucide-react';
import { gameSound } from '../../utils/gameSound';

const GRID_SIZE = 7;
type CandyType = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange' | '';

const CANDY_CONFIG: Record<string, { color: string; icon: string; shadow: string }> = {
  red: { color: '#ef4444', icon: '🍓', shadow: '#f87171' },
  blue: { color: '#3b82f6', icon: '🫐', shadow: '#60a5fa' },
  green: { color: '#10b981', icon: '🍏', shadow: '#34d399' },
  yellow: { color: '#f59e0b', icon: '🍋', shadow: '#fbbf24' },
  purple: { color: '#8b5cf6', icon: '🍇', shadow: '#a78bfa' },
  orange: { color: '#f97316', icon: '🍊', shadow: '#fb923c' },
  '': { color: 'transparent', icon: '', shadow: 'transparent' }
};

const CANDY_TYPES: ('red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange')[] = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];

export const CandyCrushRoyal: React.FC = () => {
  const [board, setBoard] = useState<CandyType[][]>([]);
  const [selectedCell, setSelectedCell] = useState<{ r: number; c: number } | null>(null);
  const [score, setScore] = useState(0);
  const [movesLeft, setMovesLeft] = useState(25);
  const [sugarCrushText, setSugarCrushText] = useState<string | null>(null);
  const [highScore, setHighScore] = useState(() => parseInt(localStorage.getItem('candy_crush_high_score') || '0', 10));
  const [soundOn, setSoundOn] = useState(true);

  // Initialize random board without initial 3-matches
  const initBoard = () => {
    const newBoard: CandyType[][] = [];
    for (let r = 0; r < GRID_SIZE; r++) {
      newBoard[r] = [];
      for (let c = 0; c < GRID_SIZE; c++) {
        let possible = [...CANDY_TYPES];
        if (r >= 2 && newBoard[r - 1][c] === newBoard[r - 2][c]) {
          possible = possible.filter(t => t !== newBoard[r - 1][c]);
        }
        if (c >= 2 && newBoard[r][c - 1] === newBoard[r][c - 2]) {
          possible = possible.filter(t => t !== newBoard[r][c - 1]);
        }
        newBoard[r][c] = possible[Math.floor(Math.random() * possible.length)];
      }
    }
    setBoard(newBoard);
  };

  const startNewGame = () => {
    gameSound.init();
    setScore(0);
    setMovesLeft(25);
    setSelectedCell(null);
    setSugarCrushText(null);
    initBoard();
    if (soundOn) gameSound.playStart();
  };

  useEffect(() => {
    startNewGame();
  }, []);

  // Match check & crush logic
  const checkAndCrushMatches = (currentBoard: CandyType[][]) => {
    const toCrush: boolean[][] = Array(GRID_SIZE).fill(false).map(() => Array(GRID_SIZE).fill(false));
    let matchFound = false;

    // Check Horizontal
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE - 2; c++) {
        const type = currentBoard[r][c];
        if (type && currentBoard[r][c + 1] === type && currentBoard[r][c + 2] === type) {
          toCrush[r][c] = true;
          toCrush[r][c + 1] = true;
          toCrush[r][c + 2] = true;
          matchFound = true;
        }
      }
    }

    // Check Vertical
    for (let c = 0; c < GRID_SIZE; c++) {
      for (let r = 0; r < GRID_SIZE - 2; r++) {
        const type = currentBoard[r][c];
        if (type && currentBoard[r + 1][c] === type && currentBoard[r + 2][c] === type) {
          toCrush[r][c] = true;
          toCrush[r + 1][c] = true;
          toCrush[r + 2][c] = true;
          matchFound = true;
        }
      }
    }

    if (!matchFound) return false;

    // Count points & collapse board
    let crushedCount = 0;
    const newBoard = currentBoard.map(row => [...row]);

    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (toCrush[r][c]) {
          crushedCount++;
          newBoard[r][c] = '' as any;
        }
      }
    }

    if (crushedCount >= 4) {
      setSugarCrushText(crushedCount >= 5 ? '🍬 COLOR BOMB! সুগার ক্র্যাশ!' : '✨ SWEET COMBO!');
      setTimeout(() => setSugarCrushText(null), 1200);
    }

    // Drop Candies down
    for (let c = 0; c < GRID_SIZE; c++) {
      let emptyRow = GRID_SIZE - 1;
      for (let r = GRID_SIZE - 1; r >= 0; r--) {
        if (newBoard[r][c] !== '') {
          newBoard[emptyRow][c] = newBoard[r][c];
          if (emptyRow !== r) newBoard[r][c] = '' as any;
          emptyRow--;
        }
      }
      for (let r = emptyRow; r >= 0; r--) {
        newBoard[r][c] = CANDY_TYPES[Math.floor(Math.random() * CANDY_TYPES.length)];
      }
    }

    setBoard(newBoard);
    setScore(s => {
      const ns = s + crushedCount * 50;
      if (ns > highScore) {
        setHighScore(ns);
        localStorage.setItem('candy_crush_high_score', ns.toString());
      }
      return ns;
    });

    if (soundOn) gameSound.playScore();

    // Cascading check
    setTimeout(() => {
      checkAndCrushMatches(newBoard);
    }, 280);

    return true;
  };

  const handleCellClick = (r: number, c: number) => {
    if (movesLeft <= 0) return;

    if (!selectedCell) {
      setSelectedCell({ r, c });
      if (soundOn) gameSound.playPop();
    } else {
      const dr = Math.abs(selectedCell.r - r);
      const dc = Math.abs(selectedCell.c - c);

      if ((dr === 1 && dc === 0) || (dr === 0 && dc === 1)) {
        // Swap adjacent
        const newBoard = board.map(row => [...row]);
        const temp = newBoard[selectedCell.r][selectedCell.c];
        newBoard[selectedCell.r][selectedCell.c] = newBoard[r][c];
        newBoard[r][c] = temp;

        const hasMatch = checkAndCrushMatches(newBoard);
        if (hasMatch) {
          setMovesLeft(m => m - 1);
        } else {
          // Revert swap if no match
          if (soundOn) gameSound.playBladeClank();
        }
      }
      setSelectedCell(null);
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#110726] p-2 select-none overflow-hidden touch-none">
      {/* Candy Crush Header HUD */}
      <div className="w-full max-w-md flex items-center justify-between bg-slate-950/80 px-4 py-2 rounded-2xl border border-pink-500/40 shadow-xl mb-3 font-mono text-xs text-white">
        <div className="flex items-center gap-1.5 text-pink-400 font-bold">
          <Sparkles size={16} />
          <span>স্কোর: {score}</span>
        </div>
        <div className="text-yellow-400 font-bold">চাল বাকি: {movesLeft}</div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              initBoard();
              if (soundOn) gameSound.playPop();
            }}
            className="p-1.5 rounded-lg bg-slate-800 text-white hover:bg-slate-700"
            title="বোর্ড শাফল করুন"
          >
            <RefreshCw size={14} />
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
            {soundOn ? <Volume2 size={14} className="text-pink-400" /> : <VolumeX size={14} className="text-rose-400" />}
          </button>
        </div>
      </div>

      {/* Sugar Crush Combo Toast */}
      {sugarCrushText && (
        <div className="absolute top-16 z-30 bg-gradient-to-r from-pink-600 via-purple-600 to-amber-500 text-white px-6 py-2 rounded-full font-black text-sm shadow-2xl animate-bounce border border-white/20">
          {sugarCrushText}
        </div>
      )}

      {/* 7x7 Candy Board */}
      <div className="grid grid-cols-7 gap-1.5 p-2.5 bg-slate-950/90 rounded-3xl border-2 border-pink-500/30 shadow-2xl max-w-[94vw] max-h-[70vh] aspect-square">
        {board.map((row, r) =>
          row.map((candy, c) => {
            const isSelected = selectedCell?.r === r && selectedCell?.c === c;
            const config = CANDY_CONFIG[candy] || CANDY_CONFIG.red;

            return (
              <button
                key={`${r}-${c}`}
                onClick={() => handleCellClick(r, c)}
                className={`w-full h-full rounded-2xl flex items-center justify-center transition-transform active:scale-90 cursor-pointer touch-manipulation shadow-md ${
                  isSelected ? 'ring-4 ring-yellow-300 scale-105 shadow-yellow-400/50' : ''
                }`}
                style={{
                  backgroundColor: config.color,
                  boxShadow: `0 4px 14px ${config.shadow}40`
                }}
              >
                <span className="text-xl sm:text-2xl filter drop-shadow">{config.icon}</span>
              </button>
            );
          })
        )}
      </div>

      {/* Game Over / Sweet Victory Screen */}
      {movesLeft <= 0 && (
        <div 
          onClick={startNewGame}
          className="absolute inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-40 cursor-pointer"
        >
          <Trophy size={60} className="text-amber-400 mb-3 animate-bounce" />
          <h3 className="text-3xl font-black text-pink-400 mb-2 uppercase">লেভেল কমপ্লিট!</h3>
          <p className="text-lg text-yellow-300 mb-1 font-mono">ফাইনাল স্কোর: {score}</p>
          <p className="text-xs text-slate-400 mb-6 font-mono">সর্বোচ্চ রেকর্ড: {highScore}</p>
          <button
            onClick={(e) => {
              e.stopPropagation();
              startNewGame();
            }}
            className="px-10 py-3.5 rounded-full bg-gradient-to-r from-pink-500 to-amber-500 hover:from-pink-400 text-slate-950 font-black text-sm transition shadow-lg shadow-pink-500/40 flex items-center gap-2 active:scale-95 animate-pulse cursor-pointer"
          >
            <RotateCcw size={18} />
            <span>পরবর্তী রাউন্ড খেলুন (NEXT LEVEL)</span>
          </button>
        </div>
      )}
    </div>
  );
};
