import React, { useContext, useEffect, useState } from "react";
import { EventBus } from "../../lib/EventBus";
import { PortalContext } from "../../lib/PortalProvider";

// import { useAppTranslation } from "lib/i18n/useAppTranslations";
import { SudokuPuzzle } from "./SudokuPuzzle";
import { SlidingPuzzle } from "./SlidingPuzzle";
import { JigsawPuzzle } from "./JigsawPuzzle";
import { PipePuzzle } from "./PipePuzzle";
import { NonogramPuzzle } from "./NonogramPuzzle";
import { MAX_PUZZLES, PORTAL_NAME, POWER_DISPLAY_SCORE, PUZZLE_TIMES, PUZZLE_TYPES, PuzzleName } from "../../Constants";
import { useSound } from "lib/utils/hooks/useSound";
import { PortalMachineState } from "../../lib/Machine";
import { useSelector } from "@xstate/react";
import { Button } from "components/ui/Button";
import { useAppTranslation } from "lib/i18n/useAppTranslations";

import arrowDown from "public/world/portal/images/arrow_down.png";
import resetButton from "public/world/portal/images/resetbutton_normal.webp"
import { SUNNYSIDE } from "assets/sunnyside";
import { Travel } from "../hud/Travel";
import { Settings } from "../hud/Settings";
import { EventObject } from "xstate";
import { SeasonalGreeting } from "../hud/SeasonalGreeting";

interface Props {
  onClose: () => void;
  data?: any;
}

const _score = (state: PortalMachineState) => state.context.score;
const _hasPower = (state: PortalMachineState) => state.context.hasPower;
let greetingShown = false;

export const Puzzle: React.FC<Props> = ({ onClose, data }) => {
  const { t } = useAppTranslation();
  const { portalService } = useContext(PortalContext);
  const [puzzleType, setPuzzleType] = React.useState<PuzzleName>(data.puzzleType);
  const [difficulty, setDifficulty] = React.useState(data.difficulty);
  const [seconds, setSeconds] = React.useState(PUZZLE_TIMES[puzzleType][difficulty]);
  const [isCompleted, setIsCompleted] = React.useState(false);
  const [availablePuzzles, setAvailablePuzzles] = React.useState(structuredClone(PUZZLE_TYPES).filter((puzzle) => puzzle !== puzzleType));

  const score = useSelector(portalService, _score);
  const hasPower = useSelector(portalService, _hasPower);

  const button = useSound("tab");
  const [showGreeting, setShowGreeting] = useState(!greetingShown);

 useEffect(() => {
    if (showGreeting) {
      const timer = setTimeout(() => {
        greetingShown = true; // mark globally
        setShowGreeting(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [showGreeting]);

  const getPoint = () => {
    setIsCompleted(true);
    setTimeout(() => {
      EventBus.emit("close-puzzle", data.id);
      portalService.send("GAIN_POINTS");
      onClose();

      if (portalService.state.context.score >= MAX_PUZZLES) {
        portalService.send("GAME_OVER");
      }
    }, 1000);
  };

  const reset = () => {
    portalService.send("USE_RESET");
    const newPuzzleType = availablePuzzles[
      Math.floor(Math.random() * availablePuzzles.length)
    ];
    setAvailablePuzzles((prev) => prev.filter(
      (puzzle) => puzzle !== newPuzzleType
    ));
    setPuzzleType(newPuzzleType);
    setSeconds(PUZZLE_TIMES[newPuzzleType][difficulty]);
  };

  const usePower = (power: string) => {
    if (power === "difficulty") {
      setDifficulty("easy");
    } else {
      portalService.send("USE_POWER", { power });
    }
    portalService.send("SET_POWER", { hasPower: true });
  };

  const onFinish = () => {
    onClose();
    EventBus.emit("hurt-player", data.id);
  };

  useEffect(() => {
    if (isCompleted) return;
    if (score === POWER_DISPLAY_SCORE && !hasPower) return;
    if (seconds <= 0) {
      onFinish();
      return;
    }

    const interval = setInterval(() => {
      button.play();
      setSeconds((s: number) => s - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [seconds, hasPower]);

  useEffect(() => {
    const onGameOver = (event: EventObject) => {
      if (event.type === "GAME_OVER") {
        onClose();
      }
    };
    portalService.onEvent(onGameOver);

    const onEndGameEarly = (event: EventObject) => {
      if (event.type === "END_GAME_EARLY") {
        onClose();
      }
    };
    portalService.onEvent(onEndGameEarly);
  }, []);

  if (score === POWER_DISPLAY_SCORE && !hasPower) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/20">
        <div className="flex min-h-full flex-col items-center justify-center p-4">
          <span className="text-white text-lg mb-[3rem] text-center px-2">{t(`${PORTAL_NAME}.select.one`)}</span>
          <div className="flex flex-wrap justify-center gap-5 w-full max-w-[800px]">
            <Button
              className="w-[150px] md:w-[200px] aspect-[10/11]"
              onClick={() => usePower("difficulty")}
            >
              <div className="flex flex-col gap-2 justify-center items-center">
                <img src={arrowDown} className="w-6" />
                <span className="text-center text-sm">{t(`${PORTAL_NAME}.power.difficulty`)}</span>
              </div>
            </Button>
            <Button
              className="w-[150px] md:w-[200px] aspect-[10/11]"
              onClick={() => usePower("reset")}
            >
              <div className="flex flex-col gap-2 justify-center items-center">
                <img src={resetButton} className="w-8" />
                <span className="text-center text-sm">{t(`${PORTAL_NAME}.power.reset`)}</span>
              </div>
            </Button>
            <Button
              className="w-[150px] md:w-[200px] aspect-[10/11]"
              onClick={() => usePower("life")}
            >
              <div className="flex flex-col gap-2 justify-center items-center">
                <img src={SUNNYSIDE.icons.heart} className="w-8" />
                <span className="text-center text-sm">{t(`${PORTAL_NAME}.power.life`)}</span>
              </div>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (showGreeting) return <SeasonalGreeting />;

  return (
    <>
      {puzzleType === "sudoku" && (
        <SudokuPuzzle onClose={onClose} onComplete={getPoint} onReset={reset} difficulty={difficulty} seconds={seconds} />
      )}
      {puzzleType === "sliding" && (
        <SlidingPuzzle onClose={onClose} onComplete={getPoint} onReset={reset} difficulty={difficulty} seconds={seconds} />
      )}
      {puzzleType === "jigsaw" && (
        <JigsawPuzzle onClose={onClose} onComplete={getPoint} onReset={reset} difficulty={difficulty} seconds={seconds} />
      )}
      {puzzleType === "pipe" && (
        <PipePuzzle onClose={onClose} onComplete={getPoint} onReset={reset} difficulty={difficulty} seconds={seconds} />
      )}
      {puzzleType === "nonogram" && (
        <NonogramPuzzle onClose={onClose} onComplete={getPoint} onReset={reset} difficulty={difficulty} seconds={seconds} />
      )}

      <Travel />
      <Settings />
    </>
  );
};
