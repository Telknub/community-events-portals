import React, { useState } from "react";
import { getWearableImage } from "features/game/lib/getWearableImage";
import { STATIC_OFFLINE_FARM } from "features/game/lib/landDataStatic";
import type { Equipped } from "features/game/types/bumpkin";
import { OuterPanel } from "components/ui/Panel";
import { Label } from "components/ui/Label";
import { useAppTranslation } from "lib/i18n/useAppTranslations";
import { PASSIVE_ABILITY_ITEM, PORTAL_NAME } from "../../constants";
import { AbilityTooltip } from "./AbilityTooltip";

export const AbilityWearables: React.FC<{ bumpkinParts: Equipped }> = ({
  bumpkinParts,
}) => {
  const { t } = useAppTranslation();

  const [openId, setOpenId] = useState<string | null>(null);
  const { wings: equippedWings } = bumpkinParts;

  const wings =
    equippedWings && PASSIVE_ABILITY_ITEM.includes(equippedWings)
      ? equippedWings
      : undefined;
  if (!wings) return null;

  return (
    <OuterPanel className="w-full flex flex-col items-center">
      <Label type="default">{t(`${PORTAL_NAME}.passiveAbility`)}</Label>
      <div className="flex flex-row mb-5 text-sm">
        {wings && (
          <AbilityTooltip
            id="wings"
            image={getWearableImage(wings)}
            description={STATIC_OFFLINE_FARM.bumpkin.equipped.aura}
            openId={openId}
            setOpenId={setOpenId}
          />
        )}
      </div>
    </OuterPanel>
  );
};
