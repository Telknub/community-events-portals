import React, { useContext, useMemo, useState } from "react";
import Decimal from "decimal.js-light";
import { useSelector } from "@xstate/react";
import classNames from "classnames";

import { Box } from "components/ui/Box";
import { Button } from "components/ui/Button";
import { Label } from "components/ui/Label";
import { ButtonPanel, InnerPanel } from "components/ui/Panel";
import { PortalContext } from "../../lib/PortalProvider";
import { PortalMachineState } from "../../lib/Machine";
import { WEAPON_CONFIGS, WEAPON_UPGRADE_XP_COSTS } from "../../constants";
import { WeaponId, WeaponLevel, WeaponRuntimeStats } from "../../Types";
import { SUNNYSIDE } from "assets/sunnyside";

import hoeIcon from "public/world/portal/images/hoe.webp";
import cornIcon from "public/world/portal/images/skill_corn_bomb_icon.webp";
import beeIcon from "public/world/portal/images/skill_summon_bees_icon.webp";
import waterIcon from "public/world/portal/images/skill_water_pistol_icon.webp";
import bladeIcon from "public/world/portal/images/skill_windBlade_skill_icon.webp";

const WEAPON_ICONS: Record<WeaponId, string> = {
  hoe: hoeIcon,
  broomScythe: bladeIcon,
  wateringCan: waterIcon,
  corn: cornIcon,
  tomato: cornIcon,
  sunflower: waterIcon,
  wheat: hoeIcon,
  pumpkin: cornIcon,
  beehive: beeIcon,
};

const WEAPON_IDS = Object.keys(WEAPON_CONFIGS) as WeaponId[];

export const WEAPON_NAMES: Record<WeaponId, string> = {
  hoe: "Hoe",
  broomScythe: "Broom Scythe",
  wateringCan: "Watering Can",
  corn: "Corn Bomb",
  tomato: "Tomato",
  sunflower: "Sunflower",
  wheat: "Wheat",
  pumpkin: "Pumpkin",
  beehive: "Beehive",
};

const DETAIL_STATS: (keyof WeaponRuntimeStats)[] = [
  "damage",
  "cooldownMs",
  "projectileCount",
  "areaRadius",
  "range",
  "orbitalCount",
];

const _weaponsState = (state: PortalMachineState) => ({
  hudWeapons: state.context.hudWeapons,
  selectedWeapon: state.context.selectedWeapon,
  weaponLevels: state.context.weaponLevels,
});

