import React, { useMemo, useState } from "react";
import classNames from "classnames";

import { ModalOverlay } from "components/ui/ModalOverlay";
import { Label } from "components/ui/Label";
import { ButtonPanel, InnerPanel, OuterPanel } from "components/ui/Panel";
import { SquareIcon } from "components/ui/SquareIcon";
import { useAppTranslation } from "lib/i18n/useAppTranslations";
import {
  PORTAL_NAME,
  resolveWeaponStats,
  WEAPON_DESCRIPTIONS,
  WEAPON_ICONS,
  WEAPON_IDS,
  WEAPON_NAMES,
  WEAPON_STAT_DESCRIPTIONS,
  WEAPON_STAT_LABELS,
} from "../../constants";
import type { WeaponId, WeaponLevel, WeaponRuntimeStats } from "../../Types";
import { formatStatValue, getUpgradeableWeaponStats } from "./weaponStats";
import infoIcon from "assets/icons/info.webp";

const PANEL_CONTENT_HEIGHT = "h-[442px]";
const GUIDE_LEVELS: WeaponLevel[] = [1, 2, 3, 4, 5, 6, 7, 8];

export const WeaponsGuide: React.FC = () => {
  const { t } = useAppTranslation();
  const [selectedWeapon, setSelectedWeapon] = useState<WeaponId>("banana");
  const [selectedLevel, setSelectedLevel] = useState<WeaponLevel>(1);
  const [selectedStat, setSelectedStat] = useState<keyof WeaponRuntimeStats>();

  const stats = useMemo(() => {
    const weaponStats = resolveWeaponStats(selectedWeapon, selectedLevel);

    return getUpgradeableWeaponStats(selectedWeapon).map((stat) => ({
      stat,
      value: weaponStats[stat],
    }));
  }, [selectedLevel, selectedWeapon]);

  return (
    <div className={`relative flex ${PANEL_CONTENT_HEIGHT} pl-4 sm:pl-0`}>
      <div className="flex h-full w-12 flex-col items-center justify-center">
        <div className="flex max-h-full flex-col gap-1 overflow-y-auto scrollable">
          {WEAPON_IDS.map((weapon) => (
            <OuterPanel
              key={weapon}
              className={classNames(
                "flex h-9 w-9 cursor-pointer items-center justify-center p-0.5 hover:brightness-110",
              )}
              style={{
                background: selectedWeapon === weapon ? "#ead4aa" : undefined,
              }}
              onClick={() => {
                setSelectedWeapon(weapon);
                setSelectedLevel(1);
              }}
            >
              <SquareIcon icon={WEAPON_ICONS[weapon]} width={9} />
            </OuterPanel>
          ))}
        </div>
      </div>

      <OuterPanel className="flex h-full flex-1 flex-col gap-2 overflow-y-auto p-2 sm:flex-row sm:gap-3 sm:overflow-visible scrollable">
        <div className="flex w-full flex-col items-center gap-2 sm:h-full sm:w-[38%] sm:gap-10">
          <Label className="w-full text-sm">
            {t(WEAPON_NAMES[selectedWeapon])}
          </Label>
          <div className="relative flex items-center justify-center">
            <div
              className="absolute bottom-3 h-8 w-20 rounded-full opacity-70 blur-md sm:bottom-4 sm:h-12 sm:w-28"
              style={{
                background:
                  "radial-gradient(circle, #fff2a8 0%, #f8c65a 38%, transparent 72%)",
              }}
            />
            <img
              src={WEAPON_ICONS[selectedWeapon]}
              alt={t(WEAPON_NAMES[selectedWeapon])}
              className="relative z-10 h-20 w-20 object-contain pixelated drop-shadow-[0_0_8px_rgba(255,235,160,0.85)] sm:h-28 sm:w-28"
            />
          </div>
          <InnerPanel className="flex w-full items-center sm:flex-1">
            <p className="px-1 text-center text-xs leading-tight">
              {t(WEAPON_DESCRIPTIONS[selectedWeapon])}
            </p>
          </InnerPanel>
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-start sm:justify-center">
          <div className="grid grid-cols-4 gap-1">
            {GUIDE_LEVELS.map((level) => (
              <ButtonPanel
                key={level}
                selected={selectedLevel === level}
                className="flex flex-col h-12 w-100 items-center justify-center text-xs text-center"
                onClick={() => setSelectedLevel(level)}
              >
                <span>{t(`${PORTAL_NAME}.level`)}</span>
                <span>{`${level}`}</span>
              </ButtonPanel>
            ))}
          </div>

          <table className="mt-3 w-full table-fixed border-collapse text-xs">
            <colgroup>
              <col className="w-[68%]" />
              <col className="w-[32%]" />
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
                  {t(`festival-of-colors.weaponLevel`, {
                    level: selectedLevel,
                  })}
                </th>
              </tr>
            </thead>
            <tbody>
              {stats.map(({ stat, value }, index) => (
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
                    <div className="flex items-center gap-1">
                      <span>{t(WEAPON_STAT_LABELS[stat])}</span>
                      <button
                        type="button"
                        className="flex h-4 w-4 shrink-0 items-center justify-center hover:brightness-110"
                        onClick={() => setSelectedStat(stat)}
                      >
                        <img
                          src={infoIcon}
                          alt={t(WEAPON_STAT_LABELS[stat])}
                          className="h-4 w-4 object-contain"
                        />
                      </button>
                    </div>
                  </td>
                  <td
                    style={{ border: "1px solid #352e22" }}
                    className="whitespace-nowrap px-[2px] py-[1px] text-center leading-none"
                  >
                    {formatStatValue(stat, value)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </OuterPanel>

      <ModalOverlay
        show={selectedStat !== undefined}
        onBackdropClick={() => setSelectedStat(undefined)}
      >
        {selectedStat && (
          <OuterPanel className="p-2">
            <Label type="default" className="mb-2">
              {t(WEAPON_STAT_LABELS[selectedStat])}
            </Label>
            <p className="text-sm p-1">
              {t(WEAPON_STAT_DESCRIPTIONS[selectedStat])}
            </p>
          </OuterPanel>
        )}
      </ModalOverlay>
    </div>
  );
};
