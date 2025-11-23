import { BumpkinContainer } from "features/world/containers/BumpkinContainer";
import { BaseScene } from "features/world/scenes/BaseScene";
import { MachineInterpreter } from "../lib/christmasDeliveryMayhemMachine";
import {
  GRIT_TARGET_Y,
  GRIT_DURATION_ANIM,
  GIFT_RESPAWN_TIME_AFTER_THEFT,
  INDICATOR_BLINK_SPEED,
} from "../ChristmasDeliveryMayhemConstants";
import { GiftContainer } from "./GiftContainer";

interface Props {
  x: number;
  y: number;
  scene: BaseScene;
  gifts: GiftContainer[];
  player?: BumpkinContainer;
}

export class GritContainer extends Phaser.GameObjects.Container {
  private player?: BumpkinContainer;
  private gifts: GiftContainer[];
  sprite: Phaser.GameObjects.Sprite;
  scene: BaseScene;
  private spriteGritHide!: Phaser.GameObjects.Sprite;
  private initialY: number;
  public isActive = true; // Flag to track active
  private overlapHandler?: Phaser.Physics.Arcade.Collider;
  private emoticonContainer: Phaser.GameObjects.Sprite | null = null;

  constructor({ x, y, scene, gifts, player }: Props) {
    super(scene, x, y);
    this.scene = scene;
    this.player = player;
    this.gifts = gifts;
    this.initialY = y;

    const spriteName = "Grit_Carrying";
    this.sprite = scene.add.sprite(0, 0, spriteName).setOrigin(0);

    this.Grit();
    this.GritAnim();
    this.startMovement();

    this.setSize(this.sprite.width, this.sprite.height);
    this.add(this.sprite);

    this.sprite.setVisible(true);

    this.setDepth(10000);

    scene.add.existing(this);
  }

  public get portalService() {
    return this.scene.registry.get("portalService") as
      | MachineInterpreter
      | undefined;
  }

  private Grit() {
    if (!this.player || !this.isActive) return;

    this.scene.physics.world.enable(this);

    (this.body as Phaser.Physics.Arcade.Body)
      .setSize(this.sprite.width, this.sprite.height)
      .setOffset(this.sprite.width / 2, this.sprite.height / 2)
      .setImmovable(true)
      .setCollideWorldBounds(true);

    this.overlapHandler = this.scene.physics.add.overlap(
      this.player as Phaser.GameObjects.GameObject,
      this as Phaser.GameObjects.GameObject,
      () => this.handleOverlap(),
    );
  }

  private GritAnim() {
    if (!this.scene.anims.exists("Grit_Carrying_anim")) {
      this.scene.anims.create({
        key: "Grit_Carrying_anim",
        frames: this.scene.anims.generateFrameNumbers("Grit_Carrying", {
          start: 0,
          end: 7,
        }),
        repeat: -1,
        frameRate: 15,
      });
    }
    this.sprite.play("Grit_Carrying_anim", true);
  }

  private handleOverlap() {
    if (!this.isActive) return;
    this.scene.sound.play("grit-die", { volume: 0.3 });
    this.GritScapeAnim();
    this.scene.tweens.killTweensOf(this);
    this.collision();
  }

  private GritScapeAnim() {
    if (!this.scene.anims.exists("Grit_escape_anim")) {
      this.scene.anims.create({
        key: "Grit_escape_anim",
        frames: this.scene.anims.generateFrameNumbers("Grit_escape", {
          start: 0,
          end: 8,
        }),
        repeat: 0,
        frameRate: 8,
      });
    }

    const escapeSprite = this.scene.add.sprite(this.x, this.y, "Grit_escape");
    escapeSprite.setDepth(1);
    escapeSprite.play("Grit_escape_anim", true);
    escapeSprite.setOrigin(0);

    escapeSprite.on("animationcomplete", () => {
      escapeSprite.destroy();
    });
  }

