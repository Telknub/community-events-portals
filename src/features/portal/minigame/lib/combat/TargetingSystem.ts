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
  private readonly enemies: EnemyLike[] = [];
  private readonly entries: EnemyEntry[] = [];
  private readonly entriesByEnemy = new Map<EnemyLike, EnemyEntry>();
  private readonly grid = new Map<number, EnemyEntry[]>();

  private readonly entryPool: EnemyEntry[] = [];
  private readonly bucketPool: EnemyEntry[][] = [];
  private readonly queryEntriesBuffer: EnemyEntry[] = [];
  private readonly radiusResult: EnemyLike[] = [];
  private readonly boundsResult: EnemyLike[] = [];
  private readonly coneResult: EnemyLike[] = [];

  private minCellX = 0;
  private maxCellX = -1;
  private minCellY = 0;
  private maxCellY = -1;
  private nearestScratchEnemy: EnemyLike | undefined;
  private nearestScratchDistanceSq = Infinity;
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
    if (candidates) {
      return this.nearestFromCandidates(origin, candidates);
    }

    if (this.entries.length === 0) return undefined;

    const originCellX = this.toCell(origin.x);
    const originCellY = this.toCell(origin.y);
    const maxRing = Math.max(
      Math.abs(originCellX - this.minCellX),
      Math.abs(originCellX - this.maxCellX),
      Math.abs(originCellY - this.minCellY),
      Math.abs(originCellY - this.maxCellY),
    );

    this.nearestScratchEnemy = undefined;
    this.nearestScratchDistanceSq = Infinity;

    for (let ring = 0; ring <= maxRing; ring++) {
      if (ring === 0) {
        this.scanCellForNearest(origin, originCellX, originCellY);
      } else {
        const minX = originCellX - ring;
        const maxX = originCellX + ring;
        const minY = originCellY - ring;
        const maxY = originCellY + ring;

        for (let cellX = minX; cellX <= maxX; cellX++) {
          this.scanCellForNearest(origin, cellX, minY);
          this.scanCellForNearest(origin, cellX, maxY);
        }

        for (let cellY = minY + 1; cellY < maxY; cellY++) {
          this.scanCellForNearest(origin, minX, cellY);
          this.scanCellForNearest(origin, maxX, cellY);
        }
      }

      if (!this.nearestScratchEnemy) continue;

      const left = (originCellX - ring) * this.gridCellSize;
      const right = (originCellX + ring + 1) * this.gridCellSize;
      const top = (originCellY - ring) * this.gridCellSize;
      const bottom = (originCellY + ring + 1) * this.gridCellSize;
      const distanceToOutside = Math.min(
        origin.x - left,
        right - origin.x,
        origin.y - top,
        bottom - origin.y,
      );

      if (
        this.nearestScratchDistanceSq <=
        distanceToOutside * distanceToOutside
      ) {
        break;
      }
    }

    return this.nearestScratchEnemy;
  }

  public random(candidates = this.enemies) {
    if (candidates.length === 0) return undefined;

    return candidates[Phaser.Math.Between(0, candidates.length - 1)];
  }

  public inRadius(origin: Vector, radius: number) {
    const radiusSq = radius * radius;
    const nearbyEntries = this.queryGridInto(
      origin.x,
      origin.y,
      radius,
      radius,
      this.queryEntriesBuffer,
    );
    const result = this.radiusResult;
    result.length = 0;

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
    const nearbyEntries = this.queryGridInto(
      origin.x,
      origin.y,
      halfWidth,
      halfHeight,
      this.queryEntriesBuffer,
    );
    const result = this.boundsResult;
    result.length = 0;

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
    const result = this.coneResult;
    result.length = 0;

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
    const nearbyEntries = this.queryGridInto(
      origin.x,
      origin.y,
      chainRadius,
      chainRadius,
      this.queryEntriesBuffer,
    );
    const chainRadiusSq = chainRadius * chainRadius;
    let nearestEnemy: EnemyLike | undefined;
    let nearestDistanceSq = Infinity;

    for (let index = 0; index < nearbyEntries.length; index++) {
      const entry = nearbyEntries[index];
      const enemy = entry.enemy;
      if (excluded.has(enemy)) continue;

      const dx = entry.x - origin.x;
      const dy = entry.y - origin.y;
      const distanceSq = dx * dx + dy * dy;

      if (distanceSq <= chainRadiusSq && distanceSq < nearestDistanceSq) {
        nearestDistanceSq = distanceSq;
        nearestEnemy = enemy;
      }
    }

    return nearestEnemy;
  }

  public shutdown() {
    this.recycleIndexStorage();
    this.enemies.length = 0;
    this.entriesByEnemy.clear();
    this.queryEntriesBuffer.length = 0;
    this.radiusResult.length = 0;
    this.boundsResult.length = 0;
    this.coneResult.length = 0;
  }

  private nearestFromCandidates(origin: Vector, candidates: EnemyLike[]) {
    let nearestEnemy: EnemyLike | undefined;
    let nearestDistanceSq = Infinity;

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

  private scanCellForNearest(origin: Vector, cellX: number, cellY: number) {
    const bucket = this.grid.get(this.cellKey(cellX, cellY));
    if (!bucket) return;

    for (let index = 0; index < bucket.length; index++) {
      const entry = bucket[index];
      const dx = entry.x - origin.x;
      const dy = entry.y - origin.y;
      const distanceSq = dx * dx + dy * dy;

      if (distanceSq < this.nearestScratchDistanceSq) {
        this.nearestScratchDistanceSq = distanceSq;
        this.nearestScratchEnemy = entry.enemy;
      }
    }
  }

  private rebuildSpatialIndex() {
    this.recycleIndexStorage();
    this.enemies.length = 0;
    this.entriesByEnemy.clear();

    this.minCellX = Infinity;
    this.maxCellX = -Infinity;
    this.minCellY = Infinity;
    this.maxCellY = -Infinity;

    const children = this.getSafeGroupChildren();

    for (let index = 0; index < children.length; index++) {
      const enemy = children[index] as EnemyLike;
      if (!isEnemyAlive(enemy)) continue;

      const center = enemyCenter(enemy);
      const entry = this.entryPool.pop() ?? ({} as EnemyEntry);
      entry.enemy = enemy;
      entry.x = center.x;
      entry.y = center.y;

      this.enemies.push(enemy);
      this.entries.push(entry);
      this.entriesByEnemy.set(enemy, entry);

      const cellX = this.toCell(center.x);
      const cellY = this.toCell(center.y);
      this.minCellX = Math.min(this.minCellX, cellX);
      this.maxCellX = Math.max(this.maxCellX, cellX);
      this.minCellY = Math.min(this.minCellY, cellY);
      this.maxCellY = Math.max(this.maxCellY, cellY);

      const key = this.cellKey(cellX, cellY);
      let bucket = this.grid.get(key);

      if (!bucket) {
        bucket = this.bucketPool.pop() ?? [];
        bucket.length = 0;
        this.grid.set(key, bucket);
      }

      bucket.push(entry);
    }

    if (this.entries.length === 0) {
      this.minCellX = 0;
      this.maxCellX = -1;
      this.minCellY = 0;
      this.maxCellY = -1;
    }
  }

  private recycleIndexStorage() {
    for (let index = 0; index < this.entries.length; index++) {
      this.entryPool.push(this.entries[index]);
    }
    this.entries.length = 0;

    for (const bucket of this.grid.values()) {
      bucket.length = 0;
      this.bucketPool.push(bucket);
    }
    this.grid.clear();
  }

  private queryGridInto(
    x: number,
    y: number,
    halfWidth: number,
    halfHeight: number,
    result: EnemyEntry[],
  ) {
    result.length = 0;

    const minCellX = this.toCell(x - halfWidth);
    const maxCellX = this.toCell(x + halfWidth);
    const minCellY = this.toCell(y - halfHeight);
    const maxCellY = this.toCell(y + halfHeight);

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
    const x = cellX >= 0 ? cellX * 2 : -cellX * 2 - 1;
    const y = cellY >= 0 ? cellY * 2 : -cellY * 2 - 1;
    const sum = x + y;

    return (sum * (sum + 1)) / 2 + y;
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
