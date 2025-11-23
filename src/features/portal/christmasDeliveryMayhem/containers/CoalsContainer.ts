import { BumpkinContainer } from "features/world/containers/BumpkinContainer";
import { BaseScene } from "features/world/scenes/BaseScene";
import { MachineInterpreter } from "../lib/christmasDeliveryMayhemMachine";
import { GiftContainer } from "./GiftContainer";

interface Props {
  x: number;
  y: number;
  scene: BaseScene;
  player?: BumpkinContainer;
}

export class CoalsContainer extends Phaser.GameObjects.Container {
  private player?: BumpkinContainer;
  private sprite: Phaser.GameObjects.Sprite;
  scene: BaseScene;
  public isActive = true; // Flag to track active
  private overlapHandler?: Phaser.Physics.Arcade.Collider;

  constructor({ x, y, scene, player }: Props) {
    super(scene, x, y);
    this.scene = scene;
    this.player = player;

    const spriteName = "coal";
    this.sprite = scene.add.sprite(2, 2, spriteName).setOrigin(0, 0);

    this.setSize(this.sprite.width, this.sprite.height);
    this.add(this.sprite);

    this.Coal();

    this.sprite.setVisible(true);

    scene.add.existing(this);
  }

  public get portalService() {
    return this.scene.registry.get("portalService") as
      | MachineInterpreter
      | undefined;
  }

  private Coal() {
    if (!this.player || !this.isActive) return;

    this.scene.physics.world.enable(this);

    (this.body as Phaser.Physics.Arcade.Body)
      .setOffset(this.sprite.width / 1.5, this.sprite.height / 1.5)
      .setImmovable(true)
      .setCollideWorldBounds(true);

    this.overlapHandler = this.scene.physics.add.overlap(
      this.player as Phaser.GameObjects.GameObject,
      this as Phaser.GameObjects.GameObject,
      () => this.handleOverlap(),
    );
  }

  private handleOverlap() {
    if (!this.isActive) return;

    this.isActive = false;

    // Remove the overlap event
    if (this.overlapHandler) {
      this.scene.physics.world.removeCollider(this.overlapHandler);
      this.overlapHandler = undefined;
    }

    this.scene.sound.play("coal-sound", { volume: 0.3 });
    this.PoofAnim();
    this.sprite.setVisible(false);
    // this.sprite.destroy();
    this.removeGift();
  }

  // Remove one gift from the player
  private removeGift() {
    const gifts = this.portalService?.state.context.gifts || [];

    if (gifts.length > 0) {
      const gift = new GiftContainer({
        x: this.player?.x || 0,
        y: this.player?.y || 0,
        name: gifts[gifts.length - 1],
        scene: this.scene,
        removedAnim: true,
      });
      gift.playRemovalAnimation(0);
      this.portalService?.send("REMOVE_LAST_GIFT_INVENTORY");
    }
    this.portalService?.send("LOSE_LIFE");
  }

  private PoofAnim() {
    if (!this.scene.anims.exists("coalspawn_spritesheet_anim")) {
      this.scene.anims.create({
        key: "coalspawn_spritesheet_anim",
        frames: this.scene.anims.generateFrameNumbers("coalspawn_spritesheet", {
          start: 0,
          end: 7,
        }),
        repeat: 0,
        frameRate: 10,
      });
    }

    const poofSprite = this.scene.add.sprite(
      this.x,
      this.y,
      "coalspawn_spritesheet",
    );
    poofSprite.setDepth(1);
    poofSprite.setOrigin(-0.2, 0.7);
    poofSprite.play("coalspawn_spritesheet_anim", true);

    poofSprite.on("animationcomplete", () => {
      poofSprite.destroy();
      this.KrampusAnim();
    });
  }

  private KrampusAnim() {
    if (!this.scene.anims.exists("krampus_anim")) {
      this.scene.anims.create({
        key: "krampus_anim",
        frames: this.scene.anims.generateFrameNumbers("krampus", {
          start: 0,
          end: 7,
        }),
        repeat: 0,
        frameRate: 10,
      });
    }

    const krampusSprite = this.scene.add.sprite(this.x, this.y, "krampus");
    krampusSprite.setDepth(1);
    krampusSprite.play("krampus_anim", true);
    krampusSprite.setOrigin(0, 0.5);
    this.scene.sound.play("grit-spawn", { volume: 0.5 });

    krampusSprite.on("animationcomplete", () => {
      krampusSprite.destroy();
      this.PoofAnim1();
    });
  }

  private PoofAnim1() {
    if (!this.scene.anims.exists("coalspawn_spritesheet_anim")) {
      this.scene.anims.create({
        key: "coalspawn_spritesheet_anim",
        frames: this.scene.anims.generateFrameNumbers("coalspawn_spritesheet", {
          start: 0,
          end: 7,
        }),
        repeat: 0,
        frameRate: 10,
      });
    }

    const poofSprite1 = this.scene.add.sprite(
      this.x,
      this.y,
      "coalspawn_spritesheet",
    );
    poofSprite1.setDepth(1);
    poofSprite1.play("coalspawn_spritesheet_anim", true);
    poofSprite1.setOrigin(-0.2, 0.7);

    poofSprite1.on("animationcomplete", () => {
      poofSprite1.destroy();
    });
  }

  // Activate function
  public activate() {
    this.isActive = true;
    this.sprite.setVisible(true);
    this.Coal();
  }

  // Deactivate function
  public desactivate() {
    this.isActive = false;
    // Clear any active overlap handler and other states
    if (this.overlapHandler) {
      this.scene.physics.world.removeCollider(this.overlapHandler);
      this.overlapHandler = undefined;
    }
    this.sprite.setVisible(false);
    // this.sprite.setAlpha(0);
  }
}
