import { BumpkinContainer } from "../Core/BumpkinContainer";
import { Scene } from "../Scene";
import { SwarmMob } from "./SwarmMobContainer";

interface Props {
  x: number;
  y: number;
  scene: Scene;
  player?: BumpkinContainer;
}

export class Weapons extends Phaser.Physics.Arcade.Sprite {
  scene: Scene;
  private isDefeat = false;
  private player?: BumpkinContainer;
  public angleOffset = 0;
  private orbitRadius = 40;
  private orbitSpeed = 0.03;

  constructor({ x, y, scene, player }: Props) {
    super(scene, x, y, scene.weaponSprite);
    this.player = player;
    this.scene = scene;

    scene.add.existing(this);
    scene.physics.world.enable(this);

    this.setDepth(100000000000);
    this.setScale(0.6);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(this.width * 0.6, this.height * 0.6);
    body.setOffset(this.width * 0.2, this.height * 0.2);

    // random starting angle
    this.angleOffset = Phaser.Math.FloatBetween(0, Math.PI * 2);
    this.createOrbitMovement();
    this.handleOverlay();
  }

  createOrbitMovement() {
    this.scene.events.on("update", () => {
      if (!this.player) return;
      this.angleOffset += this.orbitSpeed;

      const orbitX =
        this.player.x + Math.cos(this.angleOffset) * this.orbitRadius;

      const orbitY =
        this.player.y + Math.sin(this.angleOffset) * this.orbitRadius;

      this.setPosition(orbitX, orbitY);
    });
  }

  handleOverlay() {
    this.scene.physics.add.overlap(
      this.scene.weaponsGroup,
      this.scene.swarmGroup,
      (_power, enemy) => {
        const swarmEnemy = enemy as SwarmMob;
        this.scene.createDropItems({
          x: swarmEnemy.x,
          y: swarmEnemy.y,
        });
        enemy.destroy();

        for (let i = 0; i < 1; i++) {
          this.scene.createSwarmEnemies();
        }
      },
    );
  }
}
