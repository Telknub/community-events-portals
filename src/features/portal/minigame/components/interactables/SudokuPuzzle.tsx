import React, { useState } from "react";
import { SUNNYSIDE } from "assets/sunnyside";
import { SUDOKU_COMPLEXITY, SNOW } from "../../Constants";

import ball from "public/world/portal/images/SudokuBall.webp";
import present from "public/world/portal/images/SudokuPresent.webp";
import snowman from "public/world/portal/images/SudokuSnowman.webp";
import tree from "public/world/portal/images/SudokuTree.webp";
import blue_border from "public/world/portal/images/border_green2.webp";
import blue_button from "public/world/portal/images/roundbutton_green3.webp";
import { Timer } from "../hud/Timer";
import { Lives } from "../hud/Lives";
import giantBalls from "public/world/portal/images/GiantRedChristmasOrnament.webp";

const shovel = SUNNYSIDE.tools.rusty_shovel;

type ItemID = "ball" | "present" | "snowman" | "tree";
type PuzzleRow = (ItemID | null)[];
type PuzzleGrid = PuzzleRow[];

const ITEM: ItemID[] = ["ball", "present", "snowman", "tree"];

const ITEM_IMAGES: Record<ItemID, string> = {
  ball,
  present,
  snowman,
  tree,
};

// Helper function
function shuffle<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

function isValid(
  grid: PuzzleGrid,
  row: number,
  col: number,
  item: ItemID,
): boolean {
  for (let i = 0; i < 4; i++) {
    if (grid[row][i] === item || grid[i][col] === item) return false;
  }

  const startRow = Math.floor(row / 2) * 2;
  const startCol = Math.floor(col / 2) * 2;

  for (let r = startRow; r < startRow + 2; r++) {
    for (let c = startCol; c < startCol + 2; c++) {
      if (grid[r][c] === item) return false;
    }
  }

  return true;
}

function generateSolutionGrid(): ItemID[][] {
  const grid: PuzzleGrid = Array.from({ length: 4 }, () => Array(4).fill(null));

  function solve(row = 0, col = 0): boolean {
    if (row === 4) return true;

    const nextRow = col === 3 ? row + 1 : row;
    const nextCol = (col + 1) % 4;

    for (const item of shuffle(ITEM)) {
      if (isValid(grid, row, col, item)) {
        grid[row][col] = item;
        if (solve(nextRow, nextCol)) return true;
        grid[row][col] = null;
      }
    }

    return false;
  }

  if (!solve()) throw new Error("Failed to generate a valid Sudoku solution");

  return grid as ItemID[][];
}

function removeItems(grid: ItemID[][], totalToRemove = 0): PuzzleGrid {
  const flatIndices = shuffle(
    Array.from({ length: 16 }, (_, i) => i), // 4x4 = 16 cells
  ).slice(0, totalToRemove);

  const puzzle: PuzzleGrid = grid.map((row) => row.map((cell) => cell));

  for (const index of flatIndices) {
    const row = Math.floor(index / SUDOKU_COMPLEXITY);
    const col = index % 4;
    puzzle[row][col] = null;
  }

  return puzzle;
}

function generateSudokuPuzzle() {
  const solution = generateSolutionGrid();
  const puzzle = removeItems(solution, 4);
  return { puzzle, solution };
}

interface Props {
  onClose: () => void;
  onAction: () => void;
}

