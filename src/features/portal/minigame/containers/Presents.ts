import { SQUARE_WIDTH } from "features/game/lib/constants";
import { Scene } from "../Scene";
import { SantaSleigh } from "./SantaSleigh";
import { BumpkinContainer } from "../Core/BumpkinContainer";

interface Props {
  scene: Scene;
  sleigh: SantaSleigh; 
  player?: BumpkinContainer; 
  minX?: number; 
  maxX?: number; 
  endY?: number; 
  duration?: number; 
  loop?: boolean;
}
 
export class Present extends Phaser.GameObjects.Sprite {
  scene: Scene;
 
  private sleigh: SantaSleigh;
  private player?: BumpkinContainer;
  private minX: number;
  private maxX: number;
  private endY: number;
  private duration: number;
  private loop: boolean;
 
  private started = false;
  private falling = false;
  private dropped = false;
  private dropX: number;
  private lastCenterX?: number;
  private fallTween?: Phaser.Tweens.Tween;
  public canCatch = true;
 
  constructor({
    scene,
    sleigh,
    player,
    minX = 28 * SQUARE_WIDTH,
    maxX = 35 * SQUARE_WIDTH,
    endY = 30 * SQUARE_WIDTH,
    duration = 2000,
    loop = true,
  }: Props) {
    super(scene, minX, sleigh.y, "present");
    this.scene = scene;
    this.sleigh = sleigh;
    this.player = player;
    this.minX = minX;
    this.maxX = maxX;
    this.endY = endY;
    this.duration = duration;
    this.loop = loop;
    this.dropX = Phaser.Math.Between(minX, maxX);
 
    this.setOrigin(0, 0).setDepth(999).setVisible(false);
    scene.add.existing(this);
  }
 
  public start() {
    this.started = true;
  }
 
  preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);
 
    if (this.falling) {
      this.checkCatch();
    }
 
    if (!this.started) return;
 
    const centerX = this.sleigh.x + this.sleigh.displayWidth / 2;
    const lastX = this.lastCenterX;
    this.lastCenterX = centerX;
    if (lastX === undefined) return;
 
    if (Math.abs(centerX - lastX) > 5 * SQUARE_WIDTH) {
      this.dropX = Phaser.Math.Between(this.minX, this.maxX);
      this.dropped = false;
      return;
    }
 
    // Did the sleigh just travel over the drop point (either direction)?
    const crossed = (lastX - this.dropX) * (centerX - this.dropX) <= 0;
 
    if (crossed && !this.dropped && !this.falling) {
      this.dropped = true;
      this.drop();
    }
  }
 
  private drop() {
    this.falling = true;
 
    // Spawn at the random x, directly under the sleigh
    this.setPosition(
      this.dropX - this.displayWidth / 2,
      this.sleigh.y - this.displayHeight + 15,
    ).setVisible(true);
 
    this.fallTween = this.scene.tweens.add({
      targets: this,
      y: this.endY,
      duration: this.duration,
      ease: "Linear",
      onComplete: () => this.finish(),
    });
  }
 
  private checkCatch() {
    if (!this.canCatch) return;
    const player = this.player;
    if (!player || !this.active) return;
 
    if (this.hitsPlayer(player)) {
      this.fallTween?.stop();
      this.scene.portalService?.send("GAIN_POINTS");
      this.finish();
    }
  }
 
  private hitsPlayer(player: BumpkinContainer) {
    const body = player.body as Phaser.Physics.Arcade.Body | null;
    if (!body) return false;

    const playerRect = new Phaser.Geom.Rectangle(
      body.x,
      body.y,
      body.width,
      body.height,
    );

    return Phaser.Geom.Intersects.RectangleToRectangle(
      this.getBounds(),
      playerRect,
    );
  }

  private finish() {
    this.falling = false;
    this.fallTween = undefined;
 
    if (!this.loop) {
      this.destroy();
      return;
    }
    this.setVisible(false);
  }
}
 