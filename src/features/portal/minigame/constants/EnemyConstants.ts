import {
  BossTypes,
  DropItemType,
  EnemyConfig,
  MobTypes,
  MobWaveConfig,
} from "../Types";

export const BOSS_DEPTH = 100;
export const ORB_DEPTH = 70;

// XP thresholds for boss spawns
export const BOSS_WAVE_XP_THRESHOLDS = {
  boss1: 70,
  boss2: 240,
  finalBoss: 360,
};

export const MOB_WAVE_THRESHOLDS: MobWaveConfig[] = [
  {
    scoreReq: 0,
    mobType: "mob1",
    totalEnemy: 30,
    batchSize: 3,
    delay: 3000,
    flag: "wave1",
  },
  {
    scoreReq: 20,
    mobType: "mob2",
    totalEnemy: 30,
    batchSize: 5,
    delay: 3000,
    flag: "wave2",
  },
  {
    scoreReq: 50,
    mobType: "mob3",
    totalEnemy: 30,
    batchSize: 5,
    delay: 3000,
    flag: "wave3",
  },
  {
    scoreReq: 80,
    mobType: "mob4",
    totalEnemy: 30,
    batchSize: 3,
    delay: 4000,
    flag: "wave4",
  },
  {
    scoreReq: 120,
    mobType: "mob5",
    totalEnemy: 30,
    batchSize: 3,
    delay: 4000,
    flag: "wave5",
  },
];

// XP values for each drop item type
export const DROP_ITEM_XP_VALUES: Record<DropItemType, number> = {
  blueOrb: 2,
  greenOrb: 3,
  grayOrb: 4,
  yellowOrb: 100,
  purpleOrb: 150,
};

// Balance stats for each boss type
export const BOSS_BALANCE_STATS: Record<
  BossTypes,
  { HP: number; SPEED: number }
> = {
  boss1: {
    HP: 50,
    SPEED: 25,
  },
  boss2: {
    HP: 100,
    SPEED: 25,
  },
  boss3: {
    HP: 50,
    SPEED: 30,
  },
};

// Balance stats for each mob type
export const MOB_BALANCE_STATS = {
  mob1: {
    HP: 1,
    SPEED: 15,
  },
  mob2: {
    HP: 1,
    SPEED: 20,
  },
  mob3: {
    HP: 2,
    SPEED: 20,
  },
  mob4: {
    HP: 3,
    SPEED: 25,
  },
  mob5: {
    HP: 4,
    SPEED: 25,
  },
};

// Mob configurations
export const MOB_CONFIGS: Record<MobTypes, EnemyConfig> = {
  mob1: {
    key: "Mob1",
    scale: 0.8,
    bodyWidth: 16,
    bodyHeight: 16,
    offsetX: -8,
    offsetY: -8,
    frameStart: 0,
    frameEnd: 8,
    frameRate: 10,
    depth: 80,
    speed: MOB_BALANCE_STATS.mob1.SPEED,
    hp: MOB_BALANCE_STATS.mob1.HP,
    maxHp: MOB_BALANCE_STATS.mob1.HP,
    dropItem: "blueOrb",
  },
  mob2: {
    key: "Mob2",
    scale: 0.8,
    bodyWidth: 16,
    bodyHeight: 16,
    offsetX: -8,
    offsetY: -12,
    frameStart: 0,
    frameEnd: 8,
    frameRate: 10,
    depth: 85,
    speed: MOB_BALANCE_STATS.mob2.SPEED,
    hp: MOB_BALANCE_STATS.mob2.HP,
    maxHp: MOB_BALANCE_STATS.mob2.HP,
    dropItem: "blueOrb",
  },
  mob3: {
    key: "Mob3",
    scale: 0.8,
    bodyWidth: 16,
    bodyHeight: 16,
    offsetX: -8,
    offsetY: -8,
    frameStart: 0,
    frameEnd: 12,
    frameRate: 10,
    depth: 80,
    speed: MOB_BALANCE_STATS.mob3.SPEED,
    hp: MOB_BALANCE_STATS.mob3.HP,
    maxHp: MOB_BALANCE_STATS.mob3.HP,
    dropItem: "greenOrb",
  },
  mob4: {
    key: "Mob4",
    scale: 0.8,
    bodyWidth: 16,
    bodyHeight: 16,
    offsetX: -8,
    offsetY: -8,
    frameStart: 0,
    frameEnd: 11,
    frameRate: 10,
    depth: 80,
    speed: MOB_BALANCE_STATS.mob4.SPEED,
    hp: MOB_BALANCE_STATS.mob4.HP,
    maxHp: MOB_BALANCE_STATS.mob4.HP,
    dropItem: "grayOrb",
  },
  mob5: {
    key: "Mob5",
    scale: 0.8,
    bodyWidth: 8,
    bodyHeight: 8,
    offsetX: -4,
    offsetY: 0,
    frameStart: 0,
    frameEnd: 4,
    frameRate: 5,
    depth: 90,
    speed: MOB_BALANCE_STATS.mob5.SPEED,
    hp: MOB_BALANCE_STATS.mob5.HP,
    maxHp: MOB_BALANCE_STATS.mob5.HP,
    dropItem: "grayOrb",
  },
};

// Boss enemy configurations
export const BOSS_CONFIGS: Record<BossTypes, EnemyConfig> = {
  boss1: {
    key: "Boss1",
    scale: 0.8,
    bodyWidth: 55,
    bodyHeight: 68,
    offsetX: -27.5,
    offsetY: -34,
    frameStart: 0,
    frameEnd: 7,
    frameRate: 10,
    depth: 100,
    speed: BOSS_BALANCE_STATS.boss1.SPEED,
    hp: BOSS_BALANCE_STATS.boss1.HP,
    maxHp: BOSS_BALANCE_STATS.boss1.HP,
    dropItem: "yellowOrb",
  },
  boss2: {
    key: "Boss2",
    scale: 0.8,
    bodyWidth: 58,
    bodyHeight: 56,
    offsetX: -28,
    offsetY: -28,
    frameStart: 0,
    frameEnd: 7,
    frameRate: 10,
    depth: BOSS_DEPTH,
    speed: BOSS_BALANCE_STATS.boss2.SPEED,
    hp: BOSS_BALANCE_STATS.boss2.HP,
    maxHp: BOSS_BALANCE_STATS.boss2.HP,
    dropItem: "purpleOrb",
  },
  boss3: {
    key: "Boss3",
    scale: 0.8,
    bodyWidth: 50,
    bodyHeight: 55,
    offsetX: -25,
    offsetY: -27.5,
    frameStart: 0,
    frameEnd: 8,
    frameRate: 10,
    depth: BOSS_DEPTH,
    speed: BOSS_BALANCE_STATS.boss3.SPEED,
    hp: BOSS_BALANCE_STATS.boss3.HP,
    maxHp: BOSS_BALANCE_STATS.boss3.HP,
    dropItem: "purpleOrb",
  },
};
