import React, { useContext, useMemo, useState } from "react";
import { useSelector } from "@xstate/react";
import classNames from "classnames";

import { Button } from "components/ui/Button";
import { Label } from "components/ui/Label";
import { OuterPanel } from "components/ui/Panel";
import { useAppTranslation } from "lib/i18n/useAppTranslations";
import { PortalContext } from "../../lib/PortalProvider";
import type { PortalMachineState } from "../../lib/Machine";
import {
  PORTAL_NAME,
  resolveWeaponStats,
  WEAPON_ICONS,
  WEAPON_IDS,
  WEAPON_NAMES,
  WEAPON_STAT_LABELS,
} from "../../constants";
import type { WeaponId, WeaponLevel } from "../../Types";
import { StatCard } from "./StatCard";
import {
  formatStatValue,
  getWeaponDetailStats,
  hasStatImproved,
  resolveDisplayedWeaponStatValue,
} from "./weaponStats";
import powerupIcon from "assets/icons/level_up.png";

const PANEL_CONTENT_HEIGHT = "h-[442px]";

const _weaponPanelState = (state: PortalMachineState) => ({
  weaponLevels: state.context.weaponLevels,
  damageLevel: state.context.playerStatLevels.damage,
  activeWearables: state.context.activeWearables,
  xpPoints: state.context.xpPoints,
});

const getNextLevel = (level: WeaponLevel) => {
  if (level >= 8) return undefined;

  return (level + 1) as WeaponLevel;
};

const WeaponIcon: React.FC<{
  id: WeaponId;
  className?: string;
}> = ({ id, className }) => {
  const { t } = useAppTranslation();

  return (
    <img
      src={WEAPON_ICONS[id]}
      alt={t(WEAPON_NAMES[id])}
      className={classNames("object-contain pixelated", className)}
    />
  );
};

