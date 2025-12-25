import React, { useState, useRef } from 'react';
import GameCanvas from './components/GameCanvas';
import GameOverlay from './components/GameOverlay';
import Controls from './components/Controls';
import { GameState } from './constants';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [score, setScore] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  
  // Refs to share mutable state synchronously if needed, mainly passed to Canvas
  const scoreRef = useRef<number>(0);
  const livesRef = useRef<number>(3);

  const startGame = () => {
    setScore(0);
    setLives(3);
    scoreRef.current = 0;
    livesRef.current = 3;
    setGameState(GameState.PLAYING);
  };

  const restartGame = () => {
    setGameState(GameState.MENU);
  };

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center relative overflow-hidden font-sans selection:bg-red-500 selection:text-white">
      
      {/* Ambient background glow */}
      <div className="absolute top-[-20%] left-[20%] w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[10%] w-[400px] h-[400px] bg-indigo-900/20 rounded-full blur-[80px] pointer-events-none"></div>

      <div className="relative z-10 flex flex-col items-center">
        <div className="relative rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)]">
            <GameCanvas 
            gameState={gameState} 
            setGameState={setGameState} 
            setScore={setScore}
            setLives={setLives}
            scoreRef={scoreRef}
            livesRef={livesRef}
            />
            
            <GameOverlay 
            gameState={gameState} 
            score={score} 
            lives={lives}
            onStart={startGame}
            onRestart={restartGame}
            />
        </div>
      </div>

      <Controls />

      <footer className="mt-8 text-slate-500 text-sm relative z-10 font-mono opacity-60 hover:opacity-100 transition-opacity">
        Elf Invaders • <span className="text-red-500">♥</span> React & Tailwind
      </footer>
    </div>
  );
};

export default App;