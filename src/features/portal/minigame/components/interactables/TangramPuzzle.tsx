import React, { useState } from "react";
import { Button } from "components/ui/Button";
import { PORTAL_SOUNDS } from "../../Constants";
import {
  Cells,
  TangramData,
  generateTangram,
  rotateCells,
  tangramCanPlace,
  tangramCells,
} from "../../lib/PuzzleLogic";
import { PUZZLE_COLORS, TANGRAM, levelOf } from "../../lib/PuzzleConfig";
import { BOARD_SIZE, PuzzleFrame, PuzzleProps, useFinish } from "./PuzzleFrame";

/**
 * PLACEHOLDER: polyomino pieces on a grid. Replace `generateTangram` (lib/PuzzleLogic.ts)
 * with real tangram shapes + free dragging if you want the classic look.
 */
export const TangramPuzzle: React.FC<PuzzleProps> = ({ onComplete, difficulty, seconds, onReset }) => {
  const { w, h, size } = TANGRAM[levelOf(difficulty)];
  const [data] = useState<TangramData>(() => generateTangram(w, h, size));
  const [shapes, setShapes] = useState<Record<number, Cells>>(() =>
    Object.fromEntries(data.pieces.map((p) => [p.id, p.cells])),
  );
  const [board, setBoard] = useState<number[]>(() => Array(w * h).fill(-1));
  const [selected, setSelected] = useState<number | null>(data.pieces[0]?.id ?? null);
  const [hover, setHover] = useState<number | null>(null);
  const finish = useFinish(onComplete);
  const placed = new Set(board.filter((b) => b !== -1));
  const solved = board.every((b) => b !== -1);
  const cell = `calc(${BOARD_SIZE} / ${Math.max(w, h)})`;

  const rotate = () => {
    if (selected === null) return;
    PORTAL_SOUNDS.click.play();
    setShapes((s) => ({ ...s, [selected]: rotateCells(s[selected]) }));
  };

  const clickCell = (i: number) => {
    if (solved) return;
    if (board[i] !== -1) {
      // pick a placed piece back up
      const id = board[i];
      setBoard((b) => b.map((v) => (v === id ? -1 : v)));
      setSelected(id);
      return;
    }
    if (selected === null || placed.has(selected)) return;
    const ax = i % w;
    const ay = Math.floor(i / w);
    if (!tangramCanPlace(board, w, h, shapes[selected], ax, ay)) return;
    PORTAL_SOUNDS.click.play();
    const next = [...board];
    tangramCells(shapes[selected], ax, ay).forEach(([x, y]) => (next[y * w + x] = selected));
    setBoard(next);
    const remaining = data.pieces.find((p) => !next.includes(p.id));
    setSelected(remaining ? remaining.id : null);
    if (next.every((b) => b !== -1)) finish();
  };

  const preview = new Set<number>();
  let previewOk = false;
  if (hover !== null && selected !== null && !placed.has(selected) && board[hover] === -1) {
    const ax = hover % w;
    const ay = Math.floor(hover / w);
    previewOk = tangramCanPlace(board, w, h, shapes[selected], ax, ay);
    tangramCells(shapes[selected], ax, ay).forEach(([x, y]) => {
      if (x >= 0 && y >= 0 && x < w && y < h) preview.add(y * w + x);
    });
  }

  return (
    <PuzzleFrame
      name="tangram"
      seconds={seconds}
      difficulty={difficulty}
      onReset={onReset}
      footer={<Button onClick={rotate} disabled={selected === null}>Rotate ↻</Button>}
    >
      <div
        className="grid gap-[2px] bg-[#262b44] p-[2px] rounded"
        style={{ gridTemplateColumns: `repeat(${w}, ${cell})`, gridAutoRows: cell }}
        onMouseLeave={() => setHover(null)}
      >
        {board.map((b, i) => (
          <div
            key={i}
            onClick={() => clickCell(i)}
            onMouseEnter={() => setHover(i)}
            className="cursor-pointer"
            style={{
              background:
                b !== -1
                  ? PUZZLE_COLORS[b % PUZZLE_COLORS.length]
                  : preview.has(i)
                    ? previewOk
                      ? "#63c74d88"
                      : "#e43b4488"
                    : "#dfe6f2",
            }}
          />
        ))}
      </div>
      <div className="flex flex-row flex-wrap justify-center items-center gap-3" style={{ maxWidth: BOARD_SIZE, minHeight: "3.2rem" }}>
        {data.pieces
          .filter((p) => !placed.has(p.id))
          .map((p) => {
            const cells = shapes[p.id];
            const pw = Math.max(...cells.map((c) => c[0])) + 1;
            const ph = Math.max(...cells.map((c) => c[1])) + 1;
            return (
              <div
                key={p.id}
                onClick={() => setSelected(p.id)}
                className="grid gap-[1px] cursor-pointer p-[2px] rounded"
                style={{
                  gridTemplateColumns: `repeat(${pw}, 0.8rem)`,
                  gridAutoRows: "0.8rem",
                  outline: selected === p.id ? "3px solid #feae34" : "none",
                }}
              >
                {Array.from({ length: pw * ph }, (_, k) => {
                  const on = cells.some(([x, y]) => y * pw + x === k);
                  return <div key={k} style={{ background: on ? PUZZLE_COLORS[p.id % PUZZLE_COLORS.length] : "transparent" }} />;
                })}
              </div>
            );
          })}
      </div>
    </PuzzleFrame>
  );
};
