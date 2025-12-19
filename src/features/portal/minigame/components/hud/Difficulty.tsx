import React from "react";
import { Label } from "components/ui/Label";

import arrowUp from "public/world/portal/images/arrow_up.png";
import { PuzzleDifficulty } from "../../Constants";

export const Difficulty: React.FC<{ difficulty: PuzzleDifficulty }> = ({ difficulty }) => {
  return (
    <Label
      icon={arrowUp}
      type="vibrant"
    >
      {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
    </Label>
  );
};
