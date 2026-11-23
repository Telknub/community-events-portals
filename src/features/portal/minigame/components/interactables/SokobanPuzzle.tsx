import React, { useEffect, useState } from "react";
import { Button } from "components/ui/Button";
import { PORTAL_SOUNDS } from "../../Constants";
import {
  DIRS,
  SokobanPuzzle as SokobanData,
  SokobanState,
  generateSokoban,
  sokobanMove,
  sokobanSolved,
} from "../../lib/PuzzleLogic";
import { SOKOBAN, levelOf } from "../../lib/PuzzleConfig";
import { BOARD_SIZE, PuzzleFrame, PuzzleProps, useFinish } from "./PuzzleFrame";
import { useAppTranslation } from "lib/i18n/useAppTranslations";
import { PuzzleControls } from "../hud/PuzzleControl";
import snowman from "public/world/portal/images/SudokuSnowman.webp";
import present from "public/world/portal/images/SudokuPresent.webp";
import tree from "public/world/portal/images/SudokuTree.webp";

export const SokobanPuzzle: React.FC<PuzzleProps> = ({
  onComplete,
  difficulty,
  seconds,
  onReset,
}) => {
  const { t } = useAppTranslation();
  const { size, boxes, steps } = SOKOBAN[levelOf(difficulty)];
  const [puzzle] = useState<SokobanData>(() =>
    generateSokoban(size, boxes, steps),
  );
  const [state, setState] = useState<SokobanState>({
    boxes: puzzle.boxes,
    player: puzzle.player,
  });
  const [history, setHistory] = useState<SokobanState[]>([]);
  const finish = useFinish(onComplete);
  const solved = sokobanSolved(state.boxes, puzzle.targets);
  const initialPlayer = puzzle.player;

  const go = (dir: number) => {
    if (solved) return;
    const next = sokobanMove(puzzle.walls, size, state, DIRS[dir]);
    if (!next) return;
    PORTAL_SOUNDS.click.play();
    setHistory((h) => [...h, state]);
    setState(next);
    if (sokobanSolved(next.boxes, puzzle.targets)) finish();
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
  }, [state, solved]);

  const undo = () => {
    if (!history.length) return;
    setState(history[history.length - 1]);
    setHistory((h) => h.slice(0, -1));
  };
  const restart = () => {
    setState({ boxes: puzzle.boxes, player: puzzle.player });
    setHistory([]);
  };

  return (
    <PuzzleFrame
      name="sokoban"
      seconds={seconds}
      difficulty={difficulty}
      onReset={onReset}
      footer={
        <>
          <div className="flex flex-col items-center justify-center gap-3">
            <PuzzleControls go={go} />
            <div className="flex flex-row gap-3">
              <Button onClick={undo} disabled={!history.length}>
                {t("holiday-puzzle-2026.undo")}
              </Button>
              <Button onClick={restart}>
                {t("holiday-puzzle-2026.restart")}
              </Button>
            </div>
          </div>
        </>
      }
    >
      <div
        className="grid gap-[2px] bg-[#262b44] p-[2px] rounded"
        style={{
          width: BOARD_SIZE,
          height: BOARD_SIZE,
          gridTemplateColumns: `repeat(${size}, 1fr)`,
          gridTemplateRows: `repeat(${size}, minmax(0, 1fr))`,
        }}
      >
        {Array.from({ length: size * size }, (_, i) => {
          const isTarget = puzzle.targets.includes(i);
          const hasBox = state.boxes.includes(i);
          const isPlayerSpawn = i === initialPlayer;
          return (
            <div
              key={i}
              className="flex items-center justify-center text-[min(5vw,1.6rem)] leading-none"
              style={{
                background: puzzle.walls[i]
                  ? "#5a6988"
                  : isPlayerSpawn
                    ? "#b8e6b5"
                    : isTarget
                      ? "#f9c9c9"
                      : "#e8f6ff",
                outline: isTarget ? "2px solid #e43b44" : undefined,
                outlineOffset: -2,
              }}
            >
              {i === state.player ? (
                <img
                  src={snowman}
                  className="w-[28px] h-[28px] object-contain"
                />
              ) : hasBox ? (
                <img
                  src={present}
                  className="w-[28px] h-[28px] object-contain"
                />
              ) : puzzle.walls[i] ? (
                <img src={tree} className="w-[28px] h-[28px] object-contain" />
              ) : (
                ""
              )}
            </div>
          );
        })}
      </div>
    </PuzzleFrame>
  );
};
