import Phaser from 'phaser';
import { CONFIG } from '../config.js';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOverScene');
  }

  init(data) {
    this.won = data.won || false;
    this.finalScore = data.score || 0;
    this.level = data.level || 1;
  }

  create() {
    const cx = CONFIG.WIDTH / 2;
    const cy = CONFIG.HEIGHT / 2;

    // Dim background
    this.add.rectangle(cx, cy, CONFIG.WIDTH, CONFIG.HEIGHT, 0x000000, 0.85);

    // Title
    const title = this.won ? 'MAZE CLEARED!' : 'GAME OVER';
    const titleColor = this.won ? '#00ffff' : '#ff3333';
    this.add.text(cx, cy - 80, title, {
      fontSize: '48px',
      color: titleColor,
      fontFamily: 'monospace',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Score
    this.add.text(cx, cy - 20, `FINAL SCORE: ${this.finalScore}`, {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'monospace',
    }).setOrigin(0.5);

    // Level reached
    if (!this.won) {
      this.add.text(cx, cy + 20, `LEVEL REACHED: ${this.level}`, {
        fontSize: '18px',
        color: '#aaaaaa',
        fontFamily: 'monospace',
      }).setOrigin(0.5);
    }

    // Restart prompt
    const restartText = this.won ? 'PRESS SPACE FOR NEXT LEVEL' : 'PRESS SPACE TO RESTART';
    const prompt = this.add.text(cx, cy + 80, restartText, {
      fontSize: '20px',
      color: '#ffdd00',
      fontFamily: 'monospace',
    }).setOrigin(0.5);

    // Blink prompt
    this.tweens.add({
      targets: prompt,
      alpha: { from: 1, to: 0.3 },
      duration: 600,
      yoyo: true,
      repeat: -1,
    });

    // Restart on space
    this.input.keyboard.once('keydown-SPACE', () => {
      this.scene.stop('HudScene');
      this.scene.stop('GameOverScene');
      this.scene.start('GameScene', {
        level: this.won ? this.level + 1 : 1,
        score: this.won ? this.finalScore : 0,
      });
    });
  }
}
