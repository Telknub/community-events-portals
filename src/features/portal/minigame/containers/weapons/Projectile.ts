import Phaser from "phaser";
import type {
  DamagePayload,
  EnemyLike,
  ProjectileBehavior,
  WeaponId,
} from "../../Types";

export type ProjectileSpawnProps = {
  x: number;
  y: number;
  texture: string;
  velocity: { x: number; y: number };
  bodySize: number;
  expiresAt: number;
  payload: DamagePayload;
  ownerWeaponId: WeaponId;
  behavior: ProjectileBehavior;
  pierce: number;
  bounceCount: number;
  chainRadius: number;
  scale?: number;
};

export class Projectile extends Phaser.Physics.Arcade.Sprite {
  public payload!: DamagePayload;
  public ownerWeaponId!: WeaponId;
  public behavior: ProjectileBehavior = "linear";
  public expiresAt = 0;
  public pierceRemaining = 0;
  public bounceRemaining = 0;
  public chainRadius = 0;
  public readonly hitEnemies = new Set<EnemyLike>();

  constructor(
    scene: Phaser.Scene,
    x = 0,
    y = 0,
    texture = "weapon_projectile",
  ) {
    super(scene, x, y, texture);

    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.despawn();
  }

  public spawn({
    x,
    y,
    texture,
    velocity,
    bodySize,
    expiresAt,
    payload,
    ownerWeaponId,
    behavior,
    pierce,
    bounceCount,
    chainRadius,
    scale = 1,
  }: ProjectileSpawnProps) {
    this.setTexture(texture);
    this.setPosition(x, y);
    this.setScale(scale);
    this.setActive(true);
    this.setVisible(true);
    this.setDepth(Math.floor(y));
    this.payload = payload;
    this.ownerWeaponId = ownerWeaponId;
    this.behavior = behavior;
    this.expiresAt = expiresAt;
    this.pierceRemaining = pierce;
    this.bounceRemaining = bounceCount;
    this.chainRadius = chainRadius;
    this.hitEnemies.clear();

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.enable = true;
    body.setCircle((bodySize * scale) / 2);
    body.setOffset(
      this.width / 2 - (bodySize * scale) / 2,
      this.height / 2 - (bodySize * scale) / 2,
    );
    body.setVelocity(velocity.x, velocity.y);
    body.setAllowGravity(false);
  }

  public registerHit(enemy: EnemyLike) {
    this.hitEnemies.add(enemy);
  }

  public hasHit(enemy: EnemyLike) {
    return this.hitEnemies.has(enemy);
  }

  public hasExpired(time: number) {
    return time >= this.expiresAt;
  }

  public redirectTo(enemy: EnemyLike, speed: number) {
    const body = this.body as Phaser.Physics.Arcade.Body;
    const angle = Phaser.Math.Angle.Between(this.x, this.y, enemy.x, enemy.y);
    body.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
  }

  public despawn() {
    this.setActive(false);
    this.setVisible(false);
    this.hitEnemies.clear();

    const body = this.body as Phaser.Physics.Arcade.Body | undefined;
    if (!body) return;

    body.stop();
    body.enable = false;
  }
}
