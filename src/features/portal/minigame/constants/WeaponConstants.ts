import {
  CombatConfig,
  ProjectileConfig,
  StatusEffectConfig,
  WeaponConfig,
  WeaponId,
  WeaponLevel,
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

export const WEAPON_UPGRADE_XP_COSTS: Record<WeaponLevel, number | null> = {
  0: null,
  1: 20,
  2: 20,
  3: 50,
  4: 90,
  5: 140,
  6: 200,
  7: 270,
  8: 350,
};

export const PROJECTILE_CONFIGS: Record<string, ProjectileConfig> = {
  waterDrop: {
    texture: "weapon_watering_can_projectile",
    behavior: "linear",
    bodySize: 8,
    rotateToVelocity: true,
  },
  corn: {
    texture: "weapon_corn_projectile",
    behavior: "exploding",
    bodySize: 10,
    rotateToVelocity: true,
    rotationOffsetDegrees: -90,
    scale: 0.7,
    orientedHitbox: true,
  },
  tomato: {
    texture: "weapon_tomato_projectile",
    ricochetTexture: "weapon_tomato_ricochet",
    behavior: "bouncing",
    bodySize: 10,
    rotateToVelocity: true,
    rotationOffsetDegrees: -45,
    orientedHitbox: true,
  },
  light: {
    texture: "weapon_sunflower_projectile",
    behavior: "light",
    bodySize: 6,
    rotateToVelocity: true,
    rotationOffsetDegrees: 90,
  },
  pumpkin: {
    texture: "weapon_horizontal_pumpkin",
    behavior: "rolling",
    bodySize: 14,
    bodySizeMode: "spriteBounds",
    bodySizeScale: { width: 1, height: 2 / 3 },
  },
};

export const STATUS_EFFECTS: Record<string, StatusEffectConfig> = {
  rooted: {
    id: "rooted",
    durationMs: 1200,
    speedMultiplier: 0,
    refreshMode: "refresh",
  },
  oilDot: {
    id: "oilDot",
    durationMs: 2400,
    tickMs: 500,
    damagePerTick: 1,
    refreshMode: "refresh",
  },
};

export const WEAPON_CONFIGS: Record<WeaponId, WeaponConfig> = {
  banana: {
    id: "banana",
    texture: "weapon_banana",
    behavior: "orbital",
    damageType: "physical",
    targeting: "inRadius",
    baseStats: {
      ...BASE_WEAPON_STATS,
      damage: 4,
      orbitRadius: 30,
      orbitalCount: 1,
      hitCooldownMs: 400,
      angularSpeed: 0.004,
    },
  },
  broomScythe: {
    id: "broomScythe",
    texture: "weapon_scythe",
    behavior: "slash",
    damageType: "physical",
    targeting: "playerForward",
    baseStats: {
      ...BASE_WEAPON_STATS,
      damage: 6,
      cooldownMs: 1300,
      durationMs: 320,
      arcDegrees: 60,
      range: 40,
    },
  },
  wateringCan: {
    id: "wateringCan",
    texture: "weapon_watering_can_projectile",
    behavior: "linearProjectile",
    damageType: "water",
    targeting: "movementVector",
    projectile: PROJECTILE_CONFIGS.waterDrop,
    baseStats: {
      ...BASE_WEAPON_STATS,
      damage: 5,
      cooldownMs: 650,
      projectileSpeed: 250,
      durationMs: 900,
    },
  },
  corn: {
    id: "corn",
    texture: "weapon_corn_projectile",
    behavior: "explodingProjectile",
    damageType: "explosion",
    targeting: "nearest",
    projectile: PROJECTILE_CONFIGS.corn,
    baseStats: {
      ...BASE_WEAPON_STATS,
      damage: 3,
      cooldownMs: 1200,
      projectileSpeed: 95,
      areaRadius: 25,
      durationMs: 1400,
    },
  },
  tomato: {
    id: "tomato",
    texture: "weapon_tomato_projectile",
    behavior: "chainProjectile",
    damageType: "physical",
    targeting: "random",
    projectile: PROJECTILE_CONFIGS.tomato,
    baseStats: {
      ...BASE_WEAPON_STATS,
      damage: 3,
      cooldownMs: 1100,
      projectileSpeed: 120,
      projectileCount: 1,
      bounceCount: 4,
      chainRadius: 120,
      durationMs: 2000,
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
      damage: 4,
      cooldownMs: 750,
      projectileSpeed: 130,
      orbitRadius: 40,
      orbitalCount: 1,
      durationMs: 900,
      angularSpeed: 0.003,
    },
  },
  oil: {
    id: "oil",
    texture: "weapon_oil",
    behavior: "snareArea",
    damageType: "dot",
    targeting: "nearest",
    statusEffects: [STATUS_EFFECTS.rooted, STATUS_EFFECTS.oilDot],
    baseStats: {
      ...BASE_WEAPON_STATS,
      damage: 1,
      cooldownMs: 1600,
      areaRadius: 30,
      durationMs: 2000,
      dotDamage: 2,
      dotTickMs: 500,
      statusDurationMs: 1200,
      hitCooldownMs: 500,
    },
  },
  pumpkin: {
    id: "pumpkin",
    texture: "weapon_horizontal_pumpkin",
    behavior: "rollingProjectile",
    damageType: "physical",
    targeting: "movementVector",
    projectile: PROJECTILE_CONFIGS.pumpkin,
    baseStats: {
      ...BASE_WEAPON_STATS,
      damage: 4,
      cooldownMs: 1500,
      projectileSpeed: 85,
      durationMs: 1800,
      pierce: 5,
      size: 1.0,
    },
  },
  beehive: {
    id: "beehive",
    texture: "weapon_bees",
    behavior: "homingSummon",
    damageType: "summon",
    targeting: "nearest",
    baseStats: {
      ...BASE_WEAPON_STATS,
      damage: 3,
      cooldownMs: 1100,
      projectileCount: 2,
      homingSpeed: 110,
      durationMs: 2200,
      hitCooldownMs: 300,
    },
  },
};

export const WEAPON_UPGRADES: Record<WeaponId, WeaponUpgrade[]> = {
  banana: [
    {
      level: 2,
      modifiers: [
        { stat: "angularSpeed", operation: "multiply", value: 1.1 },
        { stat: "damage", operation: "add", value: 1 },
      ],
    },
    {
      level: 3,
      modifiers: [
        { stat: "orbitRadius", operation: "add", value: 5 },
        { stat: "hitCooldownMs", operation: "multiply", value: 0.9 },
      ],
    },
    {
      level: 4,
      modifiers: [
        { stat: "orbitalCount", operation: "add", value: 1 },
        { stat: "damage", operation: "add", value: 2 },
      ],
    },
    {
      level: 5,
      modifiers: [
        { stat: "angularSpeed", operation: "multiply", value: 1.15 },
        { stat: "damage", operation: "add", value: 2 },
      ],
    },
    {
      level: 6,
      modifiers: [
        { stat: "orbitRadius", operation: "add", value: 8 },
        { stat: "damage", operation: "add", value: 2 },
      ],
    },
    {
      level: 7,
      modifiers: [
        { stat: "orbitalCount", operation: "add", value: 1 },
        { stat: "hitCooldownMs", operation: "multiply", value: 0.8 },
      ],
    },
    {
      level: 8,
      modifiers: [
        { stat: "orbitalCount", operation: "add", value: 1 },
        { stat: "angularSpeed", operation: "multiply", value: 1.2 },
        { stat: "damage", operation: "add", value: 4 },
      ],
    },
  ],
  broomScythe: [
    {
      level: 2,
      modifiers: [
        { stat: "arcDegrees", operation: "add", value: 30 },
        { stat: "damage", operation: "add", value: 2 },
      ],
    },
    {
      level: 3,
      modifiers: [
        { stat: "range", operation: "add", value: 5 },
        { stat: "cooldownMs", operation: "multiply", value: 0.9 },
      ],
    },
    {
      level: 4,
      modifiers: [
        { stat: "arcDegrees", operation: "add", value: 40 },
        { stat: "damage", operation: "add", value: 3 },
      ],
    },
    {
      level: 5,
      modifiers: [
        { stat: "durationMs", operation: "add", value: 80 },
        { stat: "cooldownMs", operation: "multiply", value: 0.85 },
      ],
    },
    {
      level: 6,
      modifiers: [
        { stat: "arcDegrees", operation: "set", value: 360 },
        { stat: "damage", operation: "add", value: 4 },
      ],
    },
    {
      level: 7,
      modifiers: [
        { stat: "range", operation: "add", value: 10 },
        { stat: "cooldownMs", operation: "multiply", value: 0.8 },
      ],
    },
    {
      level: 8,
      modifiers: [
        { stat: "projectileCount", operation: "set", value: 2 },
        { stat: "damage", operation: "add", value: 6 },
        { stat: "range", operation: "add", value: 10 },
      ],
    },
  ],
  wateringCan: [
    {
      level: 2,
      modifiers: [
        { stat: "cooldownMs", operation: "multiply", value: 0.85 },
        { stat: "projectileSpeed", operation: "add", value: 20 },
      ],
    },
    {
      level: 3,
      modifiers: [
        { stat: "damage", operation: "add", value: 2 },
        { stat: "pierce", operation: "add", value: 1 },
      ],
    },
    {
      level: 4,
      modifiers: [
        { stat: "projectileCount", operation: "add", value: 1 },
        { stat: "cooldownMs", operation: "multiply", value: 0.9 },
      ],
    },
    {
      level: 5,
      modifiers: [
        { stat: "damage", operation: "add", value: 3 },
        { stat: "projectileSpeed", operation: "add", value: 30 },
      ],
    },
    {
      level: 6,
      modifiers: [
        { stat: "projectileCount", operation: "add", value: 1 },
        { stat: "damage", operation: "add", value: 3 },
      ],
    },
    {
      level: 7,
      modifiers: [
        { stat: "pierce", operation: "add", value: 2 },
        { stat: "cooldownMs", operation: "multiply", value: 0.8 },
      ],
    },
    {
      level: 8,
      modifiers: [
        { stat: "projectileCount", operation: "add", value: 2 },
        { stat: "damage", operation: "add", value: 5 },
        { stat: "pierce", operation: "add", value: 3 },
      ],
    },
  ],
  corn: [
    {
      level: 2,
      modifiers: [
        { stat: "areaRadius", operation: "add", value: 2 },
        { stat: "damage", operation: "add", value: 2 },
      ],
    },
    {
      level: 3,
      modifiers: [
        { stat: "durationMs", operation: "add", value: 200 },
        { stat: "cooldownMs", operation: "multiply", value: 0.9 },
      ],
    },
    {
      level: 4,
      modifiers: [
        { stat: "areaRadius", operation: "add", value: 3 },
        { stat: "damage", operation: "add", value: 3 },
      ],
    },
    {
      level: 5,
      modifiers: [
        { stat: "damage", operation: "add", value: 4 },
        { stat: "durationMs", operation: "add", value: 300 },
      ],
    },
    {
      level: 6,
      modifiers: [
        { stat: "areaRadius", operation: "add", value: 4 },
        { stat: "damage", operation: "add", value: 5 },
      ],
    },
    {
      level: 7,
      modifiers: [
        { stat: "cooldownMs", operation: "multiply", value: 0.8 },
        { stat: "projectileSpeed", operation: "add", value: 25 },
      ],
    },
    {
      level: 8,
      modifiers: [
        { stat: "projectileCount", operation: "add", value: 1 },
        { stat: "areaRadius", operation: "add", value: 5 },
        { stat: "damage", operation: "add", value: 8 },
      ],
    },
  ],
  tomato: [
    {
      level: 2,
      modifiers: [
        { stat: "bounceCount", operation: "add", value: 1 },
        { stat: "damage", operation: "add", value: 2 },
      ],
    },
    {
      level: 3,
      modifiers: [
        { stat: "cooldownMs", operation: "multiply", value: 0.85 },
        { stat: "projectileSpeed", operation: "add", value: 20 },
      ],
    },
    {
      level: 4,
      modifiers: [
        { stat: "projectileCount", operation: "add", value: 1 },
        { stat: "damage", operation: "add", value: 2 },
      ],
    },
    {
      level: 5,
      modifiers: [
        { stat: "bounceCount", operation: "add", value: 2 },
        { stat: "chainRadius", operation: "add", value: 30 },
      ],
    },
    {
      level: 6,
      modifiers: [
        { stat: "projectileCount", operation: "add", value: 1 },
        { stat: "damage", operation: "add", value: 3 },
      ],
    },
    {
      level: 7,
      modifiers: [
        { stat: "damage", operation: "add", value: 4 },
        { stat: "cooldownMs", operation: "multiply", value: 0.8 },
      ],
    },
    {
      level: 8,
      modifiers: [
        { stat: "bounceCount", operation: "add", value: 4 },
        { stat: "projectileCount", operation: "add", value: 2 },
        { stat: "damage", operation: "add", value: 6 },
      ],
    },
  ],
  sunflower: [
    {
      level: 2,
      modifiers: [
        { stat: "orbitRadius", operation: "add", value: 10 },
        { stat: "damage", operation: "add", value: 2 },
      ],
    },
    {
      level: 3,
      modifiers: [
        { stat: "cooldownMs", operation: "multiply", value: 0.85 },
        { stat: "projectileSpeed", operation: "add", value: 25 },
      ],
    },
    {
      level: 4,
      modifiers: [
        { stat: "orbitalCount", operation: "add", value: 1 },
        { stat: "damage", operation: "add", value: 3 },
      ],
    },
    {
      level: 5,
      modifiers: [
        { stat: "damage", operation: "add", value: 4 },
        { stat: "cooldownMs", operation: "multiply", value: 0.8 },
      ],
    },
    {
      level: 6,
      modifiers: [
        { stat: "orbitalCount", operation: "add", value: 1 },
        { stat: "durationMs", operation: "add", value: 200 },
      ],
    },
    {
      level: 7,
      modifiers: [
        { stat: "damage", operation: "add", value: 6 },
        { stat: "orbitRadius", operation: "add", value: 15 },
      ],
    },
    {
      level: 8,
      modifiers: [
        { stat: "orbitalCount", operation: "add", value: 2 },
        { stat: "cooldownMs", operation: "multiply", value: 0.7 },
        { stat: "damage", operation: "add", value: 8 },
      ],
    },
  ],
  oil: [
    {
      level: 2,
      modifiers: [
        { stat: "areaRadius", operation: "add", value: 6 },
        { stat: "dotDamage", operation: "add", value: 1 },
      ],
    },
    {
      level: 3,
      modifiers: [
        { stat: "durationMs", operation: "add", value: 400 },
        { stat: "dotTickMs", operation: "multiply", value: 0.85 },
      ],
    },
    {
      level: 4,
      modifiers: [
        { stat: "areaRadius", operation: "add", value: 8 },
        { stat: "dotDamage", operation: "add", value: 2 },
      ],
    },
    {
      level: 5,
      modifiers: [
        { stat: "cooldownMs", operation: "multiply", value: 0.85 },
        { stat: "statusDurationMs", operation: "add", value: 400 },
      ],
    },
    {
      level: 6,
      modifiers: [
        { stat: "areaRadius", operation: "add", value: 10 },
        { stat: "dotDamage", operation: "add", value: 3 },
      ],
    },
    {
      level: 7,
      modifiers: [
        { stat: "dotTickMs", operation: "multiply", value: 0.75 },
        { stat: "damage", operation: "add", value: 2 },
      ],
    },
    {
      level: 8,
      modifiers: [
        { stat: "areaRadius", operation: "add", value: 15 },
        { stat: "dotDamage", operation: "add", value: 5 },
        { stat: "durationMs", operation: "add", value: 600 },
      ],
    },
  ],
  pumpkin: [
    {
      level: 2,
      modifiers: [
        { stat: "size", operation: "add", value: 0.2 },
        { stat: "damage", operation: "add", value: 2 },
      ],
    },
    {
      level: 3,
      modifiers: [
        { stat: "pierce", operation: "add", value: 4 },
        { stat: "cooldownMs", operation: "multiply", value: 0.9 },
      ],
    },
    {
      level: 4,
      modifiers: [
        { stat: "size", operation: "add", value: 0.25 },
        { stat: "damage", operation: "add", value: 3 },
      ],
    },
    {
      level: 5,
      modifiers: [
        { stat: "projectileSpeed", operation: "add", value: 20 },
        { stat: "durationMs", operation: "add", value: 300 },
      ],
    },
    {
      level: 6,
      modifiers: [
        { stat: "damage", operation: "add", value: 4 },
        { stat: "pierce", operation: "add", value: 4 },
      ],
    },
    {
      level: 7,
      modifiers: [
        { stat: "cooldownMs", operation: "multiply", value: 0.85 },
        { stat: "size", operation: "add", value: 0.3 },
      ],
    },
    {
      level: 8,
      modifiers: [
        { stat: "size", operation: "add", value: 0.5 },
        { stat: "pierce", operation: "add", value: 8 },
        { stat: "damage", operation: "add", value: 8 },
      ],
    },
  ],
  beehive: [
    {
      level: 2,
      modifiers: [
        { stat: "projectileCount", operation: "add", value: 1 },
        { stat: "homingSpeed", operation: "add", value: 15 },
      ],
    },
    {
      level: 3,
      modifiers: [
        { stat: "damage", operation: "add", value: 2 },
        { stat: "hitCooldownMs", operation: "multiply", value: 0.85 },
      ],
    },
    {
      level: 4,
      modifiers: [
        { stat: "projectileCount", operation: "add", value: 1 },
        { stat: "durationMs", operation: "add", value: 400 },
      ],
    },
    {
      level: 5,
      modifiers: [
        { stat: "damage", operation: "add", value: 2 },
        { stat: "homingSpeed", operation: "add", value: 25 },
      ],
    },
    {
      level: 6,
      modifiers: [
        { stat: "projectileCount", operation: "add", value: 2 },
        { stat: "cooldownMs", operation: "multiply", value: 0.9 },
      ],
    },
    {
      level: 7,
      modifiers: [
        { stat: "damage", operation: "add", value: 4 },
        { stat: "hitCooldownMs", operation: "multiply", value: 0.8 },
      ],
    },
    {
      level: 8,
      modifiers: [
        { stat: "projectileCount", operation: "add", value: 4 },
        { stat: "homingSpeed", operation: "add", value: 40 },
        { stat: "damage", operation: "add", value: 5 },
      ],
    },
  ],
};

export const COMBAT_CONFIG: CombatConfig = {
  projectilePoolSize: 80,
  hitboxPoolSize: 32,
  orbitalPoolSize: 24,
  beePoolSize: 32,
  targetScanMs: 150,
  defaultEnemyScore: 1,
  defaultWeaponLoadout: [{ id: "banana", level: 1 }],
};
