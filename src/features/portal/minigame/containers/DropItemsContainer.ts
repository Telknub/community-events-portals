import type { Scene } from "../Scene";
import type { BumpkinContainer } from "../Core/BumpkinContainer";
import type { DropItemType } from "../Types";
import { PASSIVE_ABILITY_ITEM, ORB_DEPTH } from "../constants";
import { WeaponSfxLimiter } from "../lib/combat/WeaponSfxLimiter";

interface Props {
  x: number;
  y: number;
  scene: Scene;
  player?: BumpkinContainer;
  itemKey: DropItemType;
}

export class DropItem extends Phaser.GameObjects.Sprite {
  scene: Scene;
  private player?: BumpkinContainer;
  dropItem?: DropItemType;

  private readonly magnetRangeWithWings = 60;
  private readonly defaultMagnetRange = 50;
  private readonly collectRange = 10;
  private readonly destroyOrb = 10000;
  private readonly magnetCheckInterval = 100;

  private targetRangeSq = 0;
  private readonly collectRangeSq = this.collectRange * this.collectRange;
  private isMagnetized = false;
  private isCollected = false;

  private magnetCheckElapsed = Phaser.Math.Between(0, this.magnetCheckInterval);

  constructor({ scene, x, y, player, itemKey }: Props) {
    super(scene, x, y, itemKey);

    this.scene = scene;
    this.player = player;
    this.dropItem = itemKey;

    scene.add.existing(this);
    this.setDepth(ORB_DEPTH);

    const magnetRange = this.hasPassiveAbility()
      ? this.magnetRangeWithWings
      : this.defaultMagnetRange;
    this.targetRangeSq = magnetRange * magnetRange;

    scene.time.delayedCall(this.destroyOrb, () => {
      if (this.active) {
        this.destroy();
      }
    });
  }

  preUpdate(time: number, delta: number) {
    if (!this.active || this.isCollected) return;

    super.preUpdate(time, delta);

    if (this.scene.portalService?.state.context.isGameplayPaused) {
      return;
    }

    if (this.isMagnetized) {
      this.moveTowardsPlayer(delta);
      return;
    }

    this.magnetCheckElapsed += delta;
    if (this.magnetCheckElapsed < this.magnetCheckInterval) return;

    this.magnetCheckElapsed %= this.magnetCheckInterval;
    this.checkPlayerDistance();
  }

  private checkPlayerDistance() {
    if (!this.player || !this.active || this.isCollected) return;

    const dx = this.player.x - this.x;
    const dy = this.player.y - this.y;
    const distanceSq = dx * dx + dy * dy;

    if (distanceSq <= this.collectRangeSq) {
      this.collect();
      return;
    }

    if (distanceSq <= this.targetRangeSq) {
      this.isMagnetized = true;
    }
  }

  private moveTowardsPlayer(delta: number) {
    if (!this.player || !this.active || this.isCollected) return;

    const dx = this.player.x - this.x;
    const dy = this.player.y - this.y;
    const distanceSq = dx * dx + dy * dy;

    if (distanceSq <= this.collectRangeSq) {
      this.collect();
      return;
    }

    if (distanceSq <= Number.EPSILON) {
      this.collect();
      return;
    }

    const distance = Math.sqrt(distanceSq);
    const speed = Phaser.Math.Clamp(800 / Math.max(distance, 20), 100, 500);
    const movement = speed * Math.max(delta, 0) * 0.001;

    const step = Math.min(movement, distance);
    const scale = step / distance;

    this.x += dx * scale;
    this.y += dy * scale;

    const remainingX = this.player.x - this.x;
    const remainingY = this.player.y - this.y;
    if (
      remainingX * remainingX + remainingY * remainingY <=
      this.collectRangeSq
    ) {
      this.collect();
    }
  }

  public collect() {
    if (
      !this.active ||
      this.isCollected ||
      !this.dropItem ||
      this.scene.portalService?.state.context.isGameplayPaused
    ) {
      return;
    }

    this.isCollected = true;

    WeaponSfxLimiter.play(this.scene, "collect_xp", 0.05, 40);
    this.scene.portalService?.send("COLLECT_ITEM", {
      itemKey: this.dropItem,
    });

    this.destroy();
  }

  private hasPassiveAbility() {
    if (!this.player) return false;

    const item = this.player.clothing.wings;
    return item !== undefined && PASSIVE_ABILITY_ITEM.includes(item);
  }
}
