import type Phaser from "phaser";

export type ObstacleName =
  | "rock"
  | "water"
  | "tree"
  | "cloud"
  | "cloud1"
  | "tree_stump"
  | "deco_1"
  | "deco_2"
  | "deco_3"
  | "deco_4";

export type Obstacle = { name: ObstacleName; x: number; y: number };

export type WeaponId =
  | "banana"
  | "broomScythe"
  | "wateringCan"
  | "corn"
  | "tomato"
  | "sunflower"
  | "oil"
  | "pumpkin"
  | "beehive";

export type WeaponLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type PlayerStatId = "health" | "speed" | "damage";

export type PlayerStatLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export type PlayerStatLevels = Record<PlayerStatId, PlayerStatLevel>;

export type LevelUpChoice =
  | {
      type: "weapon";
      level: number;
      options: WeaponId[];
    }
  | {
      type: "stat";
      level: number;
      options: PlayerStatId[];
    };

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
  bodySizeMode?: "fixed" | "spriteBounds";
  bodySizeScale?: { width: number; height: number };
  rotateToVelocity?: boolean;
  rotationOffsetDegrees?: number;
  scale?: number;
  orientedHitbox?: boolean;
  ricochetTexture?: string;
};

export type StatusEffectId = "rooted" | "oilDot";

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
  onDeath?: () => void;
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

export type DropItemType =
  | "blueOrb"
  | "greenOrb"
  | "grayOrb"
  | "yellowOrb"
  | "purpleOrb";

export type BossTypes = "boss1" | "boss2" | "boss3";
export type MobTypes = "mob1" | "mob2" | "mob3" | "mob4" | "mob5";
export type CodexCategoryName = "Skills" | "Enemies" | "DropItems";
export type PassiveAbilityType = "wings";
export type EnemyType = MobTypes | BossTypes;

export type EnemyConfig = {
  key: string;
  scale: number;
  bodyWidth: number;
  bodyHeight: number;
  offsetX: number;
  offsetY: number;
  frameStart: number;
  frameEnd: number;
  frameRate: number;
  depth: number;
  speed: number;
  hp: number;
  maxHp: number;
  dropItem: DropItemType;
};

export type MobWaveConfig = {
  triggerAt: number;
  mobType: MobTypes;
  totalEnemy: number;
  batchSize: number;
  delay: number;
  flag: string;
};

export type BossWaveConfig = {
  triggerAt: number;
  bossType: BossTypes;
  totalEnemy: number;
  flag: string;
};
