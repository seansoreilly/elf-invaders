import React, { useEffect, useState } from 'react';
import { GameState } from '../constants';
import { getSantaFeedback } from '../services/santaService';

interface GameOverlayProps {
  gameState: GameState;
  score: number;
  lives: number;
  onStart: () => void;
  onRestart: () => void;
}

const GameOverlay: React.FC<GameOverlayProps> = ({ gameState, score, lives, onStart, onRestart }) => {
  const [santaMessage, setSantaMessage] = useState<string>('');
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (gameState === GameState.GAME_OVER || gameState === GameState.VICTORY) {
      setSantaMessage(getSantaFeedback(gameState === GameState.VICTORY));
    }
  }, [gameState]);

  if (gameState === GameState.PLAYING) {
    return (
      <div className="absolute top-2 sm:top-4 left-0 w-full px-4 sm:px-8 flex justify-between items-start pointer-events-none text-white font-pixel z-20">
        <div className="flex flex-col gap-0.5 sm:gap-1 drop-shadow-md">
          <span className="text-sm sm:text-xl text-yellow-300">SCORE</span>
          <span className="text-xl sm:text-3xl text-white">{score.toString().padStart(6, '0')}</span>
        </div>
        <div className="flex flex-col gap-0.5 sm:gap-1 items-end drop-shadow-md">
          <span className="text-sm sm:text-xl text-red-300">LIVES</span>
          <div className="flex text-lg sm:text-2xl filter drop-shadow">
            {Array.from({ length: Math.max(0, lives) }).map((_, i) => (
              <span key={i} className="animate-pulse">❤️</span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center z-30 bg-black/60 backdrop-blur-md p-4 transition-all duration-500">
      <div className="bg-slate-900/80 border border-white/10 p-6 sm:p-10 rounded-2xl shadow-[0_0_60px_rgba(79,70,229,0.3)] text-center max-w-xl w-full backdrop-blur-xl ring-1 ring-white/20">
        {gameState === GameState.MENU && (
          <div className="animate-fade-in-up">
            <h1 className="text-4xl sm:text-6xl mb-2 text-white font-pixel tracking-wider drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]">
              ELF<br/>
              <span className="text-green-400 drop-shadow-[0_0_15px_rgba(74,222,128,0.8)]">INVADERS</span>
            </h1>
            <p className="text-lg sm:text-2xl mb-6 sm:mb-8 text-indigo-200 font-serif italic">
              "The North Pole needs a hero!"
            </p>
            <div className="flex justify-center gap-6 sm:gap-10 mb-6 sm:mb-10 text-4xl sm:text-5xl">
              <span className="animate-bounce delay-100 drop-shadow-lg">🧝</span>
              <span className="animate-spin-slow drop-shadow-lg">❄️</span>
              <span className="animate-bounce delay-300 drop-shadow-lg">🎅</span>
            </div>
            <button
              onClick={onStart}
              className="px-8 sm:px-10 py-3 sm:py-4 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-bold rounded-xl text-xl sm:text-2xl transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(220,38,38,0.6)] shadow-lg border-2 border-red-400/30 font-pixel"
            >
              START GAME
            </button>
            <p className="mt-6 sm:mt-8 text-xs sm:text-sm text-slate-400 font-sans tracking-wide">
              {isMobile ? (
                <>Touch screen to <span className="text-white bg-slate-800 px-2 py-1 rounded">Move</span> & <span className="text-white bg-slate-800 px-2 py-1 rounded">Fire</span></>
              ) : (
                <>Use <span className="text-white bg-slate-800 px-2 py-1 rounded">Arrow Keys</span> to Move & <span className="text-white bg-slate-800 px-2 py-1 rounded">Space</span> to Shoot</>
              )}
            </p>
          </div>
        )}

        {(gameState === GameState.GAME_OVER || gameState === GameState.VICTORY) && (
          <div className="animate-fade-in-up">
            <h2 className={`text-3xl sm:text-5xl mb-4 sm:mb-6 font-pixel tracking-wide drop-shadow-lg ${gameState === GameState.VICTORY ? 'text-yellow-400' : 'text-red-500'}`}>
              {gameState === GameState.VICTORY ? 'CHRISTMAS SAVED!' : 'GAME OVER'}
            </h2>

            <div className="bg-black/30 p-4 sm:p-6 rounded-xl mb-4 sm:mb-6 border border-white/10 mx-auto w-fit min-w-[160px] sm:min-w-[200px]">
              <p className="text-slate-400 text-xs sm:text-sm mb-1 uppercase tracking-widest">Final Score</p>
              <p className="text-3xl sm:text-5xl text-white font-pixel drop-shadow-md">{score.toString().padStart(6, '0')}</p>
            </div>

            <div className="mb-6 sm:mb-8 min-h-[80px] sm:min-h-[100px] bg-indigo-950/30 p-3 sm:p-4 rounded-lg border border-indigo-500/20">
               <p className="text-indigo-300 text-xs uppercase mb-2 tracking-widest font-bold">From the desk of Santa</p>
               <p className="text-yellow-100 italic text-base sm:text-xl font-serif leading-relaxed drop-shadow-sm">"{santaMessage}"</p>
            </div>

            <button
              onClick={onRestart}
              className="px-6 sm:px-8 py-2 sm:py-3 bg-gradient-to-r from-green-600 to-green-800 hover:from-green-500 hover:to-green-700 text-white font-bold rounded-xl text-lg sm:text-xl transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(22,163,74,0.6)] shadow-lg border-2 border-green-400/30 font-pixel"
            >
              PLAY AGAIN
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameOverlay;