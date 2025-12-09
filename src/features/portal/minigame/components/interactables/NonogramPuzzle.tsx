import React, { useEffect, useState } from "react";
import { PATTERNS, Cell, SNOW } from "../../Constants";
import { Timer } from "../hud/Timer";
import { Lives } from "../hud/Lives";
import giantBalls from "public/world/portal/images/GiantRedChristmasOrnament.webp";

interface Props {
  onClose: () => void;
  onAction: () => void;
}

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

const rowClues = getClues(PATTERNS);
const colClues = getClues(
  PATTERNS[0].map((_, c) => PATTERNS.map((row) => row[c])),
);

const isSolved = (board: boolean[][]): boolean =>
  board.every((row, r) =>
    row.every((cell, c) => cell === (PATTERNS[r][c] === 1)),
  );

export const NonogramPuzzle: React.FC<Props> = ({ onClose, onAction }) => {
  const [board, setBoard] = useState<boolean[][]>(
    Array.from({ length: 6 }, () => Array(6).fill(false)),
  );
  const [solved, markSolved] = useState(false);

  const toggleCell = (r: number, c: number) => {
    if (solved) return;
    setBoard((prev) => {
      const newBoard = prev.map((row) => [...row]);
      newBoard[r][c] = !newBoard[r][c];
      return newBoard;
    });
  };

  useEffect(() => {
    if (isSolved(board)) {
      markSolved(true);
    }
  }, [board, markSolved]);

  useEffect(() => {
    if (solved) {
      (SNOW(), onAction());
    }
  }, [solved]);

  return (
    <>
      <div className="fixed inset-0 bg-white-200 z-0 bg-black">
        <div className="relative text-[#265c42] flex flex-col items-center justify-center w-full h-full">
          <div
            className="md:p-[1rem] p-[.7rem] rounded-t-[3rem]"
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
                {PATTERNS.map((_, r) => (
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
                      {PATTERNS[r].map((_, c) => {
                        const isFilled = board[r][c];
                        return (
                          <div
                            key={c}
                            onClick={() => toggleCell(r, c)}
                            className={`
                      border-2 sm:border-3 md:border-4 border-[#3e8948]
                      cursor-pointer transition
                      ${isFilled ? "bg-[#265c42] " : "bg-[#265c42]-500"}
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

          {/* Solved Message */}
          {/* <div className="flex justify-center">
      {solved && (
        <div className="
          w-full mt-6 ml-6 p-4 sm:p-5
          bg-green-100 border-4 border-green-500 
          text-green-700 text-xl sm:text-2xl 
          font-bold text-center rounded-xl
        ">
          🎉Happy Holidays!🎉
        </div>
        )
      }
      </div> */}
        </div>
      </div>
    </>
  );
};
