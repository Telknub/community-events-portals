import Phaser from "phaser";
import { Projectile, ProjectileSpawnProps } from "./Projectile";

export class RollingProjectile extends Projectile {
  constructor(scene: Phaser.Scene, x = 0, y = 0, texture = "weapon_pumpkin") {
    super(scene, x, y, texture);
  }

  public spawn(props: ProjectileSpawnProps) {
    super.spawn(props);
    this.setAngularVelocity(220);
  }

  public despawn() {
    this.setAngularVelocity(0);
    super.despawn();
  }
}
