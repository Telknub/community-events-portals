import React, { useEffect, useRef, useState } from "react";
import {
  Cell,
  SNOW,
  PORTAL_SOUNDS,
  PuzzleDifficulty,
  NONOGRAM_PUZZLE_DIFFICULTY,
} from "../../Constants";
import { StatusBar } from "../hud/StatusBar";
import redRibbon from "public/world/portal/images/bow.webp";

interface Props {
  onClose: () => void;
  onComplete: () => void;
  difficulty: PuzzleDifficulty;
  seconds: number;
  onReset: () => void;
}

//  Choose pattern by difficulty
function choosePattern(difficulty: PuzzleDifficulty) {
  const pool = NONOGRAM_PUZZLE_DIFFICULTY[difficulty] as Record<
    string,
    Cell[][]
  >;

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

const makeEmptyBoard = (size: number): boolean[][] =>
  Array.from({ length: size }, () => Array(size).fill(false));

export const NonogramPuzzle: React.FC<Props> = ({
  onComplete,
  difficulty,
  seconds,
  onReset,
}) => {
  /* Load random pattern whenever difficulty changes */
  const PATTERN = React.useMemo(() => choosePattern(difficulty), [difficulty]);
  const SIZE = PATTERN.length;

  /* Clues are derived from pattern */
  const rowClues = React.useMemo(() => getClues(PATTERN), [PATTERN]);
  const colClues = React.useMemo(
    () => getClues(PATTERN[0].map((_, c) => PATTERN.map((row) => row[c]))),
    [PATTERN],
  );

  /* Player board state */
  const [board, setBoard] = useState<boolean[][]>(() => makeEmptyBoard(SIZE));

  /* Reset the board whenever a new pattern is chosen.
     Done during render (not in an effect) so the board is never rendered
     with the wrong size, even for a single frame. */
  const [prevPattern, setPrevPattern] = useState(PATTERN);
  if (prevPattern !== PATTERN) {
    setPrevPattern(PATTERN);
    setBoard(makeEmptyBoard(SIZE));
  }

  const solved = React.useMemo(
    () =>
      board.length === SIZE &&
      board.every((row, r) =>
        row.every((cell, c) => cell === (PATTERN[r][c] === 1)),
      ),
    [board, PATTERN, SIZE],
  );

  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  /* Win side effects: these talk to external systems, which is what effects are for */
  useEffect(() => {
    if (solved) {
      SNOW();
      onCompleteRef.current();
      PORTAL_SOUNDS.win.play();
    }
  }, [solved]);

  /* Toggle cell */
  const toggleCell = (r: number, c: number) => {
    if (solved) return;
    PORTAL_SOUNDS.click.play();
    setBoard((prev) => {
      const next = prev.map((row) => [...row]);
      next[r][c] = !next[r][c];
      return next;
    });
  };

  return (
    <>
      <div className="fixed inset-0 bg-white-200 z-0 backdrop-blur-sm">
        <div className="relative text-[#265c42] flex flex-col items-center justify-center w-full h-full">
          <div className="relative w-full bottom-10 md:bottom-12 flex justify-center z-20">
            <img className="absolute w-[6rem] md:w-[8rem] " src={redRibbon} />
          </div>
          <div
            className="md:p-[1rem] p-[.7rem] rounded-t-[3rem]"
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

            <div className="bg-white p-0 md:p-6 border-[1rem] border-[#265c42] border-double">
              <div
                className="
                  grid
                  [--cell:40px] sm:[--cell:50px] md:[--cell:70px]
                  text-base sm:text-2xl md:text-[3.5rem] font-bold leading-none
                "
                style={{
                  // first column = row clues (auto width), then SIZE cells
                  gridTemplateColumns: `auto repeat(${SIZE}, var(--cell))`,
                  // first row = column clues (auto height), then SIZE cells
                  gridTemplateRows: `auto repeat(${SIZE}, var(--cell))`,
                }}
              >
                {/* Top-left empty corner */}
                <div />

                {/* Column clues: stacked, bottom-aligned, centered over each column */}
                {colClues.map((clue, c) => (
                  <div
                    key={`col-${c}`}
                    className="flex flex-col items-center justify-end pb-2 gap-1"
                  >
                    {clue.map((num, j) => (
                      <div key={j}>{num}</div>
                    ))}
                  </div>
                ))}

                {/* Each row: row clue + cells */}
                {PATTERN.map((_, r) => (
                  <React.Fragment key={`row-${r}`}>
                    {/* Row clues: right-aligned, vertically centered on the row */}
                    <div className="flex items-center justify-end gap-2 pr-3 whitespace-nowrap">
                      {rowClues[r].map((num, i) => (
                        <span key={i}>{num}</span>
                      ))}
                    </div>

                    {/* Cells */}
                    {PATTERN[r].map((_, c) => (
                      <div
                        key={`cell-${r}-${c}`}
                        onClick={() => toggleCell(r, c)}
                        className={`
                          box-border border-2 sm:border-3 md:border-4 border-[#3e8948]
                          cursor-pointer transition
                          ${board[r]?.[c] ? "bg-[#265c42]" : "bg-white"}
                        `}
                      />
                    ))}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
