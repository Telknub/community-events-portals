import React, { useContext } from "react";
import { Box } from "components/ui/Box";
import { PortalMachineState } from "../../lib/Machine";
import item from "public/world/portal/images/ExpOrb_combined.webp";
import Decimal from "decimal.js-light";
import { useSelector } from "@xstate/react";
import { PortalContext } from "../../lib/PortalProvider";
import { PORTAL_NAME } from "../../constants";
import { useAppTranslation } from "lib/i18n/useAppTranslations";
import { Label } from "components/ui/Label";

const _item = (state: PortalMachineState) => state.context.collected;

export const ColletedItems: React.FC = () => {
  const { t } = useAppTranslation();
  const { portalService } = useContext(PortalContext);

  const itemCount = useSelector(portalService, _item);
  return (
    <>
      <Label type="default">{t(`${PORTAL_NAME}.scoreTitle`)}</Label>
      <Box
        image={item}
        count={new Decimal(itemCount)}
        className="flex-shrink-0 mt-3"
      />
    </>
  );
};
