import { CONFIG } from '../config.js';

/**
 * Converts the maze cell grid into a 2D tile array suitable for Phaser tilemap.
 * Each maze cell becomes a CELL_SIZE×CELL_SIZE block of tiles.
 * 0 = floor, 1 = wall
 */
export function buildTileGrid(mazeGrid) {
  const cellSize = CONFIG.CELL_SIZE;
  const rows = mazeGrid.length;
  const cols = mazeGrid[0].length;
  const gridH = rows * cellSize;
  const gridW = cols * cellSize;

  // Initialize all as wall
  const tiles = [];
  for (let r = 0; r < gridH; r++) {
    tiles[r] = new Array(gridW).fill(1);
  }

  for (let mr = 0; mr < rows; mr++) {
    for (let mc = 0; mc < cols; mc++) {
      const cell = mazeGrid[mr][mc];
      const baseR = mr * cellSize;
      const baseC = mc * cellSize;

      // Carve interior (leave 1-tile border as wall)
      for (let r = 1; r < cellSize - 1; r++) {
        for (let c = 1; c < cellSize - 1; c++) {
          tiles[baseR + r][baseC + c] = 0;
        }
      }

      // Carve passages through walls
      if (!cell.walls.n) {
        // North passage: carve top wall
        for (let c = 1; c < cellSize - 1; c++) {
          tiles[baseR][baseC + c] = 0;
        }
      }
      if (!cell.walls.s) {
        // South passage
        for (let c = 1; c < cellSize - 1; c++) {
          tiles[baseR + cellSize - 1][baseC + c] = 0;
        }
      }
      if (!cell.walls.w) {
        // West passage
        for (let r = 1; r < cellSize - 1; r++) {
          tiles[baseR + r][baseC] = 0;
        }
      }
      if (!cell.walls.e) {
        // East passage
        for (let r = 1; r < cellSize - 1; r++) {
          tiles[baseR + r][baseC + cellSize - 1] = 0;
        }
      }
    }
  }

  return tiles;
}

/**
 * Returns the pixel center of a maze cell.
 */
export function cellCenter(row, col) {
  const half = Math.floor(CONFIG.CELL_SIZE / 2);
  return {
    x: col * CONFIG.CELL_SIZE * CONFIG.TILE_SIZE + (half + 0.5) * CONFIG.TILE_SIZE,
    y: row * CONFIG.CELL_SIZE * CONFIG.TILE_SIZE + (half + 0.5) * CONFIG.TILE_SIZE,
  };
}
