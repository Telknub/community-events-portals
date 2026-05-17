export type ObstacleName =
  | "rock"
  | "water"
  | "tree"
  | "cloud"
  | "cloud1"
  | "tree_stump";

export type Obstacle = { name: ObstacleName; x: number; y: number };

export type DropItemType = "swarmMob_dropItem";
