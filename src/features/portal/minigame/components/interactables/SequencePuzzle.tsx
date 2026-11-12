import React, { useState } from "react";
import { Button } from "components/ui/Button";
import { PORTAL_SOUNDS } from "../../Constants";
import { generateSequence } from "../../lib/PuzzleLogic";
import { SEQUENCE, levelOf } from "../../lib/PuzzleConfig";
import { BOARD_SIZE, PuzzleFrame, PuzzleProps, useFinish } from "./PuzzleFrame";

export const SequencePuzzle: React.FC<PuzzleProps> = ({ onComplete, difficulty, seconds, onReset }) => {
  const level = levelOf(difficulty);
  const { rounds } = SEQUENCE[level];
  const [puzzle, setPuzzle] = useState(() => generateSequence(level));
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");
  const finish = useFinish(onComplete);

  const answer = (v: number) => {
    if (progress >= rounds) return;
    PORTAL_SOUNDS.click.play();
    if (v === puzzle.answer) {
      const next = progress + 1;
      setProgress(next);
      setMessage("");
      if (next >= rounds) finish();
      else setPuzzle(generateSequence(level));
    } else {
      setMessage("Not quite - here is a new one!");
      setPuzzle(generateSequence(level));
    }
  };

  return (
    <PuzzleFrame name="sequence" seconds={seconds} difficulty={difficulty} onReset={onReset}>
      <div className="flex flex-row flex-wrap items-center justify-center gap-2" style={{ width: BOARD_SIZE }}>
        {puzzle.terms.map((t, i) => (
          <div key={i} className="flex items-center justify-center rounded bg-[#dfe6f2] font-bold min-w-[2.6rem] h-[2.6rem] px-1 text-lg">
            {t}
          </div>
        ))}
        <div className="flex items-center justify-center rounded bg-[#feae34] font-bold min-w-[2.6rem] h-[2.6rem] text-lg">?</div>
      </div>
      <div className="flex flex-row gap-2 mt-2">
        {puzzle.options.map((o) => (
          <Button key={o} onClick={() => answer(o)}>
            {o}
          </Button>
        ))}
      </div>
      <span className="text-[10px]">{message || `Solved: ${progress}/${rounds}`}</span>
    </PuzzleFrame>
  );
};