export const WeaponsTab: React.FC = () => {
  const { t } = useAppTranslation();
  const { portalService } = useContext(PortalContext);
  const [inspectedWeapon, setInspectedWeapon] = useState<WeaponId>();

  const { weaponLevels, damageLevel, activeWearables, xpPoints } = useSelector(
    portalService,
    _weaponPanelState,
  );

  const unlockedWeapons = useMemo(
    () => WEAPON_IDS.filter((weapon) => weaponLevels[weapon] > 0),
    [weaponLevels],
  );

  const selectedWeapon =
    inspectedWeapon && weaponLevels[inspectedWeapon] > 0
      ? inspectedWeapon
      : unlockedWeapons[0];

  const inspectedLevel = selectedWeapon
    ? weaponLevels[selectedWeapon]
    : undefined;
  const nextLevel =
    inspectedLevel === undefined ? undefined : getNextLevel(inspectedLevel);
  const canUpgrade =
    selectedWeapon !== undefined &&
    inspectedLevel !== undefined &&
    inspectedLevel > 0 &&
    nextLevel !== undefined &&
    xpPoints > 0;
  const isMaxLevel =
    inspectedLevel !== undefined && getNextLevel(inspectedLevel) === undefined;

  const detailStats = useMemo(() => {
    if (!selectedWeapon || inspectedLevel === undefined) return [];

    const currentStats = resolveWeaponStats(
      selectedWeapon,
      inspectedLevel,
      activeWearables,
    );
    const nextStats = nextLevel
      ? resolveWeaponStats(selectedWeapon, nextLevel, activeWearables)
      : undefined;

    return getWeaponDetailStats(selectedWeapon, activeWearables).map(
      (stat) => ({
        stat,
        currentValue: resolveDisplayedWeaponStatValue({
          stat,
          value: currentStats?.[stat],
          damageLevel,
          activeWearables,
        }),
        nextValue: resolveDisplayedWeaponStatValue({
          stat,
          value: nextStats?.[stat],
          damageLevel,
          activeWearables,
        }),
      }),
    );
  }, [activeWearables, damageLevel, inspectedLevel, nextLevel, selectedWeapon]);

  const handleUpgrade = () => {
    if (!selectedWeapon || !canUpgrade) return;

    portalService.send("UPGRADE_WEAPON", { weapon: selectedWeapon });
  };

  return (
    <div className={`flex gap-1 sm:gap-2 ${PANEL_CONTENT_HEIGHT}`}>
      <OuterPanel className="flex h-full w-fit flex-col p-2 sm:w-[61%]">
        <div className="mb-2 flex items-center">
          <Label type={xpPoints > 0 ? "warning" : "default"}>
            {t(`${PORTAL_NAME}.xpPoints`, { points: xpPoints })}
          </Label>
        </div>

        <div className="h-full overflow-y-auto scrollable">
          <div className="grid h-fit grid-cols-1 gap-1 pt-3 sm:grid-cols-3 sm:gap-2">
            {WEAPON_IDS.map((weapon) => {
              const level = weaponLevels[weapon];
              const isUnlocked = level > 0;

              return (
                <StatCard
                  key={weapon}
                  title={t(WEAPON_NAMES[weapon])}
                  label={{
                    value: t(`${PORTAL_NAME}.weaponLevel`, { level }),
                    type: level >= 8 ? "success" : "info",
                  }}
                  img={{ src: WEAPON_ICONS[weapon] }}
                  selected={weapon === selectedWeapon}
                  disabled={!isUnlocked}
                  onClick={() => setInspectedWeapon(weapon)}
                  className="mb-2 min-h-[82px] w-20 sm:w-auto"
                />
              );
            })}
          </div>
        </div>
      </OuterPanel>

      <OuterPanel className="flex h-full flex-1 flex-col p-2">
        {selectedWeapon && inspectedLevel !== undefined ? (
          <>
            <div className="flex flex-col items-center gap-1">
              <Label className="w-full text-sm">
                {t(WEAPON_NAMES[selectedWeapon])}
              </Label>
              <div className="flex h-20 w-20 items-center justify-center">
                <WeaponIcon id={selectedWeapon} className="h-16 w-16" />
              </div>

              <div className="flex flex-wrap gap-1 w-28">
                {isMaxLevel ? (
                  <Label type="success" className="w-full">
                    {t(`${PORTAL_NAME}.maxLevel`)}
                  </Label>
                ) : (
                  <Label type="info" className="w-full">
                    {t(`${PORTAL_NAME}.weaponLevel`, {
                      level: inspectedLevel,
                    })}
                  </Label>
                )}
              </div>
            </div>

            <table className="mt-1 w-full table-fixed border-collapse text-xxs">
              <colgroup>
                <col className="w-[56%]" />
                <col className="w-[22%]" />
                <col className="w-[22%]" />
              </colgroup>
              <thead>
                <tr className="bg-[#917e5c]">
                  <th
                    style={{ border: "1px solid #352e22" }}
                    className="px-1 py-[1px] text-left leading-none"
                  />
                  <th
                    style={{ border: "1px solid #352e22" }}
                    className="px-[2px] py-[1px] text-center leading-none"
                  >
                    {"Cur."}
                  </th>
                  <th
                    style={{ border: "1px solid #352e22" }}
                    className="px-[2px] py-[1px] text-center leading-none"
                  >
                    {"Nxt."}
                  </th>
                </tr>
              </thead>
              <tbody>
                {detailStats.map(({ stat, currentValue, nextValue }, index) => (
                  <tr
                    key={stat}
                    className={classNames("relative", {
                      "bg-[#ead4aa]": index % 2 === 0,
                    })}
                  >
                    <td
                      style={{ border: "1px solid #352e22" }}
                      className="whitespace-normal break-words px-1 py-[1px] text-left leading-none"
                    >
                      {t(WEAPON_STAT_LABELS[stat])}
                    </td>
                    <td
                      style={{ border: "1px solid #352e22" }}
                      className="whitespace-nowrap px-[2px] py-[1px] text-center leading-none"
                    >
                      {currentValue === undefined
                        ? "-"
                        : formatStatValue(stat, currentValue)}
                    </td>
                    <td
                      style={{ border: "1px solid #352e22" }}
                      className="whitespace-nowrap px-[2px] py-[1px] text-center leading-none"
                    >
                      <span className="inline-flex items-center justify-center gap-[1px]">
                        {nextValue === undefined
                          ? "-"
                          : formatStatValue(stat, nextValue)}
                        {hasStatImproved(stat, currentValue, nextValue) ? (
                          <img
                            src={powerupIcon}
                            width={10}
                            className="object-contain pixelated"
                          />
                        ) : null}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-auto flex items-center gap-1 pt-3 px-2">
              <Button
                disabled={!canUpgrade}
                onClick={handleUpgrade}
                className="flex-1"
              >
                {isMaxLevel ? (
                  t(`${PORTAL_NAME}.maxLevel`)
                ) : (
                  <span className="flex items-center justify-center gap-1">
                    <img
                      src={powerupIcon}
                      width={14}
                      className="object-contain pixelated"
                    />
                    {t(`${PORTAL_NAME}.levelUp`)}
                  </span>
                )}
              </Button>
            </div>
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-center text-xs">
            {t(`${PORTAL_NAME}.noWeaponsChosen`)}
          </div>
        )}
      </OuterPanel>
    </div>
  );
};
