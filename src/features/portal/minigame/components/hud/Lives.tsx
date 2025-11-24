import React, { useContext } from "react";
import { useSelector } from "@xstate/react";
import { PortalContext } from "../../lib/PortalProvider";
import { PortalMachineState } from "../../lib/Machine";
import { SUNNYSIDE } from "assets/sunnyside";
import { SquareIcon } from "components/ui/SquareIcon";

const _lives = (state: PortalMachineState) => state.context.lives;

export const Lives: React.FC = () => {
  const { portalService } = useContext(PortalContext);

  const lives = useSelector(portalService, _lives);
  const arrLives = Array.from({ length: lives }, (_, index) => index);

  return (
    <div className="flex gap-2">
      {arrLives.map((_, index) => (
        <SquareIcon key={index} icon={SUNNYSIDE.icons.heart} width={10} />
      ))}
    </div>
  );
};
