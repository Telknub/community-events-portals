import React from "react";
import { ButtonPanel, InnerPanel } from "components/ui/Panel";
import {
  SKILLS_TABLE,
  DROP_ITEMS_XP_TABLE,
  ENEMIES_TABLE,
  PORTAL_NAME,
} from "../../constants/ConfigConstants";
import { useAppTranslation } from "lib/i18n/useAppTranslations";

export const Skills: React.FC = () => {
  const { t } = useAppTranslation();
  return (
    <div className="flex md:flex-row flex-col-reverse md:mr-1 items-start h-full">
      <InnerPanel className="p-2 w-full">
        <p className="text-sm mb-1">{t(`${PORTAL_NAME}.skills`)}</p>
        <div className="grid grid-cols-2 sm:grid-cols-3  w-full mt-1 gap-1">
          {SKILLS_TABLE.map((skill, index) => (
            <SkillsCard
              key={index}
              icon={skill.image}
              weaponName={skill.skillName}
              damage={skill.damage}
            />
          ))}
        </div>
      </InnerPanel>
      <div />
    </div>
  );
};

export const DropItemsXP: React.FC = () => {
  const { t } = useAppTranslation();
  return (
    <div className="flex md:flex-row flex-col-reverse md:mr-1 items-start h-full">
      <InnerPanel className="p-2 w-full">
        <p className="text-sm mb-1">{t(`${PORTAL_NAME}.dropItemXP`)}</p>
        <div className="grid grid-cols-2 sm:grid-cols-3  w-full mt-1 gap-1">
          {DROP_ITEMS_XP_TABLE.map((item, index) => (
            <DropItemCard key={index} icon={item.image} xp={item.xp} />
          ))}
        </div>
      </InnerPanel>
      <div />
    </div>
  );
};

export const Enemies: React.FC = () => {
  const { t } = useAppTranslation();
  return (
    <div className="flex md:flex-row flex-col-reverse md:mr-1 items-start h-full">
      <InnerPanel className="p-2 w-full">
        <p className="text-sm mb-1">{t(`${PORTAL_NAME}.enemy`)}</p>
        <div className="grid grid-cols-2 sm:grid-cols-3  w-full mt-1 gap-1">
          {ENEMIES_TABLE.map((item, index) => (
            <EnemyCard
              key={index}
              icon={item.image}
              type={item.type}
              hp={item.hp}
              itemIcon={item.itemIcon}
            />
          ))}
        </div>
      </InnerPanel>
      <div />
    </div>
  );
};

export const SkillsCard: React.FC<{
  icon: string;
  weaponName: string;
  damage: number;
}> = ({ icon, damage, weaponName }) => {
  const { t } = useAppTranslation();
  return (
    <ButtonPanel className="flex flex-col items-center">
      <img src={icon} className="h-10 mr-1" />
      <span className="text-xs">{weaponName}</span>
      <div className="flex flex-col items-start pt-3">
        <span className="text-xs">
          {t(`${PORTAL_NAME}.damage`)} {damage}
        </span>
      </div>
    </ButtonPanel>
  );
};

export const DropItemCard: React.FC<{
  icon: string;
  xp: number;
}> = ({ icon, xp }) => {
  const { t } = useAppTranslation();
  return (
    <ButtonPanel className="flex flex-col items-center">
      <img src={icon} className="h-10 mr-1" />
      <div className="flex flex-col items-start pt-3">
        <span className="text-xs">
          {t(`${PORTAL_NAME}.xp`)} {xp}
        </span>
      </div>
    </ButtonPanel>
  );
};

export const EnemyCard: React.FC<{
  icon: string;
  type: string;
  hp: number;
  itemIcon: string;
}> = ({ icon, type, hp, itemIcon }) => {
  const { t } = useAppTranslation();
  return (
    <ButtonPanel className="flex flex-col items-center">
      <img src={icon} className="h-10 mr-1" />
      <span className="text-xs">{type}</span>
      <div className="flex flex-col items-start pt-3">
        <span className="text-xs">
          {t(`${PORTAL_NAME}.hp`)} {hp}
        </span>
        <div className="flex flex-row gap-2">
          <span className="text-xs">{t(`${PORTAL_NAME}.drop`)}</span>
          <img src={itemIcon} className="h-4 mr-1" />
        </div>
      </div>
    </ButtonPanel>
  );
};
