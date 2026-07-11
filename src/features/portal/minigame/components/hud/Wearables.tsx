import React, { useMemo, useState } from "react";
import Decimal from "decimal.js-light";
import classNames from "classnames";

import { Box, INNER_CANVAS_WIDTH } from "components/ui/Box";
import { Button } from "components/ui/Button";
import { Label } from "components/ui/Label";
import { OuterPanel } from "components/ui/Panel";
import { SquareIcon } from "components/ui/SquareIcon";
import { SUNNYSIDE } from "assets/sunnyside";
import {
  BUMPKIN_ITEM_PART,
  type BumpkinItem,
  type BumpkinPart,
} from "features/game/types/bumpkin";
import { getWearableImage } from "features/game/lib/getWearableImage";
import type { BumpkinParts } from "lib/utils/tokenUriBuilder";
import { useAppTranslation } from "lib/i18n/useAppTranslations";
import {
  getWearableBuffDescriptionKey,
  NEW_WEARABLES,
  NO_WEARABLE_BUFF_SCORE_MULTIPLIER,
  PASSIVE_ABILITY_ITEM,
  PORTAL_NAME,
  WEAPON_ICONS,
  WEAPON_NAMES,
  WEAPON_STAT_LABELS,
  WEARABLE_BUFFS,
  WEARABLES_TAB_ITEMS,
  type WearableBuff,
} from "../../constants";
import type { PlayerStatId, WeaponRuntimeStats } from "../../Types";
import powerupIcon from "assets/icons/level_up.png";
import speedIcon from "public/world/portal/images/lightning.png";
import swordIcon from "public/world/portal/images/sword_icon.png";
import { formatStatValue } from "./weaponStats";

const PANEL_CONTENT_HEIGHT = "h-[442px]";

const STAT_BUFF_ICONS: Record<PlayerStatId, string> = {
  health: SUNNYSIDE.icons.heart,
  speed: speedIcon,
  damage: swordIcon,
};

const getWearableBuffIcon = (wearable?: BumpkinItem) => {
  if (!wearable) return powerupIcon;

  const buff = WEARABLE_BUFFS[wearable];
  if (!buff) return powerupIcon;

  if (buff.target.type === "playerStat") {
    return STAT_BUFF_ICONS[buff.target.stat] ?? powerupIcon;
  }

  if (buff.target.type === "weaponStat") {
    return WEAPON_ICONS[buff.target.weapon] ?? powerupIcon;
  }

  return powerupIcon;
};

const formatSmallBuffValue = (value: number) => {
  if (Number.isInteger(value)) return value;

  return Number(value.toFixed(5));
};

const formatSignedBuffValue = (
  stat: keyof WeaponRuntimeStats,
  value: number,
) => {
  const absoluteValue = Math.abs(value);
  const formattedValue = stat.endsWith("Ms")
    ? `${formatStatValue(stat, absoluteValue)}s`
    : formatSmallBuffValue(absoluteValue);
  const sign = value >= 0 ? "+" : "-";

  return `${sign}${formattedValue}`;
};

