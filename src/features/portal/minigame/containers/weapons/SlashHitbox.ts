import Phaser from "phaser";
import type { DamagePayload, EnemyLike } from "../../Types";
import {
  enemyCenter,
  isWithinCone,
  normalizeVector,
  type Vector,
} from "../../lib/combat/geometry";

type SlashHitboxSpawnProps = {
  x: number;
  y: number;
  texture: string;
  direction: Vector;
  range: number;
  arcDegrees: number;
  expiresAt: number;
  payload: DamagePayload;
};

export class SlashHitbox extends Phaser.Physics.Arcade.Sprite {
  public payload!: DamagePayload;
  public expiresAt = 0;
  public range = 0;
  public arcDegrees = 0;
  public direction: Vector = { x: 1, y: 0 };
  private readonly hitEnemies = new Set<EnemyLike>();

  constructor(scene: Phaser.Scene, x = 0, y = 0, texture = "weapon_slash") {
    super(scene, x, y, texture);

    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.despawn();
  }

  public spawn({
    x,
    y,
    texture,
    direction,
    range,
    arcDegrees,
    expiresAt,
    payload,
  }: SlashHitboxSpawnProps) {
    this.setTexture(texture);
    this.direction = normalizeVector(direction);
    this.range = range;
    this.arcDegrees = arcDegrees;
    this.payload = payload;
    this.expiresAt = expiresAt;
    this.hitEnemies.clear();

    this.setPosition(
      x + this.direction.x * range * 0.45,
      y + this.direction.y * range * 0.45,
    );
    this.setDisplaySize(range, range);
    this.setRotation(Math.atan2(this.direction.y, this.direction.x));
    this.setActive(true);
    this.setVisible(true);
    this.setDepth(Math.floor(y) + 2);
    this.setAlpha(0.7);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.enable = true;
    body.setCircle(range / 2);
    body.setOffset(this.width / 2 - range / 2, this.height / 2 - range / 2);
    body.setAllowGravity(false);
    body.setImmovable(true);

    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: Math.max(80, expiresAt - this.scene.time.now),
    });
  }

  public canHit(enemy: EnemyLike) {
    if (this.hitEnemies.has(enemy)) return false;

    return isWithinCone({
      origin: {
        x: this.x - this.direction.x * this.range * 0.45,
        y: this.y - this.direction.y * this.range * 0.45,
      },
      target: enemyCenter(enemy),
      direction: this.direction,
      range: this.range,
      arcDegrees: this.arcDegrees,
    });
  }

  public registerHit(enemy: EnemyLike) {
    this.hitEnemies.add(enemy);
  }

  public hasExpired(time: number) {
    return time >= this.expiresAt;
  }

  public despawn() {
    this.scene?.tweens.killTweensOf(this);
    this.setActive(false);
    this.setVisible(false);
    this.hitEnemies.clear();

    const body = this.body as Phaser.Physics.Arcade.Body | undefined;
    if (!body) return;

    body.stop();
    body.enable = false;
  }
}
