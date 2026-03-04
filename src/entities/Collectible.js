import Phaser from 'phaser';

export class Collectible extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture = 'star') {
    super(scene, x, y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.body.setImmovable(true);
    this.body.setAllowGravity(false);

    // Floating animation
    scene.tweens.add({
      targets: this,
      y: y - 4,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Subtle rotation
    scene.tweens.add({
      targets: this,
      angle: 360,
      duration: 4000,
      repeat: -1,
      ease: 'Linear',
    });
  }

  collect() {
    this.body.enable = false;

    // Pickup flash effect
    this.scene.tweens.add({
      targets: this,
      scale: 2,
      alpha: 0,
      duration: 200,
      onComplete: () => {
        this.setActive(false);
        this.setVisible(false);
        this.destroy();
      },
    });
  }
}
