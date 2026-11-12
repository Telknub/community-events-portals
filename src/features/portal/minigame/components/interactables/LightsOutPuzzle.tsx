import React, { useState } from "react";
import { PORTAL_SOUNDS } from "../../Constants";
import { generateLights, lightsToggle } from "../../lib/PuzzleLogic";
import { LIGHTS_OUT, levelOf } from "../../lib/PuzzleConfig";
import { BOARD_SIZE, PuzzleFrame, PuzzleProps, useFinish } from "./PuzzleFrame";

export const LightsOutPuzzle: React.FC<PuzzleProps> = ({ onComplete, difficulty, seconds, onReset }) => {
  const { size, presses } = LIGHTS_OUT[levelOf(difficulty)];
  const [cells, setCells] = useState<boolean[]>(() => generateLights(size, presses));
  const finish = useFinish(onComplete);
  const solved = cells.every((c) => !c);

  const press = (i: number) => {
    if (solved) return;
    PORTAL_SOUNDS.click.play();
    const next = lightsToggle(cells, size, i);
    setCells(next);
    if (next.every((c) => !c)) finish();
  };

  return (
    <PuzzleFrame name="lightsout" seconds={seconds} difficulty={difficulty} onReset={onReset}>
      <div
        className="grid gap-1"
        style={{ width: BOARD_SIZE, height: BOARD_SIZE, gridTemplateColumns: `repeat(${size}, 1fr)` }}
      >
        {cells.map((on, i) => (
          <div
            key={i}
            onClick={() => press(i)}
            className="rounded-full cursor-pointer transition-all duration-150"
            style={{
              background: on ? "#feae34" : "#3a4466",
              boxShadow: on ? "0 0 14px 3px #feae34aa" : "inset 0 0 6px #0008",
            }}
          />
        ))}
      </div>
    </PuzzleFrame>
  );
};
