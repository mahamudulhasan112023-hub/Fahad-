import React, { useState } from 'react';
import { Play, RotateCcw, Volume2, VolumeX, Trophy, Grid } from 'lucide-react';
import { gameSound } from '../../utils/gameSound';

export const BlockBlast: React.FC = () => {
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('block_blast_high_score') || '0', 10);
  });
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [soundOn, setSoundOn] = useState(true);

  // 8x8 Grid
  const [grid, setGrid] = useState<string[][]>(() =>
    Array(8).fill(null).map(() => Array(8).fill(''))
  );

  const startNewGame = () => {
    setScore(0);
    setGrid(Array(8).fill(null).map(() => Array(8).fill('')));
    setGameState('playing');
    if (soundOn) gameSound.playStart();
  };

  const handleCellClick = (r: number, c: number) => {
    if (gameState !== 'playing') return;

    if (!grid[r][c]) {
      const colors = ['#00f3ff', '#ff0055', '#ffe600', '#10b981', '#a855f7'];
      const chosenColor = colors[Math.floor(Math.random() * colors.length)];

      const newGrid = grid.map((row) => [...row]);
      newGrid[r][c] = chosenColor;

      // Check completed lines (rows/cols)
      let linesCleared = 0;

      // Row check
      for (let i = 0; i < 8; i++) {
        if (newGrid[i].every((cell) => cell !== '')) {
          linesCleared++;
          for (let j = 0; j < 8; j++) newGrid[i][j] = '';
        }
      }

      // Col check
      for (let j = 0; j < 8; j++) {
        let colFull = true;
        for (let i = 0; i < 8; i++) {
          if (newGrid[i][j] === '') colFull = false;
        }
        if (colFull) {
          linesCleared++;
          for (let i = 0; i < 8; i++) newGrid[i][j] = '';
        }
      }

      setGrid(newGrid);

      if (linesCleared > 0) {
        if (soundOn) gameSound.playSmash();
        setScore((s) => {
          const ns = s + linesCleared * 100;
          if (ns > highScore) {
            setHighScore(ns);
            localStorage.setItem('block_blast_high_score', ns.toString());
          }
          return ns;
        });
      } else {
        if (soundOn) gameSound.playBounce();
        setScore((s) => s + 10);
      }
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-[#0a0e1a] border border-cyan-500/30 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col items-center">
      <div className="w-full flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Grid className="text-cyan-400 w-6 h-6 animate-pulse" />
          <h3 className="text-lg font-black text-white tracking-wide">Block Blast 1010</h3>
        </div>
        <button
          onClick={() => setSoundOn(!soundOn)}
          className="p-1.5 rounded-xl bg-slate-900 border border-slate-700 text-cyan-400 hover:text-white transition"
        >
          {soundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>
      </div>

      <div className="relative w-full aspect-[4/3] bg-black rounded-2xl overflow-hidden border border-cyan-500/40 shadow-inner p-4 flex flex-col items-center justify-center">
        {gameState === 'playing' ? (
          <div className="grid grid-cols-8 gap-1.5 w-full max-w-[360px] aspect-square bg-[#080d19] p-2.5 rounded-2xl border border-cyan-500/30 shadow-2xl">
            {grid.map((row, r) =>
              row.map((cell, c) => (
                <button
                  key={`${r}-${c}`}
                  onClick={() => handleCellClick(r, c)}
                  className={`w-full h-full rounded-md border transition-all cursor-pointer ${
                    cell
                      ? 'border-white/50 shadow-md scale-95'
                      : 'bg-[#131b2e] border-slate-800 hover:border-cyan-400 hover:bg-[#1a263d]'
                  }`}
                  style={{
                    backgroundColor: cell || undefined,
                    boxShadow: cell ? `0 0 10px ${cell}` : undefined
                  }}
                />
              ))
            )}
          </div>
        ) : (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
            <Grid size={48} className="text-cyan-400 mb-3 animate-bounce" />
            <h4 className="text-xl font-extrabold text-white mb-1">ব্লক ব্লাস্ট пазল</h4>
            <p className="text-xs text-cyan-300 max-w-sm mb-6 leading-relaxed">
              ৮x৮ গ্রিডে কালার ব্লক বসান। আড়াআড়ি বা লম্বালম্বি লাইন পূর্ণ করে ব্লাস্ট ঘটান!
            </p>
            <button
              onClick={startNewGame}
              className="px-6 py-2.5 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-sm transition shadow-lg shadow-cyan-500/30 flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Play size={16} fill="currentColor" />
              <span>ব্লক ব্লাস্ট খেলুন</span>
            </button>
          </div>
        )}
      </div>

      <div className="w-full flex items-center justify-between mt-3 text-xs text-gray-400 font-mono">
        <div>স্কোর: <span className="text-cyan-400 font-bold">{score}</span></div>
        <div>হাই স্কোর: <span className="text-amber-400 font-bold">{highScore}</span></div>
      </div>
    </div>
  );
};
