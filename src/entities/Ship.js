import Phaser from 'phaser';
import { CONFIG } from '../config.js';

export class Ship extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'ship');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.body.setSize(20, 20);
    this.body.setOffset(18, 18);
    this.body.setBounce(CONFIG.SHIP_BOUNCE);
    this.body.setDrag(CONFIG.SHIP_DRAG);
    this.body.setMaxVelocity(CONFIG.SHIP_MAX_SPEED);
    this.body.setCollideWorldBounds(true);

    this.lives = CONFIG.SHIP_LIVES;
    this.shieldHP = CONFIG.SHIELD_MAX_HP;
    this.lastFired = 0;
    this.alive = true;
    this.invulnerable = false;
    this.respawning = false;

    // Fuel state
    this.fuel = CONFIG.FUEL_MAX;
    this.fuelEmpty = false;
    this.graceTimer = 0;
    this.graceActive = false;

    // Thrust flame
    this.flame = scene.add.sprite(x, y, 'flame');
    this.flame.setVisible(false);
    this.flame.setDepth(this.depth - 1);

    // Shield bubble (graphics drawn each frame)
    this.shieldGfx = scene.add.graphics();
    this.shieldGfx.setDepth(this.depth + 1);

    // Audio context for procedural sounds
    this.audioCtx = null;
  }

  getAudioCtx() {
    if (!this.audioCtx) {
      try {
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) {
        // Web Audio not available
      }
    }
    return this.audioCtx;
  }

  playExplosionSound() {
    const ctx = this.getAudioCtx();
    if (!ctx) return;
    try {
      if (ctx.state === 'suspended') ctx.resume();
      const duration = 0.4;
      const sampleRate = ctx.sampleRate;
      const bufferSize = Math.floor(sampleRate * duration);
      const buffer = ctx.createBuffer(1, bufferSize, sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        const t = i / sampleRate;
        const decay = Math.pow(1 - i / bufferSize, 3);
        const noise = (Math.random() * 2 - 1) * decay;
        const rumble = Math.sin(t * 80 * Math.PI * 2) * decay * 0.5;
        data[i] = (noise * 0.6 + rumble) * 0.4;
      }
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.5, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      source.connect(gain);
      gain.connect(ctx.destination);
      source.start();
    } catch (e) {
      // Fail silently
    }
  }

  playShieldHitSound() {
    const ctx = this.getAudioCtx();
    if (!ctx) return;
    try {
      if (ctx.state === 'suspended') ctx.resume();
      const duration = 0.15;
      const sampleRate = ctx.sampleRate;
      const bufferSize = Math.floor(sampleRate * duration);
      const buffer = ctx.createBuffer(1, bufferSize, sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        const t = i / sampleRate;
        const decay = Math.pow(1 - i / bufferSize, 2);
        // High-pitched ping
        data[i] = Math.sin(t * 800 * Math.PI * 2) * decay * 0.3;
      }
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start();
    } catch (e) {
      // Fail silently
    }
  }

  playShieldBreakSound() {
    const ctx = this.getAudioCtx();
    if (!ctx) return;
    try {
      if (ctx.state === 'suspended') ctx.resume();
      const duration = 0.3;
      const sampleRate = ctx.sampleRate;
      const bufferSize = Math.floor(sampleRate * duration);
      const buffer = ctx.createBuffer(1, bufferSize, sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        const t = i / sampleRate;
        const decay = Math.pow(1 - i / bufferSize, 2);
        // Glass shatter: high noise + descending tone
        const noise = (Math.random() * 2 - 1) * decay * 0.4;
        const tone = Math.sin(t * (1200 - t * 2000) * Math.PI * 2) * decay * 0.3;
        data[i] = noise + tone;
      }
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start();
    } catch (e) {
      // Fail silently
    }
  }

  updateFuel(delta) {
    if (!this.alive || this.respawning) return;

    // Clamp delta to prevent tab-away death spikes
    const dt = Math.min(delta, 100) / 1000;

    if (this.graceActive) {
      this.graceTimer -= Math.min(delta, 100);
      this.scene.events.emit('graceTimerChanged', this.graceTimer);
      if (this.graceTimer <= 0) {
        this.fuelDeath();
      }
      return;
    }

    // Passive drain
    this.fuel -= CONFIG.FUEL_PASSIVE_DRAIN * dt;

    if (this.fuel <= 0) {
      this.fuel = 0;
      this.fuelEmpty = true;
      this.graceActive = true;
      this.graceTimer = CONFIG.FUEL_GRACE_PERIOD;
      this.scene.events.emit('fuelEmpty');
      this.scene.events.emit('showMessage', 'FUEL EMPTY!', 2000);
    }
  }

  addFuel(amount) {
    this.fuel = Math.min(this.fuel + amount, CONFIG.FUEL_MAX);
    this.fuelEmpty = false;
    if (this.graceActive) {
      this.graceActive = false;
      this.graceTimer = 0;
      this.scene.events.emit('graceTimerChanged', 0);
    }
    this.scene.events.emit('fuelChanged', this.fuel);
  }

  resetFuel() {
    this.fuel = CONFIG.FUEL_MAX;
    this.fuelEmpty = false;
    this.graceActive = false;
    this.graceTimer = 0;
  }

  fuelDeath() {
    // Fuel death bypasses shields — it's a strategic failure
    this.graceActive = false;
    this.graceTimer = 0;
    this.scene.events.emit('graceTimerChanged', 0);

    this.lives--;
    this.scene.events.emit('livesChanged', this.lives);
    this.spawnExplosion();
    this.playExplosionSound();
    this.scene.cameras.main.shake(300, 0.015);

    if (this.lives <= 0) {
      this.die();
      this.scene.events.emit('fuelDeathGameOver');
      return;
    }

    // Respawn with full fuel and shield
    this.resetFuel();
    this.shieldHP = CONFIG.SHIELD_MAX_HP;
    this.scene.events.emit('shieldChanged', this.shieldHP);
    this.scene.events.emit('fuelChanged', this.fuel);
    this.startRespawn();
  }

  handleInput(cursors, wasd, time, delta) {
    if (!this.alive || this.respawning) return;

    // Update fuel
    this.updateFuel(delta);

    // Rotation (always works, even without fuel)
    if (cursors.left.isDown || wasd.left.isDown) {
      this.body.setAngularVelocity(-CONFIG.SHIP_ROTATE_SPEED);
    } else if (cursors.right.isDown || wasd.right.isDown) {
      this.body.setAngularVelocity(CONFIG.SHIP_ROTATE_SPEED);
    } else {
      this.body.setAngularVelocity(0);
    }

    // Thrust (disabled when fuel empty)
    if ((cursors.up.isDown || wasd.up.isDown) && !this.fuelEmpty) {
      this.scene.physics.velocityFromRotation(
        Phaser.Math.DegToRad(this.angle),
        CONFIG.SHIP_THRUST,
        this.body.acceleration
      );
      this.flame.setVisible(true);

      // Extra thrust drain
      const dt = Math.min(delta, 100) / 1000;
      this.fuel -= CONFIG.FUEL_THRUST_DRAIN * dt;
      if (this.fuel <= 0) {
        this.fuel = 0;
        this.fuelEmpty = true;
        this.graceActive = true;
        this.graceTimer = CONFIG.FUEL_GRACE_PERIOD;
        this.scene.events.emit('fuelEmpty');
        this.scene.events.emit('showMessage', 'FUEL EMPTY!', 2000);
      }
    } else {
      this.body.setAcceleration(0);
      this.flame.setVisible(false);
    }

    // Emit fuel state each frame
    this.scene.events.emit('fuelChanged', this.fuel);

    // Position flame behind ship
    const flameAngle = Phaser.Math.DegToRad(this.angle + 180);
    this.flame.x = this.x + Math.cos(flameAngle) * 22;
    this.flame.y = this.y + Math.sin(flameAngle) * 22;
    this.flame.setRotation(Phaser.Math.DegToRad(this.angle));
    this.flame.setScale(0.8 + Math.random() * 0.4);

    // Draw shield bubble
    this.drawShield();
  }

  drawShield() {
    this.shieldGfx.clear();
    if (this.shieldHP <= 0 || !this.visible) return;

    const alpha = this.shieldHP === CONFIG.SHIELD_MAX_HP ? 0.3 : 0.15;
    const color = this.shieldHP === CONFIG.SHIELD_MAX_HP ? CONFIG.COLOR_SHIELD : 0xff8844;

    this.shieldGfx.lineStyle(1.5, color, alpha + 0.2);
    this.shieldGfx.strokeCircle(this.x, this.y, 22);

    if (this.shieldHP < CONFIG.SHIELD_MAX_HP) {
      // Cracked: draw dashed/broken lines
      this.shieldGfx.lineStyle(1, 0xff4444, 0.4);
      for (let i = 0; i < 4; i++) {
        const a = (Math.PI / 2) * i + 0.3;
        const x1 = this.x + Math.cos(a) * 18;
        const y1 = this.y + Math.sin(a) * 18;
        const x2 = this.x + Math.cos(a) * 26;
        const y2 = this.y + Math.sin(a) * 26;
        this.shieldGfx.lineBetween(x1, y1, x2, y2);
      }
    }
  }

  takeDamage() {
    if (this.invulnerable || !this.alive || this.respawning) return false;

    if (this.shieldHP > 0) {
      // Shield absorbs the hit
      this.shieldHP--;
      this.scene.events.emit('shieldChanged', this.shieldHP);
      this.scene.cameras.main.shake(150, 0.008);

      if (this.shieldHP > 0) {
        // Shield cracked but holding
        this.playShieldHitSound();
        this.shieldFlash();
        return false;
      } else {
        // Shield shattered!
        this.playShieldBreakSound();
        this.shatterShield();
        this.scene.events.emit('showMessage', 'SHIELD DOWN!', 1500);
        // Brief invulnerability after shield breaks
        this.invulnerable = true;
        this.scene.tweens.add({
          targets: this,
          alpha: { from: 0.3, to: 1 },
          duration: 100,
          repeat: 5,
          onComplete: () => {
            this.invulnerable = false;
            this.setAlpha(1);
          },
        });
        return false;
      }
    }

    // No shield — lose a life
    this.lives--;
    this.scene.events.emit('livesChanged', this.lives);
    this.spawnExplosion();
    this.playExplosionSound();
    this.scene.cameras.main.shake(300, 0.015);

    if (this.lives <= 0) {
      this.die();
      return true; // truly dead
    }

    // Respawn with fresh shield
    this.shieldHP = CONFIG.SHIELD_MAX_HP;
    this.scene.events.emit('shieldChanged', this.shieldHP);
    this.startRespawn();
    return false;
  }

  shieldFlash() {
    // Brief bright flash on the shield ring
    const flashGfx = this.scene.add.graphics();
    flashGfx.lineStyle(3, 0xffffff, 0.8);
    flashGfx.strokeCircle(this.x, this.y, 22);
    this.scene.tweens.add({
      targets: flashGfx,
      alpha: 0,
      duration: 200,
      onComplete: () => flashGfx.destroy(),
    });
  }

  shatterShield() {
    // Spawn shard particles flying outward
    if (!this.scene.textures.exists('shieldShard')) return;
    const emitter = this.scene.add.particles(this.x, this.y, 'shieldShard', {
      speed: { min: 80, max: 200 },
      scale: { start: 1.5, end: 0 },
      lifespan: 500,
      quantity: 16,
      emitting: false,
      tint: [CONFIG.COLOR_SHIELD, 0x88bbff, 0xffffff],
      rotate: { min: 0, max: 360 },
    });
    emitter.explode(16);
    this.shieldGfx.clear();
  }

  restoreShield() {
    this.shieldHP = CONFIG.SHIELD_MAX_HP;
    this.scene.events.emit('shieldChanged', this.shieldHP);
  }

  addLife() {
    this.lives++;
    this.scene.events.emit('livesChanged', this.lives);
  }

  spawnExplosion() {
    if (!this.scene || !this.scene.textures.exists('particle')) return;
    const emitter = this.scene.add.particles(this.x, this.y, 'particle', {
      speed: { min: 60, max: 250 },
      scale: { start: 2, end: 0 },
      lifespan: 700,
      quantity: 25,
      emitting: false,
      tint: [CONFIG.COLOR_SHIP, 0xffffff, CONFIG.COLOR_EXPLOSION, 0xffff00],
    });
    emitter.explode(25);
  }

  startRespawn() {
    this.respawning = true;
    this.invulnerable = true;
    this.setVisible(false);
    this.flame.setVisible(false);
    this.shieldGfx.clear();
    this.body.setVelocity(0);
    this.body.setAcceleration(0);
    this.body.enable = false;

    this.scene.time.delayedCall(600, () => {
      this.scene.events.emit('requestRespawn');
    });
  }

  respawn(x, y) {
    this.body.enable = true;
    this.body.reset(x, y);
    this.setVisible(true);
    this.respawning = false;
    this.setAlpha(1);
    this.resetFuel();

    this.scene.tweens.add({
      targets: this,
      alpha: { from: 0.3, to: 1 },
      duration: 150,
      repeat: Math.floor(CONFIG.RESPAWN_INVULN_TIME / 300),
      yoyo: true,
      onComplete: () => {
        this.invulnerable = false;
        this.setAlpha(1);
      },
    });
  }

  die() {
    this.alive = false;
    this.flame.setVisible(false);
    this.shieldGfx.clear();
    this.body.setVelocity(0);
    this.body.setAcceleration(0);

    if (this.scene && this.scene.textures.exists('particle')) {
      const emitter = this.scene.add.particles(this.x, this.y, 'particle', {
        speed: { min: 80, max: 300 },
        scale: { start: 2.5, end: 0 },
        lifespan: 900,
        quantity: 35,
        emitting: false,
        tint: [CONFIG.COLOR_SHIP, 0xffffff, CONFIG.COLOR_EXPLOSION, 0xffff00],
      });
      emitter.explode(35);
    }

    this.setVisible(false);
    this.body.enable = false;
  }

  destroy(fromScene) {
    if (this.flame) this.flame.destroy();
    if (this.shieldGfx) this.shieldGfx.destroy();
    super.destroy(fromScene);
  }
}
