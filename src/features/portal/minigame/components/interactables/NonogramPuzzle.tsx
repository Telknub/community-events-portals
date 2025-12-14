import React, { useEffect, useState } from "react";
import {
  NONOGRAM_PATTERNS_EASY,
  NONOGRAM_PATTERNS_HARD,
  Cell,
  SNOW,
} from "../../Constants";
import { StatusBar } from "../hud/StatusBar";
import redRibbon from "public/world/portal/images/bow.webp";

interface Props {
  onClose: () => void;
  onComplete: () => void;
  difficulty: "easy" | "hard";
  seconds: number;
  onReset: () => void;
}

//  Choose pattern by difficulty
function choosePattern(difficulty: "easy" | "hard") {
  const pool =
    difficulty === "easy" ? NONOGRAM_PATTERNS_EASY : NONOGRAM_PATTERNS_HARD;

  const keys = Object.keys(pool);
  const randomKey = keys[Math.floor(Math.random() * keys.length)];
  return pool[randomKey];
}

//  Get row/column clues
const getClues = (lines: Cell[][]): number[][] => {
  return lines.map((row) => {
    const clues: number[] = [];
    let count = 0;
    row.forEach((cell) => {
      if (cell === 1) count++;
      else if (count > 0) {
        clues.push(count);
        count = 0;
      }
    });
    if (count > 0) clues.push(count);
    return clues.length ? clues : [0];
  });
};

export const NonogramPuzzle: React.FC<Props> = ({
  onClose,
  onComplete,
  difficulty,
  seconds,
  onReset,
}) => {
  /* Load random pattern whenever difficulty changes */
  const PATTERN = React.useMemo(() => choosePattern(difficulty), [difficulty]);

  /* Clues are derived from pattern */
  const rowClues = React.useMemo(() => getClues(PATTERN), [PATTERN]);
  const colClues = React.useMemo(
    () => getClues(PATTERN[0].map((_, c) => PATTERN.map((row) => row[c]))),
    [PATTERN],
  );

  /* Player board state */
  const [board, setBoard] = useState<boolean[][]>(
    Array.from({ length: 6 }, () => Array(6).fill(false)),
  );
  const [solved, markSolved] = useState(false);

  /* Toggle cell */
  const toggleCell = (r: number, c: number) => {
    if (solved) return;

    setBoard((prev) => {
      const next = prev.map((row) => [...row]);
      next[r][c] = !next[r][c];
      return next;
    });
  };

  /* Check solved state */
  const checkSolved = (board: boolean[][]): boolean =>
    board.every((row, r) =>
      row.every((cell, c) => cell === (PATTERN[r][c] === 1)),
    );

  useEffect(() => {
    if (checkSolved(board)) {
      markSolved(true);
    }
  }, [board, PATTERN]);

  useEffect(() => {
    if (solved) {
      SNOW();
      onComplete();
    }
  }, [solved]);

  return (
    <>
      <div className="fixed inset-0 bg-white-200 z-0 backdrop-blur-sm">
        <div className="relative text-[#265c42] flex flex-col items-center justify-center w-full h-full">
          <div className="relative w-full top-12 md:top-16 flex justify-center z-20">
            <img className="w-[6rem] md:w-[8rem]" src={redRibbon} />
          </div>
          <div
            className="md:p-[1rem] p-[.7rem] rounded-t-[3rem]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg, #3e8948 0 15px, #ffffff 5px 25px, #a22633 10px 35px)",
            }}
          >
            <StatusBar seconds={seconds} onReset={onReset} />

            <div className="bg-white p-0 md:p-6 border-[1rem] border-[#265c42] border-double">
              {/* Column Clues */}
              <div className="flex ml-[55px] sm:ml-[40px] md:ml-[80px]">
                {colClues.map((clue, i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center
                      w-[40px] sm:w-[50px] md:w-[70px]
                      text-sm sm:text-xl md:text-[3rem] font-bold"
                  >
                    {clue.map((num, j) => (
                      <div className="my-2" key={j}>
                        {num}
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* Rows */}
              <div className="flex flex-col items-center">
                {PATTERN.map((_, r) => (
                  <div key={r} className="flex items-center justify-center">
                    {/* Row Clues */}
                    <div
                      className="
                        w-[60px] sm:w-[40px] md:w-[80px]
                        pr-1 sm:pr-2
                        text-sm sm:text-xl md:text-[3rem]
                        text-right font-bold
                      "
                    >
                      {rowClues[r].map((num, i) => (
                        <span key={i} className="mx-1">
                          {num}
                        </span>
                      ))}
                    </div>

                    {/* Grid */}
                    <div className="grid grid-cols-6">
                      {PATTERN[r].map((_, c) => {
                        const isFilled = board[r][c];
                        return (
                          <div
                            key={c}
                            onClick={() => toggleCell(r, c)}
                            className={`
                              border-2 sm:border-3 md:border-4 border-[#3e8948]
                              cursor-pointer transition
                              ${isFilled ? "bg-[#265c42]" : "bg-[#265c42]-500"}
                              w-[40px] h-[40px]
                              sm:w-[50px] sm:h-[50px]
                              md:w-[70px] md:h-[70px]
                            `}
                          />
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Optional solved UI */}
        </div>
      </div>
    </>
  );
};
