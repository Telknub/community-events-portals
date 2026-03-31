import React, { useState } from "react";
import { getWearableImage } from "features/game/lib/getWearableImage";
import {
  AURA_IMMUNITY,
  TOOL_IMMUNITY,
  SHOES_IMMUNITY,
  HAT_IMMUNITY,
} from "../../Constants";
import { ImmunityTooltip } from "./ImmunityTooltip";
import { GameState } from "features/game/types/game";

// Remove
type Props = {
  gameState: GameState;
};

export const Immunities_Wearables: React.FC<Props> = ({ gameState }) => {
  const [openId, setOpenId] = useState<string | null>(null);
  const {
    aura: equippedAura,
    tool: equippedTool,
    shoes: equippedShoe,
    hat: equippedHat,
  } = gameState.bumpkin.equipped; // STATIC_OFFLINE_FARM

  const aura =
    equippedAura && AURA_IMMUNITY.includes(equippedAura)
      ? equippedAura
      : undefined;
  const tool =
    equippedTool && TOOL_IMMUNITY.includes(equippedTool)
      ? equippedTool
      : undefined;
  const shoe =
    equippedShoe && SHOES_IMMUNITY.includes(equippedShoe)
      ? equippedShoe
      : undefined;
  const hat =
    equippedHat && HAT_IMMUNITY.includes(equippedHat) ? equippedHat : undefined;

  if (!aura && !tool && !shoe && !hat) return null;

  return (
    <div className="flex flex-row mb-5 text-sm">
      {aura && (
        <ImmunityTooltip
          id="aura"
          image={getWearableImage(aura)}
          description={gameState.bumpkin.equipped.aura} // STATIC_OFFLINE_FARM
          openId={openId}
          setOpenId={setOpenId}
        />
      )}
      {tool && (
        <ImmunityTooltip
          id="tool"
          image={getWearableImage(tool)}
          description={gameState.bumpkin.equipped.tool} // STATIC_OFFLINE_FARM
          openId={openId}
          setOpenId={setOpenId}
        />
      )}
      {shoe && (
        <ImmunityTooltip
          id="shoe"
          image={getWearableImage(shoe)}
          description={gameState.bumpkin.equipped.shoes} // STATIC_OFFLINE_FARM
          openId={openId}
          setOpenId={setOpenId}
        />
      )}
      {hat && (
        <ImmunityTooltip
          id="hat"
          image={getWearableImage(hat)}
          description={gameState.bumpkin.equipped.hat} // STATIC_OFFLINE_FARM
          openId={openId}
          setOpenId={setOpenId}
        />
      )}
    </div>
  );
};
