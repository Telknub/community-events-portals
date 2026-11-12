import React, { useRef, useState } from "react";
import { PORTAL_SOUNDS } from "../../Constants";
import { FlowPuzzle as FlowData, flowSolved, generateFlow, neighbors } from "../../lib/PuzzleLogic";
import { FLOW, PUZZLE_COLORS, levelOf } from "../../lib/PuzzleConfig";
import { BOARD_SIZE, PuzzleFrame, PuzzleProps, useFinish, useForceUpdate, useGridPointer } from "./PuzzleFrame";

export const FlowPuzzle: React.FC<PuzzleProps> = ({ onComplete, difficulty, seconds, onReset }) => {
  const { size, pairs } = FLOW[levelOf(difficulty)];
  const [puzzle] = useState<FlowData>(() => generateFlow(size, pairs));
  const paths = useRef<Record<number, number[]>>({});
  const active = useRef<number | null>(null);
  const rerender = useForceUpdate();
  const finish = useFinish(onComplete);
  const [solved, setSolved] = useState(false);

  const endpointOf = (cell: number) => puzzle.pairs.findIndex((p) => p.includes(cell));
  const ownerOf = (cell: number) =>
    Object.keys(paths.current).find((k) => paths.current[Number(k)].includes(cell));

  const down = (i: number) => {
    if (solved) return;
    const e = endpointOf(i);
    if (e >= 0) {
      paths.current[e] = [i]; // (re)start this colour from the tapped endpoint
      active.current = e;
    } else {
      const k = Object.keys(paths.current).find((key) => {
        const p = paths.current[Number(key)];
        return p[p.length - 1] === i;
      });
      active.current = k === undefined ? null : Number(k); // continue from the tip of a path
    }
    rerender();
  };

  const move = (i: number) => {
    const k = active.current;
    if (k === null || solved) return;
    const path = paths.current[k];
    const last = path[path.length - 1];
    if (!neighbors(last, size, size).includes(i)) return;
    if (path.length >= 2 && path[path.length - 2] === i) {
      path.pop(); // backtrack
    } else if (path.includes(i)) {
      paths.current[k] = path.slice(0, path.indexOf(i) + 1); // loop -> cut
    } else {
      const e = endpointOf(i);
      if (e >= 0 && e !== k) return; // cannot enter another colour's endpoint
      const other = ownerOf(i);
      if (other !== undefined && Number(other) !== k) {
        const op = paths.current[Number(other)];
        paths.current[Number(other)] = op.slice(0, op.indexOf(i)); // cut the other path
      }
      path.push(i);
      PORTAL_SOUNDS.click.play();
      if (e === k) active.current = null; // reached the twin: stop extending
    }
    rerender();
  };

  const up = () => {
    active.current = null;
    if (flowSolved(paths.current, puzzle.pairs)) {
      setSolved(true);
      finish();
    }
    rerender();
  };

  const pointer = useGridPointer(size, size, { down, move, up });

  return (
    <PuzzleFrame name="flow" seconds={seconds} difficulty={difficulty} onReset={onReset}>
      <div
        {...pointer}
        className="grid gap-[2px] bg-[#262b44] p-[2px] rounded"
        style={{ ...pointer.style, width: BOARD_SIZE, height: BOARD_SIZE, gridTemplateColumns: `repeat(${size}, 1fr)` }}
      >
        {Array.from({ length: size * size }, (_, i) => {
          const owner = ownerOf(i);
          const e = endpointOf(i);
          const color = e >= 0 ? PUZZLE_COLORS[e] : owner !== undefined ? PUZZLE_COLORS[Number(owner)] : undefined;
          return (
            <div
              key={i}
              className="flex items-center justify-center"
              style={{ background: owner !== undefined ? `${PUZZLE_COLORS[Number(owner)]}66` : "#1b1f33" }}
            >
              {color && (
                <div
                  className="rounded-full"
                  style={{ width: e >= 0 ? "70%" : "30%", height: e >= 0 ? "70%" : "30%", background: color }}
                />
              )}
            </div>
          );
        })}
      </div>
    </PuzzleFrame>
  );
};
