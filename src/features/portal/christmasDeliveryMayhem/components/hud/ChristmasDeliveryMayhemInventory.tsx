import React, { useContext } from "react";
import { useSelector } from "@xstate/react";
import { PortalContext } from "../../lib/PortalProvider";
import { PIXEL_SCALE } from "features/game/lib/constants";
import { Label } from "components/ui/Label";
import { PortalMachineState } from "../../lib/christmasDeliveryMayhemMachine";
import { useAppTranslation } from "lib/i18n/useAppTranslations";

import gift_1 from "public/world/_gift_1.png";
import gift_2 from "public/world/_gift_2.png";
import gift_3 from "public/world/_gift_3.png";
import gift_4 from "public/world/_gift_4.png";
import gift_5 from "public/world/_gift_5.png";
import gift_6 from "public/world/_gift_6.png";

import { Gifts } from "../../ChristmasDeliveryMayhemConstants";
import { Box } from "components/ui/Box";

const _gifts = (state: PortalMachineState) => state.context.gifts as Gifts[];

export const ChristmasDeliveryMayhemInventory: React.FC = () => {
  const { t } = useAppTranslation();

  const { portalService } = useContext(PortalContext);

  const gifts = useSelector(portalService, _gifts);
  const imageGifts: Record<string, string> = {
    gift_1: gift_1,
    gift_2: gift_2,
    gift_3: gift_3,
    gift_4: gift_4,
    gift_5: gift_5,
    gift_6: gift_6,
  };

  return (
    <div
      className="absolute flex flex-col items-center"
      style={{
        top: `${PIXEL_SCALE * 3}px`,
        right: `${PIXEL_SCALE * 3}px`,
      }}
    >
      <Label type={"default"}>{t("christmas-delivery.inventory")}</Label>

      <div className="relative flex flex-col items-center">
        {gifts.map((gift: Gifts, index) => (
          <Box key={index} image={imageGifts[gift]} />
        ))}
      </div>
    </div>
  );
};
