import Phaser from "phaser";
import type {
  DamagePayload,
  EnemyLike,
  ProjectileBehavior,
  WeaponId,
} from "../../Types";
import { enemyCenter } from "../../lib/combat/geometry";
import { getWeaponVisualDepth } from "../../constants/DepthConstants";

const WEAPON_WATERING_CAN_PROJECTILE_TEXTURE_KEY =
  "weapon_watering_can_projectile";
const WEAPON_WATERING_CAN_PROJECTILE_ANIMATION_KEY =
  "weapon_watering_can_projectile_active";
const WEAPON_CORN_PROJECTILE_TEXTURE_KEY = "weapon_corn_projectile";
const WEAPON_CORN_PROJECTILE_ANIMATION_KEY = "weapon_corn_projectile_active";
const WEAPON_TOMATO_PROJECTILE_TEXTURE_KEY = "weapon_tomato_projectile";
const WEAPON_TOMATO_PROJECTILE_ANIMATION_KEY =
  "weapon_tomato_projectile_active";
const WEAPON_SUNFLOWER_PROJECTILE_TEXTURE_KEY = "weapon_sunflower_projectile";
const WEAPON_SUNFLOWER_PROJECTILE_ANIMATION_KEY =
  "weapon_sunflower_projectile_active";

export type ProjectileSpawnProps = {
  x: number;
  y: number;
  texture: string;
  velocity: { x: number; y: number };
  bodySize: number;
  bodySizeMode?: "fixed" | "spriteBounds";
  bodySizeScale?: { width: number; height: number };
  expiresAt: number;
  payload: DamagePayload;
  ownerWeaponId: WeaponId;
  behavior: ProjectileBehavior;
  pierce: number;
  bounceCount: number;
  chainRadius: number;
  scale?: number;
  rotateToVelocity?: boolean;
  rotationOffsetDegrees?: number;
  orientedHitbox?: boolean;
  ricochetTexture?: string;
  animationKey?: string;
  flipX?: boolean;
  flipY?: boolean;
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
  private orientedHitbox = false;
  private orientedHitboxWidth = 0;
  private orientedHitboxHeight = 0;
  private rotateToVelocity = false;
  private rotationOffsetDegrees = 0;
  private ricochetTexture?: string;
  private hasActivatedRicochet = false;
  private bodySize = 0;
  private bodySizeMode: "fixed" | "spriteBounds" = "fixed";
  private bodySizeScale = { width: 1, height: 1 };

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
    bodySizeMode = "fixed",
    bodySizeScale = { width: 1, height: 1 },
    expiresAt,
    payload,
    ownerWeaponId,
    behavior,
    pierce,
    bounceCount,
    chainRadius,
    scale = 1,
    rotateToVelocity = false,
    rotationOffsetDegrees = 0,
    orientedHitbox = false,
    ricochetTexture,
    animationKey,
    flipX,
    flipY,
  }: ProjectileSpawnProps) {
    this.setTexture(texture);
    const resolvedAnimationKey = animationKey ?? this.getAnimationKey(texture);

    if (resolvedAnimationKey && this.scene.anims.exists(resolvedAnimationKey)) {
      this.play(resolvedAnimationKey, true);
    } else {
      this.anims.stop();
    }

    this.setPosition(x, y);
    this.setScale(scale);
    this.setVelocityRotation(velocity, rotateToVelocity, rotationOffsetDegrees);
    if (flipX !== undefined || flipY !== undefined) {
      this.setFlip(flipX ?? false, flipY ?? false);
    }
    this.setActive(true);
    this.setVisible(true);
    this.setDepth(getWeaponVisualDepth(y));
    this.payload = payload;
    this.ownerWeaponId = ownerWeaponId;
    this.behavior = behavior;
    this.expiresAt = expiresAt;
    this.pierceRemaining = pierce;
    this.bounceRemaining = bounceCount;
    this.chainRadius = chainRadius;
    this.orientedHitbox = orientedHitbox;
    this.rotateToVelocity = rotateToVelocity;
    this.rotationOffsetDegrees = rotationOffsetDegrees;
    this.ricochetTexture = ricochetTexture;
    this.hasActivatedRicochet = false;
    this.bodySize = bodySize;
    this.bodySizeMode = bodySizeMode;
    this.bodySizeScale = bodySizeScale;
    this.updateOrientedHitboxSize();
    this.hitEnemies.clear();

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.enable = true;
    this.updateBodySize();
    body.setVelocity(velocity.x, velocity.y);
    body.setAllowGravity(false);
  }

  private getAnimationKey(texture: string) {
    if (texture === WEAPON_WATERING_CAN_PROJECTILE_TEXTURE_KEY) {
      return WEAPON_WATERING_CAN_PROJECTILE_ANIMATION_KEY;
    }

    if (texture === WEAPON_CORN_PROJECTILE_TEXTURE_KEY) {
      return WEAPON_CORN_PROJECTILE_ANIMATION_KEY;
    }

    if (texture === WEAPON_TOMATO_PROJECTILE_TEXTURE_KEY) {
      return WEAPON_TOMATO_PROJECTILE_ANIMATION_KEY;
    }

    if (texture === WEAPON_SUNFLOWER_PROJECTILE_TEXTURE_KEY) {
      return WEAPON_SUNFLOWER_PROJECTILE_ANIMATION_KEY;
    }

    return undefined;
  }

  public registerHit(enemy: EnemyLike) {
    this.hitEnemies.add(enemy);
  }

  public hasHit(enemy: EnemyLike) {
    return this.hitEnemies.has(enemy);
  }

  public canHit(enemy: EnemyLike) {
    if (!this.orientedHitbox) return true;

    const target = enemyCenter(enemy);
    const dx = target.x - this.x;
    const dy = target.y - this.y;
    const cos = Math.cos(-this.rotation);
    const sin = Math.sin(-this.rotation);
    const localX = dx * cos - dy * sin;
    const localY = dx * sin + dy * cos;

    return (
      Math.abs(localX) <= this.orientedHitboxWidth / 2 &&
      Math.abs(localY) <= this.orientedHitboxHeight / 2
    );
  }

  public hasExpired(time: number) {
    return time >= this.expiresAt;
  }

  public redirectTo(enemy: EnemyLike, speed: number) {
    const body = this.body as Phaser.Physics.Arcade.Body;
    const target = enemyCenter(enemy);
    const angle = Phaser.Math.Angle.Between(this.x, this.y, target.x, target.y);
    const velocity = {
      x: Math.cos(angle) * speed,
      y: Math.sin(angle) * speed,
    };

    body.setVelocity(velocity.x, velocity.y);
    this.setVelocityRotation(
      velocity,
      this.rotateToVelocity,
      this.rotationOffsetDegrees,
    );
  }

  public activateRicochet() {
    if (this.hasActivatedRicochet || !this.ricochetTexture) return;

    this.hasActivatedRicochet = true;
    this.anims.stop();
    this.setTexture(this.ricochetTexture);
    this.updateOrientedHitboxSize();
    this.updateBodySize();
  }

  private updateOrientedHitboxSize() {
    this.orientedHitboxWidth = this.displayWidth;
    this.orientedHitboxHeight = this.displayHeight;
  }

  private updateBodySize() {
    const body = this.body as Phaser.Physics.Arcade.Body;

    if (this.bodySizeMode === "spriteBounds") {
      body.setSize(
        this.width * this.bodySizeScale.width,
        this.height * this.bodySizeScale.height,
        true,
      );
      return;
    }

    if (this.orientedHitbox) {
      const diagonal = Math.hypot(this.width, this.height);
      body.setSize(diagonal, diagonal, true);
      return;
    }

    body.setSize(this.bodySize, this.bodySize, true);
  }

  private setVelocityRotation(
    velocity: ProjectileSpawnProps["velocity"],
    rotateToVelocity: boolean,
    rotationOffsetDegrees: number,
  ) {
    if (!rotateToVelocity) {
      this.setFlip(false, false);
      this.setRotation(0);
      return;
    }

    if (rotationOffsetDegrees !== 0) {
      this.setFlip(false, false);
      this.setRotation(
        Math.atan2(velocity.y, velocity.x) +
          Phaser.Math.DegToRad(rotationOffsetDegrees),
      );
      return;
    }

    const isFacingLeft = velocity.x < 0;
    this.setFlip(isFacingLeft, false);
    this.setRotation(
      Math.atan2(
        isFacingLeft ? -velocity.y : velocity.y,
        isFacingLeft ? -velocity.x : velocity.x,
      ),
    );
  }

  public despawn() {
    this.anims.stop();
    this.setRotation(0);
    this.setFlip(false, false);
    this.setActive(false);
    this.setVisible(false);
    this.orientedHitbox = false;
    this.orientedHitboxWidth = 0;
    this.orientedHitboxHeight = 0;
    this.rotateToVelocity = false;
    this.rotationOffsetDegrees = 0;
    this.ricochetTexture = undefined;
    this.hasActivatedRicochet = false;
    this.bodySize = 0;
    this.bodySizeMode = "fixed";
    this.bodySizeScale = { width: 1, height: 1 };
    this.hitEnemies.clear();

    const body = this.body as Phaser.Physics.Arcade.Body | undefined;
    if (!body) return;

    body.stop();
    body.enable = false;
  }
}
