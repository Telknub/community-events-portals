import React from "react";
import { Timer } from "../hud/Timer";
import { Lives } from "../hud/Lives";
import { Label } from "components/ui/Label";
import giantBalls from "public/world/portal/images/GiantRedChristmasOrnament.webp";
import { SUNNYSIDE } from "assets/sunnyside";
import resetBtn from "public/world/portal/images/resetbutton_normal.webp";
import { Button } from "components/ui/Button";

export const StatusBar: React.FC = () => {
  return (
    <>
      <div className="flex flex-row w-full flex-wrap items-center justify-center">
        <div className="flex flex-row w-full justify-between px-3 pt-6 md:px-6 bg-[#265c42] rounded-t-[2.5rem] pb-2">
          <div className="flex flex-col gap-4">
            <Timer />
            <Lives />
          </div>
          <div className="flex flex-row gap-1 md:gap-3">
            <Label icon={SUNNYSIDE.icons.timer} type="vibrant">
              {/* Static - puzzle time */}
              <span className="text-xs md:text-[2.5rem]">10</span>
            </Label>
            <Button>
              <div className="flex items-center justify-center">
                <img
                  className="w-[2rem] md:w-[2.5rem] pt-[5px]"
                  src={resetBtn}
                  alt="reset button"
                />
                {/* Static - reset counter */}
                <span className="text-xs md:text-[2.5rem] pl-2">3</span>
              </div>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
