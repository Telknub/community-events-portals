import React, { useContext, useState } from "react";
import { useSelector } from "@xstate/react";
import { PortalContext } from "../../lib/PortalProvider";
import { PIXEL_SCALE } from "features/game/lib/constants";
import { SUNNYSIDE } from "assets/sunnyside";
import { goHome } from "features/portal/lib/portalUtil";
import { PortalMachineState } from "../../lib/Machine";
import { useSound } from "lib/utils/hooks/useSound";
import classNames from "classnames";
import { isTouchDevice } from "features/world/lib/device";
import { Modal } from "components/ui/Modal";
import { CodexPanel } from "../panels/CodexPanel";

const _isPlaying = (state: PortalMachineState) => state.matches("playing");
const _isJoystickActive = (state: PortalMachineState) =>
  state.context.isJoystickActive;

export const Codex: React.FC = () => {
  const { portalService } = useContext(PortalContext);

  const isPlaying = useSelector(portalService, _isPlaying);
  const isJoystickActive = useSelector(portalService, _isJoystickActive);

  const [show, onExit] = useState(false);

  const button = useSound("button");

  // useEffect(() => {
  //   if (isPlaying) return;

  //   onExit(false);
  // }, [isPlaying]);

  return (
    <>
      <div
        className={classNames(
          "flex relative z-50 justify-center cursor-pointer",
          {
            "hover:img-highlight": !isJoystickActive && !isTouchDevice(),
          },
        )}
        style={{
          width: `${PIXEL_SCALE * 22}px`,
          height: `${PIXEL_SCALE * 23}px`,
        }}
        onClick={() => {
          button.play();
          if (isPlaying) {
            onExit(true);
          } else {
            goHome();
          }
        }}
      >
        <img
          src={SUNNYSIDE.ui.round_button}
          className="absolute"
          style={{
            width: `${PIXEL_SCALE * 22}px`,
          }}
        />
        <img
          src={SUNNYSIDE.icons.search}
          style={{
            width: `${PIXEL_SCALE * 12}px`,
            left: `${PIXEL_SCALE * 5}px`,
            top: `${PIXEL_SCALE * 4}px`,
          }}
          className="absolute"
        />
      </div>
      <Modal show={show} onHide={() => onExit(false)}>
        <CodexPanel show={show} onHide={() => onExit(false)} />
      </Modal>
    </>
  );
};
