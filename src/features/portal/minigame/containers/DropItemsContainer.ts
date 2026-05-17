import { Scene } from "../Scene";
import { BumpkinContainer } from "../Core/BumpkinContainer";
import { DropItemType } from "../Types";

interface Props {
  x: number;
  y: number;
  scene: Scene;
  player?: BumpkinContainer;
  itemKey: DropItemType;
}

export class DropItem extends Phaser.Physics.Arcade.Sprite {
  scene: Scene;
  private player?: BumpkinContainer;
  dropItem?: DropItemType;

  constructor({ scene, x, y, player, itemKey }: Props) {
    super(scene, x, y, itemKey);
    this.scene = scene;
    this.player = player;
    this.dropItem = itemKey;

    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDepth(100);

    this.handleCollision();
  }

  handleCollision() {
    if (!this.player) return;

    const scene = this.scene;
    this.scene.physics.add.collider(
      this,
      this.player,
      () => {
        this.destroy();
        scene.portalService?.send("COLLECT_ITEM", { points: 1 });
      },
      undefined,
      this,
    );
  }
}
