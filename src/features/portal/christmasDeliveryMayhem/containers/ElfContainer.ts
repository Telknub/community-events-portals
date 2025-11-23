import { BumpkinContainer } from "features/world/containers/BumpkinContainer";
import { BaseScene } from "features/world/scenes/BaseScene";
import {
  Gifts,
  GIFTS_NAMES,
  MAX_GIFTS_PER_REQUEST,
  REQUEST_COOLDOWN,
  REQUEST_TIME_LIMIT_PER_GIFTS,
} from "../ChristmasDeliveryMayhemConstants";
import { MachineInterpreter } from "../lib/christmasDeliveryMayhemMachine";
import { GiftContainer } from "./GiftContainer";
import { RequestBubbleContainer } from "./RequestBubbleContainer";
import { ProgressBar } from "./ProgressBarContainer";
import confetti from "canvas-confetti";

interface Props {
  x: number;
  y: number;
  scene: BaseScene;
  direction: "left" | "right";
  position: number;
  player?: BumpkinContainer;
}

export class ElfContainer extends Phaser.GameObjects.Container {
  private direction: "left" | "right";
  private player?: BumpkinContainer;
  private sprite: Phaser.GameObjects.Sprite;
  private requestBubble: RequestBubbleContainer | null;
  private request!: Gifts[];
  private progressBar: ProgressBar;
  private pos: number;

  scene: BaseScene;

  constructor({ x, y, scene, direction, position, player }: Props) {
    super(scene, x - 2, y - 6);
    this.scene = scene;
    this.direction = direction;
    this.player = player;
    this.requestBubble = null;
    this.pos = position;

    // Elf Sprite
    const spriteName = "elf";
    const scale = direction === "right" ? 1 : -1;
    const originX = direction === "right" ? 0 : 1;
    const originY = direction === "right" ? 0 : 0;
    this.sprite = scene.add
      .sprite(0, 0, spriteName)
      .setOrigin(originX, originY)
      .setScale(scale, 1);

    // Animation
    this.scene.anims.create({
      key: `${spriteName}_action`,
      frames: this.scene.anims.generateFrameNumbers(spriteName, {
        start: 0,
        end: 8,
      }),
      repeat: -1,
      frameRate: 10,
    });
    this.sprite.play(`${spriteName}_action`, true);

    // Progress Bar
    this.progressBar = new ProgressBar({
      x: 2,
      y: this.sprite.height + 3,
      scene: this.scene,
      duration: REQUEST_TIME_LIMIT_PER_GIFTS[1],
      onComplete: () => this.handleTimeout(),
    });

    // Action - Overlap
    this.handleOverlap();

    this.setDepth(1000000000);
    this.setSize(this.sprite.width, this.sprite.height);
    this.add([this.sprite, this.progressBar]);

    scene.add.existing(this);
  }

  private get isGamePlaying() {
    return this.portalService?.state.matches("playing") === true;
  }

  private get portalService() {
    return this.scene.registry.get("portalService") as
      | MachineInterpreter
      | undefined;
  }

  private handleOverlap() {
    if (!this.player) return;

    this.scene.physics.world.enable(this);

    (this.body as Phaser.Physics.Arcade.Body)
      .setSize(16, 16)
      .setOffset(this.sprite.width / 2 + 2, this.sprite.height / 2 + 22)
      .setImmovable(true)
      .setCollideWorldBounds(true);

    this.scene.physics.add.overlap(
      this.player as Phaser.GameObjects.GameObject,
      this as Phaser.GameObjects.GameObject,
      () => this.deliverGifts(),
    );
  }

  private deliverGifts() {
    const myInventory = this.portalService?.state.context.gifts || [];
    if (myInventory?.length === 0) return;

    this.animateRemoval();
    this.portalService?.send("CLEAR_INVENTORY");
    this.requestBubble?.destroy();
    this.requestBubble = null;
    this.progressBar.delete();

    const isInRequest = myInventory.every((gift) =>
      this.request.includes(gift),
    );
    let emotionName;

    if (this.request.length === myInventory.length && isInRequest) {
      confetti();
      this.scene.sound.play("good-sound");
      this.portalService?.send("STREAK", { streak: 1 });
      emotionName = "happy";
    } else {
      this.portalService?.send("STREAK", { streak: -1 });
      this.portalService?.send("LOSE_LIFE");
      this.scene.sound.play("bad-sound", { volume: 0.1 });
      emotionName = "sad";
    }
    this.request = [];
    const direction = this.direction === "left" ? "right" : "left";
    this.portalService?.send("UPDATE_DELIVERIES", {
      delivery: this.request,
      direction: direction,
      position: this.pos,
    });
    const points = this.portalService?.state.context.streak || 0;
    const emoticon = this.createEmoticon(points, emotionName);

    this.scene.time.delayedCall(REQUEST_COOLDOWN, () => {
      emoticon.destroy();
      this.createRequest();
    });
  }

  private createEmoticon(amount: number, spriteName: string) {
    const emoticonContainer = this.scene.add.container(10, -3);
    const sign = amount > 0 ? "+" : "-";

    const label = this.scene.add
      .text(0, -3, `${sign}${Math.abs(amount)}`, {
        fontSize: "3.5px",
        fontFamily: "Teeny",
        color: "#FFFFFF",
        resolution: 10,
        stroke: "#000000",
        strokeThickness: 1.5,
      })
      .setOrigin(1, 0);
    emoticonContainer.add(label);

    const emoticon = this.scene.add.sprite(3, 0, spriteName);
    emoticonContainer.add(emoticon);

    this.add(emoticonContainer);

    return emoticonContainer;
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

  private handleTimeout() {
    this.requestBubble?.destroy();
    this.requestBubble = null;
    if (!this.isGamePlaying) return;

    this.request = [];
    const direction = this.direction === "left" ? "right" : "left";
    this.portalService?.send("UPDATE_DELIVERIES", {
      delivery: this.request,
      direction: direction,
      position: this.pos,
    });
    this.portalService?.send("STREAK", { streak: -1 });
    const points = this.portalService?.state.context.streak || 0;
    const emoticon = this.createEmoticon(points, "sad");
    this.portalService?.send("LOSE_LIFE");
    this.scene.sound.play("bad-sound", { volume: 0.1 });

    this.scene.time.delayedCall(REQUEST_COOLDOWN, () => {
      emoticon.destroy();
      this.createRequest();
    });
  }

  destroyInfo() {
    this.requestBubble?.destroy();
    this.requestBubble = null;
    this.progressBar.delete();
  }

  private generateRandomRequest() {
    const request: Gifts[] = [];
    const gifts = [...GIFTS_NAMES];
    const amount = Math.floor(Math.random() * MAX_GIFTS_PER_REQUEST) + 1;

    for (let i = 1; i <= amount; i++) {
      const randomIndex = Math.floor(Math.random() * gifts.length);
      request.push(gifts[randomIndex]);
      gifts.splice(randomIndex, 1);
    }
    return request;
  }

  createRequest() {
    if (this.requestBubble) return;

    this.request = this.generateRandomRequest();

    const direction = this.direction === "left" ? "right" : "left";
    this.portalService?.send("UPDATE_DELIVERIES", {
      delivery: this.request,
      direction: direction,
      position: this.pos,
    });

    this.requestBubble = new RequestBubbleContainer({
      x: 9,
      y: 10,
      scene: this.scene,
      gifts: this.request,
      direction: this.direction,
    });
    this.add(this.requestBubble);

    this.progressBar.duration =
      REQUEST_TIME_LIMIT_PER_GIFTS[this.request.length];
    this.progressBar?.start();
  }
}
