import React from "react";

import { useAppTranslation } from "lib/i18n/useAppTranslations";
import { SUNNYSIDE } from "assets/sunnyside";
import { SquareIcon } from "components/ui/SquareIcon";
import { Label } from "components/ui/Label";
import { EVENTS_TABLE } from "../../ChristmasDeliveryMayhemConstants";
import { PIXEL_SCALE } from "features/game/lib/constants";
import { useSound } from "lib/utils/hooks/useSound";

import Gift1 from "public/world/_gift_1.png";
import GritIcon from "public/world/grit_icon.png";
import Gift3 from "public/world/_gift_3.png";
import Gift4 from "public/world/_gift_4.png";
import Gift5 from "public/world/_gift_5.png";
import Gift6 from "public/world/_gift_6.png";
import Elf from "public/world/elfl.gif";
import Pad from "public/world/greenpad.png";
import Bonfire from "public/world/Fogueira.gif";

type Props = {
  onBack: () => void;
};

export const ChristmasDeliveryMayhemGuide: React.FC<Props> = ({ onBack }) => {
  const { t } = useAppTranslation();

  const button = useSound("button");

  return (
    <div className="flex flex-col gap-1 max-h-[75vh]">
      {/* title */}
      <div className="flex flex-col gap-1">
        <div className="flex text-center">
          <div
            className="flex-none"
            style={{
              width: `${PIXEL_SCALE * 11}px`,
              marginLeft: `${PIXEL_SCALE * 2}px`,
            }}
          >
            <img
              src={SUNNYSIDE.icons.arrow_left}
              className="cursor-pointer"
              onClick={() => {
                button.play();
                onBack();
              }}
              style={{
                width: `${PIXEL_SCALE * 11}px`,
              }}
            />
          </div>
          <div className="grow mb-3 text-lg">
            {t("christmas-delivery.guide")}
          </div>
          <div className="flex-none">
            <div
              style={{
                width: `${PIXEL_SCALE * 11}px`,
                marginRight: `${PIXEL_SCALE * 2}px`,
              }}
            />
          </div>
        </div>
      </div>

      {/* content */}
      <div className="flex flex-col gap-1 overflow-y-auto scrollable pr-1">
        {/* instructions */}
        <Label type="default">{t("christmas-delivery.instructions")}</Label>
        <div>
          <div className="flex items-center mb-3 mx-2">
            <SquareIcon icon={Elf} width={10} />
            <p className="text-xs ml-3 flex-1">
              {t("christmas.guide.instructions1")}
            </p>
          </div>
        </div>
        <div>
          <div className="flex items-center mb-3 mx-2">
            <SquareIcon icon={Gift1} width={10} />
            <p className="text-xs ml-3 flex-1">
              {t("christmas.guide.instructions2")}
            </p>
          </div>
        </div>
        <div>
          <div className="flex items-center mb-3 mx-2">
            <SquareIcon icon={GritIcon} width={10} />
            <p className="text-xs ml-3 flex-1">
              {t("christmas.guide.instructions3")}
            </p>
          </div>
        </div>
        <div>
          <div className="flex items-center mb-3 mx-2">
            <SquareIcon icon={Gift3} width={10} />
            <p className="text-xs ml-3 flex-1">
              {t("christmas.guide.instructions4")}
            </p>
          </div>
        </div>
        <div>
          <div className="flex items-center mb-3 mx-2">
            <SquareIcon icon={Pad} width={10} />
            <p className="text-xs ml-3 flex-1">
              {t("christmas.guide.instructions5")}
            </p>
          </div>
        </div>
        <div>
          <div className="flex items-center mb-3 mx-2">
            <SquareIcon icon={Bonfire} width={10} />
            <p className="text-xs ml-3 flex-1">
              {t("christmas.guide.instructions6")}
            </p>
          </div>
        </div>
        <div>
          <div className="flex items-center mb-3 mx-2">
            <SquareIcon icon={Gift4} width={10} />
            <p className="text-xs ml-3 flex-1">
              {t("christmas.guide.instructions7")}
            </p>
          </div>
        </div>
        <div>
          <div className="flex items-center mb-3 mx-2">
            <SquareIcon icon={Gift5} width={10} />
            <p className="text-xs ml-3 flex-1">
              {t("christmas.guide.instructions8")}
            </p>
          </div>
        </div>
        <div>
          <div className="flex items-center mb-3 mx-2">
            <SquareIcon icon={Gift6} width={10} />
            <p className="text-xs ml-3 flex-1">
              {t("christmas.guide.instructions9")}
            </p>
          </div>
        </div>
        {/* signs */}
        <Label type="default">{t("christmas.guide.event0")}</Label>
        <table className="w-full text-xs table-fixed border-collapse">
          <tbody>
            {Object.values(EVENTS_TABLE).map(({ item, description }, index) => (
              <tr key={index}>
                <td
                  style={{ border: "1px solid #b96f50" }}
                  className="p-1.5 w-1/6"
                >
                  <div className="flex items-center justify-center">
                    {<SquareIcon icon={item} width={13} />}
                  </div>
                </td>
                <td
                  style={{ border: "1px solid #b96f50" }}
                  className="p-1.5 w-5/6"
                >
                  {t("christmas-delivery.scoreDescription", {
                    description: description,
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