export const SudokuPuzzle: React.FC<Props> = ({ onClose, onAction }) => {
  const { puzzle: initialPuzzle, solution } = React.useMemo(
    () => generateSudokuPuzzle(),
    [],
  );

  const [puzzle, setPuzzle] = useState<(ItemID | null)[][]>(initialPuzzle);
  const [originalEmptyCells] = useState(
    initialPuzzle.map((row) => row.map((cell) => cell === null)),
  );
  const [selectedCell, setSelectedCell] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [isSolved, setIsSolved] = useState(false);

  const ItemIDs: ItemID[] = ITEM;

  const handleItemSelect = (item: ItemID) => {
    if (selectedCell) {
      const newPuzzle = puzzle.map((row, rowIndex) =>
        row.map((cell, colIndex) =>
          rowIndex === selectedCell.row && colIndex === selectedCell.col
            ? item
            : cell,
        ),
      );

      setPuzzle(newPuzzle);
      // setSelectedCell(null);

      // Check if all user-input cells are filled
      const allFilled = originalEmptyCells.every((row, rowIndex) =>
        row.every((isEditable, colIndex) => {
          return !isEditable || newPuzzle[rowIndex][colIndex] !== null;
        }),
      );

      // Check for solution immediately after move
      if (isPuzzleSolved(newPuzzle, solution)) {
        setIsSolved(true);
        onAction();
        SNOW();
      }
    }
  };

  function isPuzzleSolved(puzzle: PuzzleGrid, solution: PuzzleGrid): boolean {
    const result = puzzle.every((row, rowIndex) =>
      row.every((cell, colIndex) => cell === solution[rowIndex][colIndex]),
    );
    return result;
  }

  const isCellChangeable = (rowIndex: number, colIndex: number) => {
    return originalEmptyCells[rowIndex][colIndex];
  };

  return (
    <>
      <div className="fixed top-0 left-0 w-full h-screen bg-black/100 backdrop-blur-md flex items-center justify-center">
        <div
          className="p-[.7rem] md:p-[1rem] rounded-t-[3rem]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, #3e8948 0 15px, #ffffff 5px 25px, #a22633 10px 35px)",
          }}
        >
          <div className="flex flex-row w-full flex-wrap items-center justify-center">
            <div className="flex flex-row w-full justify-between pt-6 px-6 bg-[#265c42] rounded-t-[3rem] pb-4">
              <div className="flex flex-col gap-4">
                <Timer />
                <Lives />
              </div>
              <img className="w-[2rem] md:w-[3rem] h-full" src={giantBalls} />
            </div>
          </div>
          <div className="bg-[#a22633] py-6 px-4 md:p-6">
            {selectedCell && !isSolved && (
              <div className="flex justify-center shadow-lg pb-6">
                {ItemIDs.map((id) => (
                  <div
                    key={id}
                    className="relative w-16 h-16 sm:w-20 sm:h-20 flex flex-col items-center hover:img-highlight"
                  >
                    <img
                      className="w-full h-full object-contain"
                      src={blue_button}
                      alt="empty-bar"
                    />
                    <img
                      src={ITEM_IMAGES[id]}
                      alt={`select-${id}`}
                      className="absolute w-1/2 h-full cursor-pointer object-contain transition hover:scale-110 top-0"
                      onClick={() => handleItemSelect(id)}
                    />
                  </div>
                ))}
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex flex-col items-center hover:img-highlight">
                  <img
                    className="w-full h-full object-contain"
                    src={blue_button}
                    alt="empty-bar"
                  />
                  <img
                    src={shovel}
                    alt="shovel"
                    className="absolute w-1/2 h-full cursor-pointer object-contain rotate-180 hover:scale-110 transition hover:img-highlight"
                    onClick={() => {
                      if (selectedCell) {
                        const { row, col } = selectedCell;
                        if (isCellChangeable(row, col)) {
                          const newPuzzle = [...puzzle];
                          newPuzzle[row][col] = null;
                          setPuzzle(newPuzzle);
                          // setSelectedCell(null);
                          setIsSolved(false); // In case user undoes correct solution
                        }
                      }
                    }}
                  />
                </div>
              </div>
            )}

            {/* Sudoku grid */}
            <div className="flex flex-row justify-center items-center w-full h-full">
              <div className="">
                <div className="grid grid-cols-4 gap-0 md:gap-2">
                  {puzzle.map((row, rowIndex) =>
                    row.map((item, colIndex) => (
                      <div
                        key={`${rowIndex}-${colIndex}`}
                        className={`
                    relative flex justify-center items-center
                    ${selectedCell?.row === rowIndex && selectedCell?.col === colIndex ? "ring-2 ring-[#265c42] ring-offset-2" : ""}
                    ${!isCellChangeable(rowIndex, colIndex) ? "opacity-90" : "cursor-pointer hover:img-highlight"}
                    w-20 h-20 md:w-24 md:h-24
                  `}
                        onClick={() => {
                          if (
                            !isSolved &&
                            isCellChangeable(rowIndex, colIndex)
                          ) {
                            setSelectedCell({ row: rowIndex, col: colIndex });
                          }
                        }}
                      >
                        <img
                          src={blue_border}
                          alt="border"
                          className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                        />
                        {item && (
                          <img
                            src={ITEM_IMAGES[item]}
                            alt={item}
                            className="w-8 h-8 sm:w-12 sm:h-12 object-contain z-10"
                          />
                        )}
                      </div>
                    )),
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* {isSolved && (
        <div className="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-70">
          <div
            className="flex flex-row justify-center items-center w-[15rem] text-white shadow-xl text-2xxl font-bold"
            style={{
              ...pixelGrayBorderStyle,
              padding: `${PIXEL_SCALE * 8}px`,
              background: "#546395",
            }}
          >
            <div className="pr-3">{VICTORY_TEXT.Sudoku}</div>
          </div>
        </div>
      )} */}
    </>
  );
};
