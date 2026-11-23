import React, { useEffect, useState } from "react";
import { Button } from "components/ui/Button";
import { PORTAL_SOUNDS } from "../../Constants";
import { floodDone, floodFill, generateFlood } from "../../lib/PuzzleLogic";
import { FLOODIT, PUZZLE_COLORS, levelOf } from "../../lib/PuzzleConfig";
import { BOARD_SIZE, PuzzleFrame, PuzzleProps, useFinish } from "./PuzzleFrame";
import { useAppTranslation } from "lib/i18n/useAppTranslations";

export const FloodPuzzle: React.FC<PuzzleProps> = ({
  onComplete,
  difficulty,
  seconds,
  onReset,
}) => {
  const { t } = useAppTranslation();
  const { size, colors, slack } = FLOODIT[levelOf(difficulty)];
  const [puzzle] = useState(() => generateFlood(size, colors, slack));
  const [grid, setGrid] = useState<number[]>(puzzle.grid);
  const [movesLeft, setMovesLeft] = useState(puzzle.limit);
  const [message, setMessage] = useState("");
  const finish = useFinish(onComplete);
  const solved = floodDone(grid);

  const restart = () => {
    setGrid(puzzle.grid);
    setMovesLeft(puzzle.limit);
    setMessage("");
  };

  // out of moves -> restart the same board after a short pause
  useEffect(() => {
    if (solved || movesLeft > 0) return;

    const timeout = setTimeout(() => {
      setMessage("No moves left - restarting!");
      restart();
    }, 900);

    return () => clearTimeout(timeout);
  }, [movesLeft, solved]);

  const choose = (c: number) => {
    if (solved || movesLeft <= 0 || c === grid[0]) return;
    PORTAL_SOUNDS.click.play();
    const next = floodFill(grid, size, c);
    setGrid(next);
    setMovesLeft((m) => m - 1);
    if (floodDone(next)) finish();
  };

  return (
    <PuzzleFrame
      name="floodit"
      seconds={seconds}
      difficulty={difficulty}
      onReset={onReset}
      footer={
        <>
          {Array.from({ length: colors }, (_, c) => (
            <div
              key={c}
              onClick={() => choose(c)}
              className="rounded-full border-2 border-[#262b44] cursor-pointer"
              style={{
                width: "2.2rem",
                height: "2.2rem",
                background: PUZZLE_COLORS[c],
                opacity: c === grid[0] ? 0.35 : 1,
              }}
            />
          ))}
          <Button onClick={restart}>{t("holiday-puzzle-2026.restart")}</Button>
        </>
      }
    >
      <div
        className="grid"
        style={{
          width: BOARD_SIZE,
          height: BOARD_SIZE,
          gridTemplateColumns: `repeat(${size}, 1fr)`,
        }}
      >
        {grid.map((c, i) => (
          <div
            key={i}
            style={{
              background: PUZZLE_COLORS[c],
              transition: "background 120ms",
            }}
          />
        ))}
      </div>
      <span className="text-[18px] md:text-xs mr-auto">
        {message || t("holiday-puzzle-2026.movesLeft") + ` ${movesLeft}`}
      </span>
    </PuzzleFrame>
  );
};
