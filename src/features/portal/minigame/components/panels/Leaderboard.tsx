import React, { useContext, useState } from "react";
import { Button } from "components/ui/Button";
import { ButtonPanel } from "components/ui/Panel";
import { Label } from "components/ui/Label";
import { TextInput } from "components/ui/TextInput";
import { PortalLeaderboard } from "features/world/ui/portals/PortalLeaderboard";
import { PortalMachineState } from "../../lib/Machine";
import { PortalContext } from "../../lib/PortalProvider";
import { decodeToken } from "features/auth/actions/login";
import { useSelector } from "@xstate/react";
import { PORTAL_NAME } from "../../Constants";
import { useAppTranslation } from "lib/i18n/useAppTranslations";
import { getUrl } from "features/portal/actions/loadPortal";

const _jwt = (state: PortalMachineState) => state.context.jwt;
const HIGH_SCORE_MIN_DATE = "2026-04-01";
const ACCUMULATOR_START_DATE = "2026-04-05";
const ACCUMULATOR_END_DATE = "2026-04-07";

type LeaderboardMode = "accumulate" | "highscore";

const getCurrentUtcDateString = () => new Date().toISOString().substring(0, 10);

const toUtcDate = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);

  return new Date(Date.UTC(year, month - 1, day));
};

const toDisplayDate = (value: string) => {
  const [year, month, day] = value.split("-");

  return `${day}/${month}/${year}`;
};

export const Leaderboard: React.FC = () => {
  const { t } = useAppTranslation();
  const { portalService } = useContext(PortalContext);

  const jwt = useSelector(portalService, _jwt);
  const farmId = !getUrl() ? 0 : decodeToken(jwt as string).farmId;
  const today = getCurrentUtcDateString();
  const hasAccumulatorStarted = today >= ACCUMULATOR_START_DATE;

  const [mode, setMode] = useState<LeaderboardMode>(() =>
    hasAccumulatorStarted ? "accumulate" : "highscore",
  );
  const [startDateInput, setStartDateInput] = useState(HIGH_SCORE_MIN_DATE);
  const [endDateInput, setEndDateInput] = useState(() => today);
  const [appliedStartDate, setAppliedStartDate] = useState(HIGH_SCORE_MIN_DATE);
  const [appliedEndDate, setAppliedEndDate] = useState(() => today);

  const hasCompleteDateRange = Boolean(startDateInput && endDateInput);
  const hasDatesOutsideRange =
    !!startDateInput &&
    !!endDateInput &&
    (startDateInput < HIGH_SCORE_MIN_DATE ||
      startDateInput > today ||
      endDateInput < HIGH_SCORE_MIN_DATE ||
      endDateInput > today);
  const hasStartDateAfterEndDate =
    !!startDateInput && !!endDateInput && startDateInput > endDateInput;
  const isHighScoreRangeValid =
    hasCompleteDateRange && !hasDatesOutsideRange && !hasStartDateAfterEndDate;

  const minDateLabel = toDisplayDate(HIGH_SCORE_MIN_DATE);
  const maxDateLabel = toDisplayDate(today);

  let validationMessage: string | undefined;

  if (!hasCompleteDateRange) {
    validationMessage = t(`${PORTAL_NAME}.leaderboard.validation.required`, {
      min: minDateLabel,
      max: maxDateLabel,
    });
  } else if (hasStartDateAfterEndDate) {
    validationMessage = t(`${PORTAL_NAME}.leaderboard.validation.order`, {
      min: minDateLabel,
      max: maxDateLabel,
    });
  } else if (hasDatesOutsideRange) {
    validationMessage = t(`${PORTAL_NAME}.leaderboard.validation.bounds`, {
      min: minDateLabel,
      max: maxDateLabel,
    });
  }

  const handleApplyHighScoreRange = () => {
    if (!isHighScoreRangeValid) return;

    setAppliedStartDate(startDateInput);
    setAppliedEndDate(endDateInput);
  };

  return (
    <div className="flex flex-col gap-2 overflow-y-auto scrollable max-h-[75vh]">
      <div className="flex flex-col gap-2 px-2 pt-2">
        <p>{t(`${PORTAL_NAME}.competition.description1`)}</p>
        <p>{t(`${PORTAL_NAME}.competition.description2`)}</p>
        <p>{t(`${PORTAL_NAME}.competition.description3`)}</p>
      </div>
      <div className="grid grid-cols-2 gap-1 px-2">
        <ButtonPanel
          className="!p-2"
          selected={mode === "accumulate"}
          onClick={() => setMode("accumulate")}
        >
          <div className="flex items-center justify-center">
            <span className="text-xs">
              {t(`${PORTAL_NAME}.leaderboard.accumulate`)}
            </span>
          </div>
        </ButtonPanel>
        <ButtonPanel
          className="!p-2"
          selected={mode === "highscore"}
          onClick={() => setMode("highscore")}
        >
          <div className="flex items-center justify-center">
            <span className="text-xs">
              {t(`${PORTAL_NAME}.leaderboard.highscore`)}
            </span>
          </div>
        </ButtonPanel>
      </div>

      {mode === "accumulate" ? (
        hasAccumulatorStarted ? (
          <PortalLeaderboard
            key="accumulate"
            isAccumulator
            name={PORTAL_NAME}
            startDate={toUtcDate(ACCUMULATOR_START_DATE)}
            endDate={toUtcDate(ACCUMULATOR_END_DATE)}
            farmId={Number(farmId)}
            jwt={jwt as string}
          />
        ) : (
          <div className="px-2">
            <Label type="info" className="text-xs">
              {t(`${PORTAL_NAME}.leaderboard.competitionNotStarted`)}
            </Label>
          </div>
        )
      ) : (
        <div className="flex flex-col gap-2 px-2 pb-2">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <Label type="default">
                {t(`${PORTAL_NAME}.leaderboard.startDate`)}
              </Label>
              <TextInput
                type="date"
                min={HIGH_SCORE_MIN_DATE}
                max={today}
                value={startDateInput}
                onValueChange={setStartDateInput}
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label type="default">
                {t(`${PORTAL_NAME}.leaderboard.endDate`)}
              </Label>
              <TextInput
                type="date"
                min={HIGH_SCORE_MIN_DATE}
                max={today}
                value={endDateInput}
                onValueChange={setEndDateInput}
              />
            </div>
          </div>

          {validationMessage && (
            <Label type="danger" className="text-left">
              {validationMessage}
            </Label>
          )}

          <Button
            disabled={!isHighScoreRangeValid}
            onClick={handleApplyHighScoreRange}
          >
            {t(`${PORTAL_NAME}.leaderboard.update`)}
          </Button>

          <PortalLeaderboard
            key={`highscore-${appliedStartDate}-${appliedEndDate}`}
            name={PORTAL_NAME}
            startDate={toUtcDate(appliedStartDate)}
            endDate={toUtcDate(appliedEndDate)}
            farmId={Number(farmId)}
            jwt={jwt as string}
          />
        </div>
      )}
    </div>
  );
};
