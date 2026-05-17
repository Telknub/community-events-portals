import { Scene } from "../Scene";
import { BumpkinContainer } from "../Core/BumpkinContainer";
import { MachineInterpreter } from "../lib/Machine";
import { DamagePayload } from "../Types";

interface Props {
  x: number;
  y: number;
  scene: Scene;
  player?: BumpkinContainer;
}

export class SwarmMob extends Phaser.GameObjects.Container {
  scene: Scene;
  private player?: BumpkinContainer;
  private sprite!: Phaser.GameObjects.Sprite;
  private enemyBody!: Phaser.Physics.Arcade.Body;
  private mobKey: string;
  swarmMove: boolean = false;
  public hp = 1;
  public maxHp = 1;
  public isDead = false;

  private avoidX = 0;
  private avoidY = 0;
  private avoidTimer = 0;
  private deathHandled = false;

  constructor({ scene, x, y, player }: Props) {
    super(scene, x, y);
    this.scene = scene;
    this.player = player;

    scene.physics.add.existing(this);

    const swarmMobs = ["swarmMob1", "swarmMob2"];
    this.mobKey = Phaser.Utils.Array.GetRandom(swarmMobs);

    this.createEnemy();
  }

  public get portalService() {
    return this.scene.registry.get("portalService") as
      | MachineInterpreter
      | undefined;
  }

  createEnemy() {
    this.sprite = this.scene.add.sprite(0, 0, this.mobKey);
    this.add(this.sprite);
    this.scene.add.existing(this);
    this.setScale(0.8);
    this.setDepth(1000);

    this.enemyBody = this.body as Phaser.Physics.Arcade.Body;
    this.enemyBody.setSize(this.sprite.width, this.sprite.height);
    this.enemyBody.setOffset(-this.sprite.width / 2, -this.sprite.height / 2);
    this.enemyBody.setImmovable(true);

    this.createAnim();
    this.handleMovement();
    this.handleCollider();
    this.once("destroy", () => {
      this.scene.events.off("update", this.handleSceneUpdate);
    });
  }

  private createAnim() {
    const animKey = `${this.mobKey}_anim`;
    this.scene.anims.create({
      key: animKey,
      frames: this.scene.anims.generateFrameNumbers(this.mobKey, {
        start: 0,
        end: 8,
      }),
      frameRate: 10,
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

    const speed = 30;

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

  public takeDamage(damage: number, _payload: DamagePayload) {
    if (this.isDead) return;

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
