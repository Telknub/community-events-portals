import React from "react";
import { Label } from "components/ui/Label";

import arrowUp from "public/world/portal/images/arrow_up.png";
import { PuzzleDifficulty } from "../../Constants";
import { difficultyName } from "../../lib/PuzzleConfig";

export const Difficulty: React.FC<{ difficulty: PuzzleDifficulty }> = ({ difficulty }) => {
  return (
    <Label
      icon={arrowUp}
      type="vibrant"
    >
      {difficultyName(difficulty)}
    </Label>
  );
};
