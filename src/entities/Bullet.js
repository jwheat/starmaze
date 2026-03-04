import Phaser from 'phaser';
import { CONFIG } from '../config.js';

export class Bullet extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture) {
    super(scene, x, y, texture);
    this.lifespan = 0;
    this.bounces = 0;
    this.maxBounces = 0; // 0 = no bouncing (enemy bullets), 1 = one bounce (player)
  }

  fire(x, y, angle, maxBounces = 0) {
    this.body.reset(x, y);
    this.setActive(true);
    this.setVisible(true);
    this.setRotation(angle);
    this.lifespan = CONFIG.BULLET_LIFESPAN;
    this.bounces = 0;
    this.maxBounces = maxBounces;
    this.body.setBounce(maxBounces > 0 ? 1 : 0);

    this.scene.physics.velocityFromRotation(
      angle,
      CONFIG.BULLET_SPEED,
      this.body.velocity
    );
  }

  wallHit() {
    this.bounces++;
    if (this.bounces > this.maxBounces) {
      this.kill();
    } else {
      // Update rotation to match new velocity direction after bounce
      this.setRotation(Math.atan2(this.body.velocity.y, this.body.velocity.x));
    }
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    this.lifespan -= delta;
    if (this.lifespan <= 0) {
      this.kill();
    }
  }

  kill() {
    this.setActive(false);
    this.setVisible(false);
    if (this.body) {
      this.body.stop();
      this.body.enable = false;
    }
  }
}

/**
 * Create an object-pooled bullet group.
 */
export function createBulletGroup(scene, texture = 'bullet') {
  const group = scene.physics.add.group({
    classType: Bullet,
    maxSize: CONFIG.BULLET_POOL_SIZE,
    defaultKey: texture,
  });

  // Pre-create bullets
  for (let i = 0; i < CONFIG.BULLET_POOL_SIZE; i++) {
    const b = new Bullet(scene, 0, 0, texture);
    group.add(b, true);
    b.setActive(false);
    b.setVisible(false);
    if (b.body) b.body.enable = false;
  }

  return group;
}
