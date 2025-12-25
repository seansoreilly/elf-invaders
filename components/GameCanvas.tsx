import React, { useEffect, useRef, useCallback } from 'react';
import { 
  CANVAS_WIDTH, CANVAS_HEIGHT, 
  PLAYER_WIDTH, PLAYER_HEIGHT, PLAYER_SPEED, PLAYER_COOLDOWN,
  INVADER_WIDTH, INVADER_HEIGHT, INVADER_PADDING, INVADER_ROWS, INVADER_COLS, INVADER_DROP_DISTANCE,
  BULLET_WIDTH, BULLET_HEIGHT, BULLET_SPEED,
  INVADER_BULLET_WIDTH, INVADER_BULLET_HEIGHT,
  SPRITE_PLAYER, SPRITE_BULLET_PLAYER, SPRITE_BULLET_INVADER,
  GameState,
} from '../constants';
import { Player, Invader, Bullet, Particle, Star } from '../types';

interface GameCanvasProps {
  gameState: GameState;
  setGameState: (state: GameState) => void;
  setScore: (score: number) => void;
  setLives: (lives: React.SetStateAction<number>) => void;
  scoreRef: React.MutableRefObject<number>;
  livesRef: React.MutableRefObject<number>;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ 
  gameState, 
  setGameState, 
  setScore, 
  setLives,
  scoreRef,
  livesRef
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  
  // Game State Refs
  const playerRef = useRef<Player>({ 
    x: CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2, 
    y: CANVAS_HEIGHT - PLAYER_HEIGHT - 10, 
    width: PLAYER_WIDTH, 
    height: PLAYER_HEIGHT, 
    markedForDeletion: false,
    cooldown: 0
  });
  
