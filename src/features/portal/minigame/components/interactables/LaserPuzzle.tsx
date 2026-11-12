import React, { useState } from "react";
import { PORTAL_SOUNDS } from "../../Constants";
import { LaserPuzzle as LaserData, generateLaser, traceLaser } from "../../lib/PuzzleLogic";
import { LASER, levelOf } from "../../lib/PuzzleConfig";
import { BOARD_SIZE, PuzzleFrame, PuzzleProps, useFinish } from "./PuzzleFrame";

export const LaserPuzzle: React.FC<PuzzleProps> = ({ onComplete, difficulty, seconds, onReset }) => {
  const { size, turns, decoys } = LASER[levelOf(difficulty)];
  const [puzzle] = useState<LaserData>(() => generateLaser(size, turns, decoys));
  const [mirrors, setMirrors] = useState<number[]>(puzzle.mirrors);
  const finish = useFinish(onComplete);
  const { pts, hit } = traceLaser(mirrors, size, puzzle.row, puzzle.target);

  const flip = (i: number) => {
    if (hit || mirrors[i] === 0) return;
    PORTAL_SOUNDS.click.play();
    const next = mirrors.map((m, k) => (k === i ? (m === 1 ? 2 : 1) : m));
    setMirrors(next);
    if (traceLaser(next, size, puzzle.row, puzzle.target).hit) finish();
  };

  const tx = (puzzle.target % size) + 0.5;
  const ty = Math.floor(puzzle.target / size) + 0.5;

  return (
    <PuzzleFrame name="laser" seconds={seconds} difficulty={difficulty} onReset={onReset}>
      <svg viewBox={`-0.6 0 ${size + 0.6} ${size}`} style={{ width: BOARD_SIZE, height: BOARD_SIZE, background: "#1b1f33" }}>
        {Array.from({ length: size * size }, (_, i) => {
          const x = i % size;
          const y = Math.floor(i / size);
          const m = mirrors[i];
          return (
            <g key={i} onClick={() => flip(i)} style={{ cursor: m ? "pointer" : "default" }}>
              <rect x={x + 0.04} y={y + 0.04} width={0.92} height={0.92} rx={0.08} fill={m ? "#3a4466" : "#262b44"} />
              {m === 1 && <line x1={x + 0.18} y1={y + 0.82} x2={x + 0.82} y2={y + 0.18} stroke="#8ecbea" strokeWidth={0.12} strokeLinecap="round" />}
              {m === 2 && <line x1={x + 0.18} y1={y + 0.18} x2={x + 0.82} y2={y + 0.82} stroke="#8ecbea" strokeWidth={0.12} strokeLinecap="round" />}
            </g>
          );
        })}
        <polyline
          points={pts.map(([x, y]) => `${x},${y}`).join(" ")}
          fill="none"
          stroke="#ff4d4d"
          strokeWidth={0.1}
          strokeLinejoin="round"
          style={{ filter: "drop-shadow(0 0 0.12px #ff4d4d)", pointerEvents: "none" }}
        />
        <polygon
          points={`-0.55,${puzzle.row + 0.2} -0.1,${puzzle.row + 0.5} -0.55,${puzzle.row + 0.8}`}
          fill="#e43b44"
        />
        <text x={tx} y={ty + 0.22} fontSize={0.7} textAnchor="middle" style={{ pointerEvents: "none" }}>
          {hit ? "🌟" : "⭐"}
        </text>
      </svg>
    </PuzzleFrame>
  );
};
