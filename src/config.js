export const CONFIG = {
  // Display
  WIDTH: 800,
  HEIGHT: 600,

  // Maze
  MAZE_COLS: 12,
  MAZE_ROWS: 12,
  CELL_SIZE: 7,        // each maze cell = 7×7 tiles
  TILE_SIZE: 32,       // pixels per tile

  // Ship
  SHIP_ROTATE_SPEED: 200,   // degrees/sec
  SHIP_THRUST: 300,
  SHIP_MAX_SPEED: 250,
  SHIP_DRAG: 60,
  SHIP_BOUNCE: 0.5,
  SHIP_LIVES: 3,
  SHIELD_MAX_HP: 2,           // hits before shield breaks
  RESPAWN_INVULN_TIME: 2500,  // ms of invulnerability after respawn

  // Bullets
  BULLET_SPEED: 400,
  BULLET_LIFESPAN: 1200,    // ms
  BULLET_POOL_SIZE: 20,
  FIRE_RATE: 250,            // ms between shots

  // Enemies
  ENEMY_SPEED: 80,
  ENEMY_CHASE_SPEED: 140,
  ENEMY_DETECT_RANGE: 250,
  ENEMY_FIRE_RATE: 1500,
  ENEMY_COUNT: 9,
  ENEMY_DROP_CHANCE: 0.20,   // 1 in 5 chance of dropping a gem

  // Collectibles
  STAR_SCORE: 100,
  ENEMY_KILL_SCORE: 250,
  SHIELD_GEM_SCORE: 50,
  EXTRA_LIFE_SCORE: 200,
  SHIELD_GEM_COUNT: 3,       // placed in maze

  // Colors
  COLOR_SHIP: 0x00ff88,
  COLOR_WALL: 0x3355aa,
  COLOR_WALL_EDGE: 0x5577cc,
  COLOR_STAR: 0xffdd00,
  COLOR_ENEMY: 0xff3333,
  COLOR_ENEMY_BULLET: 0xff6666,
  COLOR_BULLET: 0x88ffaa,
  COLOR_EXIT: 0x00ffff,
  COLOR_EXPLOSION: 0xff8800,
  COLOR_SHIELD: 0x4488ff,
  COLOR_SHIELD_GEM: 0x4488ff,
  COLOR_LIFE_GEM: 0x00ff88,
};

// Derived constants
CONFIG.CORRIDOR_PX = CONFIG.CELL_SIZE * CONFIG.TILE_SIZE;
CONFIG.WORLD_WIDTH = CONFIG.MAZE_COLS * CONFIG.CELL_SIZE * CONFIG.TILE_SIZE;
CONFIG.WORLD_HEIGHT = CONFIG.MAZE_ROWS * CONFIG.CELL_SIZE * CONFIG.TILE_SIZE;
