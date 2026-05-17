import {
  CombatConfig,
  ProjectileConfig,
  StatusEffectConfig,
  WeaponConfig,
  WeaponId,
  WeaponUpgrade,
} from "../Types";

const BASE_WEAPON_STATS = {
  damage: 1,
  cooldownMs: 1000,
  projectileSpeed: 90,
  projectileCount: 1,
  spreadDegrees: 0,
  areaRadius: 18,
  orbitRadius: 22,
  orbitalCount: 1,
  durationMs: 900,
  size: 1,
  pierce: 0,
  bounceCount: 0,
  chainRadius: 90,
  arcDegrees: 70,
  range: 48,
  dotDamage: 0,
  dotTickMs: 500,
  statusDurationMs: 1200,
  homingSpeed: 90,
  hitCooldownMs: 450,
  angularSpeed: 0.003,
};

export const PROJECTILE_CONFIGS: Record<string, ProjectileConfig> = {
  waterDrop: {
    texture: "weapon_water_drop",
    behavior: "linear",
    bodySize: 8,
  },
  corn: {
    texture: "weapon_corn",
    behavior: "exploding",
    bodySize: 10,
  },
  tomato: {
    texture: "weapon_tomato",
    behavior: "bouncing",
    bodySize: 10,
  },
  light: {
    texture: "weapon_light",
    behavior: "light",
    bodySize: 8,
  },
  pumpkin: {
    texture: "weapon_pumpkin",
    behavior: "rolling",
    bodySize: 14,
  },
};

export const STATUS_EFFECTS: Record<string, StatusEffectConfig> = {
  rooted: {
    id: "rooted",
    durationMs: 1200,
    speedMultiplier: 0,
    refreshMode: "refresh",
  },
  wheatDot: {
    id: "wheatDot",
    durationMs: 2400,
    tickMs: 500,
    damagePerTick: 1,
    refreshMode: "refresh",
  },
};

export const WEAPON_CONFIGS: Record<WeaponId, WeaponConfig> = {
  hoe: {
    id: "hoe",
    texture: "weapon_hoe",
    behavior: "orbital",
    damageType: "physical",
    targeting: "inRadius",
    baseStats: {
      ...BASE_WEAPON_STATS,
      damage: 2,
      orbitRadius: 22,
      orbitalCount: 1,
      hitCooldownMs: 500,
      angularSpeed: 0.004,
    },
  },
  broomScythe: {
    id: "broomScythe",
    texture: "weapon_slash",
    behavior: "slash",
    damageType: "physical",
    targeting: "playerForward",
    baseStats: {
      ...BASE_WEAPON_STATS,
      damage: 3,
      cooldownMs: 900,
      durationMs: 180,
      arcDegrees: 80,
      range: 42,
    },
  },
  wateringCan: {
    id: "wateringCan",
    texture: "weapon_water_drop",
    behavior: "linearProjectile",
    damageType: "water",
    targeting: "movementVector",
    projectile: PROJECTILE_CONFIGS.waterDrop,
    baseStats: {
      ...BASE_WEAPON_STATS,
      damage: 2,
      cooldownMs: 650,
      projectileSpeed: 130,
      durationMs: 900,
    },
  },
  corn: {
    id: "corn",
    texture: "weapon_corn",
    behavior: "explodingProjectile",
    damageType: "explosion",
    targeting: "nearest",
    projectile: PROJECTILE_CONFIGS.corn,
    baseStats: {
      ...BASE_WEAPON_STATS,
      damage: 2,
      cooldownMs: 1200,
      projectileSpeed: 95,
      areaRadius: 24,
      durationMs: 1400,
    },
  },
  tomato: {
    id: "tomato",
    texture: "weapon_tomato",
    behavior: "chainProjectile",
    damageType: "physical",
    targeting: "random",
    projectile: PROJECTILE_CONFIGS.tomato,
    baseStats: {
      ...BASE_WEAPON_STATS,
      damage: 2,
      cooldownMs: 1000,
      projectileSpeed: 115,
      projectileCount: 1,
      bounceCount: 2,
      chainRadius: 90,
      durationMs: 1600,
    },
  },
  sunflower: {
    id: "sunflower",
    texture: "weapon_sunflower",
    behavior: "orbitalShooter",
    damageType: "light",
    targeting: "nearest",
    projectile: PROJECTILE_CONFIGS.light,
    baseStats: {
      ...BASE_WEAPON_STATS,
      damage: 2,
      cooldownMs: 850,
      projectileSpeed: 125,
      orbitRadius: 30,
      orbitalCount: 1,
      durationMs: 900,
      angularSpeed: 0.0025,
    },
  },
  wheat: {
    id: "wheat",
    texture: "weapon_wheat",
    behavior: "snareArea",
    damageType: "dot",
    targeting: "nearest",
    statusEffects: [STATUS_EFFECTS.rooted, STATUS_EFFECTS.wheatDot],
    baseStats: {
      ...BASE_WEAPON_STATS,
      damage: 1,
      cooldownMs: 1600,
      areaRadius: 28,
      durationMs: 1600,
      dotDamage: 1,
      dotTickMs: 500,
      statusDurationMs: 1200,
      hitCooldownMs: 500,
    },
  },
  pumpkin: {
    id: "pumpkin",
    texture: "weapon_pumpkin",
    behavior: "rollingProjectile",
    damageType: "physical",
    targeting: "movementVector",
    projectile: PROJECTILE_CONFIGS.pumpkin,
    baseStats: {
      ...BASE_WEAPON_STATS,
      damage: 4,
      cooldownMs: 1400,
      projectileSpeed: 85,
      durationMs: 1800,
      pierce: 8,
      size: 1.15,
    },
  },
  beehive: {
    id: "beehive",
    texture: "weapon_bee",
    behavior: "homingSummon",
    damageType: "summon",
    targeting: "nearest",
    baseStats: {
      ...BASE_WEAPON_STATS,
      damage: 2,
      cooldownMs: 1500,
      projectileCount: 2,
      homingSpeed: 95,
      durationMs: 2200,
      hitCooldownMs: 350,
    },
  },
};

