import React, { useState } from "react";
import { SUNNYSIDE } from "assets/sunnyside";
import {
  SUDOKU_DIFFICULTY,
  SNOW,
  PORTAL_SOUNDS,
  PuzzleDifficulty,
} from "../../Constants";
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
  onReset,
}) => {
  const { puzzle: initialPuzzle } = React.useMemo(
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

  function getConflicts(grid: PuzzleGrid): Set<string> {
    const conflicts = new Set<string>();
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        const item = grid[r][c];
        if (!item) continue;
        for (let r2 = 0; r2 < 4; r2++) {
          for (let c2 = 0; c2 < 4; c2++) {
            if (r === r2 && c === c2) continue;
            const sameBox =
              Math.floor(r / 2) === Math.floor(r2 / 2) &&
              Math.floor(c / 2) === Math.floor(c2 / 2);
            if ((r === r2 || c === c2 || sameBox) && grid[r2][c2] === item) {
              conflicts.add(`${r}-${c}`);
            }
          }
        }
      }
    }
    return conflicts;
  }

  const [isSolved, setIsSolved] = useState(false);
  const conflicts = React.useMemo(() => getConflicts(puzzle), [puzzle]);

  const handleItemSelect = (item: ItemID) => {
    if (selectedCell) {
      const newPuzzle: PuzzleGrid = puzzle.map((row, r) =>
        row.map((cell, c) =>
          r === selectedCell.row && c === selectedCell.col ? item : cell,
        ),
      );

      setPuzzle(newPuzzle);
      PORTAL_SOUNDS.click.play();

      if (isPuzzleSolved(newPuzzle)) {
        setIsSolved(true);
        onComplete();
        SNOW();
        PORTAL_SOUNDS.win.play();
      }
    }
  };

  // A group (row, column or 2x2 box) is valid if it has all 4 different items
  function isGroupValid(cells: (ItemID | null)[]): boolean {
    return cells.every((c) => c !== null) && new Set(cells).size === 4;
  }

  // Accepts ANY valid completed grid, not just the generated solution
  function isPuzzleSolved(grid: PuzzleGrid): boolean {
    for (let i = 0; i < 4; i++) {
      const rowCells = grid[i];
      const colCells = grid.map((row) => row[i]);

      const boxRow = Math.floor(i / 2) * 2;
      const boxCol = (i % 2) * 2;
      const boxCells = [
        grid[boxRow][boxCol],
        grid[boxRow][boxCol + 1],
        grid[boxRow + 1][boxCol],
        grid[boxRow + 1][boxCol + 1],
      ];

      if (
        !isGroupValid(rowCells) ||
        !isGroupValid(colCells) ||
        !isGroupValid(boxCells)
      ) {
        return false;
      }
    }
    return true;
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
          <StatusBar
            seconds={seconds}
            difficulty={difficulty}
            onReset={onReset}
          />
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
              <div className="relative">
                <div className="grid grid-cols-4 gap-0 md:gap-2">
                  {puzzle.map((row, r) =>
                    row.map((cell, c) => (
                      <div
                        key={`${r}-${c}`}
                        className={`
              relative flex justify-center items-center
              ${
                selectedCell?.row === r && selectedCell?.col === c
                  ? "ring-2 ring-[#265c42] ring-offset-2 z-30"
                  : ""
              }
              ${
                !isCellChangeable(r, c)
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
                        {conflicts.has(`${r}-${c}`) && (
                          <div className="absolute inset-2 bg-red-600/50 pointer-events-none z-[5]" />
                        )}
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

                {/* Cross divider between the 2x2 boxes */}
                <div className="absolute top-0 left-1/2 h-full w-1 md:w-1.5 -translate-x-1/2 rounded-full bg-[#265c42] pointer-events-none z-20" />
                <div className="absolute left-0 top-1/2 w-full h-1 md:h-1.5 -translate-y-1/2 rounded-full bg-[#265c42] pointer-events-none z-20" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
