import { DropItemType } from "../Types";
import { EnemyConfig } from "../Types";

// Drop items
export const DROP_ITEM_VALUES: Record<DropItemType, number> = {
  swarmMob_dropItem1: 1,
  swarmMob_dropItem2: 2,
};

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
    speed: 30,
    hp: 1,
    maxHp: 1,
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
    speed: 30,
    hp: 3,
    maxHp: 3,
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
    speed: 30,
    hp: 1,
    maxHp: 1,
    dropItem: "swarmMob_dropItem1",
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
    speed: 30,
    hp: 3,
    maxHp: 3,
    dropItem: "swarmMob_dropItem2",
  },
];
