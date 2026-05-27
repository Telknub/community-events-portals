import { BossTypes, EnemyConfig } from "../Types";

// XP thresholds for boss spawns
export const BOSS_WAVE_XP_THRESHOLDS = {
  boss1: 50,
  boss2: 240,
  finalBoss: 360,
};

// Balance stats for each boss type
const BOSS_BALANCE_STATS = {
  boss1: {
    HP: 20,
    XP: 80,
    SPEED: 15,
  },
  boss2: {
    HP: 30,
    XP: 100,
    SPEED: 20,
  },
};

// Balance stats for each mob type
const MOB_BALANCE_STATS = {
  mob1: {
    HP: 1,
    XP: 1,
    SPEED: 30,
  },
  mob2: {
    HP: 1,
    XP: 2,
    SPEED: 25,
  },
  mob3: {
    HP: 2,
    XP: 3,
    SPEED: 20,
  },
  mob4: {
    HP: 3,
    XP: 4,
    SPEED: 15,
  },
  mob5: {
    HP: 4,
    XP: 5,
    SPEED: 15,
  },
};

export const DROP_ITEM_VALUES = {
  swarmMob_dropItem1: MOB_BALANCE_STATS.mob1.XP,
  swarmMob_dropItem2: MOB_BALANCE_STATS.mob2.XP,
  swarmMob_dropItem3: MOB_BALANCE_STATS.mob3.XP,
  swarmMob_dropItem4: MOB_BALANCE_STATS.mob4.XP,
  swarmMob_dropItem5: MOB_BALANCE_STATS.mob5.XP,
  boss_dropItem1: BOSS_BALANCE_STATS.boss1.XP,
  boss_dropItem2: BOSS_BALANCE_STATS.boss2.XP,
};

// Mob configurations
export const MOB_CONFIGS: EnemyConfig[] = [
  {
    key: "swarmMob1",
    scale: 1,
    bodyWidth: 16,
    bodyHeight: 16,
    offsetX: -8,
    offsetY: -8,
    frameStart: 0,
    frameEnd: 8,
    frameRate: 10,
    speed: MOB_BALANCE_STATS.mob1.SPEED,
    hp: MOB_BALANCE_STATS.mob1.HP,
    maxHp: MOB_BALANCE_STATS.mob1.HP,
    dropItem: "swarmMob_dropItem1",
  },
  {
    key: "swarmMob2",
    scale: 1,
    bodyWidth: 16,
    bodyHeight: 16,
    offsetX: -8,
    offsetY: -12,
    frameStart: 0,
    frameEnd: 8,
    frameRate: 10,
    speed: MOB_BALANCE_STATS.mob2.SPEED,
    hp: MOB_BALANCE_STATS.mob2.HP,
    maxHp: MOB_BALANCE_STATS.mob2.HP,
    dropItem: "swarmMob_dropItem2",
  },
  {
    key: "swarmMob3",
    scale: 1,
    bodyWidth: 16,
    bodyHeight: 16,
    offsetX: -8,
    offsetY: -8,
    frameStart: 0,
    frameEnd: 12,
    frameRate: 10,
    speed: MOB_BALANCE_STATS.mob3.SPEED,
    hp: MOB_BALANCE_STATS.mob3.HP,
    maxHp: MOB_BALANCE_STATS.mob3.HP,
    dropItem: "swarmMob_dropItem3",
  },
  {
    key: "swarmMob4",
    scale: 1,
    bodyWidth: 16,
    bodyHeight: 16,
    offsetX: -8,
    offsetY: -8,
    frameStart: 0,
    frameEnd: 11,
    frameRate: 10,
    speed: MOB_BALANCE_STATS.mob4.SPEED,
    hp: MOB_BALANCE_STATS.mob4.HP,
    maxHp: MOB_BALANCE_STATS.mob4.HP,
    dropItem: "swarmMob_dropItem4",
  },
  {
    key: "swarmMob5",
    scale: 1,
    bodyWidth: 8,
    bodyHeight: 16,
    offsetX: -4,
    offsetY: -8,
    frameStart: 0,
    frameEnd: 4,
    frameRate: 5,
    speed: MOB_BALANCE_STATS.mob5.SPEED,
    hp: MOB_BALANCE_STATS.mob5.HP,
    maxHp: MOB_BALANCE_STATS.mob5.HP,
    dropItem: "swarmMob_dropItem5",
  },
];

// Boss enemy configurations
export const BOSS_CONFIGS: Record<BossTypes, EnemyConfig> = {
  boss1: {
    key: "boss1",
    scale: 0.8,
    bodyWidth: 55,
    bodyHeight: 68,
    offsetX: -27.5,
    offsetY: -34,
    frameStart: 0,
    frameEnd: 15,
    frameRate: 10,
    speed: BOSS_BALANCE_STATS.boss1.SPEED,
    hp: BOSS_BALANCE_STATS.boss1.HP,
    maxHp: BOSS_BALANCE_STATS.boss1.HP,
    dropItem: "boss_dropItem1",
  },
  boss2: {
    key: "boss2",
    scale: 0.8,
    bodyWidth: 58,
    bodyHeight: 56,
    offsetX: -28,
    offsetY: -28,
    frameStart: 0,
    frameEnd: 15,
    frameRate: 10,
    speed: BOSS_BALANCE_STATS.boss2.SPEED,
    hp: BOSS_BALANCE_STATS.boss2.HP,
    maxHp: BOSS_BALANCE_STATS.boss2.HP,
    dropItem: "boss_dropItem2",
  },
};
