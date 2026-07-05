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
  followTarget?: { x: number; y: number };
};

const WEAPON_SCYTHE_TEXTURE_KEY = "weapon_scythe";
const WEAPON_SCYTHE_ANIMATION_KEY = "weapon_scythe_active";
const SCYTHE_SWING_START_RADIANS = -0.95;
const SCYTHE_SWING_END_RADIANS = 0.65;
const SCYTHE_VISUAL_ROTATION_OFFSET_RADIANS = Phaser.Math.DegToRad(90);

export class SlashHitbox extends Phaser.Physics.Arcade.Sprite {
  public payload!: DamagePayload;
  public expiresAt = 0;
  public range = 0;
  public arcDegrees = 0;
  public direction: Vector = { x: 1, y: 0 };
  private attackOrigin: Vector = { x: 0, y: 0 };
  private followTarget?: { x: number; y: number };
  private isScythe = false;
  private scytheSwingProgress = 0;
  private scytheDebug?: Phaser.GameObjects.Graphics;
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
    followTarget,
  }: SlashHitboxSpawnProps) {
    this.scene?.tweens.killTweensOf(this);
    this.setTexture(texture);
    this.isScythe = texture === WEAPON_SCYTHE_TEXTURE_KEY;
    this.followTarget = this.isScythe ? followTarget : undefined;
    this.scytheSwingProgress = 0;
    this.direction = normalizeVector(direction);
    this.range = range;
    this.arcDegrees = arcDegrees;
    this.payload = payload;
    this.expiresAt = expiresAt;
    this.attackOrigin = { x, y };
    this.hitEnemies.clear();

    if (this.isScythe) {
      this.setupScytheSwing({ x, y, range, expiresAt });
    } else {
      this.setupDefaultSlash({ x, y, range, expiresAt });
    }

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.enable = true;
    if (this.isScythe) {
      this.setScytheBroadphaseBody(body, range);
    } else {
      body.setSize(this.width, this.height);
      body.setOffset(0, 0);
    }
    body.setAllowGravity(false);
    body.setImmovable(true);

    if (
      texture === WEAPON_SCYTHE_TEXTURE_KEY &&
      this.scene.anims.exists(WEAPON_SCYTHE_ANIMATION_KEY)
    ) {
      this.play(WEAPON_SCYTHE_ANIMATION_KEY, true);
    } else {
      this.stop();
    }
  }

  public preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);

    if (this.active && this.isScythe) {
      this.updateScythePosition();
      this.updateScytheDebug();
    }
  }

  private setupDefaultSlash({
    x,
    y,
    range,
    expiresAt,
  }: {
    x: number;
    y: number;
    range: number;
    expiresAt: number;
  }) {
    this.setOrigin(0.5);
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

    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: Math.max(80, expiresAt - this.scene.time.now),
    });
  }

  private setupScytheSwing({
    x,
    y,
    range,
    expiresAt,
  }: {
    x: number;
    y: number;
    range: number;
    expiresAt: number;
  }) {
    const baseRotation = Math.atan2(this.direction.y, this.direction.x);
    const startRotation =
      baseRotation +
      SCYTHE_SWING_START_RADIANS +
      SCYTHE_VISUAL_ROTATION_OFFSET_RADIANS;
    const endRotation =
      baseRotation +
      SCYTHE_SWING_END_RADIANS +
      SCYTHE_VISUAL_ROTATION_OFFSET_RADIANS;
    const visualWidth = range * 1.25;
    const visualHeight = visualWidth * (25 / 38);

    this.setOrigin(0.14, 0.82);
    this.attackOrigin = this.followTarget
      ? { x: this.followTarget.x, y: this.followTarget.y }
      : { x, y };
    this.updateScythePosition();
    this.setDisplaySize(visualWidth, visualHeight);
    this.setRotation(startRotation);
    this.setActive(true);
    this.setVisible(true);
    this.setDepth(Math.floor(this.attackOrigin.y) + 2);
    this.setAlpha(1);

    this.scene.tweens.add({
      targets: this,
      scytheSwingProgress: 1,
      duration: Math.max(80, expiresAt - this.scene.time.now),
      ease: "Quad.easeOut",
      onUpdate: () => {
        this.setRotation(
          startRotation +
            (endRotation - startRotation) * this.scytheSwingProgress,
        );
      },
    });
  }

  public canHit(enemy: EnemyLike) {
    if (this.hitEnemies.has(enemy)) return false;

    if (this.isScythe) {
      return this.isEnemyInsideRotatedScythe(enemy);
    }

    return isWithinCone({
      origin: {
        x: this.attackOrigin.x,
        y: this.attackOrigin.y,
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
    this.stop();
    this.followTarget = undefined;
    this.isScythe = false;
    this.scytheSwingProgress = 0;
    this.hitEnemies.clear();
    this.clearScytheDebug();

    const body = this.body as Phaser.Physics.Arcade.Body | undefined;
    if (!body) return;

    body.stop();
    body.enable = false;
  }

  private updateScythePosition() {
    const origin = this.followTarget ?? this.attackOrigin;
    this.attackOrigin = { x: origin.x, y: origin.y };
    this.setPosition(
      origin.x + this.direction.x * this.range * 0.12,
      origin.y + this.direction.y * this.range * 0.12,
    );
    this.setDepth(Math.floor(origin.y) + 2);
  }

  private setScytheBroadphaseBody(
    body: Phaser.Physics.Arcade.Body,
    range: number,
  ) {
    const localRadius = Math.max(
      range,
      Math.hypot(
        Math.max(this.originX, 1 - this.originX) * this.width,
        Math.max(this.originY, 1 - this.originY) * this.height,
      ),
    );

    body.setCircle(localRadius);
    body.setOffset(
      this.width * this.originX - localRadius,
      this.height * this.originY - localRadius,
    );
  }

  private isEnemyInsideRotatedScythe(enemy: EnemyLike) {
    const target = enemyCenter(enemy);
    const dx = target.x - this.x;
    const dy = target.y - this.y;
    const cos = Math.cos(this.rotation);
    const sin = Math.sin(this.rotation);
    const localX = dx * cos + dy * sin;
    const localY = -dx * sin + dy * cos;
    const left = -this.originX * this.displayWidth;
    const right = (1 - this.originX) * this.displayWidth;
    const top = -this.originY * this.displayHeight;
    const bottom = (1 - this.originY) * this.displayHeight;

    return (
      localX >= left && localX <= right && localY >= top && localY <= bottom
    );
  }

  private getScytheDebugCorners() {
    const left = -this.originX * this.displayWidth;
    const right = (1 - this.originX) * this.displayWidth;
    const top = -this.originY * this.displayHeight;
    const bottom = (1 - this.originY) * this.displayHeight;
    const cos = Math.cos(this.rotation);
    const sin = Math.sin(this.rotation);

    return [
      { x: left, y: top },
      { x: right, y: top },
      { x: right, y: bottom },
      { x: left, y: bottom },
    ].map((point) => ({
      x: this.x + point.x * cos - point.y * sin,
      y: this.y + point.x * sin + point.y * cos,
    }));
  }

  private updateScytheDebug() {
    const world = this.scene.physics.world;

    if (!world.drawDebug) {
      this.clearScytheDebug();
      return;
    }

    if (!this.scytheDebug) {
      this.scytheDebug = this.scene.add.graphics();
      this.scytheDebug.setDepth(10000000000001);
    }

    const corners = this.getScytheDebugCorners();
    this.scytheDebug.clear();
    this.scytheDebug.lineStyle(1, 0xff66ff, 1);
    this.scytheDebug.beginPath();
    this.scytheDebug.moveTo(corners[0].x, corners[0].y);
    corners
      .slice(1)
      .forEach((corner) => this.scytheDebug?.lineTo(corner.x, corner.y));
    this.scytheDebug.closePath();
    this.scytheDebug.strokePath();
  }

  private clearScytheDebug() {
    this.scytheDebug?.clear();
  }
}
