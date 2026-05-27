import { Scene } from "../Scene";
import { BumpkinContainer } from "../Core/BumpkinContainer";
import { MachineInterpreter } from "../lib/Machine";
import { BossTypes, DamagePayload } from "../Types";
import { EnemyConfig } from "../Types";
import { BOSS_CONFIGS } from "../constants/EnemyConstants";
import { LifeBar } from "./LifeBar";

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
  private lifeBar: LifeBar;
  private bossType: BossTypes;

  private avoidX = 0;
  private avoidY = 0;
  private avoidTimer = 0;
  private deathHandled = false;

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
      | MachineInterpreter
      | undefined;
  }

  createEnemy() {
    this.sprite = this.scene.add.sprite(0, 0, this.config.key);
    this.add([this.sprite, this.lifeBar]);
    this.scene.add.existing(this);
    this.setScale(this.config.scale);
    this.setDepth(1000);

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

  setMove(value: boolean) {
    this.swarmMove = value;
    if (!value) this.enemyBody.setVelocity(0, 0);
  }

  handleMovement() {
    if (!this.player) return;

    this.scene.events.on("update", this.handleSceneUpdate);
  }

  separateFrom(enemy: BossEnemy) {
    const dx = this.x - enemy.x;
    const dy = this.y - enemy.y;

    const distance = Math.sqrt(dx * dx + dy * dy) || 1;

    this.avoidX = dx / distance;
    this.avoidY = dy / distance;

    this.avoidTimer = 20;
  }

  changeDirection() {
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);

    this.avoidX = Math.cos(angle);
    this.avoidY = Math.sin(angle);

    this.avoidTimer = 20;
  }

  private handleCollider() {
    if (!this.player) return;
    this.scene.physics.add.collider(
      this,
      this.player,
      () => {
        this.player?.hurt();
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

    this.deathHandled = true;
    this.scene.handleBossDefeat(this);
  }
}
