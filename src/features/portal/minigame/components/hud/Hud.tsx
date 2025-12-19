import React, { useContext } from "react";
import { useSelector } from "@xstate/react";
import { PortalContext } from "../../lib/PortalProvider";
import { PIXEL_SCALE } from "features/game/lib/constants";
import { HudContainer } from "components/ui/HudContainer";
import { PortalMachineState } from "../../lib/Machine";
import { Score } from "./Score";
import { Settings } from "./Settings";
import { Travel } from "./Travel";
import { Target } from "./Target";
import { Lives } from "./Lives";
import { Difficulty } from "./Difficulty";
import { PuzzleDifficulty } from "../../Constants";

const _isJoystickActive = (state: PortalMachineState) =>
  state.context.isJoystickActive;
// const _achievements = (state: PortalMachineState) =>
//   state.context.state?.minigames.games[PORTAL_NAME]?.achievements ?? {};
const _isPlaying = (state: PortalMachineState) => state.matches("playing");
const _difficulty = (state: PortalMachineState) => state.context.difficulty;

export const Hud: React.FC = () => {
  const { portalService } = useContext(PortalContext);

  const isJoystickActive = useSelector(portalService, _isJoystickActive);
  // const achievements = useSelector(portalService, _achievements);
  const isPlaying = useSelector(portalService, _isPlaying);
  const difficulty = useSelector(portalService, _difficulty) as PuzzleDifficulty;

  // achievement toast provider
  // const { showAchievementToasts } = useAchievementToast();

  // show new achievements
  // const [existingAchievementNames, setExistingAchievements] = React.useState(
  //   Object.keys(achievements),
  // );
  // useEffect(() => {
  //   const achievementNames = Object.keys(achievements);
  //   const newAchievementNames = achievementNames.filter(
  //     (achievement) => !existingAchievementNames.includes(achievement),
  //   );
  //   if (newAchievementNames.length > 0) {
  //     showAchievementToasts(newAchievementNames);
  //     setExistingAchievements(achievementNames);
  //   }
  // }, [achievements]);

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
          {isPlaying && (
            <>
              <Target />
              <Difficulty difficulty={difficulty} />
              <Lives />
              <Score />
            </>
          )}
        </div>

        <>
          <Travel />
          <Settings />
        </>
      </div>
    </HudContainer>
  );
};
