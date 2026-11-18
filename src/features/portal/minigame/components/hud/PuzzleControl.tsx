import React from "react";
import { isTouchDevice } from "features/world/lib/device";
import { Button } from "components/ui/Button";
import { SUNNYSIDE } from "assets/sunnyside";

interface Props {
  go: (direction: number) => void;
}

export const PuzzleControls = ({ go }: Props) => {
  if (!isTouchDevice()) return null;

  return (
    <div className="grid grid-cols-3 gap-1 items-center justify-items-center">
      <div />
      <Button onClick={() => go(0)}>
        <img
          src={SUNNYSIDE.icons.arrow_up}
          className="w-[20px] h-[20px] object-contain"
        />
      </Button>
      <div />

      <Button onClick={() => go(3)}>
        <img
          src={SUNNYSIDE.icons.arrow_left}
          className="w-[20px] h-[20px] object-contain"
        />
      </Button>
      <div />
      <Button onClick={() => go(1)}>
        <img
          src={SUNNYSIDE.icons.arrow_right}
          className="w-[20px] h-[20px] object-contain"
        />
      </Button>

      <div />
      <Button onClick={() => go(2)}>
        <img
          src={SUNNYSIDE.icons.arrow_down}
          className="w-[20px] h-[20px] object-contain"
        />
      </Button>
      <div />
    </div>
  );
};