  const invadersRef = useRef<Invader[]>([]);
  const bulletsRef = useRef<Bullet[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const starsRef = useRef<Star[]>([]);
  const invaderDirRef = useRef<number>(1); 
  const invaderSpeedRef = useRef<number>(1); 
  const frameCountRef = useRef<number>(0);

  // Input State
  const keysPressed = useRef<{ [key: string]: boolean }>({});

  // Initialize Game
  const initGame = useCallback(() => {
    playerRef.current = { 
      x: CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2, 
      y: CANVAS_HEIGHT - PLAYER_HEIGHT - 10, 
      width: PLAYER_WIDTH, 
      height: PLAYER_HEIGHT, 
      markedForDeletion: false,
      cooldown: 0
    };
    
    const newInvaders: Invader[] = [];
    for (let r = 0; r < INVADER_ROWS; r++) {
      for (let c = 0; c < INVADER_COLS; c++) {
        newInvaders.push({
          x: 50 + c * (INVADER_WIDTH + INVADER_PADDING),
          y: 50 + r * (INVADER_HEIGHT + INVADER_PADDING),
          width: INVADER_WIDTH,
          height: INVADER_HEIGHT,
          markedForDeletion: false,
          row: r,
          col: c
        });
      }
    }
    invadersRef.current = newInvaders;
    bulletsRef.current = [];
    particlesRef.current = [];
    invaderDirRef.current = 1;
    invaderSpeedRef.current = 1;
    frameCountRef.current = 0;
    
    // Init Snow (Stars)
    if (starsRef.current.length === 0) {
      for (let i = 0; i < 150; i++) {
        starsRef.current.push({
          x: Math.random() * CANVAS_WIDTH,
          y: Math.random() * CANVAS_HEIGHT,
          size: Math.random() * 2 + 1,
          speed: Math.random() * 1.5 + 0.5,
          opacity: Math.random() * 0.5 + 0.3
        });
      }
    }
  }, []);

  // Spawn explosion particles
  const createExplosion = (x: number, y: number, color: string) => {
    for (let i = 0; i < 15; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3 + 1;
      particlesRef.current.push({
        x,
        y,
        width: Math.random() * 4 + 2, // Used as diameter
        height: 0, // Unused for circle
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1.0,
        color,
        markedForDeletion: false
      });
    }
  };

  const update = useCallback(() => {
    if (gameState !== GameState.PLAYING) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    // --- Player Movement ---
    if (keysPressed.current['ArrowLeft'] || keysPressed.current['a']) {
      playerRef.current.x -= PLAYER_SPEED;
    }
    if (keysPressed.current['ArrowRight'] || keysPressed.current['d']) {
      playerRef.current.x += PLAYER_SPEED;
    }
    playerRef.current.x = Math.max(0, Math.min(CANVAS_WIDTH - PLAYER_WIDTH, playerRef.current.x));

    // --- Player Shooting ---
    if (playerRef.current.cooldown > 0) playerRef.current.cooldown--;
    if ((keysPressed.current[' '] || keysPressed.current['Enter']) && playerRef.current.cooldown <= 0) {
      bulletsRef.current.push({
        x: playerRef.current.x + PLAYER_WIDTH / 2 - BULLET_WIDTH / 2,
        y: playerRef.current.y,
        width: BULLET_WIDTH,
        height: BULLET_HEIGHT,
        dy: -BULLET_SPEED,
        isEnemy: false,
        markedForDeletion: false
      });
      playerRef.current.cooldown = PLAYER_COOLDOWN;
    }

    // --- Invader Logic ---
    let hitEdge = false;
    let lowestInvaderY = 0;

    invadersRef.current.forEach(inv => {
      inv.x += invaderSpeedRef.current * invaderDirRef.current;
      if (inv.x <= 0 || inv.x + INVADER_WIDTH >= CANVAS_WIDTH) {
        hitEdge = true;
      }
      lowestInvaderY = Math.max(lowestInvaderY, inv.y + INVADER_HEIGHT);
    });

    if (hitEdge) {
      invaderDirRef.current *= -1;
      invadersRef.current.forEach(inv => {
        inv.y += INVADER_DROP_DISTANCE;
      });
    }

    if (lowestInvaderY >= playerRef.current.y) {
      setGameState(GameState.GAME_OVER);
      return;
    }

    if (invadersRef.current.length === 0) {
      setGameState(GameState.VICTORY);
      return;
    }

    // Reduced shooting frequency by 75%
    if (Math.random() < (0.01 + (0.001 * (INVADER_ROWS * INVADER_COLS - invadersRef.current.length))) * 0.25) {
      const shooter = invadersRef.current[Math.floor(Math.random() * invadersRef.current.length)];
      bulletsRef.current.push({
        x: shooter.x + INVADER_WIDTH / 2 - INVADER_BULLET_WIDTH / 2, // Center the larger bullet
        y: shooter.y + INVADER_HEIGHT,
        width: INVADER_BULLET_WIDTH,
        height: INVADER_BULLET_HEIGHT,
        dy: BULLET_SPEED * 0.6,
        isEnemy: true,
        markedForDeletion: false
      });
    }

    // --- Bullet Updates ---
    bulletsRef.current.forEach(b => {
      b.y += b.dy;
      if (b.y < 0 || b.y > CANVAS_HEIGHT) b.markedForDeletion = true;
    });

    // --- Collisions ---
    bulletsRef.current.forEach(bullet => {
      if (bullet.markedForDeletion) return;

      if (!bullet.isEnemy) {
        invadersRef.current.forEach(invader => {
          if (invader.markedForDeletion) return;
          if (
            bullet.x < invader.x + invader.width &&
            bullet.x + bullet.width > invader.x &&
            bullet.y < invader.y + invader.height &&
            bullet.y + bullet.height > invader.y
          ) {
            invader.markedForDeletion = true;
            bullet.markedForDeletion = true;
            createExplosion(invader.x + invader.width/2, invader.y + invader.height/2, '#4ade80'); // Bright Green
            scoreRef.current += 100;
            setScore(scoreRef.current);
            invaderSpeedRef.current += 0.05;
          }
        });
      } else {
        const p = playerRef.current;
        if (
          bullet.x < p.x + p.width - 10 && 
          bullet.x + bullet.width > p.x + 10 &&
          bullet.y < p.y + p.height &&
          bullet.y + bullet.height > p.y
        ) {
          bullet.markedForDeletion = true;
          createExplosion(p.x + p.width/2, p.y + p.height/2, '#f87171'); // Bright Red
          livesRef.current -= 1;
          setLives(livesRef.current);
          if (livesRef.current <= 0) {
            setGameState(GameState.GAME_OVER);
          }
        }
      }
    });

    invadersRef.current = invadersRef.current.filter(i => !i.markedForDeletion);
    bulletsRef.current = bulletsRef.current.filter(b => !b.markedForDeletion);

    // --- Particles ---
    particlesRef.current.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.03;
      // Shrink effect
      p.width *= 0.95; 
      if (p.life <= 0) p.markedForDeletion = true;
    });
    particlesRef.current = particlesRef.current.filter(p => !p.markedForDeletion);

    // --- Snow ---
    starsRef.current.forEach(s => {
      s.y += s.speed;
      if (s.y > CANVAS_HEIGHT) {
        s.y = 0;
        s.x = Math.random() * CANVAS_WIDTH;
      }
    });

    frameCountRef.current++;
  }, [gameState, setGameState, setScore, setLives, scoreRef, livesRef]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear with Gradient Background (Midnight Blue to Dark Purple/Indigo)
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#020617'); // Very dark slate
    gradient.addColorStop(0.5, '#1e1b4b'); // Indigo 950
    gradient.addColorStop(1, '#312e81'); // Indigo 900
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw Snow
    ctx.fillStyle = '#e2e8f0';
    starsRef.current.forEach(s => {
      ctx.globalAlpha = s.opacity;
      ctx.beginPath();
      // Drift effect
      const drift = Math.sin((frameCountRef.current * 0.05) + s.y * 0.01) * 2;
      ctx.arc(s.x + drift, s.y, s.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1.0;

    // Helper for Glowing Text
    const drawSpriteWithGlow = (text: string, x: number, y: number, size: number, glowColor: string, glowBlur: number = 15) => {
      ctx.save();
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = glowBlur;
      ctx.font = `${size}px serif`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(text, x, y);
      ctx.restore();
    };

    // Helper for Drawing Custom Vector Snowball (Prominent)
    const drawSnowball = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
      const cx = x + size / 2;
      const cy = y + size / 2;
      const radius = size / 2;

      ctx.save();
      // Strong Cyan Glow
      ctx.shadowColor = '#22d3ee'; // Cyan 400
      ctx.shadowBlur = 15;
      
      // Radial gradient for 3D look
      const grad = ctx.createRadialGradient(cx - radius * 0.3, cy - radius * 0.3, radius * 0.1, cx, cy, radius);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(1, '#a5f3fc'); // Cyan 200
      
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    // Helper for Drawing Custom Vector Elf
    const drawElf = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, colorMain: string, colorAccent: string) => {
      const cx = x + width / 2;
      const cy = y + height / 2;
      
      ctx.save();
      
      // Shadow/Glow
      ctx.shadowColor = colorMain;
      ctx.shadowBlur = 10;

      // Ears (Pointed)
      ctx.fillStyle = '#fca5a5'; // Pinkish skin
      ctx.beginPath();
      // Left ear
      ctx.moveTo(cx - width * 0.35, cy - height * 0.1);
      ctx.lineTo(cx - width * 0.55, cy - height * 0.25);
      ctx.lineTo(cx - width * 0.35, cy);
      // Right ear
      ctx.moveTo(cx + width * 0.35, cy - height * 0.1);
      ctx.lineTo(cx + width * 0.55, cy - height * 0.25);
      ctx.lineTo(cx + width * 0.35, cy);
      ctx.fill();

      // Face
      ctx.fillStyle = '#ffedd5'; // Light skin tone
      ctx.beginPath();
      ctx.arc(cx, cy, width * 0.35, 0, Math.PI * 2);
      ctx.fill();

      // Hat Body
      ctx.fillStyle = colorMain;
      ctx.beginPath();
      // A slightly curved triangle
      ctx.moveTo(cx - width * 0.38, cy - height * 0.2);
      ctx.quadraticCurveTo(cx, cy - height * 0.9, cx + width * 0.45, cy - height * 0.6); // Tip curves to right
      ctx.lineTo(cx + width * 0.38, cy - height * 0.2);
      ctx.closePath();
      ctx.fill();

      // Hat Trim (White fur)
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(cx - width * 0.4, cy - height * 0.25, width * 0.8, height * 0.15, 4);
      ctx.fill();

      // Hat Pom-pom
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx + width * 0.45, cy - height * 0.6, width * 0.12, 0, Math.PI * 2);
      ctx.fill();

      // Eyes
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(cx - width * 0.12, cy + height * 0.05, width * 0.06, 0, Math.PI * 2);
      ctx.arc(cx + width * 0.12, cy + height * 0.05, width * 0.06, 0, Math.PI * 2);
      ctx.fill();

      // Cheeks (Rosy)
      ctx.fillStyle = '#fca5a5';
      ctx.globalAlpha = 0.6;
      ctx.beginPath();
      ctx.arc(cx - width * 0.2, cy + height * 0.15, width * 0.08, 0, Math.PI * 2);
      ctx.arc(cx + width * 0.2, cy + height * 0.15, width * 0.08, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1.0;

      // Collar / Shoulders
      ctx.fillStyle = colorMain;
      ctx.beginPath();
      ctx.moveTo(cx - width * 0.3, cy + height * 0.3);
      ctx.quadraticCurveTo(cx, cy + height * 0.5, cx + width * 0.3, cy + height * 0.3);
      ctx.lineTo(cx + width * 0.4, cy + height * 0.5); // Shoulder edge
      ctx.lineTo(cx - width * 0.4, cy + height * 0.5);
      ctx.fill();

      // Collar Details (Zigzag)
      ctx.fillStyle = colorAccent;
      ctx.beginPath();
      ctx.moveTo(cx - width * 0.3, cy + height * 0.3);
      ctx.lineTo(cx, cy + height * 0.45);
      ctx.lineTo(cx + width * 0.3, cy + height * 0.3);
      ctx.fill();

      ctx.restore();
    };

    // Helper for Drawing Custom Vector Santa
    const drawSanta = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) => {
      const cx = x + width / 2;
      const cy = y + height / 2;
      
      ctx.save();
      ctx.shadowColor = '#f87171'; // Red glow
      ctx.shadowBlur = 15;

      // 1. Shoulders/Body (Red)
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.ellipse(cx, cy + height * 0.4, width * 0.4, height * 0.2, 0, 0, Math.PI * 2);
      ctx.fill();

      // 2. Beard (White base for head)
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx, cy + height * 0.1, width * 0.35, 0, Math.PI * 2); // Big circle beard
      ctx.fill();

      // 3. Face (Skin)
      ctx.fillStyle = '#ffedd5';
      ctx.beginPath();
      ctx.arc(cx, cy, width * 0.25, 0, Math.PI * 2);
      ctx.fill();

      // 4. Hat (Red)
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.moveTo(cx - width * 0.3, cy - height * 0.1);
      ctx.quadraticCurveTo(cx, cy - height * 0.6, cx + width * 0.35, cy + height * 0.1); // Droopy hat
      ctx.lineTo(cx + width * 0.28, cy - height * 0.1);
      ctx.closePath();
      ctx.fill();

      // 5. Hat Trim (White)
      ctx.fillStyle = '#f1f5f9';
      ctx.beginPath();
      ctx.roundRect(cx - width * 0.32, cy - height * 0.15, width * 0.64, height * 0.12, 5);
      ctx.fill();

      // 6. Pom Pom
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx + width * 0.35, cy + height * 0.1, width * 0.08, 0, Math.PI * 2);
      ctx.fill();

