import React, { useRef, useState } from "react";
import { StatusBar } from "../hud/StatusBar";
import redRibbon from "public/world/portal/images/bow.webp";
import { PORTAL_SOUNDS, PuzzleDifficulty, SNOW } from "../../Constants";
import { PUZZLE_TEXTS } from "../../lib/PuzzleConfig";

/** Same contract as the original puzzles (Sudoku, Sliding, ...). */
export interface PuzzleProps {
  onClose: () => void;
  onComplete: () => void;
  difficulty: PuzzleDifficulty;
  seconds: number;
  onReset: () => void;
}

/** Side of the (square) play area. Works with any container thanks to min(). */
export const BOARD_SIZE = "min(76vw, 44vh, 420px)";

/** Returns a function that completes the puzzle exactly once (points + confetti + sound). */
export const useFinish = (onComplete: () => void) => {
  const done = useRef(false);
  return () => {
    if (done.current) return;
    done.current = true;
    onComplete();
    SNOW();
    PORTAL_SOUNDS.win.play();
  };
};

export const useForceUpdate = () => {
  const [, set] = useState(0);
  return () => set((n) => n + 1);
};

/**
 * Pointer handling for grid puzzles (drag to draw / select).
 * Maps the pointer position to a cell index using the container's bounding box,
 * so it also works on touch screens and while the pointer leaves the element.
 */
export const useGridPointer = (
  cols: number,
  rows: number,
  h: { down?: (i: number) => void; move?: (i: number) => void; up?: () => void },
) => {
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const last = useRef(-1);

  const cellAt = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return -1;
    const r = el.getBoundingClientRect();
    const x = Math.floor(((e.clientX - r.left) / r.width) * cols);
    const y = Math.floor(((e.clientY - r.top) / r.height) * rows);
    if (x < 0 || y < 0 || x >= cols || y >= rows) return -1;
    return y * cols + x;
  };
  const end = () => {
    if (!dragging.current) return;
    dragging.current = false;
    last.current = -1;
    h.up?.();
  };

  return {
    ref,
    style: { touchAction: "none" } as React.CSSProperties,
    onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => {
      const i = cellAt(e);
      if (i < 0) return;
      dragging.current = true;
      last.current = i;
      e.currentTarget.setPointerCapture?.(e.pointerId);
      h.down?.(i);
    },
    onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => {
      if (!dragging.current) return;
      const i = cellAt(e);
      if (i < 0 || i === last.current) return;
      last.current = i;
      h.move?.(i);
    },
    onPointerUp: end,
    onPointerCancel: end,
  };
};

interface FrameProps {
  /** key in PUZZLE_TEXTS (title + hint) */
  name: string;
  seconds: number;
  difficulty: PuzzleDifficulty;
  onReset: () => void;
  children: React.ReactNode;
  /** extra controls rendered under the board (undo, restart, ...) */
  footer?: React.ReactNode;
}

/** Same look as the original puzzles: backdrop, ribbon, status bar and framed board. */
export const PuzzleFrame: React.FC<FrameProps> = ({
  name,
  seconds,
  difficulty,
  onReset,
  children,
  footer,
}) => {
  const text = PUZZLE_TEXTS[name] ?? { title: name, hint: "" };
  return (
    <div className="fixed top-0 left-0 w-full h-screen backdrop-blur-sm flex items-center justify-center flex-col gap-4">
      <div className="relative w-full bottom-4 flex justify-center z-20">
        <img className="absolute w-[6rem] md:w-[8rem]" src={redRibbon} />
      </div>
      <div className="flex flex-col items-center">
        <StatusBar seconds={seconds} difficulty={difficulty} onReset={onReset} />
        <div
          className="p-3 border-[1rem] border-[#265c42]"
          style={{
            position: "relative",
            backgroundImage:
              "repeating-linear-gradient(45deg, #3e8948 0 15px, #ffffff 5px 25px, #a22633 10px 35px)",
          }}
        >
          <div className="border-[1rem] md:border-[1.5rem] border-[#a22633] border-double p-2 bg-white flex flex-col items-center gap-2 text-[#262b44]">
            <span className="text-sm md:text-base font-bold text-center">{text.title}</span>
            <span
              className="text-[10px] md:text-xs text-center"
              style={{ maxWidth: BOARD_SIZE, minHeight: "2.2em" }}
            >
              {text.hint}
            </span>
            {children}
            {footer && <div className="flex flex-row gap-2 items-center justify-center flex-wrap">{footer}</div>}
          </div>
        </div>
      </div>
    </div>
  );
};
