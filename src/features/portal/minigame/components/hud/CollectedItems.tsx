import React, { useContext } from "react";
import { Box } from "components/ui/Box";
import { PortalMachineState } from "../../lib/Machine";
import item from "public/world/pearl.webp";
import Decimal from "decimal.js-light";
import { useSelector } from "@xstate/react";
import { PortalContext } from "../../lib/PortalProvider";

const _item = (state: PortalMachineState) => state.context.collected;

export const ColletedItems: React.FC = () => {
  const { portalService } = useContext(PortalContext);

  const itemCount = useSelector(portalService, _item);
  return (
    <>
      <Box
        image={item}
        count={new Decimal(itemCount)}
        className="flex-shrink-0"
      />
    </>
  );
};
