import { BaseScene } from "features/world/scenes/BaseScene";
import { Gifts } from "../ChristmasDeliveryMayhemConstants";

interface Props {
  x: number;
  y: number;
  scene: BaseScene;
  gifts: Gifts[];
  direction: "left" | "right";
}

export class RequestBubbleContainer extends Phaser.GameObjects.Container {
  constructor({ x, y, scene, gifts, direction }: Props) {
    super(scene, x, y);
    this.scene = scene;

    const giftsContainer = scene.add.container().setPosition(x, y);

    gifts.forEach((gift, index) => {
      const giftSprite = scene.add.sprite(0, 0, gift);
      giftSprite.setPosition((giftSprite.width + 3) * index, 0).setOrigin(0);
      giftsContainer.add(giftSprite);
    });
    giftsContainer.setScale(0.6);

    const bounds = giftsContainer.getBounds();

    const bubble = (this.scene.add as any).rexNinePatch({
      x: bounds.centerX - 0.3,
      y: bounds.centerY + 0.5,
      width: bounds.width + 6,
      height: bounds.height + 6,
      key: "speech_bubble",
      columns: [5, 2, 2],
      rows: [2, 3, 4],
      baseFrame: undefined,
      getFrameNameCallback: undefined,
    });
    bubble.setScale(direction === "right" ? 1 : -1, 1);

    this.add(bubble);
    this.add(giftsContainer);

    bubble.setAlpha(0.7);

    this.setPosition(
      direction === "right" ? 2 : -bounds.width,
      -bounds.height - 12,
    );
  }
}
