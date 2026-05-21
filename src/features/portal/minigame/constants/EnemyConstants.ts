import { EnemyConfig } from "../Types";

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

// Drop items
export const DROP_ITEM_VALUES = Object.fromEntries(
  Object.entries(MOB_BALANCE_STATS).map(([mobKey, stats], index) => [
    `swarmMob_dropItem${index + 1}`,
    stats.XP,
  ]),
);

// Enemy configurations
export const ENEMY_CONFIGS: EnemyConfig[] = [
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
    frameRate: 20,
    speed: MOB_BALANCE_STATS.mob5.SPEED,
    hp: MOB_BALANCE_STATS.mob5.HP,
    maxHp: MOB_BALANCE_STATS.mob5.HP,
    dropItem: "swarmMob_dropItem5",
  },
];
