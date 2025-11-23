import React, { useContext } from "react";
import { useSelector } from "@xstate/react";

import { PortalContext } from "../../lib/PortalProvider";
import useUiRefresher from "lib/utils/hooks/useUiRefresher";
import { Label } from "components/ui/Label";
import { PortalMachineState } from "../../lib/christmasDeliveryMayhemMachine";
import {
  EVENT_INTERVAL,
  GAME_SECONDS,
  EVENTS_NAMES,
  Events,
  EVENT_SELECTION_TIME,
  INITIAL_EVENT_START_TIME,
} from "../../ChristmasDeliveryMayhemConstants";
import { PIXEL_SCALE } from "features/game/lib/constants";

import coal from "public/world/coal.png";
import snowflake from "public/world/snowflake_icon.png";
import grit from "public/world/grit_icon.png";
import { useAppTranslation } from "lib/i18n/useAppTranslations";

const _endAt = (state: PortalMachineState) => state.context.endAt;
const _event = (state: PortalMachineState) => state.context.event;
const _isPlaying = (state: PortalMachineState) => state.matches("playing");
const _isJoystickActive = (state: PortalMachineState) =>
  state.context.isJoystickActive;

let nextGoal = 1;
let placeholderEvent: Events = "";
let iconName: Events = "";
let indexEvent = 0;
const eventIcon: Record<Events, any> = {
  storm: snowflake,
  krampus: coal,
  grit: grit,
  "": "",
};

const getRandomEvent = () => {
  const randomIndex = Math.floor(Math.random() * EVENTS_NAMES.length);
  return EVENTS_NAMES[randomIndex];
};

export const ChristmasDeliveryMayhemSelectingEvent: React.FC = () => {
  useUiRefresher({ delay: 100 });

  const { t } = useAppTranslation();
  const { portalService } = useContext(PortalContext);
  const endAt = useSelector(portalService, _endAt);
  const event = useSelector(portalService, _event);
  const isPlaying = useSelector(portalService, _isPlaying);
  const isJoystickActive = useSelector(portalService, _isJoystickActive);

  const secondsLeft = !endAt
    ? GAME_SECONDS
    : Math.max(endAt - Date.now(), 0) / 1000;

  // Reset
  if (!isPlaying) {
    nextGoal = 1;
    placeholderEvent = "";
    iconName = "";
    indexEvent = 0;
  } else {
    const millisecondsPassed =
      (GAME_SECONDS - secondsLeft) * 1000 +
      (EVENT_INTERVAL - INITIAL_EVENT_START_TIME);
    const completedEvents = Math.floor(millisecondsPassed / EVENT_INTERVAL);

    // console.log(millisecondsPassed / EVENT_INTERVAL, nextGoal);

    // Selecting Event
    if (
      millisecondsPassed >= EVENT_INTERVAL * nextGoal - EVENT_SELECTION_TIME &&
      millisecondsPassed <= EVENT_INTERVAL * nextGoal
    ) {
      placeholderEvent = EVENTS_NAMES[indexEvent];
      iconName = placeholderEvent;

      if (indexEvent === EVENTS_NAMES.length - 1) {
        indexEvent = 0;
      } else {
        indexEvent += 1;
      }
    }

    // Select Event
    if (completedEvents === nextGoal) {
      const currentEvent = getRandomEvent();
      iconName = currentEvent;
      placeholderEvent = "";
      portalService.send("UPDATE_EVENT", { event: currentEvent });
      nextGoal += 1;
    }
  }

  return (
    <>
      {isPlaying && (
        <div
          className={
            !isJoystickActive
              ? "absolute flex flex-col items-center w-screen mb-3"
              : ""
          }
          style={
            !isJoystickActive
              ? {
                  bottom: `${PIXEL_SCALE * 3}px`,
                }
              : {}
          }
        >
          {(event !== "" || placeholderEvent !== "") && (
            <Label
              className="space-x-2 text-xs"
              icon={eventIcon[iconName]}
              type={"info"}
            >
              {event !== "" && placeholderEvent === ""
                ? t("christmas-delivery.event")
                : t("christmas-delivery.choosingEvent")}
            </Label>
          )}
        </div>
      )}
    </>
  );
};
