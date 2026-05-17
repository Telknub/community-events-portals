import type Phaser from "phaser";

export type ObstacleName =
  | "rock"
  | "water"
  | "tree"
  | "cloud"
  | "cloud1"
  | "tree_stump";

export type Obstacle = { name: ObstacleName; x: number; y: number };

export type WeaponId =
  | "hoe"
  | "broomScythe"
  | "wateringCan"
  | "corn"
  | "tomato"
  | "sunflower"
  | "wheat"
  | "pumpkin"
  | "beehive";

export type WeaponLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type DamageType =
  | "physical"
  | "water"
  | "explosion"
  | "light"
  | "dot"
  | "summon";

export type TargetingMode =
  | "nearest"
  | "random"
  | "movementVector"
  | "playerForward"
  | "chainNext"
  | "inCone"
  | "inRadius";

export type WeaponBehavior =
  | "orbital"
  | "slash"
  | "linearProjectile"
  | "explodingProjectile"
  | "chainProjectile"
  | "orbitalShooter"
  | "snareArea"
  | "rollingProjectile"
  | "homingSummon";

export type WeaponStatKey = keyof WeaponRuntimeStats;

export type UpgradeOperation = "add" | "multiply" | "set";

export type WeaponRuntimeStats = {
  damage: number;
  cooldownMs: number;
  projectileSpeed: number;
  projectileCount: number;
  spreadDegrees: number;
  areaRadius: number;
  orbitRadius: number;
  orbitalCount: number;
  durationMs: number;
  size: number;
  pierce: number;
  bounceCount: number;
  chainRadius: number;
  arcDegrees: number;
  range: number;
  dotDamage: number;
  dotTickMs: number;
  statusDurationMs: number;
  homingSpeed: number;
  hitCooldownMs: number;
  angularSpeed: number;
};

export type WeaponConfig = {
  id: WeaponId;
  texture: string;
  behavior: WeaponBehavior;
  damageType: DamageType;
  targeting: TargetingMode;
  baseStats: WeaponRuntimeStats;
  projectile?: ProjectileConfig;
  statusEffects?: StatusEffectConfig[];
};

export type WeaponUpgrade = {
  level: WeaponLevel;
  modifiers: {
    stat: WeaponStatKey;
    operation: UpgradeOperation;
    value: number;
  }[];
};

export type ProjectileBehavior =
  | "linear"
  | "exploding"
  | "bouncing"
  | "light"
  | "rolling";

export type ProjectileConfig = {
  texture: string;
  behavior: ProjectileBehavior;
  bodySize: number;
};

export type StatusEffectId = "rooted" | "wheatDot";

export type StatusEffectConfig = {
  id: StatusEffectId;
  durationMs: number;
  tickMs?: number;
  damagePerTick?: number;
  speedMultiplier?: number;
  refreshMode: "refresh" | "stack";
};

export type EnemyLike = Phaser.GameObjects.GameObject & {
  x: number;
  y: number;
  active: boolean;
  body?: Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody;
  hp?: number;
  maxHp?: number;
  isDead?: boolean;
  statusEffects?: Partial<Record<StatusEffectId, number>>;
  takeDamage?: (damage: number, payload: DamagePayload) => void;
  setMovementMultiplier?: (multiplier: number) => void;
};

export type DamagePayload = {
  sourceWeaponId: WeaponId;
  amount: number;
  damageType: DamageType;
  knockback?: number;
  statusEffects?: StatusEffectConfig[];
};

export type WeaponLoadoutItem = {
  id: WeaponId;
  level: WeaponLevel;
};

export type CombatConfig = {
  projectilePoolSize: number;
  hitboxPoolSize: number;
  orbitalPoolSize: number;
  beePoolSize: number;
  targetScanMs: number;
  defaultEnemyScore: number;
  defaultWeaponLoadout: WeaponLoadoutItem[];
};
