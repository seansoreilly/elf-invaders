export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;

export const PLAYER_WIDTH = 48;
export const PLAYER_HEIGHT = 48;
export const PLAYER_SPEED = 5;
export const PLAYER_COOLDOWN = 20; // Frames

export const INVADER_WIDTH = 32;
export const INVADER_HEIGHT = 32;
export const INVADER_PADDING = 20;
export const INVADER_ROWS = 4;
export const INVADER_COLS = 8;
export const INVADER_DROP_DISTANCE = 20;

export const BULLET_WIDTH = 6;
export const BULLET_HEIGHT = 12;
export const BULLET_SPEED = 7;

// New constants for more prominent enemy bullets
export const INVADER_BULLET_WIDTH = 14;
export const INVADER_BULLET_HEIGHT = 14;

export const PARTICLE_COUNT = 50; // Explosion particles

// Sprites (using Emojis for simplicity and aesthetic)
export const SPRITE_PLAYER = '🎅';
export const SPRITE_INVADER = '🧝';
export const SPRITE_BULLET_PLAYER = '🎁';
export const SPRITE_BULLET_INVADER = '❄️'; // Snowball

export enum GameState {
  MENU,
  PLAYING,
  GAME_OVER,
  VICTORY
}