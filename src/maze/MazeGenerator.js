/**
 * Recursive backtracker (DFS) maze generator.
 * Returns a 2D grid of cells, each with { n, s, e, w } wall booleans,
 * plus metadata: deadEnds[] and farthestCell from start.
 */
export function generateMaze(cols, rows) {
  // Initialize grid
  const grid = [];
  for (let r = 0; r < rows; r++) {
    grid[r] = [];
    for (let c = 0; c < cols; c++) {
      grid[r][c] = {
        row: r,
        col: c,
        walls: { n: true, s: true, e: true, w: true },
        visited: false,
      };
    }
  }

  const directions = [
    { dr: -1, dc: 0, wall: 'n', opposite: 's' },
    { dr: 1, dc: 0, wall: 's', opposite: 'n' },
    { dr: 0, dc: 1, wall: 'e', opposite: 'w' },
    { dr: 0, dc: -1, wall: 'w', opposite: 'e' },
  ];

  // Iterative DFS to avoid stack overflow on large mazes
  const stack = [];
  const startCell = grid[0][0];
  startCell.visited = true;
  stack.push(startCell);

  while (stack.length > 0) {
    const current = stack[stack.length - 1];
    const neighbors = [];

    for (const d of directions) {
      const nr = current.row + d.dr;
      const nc = current.col + d.dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !grid[nr][nc].visited) {
        neighbors.push({ cell: grid[nr][nc], dir: d });
      }
    }

    if (neighbors.length > 0) {
      const { cell: next, dir } = neighbors[Math.floor(Math.random() * neighbors.length)];
      current.walls[dir.wall] = false;
      next.walls[dir.opposite] = false;
      next.visited = true;
      stack.push(next);
    } else {
      stack.pop();
    }
  }

  // Find dead-ends (cells with exactly 3 walls) and farthest cell from start via BFS
  const deadEnds = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = grid[r][c];
      const wallCount = Object.values(cell.walls).filter(Boolean).length;
      if (wallCount === 3) {
        deadEnds.push(cell);
      }
    }
  }

  // BFS from (0,0) to find farthest cell
  const dist = Array.from({ length: rows }, () => new Array(cols).fill(-1));
  dist[0][0] = 0;
  const queue = [grid[0][0]];
  let farthest = grid[0][0];
  let maxDist = 0;

  while (queue.length > 0) {
    const cell = queue.shift();
    for (const d of directions) {
      if (!cell.walls[d.wall]) {
        const nr = cell.row + d.dr;
        const nc = cell.col + d.dc;
        if (dist[nr][nc] === -1) {
          dist[nr][nc] = dist[cell.row][cell.col] + 1;
          queue.push(grid[nr][nc]);
          if (dist[nr][nc] > maxDist) {
            maxDist = dist[nr][nc];
            farthest = grid[nr][nc];
          }
        }
      }
    }
  }

  return { grid, deadEnds, farthestCell: farthest };
}
