import React, { useContext } from "react";
import { useSelector } from "@xstate/react";
import { PortalContext } from "../../lib/PortalProvider";
import { PortalMachineState } from "../../lib/christmasDeliveryMayhemMachine";
import { useAppTranslation } from "lib/i18n/useAppTranslations";
import { SquareIcon } from "components/ui/SquareIcon";
import { Label } from "components/ui/Label";

import gift_1 from "public/world/_gift_1.png";
import gift_2 from "public/world/_gift_2.png";
import gift_3 from "public/world/_gift_3.png";
import gift_4 from "public/world/_gift_4.png";
import gift_5 from "public/world/_gift_5.png";
import gift_6 from "public/world/_gift_6.png";
import loading from "public/world/loading.png";
import { InnerPanel } from "components/ui/Panel";

const _deliveries = (state: PortalMachineState) => state.context.deliveries;

export const ChristmasDeliveryMayhemDeliveries: React.FC = () => {
  const { t } = useAppTranslation();

  const { portalService } = useContext(PortalContext);

  const deliveries = useSelector(portalService, _deliveries);
  const imageGifts: Record<string, string> = {
    gift_1: gift_1,
    gift_2: gift_2,
    gift_3: gift_3,
    gift_4: gift_4,
    gift_5: gift_5,
    gift_6: gift_6,
  };

  return (
    <div className="flex flex-col gap-1 pointer-events-none">
      {/* <Label type={"info"}>{t("christmas-delivery.deliveries")}</Label> */}
      <Label type={"default"}>{t("christmas-delivery.left")}</Label>
      <div className="flex flex-col gap-1">
        {deliveries?.left.map((delivery, index) => (
          <InnerPanel key={index} className="flex w-fit bg-opacity-50">
            {delivery.length > 0 ? (
              delivery.map((gift, index) => (
                <SquareIcon key={index} icon={imageGifts[gift]} width={8} />
              ))
            ) : (
              <SquareIcon key={index} icon={loading} width={8} />
            )}
          </InnerPanel>
        ))}
      </div>
      <Label type={"default"}>{t("christmas-delivery.right")}</Label>
      <div className="flex flex-col gap-1">
        {deliveries?.right.map((delivery, index) => (
          <InnerPanel key={index} className="flex w-fit bg-opacity-50">
            {delivery.length > 0 ? (
              delivery.map((gift, index) => (
                <SquareIcon key={index} icon={imageGifts[gift]} width={8} />
              ))
            ) : (
              <SquareIcon key={index} icon={loading} width={8} />
            )}
          </InnerPanel>
        ))}
      </div>
    </div>
  );
};