  private startMovement() {
    if (!this.isActive) return;

    const gritReturns = () => {
      this.scene.tweens.add({
        targets: this,
        y: this.initialY,
        duration: GRIT_DURATION_ANIM * 1.75,
        ease: "Linear",
        onComplete: () => {
          this.handleOverlap();
          this.removeLife();
        },
      });
    };

    this.scene.tweens.add({
      targets: this,
      y: GRIT_TARGET_Y,
      duration: GRIT_DURATION_ANIM,
      ease: "Linear",
      onComplete: () => {
        this.giftNotVisible();
        gritReturns();
      },
    });
  }

  private giftNotVisible() {
    if (!this.isActive) return;

    // console.log(this.gifts);

    this.gifts.forEach((gift) => {
      gift.deactivateGift(GIFT_RESPAWN_TIME_AFTER_THEFT); // Deactivate each gift after the delay
      this.scene.sound.play("gift-pickup");
    });
  }

  // Remove one life from the player
  private removeLife() {
    if (this.portalService) {
      const currentLives = this.portalService.state.context.lives;
      if (currentLives > 0) {
        this.portalService.send({ type: "LOSE_LIFE" });
        this.scene.sound.play("bad-sound", { volume: 0.1 });
      }
    }
  }

  public collision() {
    if (this.isActive) {
      this.isActive = false;
      this.y = this.initialY;

      if (this.emoticonContainer) {
        this.emoticonContainer.setVisible(false);
      }

      this.gifts.forEach((gift) => {
        gift.deactivateGift(200);
      });

      // Remove the overlap event
      if (this.overlapHandler) {
        this.scene.physics.world.removeCollider(this.overlapHandler);
        this.overlapHandler = undefined;
      }
      this.scene.tweens.killTweensOf(this);
      this.sprite.stop();
      this.scene.physics.world.disable(this);
      this.sprite.setVisible(false);
      // this.sprite.destroy();
      // this.destroy();
    }
  }

  emotionIndicator() {
    const emotionName = "grit_icon";

    if (!this.isActive) {
      return emotionName;
    }

    if (!this.emoticonContainer) {
      const emoticon = this.createEmoticon(emotionName);

      if (emoticon) {
        this.createBlinkingEffect(emoticon);

        // this.scene.time.delayedCall(INDICATOR_DURATION, () => {
        //   emoticon.setVisible(false);
        // });
      }
    }
  }

  private createEmoticon(emoticonSprite: string) {
    if (!this.player) {
      return;
    }

    if (!this.emoticonContainer) {
      this.emoticonContainer = this.scene.add.sprite(
        this.player.x,
        this.player.y,
        emoticonSprite,
      );
    }

    return this.emoticonContainer;
  }

  private createBlinkingEffect(emoticon: Phaser.GameObjects.Sprite) {
    this.scene.tweens.add({
      targets: emoticon,
      alpha: { from: 1, to: 0 },
      duration: INDICATOR_BLINK_SPEED,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }

  updateEmoticonPosition() {
    if (this.player && this.emoticonContainer) {
      const positionX = this.player.x;
      const positionY = this.player.y - 15;

      this.emoticonContainer.setPosition(positionX, positionY);
    }
  }

  // Activate the GritContainer
  public activate() {
    if (!this.isActive) {
      this.isActive = true;
      this.sprite.setVisible(true);
      this.Grit();
      this.GritAnim();
      this.startMovement();
      if (this.emoticonContainer) {
        this.emoticonContainer.setVisible(true);
      }
    }
  }

  // Deactivate the GritContainer
  public desactivate() {
    if (this.isActive) {
      this.isActive = false;
      this.y = this.initialY;

      // Remove the overlap event
      if (this.overlapHandler) {
        this.scene.physics.world.removeCollider(this.overlapHandler);
        this.overlapHandler = undefined;
      }

      if (this.emoticonContainer) {
        this.emoticonContainer.setVisible(false);
      }

      this.scene.tweens.killTweensOf(this);
      this.sprite.stop();
      this.scene.physics.world.disable(this);
      this.sprite.setVisible(false);
      // this.removeLife();
      // this.sprite.destroy();
      // this.destroy();
    }
  }
}
