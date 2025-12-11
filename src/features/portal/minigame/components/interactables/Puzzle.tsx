import React, { useContext } from "react";
import { EventBus } from "../../lib/EventBus";
import { PortalContext } from "../../lib/PortalProvider";

// import { useAppTranslation } from "lib/i18n/useAppTranslations";
import { SudokuPuzzle } from "./SudokuPuzzle";
import { SlidingPuzzle } from "./SlidingPuzzle";
import { JigsawPuzzle } from "./JigsawPuzzle";
import { PipePuzzle } from "./PipePuzzle";
import { NonogramPuzzle } from "./NonogramPuzzle";
import { MAX_PUZZLES } from "../../Constants";

interface Props {
  onClose: () => void;
  data?: any;
}

export const Puzzle: React.FC<Props> = ({ onClose, data }) => {
  //   const { t } = useAppTranslation();
  const { portalService } = useContext(PortalContext);
  const [puzzleType] = React.useState(data.puzzleType);
  const [difficulty] = React.useState(data.difficulty);

  const getPoint = () => {
    setTimeout(() => {
      EventBus.emit("close-puzzle", data.id);
      portalService.send("GAIN_POINTS");
      onClose();

      if (portalService.state.context.score >= MAX_PUZZLES) {
        portalService.send("GAME_OVER");
      }
    }, 1000);
  };

  return (
    <>
      {puzzleType === "sudoku" && (
        <SudokuPuzzle onClose={onClose} onAction={getPoint} difficulty={difficulty} />
      )}
      {puzzleType === "sliding" && (
        <SlidingPuzzle onClose={onClose} onAction={getPoint} />
      )}
      {puzzleType === "jigsaw" && (
        <JigsawPuzzle onClose={onClose} onAction={getPoint} difficulty={difficulty} />
      )}
      {puzzleType === "pipe" && (
        <PipePuzzle onClose={onClose} onAction={getPoint} difficulty={difficulty} />
      )}
      {puzzleType === "nonogram" && (
        <NonogramPuzzle onClose={onClose} onAction={getPoint} />
      )}
    </>
  );
};
