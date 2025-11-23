import { BaseScene } from "features/world/scenes/BaseScene";
import Phaser from "phaser";
import {
  PROGRESS_BAR_WIDTH,
  PROGRESS_BAR_X,
} from "../ChristmasDeliveryMayhemConstants";

interface Props {
  x: number;
  y: number;
  scene: BaseScene;
  duration: number;
  onComplete: () => void;
}

export class ProgressBar extends Phaser.GameObjects.Container {
  duration: number;
  private completionCallback: () => void;
  private progressBar: Phaser.GameObjects.Graphics;
  private tween: Phaser.Tweens.Tween | null;

  constructor({
    x,
    y,
    scene,
    duration,
    onComplete: completionCallback,
  }: Props) {
    super(scene, x, y);

    this.duration = duration;
    this.completionCallback = completionCallback;
    this.tween = null;

    // Create the progress box
    const progressBoxBlueGray1 = scene.add.graphics();
    progressBoxBlueGray1
      .fillStyle(0x262b44)
      .fillRect(PROGRESS_BAR_X, -3, PROGRESS_BAR_WIDTH, 4);

    const progressBoxBlueGray2 = scene.add.graphics();
    progressBoxBlueGray2
      .fillStyle(0x262b44)
      .fillRect(PROGRESS_BAR_X + 1, -4, PROGRESS_BAR_WIDTH - 2, 6);

    const progressBoxWhite = scene.add.graphics();
    progressBoxWhite
      .fillStyle(0xffffff)
      .fillRect(PROGRESS_BAR_X + 1, -3, PROGRESS_BAR_WIDTH - 2, 3);

    const progressBoxLightBlue = scene.add.graphics();
    progressBoxLightBlue
      .fillStyle(0x8b9bb4)
      .fillRect(PROGRESS_BAR_X + 1, 0, PROGRESS_BAR_WIDTH - 2, 1);

    const progressBoxDarkTeal = scene.add.graphics();
    progressBoxDarkTeal
      .fillStyle(0x193c3e)
      .fillRect(PROGRESS_BAR_X + 2, -2, PROGRESS_BAR_WIDTH - 4, 1);

    // Create the progress bar
    this.progressBar = scene.add.graphics();

    this.setVisible(false);
    this.add(progressBoxBlueGray1);
    this.add(progressBoxBlueGray2);
    this.add(progressBoxWhite);
    this.add(progressBoxLightBlue);
    this.add(progressBoxDarkTeal);
    this.add(this.progressBar);

    scene.add.existing(this);
  }

  start() {
    if (this.tween) this.tween.remove();
    this.setVisible(true);
    this.tween = this.scene.tweens.addCounter({
      from: PROGRESS_BAR_WIDTH - 4,
      to: 0,
      duration: this.duration,
      onUpdate: (tween) => {
        const value = tween.getValue();
        this.updateProgress(value);
      },
      onComplete: () => this.onComplete(),
    });
  }

  private updateProgress(value: number) {
    this.progressBar.clear();
    this.progressBar.fillStyle(0x63c74d);
    this.progressBar.fillRect(PROGRESS_BAR_X + 2, -2, value, 1);
  }

  private onComplete() {
    // Handle completion of the progress bar
    if (this.completionCallback) {
      this.completionCallback();
      this.delete();
    }
  }

  delete() {
    this.setVisible(false);
    this.tween?.destroy();
    this.tween = null;
  }
}
