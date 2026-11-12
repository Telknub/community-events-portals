import { SQUARE_WIDTH } from "features/game/lib/constants";
import { Scene } from "../Scene";

interface Props {
  x: number;
  y: number;
  scene: Scene;
  endX?: number; 
  duration?: number;
  loop?: boolean;
  delay?: number;
  repeatDelay?: number;
}

export class SantaSleigh extends Phaser.GameObjects.Sprite {
  scene: Scene;

  private endX: number;
  private duration: number;
  private loop: boolean;
  private tween?: Phaser.Tweens.Tween;
  private delay: number; 
  private repeatDelay: number;
  private startX?: number;
  private moving = false;

  constructor({
    x,
    y,
    scene,
    endX = 32 * SQUARE_WIDTH,
    duration = 5000,
    loop = true,
    delay = 0,
    repeatDelay = 0,
  }: Props) {
    super(scene, x, y, "santa_sleigh");
    this.scene = scene;
    this.endX = endX;
    this.duration = duration;
    this.loop = loop;
    this.delay = delay;
    this.repeatDelay = repeatDelay;

    this.setOrigin(0, 0).setDepth(100);
    this.setVisible(false);
    scene.add.existing(this);
  }

    public get isMoving() {
        return this.moving;
    }

  public start() {
    if (this.tween) return;
    this.startX = this.x; 
    this.run(this.delay);
  }

  private run(delay: number) {
    this.setVisible(false); 
    this.x = this.startX as number; 

    this.tween = this.scene.tweens.add({
      targets: this,
      x: this.endX,
      duration: this.duration,
      ease: "Linear",
      delay,
      onStart: () => {this.setVisible(true); this.moving = true},
      onComplete: () => {
        this.setVisible(false); 
        this.moving = false;
        if (this.loop) this.run(this.repeatDelay);
      },
    });
  }
}
