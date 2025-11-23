import React, { useContext, useEffect } from "react";
import { useSelector } from "@xstate/react";
import { PortalContext } from "../../lib/PortalProvider";
import { PIXEL_SCALE } from "features/game/lib/constants";
import { HudContainer } from "components/ui/HudContainer";
import { PortalMachineState } from "../../lib/christmasDeliveryMayhemMachine";
import { ChristmasDeliveryMayhemScore } from "./ChristmasDeliveryMayhemScore";
import { ChristmasDeliveryMayhemSettings } from "./ChristmasDeliveryMayhemSettings";
import { ChristmasDeliveryMayhemTravel } from "./ChristmasDeliveryMayhemTravel";
import { ChristmasDeliveryMayhemInventory } from "./ChristmasDeliveryMayhemInventory";
import { ChristmasDeliveryMayhemTimer } from "./ChristmasDeliveryMayhemTimer";
// import { ChristmasDeliveryMayhemTarget } from "./ChristmasDeliveryMayhemTarget";
import { ChristmasDeliveryMayhemLives } from "./ChristmasDeliveryMayhemLives";
import { useAchievementToast } from "../../providers/AchievementToastProvider";
import { ChristmasDeliveryMayhemSelectingEvent } from "./ChristmasDeliveryMayhemSelectingEvent";
import { ChristmasDeliveryMayhemDeliveries } from "./ChristmasDeliveryMayhemDeliveries";

const _isJoystickActive = (state: PortalMachineState) =>
  state.context.isJoystickActive;
const _achievements = (state: PortalMachineState) =>
  state.context.state?.minigames.games["christmas-delivery"]?.achievements ??
  {};
const _isPlaying = (state: PortalMachineState) => state.matches("playing");

export const ChristmasDeliveryMayhemHud: React.FC = () => {
  const { portalService } = useContext(PortalContext);

  const isJoystickActive = useSelector(portalService, _isJoystickActive);
  const achievements = useSelector(portalService, _achievements);
  const isPlaying = useSelector(portalService, _isPlaying);

  // achievement toast provider
  const { showAchievementToasts } = useAchievementToast();

  // show new achievements
  const [existingAchievementNames, setExistingAchievements] = React.useState(
    Object.keys(achievements),
  );
  useEffect(() => {
    const achievementNames = Object.keys(achievements);
    const newAchievementNames = achievementNames.filter(
      (achievement) => !existingAchievementNames.includes(achievement),
    );

    if (newAchievementNames.length > 0) {
      showAchievementToasts(newAchievementNames);
      setExistingAchievements(achievementNames);
    }
  }, [achievements]);

  return (
    <HudContainer>
      <div>
        <div
          className="absolute flex flex-col gap-2"
          style={{
            top: `${PIXEL_SCALE * 4}px`,
            left: `${PIXEL_SCALE * 6}px`,
          }}
        >
          {/* <ChristmasDeliveryMayhemTarget /> */}
          {isPlaying && (
            <>
              <ChristmasDeliveryMayhemTimer />
              <ChristmasDeliveryMayhemLives />
              <ChristmasDeliveryMayhemScore />
              {isJoystickActive && <ChristmasDeliveryMayhemDeliveries />}
            </>
          )}
          {isJoystickActive && <ChristmasDeliveryMayhemSelectingEvent />}
        </div>

        <ChristmasDeliveryMayhemTravel />
        <ChristmasDeliveryMayhemSettings />
        {!isJoystickActive && <ChristmasDeliveryMayhemSelectingEvent />}
        {isPlaying && <ChristmasDeliveryMayhemInventory />}
      </div>
    </HudContainer>
  );
};
