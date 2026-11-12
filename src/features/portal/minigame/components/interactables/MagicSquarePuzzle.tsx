import React, { useState } from "react";
import { Button } from "components/ui/Button";
import { PORTAL_SOUNDS } from "../../Constants";
import { generateMagic, isMagic, magicConstant } from "../../lib/PuzzleLogic";
import { MAGIC_SQUARE, levelOf } from "../../lib/PuzzleConfig";
import { BOARD_SIZE, PuzzleFrame, PuzzleProps, useFinish } from "./PuzzleFrame";

export const MagicSquarePuzzle: React.FC<PuzzleProps> = ({ onComplete, difficulty, seconds, onReset }) => {
  const { n, givens } = MAGIC_SQUARE[levelOf(difficulty)];
  const [puzzle] = useState(() => generateMagic(n, givens));
  const [cells, setCells] = useState<number[]>(() => puzzle.solution.map((v, i) => (puzzle.given[i] ? v : 0)));
  const [selected, setSelected] = useState<number | null>(() => puzzle.given.findIndex((g) => !g));
  const finish = useFinish(onComplete);
  const solved = isMagic(cells, n);

  const setValue = (v: number) => {
    if (selected === null || selected < 0 || puzzle.given[selected] || solved) return;
    PORTAL_SOUNDS.click.play();
    const next = cells.map((c, i) => (i === selected ? v : c));
    setCells(next);
    if (isMagic(next, n)) finish();
  };

  const numbers = Array.from({ length: n * n }, (_, i) => i + 1);

  return (
    <PuzzleFrame
      name="magicsquare"
      seconds={seconds}
      difficulty={difficulty}
      onReset={onReset}
      footer={<Button onClick={() => setValue(0)}>Clear</Button>}
    >
      <span className="text-xs font-bold">Target sum: {magicConstant(n)}</span>
      <div
        className="grid gap-1"
        style={{ width: `min(${BOARD_SIZE}, 36vh)`, height: `min(${BOARD_SIZE}, 36vh)`, gridTemplateColumns: `repeat(${n}, 1fr)` }}
      >
        {cells.map((c, i) => (
          <div
            key={i}
            onClick={() => setSelected(i)}
            className="flex items-center justify-center rounded font-bold text-[min(5vw,1.5rem)] cursor-pointer"
            style={{
              background: puzzle.given[i] ? "#8b9bb4" : selected === i ? "#feae34" : "#dfe6f2",
              color: puzzle.given[i] ? "white" : "#262b44",
              outline: selected === i ? "3px solid #262b44" : undefined,
            }}
          >
            {c || ""}
          </div>
        ))}
      </div>
      <div className="flex flex-row flex-wrap justify-center gap-1" style={{ maxWidth: BOARD_SIZE }}>
        {numbers.map((v) => (
          <div
            key={v}
            onClick={() => setValue(v)}
            className="flex items-center justify-center rounded bg-[#0099db] text-white font-bold cursor-pointer w-8 h-8 text-sm"
            style={{ opacity: cells.includes(v) ? 0.35 : 1 }}
          >
            {v}
          </div>
        ))}
      </div>
    </PuzzleFrame>
  );
};
