import React, { useContext } from "react";
import { Lives } from "../hud/Lives";
import { Label } from "components/ui/Label";
import { SUNNYSIDE } from "assets/sunnyside";
import resetBtn from "public/world/portal/images/resetbutton_normal.webp";
import { Button } from "components/ui/Button";
import { PortalMachineState } from "../../lib/Machine";
import { useSelector } from "@xstate/react";
import { PortalContext } from "../../lib/PortalProvider";
import { Difficulty } from "./Difficulty";
import { PuzzleDifficulty } from "../../Constants";
import { Timer } from "./Timer";

interface Props {
  onReset: () => void;
  seconds: number;
  difficulty: PuzzleDifficulty;
}

const _resetAttempts = (state: PortalMachineState) => state.context.resetAttempts;

export const StatusBar: React.FC<Props> = ({ onReset, seconds, difficulty }) => {
  const { portalService } = useContext(PortalContext);

  const resetAttempts = useSelector(portalService, _resetAttempts);

  return (
    <>
      <div className="flex flex-row w-full flex-wrap items-center justify-center">
        <div className="flex flex-row w-full justify-between px-3 pt-6 md:px-6 bg-[#265c42] rounded-t-[2.5rem] pb-2">
          <div className="flex flex-col gap-1">
            <Timer />
            <Difficulty difficulty={difficulty} />
            <Lives />
          </div>
          <div className="flex flex-row gap-1 md:gap-3">
            <Label icon={SUNNYSIDE.icons.timer} type="vibrant">
              {/* Static - puzzle time */}
              <span className="text-xs md:text-[2.5rem]">{seconds.toString().padStart(2, '0')}</span>
            </Label>
            <Button disabled={resetAttempts === 0} onClick={onReset}>
              <div className="flex items-center justify-center">
                <img
                  className="w-[2rem] md:w-[2.5rem] pt-[5px]"
                  src={resetBtn}
                  alt="reset button"
                />
                {/* Static - reset counter */}
                <span className="text-xs md:text-[2.5rem] pl-2">{resetAttempts}</span>
              </div>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
