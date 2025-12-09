import { interactableModalManager } from "../components/interactables/InteractableModals";
import { WALKING_SPEED } from "../Constants";
import { BumpkinContainer } from "../Core/BumpkinContainer";
import { EventBus } from "../lib/EventBus";
import { Scene } from "../Scene";

interface Props {
  x: number;
  y: number;
  scene: Scene;
  id: number;
  difficulty: string;
  player?: BumpkinContainer;
}

export class PuzzlePoint extends Phaser.GameObjects.Container {
  private player?: BumpkinContainer;
  private spriteName: string;
  private sprite: Phaser.GameObjects.Sprite;
  private openedPuzzle = false;
  private id: number;
  private difficulty: string;

  scene: Scene;

  constructor({ x, y, scene, id, difficulty, player }: Props) {
    super(scene, x, y);
    this.scene = scene;
    this.player = player;
    this.id = id;
    this.difficulty = difficulty;

    // Sprite
    this.spriteName = "point";
    this.sprite = scene.add.sprite(0, 0, this.spriteName);

    // Overlaps
    this.createOverlaps();

    // Events
    this.createEvents();

    scene.physics.add.existing(this);
    (this.body as Phaser.Physics.Arcade.Body)
      .setSize(this.sprite.width, this.sprite.height)
      //   .setOffset(this.sprite.width, this.sprite.height)
      .setImmovable(true)
      .setCollideWorldBounds(true);

    this.setSize(this.sprite.width, this.sprite.height);
    this.add(this.sprite);

    scene.add.existing(this);
  }

  private createOverlaps() {
    if (!this.player) return;
    this.scene.physics.add.overlap(this.player, this, () => this.openPuzzle());
  }

  private createEvents() {
    EventBus.on("close-puzzle", (id: number) => {
      this.scene.velocity = WALKING_SPEED;
      if (id === this.id) {
        this.sprite.setTexture("checkpoint");
      }
    });
    EventBus.on("retry-puzzle", (id: number) => {
      if (id === this.id) {
        this.openedPuzzle = false;
      }
    });
  }

  private openPuzzle() {
    if (!this.openedPuzzle) {
      this.scene.velocity = 0;
      this.openedPuzzle = true;
      //   const puzzleType =
      //     this.scene.puzzleTypes[
      //       Math.floor(Math.random() * this.scene.puzzleTypes.length)
      //     ];
      const puzzleType = "jigsaw";
      console.log(puzzleType);
      interactableModalManager.open("puzzle", { puzzleType, id: this.id, difficulty: this.difficulty });
    }
  }
}
