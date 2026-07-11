import type { EnemyLike } from "../../Types";
import {
  enemyCenter,
  isEnemyAlive,
  isWithinCone,
  type Vector,
} from "./geometry";

type EnemyEntry = {
  enemy: EnemyLike;
  x: number;
  y: number;
};

const DEFAULT_GRID_CELL_SIZE = 96;

export class TargetingSystem {
  private enemies: EnemyLike[] = [];
  private entries: EnemyEntry[] = [];
  private readonly entriesByEnemy = new Map<EnemyLike, EnemyEntry>();
  private readonly grid = new Map<string, EnemyEntry[]>();
  private nextScanAt = 0;

  constructor(
    private readonly enemyGroup: Phaser.Physics.Arcade.Group,
    private readonly targetScanMs: number,
    private readonly gridCellSize = DEFAULT_GRID_CELL_SIZE,
  ) {}

  public update(time: number) {
    if (time < this.nextScanAt) return;

    this.rebuildSpatialIndex();
    this.nextScanAt = time + this.targetScanMs;
  }

  public getActiveEnemies() {
    return this.enemies;
  }

  public nearest(origin: Vector, candidates?: EnemyLike[]) {
    let nearestEnemy: EnemyLike | undefined;
    let nearestDistanceSq = Infinity;

    if (!candidates) {
      for (let index = 0; index < this.entries.length; index++) {
        const entry = this.entries[index];
        const dx = entry.x - origin.x;
        const dy = entry.y - origin.y;
        const distanceSq = dx * dx + dy * dy;

        if (distanceSq < nearestDistanceSq) {
          nearestDistanceSq = distanceSq;
          nearestEnemy = entry.enemy;
        }
      }

      return nearestEnemy;
    }

    for (let index = 0; index < candidates.length; index++) {
      const enemy = candidates[index];
      const entry = this.entriesByEnemy.get(enemy);
      const center = entry ?? enemyCenter(enemy);
      const dx = center.x - origin.x;
      const dy = center.y - origin.y;
      const distanceSq = dx * dx + dy * dy;

      if (distanceSq < nearestDistanceSq) {
        nearestDistanceSq = distanceSq;
        nearestEnemy = enemy;
      }
    }

    return nearestEnemy;
  }

  public random(candidates = this.enemies) {
    if (candidates.length === 0) return undefined;

    return Phaser.Utils.Array.GetRandom(candidates);
  }

  public inRadius(origin: Vector, radius: number) {
    const radiusSq = radius * radius;
    const nearbyEntries = this.queryGrid(origin.x, origin.y, radius, radius);
    const result: EnemyLike[] = [];

    for (let index = 0; index < nearbyEntries.length; index++) {
      const entry = nearbyEntries[index];
      const dx = entry.x - origin.x;
      const dy = entry.y - origin.y;

      if (dx * dx + dy * dy <= radiusSq) {
        result.push(entry.enemy);
      }
    }

    return result;
  }

  public inBounds(origin: Vector, halfWidth: number, halfHeight: number) {
    const nearbyEntries = this.queryGrid(
      origin.x,
      origin.y,
      halfWidth,
      halfHeight,
    );
    const result: EnemyLike[] = [];

    for (let index = 0; index < nearbyEntries.length; index++) {
      const entry = nearbyEntries[index];

      if (
        Math.abs(entry.x - origin.x) <= halfWidth &&
        Math.abs(entry.y - origin.y) <= halfHeight
      ) {
        result.push(entry.enemy);
      }
    }

    return result;
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
    const candidates = this.inRadius(origin, range);
    const result: EnemyLike[] = [];

    for (let index = 0; index < candidates.length; index++) {
      const enemy = candidates[index];

      if (
        isWithinCone({
          origin,
          target: this.getCenter(enemy),
          direction,
          range,
          arcDegrees,
        })
      ) {
        result.push(enemy);
      }
    }

    return result;
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
    const nearby = this.inRadius(origin, chainRadius);
    let nearestEnemy: EnemyLike | undefined;
    let nearestDistanceSq = Infinity;

    for (let index = 0; index < nearby.length; index++) {
      const enemy = nearby[index];
      if (excluded.has(enemy)) continue;

      const center = this.getCenter(enemy);
      const dx = center.x - origin.x;
      const dy = center.y - origin.y;
      const distanceSq = dx * dx + dy * dy;

      if (distanceSq < nearestDistanceSq) {
        nearestDistanceSq = distanceSq;
        nearestEnemy = enemy;
      }
    }

    return nearestEnemy;
  }

  public shutdown() {
    this.enemies = [];
    this.entries = [];
    this.entriesByEnemy.clear();
    this.grid.clear();
  }

  private rebuildSpatialIndex() {
    this.enemies = [];
    this.entries = [];
    this.entriesByEnemy.clear();
    this.grid.clear();

    const children = this.getSafeGroupChildren();

    for (let index = 0; index < children.length; index++) {
      const enemy = children[index] as EnemyLike;
      if (!isEnemyAlive(enemy)) continue;

      const center = enemyCenter(enemy);
      const entry: EnemyEntry = {
        enemy,
        x: center.x,
        y: center.y,
      };

      this.enemies.push(enemy);
      this.entries.push(entry);
      this.entriesByEnemy.set(enemy, entry);

      const cellX = this.toCell(center.x);
      const cellY = this.toCell(center.y);
      const key = this.cellKey(cellX, cellY);
      const bucket = this.grid.get(key);

      if (bucket) {
        bucket.push(entry);
      } else {
        this.grid.set(key, [entry]);
      }
    }
  }

  private queryGrid(
    x: number,
    y: number,
    halfWidth: number,
    halfHeight: number,
  ) {
    const minCellX = this.toCell(x - halfWidth);
    const maxCellX = this.toCell(x + halfWidth);
    const minCellY = this.toCell(y - halfHeight);
    const maxCellY = this.toCell(y + halfHeight);
    const result: EnemyEntry[] = [];

    for (let cellY = minCellY; cellY <= maxCellY; cellY++) {
      for (let cellX = minCellX; cellX <= maxCellX; cellX++) {
        const bucket = this.grid.get(this.cellKey(cellX, cellY));
        if (!bucket) continue;

        for (let index = 0; index < bucket.length; index++) {
          result.push(bucket[index]);
        }
      }
    }

    return result;
  }

  private getCenter(enemy: EnemyLike) {
    return this.entriesByEnemy.get(enemy) ?? enemyCenter(enemy);
  }

  private toCell(value: number) {
    return Math.floor(value / this.gridCellSize);
  }

  private cellKey(cellX: number, cellY: number) {
    return `${cellX}:${cellY}`;
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
