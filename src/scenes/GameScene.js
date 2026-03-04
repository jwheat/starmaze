import Phaser from 'phaser';
import { CONFIG } from '../config.js';
import { generateMaze } from '../maze/MazeGenerator.js';
import { buildTileGrid, cellCenter } from '../maze/MazeBuilder.js';
import { Ship } from '../entities/Ship.js';
import { Enemy } from '../entities/Enemy.js';
import { createBulletGroup } from '../entities/Bullet.js';
import { Collectible } from '../entities/Collectible.js';

export class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  init(data) {
    this.level = data?.level || 1;
    this.score = data?.score || 0;
  }

  create() {
    // --- Generate maze ---
    const cols = CONFIG.MAZE_COLS + Math.floor(this.level / 3);
    const rows = CONFIG.MAZE_ROWS + Math.floor(this.level / 3);
    const { grid: mazeGrid, deadEnds, farthestCell } = generateMaze(cols, rows);
    const tileData = buildTileGrid(mazeGrid);

    const worldW = cols * CONFIG.CELL_SIZE * CONFIG.TILE_SIZE;
    const worldH = rows * CONFIG.CELL_SIZE * CONFIG.TILE_SIZE;

    // --- Store all cell centers as valid spawn points ---
    this.spawnPoints = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        this.spawnPoints.push(cellCenter(r, c));
      }
    }

    // --- Dark floor background ---
    this.add.rectangle(worldW / 2, worldH / 2, worldW, worldH, 0x0a0a14).setDepth(-2);

    // --- Subtle grid overlay ---
    const floorRT = this.add.renderTexture(0, 0, worldW, worldH).setDepth(-1).setOrigin(0, 0);
    const gridGfx = this.make.graphics({ add: false });
    gridGfx.lineStyle(1, 0x151525, 0.3);
    for (let x = 0; x <= worldW; x += CONFIG.TILE_SIZE) {
      gridGfx.lineBetween(x, 0, x, worldH);
    }
    for (let y = 0; y <= worldH; y += CONFIG.TILE_SIZE) {
      gridGfx.lineBetween(0, y, worldW, y);
    }
    floorRT.draw(gridGfx);
    gridGfx.destroy();

    // --- Create tilemap ---
    const map = this.make.tilemap({
      data: tileData,
      tileWidth: CONFIG.TILE_SIZE,
      tileHeight: CONFIG.TILE_SIZE,
    });
    const tileset = map.addTilesetImage('wall', null, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE, 0, 0, 1);
    this.wallLayer = map.createLayer(0, tileset, 0, 0);
    this.wallLayer.setDepth(0);
    this.wallLayer.setCollision(1);

    // --- Set world bounds ---
    this.physics.world.setBounds(0, 0, worldW, worldH);

    // --- Player ship ---
    const startPos = cellCenter(0, 0);
    this.ship = new Ship(this, startPos.x, startPos.y);
    this.ship.setDepth(10);

    // Listen for respawn requests from the ship
    this.events.on('requestRespawn', () => {
      this.respawnShip();
    });

    // --- Camera ---
    this.cameras.main.setBounds(0, 0, worldW, worldH);
    this.cameras.main.startFollow(this.ship, true, 0.08, 0.08);

    // --- Minimap ---
    const minimapSize = 140;
    this.minimap = this.cameras.add(
      CONFIG.WIDTH - minimapSize - 10,
      CONFIG.HEIGHT - minimapSize - 10,
      minimapSize, minimapSize
    );
    this.minimap.setZoom(minimapSize / Math.max(worldW, worldH));
    this.minimap.setBounds(0, 0, worldW, worldH);
    this.minimap.setBackgroundColor(0x111122);
    this.minimap.centerOn(worldW / 2, worldH / 2);
    this.minimap.setAlpha(0.85);

    const mmX = CONFIG.WIDTH - minimapSize - 10;
    const mmY = CONFIG.HEIGHT - minimapSize - 10;
    const mmBorder = this.add.rectangle(
      mmX + minimapSize / 2, mmY + minimapSize / 2,
      minimapSize + 2, minimapSize + 2
    );
    mmBorder.setStrokeStyle(1, 0x3355aa);
    mmBorder.setScrollFactor(0);
    mmBorder.setDepth(100);
    this.minimap.ignore(mmBorder);

    // --- Collisions with walls ---
    this.physics.add.collider(this.ship, this.wallLayer);

    // --- Bullets ---
    this.playerBullets = createBulletGroup(this, 'bullet');
    this.enemyBullets = createBulletGroup(this, 'enemyBullet');

    this.physics.add.collider(this.playerBullets, this.wallLayer, (obj1) => {
      if (obj1 && obj1.wallHit) obj1.wallHit();
    });
    this.physics.add.collider(this.enemyBullets, this.wallLayer, (obj1) => {
      if (obj1 && obj1.kill) obj1.kill();
    });

    // --- Collectible stars ---
    this.stars = this.physics.add.group();
    this.starsCollected = 0;

    const starCells = deadEnds.filter(c => !(c.row === 0 && c.col === 0));
    const maxStars = 8 + this.level * 2;
    const selectedStarCells = Phaser.Utils.Array.Shuffle(starCells).slice(0, maxStars);
    this.totalStars = selectedStarCells.length;

    for (const cell of selectedStarCells) {
      const pos = cellCenter(cell.row, cell.col);
      const star = new Collectible(this, pos.x, pos.y, 'star');
      this.stars.add(star);
    }

    this.physics.add.overlap(this.ship, this.stars, (ship, star) => {
      if (!star.active || !star.body?.enable) return;
      star.collect();
      this.starsCollected++;
      this.score += CONFIG.STAR_SCORE;
      this.events.emit('scoreChanged', this.score);
      this.events.emit('starCollected', this.starsCollected, this.totalStars);
      this.events.emit('showMessage', `STAR ${this.starsCollected}/${this.totalStars}`, 1000);

      if (this.starsCollected >= this.totalStars) {
        this.events.emit('showMessage', 'ALL STARS! FIND THE EXIT!', 3000);
        this.exitPortal.setAlpha(1);
        this.tweens.add({
          targets: this.exitPortal,
          scale: { from: 1, to: 1.3 },
          duration: 500,
          yoyo: true,
          repeat: -1,
        });
      }
    });

    // --- Shield gems placed in maze ---
    this.gems = this.physics.add.group();

    // Pick dead-end cells not already used for stars or start
    const usedCells = new Set(selectedStarCells.map(c => `${c.row},${c.col}`));
    usedCells.add('0,0');
    usedCells.add(`${farthestCell.row},${farthestCell.col}`);
    const gemCandidates = deadEnds.filter(c => !usedCells.has(`${c.row},${c.col}`));
    const shieldGemCells = Phaser.Utils.Array.Shuffle(gemCandidates).slice(0, CONFIG.SHIELD_GEM_COUNT);

    for (const cell of shieldGemCells) {
      const pos = cellCenter(cell.row, cell.col);
      const gem = new Collectible(this, pos.x, pos.y, 'shieldGem');
      gem.gemType = 'shield';
      this.gems.add(gem);
    }

    this.physics.add.overlap(this.ship, this.gems, (ship, gem) => {
      if (!gem.active || !gem.body?.enable) return;
      gem.collect();
      if (gem.gemType === 'shield') {
        this.ship.restoreShield();
        this.score += CONFIG.SHIELD_GEM_SCORE;
        this.events.emit('showMessage', 'SHIELD RESTORED!', 1500);
      } else if (gem.gemType === 'life') {
        this.ship.addLife();
        this.score += CONFIG.EXTRA_LIFE_SCORE;
        this.events.emit('showMessage', 'EXTRA LIFE!', 1500);
      }
      this.events.emit('scoreChanged', this.score);
    });

    // --- Exit portal ---
    const exitPos = cellCenter(farthestCell.row, farthestCell.col);
    this.exitPortal = this.physics.add.sprite(exitPos.x, exitPos.y, 'exit');
    this.exitPortal.body.setImmovable(true);
    this.exitPortal.body.setAllowGravity(false);
    this.exitPortal.setAlpha(0.3);
    this.exitPortal.setDepth(5);

    this.tweens.add({
      targets: this.exitPortal,
      angle: 360,
      duration: 6000,
      repeat: -1,
      ease: 'Linear',
    });

    this.physics.add.overlap(this.ship, this.exitPortal, () => {
      if (this.starsCollected >= this.totalStars) {
        this.winLevel();
      }
    });

    // --- Enemies ---
    this.enemies = this.physics.add.group();
    const enemyCount = Math.min(CONFIG.ENEMY_COUNT + this.level - 1, deadEnds.length - 1);
    const enemyCells = deadEnds.filter(c =>
      !(c.row === 0 && c.col === 0) &&
      !(c.row === farthestCell.row && c.col === farthestCell.col)
    );
    const selectedEnemyCells = Phaser.Utils.Array.Shuffle(enemyCells).slice(0, enemyCount);

    for (const cell of selectedEnemyCells) {
      const pos = cellCenter(cell.row, cell.col);
      const enemy = new Enemy(this, pos.x, pos.y);
      this.enemies.add(enemy);
    }

    this.physics.add.collider(this.enemies, this.wallLayer);
    this.physics.add.collider(this.enemies, this.enemies);

    // Player bullets hit enemies
    this.physics.add.overlap(this.playerBullets, this.enemies, (obj1, obj2) => {
      const bullet = obj1.kill ? obj1 : obj2;
      const enemy = obj1.kill ? obj2 : obj1;
      if (!bullet.active || !enemy.alive) return;
      bullet.kill();
      enemy.die();
      this.score += CONFIG.ENEMY_KILL_SCORE;
      this.events.emit('scoreChanged', this.score);

      // Chance to drop a gem
      if (Math.random() < CONFIG.ENEMY_DROP_CHANCE) {
        this.spawnDrop(enemy.x, enemy.y);
      }
    });

    // Enemy bullets hit player
    this.physics.add.overlap(this.enemyBullets, this.ship, (obj1, obj2) => {
      const bullet = obj1.kill ? obj1 : obj2;
      if (!bullet.active || !this.ship.alive || this.ship.invulnerable || this.ship.respawning) return;
      bullet.kill();
      const dead = this.ship.takeDamage();
      if (dead) {
        this.gameOver();
      }
    });

    // Enemy body hits player
    this.physics.add.overlap(this.ship, this.enemies, (obj1, obj2) => {
      const ship = obj1 === this.ship ? obj1 : obj2;
      const enemy = obj1 === this.ship ? obj2 : obj1;
      if (!ship.alive || ship.invulnerable || ship.respawning || !enemy.alive) return;
      enemy.die();
      const dead = ship.takeDamage();
      if (dead) {
        this.gameOver();
      }
    });

    // --- Input ---
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = {
      up: this.input.keyboard.addKey('W'),
      down: this.input.keyboard.addKey('S'),
      left: this.input.keyboard.addKey('A'),
      right: this.input.keyboard.addKey('D'),
    };
    this.fireKey = this.input.keyboard.addKey('SPACE');
    this.lastFired = 0;

    // --- Launch HUD ---
    this.scene.launch('HudScene');

    // Emit initial state after brief delay for HUD to be ready
    this.time.delayedCall(50, () => {
      this.events.emit('totalStars', this.totalStars);
      this.events.emit('scoreChanged', this.score);
      this.events.emit('shieldChanged', this.ship.shieldHP);
      this.events.emit('livesChanged', this.ship.lives);
      this.events.emit('levelChanged', this.level);
    });

    this.gameEnded = false;
  }

  update(time, delta) {
    if (this.gameEnded) return;

    this.ship.handleInput(this.cursors, this.wasd, time);

    if (this.fireKey.isDown && time > this.lastFired + CONFIG.FIRE_RATE
        && this.ship.alive && !this.ship.respawning) {
      const bullet = this.playerBullets.getFirstDead(false);
      if (bullet) {
        bullet.body.enable = true;
        const angle = Phaser.Math.DegToRad(this.ship.angle);
        const offsetX = Math.cos(angle) * 24;
        const offsetY = Math.sin(angle) * 24;
        bullet.fire(this.ship.x + offsetX, this.ship.y + offsetY, angle, 1);
        this.lastFired = time;
      }
    }

    const enemies = this.enemies.getChildren();
    for (const enemy of enemies) {
      if (enemy.alive) {
        enemy.update(time, delta, this.ship, this.wallLayer, this.enemyBullets);
      }
    }
  }

  spawnDrop(x, y) {
    // 70% shield gem, 30% extra life
    const isLife = Math.random() < 0.3;
    const texture = isLife ? 'lifeGem' : 'shieldGem';
    const gem = new Collectible(this, x, y, texture);
    gem.gemType = isLife ? 'life' : 'shield';
    this.gems.add(gem);

    // Re-register overlap since this gem was added after initial setup
    // (The group overlap was already set, new members auto-included)
  }

  respawnShip() {
    if (!this.ship.alive) return;

    const enemies = this.enemies.getChildren().filter(e => e.alive);
    let bestPoint = this.spawnPoints[0];
    let bestMinDist = 0;

    const candidates = Phaser.Utils.Array.Shuffle([...this.spawnPoints]).slice(0, 15);
    for (const pt of candidates) {
      let minDist = Infinity;
      for (const enemy of enemies) {
        const d = Phaser.Math.Distance.Between(pt.x, pt.y, enemy.x, enemy.y);
        if (d < minDist) minDist = d;
      }
      if (minDist > bestMinDist) {
        bestMinDist = minDist;
        bestPoint = pt;
      }
    }

    this.ship.respawn(bestPoint.x, bestPoint.y);
  }

  winLevel() {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.events.emit('showMessage', 'LEVEL COMPLETE!', 2000);

    this.time.delayedCall(1500, () => {
      this.scene.stop('HudScene');
      this.scene.start('GameOverScene', {
        won: true,
        score: this.score,
        level: this.level,
      });
    });
  }

  gameOver() {
    if (this.gameEnded) return;
    this.gameEnded = true;

    this.time.delayedCall(2000, () => {
      this.scene.stop('HudScene');
      this.scene.start('GameOverScene', {
        won: false,
        score: this.score,
        level: this.level,
      });
    });
  }
}
