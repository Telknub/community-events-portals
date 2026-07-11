import type { Scene } from "../Scene";
import type { BumpkinContainer } from "../Core/BumpkinContainer";
import type { MachineInterpreter } from "../lib/Machine";
import type { BossTypes, DamagePayload } from "../Types";
import type { EnemyConfig } from "../Types";
import { BOSS_CONFIGS } from "../constants/EnemyConstants";
import { LifeBar } from "./LifeBar";
import { WEAPON_SFX, WEAPON_SFX_VOL } from "../constants";
import { WeaponSfxLimiter } from "../lib/combat/WeaponSfxLimiter";

const MOVEMENT_UPDATE_INTERVAL_MS = 100;
const FRAME_DURATION_MS = 1000 / 60;

interface Props {
  x: number;
  y: number;
  scene: Scene;
  player?: BumpkinContainer;
  bossType: BossTypes;
}

export class BossEnemy extends Phaser.GameObjects.Container {
  scene: Scene;
  private player?: BumpkinContainer;
  private sprite!: Phaser.GameObjects.Sprite;
  private enemyBody!: Phaser.Physics.Arcade.Body;
  swarmMove: boolean = false;
  public hp: number;
  public maxHp: number;
  public isDead = false;
  public config: EnemyConfig;
  private isHurting = false;
  private hurtFlashRemainingMs = 0;
  private lifeBar: LifeBar;
  public bossType: BossTypes;

  private avoidX = 0;
  private avoidY = 0;
  private avoidTimer = 0;
  private deathHandled = false;
  private movementCheckElapsed = Phaser.Math.Between(
    0,
    MOVEMENT_UPDATE_INTERVAL_MS,
  );

  constructor({ scene, x, y, player, bossType }: Props) {
    super(scene, x, y);
    this.scene = scene;
    this.player = player;
    this.bossType = bossType;

    scene.physics.add.existing(this);

    this.config = BOSS_CONFIGS[bossType];

    this.hp = this.config.hp;
    this.maxHp = this.config.maxHp;

    this.lifeBar = new LifeBar({
      x: 0,
      y: -40,
      scene,
      width: 50,
      maxHealth: this.maxHp,
    });

    this.lifeBar.setVisible(true);
    this.createEnemy();
  }

  public get portalService() {
    return this.scene.registry.get("portalService") as
      MachineInterpreter | undefined;
  }

  createEnemy() {
    this.sprite = this.scene.add.sprite(0, 0, this.config.key);
    this.add([this.sprite, this.lifeBar]);
    this.scene.add.existing(this);
    this.setScale(this.config.scale);
    this.setDepth(this.config.depth);

    this.enemyBody = this.body as Phaser.Physics.Arcade.Body;
    this.enemyBody.setSize(this.config.bodyWidth, this.config.bodyHeight);
    this.enemyBody.setOffset(this.config.offsetX, this.config.offsetY);
    this.enemyBody.setImmovable(false);

    this.createAnim();
  }

  private createAnim() {
    const animKey = `${this.config.key}_anim`;

    if (!this.scene.anims.exists(animKey)) {
      this.scene.anims.create({
        key: animKey,
        frames: this.scene.anims.generateFrameNumbers(this.config.key, {
          start: this.config.frameStart,
          end: this.config.frameEnd,
        }),
        frameRate: this.config.frameRate,
        repeat: -1,
      });
    }

    this.sprite.play(animKey);
  }

  public updateMovement(delta: number) {
    this.updateHurtVisual(delta);

    if (!this.player || !this.active || this.isDead) return;

    if (!this.swarmMove) {
      this.enemyBody.setVelocity(0, 0);
      return;
    }

    this.movementCheckElapsed += delta;
    this.avoidTimer = Math.max(0, this.avoidTimer - delta);

    if (this.movementCheckElapsed < MOVEMENT_UPDATE_INTERVAL_MS) return;

    this.movementCheckElapsed %= MOVEMENT_UPDATE_INTERVAL_MS;

    const dx = this.player.x - this.x;
    const dy = this.player.y - this.y;
    const distanceSq = dx * dx + dy * dy;

    if (distanceSq < 25) {
      this.enemyBody.setVelocity(0, 0);
      return;
    }

    const inverseDistance = 1 / Math.sqrt(distanceSq);
    let moveX = dx * inverseDistance;
    let moveY = dy * inverseDistance;

    if (this.avoidTimer > 0) {
      moveX += this.avoidX * 2;
      moveY += this.avoidY * 2;

      const moveDistanceSq = moveX * moveX + moveY * moveY;
      if (moveDistanceSq > 0) {
        const inverseMoveDistance = 1 / Math.sqrt(moveDistanceSq);
        moveX *= inverseMoveDistance;
        moveY *= inverseMoveDistance;
      }
    }

    const velocityX = moveX * this.config.speed;
    const velocityY = moveY * this.config.speed;

    this.enemyBody.setVelocity(velocityX, velocityY);

    if (velocityX < 0) {
      this.sprite.setFlipX(true);
    } else if (velocityX > 0) {
      this.sprite.setFlipX(false);
    }
  }

  setMove(value: boolean) {
    this.swarmMove = value;
    if (!value) this.enemyBody.setVelocity(0, 0);
  }

  changeDirection() {
    if (!this.player) return;

    const dx = this.player.x - this.x;
    const dy = this.player.y - this.y;

    const distance = Math.sqrt(dx * dx + dy * dy) || 1;

    const dirX = dx / distance;
    const dirY = dy / distance;

    const side = Math.random() < 0.5 ? -2 : 2;

    this.avoidX = -dirY * side;
    this.avoidY = dirX * side;

    this.avoidTimer = 30 * FRAME_DURATION_MS;
  }

  public handlePlayerContact() {
    if (!this.active || this.isDead) return;
    this.player?.hurt(this.bossType);
  }

  private updateHurtVisual(delta: number) {
    if (!this.isHurting) return;

    this.hurtFlashRemainingMs = Math.max(0, this.hurtFlashRemainingMs - delta);

    if (this.hurtFlashRemainingMs > 0) return;

    this.sprite.setAlpha(1);
    this.isHurting = false;
  }

  public isHurt() {
    if (this.isHurting || this.isDead) return;

    this.isHurting = true;
    this.hurtFlashRemainingMs = 120;
    this.sprite.setAlpha(0.3);
  }

  public takeDamage(damage: number, _payload: DamagePayload) {
    if (this.isDead) return;

    const sfx = WEAPON_SFX[_payload.sourceWeaponId];

    if (sfx?.activate) {
      WeaponSfxLimiter.play(this.scene, sfx.activate, WEAPON_SFX_VOL);
    }

    this.isHurt();
    this.hp = Math.max(0, this.hp - damage);
    this.isDead = this.hp <= 0;

    this.lifeBar.setHealth(this.hp);

    if (this.isDead) {
      this.setMove(false);
    }
  }

  public onDeath() {
    if (this.deathHandled) return;

    WeaponSfxLimiter.play(this.scene, "bossDeath", 0.3, 250);

    this.deathHandled = true;
    this.scene.handleBossDefeat(this);
  }
}
