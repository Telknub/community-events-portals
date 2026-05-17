import Phaser from "phaser";
import type { DamagePayload, EnemyLike, WeaponId } from "../../Types";

type OrbitalWeaponSpawnProps = {
  ownerWeaponId: WeaponId;
  texture: string;
  slot: number;
  count: number;
  radius: number;
  angularSpeed: number;
  payload: DamagePayload;
  hitCooldownMs: number;
  bodySize?: number;
};

export class OrbitalWeapon extends Phaser.Physics.Arcade.Sprite {
  public ownerWeaponId!: WeaponId;
  public payload!: DamagePayload;
  public radius = 0;
  public angularSpeed = 0;
  public hitCooldownMs = 0;
  private baseAngle = 0;
  private readonly hitAt = new Map<EnemyLike, number>();

  constructor(scene: Phaser.Scene, x = 0, y = 0, texture = "weapon_hoe") {
    super(scene, x, y, texture);

    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.despawn();
  }

  public spawn({
    ownerWeaponId,
    texture,
    slot,
    count,
    radius,
    angularSpeed,
    payload,
    hitCooldownMs,
    bodySize = 12,
  }: OrbitalWeaponSpawnProps) {
    this.setTexture(texture);
    this.setActive(true);
    this.setVisible(true);
    this.setScale(ownerWeaponId === "sunflower" ? 0.85 : 1);
    this.ownerWeaponId = ownerWeaponId;
    this.radius = radius;
    this.angularSpeed = angularSpeed;
    this.payload = payload;
    this.hitCooldownMs = hitCooldownMs;
    this.baseAngle = (Math.PI * 2 * slot) / count;
    this.hitAt.clear();

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.enable = true;
    body.setCircle(bodySize / 2);
    body.setOffset(
      this.width / 2 - bodySize / 2,
      this.height / 2 - bodySize / 2,
    );
    body.setAllowGravity(false);
    body.setImmovable(true);
  }

  public updateOrbit(
    player: Phaser.GameObjects.GameObject & { x: number; y: number },
    time: number,
  ) {
    const angle = this.baseAngle + time * this.angularSpeed;
    const x = player.x + Math.cos(angle) * this.radius;
    const y = player.y + Math.sin(angle) * this.radius;

    this.setPosition(x, y);
    this.setRotation(angle);
    this.setDepth(Math.floor(y) + 1);
  }

  public canHit(enemy: EnemyLike, time: number) {
    const lastHitAt = this.hitAt.get(enemy) ?? -Infinity;

    return time - lastHitAt >= this.hitCooldownMs;
  }

  public registerHit(enemy: EnemyLike, time: number) {
    this.hitAt.set(enemy, time);
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