export const WearablesTab: React.FC<{
  selectedBumpkinPart: BumpkinPart;
  equipped?: BumpkinParts;
  availableWearableCounts: Partial<Record<BumpkinItem, number>>;
  onEquipWearable: (wearable: BumpkinItem) => void;
}> = ({
  selectedBumpkinPart,
  equipped,
  availableWearableCounts,
  onEquipWearable,
}) => {
  const { t } = useAppTranslation();
  const [selectedWearable, setSelectedWearable] = useState<
    BumpkinItem | undefined
  >();

  const wearablesForPart = useMemo(() => {
    return WEARABLES_TAB_ITEMS.filter(
      (name) => BUMPKIN_ITEM_PART[name] === selectedBumpkinPart,
    );
  }, [selectedBumpkinPart]);

  const isWearableAvailable = (name: BumpkinItem) => {
    const part = BUMPKIN_ITEM_PART[name];
    const isEquipped = equipped?.[part] === name;

    return (availableWearableCounts[name] ?? 0) > 0 || isEquipped;
  };

  const effectiveSelectedWearable =
    selectedWearable && wearablesForPart.includes(selectedWearable)
      ? selectedWearable
      : wearablesForPart[0];

  const canEquipSelectedWearable =
    !!equipped &&
    !!effectiveSelectedWearable &&
    isWearableAvailable(effectiveSelectedWearable);

  const isSelectedWearableEquipped =
    !!effectiveSelectedWearable &&
    equipped?.[BUMPKIN_ITEM_PART[effectiveSelectedWearable]] ===
      effectiveSelectedWearable;

  const isSelectedWearableNew =
    !!effectiveSelectedWearable && NEW_WEARABLES.has(effectiveSelectedWearable);
  const selectedWearableBuff = effectiveSelectedWearable
    ? WEARABLE_BUFFS[effectiveSelectedWearable]
    : undefined;
  const selectedWearableBuffIcon = getWearableBuffIcon(
    effectiveSelectedWearable,
  );
  const selectedWearableDescriptionKey =
    getWearableBuffDescriptionKey(effectiveSelectedWearable) ??
    (effectiveSelectedWearable === PASSIVE_ABILITY_ITEM
      ? `${PORTAL_NAME}.AbilityDescription`
      : `${PORTAL_NAME}.wearablePowerComingSoon`);
  const getWearableBuffDescription = (buff: WearableBuff) => {
    if (buff.target.type === "weaponStat") {
      const weaponName = t(WEAPON_NAMES[buff.target.weapon]);
      const statName = t(WEAPON_STAT_LABELS[buff.target.stat]).toLowerCase();
      const value = formatSignedBuffValue(buff.target.stat, buff.value);

      return `${weaponName} ${statName} ${value}.`;
    }

    return t(selectedWearableDescriptionKey as never);
  };

  const selectedWearableImageClassName = classNames(
    "h-full w-full object-contain pixelated",
    {
      grayscale:
        effectiveSelectedWearable &&
        !isWearableAvailable(effectiveSelectedWearable),
    },
  );

  return (
    <div className={`flex gap-1 sm:gap-2 ${PANEL_CONTENT_HEIGHT}`}>
      <div className="flex h-full w-[60%] flex-col gap-2 sm:w-[61%]">
        <OuterPanel className="h-full p-2">
          <div className="mb-2 flex items-center">
            <Label type="default">{t(`equip.${selectedBumpkinPart}`)}</Label>
          </div>

          <div className="flex h-full overflow-y-auto scrollable">
            <div className="grid h-fit grid-cols-3 gap-0 sm:gap-1 [@media(max-width:360px)]:grid-cols-1 sm:grid-cols-5">
              {wearablesForPart.map((name) => {
                const isEquipped = equipped?.[BUMPKIN_ITEM_PART[name]] === name;
                const isAvailable = isWearableAvailable(name);
                const amount = Math.min(availableWearableCounts[name] ?? 0, 3);

                return (
                  <Box
                    key={name}
                    isSelected={effectiveSelectedWearable === name}
                    onClick={() => setSelectedWearable(name)}
                    count={new Decimal(amount)}
                    countLabelType="default"
                  >
                    <>
                      {isEquipped ? (
                        <img
                          src={SUNNYSIDE.icons.confirm}
                          className="absolute -left-2 -top-2 z-10 h-5"
                        />
                      ) : null}
                      <SquareIcon
                        icon={getWearableImage(name)}
                        width={INNER_CANVAS_WIDTH}
                        className={classNames({ grayscale: !isAvailable })}
                      />
                    </>
                  </Box>
                );
              })}
            </div>
          </div>
        </OuterPanel>

        <Label type="info" className="w-full">
          {t(`${PORTAL_NAME}.noWearableBuffScoreBonus`, {
            multiplier: NO_WEARABLE_BUFF_SCORE_MULTIPLIER,
          })}
        </Label>
      </div>

      <OuterPanel className="flex h-full flex-1 flex-col items-center p-2 text-center sm:flex-1">
        <Label type="default" className="sm:text-sm w-full">
          {effectiveSelectedWearable}
        </Label>
        <div className="flex w-24 h-24 items-center justify-center rounded-md overflow-hidden mt-2">
          <img
            src={getWearableImage(effectiveSelectedWearable)}
            alt={effectiveSelectedWearable}
            className={selectedWearableImageClassName}
          />
        </div>
        {isSelectedWearableNew && (
          <Label type="info" className="mt-2 sm:text-xs">
            {t("wearables.new")}
          </Label>
        )}
        {selectedWearableBuff ? (
          <Label
            type="formula"
            icon={selectedWearableBuffIcon}
            className="mt-2 sm:text-xs max-w-full text-center leading-tight"
          >
            {getWearableBuffDescription(selectedWearableBuff)}
          </Label>
        ) : (
          <Label
            type="formula"
            icon={powerupIcon}
            className="mt-2 max-w-full text-center leading-tight"
          >
            {t(selectedWearableDescriptionKey as never)}
          </Label>
        )}
        <Button
          disabled={!canEquipSelectedWearable}
          onClick={() => onEquipWearable(effectiveSelectedWearable)}
          className="mt-auto w-full"
        >
          {isSelectedWearableEquipped
            ? t("unequip")
            : t(`${PORTAL_NAME}.equip`)}
        </Button>
      </OuterPanel>
    </div>
  );
};
