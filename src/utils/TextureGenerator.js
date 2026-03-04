import { CONFIG } from '../config.js';

export function generateTextures(scene) {
  const T = CONFIG.TILE_SIZE;

  // --- Wall tile ---
  const wallGfx = scene.make.graphics({ add: false });
  wallGfx.fillStyle(CONFIG.COLOR_WALL);
  wallGfx.fillRect(0, 0, T, T);
  wallGfx.lineStyle(1, CONFIG.COLOR_WALL_EDGE, 0.6);
  wallGfx.strokeRect(0.5, 0.5, T - 1, T - 1);
  wallGfx.lineStyle(1, CONFIG.COLOR_WALL_EDGE, 0.25);
  wallGfx.lineBetween(4, 4, T - 4, 4);
  wallGfx.lineBetween(4, T - 4, T - 4, T - 4);
  wallGfx.generateTexture('wall', T, T);
  wallGfx.destroy();

  // --- Floor tile ---
  const floorGfx = scene.make.graphics({ add: false });
  floorGfx.fillStyle(0x0a0a14);
  floorGfx.fillRect(0, 0, T, T);
  floorGfx.lineStyle(1, 0x151525, 0.4);
  floorGfx.strokeRect(0.5, 0.5, T - 1, T - 1);
  floorGfx.generateTexture('floor', T, T);
  floorGfx.destroy();

  // --- Ship (triangle pointing right) ---
  const shipSize = 28;
  const shipGfx = scene.make.graphics({ add: false });
  shipGfx.fillStyle(CONFIG.COLOR_SHIP, 0.15);
  shipGfx.fillCircle(shipSize, shipSize, shipSize * 0.9);
  shipGfx.fillStyle(CONFIG.COLOR_SHIP);
  shipGfx.beginPath();
  shipGfx.moveTo(shipSize * 2 - 4, shipSize);
  shipGfx.lineTo(4, shipSize - 10);
  shipGfx.lineTo(8, shipSize);
  shipGfx.lineTo(4, shipSize + 10);
  shipGfx.closePath();
  shipGfx.fillPath();
  shipGfx.lineStyle(1.5, 0xffffff, 0.6);
  shipGfx.beginPath();
  shipGfx.moveTo(shipSize * 2 - 4, shipSize);
  shipGfx.lineTo(4, shipSize - 10);
  shipGfx.lineTo(8, shipSize);
  shipGfx.lineTo(4, shipSize + 10);
  shipGfx.closePath();
  shipGfx.strokePath();
  shipGfx.generateTexture('ship', shipSize * 2, shipSize * 2);
  shipGfx.destroy();

  // --- Thrust flame ---
  const flameGfx = scene.make.graphics({ add: false });
  flameGfx.fillStyle(0xff8800, 0.9);
  flameGfx.fillTriangle(12, 0, 0, 6, 12, 12);
  flameGfx.fillStyle(0xffff00, 0.7);
  flameGfx.fillTriangle(10, 2, 3, 6, 10, 10);
  flameGfx.generateTexture('flame', 12, 12);
  flameGfx.destroy();

  // --- Bullet ---
  const bulletGfx = scene.make.graphics({ add: false });
  bulletGfx.fillStyle(CONFIG.COLOR_BULLET);
  bulletGfx.fillCircle(4, 4, 3);
  bulletGfx.fillStyle(0xffffff, 0.8);
  bulletGfx.fillCircle(4, 4, 1.5);
  bulletGfx.generateTexture('bullet', 8, 8);
  bulletGfx.destroy();

  // --- Enemy bullet ---
  const ebGfx = scene.make.graphics({ add: false });
  ebGfx.fillStyle(CONFIG.COLOR_ENEMY_BULLET);
  ebGfx.fillCircle(4, 4, 3);
  ebGfx.fillStyle(0xffffff, 0.6);
  ebGfx.fillCircle(4, 4, 1.5);
  ebGfx.generateTexture('enemyBullet', 8, 8);
  ebGfx.destroy();

  // --- Star collectible ---
  const starGfx = scene.make.graphics({ add: false });
  starGfx.fillStyle(CONFIG.COLOR_STAR, 0.15);
  starGfx.fillCircle(16, 16, 14);
  drawStar(starGfx, 16, 16, 5, 12, 5, CONFIG.COLOR_STAR);
  starGfx.fillStyle(0xffffff, 0.7);
  starGfx.fillCircle(16, 16, 3);
  starGfx.generateTexture('star', 32, 32);
  starGfx.destroy();

  // --- Enemy ship (diamond shape) ---
  const enemySize = 24;
  const eGfx = scene.make.graphics({ add: false });
  eGfx.fillStyle(CONFIG.COLOR_ENEMY, 0.15);
  eGfx.fillCircle(enemySize, enemySize, enemySize * 0.85);
  eGfx.fillStyle(CONFIG.COLOR_ENEMY);
  eGfx.beginPath();
  eGfx.moveTo(enemySize * 2 - 4, enemySize);
  eGfx.lineTo(enemySize, 4);
  eGfx.lineTo(4, enemySize);
  eGfx.lineTo(enemySize, enemySize * 2 - 4);
  eGfx.closePath();
  eGfx.fillPath();
  eGfx.lineStyle(1.5, 0xff8888, 0.7);
  eGfx.beginPath();
  eGfx.moveTo(enemySize * 2 - 4, enemySize);
  eGfx.lineTo(enemySize, 4);
  eGfx.lineTo(4, enemySize);
  eGfx.lineTo(enemySize, enemySize * 2 - 4);
  eGfx.closePath();
  eGfx.strokePath();
  eGfx.generateTexture('enemy', enemySize * 2, enemySize * 2);
  eGfx.destroy();

  // --- Exit portal ---
  const exitGfx = scene.make.graphics({ add: false });
  exitGfx.fillStyle(CONFIG.COLOR_EXIT, 0.1);
  exitGfx.fillCircle(24, 24, 22);
  exitGfx.lineStyle(2, CONFIG.COLOR_EXIT, 0.8);
  exitGfx.strokeCircle(24, 24, 18);
  exitGfx.lineStyle(2, CONFIG.COLOR_EXIT, 0.5);
  exitGfx.strokeCircle(24, 24, 12);
  exitGfx.lineStyle(2, CONFIG.COLOR_EXIT, 0.3);
  exitGfx.strokeCircle(24, 24, 6);
  exitGfx.fillStyle(0xffffff, 0.9);
  exitGfx.fillCircle(24, 24, 3);
  exitGfx.generateTexture('exit', 48, 48);
  exitGfx.destroy();

  // --- Explosion particle ---
  const expGfx = scene.make.graphics({ add: false });
  expGfx.fillStyle(CONFIG.COLOR_EXPLOSION);
  expGfx.fillCircle(4, 4, 4);
  expGfx.generateTexture('particle', 8, 8);
  expGfx.destroy();

  // --- Shield bubble (drawn as circle around ship in-game, but need a shard texture for shatter) ---
  const shardGfx = scene.make.graphics({ add: false });
  shardGfx.fillStyle(CONFIG.COLOR_SHIELD, 0.8);
  shardGfx.beginPath();
  shardGfx.moveTo(0, 0);
  shardGfx.lineTo(8, 2);
  shardGfx.lineTo(6, 8);
  shardGfx.lineTo(1, 6);
  shardGfx.closePath();
  shardGfx.fillPath();
  shardGfx.generateTexture('shieldShard', 8, 8);
  shardGfx.destroy();

  // --- Shield gem (blue diamond) ---
  const sgGfx = scene.make.graphics({ add: false });
  sgGfx.fillStyle(CONFIG.COLOR_SHIELD_GEM, 0.15);
  sgGfx.fillCircle(16, 16, 14);
  sgGfx.fillStyle(CONFIG.COLOR_SHIELD_GEM);
  sgGfx.beginPath();
  sgGfx.moveTo(16, 2);    // top
  sgGfx.lineTo(28, 16);   // right
  sgGfx.lineTo(16, 30);   // bottom
  sgGfx.lineTo(4, 16);    // left
  sgGfx.closePath();
  sgGfx.fillPath();
  sgGfx.lineStyle(1.5, 0x88bbff, 0.8);
  sgGfx.beginPath();
  sgGfx.moveTo(16, 2);
  sgGfx.lineTo(28, 16);
  sgGfx.lineTo(16, 30);
  sgGfx.lineTo(4, 16);
  sgGfx.closePath();
  sgGfx.strokePath();
  // inner highlight
  sgGfx.fillStyle(0xffffff, 0.5);
  sgGfx.fillTriangle(16, 6, 24, 16, 16, 16);
  sgGfx.generateTexture('shieldGem', 32, 32);
  sgGfx.destroy();

  // --- Extra life gem (green ship icon) ---
  const lgGfx = scene.make.graphics({ add: false });
  lgGfx.fillStyle(CONFIG.COLOR_LIFE_GEM, 0.15);
  lgGfx.fillCircle(16, 16, 14);
  // Small ship shape
  lgGfx.fillStyle(CONFIG.COLOR_LIFE_GEM);
  lgGfx.beginPath();
  lgGfx.moveTo(28, 16);
  lgGfx.lineTo(6, 8);
  lgGfx.lineTo(10, 16);
  lgGfx.lineTo(6, 24);
  lgGfx.closePath();
  lgGfx.fillPath();
  lgGfx.lineStyle(1.5, 0xffffff, 0.6);
  lgGfx.beginPath();
  lgGfx.moveTo(28, 16);
  lgGfx.lineTo(6, 8);
  lgGfx.lineTo(10, 16);
  lgGfx.lineTo(6, 24);
  lgGfx.closePath();
  lgGfx.strokePath();
  // +1 text
  lgGfx.fillStyle(0xffffff, 0.9);
  lgGfx.fillRect(15, 3, 2, 8);
  lgGfx.fillRect(12, 5, 8, 2);
  lgGfx.generateTexture('lifeGem', 32, 32);
  lgGfx.destroy();

  // --- Minimap ship dot ---
  const dotGfx = scene.make.graphics({ add: false });
  dotGfx.fillStyle(CONFIG.COLOR_SHIP);
  dotGfx.fillCircle(3, 3, 3);
  dotGfx.generateTexture('miniDot', 6, 6);
  dotGfx.destroy();
}

function drawStar(graphics, cx, cy, points, outerR, innerR, color) {
  graphics.fillStyle(color);
  graphics.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = (Math.PI / 2 * 3) + (Math.PI / points) * i;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    if (i === 0) {
      graphics.moveTo(x, y);
    } else {
      graphics.lineTo(x, y);
    }
  }
  graphics.closePath();
  graphics.fillPath();
}
