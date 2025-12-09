import React, { useEffect, useState } from "react";
import {
  SLIDING_PUZZLE_IMG,
  SLIDING_PUZZLE_MOVESTOSOLVE,
  SNOW,
} from "../../Constants";
import { Timer } from "../hud/Timer";
import { Lives } from "../hud/Lives";
import giantBalls from "public/world/portal/images/GiantRedChristmasOrnament.webp"

const SIZE_X = 3; // Columns
const SIZE_Y = 3; // Rows
const TOTAL_TILES = SIZE_X * SIZE_Y;

interface Props {
  onClose: () => void;
  onAction: () => void;
}

export const SlidingPuzzle: React.FC<Props> = ({ onClose, onAction }) => {
  const [tiles, setTiles] = useState<(number | null)[]>([]);
  const [isSolved, setIsSolved] = useState(false);

  useEffect(() => {
    generatePuzzleAtLeast4MovesAway();
  }, []);

  useEffect(() => {
    if (tiles.length === TOTAL_TILES) {
      const isSolved = checkIfSolved(tiles);
      setIsSolved(isSolved);
      if (isSolved) {
        onAction(),
          SNOW()
      }
    }
  }, [tiles]);

  const generatePuzzleAtLeast4MovesAway = () => {
    const solved: (number | null)[] = [0, 1, 2, 3, 4, 5, 6, 7, null];
    const moveCount =
      Math.floor(Math.random() * 3) + SLIDING_PUZZLE_MOVESTOSOLVE;
    let current = [...solved];
    let emptyIndex = current.indexOf(null);

    const visitedStates = new Set<string>();
    visitedStates.add(current.join(","));

    let lastEmptyIndex = emptyIndex;

    for (let moves = 0; moves < moveCount;) {
      const neighbors = getAdjacentIndices(emptyIndex).filter(
        (n) => n !== lastEmptyIndex,
      ); // avoid undoing
      const randNeighbor =
        neighbors[Math.floor(Math.random() * neighbors.length)];

      const newState = [...current];
      [newState[emptyIndex], newState[randNeighbor]] = [
        newState[randNeighbor],
        newState[emptyIndex],
      ];

      const key = newState.join(",");
      if (!visitedStates.has(key)) {
        visitedStates.add(key);
        lastEmptyIndex = emptyIndex;
        emptyIndex = randNeighbor;
        current = newState;
        moves++;
      }
    }

    setTiles(current);
  };

  const getAdjacentIndices = (index: number) => {
    const x = index % SIZE_X;
    const y = Math.floor(index / SIZE_X);
    const neighbors: number[] = [];

    if (x > 0) neighbors.push(index - 1);
    if (x < SIZE_X - 1) neighbors.push(index + 1);
    if (y > 0) neighbors.push(index - SIZE_X);
    if (y < SIZE_Y - 1) neighbors.push(index + SIZE_X);

    return neighbors;
  };

  const handleTileClick = (index: number) => {
    const emptyIndex = tiles.indexOf(null);
    if (isAdjacent(index, emptyIndex)) {
      const newTiles = [...tiles];
      [newTiles[index], newTiles[emptyIndex]] = [
        newTiles[emptyIndex],
        newTiles[index],
      ];
      setTiles(newTiles);
    }
  };

  const isAdjacent = (i: number, j: number) => {
    const x1 = i % SIZE_X,
      y1 = Math.floor(i / SIZE_X);
    const x2 = j % SIZE_X,
      y2 = Math.floor(j / SIZE_X);
    return Math.abs(x1 - x2) + Math.abs(y1 - y2) === 1;
  };

  const checkIfSolved = (tiles: (number | null)[]) => {
    const solved: (number | null)[] = [0, 1, 2, 3, 4, 5, 6, 7, null];
    return tiles.every((tile, index) => tile === solved[index]);
  };

  const getBackgroundPosition = (index: number) => {
    const x = (index % SIZE_X) * (100 / (SIZE_X - 1));
    const y = Math.floor(index / SIZE_X) * (100 / (SIZE_Y - 1));
    return `${x}% ${y}%`;
  };

  return (
    <>
      <div className="fixed top-0 left-0 w-full h-screen bg-black/100 backdrop-blur-md flex items-center justify-center flex-col gap-4">
        <div className="flex flex-col items-center">
          <div className="flex flex-row w-full flex-wrap items-center justify-center">
            <div className="flex flex-row w-full justify-between pt-6 px-6 bg-[#265c42] rounded-t-[3rem]">
              <div className="flex flex-col gap-4">
                <Timer />
                <Lives />
              </div>
              <img className="w-[2rem] md:w-[3rem] h-full" src={giantBalls} />
            </div>
          </div>
          <div className="p-3 border-[1rem] border-[#265c42]"
            style={{
              backgroundImage: "repeating-linear-gradient(45deg, #3e8948 0 15px, #ffffff 5px 25px, #a22633 10px 35px)",
            }}
          >
            <div className="border-[1.5rem] border-[#a22633] border-double w:p-0 md:p-6 bg-white">
              <div
                className="grid gap-1 w-[250px] h-[250px] md:w-[500px] md:h-[500px] "
                style={{
                  gridTemplateColumns: `repeat(${SIZE_X}, 1fr)`,
                  aspectRatio: "1 / 1", // Ensures it stays square
                }}
              >
                {tiles.map((tile, index) => (
                  <div
                    key={index}
                    onClick={() => handleTileClick(index)}
                    style={
                      tile !== null
                        ? {
                          backgroundImage: `url(${SLIDING_PUZZLE_IMG})`,
                          backgroundSize: `${SIZE_X * 100}% ${SIZE_Y * 100}%`,
                          backgroundPosition: getBackgroundPosition(tile),
                        }
                        : {}
                    }
                    className={`w-full h-full rounded cursor-pointer transition-all duration-200 ${tile === null ? "bg-white" : "bg-cover bg-center"
                      }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* {isSolved && (
        <div
          className="absolute bg-blue text-black-400 text-xxl font-bold bg-blue"
          style={{
            ...pixelGrayBorderStyle,
            padding: `${PIXEL_SCALE * 8}px`,
            background: "#546395",
          }}
        >
          {VICTORY_TEXT.SlidingPuzzle}
        </div>
      )} */}
      </div>
    </>
  );
};