const _weaponPanelState = (state: PortalMachineState) => ({
  collected: state.context.collected,
  selectedWeapon: state.context.selectedWeapon,
  weaponLevels: state.context.weaponLevels,
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

const ProgressBar: React.FC<{
  percent: number;
  color?: string;
  className?: string;
}> = ({ percent, color = "#59c36a", className }) => {
  return (
    <div
      className={classNames(
        "h-2 w-full overflow-hidden border border-[#7a4f37] bg-[#3f2f2a]",
        className,
      )}
    >
      <div
        className="h-full"
        style={{
          width: `${Math.max(0, Math.min(percent, 100))}%`,
          background: color,
        }}
      />
    </div>
  );
};

const WeaponIcon: React.FC<{
  id: WeaponId;
  className?: string;
}> = ({ id, className }) => {
  return (
    <img
      src={WEAPON_ICONS[id]}
      alt={WEAPON_NAMES[id]}
      className={classNames("object-contain pixelated", className)}
    />
  );
};

export const Weapons: React.FC = () => {
  const { portalService } = useContext(PortalContext);
  const { hudWeapons, selectedWeapon, weaponLevels } = useSelector(
    portalService,
    _weaponsState,
  );

  return (
    <div className="flex flex-col items-end gap-1">
      {hudWeapons.map((weapon) => {
        const level = weaponLevels[weapon];
        const isLocked = level === 0;

        return (
          <Box
            key={weapon}
            image={WEAPON_ICONS[weapon]}
            isSelected={weapon === selectedWeapon}
            count={new Decimal(level)}
            countLabelType="info"
            locked={isLocked}
            onClick={() =>
              portalService.send("SET_SELECTED_WEAPON", { weapon })
            }
          />
        );
      })}
    </div>
  );
};

export const WeaponsPanel: React.FC = () => {
  const { portalService } = useContext(PortalContext);
  const [inspectedWeapon, setInspectedWeapon] = useState<WeaponId>("hoe");

  const { collected, selectedWeapon, weaponLevels } = useSelector(
    portalService,
    _weaponPanelState,
  );

  const inspectedLevel = weaponLevels[inspectedWeapon];
  const inspectedCost = getUpgradeCost(inspectedLevel);
  const canUpgrade = inspectedCost !== undefined && collected >= inspectedCost;
  const isMaxLevel = inspectedCost === undefined;
  const canSelectInspectedWeapon = inspectedLevel > 0;

  const detailStats = useMemo(() => {
    const stats = WEAPON_CONFIGS[inspectedWeapon].baseStats;

    return DETAIL_STATS.map((stat) => ({
      stat,
      value: stats[stat],
    })).filter(({ value }) => value > 0);
  }, [inspectedWeapon]);

  const handleUpgrade = () => {
    portalService.send("UPGRADE_WEAPON", { weapon: inspectedWeapon });
  };

  const handleSelectWeapon = (weapon: WeaponId) => {
    if (weaponLevels[weapon] === 0) return;

    portalService.send("SET_SELECTED_WEAPON", { weapon });
  };

  return (
    <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_260px]">
      <InnerPanel className="max-h-[440px] overflow-y-auto p-2">
        <div className="mb-2 flex items-center justify-between">
          <Label type="default">{"Weapons"}</Label>
          <Label type="info">{`XP ${collected}`}</Label>
        </div>

        <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
          {WEAPON_IDS.map((weapon) => {
            const level = weaponLevels[weapon];
            const cost = getUpgradeCost(level);
            const percent = cost === undefined ? 100 : (collected / cost) * 100;
            const upgradeReady = cost !== undefined && collected >= cost;

            return (
              <ButtonPanel
                key={weapon}
                selected={weapon === inspectedWeapon}
                className="min-h-[82px] p-1"
                onClick={() => setInspectedWeapon(weapon)}
              >
                <div className="flex h-full flex-col justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <WeaponIcon id={weapon} className="h-9 w-9" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs">{WEAPON_NAMES[weapon]}</p>
                      <Label
                        type={
                          cost === undefined
                            ? "success"
                            : upgradeReady
                              ? "vibrant"
                              : "default"
                        }
                        className="mt-1"
                      >
                        {`Lvl ${level}`}
                      </Label>
                    </div>
                  </div>
                  <ProgressBar
                    percent={percent}
                    color={upgradeReady ? "#ffd65a" : "#6da6d8"}
                  />
                </div>
              </ButtonPanel>
            );
          })}
        </div>
      </InnerPanel>

      <InnerPanel className="flex min-h-[360px] flex-col p-2">
        <div className="flex items-start gap-3">
          <ButtonPanel className="flex h-20 w-20 items-center justify-center">
            <WeaponIcon id={inspectedWeapon} className="h-14 w-14" />
          </ButtonPanel>

          <div className="min-w-0 flex-1">
            <p className="text-sm">{WEAPON_NAMES[inspectedWeapon]}</p>
            <div className="mt-1 flex flex-wrap gap-1">
              <Label type="default">{`Lvl ${inspectedLevel}`}</Label>
              {selectedWeapon === inspectedWeapon ? (
                <Label type="success">{"Selected"}</Label>
              ) : null}
              {inspectedLevel === 0 ? (
                <Label type="danger">{"Locked"}</Label>
              ) : null}
            </div>
          </div>
        </div>

        <div className="my-3">
          <div className="mb-1 flex items-center justify-between text-xs">
            <span>
              {isMaxLevel ? "Max level" : `Next level: ${inspectedCost} XP`}
            </span>
            <span>{`XP ${collected}`}</span>
          </div>
          <ProgressBar
            percent={
              inspectedCost === undefined
                ? 100
                : (collected / inspectedCost) * 100
            }
            color={canUpgrade || isMaxLevel ? "#ffd65a" : "#6da6d8"}
          />
        </div>

        <div className="grid grid-cols-2 gap-1">
          {detailStats.map(({ stat, value }) => (
            <Label key={stat} type="default">
              {`${stat}: ${Math.round(value)}`}
            </Label>
          ))}
        </div>

        <div className="mt-auto flex items-center gap-2 pt-3">
          <Button
            disabled={!canUpgrade}
            onClick={handleUpgrade}
            className="flex-1"
          >
            {isMaxLevel ? "Max Level" : "Level Up"}
          </Button>
          <button
            type="button"
            disabled={!canSelectInspectedWeapon}
            className={classNames(
              "flex h-10 w-10 items-center justify-center rounded bg-blueGray-800 p-1 hover:brightness-110",
              {
                "cursor-not-allowed opacity-50": !canSelectInspectedWeapon,
                "cursor-pointer": canSelectInspectedWeapon,
              },
            )}
            onClick={() => handleSelectWeapon(inspectedWeapon)}
            title="Select for HUD"
          >
            <img
              src={SUNNYSIDE.icons.confirm}
              alt="Select for HUD"
              className="h-6 w-6 object-contain"
            />
          </button>
        </div>
      </InnerPanel>
    </div>
  );
};
