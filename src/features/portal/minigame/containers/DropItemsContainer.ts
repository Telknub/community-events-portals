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
  private magnetRangeWithWings = 150;
  private defaultMagnetRange = 40;
  private readonly destroyOrb = 10000;

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
    // this.hasPassiveAbility();

    scene.time.delayedCall(this.destroyOrb, () => {
      if (this.active) {
        this.destroy();
      }
    });
  }

  preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);

    if (this.scene.portalService?.state.context.isGameplayPaused) {
      this.setVelocity(0, 0);
      return;
    }

    this.updateMagnet();
  }

  public updateMagnet() {
    if (!this.player || !this.active) return;

    const magnetRange = this.hasPassiveAbility()
      ? this.magnetRangeWithWings
      : this.defaultMagnetRange;

    const distance = Phaser.Math.Distance.Between(
      this.x,
      this.y,
      this.player.x,
      this.player.y,
    );

    if (distance <= magnetRange) {
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
        if (this.scene.portalService?.state.context.isGameplayPaused) return;

        this.scene.sound.play("collect_xp", { volume: 0.2 });
        this.destroy();
        scene.portalService?.send("COLLECT_ITEM", { itemKey: this.dropItem! });
      },
      undefined,
      this,
    );
  }

  private hasPassiveAbility() {
    if (!this.player) return false;

    const item = this.player.clothing.wings;
    return item != undefined && PASSIVE_ABILITY_ITEM.includes(item);
  }
}
