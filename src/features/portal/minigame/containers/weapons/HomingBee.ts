import Phaser from "phaser";
import type { DamagePayload, EnemyLike } from "../../Types";
import type { TargetingSystem } from "../../lib/combat/TargetingSystem";
import { enemyCenter } from "../../lib/combat/geometry";
import { getWeaponVisualDepth } from "../../constants/DepthConstants";

const WEAPON_BEES_TEXTURE_KEY = "weapon_bees";
const WEAPON_BEES_ANIMATION_KEY = "weapon_bees_active";
const WEAPON_BEES_SPAWN_TEXTURE_KEY = "weapon_bees_spawn";
const WEAPON_BEES_SPAWN_ANIMATION_KEY = "weapon_bees_spawn_active";

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
  private movementRotation = 0;
  private readonly spawnSprite: Phaser.GameObjects.Sprite;
  private readonly hitAt = new Map<EnemyLike, number>();

  constructor(
    scene: Phaser.Scene,
    x = 0,
    y = 0,
    texture = WEAPON_BEES_TEXTURE_KEY,
  ) {
    super(scene, x, y, texture);

    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.spawnSprite = scene.add.sprite(x, y, WEAPON_BEES_SPAWN_TEXTURE_KEY);
    this.spawnSprite.setActive(false);
    this.spawnSprite.setVisible(false);
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
    this.movementRotation = 0;
    this.applyBeePresentation(this.movementRotation);
    this.setActive(true);
    this.setVisible(true);
    this.setDepth(getWeaponVisualDepth(y));
    if (this.scene.anims.exists(WEAPON_BEES_ANIMATION_KEY)) {
      this.play(WEAPON_BEES_ANIMATION_KEY, true);
    } else {
      this.anims.stop();
    }
    this.payload = payload;
    this.speed = speed;
    this.expiresAt = expiresAt;
    this.hitCooldownMs = hitCooldownMs;
    this.target = undefined;
    this.nextRetargetAt = 0;
    this.hitAt.clear();
    this.syncSpawnSprite();
    this.spawnSprite.setActive(true);
    this.spawnSprite.setVisible(true);
    this.spawnSprite.off(Phaser.Animations.Events.ANIMATION_COMPLETE);
    if (this.scene.anims.exists(WEAPON_BEES_SPAWN_ANIMATION_KEY)) {
      this.spawnSprite.once(
        Phaser.Animations.Events.ANIMATION_COMPLETE,
        (animation: Phaser.Animations.Animation) => {
          if (animation.key === WEAPON_BEES_SPAWN_ANIMATION_KEY) {
            this.hideSpawnSprite();
          }
        },
      );
      this.spawnSprite.play(WEAPON_BEES_SPAWN_ANIMATION_KEY, true);
    } else {
      this.hideSpawnSprite();
    }

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.enable = true;
    body.setSize(this.width, this.height);
    body.setOffset(0, 0);
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
      this.syncSpawnSprite();
      return;
    }

    const target = enemyCenter(this.target);
    const angle = Phaser.Math.Angle.Between(this.x, this.y, target.x, target.y);
    this.movementRotation = Phaser.Math.Angle.RotateTo(
      this.movementRotation,
      angle,
      0.15,
    );

    this.applyBeePresentation(this.movementRotation);
    body.setVelocity(
      Math.cos(this.movementRotation) * this.speed,
      Math.sin(this.movementRotation) * this.speed,
    );
    this.setDepth(getWeaponVisualDepth(this.y));
    this.syncSpawnSprite();
  }

  public canHit(enemy: EnemyLike, time: number) {
    const lastHitAt = this.hitAt.get(enemy) ?? -Infinity;

    return time - lastHitAt >= this.hitCooldownMs;
  }

  public registerHit(enemy: EnemyLike, time: number) {
    this.hitAt.set(enemy, time);
  }

  public preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);

    if (this.active) {
      this.syncSpawnSprite();
    }
  }

  public hasExpired(time: number) {
    return time >= this.expiresAt;
  }

  public despawn() {
    this.anims.stop();
    this.spawnSprite.off(Phaser.Animations.Events.ANIMATION_COMPLETE);
    this.hideSpawnSprite();
    this.movementRotation = 0;
    this.applyBeePresentation(this.movementRotation);
    this.setActive(false);
    this.setVisible(false);
    this.target = undefined;
    this.hitAt.clear();

    const body = this.body as Phaser.Physics.Arcade.Body | undefined;
    if (!body) return;

    body.stop();
    body.enable = false;
  }

  public destroy(fromScene?: boolean) {
    this.spawnSprite.destroy(fromScene);
    super.destroy(fromScene);
  }

  private syncSpawnSprite() {
    this.spawnSprite.setPosition(this.x, this.y);
    this.spawnSprite.setRotation(this.rotation);
    this.spawnSprite.setFlip(this.flipX, this.flipY);
    this.spawnSprite.setDepth(this.depth);
  }

  private applyBeePresentation(rotation: number) {
    const isFacingLeft = Math.cos(rotation) < 0;

    this.setFlip(isFacingLeft, false);
    this.setRotation(
      Math.atan2(
        isFacingLeft ? -Math.sin(rotation) : Math.sin(rotation),
        isFacingLeft ? -Math.cos(rotation) : Math.cos(rotation),
      ),
    );
  }

  private hideSpawnSprite() {
    this.spawnSprite.anims.stop();
    this.spawnSprite.setActive(false);
    this.spawnSprite.setVisible(false);
  }
}
