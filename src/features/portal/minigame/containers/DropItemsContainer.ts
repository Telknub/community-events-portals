import type { Scene } from "../Scene";
import type { BumpkinContainer } from "../Core/BumpkinContainer";
import type { DropItemType } from "../Types";
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
  private magnetRangeWithWings = 50;
  private defaultMagnetRange = 40;
  private readonly destroyOrb = 10000;
  private targetRangeSq = 0;

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

    const range = this.hasPassiveAbility()
      ? this.magnetRangeWithWings
      : this.defaultMagnetRange;
    this.targetRangeSq = range * range;

    this.handleCollision();

    scene.time.delayedCall(this.destroyOrb, () => {
      if (this.active) {
        this.destroy();
      }
    });
  }

  preUpdate(time: number, delta: number) {
    if (!this.active || !this.body) return;

    super.preUpdate(time, delta);

    if (this.scene.portalService?.state.context.isGameplayPaused) {
      this.setVelocity(0, 0);
      return;
    }

    this.updateMagnet();
  }

  public updateMagnet() {
    if (!this.player || !this.active || !this.body) return;

    const dx = this.x - this.player.x;
    const dy = this.y - this.player.y;
    const distanceSq = dx * dx + dy * dy;

    if (distanceSq <= this.targetRangeSq) {
      const distance = Math.sqrt(distanceSq);
      const speed = Phaser.Math.Clamp(800 / Math.max(distance, 20), 100, 500);

      this.scene.physics.moveToObject(this, this.player, speed);
    } else {
      if (this.body.velocity.x !== 0 || this.body.velocity.y !== 0) {
        this.setVelocity(0, 0);
      }
    }
  }

  handleCollision() {
    if (!this.player) return;

    this.scene.physics.add.overlap(
      this,
      this.player,
      () => {
        if (
          !this.active ||
          !this.scene ||
          this.scene.portalService?.state.context.isGameplayPaused
        )
          return;

        this.scene.sound.play("collect_xp", { volume: 0.2 });

        this.scene.portalService?.send("COLLECT_ITEM", {
          itemKey: this.dropItem!,
        });

        this.destroy();
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
