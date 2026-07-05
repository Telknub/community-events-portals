import React, { useContext, useMemo, useState } from "react";
import { useSelector } from "@xstate/react";
import classNames from "classnames";

import { Button } from "components/ui/Button";
import { Checkbox } from "components/ui/Checkbox";
import { Label } from "components/ui/Label";
import { OuterPanel } from "components/ui/Panel";
import { ResizableBar } from "components/ui/ProgressBar";
import { useAppTranslation } from "lib/i18n/useAppTranslations";
import { PortalContext } from "../../lib/PortalProvider";
import { PortalMachineState } from "../../lib/Machine";
import {
  PORTAL_NAME,
  WEAPON_ICONS,
  WEAPON_IDS,
  WEAPON_NAMES,
  WEAPON_STAT_LABELS,
  WEAPON_UPGRADE_XP_COSTS,
} from "../../constants";
import { WeaponId, WeaponLevel } from "../../Types";
import { StatCard } from "./StatCard";
import {
  formatStatValue,
  getWeaponDetailStats,
  hasStatImproved,
  resolveDisplayedWeaponStatValue,
  resolveWeaponStats,
} from "./weaponStats";
import powerupIcon from "assets/icons/level_up.png";

const PANEL_CONTENT_HEIGHT = "h-[400px]";

const _weaponPanelState = (state: PortalMachineState) => ({
  collected: state.context.collected,
  hudWeapons: state.context.hudWeapons,
  selectedWeapon: state.context.selectedWeapon,
  weaponLevels: state.context.weaponLevels,
  damageLevel: state.context.playerStatLevels.damage,
});

const getNextLevel = (level: WeaponLevel) => {
  if (level >= 8) return undefined;

  return (level + 1) as WeaponLevel;
};

const getUpgradeCost = (level: WeaponLevel) => {
  const nextLevel = getNextLevel(level);
  if (!nextLevel) return undefined;

  return WEAPON_UPGRADE_XP_COSTS[nextLevel] ?? undefined;
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
  const [inspectedWeapon, setInspectedWeapon] = useState<WeaponId>("banana");

  const { collected, hudWeapons, selectedWeapon, weaponLevels, damageLevel } =
    useSelector(portalService, _weaponPanelState);

  const inspectedLevel = weaponLevels[inspectedWeapon];
  const inspectedCost = getUpgradeCost(inspectedLevel);
  const canUpgrade = inspectedCost !== undefined && collected >= inspectedCost;
  const isMaxLevel = inspectedCost === undefined;
  const canSelectInspectedWeapon = inspectedLevel > 0;

  const detailStats = useMemo(() => {
    const currentStats =
      inspectedLevel > 0
        ? resolveWeaponStats(inspectedWeapon, inspectedLevel)
        : undefined;
    const nextLevel = getNextLevel(inspectedLevel);
    const nextStats = nextLevel
      ? resolveWeaponStats(inspectedWeapon, nextLevel)
      : undefined;

    return getWeaponDetailStats(inspectedWeapon).map((stat) => ({
      stat,
      currentValue: resolveDisplayedWeaponStatValue({
        stat,
        value: currentStats?.[stat],
        damageLevel,
      }),
      nextValue: resolveDisplayedWeaponStatValue({
        stat,
        value: nextStats?.[stat],
        damageLevel,
      }),
    }));
  }, [damageLevel, inspectedLevel, inspectedWeapon]);

  const handleUpgrade = () => {
    portalService.send("UPGRADE_WEAPON", { weapon: inspectedWeapon });
  };

  const handleSelectWeapon = (weapon: WeaponId) => {
    if (weaponLevels[weapon] === 0) return;

    portalService.send("SET_SELECTED_WEAPON", { weapon });
  };

  return (
    <div className={`flex gap-2 ${PANEL_CONTENT_HEIGHT}`}>
      <OuterPanel className="flex h-full flex-col p-2 w-[61%]">
        <div className="mb-2 flex items-center">
          <Label type="default">
            {t(`${PORTAL_NAME}.xpAmount`, { xp: collected })}
          </Label>
        </div>

        <div className="h-full overflow-y-auto scrollable">
          <div className="grid grid-cols-3 gap-2 h-fit pt-3">
            {WEAPON_IDS.map((weapon) => {
              const level = weaponLevels[weapon];
              const cost = getUpgradeCost(level);
              const percent =
                cost === undefined ? 100 : (collected / cost) * 100;
              const upgradeReady = cost !== undefined && collected >= cost;
              const progress =
                cost !== undefined
                  ? {
                      percentage: Math.max(0, Math.min(percent, 100)),
                      type: upgradeReady
                        ? ("health" as const)
                        : ("progress" as const),
                    }
                  : undefined;

              return (
                <StatCard
                  key={weapon}
                  title={t(WEAPON_NAMES[weapon])}
                  label={{
                    value: t(`${PORTAL_NAME}.weaponLevel`, { level }),
                    type:
                      cost === undefined
                        ? "success"
                        : upgradeReady
                          ? "info"
                          : "vibrant",
                  }}
                  img={{ src: WEAPON_ICONS[weapon] }}
                  {...(progress ? { progress } : {})}
                  selected={weapon === inspectedWeapon}
                  showConfirm={hudWeapons.includes(weapon)}
                  onClick={() => setInspectedWeapon(weapon)}
                  className="min-h-[82px] mb-4"
                />
              );
            })}
          </div>
        </div>
      </OuterPanel>

      <OuterPanel className="flex h-full flex-1 flex-col p-2">
        <div className="flex items-start gap-3">
          <div className="flex h-20 w-20 items-center justify-center">
            <WeaponIcon id={inspectedWeapon} className="h-16 w-16" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm">{t(WEAPON_NAMES[inspectedWeapon])}</p>
            <div className="mt-1 flex flex-wrap gap-1">
              <Label type="default">
                {t(`${PORTAL_NAME}.weaponLevel`, { level: inspectedLevel })}
              </Label>
              {selectedWeapon === inspectedWeapon ? (
                <Label type="success">{t(`${PORTAL_NAME}.selected`)}</Label>
              ) : null}
              {inspectedLevel === 0 ? (
                <Label type="danger">{t(`${PORTAL_NAME}.locked`)}</Label>
              ) : null}
            </div>
          </div>
        </div>

        <div className="my-3 flex flex-col items-center gap-2">
          <Label type={isMaxLevel ? "success" : "default"}>
            {isMaxLevel
              ? t(`${PORTAL_NAME}.maxLevel`)
              : `Next Lvl: ${inspectedCost} XP`}
          </Label>
          <ResizableBar
            percentage={
              inspectedCost === undefined
                ? 100
                : (collected / inspectedCost) * 100
            }
            type={canUpgrade || isMaxLevel ? "health" : "progress"}
            outerDimensions={{ width: 40, height: 7.5 }}
          />
        </div>

        <table className="w-full table-fixed border-collapse text-xxs">
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
            {isMaxLevel
              ? t(`${PORTAL_NAME}.maxLevel`)
              : t(`${PORTAL_NAME}.levelUp`)}
          </Button>
          <div title={t(`${PORTAL_NAME}.selectForHud`)}>
            <Checkbox
              checked={hudWeapons.includes(inspectedWeapon)}
              disabled={!canSelectInspectedWeapon}
              onChange={() => handleSelectWeapon(inspectedWeapon)}
            />
          </div>
        </div>
      </OuterPanel>
    </div>
  );
};
