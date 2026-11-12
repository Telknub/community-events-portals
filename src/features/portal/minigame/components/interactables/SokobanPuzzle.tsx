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

export const SokobanPuzzle: React.FC<PuzzleProps> = ({ onComplete, difficulty, seconds, onReset }) => {
  const { size, boxes, steps } = SOKOBAN[levelOf(difficulty)];
  const [puzzle] = useState<SokobanData>(() => generateSokoban(size, boxes, steps));
  const [state, setState] = useState<SokobanState>({ boxes: puzzle.boxes, player: puzzle.player });
  const [history, setHistory] = useState<SokobanState[]>([]);
  const finish = useFinish(onComplete);
  const solved = sokobanSolved(state.boxes, puzzle.targets);

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
      const dir = { ArrowUp: 0, ArrowRight: 1, ArrowDown: 2, ArrowLeft: 3 }[e.key];
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
          <Button onClick={() => go(3)}>◀</Button>
          <div className="flex flex-col gap-1">
            <Button onClick={() => go(0)}>▲</Button>
            <Button onClick={() => go(2)}>▼</Button>
          </div>
          <Button onClick={() => go(1)}>▶</Button>
          <Button onClick={undo} disabled={!history.length}>Undo</Button>
          <Button onClick={restart}>↺</Button>
        </>
      }
    >
      <div
        className="grid gap-[2px] bg-[#262b44] p-[2px] rounded"
        style={{ width: BOARD_SIZE, height: BOARD_SIZE, gridTemplateColumns: `repeat(${size}, 1fr)` }}
      >
        {Array.from({ length: size * size }, (_, i) => {
          const isTarget = puzzle.targets.includes(i);
          const hasBox = state.boxes.includes(i);
          return (
            <div
              key={i}
              className="flex items-center justify-center text-[min(5vw,1.6rem)] leading-none"
              style={{
                background: puzzle.walls[i] ? "#5a6988" : isTarget ? "#f9c9c9" : "#e8f1e0",
                outline: isTarget ? "2px solid #e43b44" : undefined,
                outlineOffset: -2,
              }}
            >
              {i === state.player ? "🎅" : hasBox ? "🎁" : puzzle.walls[i] ? "🧱" : ""}
            </div>
          );
        })}
      </div>
    </PuzzleFrame>
  );
};
