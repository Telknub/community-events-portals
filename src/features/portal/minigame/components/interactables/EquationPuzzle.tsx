import React, { useState } from "react";
import { PORTAL_SOUNDS } from "../../Constants";
import { EquationPuzzle as EquationData, evalExpr, generateEquation } from "../../lib/PuzzleLogic";
import { EQUATION, levelOf } from "../../lib/PuzzleConfig";
import { BOARD_SIZE, PuzzleFrame, PuzzleProps, useFinish } from "./PuzzleFrame";

const SYMBOL: Record<string, string> = { "+": "+", "-": "−", "*": "×", "/": "÷" };

export const EquationPuzzle: React.FC<PuzzleProps> = ({ onComplete, difficulty, seconds, onReset }) => {
  const { nums, ops: allowed } = EQUATION[levelOf(difficulty)];
  const [puzzle] = useState<EquationData>(() => generateEquation(nums, allowed));
  const [ops, setOps] = useState<string[]>(puzzle.start);
  const finish = useFinish(onComplete);
  const value = evalExpr(puzzle.nums, ops);
  const solved = value === puzzle.target;

  const cycle = (i: number) => {
    if (solved) return;
    PORTAL_SOUNDS.click.play();
    const next = ops.map((o, k) => (k === i ? allowed[(allowed.indexOf(o) + 1) % allowed.length] : o));
    setOps(next);
    if (evalExpr(puzzle.nums, next) === puzzle.target) finish();
  };

  const box = "flex items-center justify-center rounded font-bold text-[min(6vw,1.8rem)]";

  return (
    <PuzzleFrame name="equation" seconds={seconds} difficulty={difficulty} onReset={onReset}>
      <div className="flex flex-row flex-wrap items-center justify-center gap-2" style={{ width: BOARD_SIZE }}>
        {puzzle.nums.map((n, i) => (
          <React.Fragment key={i}>
            <div className={`${box} bg-[#dfe6f2]`} style={{ width: "2.6rem", height: "2.6rem" }}>
              {n}
            </div>
            {i < ops.length && (
              <div
                onClick={() => cycle(i)}
                className={`${box} cursor-pointer text-white`}
                style={{ width: "2.6rem", height: "2.6rem", background: "#0099db", border: "2px solid #262b44" }}
              >
                {SYMBOL[ops[i]]}
              </div>
            )}
          </React.Fragment>
        ))}
        <div className={`${box}`} style={{ width: "2.6rem", height: "2.6rem" }}>
          =
        </div>
        <div className={`${box} text-white`} style={{ minWidth: "2.6rem", height: "2.6rem", background: "#e43b44" }}>
          {puzzle.target}
        </div>
      </div>
      <span className="text-[10px]">Current result: {Number.isNaN(value) ? "-" : Number.isInteger(value) ? value : value.toFixed(2)}</span>
    </PuzzleFrame>
  );
};
