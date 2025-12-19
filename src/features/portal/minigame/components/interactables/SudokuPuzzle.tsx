import React, { useState } from "react";
import { SUNNYSIDE } from "assets/sunnyside";
import { SUDOKU_DIFFICULTY, SNOW, PORTAL_SOUNDS, PuzzleDifficulty } from "../../Constants";
import redRibbon from "public/world/portal/images/bow.webp";
import ball from "public/world/portal/images/SudokuBall.webp";
import present from "public/world/portal/images/SudokuPresent.webp";
import snowman from "public/world/portal/images/SudokuSnowman.webp";
import tree from "public/world/portal/images/SudokuTree.webp";
import green_border from "public/world/portal/images/border_green2.webp";
import green_btn from "public/world/portal/images/roundbutton_green3.webp";
import { StatusBar } from "../hud/StatusBar";

const shovel = SUNNYSIDE.tools.rusty_shovel;

type ItemID = "ball" | "present" | "snowman" | "tree";
type SolutionGrid = ItemID[][];
type PuzzleGrid = (ItemID | null)[][];

const ITEM: ItemID[] = ["ball", "present", "snowman", "tree"];

const ITEM_IMAGES: Record<ItemID, string> = {
  ball,
  present,
  snowman,
  tree,
};

// Helper: shuffle
function shuffle<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

// Validate placement
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

// Generate full solution (no nulls)
function generateSolutionGrid(): SolutionGrid {
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

  if (!solve()) throw new Error("Failed to generate a Sudoku solution");

  return grid as SolutionGrid;
}

// Remove items according to difficulty
function removeItems(
  solution: SolutionGrid,
  totalToRemove: number,
): PuzzleGrid {
  const size = solution.length; // Always 4
  const puzzle: PuzzleGrid = solution.map((row) => [...row]);

  const flatIndices = shuffle(
    Array.from({ length: size * size }, (_, i) => i),
  ).slice(0, totalToRemove);

  for (const index of flatIndices) {
    const row = Math.floor(index / size);
    const col = index % size;
    puzzle[row][col] = null;
  }

  return puzzle;
}

function generateSudokuPuzzle(difficulty: PuzzleDifficulty) {
  const solution = generateSolutionGrid();
  const removeCount = SUDOKU_DIFFICULTY[difficulty];
  const puzzle = removeItems(solution, removeCount);
  return { puzzle, solution };
}

interface Props {
  onClose: () => void;
  onComplete: () => void;
  difficulty: PuzzleDifficulty;
  seconds: number;
  onReset: () => void;
}

export const SudokuPuzzle: React.FC<Props> = ({
  onClose,
  onComplete,
  difficulty,
  seconds,
  onReset
}) => {
  const { puzzle: initialPuzzle, solution } = React.useMemo(
    () => generateSudokuPuzzle(difficulty),
    [difficulty], // <-- FIXED
  );

  const [puzzle, setPuzzle] = useState<PuzzleGrid>(initialPuzzle);
  const [originalEmptyCells] = useState(
    initialPuzzle.map((row) => row.map((cell) => cell === null)),
  );
  const [selectedCell, setSelectedCell] = useState<{
    row: number;
    col: number;
  } | null>(null);

  const [isSolved, setIsSolved] = useState(false);

  const handleItemSelect = (item: ItemID) => {
    if (selectedCell) {
      const newPuzzle: PuzzleGrid = puzzle.map((row, r) =>
        row.map((cell, c) =>
          r === selectedCell.row && c === selectedCell.col ? item : cell,
        ),
      );

      setPuzzle(newPuzzle);
      PORTAL_SOUNDS.click.play();

      if (isPuzzleSolved(newPuzzle, solution)) {
        setIsSolved(true);
        onComplete();
        SNOW();
        PORTAL_SOUNDS.win.play();
      }
    }
  };

  function isPuzzleSolved(puzzle: PuzzleGrid, solution: SolutionGrid): boolean {
    return puzzle.every((row, r) =>
      row.every((cell, c) => cell === solution[r][c]),
    );
  }

  const isCellChangeable = (row: number, col: number) =>
    originalEmptyCells[row][col];

  return (
    <>
      <div className="fixed flex-col top-0 left-0 w-full h-screen backdrop-blur-sm flex items-center justify-center">
        <div className="relative w-full bottom-10 md:bottom-12 flex justify-center z-20">
          <img className="absolute w-[6rem] md:w-[8rem] " src={redRibbon} />
        </div>
        <div
          className="p-[.7rem] md:p-[1rem] rounded-t-[3rem]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, #3e8948 0 15px, #ffffff 5px 25px, #a22633 10px 35px)",
          }}
        >
          <StatusBar seconds={seconds} difficulty={difficulty} onReset={onReset} />
          <div className="bg-[#a22633] py-6 px-4 md:p-6">
            {selectedCell && !isSolved && (
              <div className="flex justify-center shadow-lg pb-6">
                {ITEM.map((id) => (
                  <div
                    key={id}
                    className="relative w-16 h-16 sm:w-20 sm:h-20 flex flex-col items-center hover:img-highlight"
                  >
                    <img
                      className="w-full h-full object-contain"
                      src={green_btn}
                      alt="btn"
                    />
                    <img
                      src={ITEM_IMAGES[id]}
                      className="absolute w-1/2 h-full cursor-pointer object-contain transition hover:scale-110 top-0"
                      onClick={() => handleItemSelect(id)}
                    />
                  </div>
                ))}

                {/* shovel */}
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex flex-col items-center hover:img-highlight">
                  <img
                    className="w-full h-full object-contain"
                    src={green_btn}
                  />
                  <img
                    src={shovel}
                    className="absolute w-1/2 h-full cursor-pointer object-contain rotate-180 hover:scale-110 transition"
                    onClick={() => {
                      if (selectedCell) {
                        const { row, col } = selectedCell;
                        if (isCellChangeable(row, col)) {
                          const newPuzzle = puzzle.map((r, ri) =>
                            r.map((c, ci) =>
                              ri === row && ci === col ? null : c,
                            ),
                          );
                          setPuzzle(newPuzzle);
                          setIsSolved(false);
                        }
                      }
                    }}
                  />
                </div>
              </div>
            )}

            {/* Sudoku Grid */}
            <div className="flex flex-row justify-center items-center w-full h-full">
              <div>
                <div className="grid grid-cols-4 gap-0 md:gap-2">
                  {puzzle.map((row, r) =>
                    row.map((cell, c) => (
                      <div
                        key={`${r}-${c}`}
                        className={`
                          relative flex justify-center items-center
                          ${selectedCell?.row === r && selectedCell?.col === c
                            ? "ring-2 ring-[#265c42] ring-offset-2"
                            : ""
                          }
                          ${!isCellChangeable(r, c)
                            ? "opacity-80"
                            : "cursor-pointer hover:img-highlight"
                          }
                          w-20 h-20 md:w-24 md:h-24
                        `}
                        onClick={() =>
                          !isSolved &&
                          isCellChangeable(r, c) &&
                          setSelectedCell({ row: r, col: c })
                        }
                      >
                        <img
                          src={green_border}
                          className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                        />
                        {cell && (
                          <img
                            src={ITEM_IMAGES[cell]}
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
    </>
  );
};
