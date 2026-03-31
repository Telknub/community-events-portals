import React, { useState } from "react";
import { getWearableImage } from "features/game/lib/getWearableImage";
import { AURA_IMMUNITY, TOOL_IMMUNITY, SHOES_IMMUNITY, HAT_IMMUNITY, PORTAL_NAME } from "../../Constants";
import { ImmunityTooltip } from "./ImmunityTooltip";
import { STATIC_OFFLINE_FARM } from "features/game/lib/landDataStatic";
import { Equipped } from "features/game/types/bumpkin";
import { OuterPanel } from "components/ui/Panel";
import { Label } from "components/ui/Label";
import { useAppTranslation } from "lib/i18n/useAppTranslations";

export const ImmunitiesWearables: React.FC<{ bumpkinParts: Equipped }> = ({ bumpkinParts }) => {
  const { t } = useAppTranslation();

  const { aura: equippedAura, tool: equippedTool, shoes: equippedShoe, hat: equippedHat } =
    bumpkinParts;

  const aura = equippedAura && AURA_IMMUNITY.includes(equippedAura) ? equippedAura : undefined;
  const tool = equippedTool && TOOL_IMMUNITY.includes(equippedTool) ? equippedTool : undefined;
  const shoe = equippedShoe && SHOES_IMMUNITY.includes(equippedShoe) ? equippedShoe : undefined;
  const hat = equippedHat && HAT_IMMUNITY.includes(equippedHat) ? equippedHat : undefined;

  if (!aura && !tool && !shoe && !hat) return null;

  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <OuterPanel className="w-full flex flex-col items-center">
      <Label type="default">
        {t(`${PORTAL_NAME}.Immunity`)}
      </Label>
      <div className="flex flex-row mb-5 text-sm">
        {aura && (
          <ImmunityTooltip
            id="aura"
            image={getWearableImage(aura)}
            description={STATIC_OFFLINE_FARM.bumpkin.equipped.aura}
            openId={openId}
            setOpenId={setOpenId}
          />
        )}
        {tool && (
          <ImmunityTooltip
            id="tool"
            image={getWearableImage(tool)}
            description={STATIC_OFFLINE_FARM.bumpkin.equipped.tool}
            openId={openId}
            setOpenId={setOpenId}
          />
        )}
        {shoe && (
          <ImmunityTooltip
            id="shoe"
            image={getWearableImage(shoe)}
            description={STATIC_OFFLINE_FARM.bumpkin.equipped.shoes}
            openId={openId}
            setOpenId={setOpenId}
          />
        )}
        {hat && (
          <ImmunityTooltip
            id="hat"
            image={getWearableImage(hat)}
            description={STATIC_OFFLINE_FARM.bumpkin.equipped.hat}
            openId={openId}
            setOpenId={setOpenId}
          />
        )}
      </div>
    </OuterPanel>
  );
};