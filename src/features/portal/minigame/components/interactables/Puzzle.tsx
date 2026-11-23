import React, { useContext, useEffect, useState, useCallback } from "react";
import { EventBus } from "../../lib/EventBus";
import { PortalContext } from "../../lib/PortalProvider";

import { PUZZLE_COMPONENTS } from "./PuzzleRegistry";
import {
  MAX_PUZZLES,
  PORTAL_SOUNDS,
  POWER_DISPLAY_POINT_ID,
  PUZZLE_TIMES,
  PUZZLE_TYPES,
  PuzzleDifficulty,
  PuzzleName,
} from "../../Constants";
import { useSound } from "lib/utils/hooks/useSound";
import { PortalMachineState } from "../../lib/Machine";
import { useSelector } from "@xstate/react";

import { Travel } from "../hud/Travel";
import { Settings } from "../hud/Settings";
import { EventObject } from "xstate";

interface Props {
  onClose: () => void;
  data: {
    id: number;
    puzzleType: PuzzleName;
  };
}

const _difficulty = (state: PortalMachineState) => state.context.difficulty;
export const Puzzle: React.FC<Props> = ({ onClose, data }) => {
  const { portalService } = useContext(PortalContext);

  const difficultyPuzzle = useSelector(
    portalService,
    _difficulty,
  ) as PuzzleDifficulty;
  // TESTING: set to null to restore random puzzles
  const FORCE_PUZZLE: PuzzleName | null = "floodit";

  const [difficulty] = useState(difficultyPuzzle);
  const [puzzleType, setPuzzleType] = useState<PuzzleName>(data.puzzleType);
  const [seconds, setSeconds] = useState(
    () => PUZZLE_TIMES[data.puzzleType][difficultyPuzzle],
  );
  const [isCompleted, setIsCompleted] = useState(false);
  const [availablePuzzles, setAvailablePuzzles] = useState(() =>
    structuredClone(PUZZLE_TYPES).filter(
      (puzzle) => puzzle !== data.puzzleType,
    ),
  );

  const button = useSound("tab");

  const getPoint = () => {
    setIsCompleted(true);

    setTimeout(() => {
      EventBus.emit("close-puzzle", data.id);
      onClose();

      if (data.id === MAX_PUZZLES) {
        EventBus.emit("next-level");
      }
    }, 1000);
  };

  const reset = () => {
    if (availablePuzzles.length === 0) return;

    portalService.send("USE_RESET");
    PORTAL_SOUNDS.reset.play();

    const newPuzzleType =
      availablePuzzles[Math.floor(Math.random() * availablePuzzles.length)];

    setAvailablePuzzles((prev) =>
      prev.filter((puzzle) => puzzle !== newPuzzleType),
    );

    setPuzzleType(newPuzzleType);
    setSeconds(PUZZLE_TIMES[newPuzzleType][difficulty]);
  };

  const onFinish = useCallback(() => {
    onClose();
    EventBus.emit("hurt-player", data.id);

    if (data.id === MAX_PUZZLES) {
      EventBus.emit("next-level");
    }
  }, [onClose, data.id]);

  useEffect(() => {
    if (isCompleted) return;
    if (data.id === POWER_DISPLAY_POINT_ID) return;

    if (seconds <= 0) {
      onFinish();
      return;
    }

    const interval = setInterval(() => {
      button.play();
      setSeconds((s) => s - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [seconds, isCompleted, data.id, button, onFinish]);

  useEffect(() => {
    const onGameOver = (event: EventObject) => {
      if (event.type === "GAME_OVER" || event.type === "END_GAME_EARLY") {
        onClose();
      }
    };

    portalService.onEvent(onGameOver);
  }, [portalService, onClose]);

  const CurrentPuzzle = PUZZLE_COMPONENTS[puzzleType];

  return (
    <>
      {CurrentPuzzle && (
        <CurrentPuzzle
          key={`${puzzleType}-${difficulty}`}
          onClose={onClose}
          onComplete={getPoint}
          onReset={reset}
          difficulty={difficulty}
          seconds={seconds}
        />
      )}

      <Travel />
      <Settings />
    </>
  );
};
