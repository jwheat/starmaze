import Phaser from 'phaser';
import { CONFIG } from '../config.js';

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, type = 'normal') {
    const texture = type === 'turret' ? 'turret' : 'enemy';
    super(scene, x, y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.enemyType = type;

    this.body.setSize(24, 24);
    this.body.setOffset(12, 12);
    this.body.setBounce(0.8);
    this.body.setCollideWorldBounds(true);

    if (this.enemyType === 'turret') {
      this.body.setImmovable(true);
    }

    this.alive = true;
    this.lastFired = 0;
    this.patrolDir = Phaser.Math.Between(0, 3); // 0=up, 1=right, 2=down, 3=left
    this.patrolTimer = 0;
    this.chasing = false;
  }

  get detectRange() {
    return this.enemyType === 'turret' ? CONFIG.TURRET_DETECT_RANGE : CONFIG.ENEMY_DETECT_RANGE;
  }

  get fireRate() {
    return this.enemyType === 'turret' ? CONFIG.TURRET_FIRE_RATE : CONFIG.ENEMY_FIRE_RATE;
  }

  update(time, delta, player, wallLayer, enemyBullets) {
    if (!this.alive || !this.active) return;
    if (!player || !player.alive) {
      if (this.enemyType !== 'turret') this.patrol(delta);
      return;
    }

    const dist = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
    const hasLOS = dist < this.detectRange && this.checkLOS(player, wallLayer);

    if (this.enemyType === 'turret') {
      this.body.setVelocity(0, 0);
      if (hasLOS) {
        const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
        this.setRotation(angle);

        if (time > this.lastFired + this.fireRate && enemyBullets) {
          this.shoot(angle, enemyBullets);
          this.lastFired = time;
        }
      }
      return;
    }

    // Normal enemy behavior
    if (hasLOS) {
      this.chasing = true;
      const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
      this.body.setVelocity(
        Math.cos(angle) * CONFIG.ENEMY_CHASE_SPEED,
        Math.sin(angle) * CONFIG.ENEMY_CHASE_SPEED
      );
      this.setRotation(angle);

      if (time > this.lastFired + this.fireRate && enemyBullets) {
        this.shoot(angle, enemyBullets);
        this.lastFired = time;
      }
    } else {
      this.chasing = false;
      this.patrol(delta);
    }
  }

  checkLOS(player, wallLayer) {
    if (!wallLayer) return false;
    const line = new Phaser.Geom.Line(this.x, this.y, player.x, player.y);
    const tiles = wallLayer.getTilesWithinShape(line);
    for (const tile of tiles) {
      if (tile && tile.index === 1) {
        return false;
      }
    }
    return true;
  }

  patrol(delta) {
    this.patrolTimer += delta;
    if (this.patrolTimer > 2000 || this.body.blocked.up || this.body.blocked.down ||
        this.body.blocked.left || this.body.blocked.right) {
      this.patrolDir = Phaser.Math.Between(0, 3);
      this.patrolTimer = 0;
    }

    const speed = CONFIG.ENEMY_SPEED;
    switch (this.patrolDir) {
      case 0: this.body.setVelocity(0, -speed); break;
      case 1: this.body.setVelocity(speed, 0); break;
      case 2: this.body.setVelocity(0, speed); break;
      case 3: this.body.setVelocity(-speed, 0); break;
    }

    // Face movement direction
    this.setRotation(Math.atan2(this.body.velocity.y, this.body.velocity.x));
  }

  shoot(angle, bulletGroup) {
    const bullet = bulletGroup.getFirstDead(false);
    if (bullet) {
      bullet.body.enable = true;
      const offsetX = Math.cos(angle) * 20;
      const offsetY = Math.sin(angle) * 20;
      bullet.fire(this.x + offsetX, this.y + offsetY, angle);
    }
  }

  die() {
    this.alive = false;
    this.body.enable = false;

    const tintColor = this.enemyType === 'turret' ? CONFIG.COLOR_TURRET : CONFIG.COLOR_ENEMY;

    // Explosion
    if (this.scene.textures.exists('particle')) {
      const emitter = this.scene.add.particles(this.x, this.y, 'particle', {
        speed: { min: 30, max: 150 },
        scale: { start: 1, end: 0 },
        lifespan: 500,
        quantity: 12,
        emitting: false,
        tint: [tintColor, 0xff8800, 0xffff00],
      });
      emitter.explode(12);
    }

    this.setVisible(false);
    this.setActive(false);
  }
}
