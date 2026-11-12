import React, { useState } from "react";
import { PORTAL_SOUNDS } from "../../Constants";
import { OddCell, OddRound, generateOdd } from "../../lib/PuzzleLogic";
import { ODD_ONE, levelOf } from "../../lib/PuzzleConfig";
import { BOARD_SIZE, PuzzleFrame, PuzzleProps, useFinish } from "./PuzzleFrame";

const star = Array.from({ length: 10 }, (_, i) => {
  const r = i % 2 === 0 ? 42 : 18;
  const a = (Math.PI * i) / 5 - Math.PI / 2;
  return `${50 + r * Math.cos(a)},${50 + r * Math.sin(a)}`;
}).join(" ");
const hexagon = Array.from({ length: 6 }, (_, i) => {
  const a = (Math.PI * i) / 3;
  return `${50 + 40 * Math.cos(a)},${50 + 40 * Math.sin(a)}`;
}).join(" ");

const Shape: React.FC<{ cell: OddCell }> = ({ cell }) => {
  const fill = `hsl(${cell.hue}, 70%, 55%)`;
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <g transform={`rotate(${cell.rot} 50 50)`} fill={fill}>
        {cell.shape === "circle" && <circle cx={50} cy={50} r={38} />}
        {cell.shape === "square" && <rect x={14} y={14} width={72} height={72} rx={6} />}
        {cell.shape === "triangle" && <polygon points="50,10 90,86 10,86" />}
        {cell.shape === "star" && <polygon points={star} />}
        {cell.shape === "hexagon" && <polygon points={hexagon} />}
      </g>
    </svg>
  );
};

export const OddOnePuzzle: React.FC<PuzzleProps> = ({ onComplete, difficulty, seconds, onReset }) => {
  const { size, rounds, delta, kinds } = ODD_ONE[levelOf(difficulty)];
  const [round, setRound] = useState<OddRound>(() => generateOdd(size, delta, kinds));
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");
  const finish = useFinish(onComplete);

  const click = (i: number) => {
    if (progress >= rounds) return;
    PORTAL_SOUNDS.click.play();
    if (i === round.odd) {
      const next = progress + 1;
      setProgress(next);
      setMessage("");
      if (next >= rounds) finish();
      else setRound(generateOdd(size, delta, kinds));
    } else {
      setMessage("Wrong tile - new board!");
      setRound(generateOdd(size, delta, kinds));
    }
  };

  return (
    <PuzzleFrame name="oddone" seconds={seconds} difficulty={difficulty} onReset={onReset}>
      <div
        className="grid gap-1"
        style={{ width: BOARD_SIZE, height: BOARD_SIZE, gridTemplateColumns: `repeat(${size}, 1fr)` }}
      >
        {round.cells.map((c, i) => (
          <div key={i} onClick={() => click(i)} className="cursor-pointer rounded bg-[#f1f4fa] p-[6%]">
            <Shape cell={c} />
          </div>
        ))}
      </div>
      <span className="text-[10px]">{message || `Found: ${progress}/${rounds}`}</span>
    </PuzzleFrame>
  );
};
