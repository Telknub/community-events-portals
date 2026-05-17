import Phaser from "phaser";
import type { DamagePayload, EnemyLike } from "../../Types";
import { distanceBetween, enemyCenter } from "../../lib/combat/geometry";

type AreaHitboxSpawnProps = {
  x: number;
  y: number;
  texture: string;
  radius: number;
  expiresAt: number;
  payload: DamagePayload;
  hitCooldownMs: number;
  persistent: boolean;
};

export class AreaHitbox extends Phaser.Physics.Arcade.Sprite {
  public payload!: DamagePayload;
  public expiresAt = 0;
  public radius = 0;
  public hitCooldownMs = 0;
  public persistent = false;
  private readonly hitAt = new Map<EnemyLike, number>();

  constructor(scene: Phaser.Scene, x = 0, y = 0, texture = "weapon_hitbox") {
    super(scene, x, y, texture);

    scene.add.existing(this);
    scene.physics.add.existing(this);
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
  }: AreaHitboxSpawnProps) {
    this.setTexture(texture);
    this.setPosition(x, y);
    this.setDisplaySize(radius * 2, radius * 2);
    this.setActive(true);
    this.setVisible(true);
    this.setDepth(Math.floor(y) + 1);
    this.setAlpha(persistent ? 0.45 : 0.65);
    this.payload = payload;
    this.expiresAt = expiresAt;
    this.radius = radius;
    this.hitCooldownMs = hitCooldownMs;
    this.persistent = persistent;
    this.hitAt.clear();

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.enable = true;
    body.setCircle(radius);
    body.setOffset(this.width / 2 - radius, this.height / 2 - radius);
    body.setAllowGravity(false);
    body.setImmovable(true);
  }

  public canHit(enemy: EnemyLike, time: number) {
    if (distanceBetween(this, enemyCenter(enemy)) > this.radius) return false;

    const lastHitAt = this.hitAt.get(enemy) ?? -Infinity;

    if (!this.persistent) return !this.hitAt.has(enemy);

    return time - lastHitAt >= this.hitCooldownMs;
  }

  public registerHit(enemy: EnemyLike, time: number) {
    this.hitAt.set(enemy, time);
  }

  public hasExpired(time: number) {
    return time >= this.expiresAt;
  }

  public despawn() {
    this.setActive(false);
    this.setVisible(false);
    this.hitAt.clear();

    const body = this.body as Phaser.Physics.Arcade.Body | undefined;
    if (!body) return;

    body.stop();
    body.enable = false;
  }
}
