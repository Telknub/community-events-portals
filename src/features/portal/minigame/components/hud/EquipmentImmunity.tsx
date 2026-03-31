import React from "react";
import { getWearableImage } from "features/game/lib/getWearableImage";
import { Box } from "components/ui/Box";
import { STATIC_OFFLINE_FARM } from "features/game/lib/landDataStatic";
import { AURA_IMMUNITY, TOOL_IMMUNITY } from "../../Constants";

export const Equipment_Immunity: React.FC = () => {
  const { aura: equippedAura, tool: equippedTool } =
    STATIC_OFFLINE_FARM.bumpkin.equipped;

  const aura =
    equippedAura && AURA_IMMUNITY.includes(equippedAura)
      ? equippedAura
      : undefined;
  const tool =
    equippedTool && TOOL_IMMUNITY.includes(equippedTool)
      ? equippedTool
      : undefined;

  if (!aura && !tool) return null;

  return (
    <div className="relative flex flex-col items-end gap-3">
      {aura && <Box image={getWearableImage(aura)} className="h-10" />}
      {tool && <Box image={getWearableImage(tool)} className="h-10" />}
    </div>
  );
};
