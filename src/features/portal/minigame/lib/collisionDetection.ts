export type BoundingBox = {
  x: number;
  y: number;
  width: number;
  height: number;
  sprite?: Phaser.GameObjects.Sprite;
  destructible?: boolean;
  hp?: number;
  name?: string;
  hasHitbox?: boolean;
};

/**
 * Axis aligned bounding box collision detection
 * https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection
 */
export function isOverlapping(
  boundingBox1: BoundingBox,
  boundingBox2: BoundingBox,
): boolean {
  const xmin1 = boundingBox1.x;
  const xmin2 = boundingBox2.x;

  const xmax1 = boundingBox1.x + boundingBox1.width;
  const xmax2 = boundingBox2.x + boundingBox2.width;

  const ymin1 = boundingBox1.y - boundingBox1.height;
  const ymin2 = boundingBox2.y - boundingBox2.height;

  const ymax1 = boundingBox1.y;
  const ymax2 = boundingBox2.y;

  return xmin1 < xmax2 && xmax1 > xmin2 && ymin1 < ymax2 && ymax1 > ymin2;
}

const splitBoundingBox = (boundingBox: BoundingBox): BoundingBox[] => {
  const boxCount = boundingBox.width * boundingBox.height;

  return Array.from({ length: boxCount }).map((_, i) => ({
    x: boundingBox.x + (i % boundingBox.width),
    y: boundingBox.y - Math.floor(i / boundingBox.width),
    width: 1,
    height: 1,
  }));
};

export function randomEmptyPosition({
  bounding,
  boxes,
  item,
}: {
  bounding: BoundingBox;
  boxes: BoundingBox[];
  item: { width: number; height: number };
}): BoundingBox | undefined {
  const positionsInBounding = splitBoundingBox(bounding);

  const availablePositions = positionsInBounding.filter((position) => {
    if (
      position.x + item.width <= bounding.x + bounding.width &&
      position.y - item.height >= bounding.y - bounding.height
    ) {
      const objectBoundingBox: BoundingBox = {
        x: position.x,
        y: position.y,
        width: item.width,
        height: item.height,
      };
      return boxes.every((box) => !isOverlapping(objectBoundingBox, box));
    }
    return false;
  });

  const shuffled = availablePositions.sort(() => 0.5 - Math.random());
  return shuffled[0];
}
