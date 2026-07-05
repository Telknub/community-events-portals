import Phaser from "phaser";
import { Projectile, ProjectileSpawnProps } from "./Projectile";

const HORIZONTAL_PUMPKIN_TEXTURE_KEY = "weapon_horizontal_pumpkin";
const VERTICAL_PUMPKIN_TEXTURE_KEY = "weapon_vertical_pumpkin";
const DIAGONAL_PUMPKIN_TEXTURE_KEY = "weapon_diagonal_pumpkin";
const HORIZONTAL_PUMPKIN_ANIMATION_KEY = "weapon_horizontal_pumpkin_active";
const VERTICAL_PUMPKIN_ANIMATION_KEY = "weapon_vertical_pumpkin_active";
const DIAGONAL_PUMPKIN_ANIMATION_KEY = "weapon_diagonal_pumpkin_active";
const DIAGONAL_PUMPKIN_REVERSE_ANIMATION_KEY =
  "weapon_diagonal_pumpkin_active_reverse";

type PumpkinPresentation = {
  texture: string;
  animationKey: string;
  flipX: boolean;
  flipY: boolean;
};

export class RollingProjectile extends Projectile {
  constructor(
    scene: Phaser.Scene,
    x = 0,
    y = 0,
    texture = HORIZONTAL_PUMPKIN_TEXTURE_KEY,
  ) {
    super(scene, x, y, texture);
  }

  public spawn(props: ProjectileSpawnProps) {
    const presentation = this.getPumpkinPresentation(props.velocity);

    super.spawn({
      ...props,
      texture: presentation.texture,
      animationKey: presentation.animationKey,
      flipX: presentation.flipX,
      flipY: presentation.flipY,
    });
    this.setAngularVelocity(0);
  }

  public despawn() {
    this.setAngularVelocity(0);
    super.despawn();
  }

  private getPumpkinPresentation({
    x,
    y,
  }: ProjectileSpawnProps["velocity"]): PumpkinPresentation {
    const angle = Phaser.Math.Angle.Wrap(Math.atan2(y, x));
    const octant = Phaser.Math.Wrap(Math.round(angle / (Math.PI / 4)), 0, 8);

    switch (octant) {
      case 0:
        return {
          texture: HORIZONTAL_PUMPKIN_TEXTURE_KEY,
          animationKey: HORIZONTAL_PUMPKIN_ANIMATION_KEY,
          flipX: true,
          flipY: false,
        };
      case 1:
        return {
          texture: DIAGONAL_PUMPKIN_TEXTURE_KEY,
          animationKey: DIAGONAL_PUMPKIN_ANIMATION_KEY,
          flipX: true,
          flipY: false,
        };
      case 2:
        return {
          texture: VERTICAL_PUMPKIN_TEXTURE_KEY,
          animationKey: VERTICAL_PUMPKIN_ANIMATION_KEY,
          flipX: false,
          flipY: false,
        };
      case 3:
        return {
          texture: DIAGONAL_PUMPKIN_TEXTURE_KEY,
          animationKey: DIAGONAL_PUMPKIN_ANIMATION_KEY,
          flipX: false,
          flipY: false,
        };
      case 4:
        return {
          texture: HORIZONTAL_PUMPKIN_TEXTURE_KEY,
          animationKey: HORIZONTAL_PUMPKIN_ANIMATION_KEY,
          flipX: false,
          flipY: false,
        };
      case 5:
        return {
          texture: DIAGONAL_PUMPKIN_TEXTURE_KEY,
          animationKey: DIAGONAL_PUMPKIN_REVERSE_ANIMATION_KEY,
          flipX: true,
          flipY: false,
        };
      case 6:
        return {
          texture: VERTICAL_PUMPKIN_TEXTURE_KEY,
          animationKey: VERTICAL_PUMPKIN_ANIMATION_KEY,
          flipX: false,
          flipY: true,
        };
      case 7:
      default:
        return {
          texture: DIAGONAL_PUMPKIN_TEXTURE_KEY,
          animationKey: DIAGONAL_PUMPKIN_REVERSE_ANIMATION_KEY,
          flipX: false,
          flipY: false,
        };
    }
  }
}
