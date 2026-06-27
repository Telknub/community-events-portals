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
  BumpkinItem,
  BumpkinPart,
} from "features/game/types/bumpkin";
import { getWearableImage } from "features/game/lib/getWearableImage";
import { BumpkinParts } from "lib/utils/tokenUriBuilder";
import { useAppTranslation } from "lib/i18n/useAppTranslations";
import { PORTAL_NAME } from "../../constants";

const PANEL_CONTENT_HEIGHT = "h-[400px]";

export const WEARABLES_TAB_ITEMS: BumpkinItem[] = [
  "Carrot Pitchfork",
  "Handheld Bunny",
  "Bunny Mask",
  "Bunny Pants",
  "Easter Apron",
  "Slime Hat",
  "Slime Wings",
  "Slime Aura",
  "Paint Splattered Hair",
  "Paint Splattered Shirt",
  "Paint Splattered Overalls",
  "Paint Spray Can",
  "Moonseeker Potion",
  "Frizzy Bob Cut",
  "Two-toned Layered",
  "Halloween Deathscythe",
  "Moonseeker Hand Puppet",
  "Sweet Devil Horns",
  "Trick and Treat",
  "Jack O'Sweets",
  "Frank Onesie",
  "Research Uniform",
  "Sweet Devil Dress",
  "Underworld Stimpack",
  "Sweet Devil Wings",
  "Wisp Aura",
  "Comfy Xmas Sweater",
  "Comfy Xmas Pants",
  "Candy Halbred",
  "Xmas Top Hat",
  "Reindeer Mask",
  "Snowman Mask",
  "Cool Glasses",
  "Cookie Shield",
  "Holiday Feast Background",
  "Cozy Reindeer Onesie",
  "Diamond Snow Aura",
  "Neon Noiz Jacket",
  "404 Chic Top",
  "Neon Noiz Pants",
  "404 Chic Skirt",
  "Admin Fools Tools",
  "Neon Noiz Shoes",
  "404 Chic Boots",
  "Aether Specs",
  "Faulty Barrier Background",
  "Cardboard Wings",
  "Glitch Aura",
];

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

  const selectedWearableImageClassName = classNames(
    "h-full w-full object-contain pixelated",
    {
      grayscale:
        effectiveSelectedWearable &&
        !isWearableAvailable(effectiveSelectedWearable),
    },
  );

  return (
    <div className={`flex gap-2 ${PANEL_CONTENT_HEIGHT}`}>
      <OuterPanel className="flex h-full flex-col p-2 w-[61%]">
        <div className="mb-2 flex items-center">
          <Label type="default">{t(`equip.${selectedBumpkinPart}`)}</Label>
        </div>

        <div className="flex h-full overflow-y-auto scrollable">
          <div className="grid grid-cols-5 gap-1 h-fit">
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

      <OuterPanel className="flex h-full flex-col items-center p-2 text-center flex-1">
        <div className="flex w-24 h-24 items-center justify-center rounded-md overflow-hidden mt-2">
          <img
            src={getWearableImage(effectiveSelectedWearable)}
            alt={effectiveSelectedWearable}
            className={selectedWearableImageClassName}
          />
        </div>
        <p className="mt-2 text-sm">{effectiveSelectedWearable}</p>
        <p className="mt-2 text-xs">
          {t(`${PORTAL_NAME}.wearablePowerComingSoon`)}
        </p>
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
