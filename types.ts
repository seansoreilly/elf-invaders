import React from 'react';
import { GameState } from './constants';

export interface Point {
  x: number;
  y: number;
}

export interface Entity {
  x: number;
  y: number;
  width: number;
  height: number;
  markedForDeletion: boolean;
}

export interface Player extends Entity {
  cooldown: number;
}

export interface Invader extends Entity {
  row: number;
  col: number;
}

export interface Bullet extends Entity {
  dy: number;
  isEnemy: boolean;
}

export interface Particle extends Entity {
  vx: number;
  vy: number;
  life: number;
  color: string;
}

export interface Star {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
}

export interface GameContextType {
  score: number;
  lives: number;
  level: number;
  gameState: GameState;
  setGameState: (state: GameState) => void;
  resetGame: () => void;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  scoreRef: React.MutableRefObject<number>; // For immediate access in loop
}