      // 7. Eyes
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(cx - width * 0.1, cy + height * 0.05, width * 0.04, 0, Math.PI * 2);
      ctx.arc(cx + width * 0.1, cy + height * 0.05, width * 0.04, 0, Math.PI * 2);
      ctx.fill();

      // 8. Mustache
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(cx - width * 0.15, cy + height * 0.1, width * 0.3, height * 0.08, 5);
      ctx.fill();
      
      // 9. Nose (Pink)
      ctx.fillStyle = '#fca5a5';
      ctx.beginPath();
      ctx.arc(cx, cy + height * 0.1, width * 0.05, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    // Draw Player (Santa)
    drawSanta(ctx, playerRef.current.x, playerRef.current.y, PLAYER_WIDTH, PLAYER_HEIGHT);

    // Draw Invaders with Custom Function
    const invaderBob = Math.sin(frameCountRef.current * 0.15) * 4;
    invadersRef.current.forEach(inv => {
      const isAlt = inv.row % 2 === 0;
      const colorMain = isAlt ? '#22c55e' : '#15803d'; // Green shades
      const colorAccent = isAlt ? '#ef4444' : '#b91c1c'; // Red shades
      drawElf(ctx, inv.x, inv.y + invaderBob, INVADER_WIDTH, INVADER_HEIGHT, colorMain, colorAccent);
    });

    // Draw Bullets
    bulletsRef.current.forEach(b => {
      if (b.isEnemy) {
        // Draw Snowball for Enemy
        drawSnowball(ctx, b.x, b.y, b.width);
      } else {
        // Draw Gift for Player
        const glowColor = '#60a5fa'; // Blue for player
        drawSpriteWithGlow(SPRITE_BULLET_PLAYER, b.x, b.y, BULLET_HEIGHT, glowColor, 10);
      }
    });

    // Draw Particles (Circular with Glow)
    particlesRef.current.forEach(p => {
      ctx.save();
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.width, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

  }, []);

  const loop = useCallback(() => {
    update();
    draw();
    requestRef.current = requestAnimationFrame(loop);
  }, [update, draw]);

  // Key Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.key] = true;
      if (e.key === ' ' && gameState === GameState.PLAYING) e.preventDefault();
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState]);

  // Main Loop Trigger
  useEffect(() => {
    if (gameState === GameState.PLAYING && invadersRef.current.length === 0 && livesRef.current > 0) {
      initGame();
    }
    
    requestRef.current = requestAnimationFrame(loop);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gameState, loop, initGame, livesRef]);

  // Handle Reset from external source
  useEffect(() => {
     if (gameState === GameState.MENU) {
         initGame();
     }
  }, [gameState, initGame]);

  return (
    <canvas 
      ref={canvasRef} 
      width={CANVAS_WIDTH} 
      height={CANVAS_HEIGHT}
      className="max-w-full h-auto border-4 border-slate-700 rounded-xl shadow-2xl shadow-indigo-500/20 cursor-none"
      style={{ touchAction: 'none' }}
    />
  );
};

export default GameCanvas;