import React, { useState } from "react";
import { PORTAL_SOUNDS } from "../../Constants";
import { Car, UNBLOCK_N as N, generateUnblock, unblockReach, unblockSet, unblockWon } from "../../lib/PuzzleLogic";
import { PUZZLE_COLORS, UNBLOCK, levelOf } from "../../lib/PuzzleConfig";
import { BOARD_SIZE, PuzzleFrame, PuzzleProps, useFinish } from "./PuzzleFrame";

export const UnblockPuzzle: React.FC<PuzzleProps> = ({ onComplete, difficulty, seconds, onReset }) => {
  const { cars: n, min, max } = UNBLOCK[levelOf(difficulty)];
  const [cars, setCars] = useState<Car[]>(() => generateUnblock(n, min, max));
  const [selected, setSelected] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const finish = useFinish(onComplete);
  const solved = unblockWon(cars);
  const pct = (v: number) => `${(v / N) * 100}%`;

  const slide = (p: number) => {
    if (selected === null || solved) return;
    PORTAL_SOUNDS.click.play();
    const next = unblockSet(cars, selected, p);
    setCars(next);
    setMoves((m) => m + 1);
    setSelected(null);
    if (unblockWon(next)) finish();
  };

  const targets = selected !== null && !solved ? unblockReach(cars, selected) : [];

  return (
    <PuzzleFrame name="unblock" seconds={seconds} difficulty={difficulty} onReset={onReset}>
      <div className="flex flex-row items-center gap-1">
        <div
          className="relative bg-[#dfe6f2] border-4 border-[#262b44] rounded"
          style={{ width: BOARD_SIZE, height: BOARD_SIZE }}
          onClick={() => setSelected(null)}
        >
          {cars.map((c, i) => (
            <div
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                if (!solved) setSelected(i === selected ? null : i);
              }}
              className="absolute rounded-md cursor-pointer"
              style={{
                left: pct(c.x),
                top: pct(c.y),
                width: pct(c.horiz ? c.len : 1),
                height: pct(c.horiz ? 1 : c.len),
                padding: 2,
                transition: "left 150ms, top 150ms",
              }}
            >
              <div
                className="w-full h-full rounded-md"
                style={{
                  background: i === 0 ? "#e43b44" : PUZZLE_COLORS[1 + (i % (PUZZLE_COLORS.length - 1))],
                  outline: selected === i ? "3px solid #feae34" : undefined,
                  boxShadow: "inset 0 -4px 0 #0003",
                }}
              />
            </div>
          ))}
          {targets.map((p) => {
            const c = cars[selected as number];
            const cx = c.horiz ? p + c.len / 2 : c.x + 0.5;
            const cy = c.horiz ? c.y + 0.5 : p + c.len / 2;
            return (
              <div
                key={p}
                onClick={(e) => {
                  e.stopPropagation();
                  slide(p);
                }}
                className="absolute rounded-full cursor-pointer"
                style={{
                  left: pct(cx - 0.2),
                  top: pct(cy - 0.2),
                  width: pct(0.4),
                  height: pct(0.4),
                  background: "#feae34",
                  border: "2px solid #262b44",
                }}
              />
            );
          })}
        </div>
        <span className="text-lg" style={{ marginTop: `calc(${BOARD_SIZE} / ${N} * 4 - 0.8rem)` }}>
          ➜
        </span>
      </div>
      <span className="text-[10px]">Moves: {moves}</span>
    </PuzzleFrame>
  );
};
