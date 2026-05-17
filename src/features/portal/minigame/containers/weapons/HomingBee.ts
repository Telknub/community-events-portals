import Phaser from "phaser";
import type { DamagePayload, EnemyLike } from "../../Types";
import type { TargetingSystem } from "../../lib/combat/TargetingSystem";
import { enemyCenter } from "../../lib/combat/geometry";

type HomingBeeSpawnProps = {
  x: number;
  y: number;
  texture: string;
  speed: number;
  expiresAt: number;
  payload: DamagePayload;
  hitCooldownMs: number;
};

export class HomingBee extends Phaser.Physics.Arcade.Sprite {
  public payload!: DamagePayload;
  public expiresAt = 0;
  public speed = 0;
  public hitCooldownMs = 0;
  private target?: EnemyLike;
  private nextRetargetAt = 0;
  private readonly hitAt = new Map<EnemyLike, number>();

  constructor(scene: Phaser.Scene, x = 0, y = 0, texture = "weapon_bee") {
    super(scene, x, y, texture);

    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.despawn();
  }

  public spawn({
    x,
    y,
    texture,
    speed,
    expiresAt,
    payload,
    hitCooldownMs,
  }: HomingBeeSpawnProps) {
    this.setTexture(texture);
    this.setPosition(x, y);
    this.setActive(true);
    this.setVisible(true);
    this.setDepth(Math.floor(y) + 2);
    this.payload = payload;
    this.speed = speed;
    this.expiresAt = expiresAt;
    this.hitCooldownMs = hitCooldownMs;
    this.target = undefined;
    this.nextRetargetAt = 0;
    this.hitAt.clear();

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.enable = true;
    body.setCircle(5);
    body.setOffset(this.width / 2 - 5, this.height / 2 - 5);
    body.setAllowGravity(false);
  }

  public steer(time: number, targeting: TargetingSystem) {
    if (time >= this.nextRetargetAt || !this.target?.active) {
      this.target = targeting.nearest(this);
      this.nextRetargetAt = time + 180;
    }

    const body = this.body as Phaser.Physics.Arcade.Body;

    if (!this.target) {
      body.setVelocity(0, 0);
      return;
    }

    const target = enemyCenter(this.target);
    const angle = Phaser.Math.Angle.Between(this.x, this.y, target.x, target.y);
    const current = this.rotation;
    const rotation = Phaser.Math.Angle.RotateTo(current, angle, 0.15);

    this.setRotation(rotation);
    body.setVelocity(
      Math.cos(rotation) * this.speed,
      Math.sin(rotation) * this.speed,
    );
    this.setDepth(Math.floor(this.y) + 2);
  }

  public canHit(enemy: EnemyLike, time: number) {
    const lastHitAt = this.hitAt.get(enemy) ?? -Infinity;

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
    this.target = undefined;
    this.hitAt.clear();

    const body = this.body as Phaser.Physics.Arcade.Body | undefined;
    if (!body) return;

    body.stop();
    body.enable = false;
  }
}
