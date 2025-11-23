import { BumpkinContainer } from "features/world/containers/BumpkinContainer";
import { BaseScene, WALKING_SPEED } from "features/world/scenes/BaseScene";
import {
  SLOWDOWN_SPEED,
  SPEEDUP,
  INDICATOR_BLINK_SPEED,
} from "../ChristmasDeliveryMayhemConstants";

interface Props {
  x: number;
  y: number;
  scene: BaseScene;
  player?: BumpkinContainer;
  removedAnim?: boolean;
}

export class NewSnowStormContainer extends Phaser.GameObjects.Container {
  private player?: BumpkinContainer;
  private sprite: Phaser.GameObjects.Sprite;
  private sprite0: Phaser.GameObjects.Sprite;
  scene: BaseScene;
  private randomDirection!: string; // Store the random direction
  public isActive = true; // Flag to track active snowstorm
  private startTime = 0; // Track the start time of the snowstorm
  private activateNormalSnow = false;
  private emoticonContainer: Phaser.GameObjects.Sprite | null = null;

  constructor({ x, y, scene, player }: Props) {
    super(scene, x, y);
    this.scene = scene;
    this.player = player;

    const spriteName = "snowstorm_left_final_tileset";
    this.sprite = scene.add.sprite(0, 0, spriteName).setOrigin(0);

    const spriteName0 = "snowstorm_right_final_tileset_2";
    this.sprite0 = scene.add.sprite(0, 0, spriteName0).setOrigin(0);

    this.setSize(this.sprite.width, this.sprite.height);
    this.add(this.sprite);

    this.setSize(this.sprite0.width, this.sprite0.height);
    this.add(this.sprite0);

    this.sprite.setVisible(false);
    this.sprite0.setVisible(false);

    scene.add.existing(this);
  }

  // Activate the snowstorm event
  activate() {
    this.initializeSnowStorm();
    this.scene.sound.play("snow-storm", { loop: true });
    if (this.emoticonContainer) {
      this.emoticonContainer.setVisible(true);
    }
    // console.log("Snowstorm activated.");
  }

  // Deactivate the snowstorm event
  desactivate() {
    this.isActive = false;
    this.scene.velocity = WALKING_SPEED;
    this.scene.sound.stopByKey("snow-storm");

    this.sprite.setVisible(false);
    this.randomDirection = "";
    this.startTime = 0;

    if (this.emoticonContainer) {
      this.emoticonContainer.setVisible(false);
    }
    // console.log("Snowstorm deactivated and variables cleared.");
  }

  initializeSnowStorm() {
    this.sprite.setVisible(true);
    this.sprite.setDepth(100000000000);
    this.isActive = true; // Snowstorm starts
    this.randomDirection = this.generateRandomDirection();
    this.startTime = this.scene.time.now;

    // Call the appropriate animation based on the random direction
    if (this.randomDirection === "right") {
      this.snowStormAnim1(); // Play animation for left direction
    } else {
      this.snowStormAnim2(); // Play animation for right direction
    }
  }

  private snowStormAnim1() {
    if (!this.scene.anims.exists("snowstorm_left_final_tileset_anim")) {
      this.scene.anims.create({
        key: "snowstorm_left_final_tileset_anim",
        frames: this.scene.anims.generateFrameNumbers(
          "snowstorm_left_final_tileset",
          {
            start: 0,
            end: 19,
          },
        ),
        repeat: -1,
        frameRate: 10,
      });
    }
    this.sprite.play("snowstorm_left_final_tileset_anim", true);
  }

  private snowStormAnim2() {
    if (!this.scene.anims.exists("snowstorm_right_final_tileset_2_anim")) {
      this.scene.anims.create({
        key: "snowstorm_right_final_tileset_2_anim",
        frames: this.scene.anims.generateFrameNumbers(
          "snowstorm_right_final_tileset_2",
          {
            start: 0,
            end: 19,
          },
        ),
        repeat: -1,
        frameRate: 10,
      });
    }
    this.sprite.play("snowstorm_right_final_tileset_2_anim", true);
  }

  generateRandomDirection(): string {
    const directions = ["left", "right"];
    const randomIndex = Math.floor(Math.random() * directions.length);
    return directions[randomIndex];
  }

  speedDirection() {
    if (!this.isActive) return;
    if (this.scene.currentPlayer?.directionFacing === this.randomDirection) {
      this.scene.velocity = WALKING_SPEED - SLOWDOWN_SPEED;
      // console.log("slower");
    } else {
      const newSpeed = (this.scene.velocity = WALKING_SPEED + SPEEDUP);
      // console.log("faster", newSpeed);
    }
  }

  emotionIndicator() {
    const emotionName = "snowflake_icon";

    if (!this.isActive) {
      return emotionName;
    }

    if (!this.emoticonContainer) {
      const emoticon = this.createEmoticon(emotionName);

      if (emoticon) {
        this.createBlinkingEffect(emoticon);

        // this.scene.time.delayedCall(INDICATOR_DURATION, () => {
        //   emoticon.setVisible(false)
        // });
      }
    }
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

  private createEmoticon(spriteName: string) {
    if (!this.player) {
      return;
    }

    if (!this.emoticonContainer) {
      this.emoticonContainer = this.scene.add.sprite(
        this.player.x,
        this.player.y,
        spriteName,
      );
    }

    return this.emoticonContainer;
  }

  updateEmoticonPosition() {
    if (this.player && this.emoticonContainer) {
      const positionX = this.player.x;
      const positionY = this.player.y - 15;

      this.emoticonContainer.setPosition(positionX, positionY);
    }
  }

  public normalSnowStorm() {
    if (this.activateNormalSnow) return;
    const normalSnow = this.scene.add
      .sprite(0, 0, "snowstorm_final_tileset")
      .setOrigin(0);
    normalSnow.setVisible(true);
    normalSnow.setDepth(100000000000);

    if (!this.scene.anims.exists("snowstorm_final_tileset_anim")) {
      this.scene.anims.create({
        key: "snowstorm_final_tileset_anim",
        frames: this.scene.anims.generateFrameNumbers(
          "snowstorm_final_tileset",
          {
            start: 0,
            end: 19,
          },
        ),
        repeat: -1,
        frameRate: 10,
      });
    }
    normalSnow.play("snowstorm_final_tileset_anim", true);
  }
}
