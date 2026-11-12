import React, { useState } from "react";
import { Button } from "components/ui/Button";
import { PORTAL_SOUNDS } from "../../Constants";
import { canPour, generateColorSort, pour, tubesSolved, Tubes } from "../../lib/PuzzleLogic";
import { COLOR_SORT, COLOR_SORT_CAPACITY as CAP, PUZZLE_COLORS, levelOf } from "../../lib/PuzzleConfig";
import { BOARD_SIZE, PuzzleFrame, PuzzleProps, useFinish } from "./PuzzleFrame";

export const ColorSortPuzzle: React.FC<PuzzleProps> = ({ onComplete, difficulty, seconds, onReset }) => {
  const { colors, empty } = COLOR_SORT[levelOf(difficulty)];
  const [tubes, setTubes] = useState<Tubes>(() => generateColorSort(colors, empty, CAP));
  const [history, setHistory] = useState<Tubes[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const finish = useFinish(onComplete);

  const click = (i: number) => {
    if (tubesSolved(tubes, CAP)) return;
    if (selected === null) {
      if (tubes[i].length) setSelected(i);
      return;
    }
    if (selected === i) return setSelected(null);
    if (canPour(tubes, selected, i, CAP)) {
      PORTAL_SOUNDS.click.play();
      const next = pour(tubes, selected, i, CAP);
      setHistory((h) => [...h, tubes]);
      setTubes(next);
      setSelected(null);
      if (tubesSolved(next, CAP)) finish();
    } else {
      setSelected(tubes[i].length ? i : null);
    }
  };

  const undo = () => {
    if (!history.length) return;
    setTubes(history[history.length - 1]);
    setHistory((h) => h.slice(0, -1));
    setSelected(null);
  };

  return (
    <PuzzleFrame
      name="colorsort"
      seconds={seconds}
      difficulty={difficulty}
      onReset={onReset}
      footer={<Button onClick={undo} disabled={!history.length}>Undo</Button>}
    >
      <div className="flex flex-row flex-wrap justify-center items-end gap-3" style={{ width: BOARD_SIZE }}>
        {tubes.map((tube, i) => (
          <div
            key={i}
            onClick={() => click(i)}
            className="flex flex-col-reverse items-center gap-[2px] p-[3px] rounded-b-2xl border-2 cursor-pointer"
            style={{
              width: "2.4rem",
              height: `${CAP * 2.1 + 0.6}rem`,
              borderColor: selected === i ? "#feae34" : "#8b9bb4",
              background: selected === i ? "#feae3433" : "#e8f1ff",
              transform: selected === i ? "translateY(-6px)" : undefined,
              transition: "transform 120ms",
            }}
          >
            {tube.map((c, k) => (
              <div key={k} className="rounded-full" style={{ width: "1.8rem", height: "1.8rem", background: PUZZLE_COLORS[c] }} />
            ))}
          </div>
        ))}
      </div>
    </PuzzleFrame>
  );
};
