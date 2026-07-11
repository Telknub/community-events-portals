import Phaser from "phaser";
import type { DamagePayload, EnemyLike } from "../../Types";
import { enemyCenter } from "../../lib/combat/geometry";
import { getWeaponVisualDepth } from "../../constants/DepthConstants";

type AreaHitboxShape = "circle" | "spriteBounds";
type AreaHitboxSize = { width: number; height: number };

type AreaHitboxSpawnProps = {
  x: number;
  y: number;
  texture: string;
  radius: number;
  expiresAt: number;
  payload: DamagePayload;
  hitCooldownMs: number;
  persistent: boolean;
  animationKey?: string;
  despawnOnAnimationComplete?: boolean;
  hitboxShape?: AreaHitboxShape;
  hitboxSize?: AreaHitboxSize;
};

export class AreaHitbox extends Phaser.GameObjects.Sprite {
  public payload!: DamagePayload;
  public expiresAt = 0;
  public radius = 0;
  public hitCooldownMs = 0;
  public persistent = false;
  private hitboxShape: AreaHitboxShape = "circle";
  private hitboxWidth = 0;
  private hitboxHeight = 0;
  private despawnWhenAnimationCompletes = false;
  private readonly hitAt = new Map<EnemyLike, number>();

  constructor(scene: Phaser.Scene, x = 0, y = 0, texture = "weapon_hitbox") {
    super(scene, x, y, texture);

    scene.add.existing(this);
    this.despawn();
  }

  public spawn({
    x,
    y,
    texture,
    radius,
    expiresAt,
    payload,
    hitCooldownMs,
    persistent,
    animationKey,
    despawnOnAnimationComplete = false,
    hitboxShape = "circle",
    hitboxSize,
  }: AreaHitboxSpawnProps) {
    this.setTexture(texture);
    this.setPosition(x, y);
    this.setDisplaySize(radius * 2, radius * 2);
    this.setActive(true);
    this.setVisible(true);
    this.setDepth(getWeaponVisualDepth(y));
    this.setAlpha(animationKey ? 1 : persistent ? 0.45 : 0.65);
    this.payload = payload;
    this.expiresAt = expiresAt;
    this.radius = radius;
    this.hitCooldownMs = hitCooldownMs;
    this.persistent = persistent;
    this.hitboxShape = hitboxShape;
    this.despawnWhenAnimationCompletes = false;
    this.hitAt.clear();
    this.off(Phaser.Animations.Events.ANIMATION_COMPLETE);

    if (animationKey && this.scene.anims.exists(animationKey)) {
      this.play(animationKey, true);
      if (despawnOnAnimationComplete) {
        this.despawnWhenAnimationCompletes = true;
        this.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
          this.despawn();
        });
      }
    } else {
      this.anims.stop();
    }

    this.hitboxWidth = hitboxSize?.width ?? radius * 2;
    this.hitboxHeight = hitboxSize?.height ?? radius * 2;
  }

  public canHit(enemy: EnemyLike, time: number) {
    const center = enemyCenter(enemy);
    const dx = center.x - this.x;
    const dy = center.y - this.y;

    if (this.hitboxShape === "circle") {
      if (dx * dx + dy * dy > this.radius * this.radius) return false;
    } else if (
      Math.abs(dx) > this.hitboxWidth / 2 ||
      Math.abs(dy) > this.hitboxHeight / 2
    ) {
      return false;
    }

    const lastHitAt = this.hitAt.get(enemy) ?? -Infinity;

    if (!this.persistent) return !this.hitAt.has(enemy);

    return time - lastHitAt >= this.hitCooldownMs;
  }

  public registerHit(enemy: EnemyLike, time: number) {
    this.hitAt.set(enemy, time);
  }

  public getQueryBounds() {
    if (this.hitboxShape === "circle") {
      return { halfWidth: this.radius, halfHeight: this.radius };
    }

    return {
      halfWidth: this.hitboxWidth / 2,
      halfHeight: this.hitboxHeight / 2,
    };
  }

  public hasExpired(time: number) {
    if (this.despawnWhenAnimationCompletes) return false;

    return time >= this.expiresAt;
  }

  public despawn() {
    this.off(Phaser.Animations.Events.ANIMATION_COMPLETE);
    this.anims.stop();
    this.hitboxShape = "circle";
    this.despawnWhenAnimationCompletes = false;
    this.setActive(false);
    this.setVisible(false);
    this.hitAt.clear();

    this.hitboxWidth = 0;
    this.hitboxHeight = 0;
  }
}
