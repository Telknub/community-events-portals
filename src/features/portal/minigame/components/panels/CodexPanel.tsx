import React from "react";
import { OuterPanel } from "components/ui/Panel";
import { PIXEL_SCALE } from "features/game/lib/constants";
import { SUNNYSIDE } from "assets/sunnyside";
import { SquareIcon } from "components/ui/SquareIcon";
import { useSound } from "lib/utils/hooks/useSound";
import { useState } from "react";
import { useAppTranslation } from "lib/i18n/useAppTranslations";
import classNames from "classnames";
import enemyIcon from "public/world/portal/images/icon_boss_3.webp";
import weaponIcon from "public/world/portal/images/skill_water_pistol_icon.webp";
import dropItemIcon from "public/world/portal/images/dropItem1.webp";

import { DropItemsXP, Enemies, Skills } from "./CodexCategories";
import { CodexCategoryName } from "../../Types";

interface Props {
  show: boolean;
  onHide: () => void;
}

export const CodexPanel: React.FC<Props> = ({ onHide }) => {
  const { t } = useAppTranslation();
  const [currentTab, setCurrentTab] = useState<CodexCategoryName>("Skills");
  const tab = useSound("tab");

  const handleTabClick = (index: CodexCategoryName) => {
    tab.play();
    setCurrentTab(index);
  };

  const categories: {
    name: CodexCategoryName;
    icon: string;
  }[] = [
    { name: "Skills", icon: weaponIcon },
    { name: "Enemies", icon: enemyIcon },
    { name: "DropItems", icon: dropItemIcon },
  ];

  return (
    <div className="h-[500px] relative">
      <OuterPanel className="p-2">
        <div className="flex items-center pl-1 mb-2">
          <div className="flex items-center grow">
            <img src={SUNNYSIDE.icons.search} className="h-6 mr-3 ml-1" />
            <p>{t("festival-of-colors.codex")}</p>
          </div>
          <img
            src={SUNNYSIDE.icons.close}
            className="float-right cursor-pointer z-20 ml-3"
            onClick={onHide}
            style={{
              width: `${PIXEL_SCALE * 11}px`,
            }}
          />
        </div>
        <div
          className="relative h-full overflow-hidden"
          style={{
            paddingLeft: `${PIXEL_SCALE * 16.5}px`,
          }}
        >
          {/* Tabs */}
          <div className="absolute top-1.5 left-0">
            <div className="flex flex-col">
              {categories.map((tab) => (
                <OuterPanel
                  key={tab.name}
                  className={classNames(
                    "flex items-center relative p-0.5 mb-1 cursor-pointer",
                  )}
                  onClick={() => handleTabClick(tab.name)}
                  style={{
                    background: currentTab === tab.name ? "#ead4aa" : undefined,
                  }}
                >
                  <SquareIcon icon={tab.icon} width={9} />
                </OuterPanel>
              ))}
            </div>
          </div>
          {currentTab === "Skills" && <Skills />}
          {currentTab === "Enemies" && <Enemies />}
          {currentTab === "DropItems" && <DropItemsXP />}
        </div>
      </OuterPanel>
    </div>
  );
};
