import React, { useEffect, useState } from "react";
import { Button } from "components/ui/Button";
import { PORTAL_SOUNDS } from "../../Constants";
import {
  DIRS,
  IcePuzzle as IceData,
  generateIce,
  iceSlide,
} from "../../lib/PuzzleLogic";
import { ICE, levelOf } from "../../lib/PuzzleConfig";
import { BOARD_SIZE, PuzzleFrame, PuzzleProps, useFinish } from "./PuzzleFrame";
import { useAppTranslation } from "lib/i18n/useAppTranslations";
import { isTouchDevice } from "features/world/lib/device";
import snowman from "public/world/portal/images/SudokuSnowman.webp";
import present from "public/world/portal/images/SudokuPresent.webp";
import tree from "public/world/portal/images/SudokuTree.webp";
import { PuzzleControls } from "../hud/PuzzleControl";

export const IcePuzzle: React.FC<PuzzleProps> = ({
  onComplete,
  difficulty,
  seconds,
  onReset,
}) => {
  const { t } = useAppTranslation();
  const { size, rocks, min, max } = ICE[levelOf(difficulty)];
  const [puzzle] = useState<IceData>(() => generateIce(size, rocks, min, max));
  const [pos, setPos] = useState(puzzle.start);
  const [moves, setMoves] = useState(0);
  const finish = useFinish(onComplete);
  const solved = pos === puzzle.goal;
  const initialPlayer = puzzle.start;

  const go = (dir: number) => {
    if (solved) return;
    const next = iceSlide(puzzle.rocks, size, puzzle.goal, pos, DIRS[dir]);
    if (next === pos) return;
    PORTAL_SOUNDS.click.play();
    setPos(next);
    setMoves((m) => m + 1);
    if (next === puzzle.goal) finish();
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const dir = { ArrowUp: 0, ArrowRight: 1, ArrowDown: 2, ArrowLeft: 3 }[
        e.key
      ];
      if (dir === undefined) return;
      e.preventDefault();
      go(dir);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pos, solved]);

  const restart = () => {
    setPos(puzzle.start);
    setMoves(0);
  };

  return (
    <PuzzleFrame
      name="ice"
      seconds={seconds}
      difficulty={difficulty}
      onReset={onReset}
      footer={
        <div className="flex flex-col items-center justify-center gap-3">
          <PuzzleControls go={go} />
          <Button onClick={restart} className={isTouchDevice() ? "w-full" : ""}>
            {t("holiday-puzzle-2026.restart")}
          </Button>
        </div>
      }
    >
      <div
        className="grid gap-[2px] bg-[#8ecbea] p-[2px] rounded"
        style={{
          width: BOARD_SIZE,
          height: BOARD_SIZE,
          gridTemplateColumns: `repeat(${size}, 1fr)`,
          gridTemplateRows: `repeat(${size}, minmax(0, 1fr))`,
        }}
      >
        {Array.from({ length: size * size }, (_, i) => (
          <div
            key={i}
            className="flex items-center justify-center text-[min(5vw,1.6rem)] leading-none"
            style={{
              background: puzzle.rocks[i]
                ? "#5a6988"
                : i === initialPlayer
                  ? "#b8e6b5"
                  : "#e8f6ff",
            }}
          >
            {i === pos ? (
              <img src={snowman} className="w-[28px] h-[28px] object-contain" />
            ) : i === puzzle.goal ? (
              <img src={present} className="w-[28px] h-[28px] object-contain" />
            ) : puzzle.rocks[i] ? (
              <img src={tree} className="w-[28px] h-[28px] object-contain" />
            ) : (
              ""
            )}
          </div>
        ))}
      </div>
      <span className="text-[18px] md:text-xs mr-auto">{moves}</span>
    </PuzzleFrame>
  );
};
