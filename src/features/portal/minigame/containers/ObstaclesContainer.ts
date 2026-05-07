import { Scene } from "../Scene";
import { ObstacleName } from "../Types";
import { SQUARE_WIDTH } from "features/game/lib/constants";
import { BoundingBox } from "../lib/collisionDetection";

interface Props {
  name: ObstacleName;
  x?: number;
  y?: number;
  scene: Scene;
  obstacleGroup: Phaser.Physics.Arcade.StaticGroup;
  waterGroup: Phaser.GameObjects.Group;
  currentPlayer: Phaser.GameObjects.GameObject;
  obstacles: BoundingBox[];
}

const obstacleConfig: Record<
  ObstacleName,
  {
    width: number;
    height: number;
    destructible: boolean;
    hp: number;
    hasHitbox: boolean;
  }
> = {
  rock: {
    width: 1,
    height: 1,
    destructible: true,
    hp: Infinity,
    hasHitbox: true,
  },
  water: {
    width: 4,
    height: 4,
    destructible: false,
    hp: Infinity,
    hasHitbox: false,
  },
  tree: {
    width: 2,
    height: 2,
    destructible: true,
    hp: 3,
    hasHitbox: true,
  },
  cloud: {
    width: 4,
    height: 3,
    destructible: true,
    hp: Infinity,
    hasHitbox: false,
  },
  cloud1: {
    width: 2,
    height: 2,
    destructible: true,
    hp: Infinity,
    hasHitbox: false,
  },
  tree_stump: {
    width: 1,
    height: 1,
    destructible: true,
    hp: Infinity,
    hasHitbox: true,
  },
};

export function addStaticObstacle({
  name,
  x,
  y,
  scene,
  obstacleGroup,
  waterGroup,
  currentPlayer,
  obstacles,
}: Props) {
  const { width, height, destructible, hp, hasHitbox } = obstacleConfig[name];

  const WATER_DEPTH = 5;
  const OBSTACLES_DEPTH = 10;
  const CLOUDS_DEPTH = 1000;

  const coordinates = {
    x: x ?? 0,
    y: y ?? 0,
  };

  // Adjust for even-sized objects
  if (width === 2) {
    coordinates.x += 1;
  }

  let worldX = coordinates.x * SQUARE_WIDTH;
  let worldY = coordinates.y * SQUARE_WIDTH;

  // Centering logic
  if (width % 2 === 1) {
    worldX += SQUARE_WIDTH / 2;
  }

  if (height % 2 === 1) {
    worldY += SQUARE_WIDTH / 2;
  }

  const obstacle = scene.add.sprite(worldX, worldY, name);

  obstacle.setDepth(OBSTACLES_DEPTH);

  if (hasHitbox) {
    scene.physics.add.existing(obstacle, true);
    obstacleGroup.add(obstacle);
    const body = obstacle.body as Phaser.Physics.Arcade.StaticBody;
    body.setSize(width * SQUARE_WIDTH, height * SQUARE_WIDTH);
    scene.physics.add.collider(currentPlayer, obstacle);
  }

  const noHitbox: ObstacleName[] = ["cloud", "cloud1"];

  if (noHitbox.includes(name)) {
    obstacle.setDepth(CLOUDS_DEPTH);
    obstacle.alpha = 0.8;
  }

  if (name === "water") {
    waterGroup.add(obstacle);
    waterGroup.setDepth(WATER_DEPTH);
  }

  obstacles.push({
    x: coordinates.x,
    y: coordinates.y,
    width,
    height,
    sprite: obstacle,
    destructible,
    hp,
    name,
    hasHitbox,
  });
}
