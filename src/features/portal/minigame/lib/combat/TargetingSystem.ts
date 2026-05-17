import type { EnemyLike } from "../../Types";
import {
  distanceBetween,
  enemyCenter,
  isEnemyAlive,
  isWithinCone,
  type Vector,
} from "./geometry";

export class TargetingSystem {
  private enemies: EnemyLike[] = [];
  private nextScanAt = 0;

  constructor(
    private readonly enemyGroup: Phaser.Physics.Arcade.Group,
    private readonly targetScanMs: number,
  ) {}

  public update(time: number) {
    if (time < this.nextScanAt) return;

    this.enemies = this.getSafeGroupChildren().filter(
      (enemy): enemy is EnemyLike => isEnemyAlive(enemy as EnemyLike),
    );
    this.nextScanAt = time + this.targetScanMs;
  }

  public getActiveEnemies() {
    return this.enemies;
  }

  public nearest(origin: Vector, candidates = this.enemies) {
    let nearestEnemy: EnemyLike | undefined;
    let nearestDistance = Infinity;

    candidates.forEach((enemy) => {
      const distance = distanceBetween(origin, enemyCenter(enemy));

      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestEnemy = enemy;
      }
    });

    return nearestEnemy;
  }

  public random(candidates = this.enemies) {
    if (candidates.length === 0) return undefined;

    return Phaser.Utils.Array.GetRandom(candidates);
  }

  public inRadius(origin: Vector, radius: number) {
    return this.enemies.filter(
      (enemy) => distanceBetween(origin, enemyCenter(enemy)) <= radius,
    );
  }

  public inCone({
    origin,
    direction,
    range,
    arcDegrees,
  }: {
    origin: Vector;
    direction: Vector;
    range: number;
    arcDegrees: number;
  }) {
    return this.enemies.filter((enemy) =>
      isWithinCone({
        origin,
        target: enemyCenter(enemy),
        direction,
        range,
        arcDegrees,
      }),
    );
  }

  public chainNext({
    origin,
    chainRadius,
    excluded,
  }: {
    origin: Vector;
    chainRadius: number;
    excluded: Set<EnemyLike>;
  }) {
    const candidates = this.enemies.filter(
      (enemy) =>
        !excluded.has(enemy) &&
        distanceBetween(origin, enemyCenter(enemy)) <= chainRadius,
    );

    return this.nearest(origin, candidates);
  }

  public shutdown() {
    this.enemies = [];
  }

  private getSafeGroupChildren() {
    if (!this.enemyGroup || !(this.enemyGroup as any).scene) {
      return [] as Phaser.GameObjects.GameObject[];
    }

    try {
      return this.enemyGroup.getChildren();
    } catch {
      return [];
    }
  }
}
