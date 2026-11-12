import React, { useContext, useEffect, useRef, useState } from "react";
import { Button } from "components/ui/Button";
import { Label } from "components/ui/Label";
import { Panel } from "components/ui/Panel";

import { PuzzleDifficulty } from "../../Constants";
import { PortalContext } from "../../lib/PortalProvider";
import { FreePlayContext } from "../../lib/FreePlayContext";
import {
  LEVELS,
  PUZZLE_TEXTS,
  difficultyName,
  difficultyPoints,
} from "../../lib/PuzzleConfig";
import { PUZZLE_COMPONENTS } from "../interactables/PuzzleRegistry";
import { ScoreLabel } from "../hud/ScoreLabel";

/**
 * Free-play mode. It is a SEPARATE mode of the portal machine (state "freePlay"):
 * no map, no global timer, no lives, no per-puzzle time limit.
 * It still behaves like the normal mode for attempts and score:
 *  - entering it consumes an attempt;
 *  - the first completion of each puzzle + difficulty sends GAIN_POINTS (1 point for easy ...
 *    6 for insane, see DIFFICULTY_POINTS); repeating a completed level gives no points;
 *  - "End game" sends END_GAME_EARLY: the machine submits the score and shows winner / loser.
 *
 * "Completed" progress lives in this component, so it lasts for the current attempt.
 * TODO: move the texts below to i18n.
 */

