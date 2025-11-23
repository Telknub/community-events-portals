import { BumpkinContainer } from "features/world/containers/BumpkinContainer";
import { BaseScene } from "features/world/scenes/BaseScene";
import { Gifts } from "../ChristmasDeliveryMayhemConstants";
import { GiftContainer } from "./GiftContainer";
import { MachineInterpreter } from "../lib/christmasDeliveryMayhemMachine";

interface Props {
  x: number;
  y: number;
  scene: BaseScene;
  player?: BumpkinContainer;
}

export class BonfireContainer extends Phaser.GameObjects.Container {
  private player?: BumpkinContainer;
  private sprite: Phaser.GameObjects.Sprite;
  private hasOverlapped = false;

  scene: BaseScene;

  constructor({ x, y, scene, player }: Props) {
    super(scene, x + 4, y + 4);
    this.scene = scene;
    this.player = player;

    // Bonfire Sprite
    const spriteName = "bonfire";
    this.sprite = scene.add
      .sprite(0, 0, spriteName)
      .setOrigin(0)
      .setScale(1.05);

    // Animation
    this.scene.anims.create({
      key: `${spriteName}_action`,
      frames: this.scene.anims.generateFrameNumbers(spriteName, {
        start: 0,
        end: 10,
      }),
      repeat: -1,
      frameRate: 10,
    });
    this.sprite.play(`${spriteName}_action`, true);

    // Action - Overlap
    this.handleOverlap();

    this.setSize(this.sprite.width, this.sprite.height);
    this.add(this.sprite);

    scene.add.existing(this);
  }

  public get portalService() {
    return this.scene.registry.get("portalService") as
      | MachineInterpreter
      | undefined;
  }

  private handleOverlap() {
    if (!this.player) return;

    this.scene.physics.world.enable(this);

    (this.body as Phaser.Physics.Arcade.Body)
      .setSize(
        this.sprite.width * this.sprite.scale,
        this.sprite.height * this.sprite.scale,
      )
      .setOffset(this.sprite.width / 2, this.sprite.height / 2)
      .setImmovable(true)
      .setCollideWorldBounds(true);

    this.scene.physics.add.overlap(
      this.player as Phaser.GameObjects.GameObject,
      this as Phaser.GameObjects.GameObject,
      () => {
        if (!this.hasOverlapped) {
          this.hasOverlapped = true;
          this.animateRemoval();
          this.portalService?.send("CLEAR_INVENTORY");
          this.scene.sound.play("coal-sound", { volume: 0.3 });
        }
      },
    );

    this.scene.events.on("update", () => {
      if (
        !this.scene.physics.world.overlap(
          this.player as BumpkinContainer,
          this,
        ) &&
        this.hasOverlapped
      ) {
        this.hasOverlapped = false;
      }
    });
  }

  private animateRemoval() {
    const removedGifts = this.portalService?.state.context.gifts as string[];

    removedGifts.forEach((giftName, index) => {
      const gift = new GiftContainer({
        x: this.player?.x || 0,
        y: this.player?.y || 0,
        name: giftName as Gifts,
        scene: this.scene,
        removedAnim: true,
      });
      gift.playRemovalAnimation(index);
    });
  }
}
