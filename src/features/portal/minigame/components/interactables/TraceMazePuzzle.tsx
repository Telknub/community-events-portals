import React, { useRef, useState } from "react";
import { PORTAL_SOUNDS } from "../../Constants";
import { Maze, generateMaze, mazeCanMove, neighbors } from "../../lib/PuzzleLogic";
import { TRACE_MAZE, levelOf } from "../../lib/PuzzleConfig";
import { BOARD_SIZE, PuzzleFrame, PuzzleProps, useFinish, useForceUpdate, useGridPointer } from "./PuzzleFrame";

const WALL = "3px solid #265c42";

export const TraceMazePuzzle: React.FC<PuzzleProps> = ({ onComplete, difficulty, seconds, onReset }) => {
  const { size } = TRACE_MAZE[levelOf(difficulty)];
  const [maze] = useState<Maze>(() => generateMaze(size));
  const path = useRef<number[]>([0]);
  const active = useRef(false);
  const rerender = useForceUpdate();
  const finish = useFinish(onComplete);
  const [solved, setSolved] = useState(false);
  const end = size * size - 1;

  const down = (i: number) => {
    if (solved) return;
    const p = path.current;
    const last = p[p.length - 1];
    if (i === 0) {
      path.current = [0]; // restart from the start cell
      active.current = true;
    } else if (p.includes(i)) {
      path.current = p.slice(0, p.indexOf(i) + 1); // resume from a previous cell
      active.current = true;
    } else if (neighbors(last, size, size).includes(i) && mazeCanMove(maze, last, i)) {
      p.push(i);
      active.current = true;
    } else active.current = false;
    rerender();
  };

  const move = (i: number) => {
    if (!active.current || solved) return;
    const p = path.current;
    const last = p[p.length - 1];
    if (i === last) return;
    if (p.length >= 2 && p[p.length - 2] === i) p.pop(); // backtrack
    else if (!p.includes(i) && neighbors(last, size, size).includes(i) && mazeCanMove(maze, last, i)) {
      p.push(i);
      PORTAL_SOUNDS.click.play();
      if (i === end) {
        active.current = false;
        setSolved(true);
        finish();
      }
    }
    rerender();
  };

  const pointer = useGridPointer(size, size, { down, move, up: () => (active.current = false) });
  const onPath = new Set(path.current);

  return (
    <PuzzleFrame name="tracemaze" seconds={seconds} difficulty={difficulty} onReset={onReset}>
      <div
        {...pointer}
        className="grid"
        style={{ ...pointer.style, width: BOARD_SIZE, height: BOARD_SIZE, gridTemplateColumns: `repeat(${size}, 1fr)` }}
      >
        {maze.open.map((o, i) => (
          <div
            key={i}
            className="flex items-center justify-center text-[min(4vw,1.2rem)] leading-none"
            style={{
              borderTop: o & 1 ? "0" : WALL,
              borderRight: o & 2 ? "0" : WALL,
              borderBottom: o & 4 ? "0" : WALL,
              borderLeft: o & 8 ? "0" : WALL,
              background: i === 0 ? "#63c74d" : i === end ? "#e43b44" : onPath.has(i) ? "#feae34" : "#fff",
              boxSizing: "border-box",
            }}
          >
            {i === end ? "🎁" : ""}
          </div>
        ))}
      </div>
    </PuzzleFrame>
  );
};
