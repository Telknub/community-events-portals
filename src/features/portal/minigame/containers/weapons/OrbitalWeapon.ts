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
};

const WEAPON_BANANA_ANIMATION_KEY = "weapon_banana_active";
const WEAPON_SUNFLOWER_ANIMATION_KEY = "weapon_sunflower_active";

export class OrbitalWeapon extends Phaser.Physics.Arcade.Sprite {
  public ownerWeaponId!: WeaponId;
  public payload!: DamagePayload;
  public radius = 0;
  public angularSpeed = 0;
  public hitCooldownMs = 0;
  private baseAngle = 0;
  private readonly hitAt = new Map<EnemyLike, number>();

  constructor(scene: Phaser.Scene, x = 0, y = 0, texture = "weapon_banana") {
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
    body.setSize(this.width, this.height);
    body.setOffset(0, 0);
    body.setAllowGravity(false);
    body.setImmovable(true);
    body.enable = ownerWeaponId !== "sunflower";

    if (
      ownerWeaponId === "banana" &&
      this.scene.anims.exists(WEAPON_BANANA_ANIMATION_KEY)
    ) {
      this.play(WEAPON_BANANA_ANIMATION_KEY, true);
    } else if (
      ownerWeaponId === "sunflower" &&
      this.scene.anims.exists(WEAPON_SUNFLOWER_ANIMATION_KEY)
    ) {
      this.play(WEAPON_SUNFLOWER_ANIMATION_KEY, true);
    } else {
      this.stop();
    }
  }

  public updateOrbit(
    player: Phaser.GameObjects.GameObject & { x: number; y: number },
    time: number,
  ) {
    const angle = this.baseAngle + time * this.angularSpeed;
    const x = player.x + Math.cos(angle) * this.radius;
    const y = player.y + Math.sin(angle) * this.radius;

    this.setPosition(x, y);
    // this.setRotation(angle);
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
    this.stop();
    this.hitAt.clear();

    const body = this.body as Phaser.Physics.Arcade.Body | undefined;
    if (!body) return;

    body.stop();
    body.enable = false;
  }
}
