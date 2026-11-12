import React, { useEffect, useState } from "react";
import { Button } from "components/ui/Button";
import { PORTAL_SOUNDS } from "../../Constants";
import { DIRS, IcePuzzle as IceData, generateIce, iceSlide } from "../../lib/PuzzleLogic";
import { ICE, levelOf } from "../../lib/PuzzleConfig";
import { BOARD_SIZE, PuzzleFrame, PuzzleProps, useFinish } from "./PuzzleFrame";

export const IcePuzzle: React.FC<PuzzleProps> = ({ onComplete, difficulty, seconds, onReset }) => {
  const { size, rocks, min, max } = ICE[levelOf(difficulty)];
  const [puzzle] = useState<IceData>(() => generateIce(size, rocks, min, max));
  const [pos, setPos] = useState(puzzle.start);
  const [moves, setMoves] = useState(0);
  const finish = useFinish(onComplete);
  const solved = pos === puzzle.goal;

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
      const dir = { ArrowUp: 0, ArrowRight: 1, ArrowDown: 2, ArrowLeft: 3 }[e.key];
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
        <>
          <Button onClick={() => go(3)}>◀</Button>
          <div className="flex flex-col gap-1">
            <Button onClick={() => go(0)}>▲</Button>
            <Button onClick={() => go(2)}>▼</Button>
          </div>
          <Button onClick={() => go(1)}>▶</Button>
          <Button onClick={restart}>↺</Button>
        </>
      }
    >
      <div
        className="grid gap-[2px] bg-[#8ecbea] p-[2px] rounded"
        style={{ width: BOARD_SIZE, height: BOARD_SIZE, gridTemplateColumns: `repeat(${size}, 1fr)` }}
      >
        {Array.from({ length: size * size }, (_, i) => (
          <div
            key={i}
            className="flex items-center justify-center text-[min(5vw,1.6rem)] leading-none"
            style={{ background: puzzle.rocks[i] ? "#5a6988" : "#e8f6ff" }}
          >
            {i === pos ? "🎅" : i === puzzle.goal ? "⭐" : puzzle.rocks[i] ? "🪨" : ""}
          </div>
        ))}
      </div>
      <span className="text-[10px]">Moves: {moves}</span>
    </PuzzleFrame>
  );
};
