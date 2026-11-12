import React, { useState } from "react";
import { Button } from "components/ui/Button";
import { PORTAL_SOUNDS } from "../../Constants";
import { JugsPuzzle as JugsData, generateJugs, jugPour } from "../../lib/PuzzleLogic";
import { JUGS, levelOf } from "../../lib/PuzzleConfig";
import { BOARD_SIZE, PuzzleFrame, PuzzleProps, useFinish } from "./PuzzleFrame";

export const JugsPuzzle: React.FC<PuzzleProps> = ({ onComplete, difficulty, seconds, onReset }) => {
  const { jugs, cap, min, max } = JUGS[levelOf(difficulty)];
  const [puzzle] = useState<JugsData>(() => generateJugs(jugs, cap, min, max));
  const [levels, setLevels] = useState<number[]>(() => puzzle.caps.map(() => 0));
  const [selected, setSelected] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const finish = useFinish(onComplete);
  const solved = levels.includes(puzzle.target);
  const maxCap = Math.max(...puzzle.caps);

  const apply = (next: number[]) => {
    PORTAL_SOUNDS.click.play();
    setLevels(next);
    setMoves((m) => m + 1);
    setSelected(null);
    if (next.includes(puzzle.target)) finish();
  };
  const fill = (i: number) => !solved && levels[i] < puzzle.caps[i] && apply(levels.map((v, k) => (k === i ? puzzle.caps[i] : v)));
  const empty = (i: number) => !solved && levels[i] > 0 && apply(levels.map((v, k) => (k === i ? 0 : v)));
  const clickJug = (i: number) => {
    if (solved) return;
    if (selected === null) return setSelected(levels[i] > 0 ? i : null);
    if (selected === i) return setSelected(null);
    if (levels[selected] > 0 && levels[i] < puzzle.caps[i]) apply(jugPour(levels, puzzle.caps, selected, i));
    else setSelected(null);
  };

  return (
    <PuzzleFrame name="jugs" seconds={seconds} difficulty={difficulty} onReset={onReset}>
      <span className="text-sm font-bold">
        Goal: exactly {puzzle.target} {puzzle.target === 1 ? "unit" : "units"}
      </span>
      <div className="flex flex-row justify-center items-end gap-4" style={{ width: BOARD_SIZE }}>
        {puzzle.caps.map((c, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div
              onClick={() => clickJug(i)}
              className="relative w-[3.4rem] border-4 rounded-b-xl cursor-pointer overflow-hidden bg-[#eaf4ff]"
              style={{
                height: `${(c / maxCap) * 9}rem`,
                minHeight: "3rem",
                borderColor: selected === i ? "#feae34" : "#262b44",
              }}
            >
              <div
                className="absolute bottom-0 left-0 w-full bg-[#0099db]"
                style={{ height: `${(levels[i] / c) * 100}%`, transition: "height 200ms" }}
              />
              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-[#262b44]">
                {levels[i]}/{c}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <Button onClick={() => fill(i)}>Fill</Button>
              <Button onClick={() => empty(i)}>Empty</Button>
            </div>
          </div>
        ))}
      </div>
      <span className="text-[10px]">Tap a jug, then another one, to pour. Moves: {moves}</span>
    </PuzzleFrame>
  );
};
