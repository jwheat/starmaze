import Phaser from 'phaser';
import { CONFIG } from '../config.js';

export class HudScene extends Phaser.Scene {
  constructor() {
    super('HudScene');
  }

  create() {
    this.score = 0;
    this.starsCollected = 0;
    this.totalStars = 0;
    this.shieldHP = CONFIG.SHIELD_MAX_HP;
    this.lives = CONFIG.SHIP_LIVES;

    const style = { fontSize: '16px', color: '#ffffff', fontFamily: 'monospace' };

    // Score
    this.scoreText = this.add.text(16, 12, 'SCORE: 0', style).setScrollFactor(0);

    // Stars
    this.starText = this.add.text(16, 34, 'STARS: 0/0', style).setScrollFactor(0);

    // Lives (top-right area)
    this.livesText = this.add.text(CONFIG.WIDTH - 16, 12, '', style)
      .setOrigin(1, 0)
      .setScrollFactor(0);
    this.updateLivesDisplay();

    // Shield HP (below lives)
    this.shieldText = this.add.text(CONFIG.WIDTH - 16, 34, '', style)
      .setOrigin(1, 0)
      .setScrollFactor(0);
    this.updateShieldDisplay();

    // Level indicator
    this.levelText = this.add.text(CONFIG.WIDTH / 2, 12, 'LEVEL 1', style)
      .setOrigin(0.5, 0)
      .setScrollFactor(0);

    // Listen to game events
    const gameScene = this.scene.get('GameScene');

    gameScene.events.on('scoreChanged', (score) => {
      this.score = score;
      this.scoreText.setText(`SCORE: ${score}`);
    });

    gameScene.events.on('starCollected', (collected, total) => {
      this.starsCollected = collected;
      this.totalStars = total;
      this.starText.setText(`STARS: ${collected}/${total}`);
    });

    gameScene.events.on('shieldChanged', (shieldHP) => {
      this.shieldHP = shieldHP;
      this.updateShieldDisplay();
    });

    gameScene.events.on('livesChanged', (lives) => {
      this.lives = lives;
      this.updateLivesDisplay();
    });

    gameScene.events.on('levelChanged', (level) => {
      this.levelText.setText(`LEVEL ${level}`);
    });

    gameScene.events.on('totalStars', (total) => {
      this.totalStars = total;
      this.starText.setText(`STARS: ${this.starsCollected}/${total}`);
    });

    // Message display area (center)
    this.messageText = this.add.text(CONFIG.WIDTH / 2, CONFIG.HEIGHT / 2 - 40, '', {
      fontSize: '24px',
      color: '#00ffff',
      fontFamily: 'monospace',
      align: 'center',
    }).setOrigin(0.5).setScrollFactor(0).setAlpha(0);

    gameScene.events.on('showMessage', (text, duration = 2000) => {
      this.messageText.setText(text);
      this.tweens.add({
        targets: this.messageText,
        alpha: { from: 1, to: 0 },
        duration: duration,
        ease: 'Power2',
      });
    });
  }

  updateLivesDisplay() {
    // Show ship icons for lives
    let display = 'LIVES: ';
    for (let i = 0; i < this.lives; i++) {
      display += '\u25B6 '; // triangle
    }
    this.livesText.setText(display.trim());
    this.livesText.setColor(this.lives <= 1 ? '#ff3333' : '#00ff88');
  }

  updateShieldDisplay() {
    let bar = 'SHIELD: ';
    if (this.shieldHP <= 0) {
      bar += 'DOWN';
      this.shieldText.setColor('#ff3333');
    } else {
      for (let i = 0; i < CONFIG.SHIELD_MAX_HP; i++) {
        bar += i < this.shieldHP ? '\u2588' : '\u2591';
      }
      this.shieldText.setColor(this.shieldHP < CONFIG.SHIELD_MAX_HP ? '#ff8844' : '#4488ff');
    }
    this.shieldText.setText(bar);
  }
}
