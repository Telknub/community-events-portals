import React, { useRef, useState } from "react";
import { PORTAL_SOUNDS } from "../../Constants";
import { Sum10Puzzle as Sum10Data, generateSum10 } from "../../lib/PuzzleLogic";
import { SUM10, levelOf } from "../../lib/PuzzleConfig";
import { BOARD_SIZE, PuzzleFrame, PuzzleProps, useFinish, useForceUpdate, useGridPointer } from "./PuzzleFrame";

export const Sum10Puzzle: React.FC<PuzzleProps> = ({ onComplete, difficulty, seconds, onReset }) => {
  const { w, h } = SUM10[levelOf(difficulty)];
  const [puzzle] = useState<Sum10Data>(() => generateSum10(w, h));
  const [cells, setCells] = useState<number[]>(puzzle.cells);
  const start = useRef(-1);
  const current = useRef(-1);
  const rerender = useForceUpdate();
  const finish = useFinish(onComplete);
  const solved = cells.every((c) => c === 0);

  // rectangle between the drag start and the current cell
  const rect = () => {
    if (start.current < 0) return null;
    const x0 = Math.min(start.current % w, current.current % w);
    const x1 = Math.max(start.current % w, current.current % w);
    const y0 = Math.min(Math.floor(start.current / w), Math.floor(current.current / w));
    const y1 = Math.max(Math.floor(start.current / w), Math.floor(current.current / w));
    return { x0, x1, y0, y1 };
  };
  const inRect = (i: number, r: ReturnType<typeof rect>) =>
    !!r && i % w >= r.x0 && i % w <= r.x1 && Math.floor(i / w) >= r.y0 && Math.floor(i / w) <= r.y1;

  const down = (i: number) => {
    if (solved) return;
    start.current = i;
    current.current = i;
    rerender();
  };
  const move = (i: number) => {
    current.current = i;
    rerender();
  };
  const up = () => {
    const r = rect();
    start.current = -1;
    if (r) {
      const picked = cells.map((_, i) => i).filter((i) => inRect(i, r) && cells[i] > 0);
      const sum = picked.reduce((a, i) => a + cells[i], 0);
      if (sum === 10 && picked.length >= 2) {
        PORTAL_SOUNDS.click.play();
        const next = cells.map((c, i) => (picked.includes(i) ? 0 : c));
        setCells(next);
        if (next.every((c) => c === 0)) finish();
      }
    }
    rerender();
  };

  const pointer = useGridPointer(w, h, { down, move, up });
  const r = rect();
  const sel = r ? cells.reduce((a, c, i) => (inRect(i, r) ? a + c : a), 0) : 0;

  return (
    <PuzzleFrame name="sum10" seconds={seconds} difficulty={difficulty} onReset={onReset}>
      <div
        {...pointer}
        className="grid gap-[3px]"
        style={{
          ...pointer.style,
          width: BOARD_SIZE,
          aspectRatio: `${w} / ${h}`,
          gridTemplateColumns: `repeat(${w}, 1fr)`,
        }}
      >
        {cells.map((c, i) => {
          const selected = inRect(i, r);
          return (
            <div
              key={i}
              className="flex items-center justify-center rounded font-bold select-none text-[min(5vw,1.4rem)]"
              style={{
                background: c === 0 ? "transparent" : selected ? (sel === 10 ? "#63c74d" : "#feae34") : "#e43b44",
                color: "white",
                visibility: c === 0 && !selected ? "hidden" : "visible",
              }}
            >
              {c || ""}
            </div>
          );
        })}
      </div>
      <span className="text-[10px]">{r ? `Sum: ${sel}` : "Drag a rectangle that adds up to 10"}</span>
    </PuzzleFrame>
  );
};
