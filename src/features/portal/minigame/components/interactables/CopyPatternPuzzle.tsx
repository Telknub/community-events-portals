import React, { useEffect, useState } from "react";
import { Button } from "components/ui/Button";
import { PORTAL_SOUNDS } from "../../Constants";
import { range, shuffle } from "../../lib/PuzzleLogic";
import { COPY_PATTERN, levelOf } from "../../lib/PuzzleConfig";
import { BOARD_SIZE, PuzzleFrame, PuzzleProps, useFinish } from "./PuzzleFrame";

export const CopyPatternPuzzle: React.FC<PuzzleProps> = ({ onComplete, difficulty, seconds, onReset }) => {
  const { size, lit, show } = COPY_PATTERN[levelOf(difficulty)];
  const [pattern] = useState<boolean[]>(() => {
    const on = new Set(shuffle(range(size * size)).slice(0, lit));
    return range(size * size).map((i) => on.has(i));
  });
  const [memorizing, setMemorizing] = useState(true);
  const [cells, setCells] = useState<boolean[]>(() => Array(size * size).fill(false));
  const finish = useFinish(onComplete);
  const solved = !memorizing && cells.every((c, i) => c === pattern[i]);

  useEffect(() => {
    const t = setTimeout(() => setMemorizing(false), show);
    return () => clearTimeout(t);
  }, []);

  const toggle = (i: number) => {
    if (memorizing || solved) return;
    PORTAL_SOUNDS.click.play();
    const next = cells.map((c, k) => (k === i ? !c : c));
    setCells(next);
    if (next.every((c, k) => c === pattern[k])) finish();
  };

  const shown = memorizing ? pattern : cells;

  return (
    <PuzzleFrame
      name="copypattern"
      seconds={seconds}
      difficulty={difficulty}
      onReset={onReset}
      footer={<Button onClick={() => setCells(cells.map(() => false))} disabled={memorizing}>Clear</Button>}
    >
      <div
        className="grid gap-1"
        style={{ width: BOARD_SIZE, height: BOARD_SIZE, gridTemplateColumns: `repeat(${size}, 1fr)` }}
      >
        {shown.map((on, i) => (
          <div
            key={i}
            onClick={() => toggle(i)}
            className="rounded cursor-pointer transition-colors duration-100"
            style={{ background: on ? (memorizing ? "#feae34" : "#63c74d") : "#3a4466" }}
          />
        ))}
      </div>
      <span className="text-[10px]">{memorizing ? "Memorise the pattern..." : "Now copy it!"}</span>
    </PuzzleFrame>
  );
};
