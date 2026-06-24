import { Scene } from "../Scene";
import { BumpkinContainer } from "../Core/BumpkinContainer";
import { DropItemType } from "../Types";
import { PASSIVE_ABILITY_ITEM, ORB_DEPTH } from "../constants";

interface Props {
  x: number;
  y: number;
  scene: Scene;
  player?: BumpkinContainer;
  itemKey: DropItemType;
}

export class DropItem extends Phaser.Physics.Arcade.Sprite {
  scene: Scene;
  private player?: BumpkinContainer;
  dropItem?: DropItemType;
  private magnetRange = 120;
  private magnetEnabled = false;

  constructor({ scene, x, y, player, itemKey }: Props) {
    super(scene, x, y, itemKey);
    this.scene = scene;
    this.player = player;
    this.dropItem = itemKey;

    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDepth(ORB_DEPTH);
    (this.body as Phaser.Physics.Arcade.Body).setImmovable(true);
    this.postFX.addGlow(0xffd966, 1.5, 0, false, 0.03, 24);

    this.handleCollision();
    this.applyMagnetState();
  }

  preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);

    this.updateMagnet();
  }

  public updateMagnet() {
    if (!this.player || !this.active || !this.magnetEnabled) return;

    const magnetWearable = this.player.clothing.aura;

    const distance = Phaser.Math.Distance.Between(
      this.x,
      this.y,
      this.player.x,
      this.player.y,
    );

    if (distance <= this.magnetRange) {
      const speed = Phaser.Math.Clamp(800 / Math.max(distance, 20), 100, 500);

      this.scene.physics.moveToObject(this, this.player, speed);
    } else {
      this.setVelocity(0, 0);
    }
  }

  handleCollision() {
    if (!this.player) return;

    const scene = this.scene;
    this.scene.physics.add.overlap(
      this,
      this.player,
      () => {
        this.scene.sound.play("collect_xp", { volume: 0.2 });
        this.destroy();
        scene.portalService?.send("COLLECT_ITEM", { itemKey: this.dropItem! });
      },
      undefined,
      this,
    );
  }

  private applyMagnetState() {
    if (!this.player) return;

    const item = this.player.clothing.wings;

    this.magnetEnabled =
      item != undefined && PASSIVE_ABILITY_ITEM.includes(item);

    if (!this.magnetEnabled) {
      this.magnetEnabled = false;
      this.setVelocity(0, 0);
    }
  }
}
