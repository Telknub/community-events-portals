import React, { useState } from "react";
import { Button } from "components/ui/Button";
import { PORTAL_SOUNDS } from "../../Constants";
import { generateSecret, scoreGuess } from "../../lib/PuzzleLogic";
import { CODEBREAKER, PUZZLE_COLORS, levelOf } from "../../lib/PuzzleConfig";
import { BOARD_SIZE, PuzzleFrame, PuzzleProps, useFinish } from "./PuzzleFrame";

interface Row {
  guess: number[];
  exact: number;
  partial: number;
}

export const CodebreakerPuzzle: React.FC<PuzzleProps> = ({ onComplete, difficulty, seconds, onReset }) => {
  const { pegs, colors, tries, unique } = CODEBREAKER[levelOf(difficulty)];
  const [secret, setSecret] = useState(() => generateSecret(pegs, colors, unique));
  const [guess, setGuess] = useState<number[]>(() => Array(pegs).fill(-1));
  const [rows, setRows] = useState<Row[]>([]);
  const [message, setMessage] = useState("");
  const [solved, setSolved] = useState(false);
  const finish = useFinish(onComplete);

  const cycle = (i: number) => {
    if (solved) return;
    PORTAL_SOUNDS.click.play();
    setGuess((g) => g.map((v, k) => (k === i ? (v + 1) % colors : v)));
  };

  const submit = () => {
    if (solved || guess.some((g) => g < 0)) return;
    const { exact, partial } = scoreGuess(secret, guess);
    const next = [...rows, { guess, exact, partial }];
    setRows(next);
    setMessage("");
    if (exact === pegs) {
      setSolved(true);
      finish();
      return;
    }
    if (next.length >= tries) {
      // out of tries: new secret, fresh board (time keeps running)
      setSecret(generateSecret(pegs, colors, unique));
      setRows([]);
      setGuess(Array(pegs).fill(-1));
      setMessage("Out of tries - new code!");
    }
  };

  const peg = (c: number, onClick?: () => void) => (
    <div
      onClick={onClick}
      className={`rounded-full border-2 border-[#262b44] ${onClick ? "cursor-pointer" : ""}`}
      style={{ width: "1.9rem", height: "1.9rem", background: c >= 0 ? PUZZLE_COLORS[c] : "#dfe6f2" }}
    />
  );

  return (
    <PuzzleFrame
      name="codebreaker"
      seconds={seconds}
      difficulty={difficulty}
      onReset={onReset}
      footer={<Button onClick={submit} disabled={guess.some((g) => g < 0)}>Check</Button>}
    >
      <div className="flex flex-col gap-1 items-center overflow-y-auto" style={{ width: BOARD_SIZE, maxHeight: "34vh" }}>
        {rows.map((r, i) => (
          <div key={i} className="flex flex-row items-center gap-1">
            {r.guess.map((c, k) => (
              <React.Fragment key={k}>{peg(c)}</React.Fragment>
            ))}
            <div className="flex flex-row flex-wrap w-[2.4rem] gap-[2px] ml-1">
              {Array.from({ length: pegs }, (_, k) => (
                <div
                  key={k}
                  className="rounded-full border border-[#262b44]"
                  style={{
                    width: "0.9rem",
                    height: "0.9rem",
                    background: k < r.exact ? "#262b44" : k < r.exact + r.partial ? "#ffffff" : "transparent",
                  }}
                />
              ))}
            </div>
          </div>
        ))}
        {message && <span className="text-xs text-[#a22633]">{message}</span>}
      </div>
      <div className="flex flex-row items-center gap-2">
        {guess.map((c, i) => (
          <React.Fragment key={i}>{peg(c, () => cycle(i))}</React.Fragment>
        ))}
      </div>
      <span className="text-[10px]">
        Tries left: {tries - rows.length} - tap a slot to change its colour
      </span>
    </PuzzleFrame>
  );
};
