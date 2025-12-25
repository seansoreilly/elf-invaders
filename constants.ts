// Desktop (landscape)
export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;

// Mobile (portrait)
export const MOBILE_CANVAS_WIDTH = 360;
export const MOBILE_CANVAS_HEIGHT = 640;

// Detect mobile
export const isMobile = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth <= 768 ||
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Get responsive dimensions
export const getCanvasDimensions = () => {
  const mobile = isMobile();
  return {
    width: mobile ? MOBILE_CANVAS_WIDTH : CANVAS_WIDTH,
    height: mobile ? MOBILE_CANVAS_HEIGHT : CANVAS_HEIGHT,
    isMobile: mobile
  };
};

export const PLAYER_WIDTH = 48;
export const PLAYER_HEIGHT = 48;
export const PLAYER_SPEED = 5;
export const PLAYER_COOLDOWN = 20; // Frames

export const INVADER_WIDTH = 32;
export const INVADER_HEIGHT = 32;
export const INVADER_PADDING = 20;
export const INVADER_ROWS = 4;
export const INVADER_COLS = 8;
export const MOBILE_INVADER_COLS = 5; // Fewer columns for portrait
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