const ORIGINAL_TITLES: Record<string, string> = {
  sudoku: "Sudoku",
  sliding: "Sliding",
  jigsaw: "Jigsaw",
  pipe: "Pipes",
  nonogram: "Nonogram",
};
const titleOf = (name: string) => PUZZLE_TEXTS[name]?.title ?? ORIGINAL_TITLES[name] ?? name;
const fmt = (s: number) =>
  `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
const doneKey = (puzzle: string, difficulty: string) => `${puzzle}:${difficulty}`;
const nextLevelOf = (difficulty: string) =>
  LEVELS[(LEVELS.indexOf(difficulty) + 1) % LEVELS.length]; // after "hard 4" (Insane) -> easy

/** Small red (not done) / green (done) marker on the top-right corner of its children. */
const Marked: React.FC<{ done: boolean; className?: string; children: React.ReactNode }> = ({
  done,
  className,
  children,
}) => (
  <div className={`relative ${className ?? ""}`}>
    {children}
    <span
      style={{
        position: "absolute",
        top: -4,
        right: -4,
        width: 12,
        height: 12,
        borderRadius: "50%",
        border: "2px solid #262b44",
        background: done ? "#63c74d" : "#e43b44",
        zIndex: 2,
        pointerEvents: "none",
      }}
    />
  </div>
);

export const FreePlay: React.FC = () => {
  const { portalService } = useContext(PortalContext);

  const [selected, setSelected] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<string>("easy");
  const [round, setRound] = useState(0); // changes the key -> brand new board
  const [elapsed, setElapsed] = useState(0);
  const [solved, setSolved] = useState(false);
  const [gained, setGained] = useState(0); // points given by the board just solved
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [confirmEnd, setConfirmEnd] = useState(false);
  const counted = useRef(false); // a board is only handled once

  useEffect(() => {
    if (!selected || solved) return;
    const interval = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [selected, solved, round]);

  const newRound = () => {
    counted.current = false;
    setRound((r) => r + 1);
    setElapsed(0);
    setSolved(false);
  };
  const play = (name: string) => {
    setSelected(name);
    newRound();
  };
  const toMenu = () => {
    setSelected(null);
    setElapsed(0);
    setSolved(false);
  };
  const nextLevel = () => {
    setDifficulty(nextLevelOf(difficulty));
    newRound();
  };

  const onSolved = () => {
    if (counted.current || !selected) return;
    counted.current = true;
    const key = doneKey(selected, difficulty);
    const firstTime = !done[key];
    if (firstTime) {
      const points = difficultyPoints(difficulty);
      portalService.send({ type: "GAIN_POINTS", points });
      setDone((d) => ({ ...d, [key]: true }));
      setGained(points);
    } else {
      setGained(0);
    }
    setSolved(true);
  };

  // Ends the attempt: the machine submits the score and shows the winner / loser panel
  const endGame = () => portalService.send("END_GAME_EARLY");

  const Current = selected ? PUZZLE_COMPONENTS[selected] : null;

  if (Current && selected) {
    const next = nextLevelOf(difficulty);
    return (
      <FreePlayContext.Provider value={{ elapsed, onMenu: toMenu }}>
        <div style={{ position: "fixed", inset: 0, zIndex: 1100 }}>
          <Current
            key={`${selected}-${difficulty}-${round}`}
            onClose={toMenu}
            onComplete={onSolved}
            onReset={newRound}
            difficulty={difficulty as PuzzleDifficulty}
            seconds={elapsed}
          />
          {solved && (
            <div
              className="fixed left-1/2 bottom-4 flex flex-col items-center gap-2 p-3 rounded bg-[#265c42] border-2 border-[#feae34]"
              style={{ transform: "translateX(-50%)", zIndex: 1200 }}
            >
              <Label type="success">
                {gained > 0
                  ? `Solved in ${fmt(elapsed)}! +${gained}`
                  : `Solved in ${fmt(elapsed)} (already completed)`}
              </Label>
              <div className="flex flex-row gap-3 items-stretch">
                <div className="flex flex-col gap-1">
                  <Marked done={!!done[doneKey(selected, difficulty)]}>
                    <Button className="text-xs py-0 whitespace-nowrap" onClick={newRound}>
                      Play again
                    </Button>
                  </Marked>
                  <Button className="whitespace-nowrap" onClick={toMenu}>
                    Menu
                  </Button>
                </div>
                <Marked done={!!done[doneKey(selected, next)]} className="flex self-stretch">
                  <Button className="h-full whitespace-nowrap" onClick={nextLevel}>
                    <div className="flex flex-col items-center leading-tight">
                      <span>Next level</span>
                      <span>{difficultyName(next)}</span>
                    </div>
                  </Button>
                </Marked>
              </div>
            </div>
          )}
        </div>
      </FreePlayContext.Provider>
    );
  }

  return (
    <div
      className="flex items-center justify-center p-2"
      style={{ position: "fixed", inset: 0, zIndex: 1100, background: "rgba(0,0,0,0.45)" }}
    >
      <div className="w-full max-w-md">
        <Panel>
          <div className="flex flex-col gap-2 p-1">
            <div className="flex flex-row flex-wrap gap-1">
              <Label type="default">Free play</Label>
              <ScoreLabel />
            </div>
            <span className="text-xs">
              Pick any puzzle. The first time you complete a puzzle at a difficulty you earn points
              (Easy 1, Medium 2, Hard 3, Expert 4, Master 5, Insane 6). Green marker = completed,
              red = not yet. Ending the game submits your score.
            </span>

            <span className="text-xs">Difficulty</span>
            <div className="flex flex-row flex-wrap gap-1">
              {LEVELS.map((l) => (
                <div
                  key={l}
                  style={{ outline: l === difficulty ? "2px solid #feae34" : "none", outlineOffset: 1 }}
                >
                  <Button onClick={() => setDifficulty(l)}>{difficultyName(l)}</Button>
                </div>
              ))}
            </div>

            <span className="text-xs">Puzzle</span>
            <div className="grid grid-cols-2 gap-2 overflow-y-auto p-1" style={{ maxHeight: "34vh" }}>
              {Object.keys(PUZZLE_COMPONENTS).map((name) => (
                <Marked key={name} done={!!done[doneKey(name, difficulty)]}>
                  <Button onClick={() => play(name)}>{titleOf(name)}</Button>
                </Marked>
              ))}
            </div>

            <div className="flex flex-row gap-1 mt-1">
              {!confirmEnd ? (
                <Button onClick={() => setConfirmEnd(true)}>End game</Button>
              ) : (
                <>
                  <span className="text-xs self-center">End the attempt and submit your score?</span>
                  <Button onClick={endGame}>Yes</Button>
                  <Button onClick={() => setConfirmEnd(false)}>No</Button>
                </>
              )}
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
};
