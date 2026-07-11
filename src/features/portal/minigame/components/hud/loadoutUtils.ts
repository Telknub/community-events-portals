import type { BumpkinItem, BumpkinPart } from "features/game/types/bumpkin";
import type { BumpkinParts } from "lib/utils/tokenUriBuilder";
import { WEARABLES_TAB_ITEMS } from "../../constants/WearableConstants";

export const reconcileLoadoutWithDefaultEquipment = ({
  loadout,
  defaultEquipment,
}: {
  loadout: BumpkinParts;
  defaultEquipment: BumpkinParts;
}): BumpkinParts => {
  const reconciled = { ...loadout };
  const parts = new Set([
    ...Object.keys(loadout),
    ...Object.keys(defaultEquipment),
  ] as BumpkinPart[]);

  parts.forEach((part) => {
    const wearable = reconciled[part] as BumpkinItem | undefined;
    if (wearable && WEARABLES_TAB_ITEMS.includes(wearable)) return;

    const defaultWearable = defaultEquipment[part];
    if (defaultWearable) {
      reconciled[part] = defaultWearable as never;
    } else {
      delete reconciled[part];
    }
  });

  return reconciled;
};
