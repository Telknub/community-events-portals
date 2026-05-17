import type { EnemyLike } from "../../Types";

export type Vector = { x: number; y: number };

export const FALLBACK_AIM_VECTOR: Vector = { x: 1, y: 0 };

export const normalizeVector = (vector: Vector): Vector => {
  const length = Math.hypot(vector.x, vector.y);

  if (length === 0) {
    return { ...FALLBACK_AIM_VECTOR };
  }

  return {
    x: vector.x / length,
    y: vector.y / length,
  };
};

export const vectorFromAngleDegrees = (angle: number): Vector => {
  const radians = Phaser.Math.DegToRad(angle);

  return {
    x: Math.cos(radians),
    y: Math.sin(radians),
  };
};

export const rotateVector = (vector: Vector, degrees: number): Vector => {
  const radians = Phaser.Math.DegToRad(degrees);
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);

  return normalizeVector({
    x: vector.x * cos - vector.y * sin,
    y: vector.x * sin + vector.y * cos,
  });
};

export const enemyCenter = (enemy: EnemyLike): Vector => {
  const body = enemy.body as Phaser.Physics.Arcade.Body | undefined;

  if (!body) {
    return { x: enemy.x, y: enemy.y };
  }

  return {
    x: body.center.x,
    y: body.center.y,
  };
};

export const distanceBetween = (from: Vector, to: Vector) =>
  Phaser.Math.Distance.Between(from.x, from.y, to.x, to.y);

export const isEnemyAlive = (enemy: EnemyLike) => {
  if (!enemy.active || enemy.isDead) return false;
  if (enemy.hp !== undefined && enemy.hp <= 0) return false;

  return true;
};

export const isWithinCone = ({
  origin,
  target,
  direction,
  range,
  arcDegrees,
}: {
  origin: Vector;
  target: Vector;
  direction: Vector;
  range: number;
  arcDegrees: number;
}) => {
  const distance = distanceBetween(origin, target);

  if (distance > range) return false;

  const targetDirection = normalizeVector({
    x: target.x - origin.x,
    y: target.y - origin.y,
  });

  const dot = direction.x * targetDirection.x + direction.y * targetDirection.y;
  const clampedDot = Phaser.Math.Clamp(dot, -1, 1);
  const angle = Phaser.Math.RadToDeg(Math.acos(clampedDot));

  return angle <= arcDegrees / 2;
};
