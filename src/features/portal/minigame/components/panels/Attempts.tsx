import React from "react";

import { useAppTranslation } from "lib/i18n/useAppTranslations";
import { Label } from "components/ui/Label";
import { PORTAL_NAME } from "../../Constants";

interface Props {
  attemptsLeft: number;
}

export const Attempts: React.FC<Props> = ({ attemptsLeft }) => {
  const { t } = useAppTranslation();

  if (attemptsLeft === Infinity) {
    return (
      <Label type="success">{t(`${PORTAL_NAME}.unlimitedAttempts`)}</Label>
    );
  }

  if (attemptsLeft > 0 && attemptsLeft !== 1) {
    return (
      <Label type="vibrant">
        {t(`${PORTAL_NAME}.attemptsRemainingPlural`, {
          attempts: attemptsLeft,
        })}
      </Label>
    );
  }

  if (attemptsLeft === 1) {
    return (
      <Label type="vibrant">
        {t(`${PORTAL_NAME}.attemptsRemainingSingular`, {
          attempts: attemptsLeft,
        })}
      </Label>
    );
  }

  return <Label type="danger">{t(`${PORTAL_NAME}.noAttemptsRemaining`)}</Label>;
};
