import { Scene } from "../Scene";
import { BumpkinContainer } from "../Core/BumpkinContainer";
import { MachineInterpreter } from "../lib/Machine";
import { DamagePayload, MobTypes } from "../Types";
import { EnemyConfig } from "../Types";
import { MOB_CONFIGS } from "../constants/EnemyConstants";
import { WEAPON_SFX, WEAPON_SFX_VOL } from "../constants";

interface Props {
  x: number;
  y: number;
  scene: Scene;
  player?: BumpkinContainer;
  mobType: MobTypes;
}

export class SwarmMob extends Phaser.GameObjects.Container {
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
  public deSpawnState = false;
  private mobType: MobTypes;

  private avoidX = 0;
  private avoidY = 0;
  private avoidTimer = 0;
  private deathHandled = false;

  constructor({ scene, x, y, player, mobType }: Props) {
    super(scene, x, y);
    this.scene = scene;
    this.player = player;

    scene.physics.add.existing(this);
    this.mobType = mobType;
    this.config = MOB_CONFIGS[mobType];

    this.hp = this.config.hp;
    this.maxHp = this.config.maxHp;

    this.createEnemy();
  }

  public get portalService() {
    return this.scene.registry.get("portalService") as
      | MachineInterpreter
      | undefined;
  }

  createEnemy() {
    this.sprite = this.scene.add.sprite(0, 0, this.config.key);
    this.add(this.sprite);
    this.scene.add.existing(this);
    this.setScale(this.config.scale);
    this.setDepth(this.config.depth);

    this.enemyBody = this.body as Phaser.Physics.Arcade.Body;
    this.enemyBody.setSize(this.config.bodyWidth, this.config.bodyHeight);
    this.enemyBody.setOffset(this.config.offsetX, this.config.offsetY);
    this.enemyBody.setImmovable(true);

    this.createAnim();
    this.handleMovement();
    this.handleCollider();
    this.once("destroy", () => {
      this.scene.events.off("update", this.handleSceneUpdate);
    });
  }

  private createAnim() {
    const animKey = `${this.config.key}_anim`;
    this.scene.anims.create({
      key: animKey,
      frames: this.scene.anims.generateFrameNumbers(this.config.key, {
        start: this.config.frameStart,
        end: this.config.frameEnd,
      }),
      frameRate: this.config.frameRate,
      repeat: -1,
    });

    this.sprite.play(animKey);
  }

  private readonly handleSceneUpdate = () => {
    if (!this.player || !this.active || this.isDead) return;

    if (this.deSpawnState) {
      const camera = this.scene.cameras.main;

      if (!camera.worldView.contains(this.x, this.y)) {
        this.destroy();
        return;
      }
    }

    if (!this.swarmMove) {
      this.enemyBody.setVelocity(0, 0);
      return;
    }

    const speed = this.config.speed;

    const dx = this.player.x - this.x;
    const dy = this.player.y - this.y;

    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 5) {
      this.enemyBody.setVelocity(0, 0);
      return;
    }

    let moveX = dx / distance;
    let moveY = dy / distance;

    if (this.avoidTimer > 0) {
      moveX += this.avoidX * 2;
      moveY += this.avoidY * 2;
      this.avoidTimer--;
    }

    const moveDistance = Math.sqrt(moveX * moveX + moveY * moveY) || 1;

    moveX /= moveDistance;
    moveY /= moveDistance;

    const velocityX = moveX * speed;
    const velocityY = moveY * speed;

    this.enemyBody.setVelocity(velocityX, velocityY);

    if (velocityX < 0) {
      this.sprite.setFlipX(true);
    } else if (velocityX > 0) {
      this.sprite.setFlipX(false);
    }
  };

  setSwarmMove(value: boolean) {
    this.swarmMove = value;
    if (!value) this.enemyBody.setVelocity(0, 0);
  }

  handleMovement() {
    if (!this.player) return;

    this.scene.events.on("update", this.handleSceneUpdate);
  }

  separateFrom(enemy: SwarmMob) {
    const dx = this.x - enemy.x;
    const dy = this.y - enemy.y;

    const distance = Math.sqrt(dx * dx + dy * dy) || 1;

    this.avoidX = dx / distance;
    this.avoidY = dy / distance;

    this.avoidTimer = 20;
  }

  changeDirection() {
    if (!this.player) return;

    const dx = this.player.x - this.x;
    const dy = this.player.y - this.y;

    const distance = Math.sqrt(dx * dx + dy * dy) || 1;

    const dirX = dx / distance;
    const dirY = dy / distance;

    const side = Math.random() < 1 ? -2 : 2;

    this.avoidX = -dirY * side;
    this.avoidY = dirX * side;

    this.avoidTimer = 30;
  }

  private handleCollider() {
    if (!this.player) return;
    this.scene.physics.add.collider(
      this,
      this.player,
      () => {
        this.player?.hurt(this.mobType);
      },
      undefined,
      this,
    );
  }

  public isHurt() {
    if (this.isHurting || this.isDead) return;

    this.isHurting = true;

    this.scene.tweens.add({
      targets: this.sprite,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 2,
      onComplete: () => {
        this.sprite.setAlpha(1);
        this.isHurting = false;
      },
    });
  }

  public takeDamage(damage: number, _payload: DamagePayload) {
    if (this.isDead) return;

    const sfx = WEAPON_SFX[_payload.sourceWeaponId];

    if (sfx?.activate) {
      this.scene.sound.play(sfx.activate, {
        volume: WEAPON_SFX_VOL,
      });
    }

    this.isHurt();
    this.hp = Math.max(0, this.hp - damage);
    this.isDead = this.hp <= 0;

    if (this.isDead) {
      this.setSwarmMove(false);
    }
  }

  public onDeath() {
    if (this.deathHandled) return;

    this.deathHandled = true;
    this.scene.handleSwarmMobDefeat(this);
  }
}
