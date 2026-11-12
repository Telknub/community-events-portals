import React, { useState } from "react";
import { Button } from "components/ui/Button";
import { PORTAL_SOUNDS } from "../../Constants";
import { generateRings, range, ringsMove, ringsSolved, shuffle } from "../../lib/PuzzleLogic";
import { PUZZLE_COLORS, RINGS, levelOf } from "../../lib/PuzzleConfig";
import { BOARD_SIZE, PuzzleFrame, PuzzleProps, useFinish } from "./PuzzleFrame";

// ring sector as an SVG path (angles in radians, 0 = 3 o'clock)
const sector = (r0: number, r1: number, a0: number, a1: number) => {
  const p = (r: number, a: number) => `${100 + r * Math.cos(a)} ${100 + r * Math.sin(a)}`;
  return `M${p(r1, a0)} A${r1} ${r1} 0 0 1 ${p(r1, a1)} L${p(r0, a1)} A${r0} ${r0} 0 0 0 ${p(r0, a0)} Z`;
};

export const RingsPuzzle: React.FC<PuzzleProps> = ({ onComplete, difficulty, seconds, onReset }) => {
  const { rings, seg, coupled, scramble } = RINGS[levelOf(difficulty)];
  const [base] = useState(() => shuffle(range(PUZZLE_COLORS.length)).slice(0, seg)); // colour of each sector
  const [offsets, setOffsets] = useState(() => generateRings(rings, seg, coupled, scramble));
  const finish = useFinish(onComplete);
  const solved = ringsSolved(offsets);

  const rotate = (ring: number, dir: 1 | -1) => {
    if (solved) return;
    PORTAL_SOUNDS.click.play();
    const next = ringsMove(offsets, ring, dir, coupled, seg);
    setOffsets(next);
    if (ringsSolved(next)) finish();
  };

  const inner = 22;
  const thickness = (96 - inner) / rings;

  return (
    <PuzzleFrame
      name="rings"
      seconds={seconds}
      difficulty={difficulty}
      onReset={onReset}
      footer={
        <div className="flex flex-col gap-1 items-center">
          {Array.from({ length: rings }, (_, r) => (
            <div key={r} className="flex flex-row items-center gap-2">
              <Button onClick={() => rotate(r, -1)}>↺</Button>
              <span className="text-[10px] w-10 text-center">Ring {r + 1}</span>
              <Button onClick={() => rotate(r, 1)}>↻</Button>
            </div>
          ))}
        </div>
      }
    >
      <svg viewBox="0 0 200 200" style={{ width: `min(${BOARD_SIZE}, 30vh)`, height: `min(${BOARD_SIZE}, 30vh)` }}>
        {Array.from({ length: rings }, (_, r) => {
          const r1 = 96 - r * thickness;
          const r0 = r1 - thickness + 1.5;
          return Array.from({ length: seg }, (_, j) => {
            const a0 = -Math.PI / 2 + (j * 2 * Math.PI) / seg;
            const a1 = -Math.PI / 2 + ((j + 1) * 2 * Math.PI) / seg;
            return (
              <path
                key={`${r}-${j}`}
                d={sector(r0, r1, a0 + 0.01, a1 - 0.01)}
                fill={PUZZLE_COLORS[base[(j + offsets[r]) % seg]]}
                stroke="#262b44"
                strokeWidth={1.5}
                onClick={() => rotate(r, 1)}
                style={{ cursor: "pointer" }}
              />
            );
          });
        })}
        <circle cx={100} cy={100} r={inner - 4} fill={solved ? "#63c74d" : "#262b44"} />
      </svg>
    </PuzzleFrame>
  );
};
