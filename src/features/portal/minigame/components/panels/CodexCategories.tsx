import React from "react";
import { ButtonPanel, InnerPanel } from "components/ui/Panel";
import {
  SKILLS_TABLE,
  DROP_ITEMS_XP_TABLE,
  ENEMIES_TABLE,
  PORTAL_NAME,
} from "../../constants/ConfigConstants";
import { useAppTranslation } from "lib/i18n/useAppTranslations";
import { Label } from "components/ui/Label";

export const Skills: React.FC = () => {
  const { t } = useAppTranslation();
  return (
    <div className="flex md:flex-row flex-col-reverse md:mr-1 items-start h-full">
      <InnerPanel className="p-2 w-full">
        <Label type="default">{t(`${PORTAL_NAME}.weapon`)}</Label>
        <span className="text-xs">{t(`${PORTAL_NAME}.instructions6`)}</span>
        <div className="grid grid-cols-2 sm:grid-cols-3 w-full mt-2 gap-1">
          {SKILLS_TABLE.map((skill, index) => (
            <SkillsCard
              key={index}
              icon={skill.image}
              skillName={skill.skillName}
              minDamage={skill.minDamage}
              maxDamage={skill.maxDamage}
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
        <Label type="default">{t(`${PORTAL_NAME}.dropItemXP`)}</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 w-full mt-1 gap-1">
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
        <Label type="default">{t(`${PORTAL_NAME}.enemy`)}</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 w-full mt-1 gap-1">
          {ENEMIES_TABLE.map((item, index) => (
            <EnemyCard
              key={index}
              icon={item.image}
              type={item.type}
              hp={item.hp}
              damage={item.damage}
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
  skillName: string;
  minDamage: number;
  maxDamage: number;
}> = ({ icon, minDamage, skillName, maxDamage }) => {
  const { t } = useAppTranslation();
  return (
    <ButtonPanel className="flex flex-col items-center">
      <img src={icon} className="h-10 mr-1 pb-1" />
      <span className="text-xs font-bold">{skillName}</span>
      <div className="flex flex-col pt-3 w-full text-left">
        <span className="text-xs pb-2">{t(`${PORTAL_NAME}.damage`)}</span>
      </div>
      <table className="w-full border-collapse text-xs">
        <tbody>
          <tr>
            <th className="bg-black/10 px-2 py-1 text-left font-normal">
              {t(`${PORTAL_NAME}.min`)}
            </th>
            <td className="bg-black/10 px-2 py-1 text-center">{minDamage}</td>
          </tr>

          <tr>
            <th className="px-2 py-1 text-left font-normal">
              {t(`${PORTAL_NAME}.max`)}
            </th>
            <td className="px-2 py-1 text-center">{maxDamage}</td>
          </tr>
        </tbody>
      </table>
    </ButtonPanel>
  );
};

export const DropItemCard: React.FC<{
  icon: string;
  xp: number;
}> = ({ icon, xp }) => {
  const { t } = useAppTranslation();
  return (
    <ButtonPanel className="flex flex-col w-full items-center">
      <img src={icon} className="h-10 mr-1 pb-3" />
      <table className="mt-1 w-full border-collapse text-xs">
        <tbody>
          <tr>
            <th className="bg-black/10 px-2 py-1 text-center text-xs font-normal">
              {t(`${PORTAL_NAME}.xp`)}
            </th>
            <td className="bg-black/10 px-2 py-1 text-center text-xs">{xp}</td>
          </tr>
        </tbody>
      </table>
    </ButtonPanel>
  );
};

export const EnemyCard: React.FC<{
  icon: string;
  type: string;
  hp: number;
  damage: number;
  itemIcon: string;
}> = ({ icon, type, hp, damage, itemIcon }) => {
  const { t } = useAppTranslation();
  return (
    <ButtonPanel className="flex flex-col items-center">
      <img src={icon} className="h-10 mr-1 pb-1" />
      <span className="text-xs font-semibold">{type}</span>
      <table className="mt-3 w-full border-collapse text-xs">
        <tbody>
          <tr>
            <th className="bg-black/10 px-2 py-1 text-left font-normal">
              {t(`${PORTAL_NAME}.hp`)}
            </th>
            <td className="bg-black/10 px-2 py-1 text-center">{hp}</td>
          </tr>

          <tr>
            <th className="px-2 py-1 text-left font-normal">
              {t(`${PORTAL_NAME}.damage`)}
            </th>
            <td className="px-2 py-1 text-center">{damage}</td>
          </tr>

          <tr>
            <th className="bg-black/10 px-2 py-1 text-left font-normal">
              {t(`${PORTAL_NAME}.drop`)}
            </th>
            <td className="bg-black/10 px-2 py-1 text-center">
              <img src={itemIcon} className="inline-block h-4" />
            </td>
          </tr>
        </tbody>
      </table>
    </ButtonPanel>
  );
};