export const WEAPON_UPGRADES: Record<WeaponId, WeaponUpgrade[]> = {
  hoe: [
    {
      level: 2,
      modifiers: [{ stat: "orbitRadius", operation: "add", value: 6 }],
    },
    { level: 3, modifiers: [{ stat: "damage", operation: "add", value: 1 }] },
    {
      level: 4,
      modifiers: [{ stat: "orbitalCount", operation: "add", value: 1 }],
    },
    {
      level: 5,
      modifiers: [{ stat: "orbitRadius", operation: "add", value: 8 }],
    },
    { level: 6, modifiers: [{ stat: "damage", operation: "add", value: 2 }] },
    {
      level: 7,
      modifiers: [{ stat: "orbitalCount", operation: "add", value: 1 }],
    },
    {
      level: 8,
      modifiers: [{ stat: "angularSpeed", operation: "multiply", value: 1.25 }],
    },
  ],
  broomScythe: [
    {
      level: 2,
      modifiers: [{ stat: "arcDegrees", operation: "add", value: 20 }],
    },
    { level: 3, modifiers: [{ stat: "damage", operation: "add", value: 1 }] },
    {
      level: 4,
      modifiers: [{ stat: "cooldownMs", operation: "multiply", value: 0.85 }],
    },
    { level: 5, modifiers: [{ stat: "range", operation: "add", value: 10 }] },
    { level: 6, modifiers: [{ stat: "damage", operation: "add", value: 2 }] },
    {
      level: 7,
      modifiers: [{ stat: "cooldownMs", operation: "multiply", value: 0.8 }],
    },
    {
      level: 8,
      modifiers: [{ stat: "projectileCount", operation: "set", value: 2 }],
    },
  ],
  wateringCan: [
    {
      level: 2,
      modifiers: [{ stat: "cooldownMs", operation: "multiply", value: 0.9 }],
    },
    { level: 3, modifiers: [{ stat: "damage", operation: "add", value: 1 }] },
    {
      level: 4,
      modifiers: [{ stat: "projectileCount", operation: "add", value: 1 }],
    },
    {
      level: 5,
      modifiers: [{ stat: "spreadDegrees", operation: "set", value: 15 }],
    },
    {
      level: 6,
      modifiers: [{ stat: "cooldownMs", operation: "multiply", value: 0.85 }],
    },
    { level: 7, modifiers: [{ stat: "damage", operation: "add", value: 2 }] },
    {
      level: 8,
      modifiers: [{ stat: "projectileCount", operation: "add", value: 1 }],
    },
  ],
  corn: [
    {
      level: 2,
      modifiers: [{ stat: "areaRadius", operation: "add", value: 6 }],
    },
    {
      level: 3,
      modifiers: [{ stat: "cooldownMs", operation: "multiply", value: 0.9 }],
    },
    { level: 4, modifiers: [{ stat: "damage", operation: "add", value: 1 }] },
    {
      level: 5,
      modifiers: [{ stat: "areaRadius", operation: "add", value: 8 }],
    },
    {
      level: 6,
      modifiers: [{ stat: "cooldownMs", operation: "multiply", value: 0.85 }],
    },
    { level: 7, modifiers: [{ stat: "damage", operation: "add", value: 2 }] },
    {
      level: 8,
      modifiers: [{ stat: "areaRadius", operation: "multiply", value: 1.25 }],
    },
  ],
  tomato: [
    {
      level: 2,
      modifiers: [{ stat: "cooldownMs", operation: "multiply", value: 0.9 }],
    },
    { level: 3, modifiers: [{ stat: "damage", operation: "add", value: 1 }] },
    {
      level: 4,
      modifiers: [{ stat: "projectileCount", operation: "add", value: 1 }],
    },
    {
      level: 5,
      modifiers: [{ stat: "bounceCount", operation: "add", value: 1 }],
    },
    {
      level: 6,
      modifiers: [{ stat: "chainRadius", operation: "add", value: 30 }],
    },
    { level: 7, modifiers: [{ stat: "damage", operation: "add", value: 2 }] },
    {
      level: 8,
      modifiers: [{ stat: "bounceCount", operation: "add", value: 2 }],
    },
  ],
  sunflower: [
    {
      level: 2,
      modifiers: [{ stat: "orbitRadius", operation: "add", value: 6 }],
    },
    { level: 3, modifiers: [{ stat: "damage", operation: "add", value: 1 }] },
    {
      level: 4,
      modifiers: [{ stat: "cooldownMs", operation: "multiply", value: 0.85 }],
    },
    {
      level: 5,
      modifiers: [{ stat: "orbitalCount", operation: "add", value: 1 }],
    },
    {
      level: 6,
      modifiers: [{ stat: "durationMs", operation: "add", value: 350 }],
    },
    { level: 7, modifiers: [{ stat: "damage", operation: "add", value: 2 }] },
    {
      level: 8,
      modifiers: [{ stat: "cooldownMs", operation: "multiply", value: 0.8 }],
    },
  ],
  wheat: [
    {
      level: 2,
      modifiers: [{ stat: "areaRadius", operation: "add", value: 6 }],
    },
    {
      level: 3,
      modifiers: [{ stat: "dotDamage", operation: "add", value: 1 }],
    },
    {
      level: 4,
      modifiers: [{ stat: "durationMs", operation: "add", value: 400 }],
    },
    {
      level: 5,
      modifiers: [{ stat: "cooldownMs", operation: "multiply", value: 0.85 }],
    },
    {
      level: 6,
      modifiers: [{ stat: "areaRadius", operation: "add", value: 8 }],
    },
    {
      level: 7,
      modifiers: [{ stat: "dotDamage", operation: "add", value: 1 }],
    },
    {
      level: 8,
      modifiers: [{ stat: "statusDurationMs", operation: "add", value: 800 }],
    },
  ],
  pumpkin: [
    { level: 2, modifiers: [{ stat: "size", operation: "add", value: 0.15 }] },
    { level: 3, modifiers: [{ stat: "damage", operation: "add", value: 1 }] },
    {
      level: 4,
      modifiers: [{ stat: "cooldownMs", operation: "multiply", value: 0.9 }],
    },
    { level: 5, modifiers: [{ stat: "pierce", operation: "add", value: 4 }] },
    { level: 6, modifiers: [{ stat: "size", operation: "add", value: 0.2 }] },
    { level: 7, modifiers: [{ stat: "damage", operation: "add", value: 2 }] },
    {
      level: 8,
      modifiers: [{ stat: "cooldownMs", operation: "multiply", value: 0.8 }],
    },
  ],
  beehive: [
    {
      level: 2,
      modifiers: [{ stat: "projectileCount", operation: "add", value: 1 }],
    },
    {
      level: 3,
      modifiers: [{ stat: "homingSpeed", operation: "add", value: 20 }],
    },
    { level: 4, modifiers: [{ stat: "damage", operation: "add", value: 1 }] },
    {
      level: 5,
      modifiers: [{ stat: "durationMs", operation: "add", value: 500 }],
    },
    {
      level: 6,
      modifiers: [{ stat: "projectileCount", operation: "add", value: 1 }],
    },
    {
      level: 7,
      modifiers: [{ stat: "homingSpeed", operation: "add", value: 25 }],
    },
    { level: 8, modifiers: [{ stat: "damage", operation: "add", value: 2 }] },
  ],
};

export const COMBAT_CONFIG: CombatConfig = {
  projectilePoolSize: 80,
  hitboxPoolSize: 32,
  orbitalPoolSize: 24,
  beePoolSize: 32,
  targetScanMs: 150,
  defaultEnemyScore: 1,
  defaultWeaponLoadout: [{ id: "hoe", level: 1 }],
};
