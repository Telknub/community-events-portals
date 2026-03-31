import React, { useContext, useEffect } from "react";
import { useOrientation } from "lib/utils/hooks/useOrientation";

import { useSelector } from "@xstate/react";
import { Modal } from "components/ui/Modal";
import { Panel } from "components/ui/Panel";
import { Button } from "components/ui/Button";

import { PortalContext } from "./lib/PortalProvider";
import { Label } from "components/ui/Label";
import { useAppTranslation } from "lib/i18n/useAppTranslations";
import { PortalMachineState } from "./lib/Machine";
import { Loading } from "features/auth/components";
import { CONFIG } from "lib/config";
import { authorisePortal, claimPrize } from "../lib/portalUtil";
import { RulesPanel } from "./components/panels/RulesPanel";
import { NoAttemptsPanel } from "./components/panels/NoAttemptsPanel";
import { PORTAL_NAME } from "./Constants";
import { Hud } from "./components/hud/Hud";
import { Phaser } from "./Phaser";

const _sflBalance = (state: PortalMachineState) => state.context.state?.balance;
const _isError = (state: PortalMachineState) => state.matches("error");
const _isUnauthorised = (state: PortalMachineState) =>
  state.matches("unauthorised");
const _isLoading = (state: PortalMachineState) => state.matches("loading");
const _isNoAttempts = (state: PortalMachineState) =>
  state.matches("noAttempts");
const _isIntroduction = (state: PortalMachineState) =>
  state.matches("introduction");
const _isLoser = (state: PortalMachineState) => state.matches("loser");
const _isWinner = (state: PortalMachineState) => state.matches("winner");
const _isComplete = (state: PortalMachineState) => state.matches("complete");
const _hasError = (state: PortalMachineState) => state.context.hasError;

/**
 * A Portal Example which demonstrates basic state management
 */
export const Portal: React.FC = () => {
  const { portalService } = useContext(PortalContext);
  const { t } = useAppTranslation();
  const deviceOrientation = useOrientation();

  const hasError = useSelector(portalService, _hasError);
  const sflBalance = useSelector(portalService, _sflBalance);
  const isError = useSelector(portalService, _isError);
  const isUnauthorised = useSelector(portalService, _isUnauthorised);
  const isLoading = useSelector(portalService, _isLoading);
  const isNoAttempts = useSelector(portalService, _isNoAttempts);
  const isIntroduction = useSelector(portalService, _isIntroduction);
  const isWinner = useSelector(portalService, _isWinner);
  const isLoser = useSelector(portalService, _isLoser);
  const isComplete = useSelector(portalService, _isComplete);

  useEffect(() => {
    // If a player tries to quit while playing, mark it as an attempt
    const handleBeforeUnload = () => {
      portalService.send("GAME_OVER");
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    // clean up the event listener when component unmounts
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const portraitStyles = deviceOrientation === "portrait" && (
    <style>{`
      #hud-container, div[role="dialog"] {
          width: ${window.innerHeight}px !important;
          height: ${window.innerWidth}px !important;
          transform-origin: top left !important;
          transform: rotate(90deg) translateY(-${window.innerWidth}px) !important;
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
      }
      #hud-container > div {
          zoom: 0.85;
      }
      div[role="dialog"] > div > div.flex {
        margin-top: 30px;
        min-height: ${window.innerWidth}px !important;
      }
      div[role="dialog"] .flex.min-h-full > .relative.w-full {
          transform: scale(0.7) !important;
          transform-origin: center center !important;
      }
      div[role="dialog"] .flex.min-h-full > .relative.w-full > div > div.relative > div {
          max-height: calc(100vw - 100px) !important;
      }
      div[role="dialog"] .flex.min-h-full > .relative.w-full > div > div.relative > div > div {
          max-height: calc(100vw - 120px) !important;
      }
      div[role="dialog"] .flex.min-h-full > .relative.w-full > div > div.relative > div > div > div {
          max-height: calc(100vw - 120px) !important;
      }
    `}</style>
  );

  if (isError) {
    return (
      <>
        {portraitStyles}
        <Modal show>
          <Panel>
            <div className="p-2">
              <Label type="danger">{t("error")}</Label>
              <span className="text-sm my-2">{t("error.wentWrong")}</span>
            </div>
            <Button onClick={() => portalService.send("RETRY")}>
              {t("retry")}
            </Button>
          </Panel>
        </Modal>
      </>
    );
  }

  if (isUnauthorised) {
    return (
      <>
        {portraitStyles}
        <Modal show>
          <Panel>
            <div className="p-2">
              <Label type="danger">{t("error")}</Label>
              <span className="text-sm my-2">{t("session.expired")}</span>
            </div>
            <Button onClick={authorisePortal}>{t("welcome.login")}</Button>
          </Panel>
        </Modal>
      </>
    );
  }

  if (isLoading) {
    return (
      <>
        {portraitStyles}
        <Modal show>
          <Panel>
            <Loading />
            <span className="text-xs">
              {`${t("last.updated")}:${CONFIG.CLIENT_VERSION}`}
            </span>
          </Panel>
        </Modal>
      </>
    );
  }

  return (
    <div>
      {portraitStyles}

      {isNoAttempts && (
        <Modal show>
          <NoAttemptsPanel />
        </Modal>
      )}

      {hasError && (
        <Modal show>
          <Panel>
            <div className="flex flex-col p-2">
              <Label className="mb-2" type="danger">{t(`${PORTAL_NAME}.critical.error`)}</Label>
              <span className="text-xs mb-2">{t(`${PORTAL_NAME}.critical.error.description1`)}</span>
              <span className="text-sm mb-2">{t(`${PORTAL_NAME}.critical.error.description2`)}</span>
              <span className="text-xs mb-2">{t(`${PORTAL_NAME}.critical.error.description3`)}</span>
              <code className="text-xs mb-4">
                {t(`${PORTAL_NAME}.critical.error.description4`)}
              </code>
              <span className="text-lg mb-2">{t(`${PORTAL_NAME}.critical.error.description5`)}</span>
              <span className="text-sm mb-2">{t(`${PORTAL_NAME}.critical.error.description6`)}</span>
            </div>
            <Button onClick={() => portalService.send("SIMULATE_ERROR", { hasError: false })}>
              {t(`${PORTAL_NAME}.critical.error.button`)}
            </Button>
          </Panel>
        </Modal>
      )}

      {isIntroduction && (
        <Modal show>
          <RulesPanel
            mode={"introduction"}
            showScore={false}
            showExitButton={true}
            confirmButtonText={t("start")}
            onConfirm={() => portalService.send("CONTINUE")}
            trainingButtonText={t(`${PORTAL_NAME}.start.training`)}
            onTraining={() => portalService.send("CONTINUE_TRAINING")}
          />
        </Modal>
      )}

      {isLoser && (
        <Modal show>
          <RulesPanel
            mode={"failed"}
            showScore={true}
            showExitButton={true}
            confirmButtonText={""}
            onConfirm={() => portalService.send("RETRY")}
          />
        </Modal>
      )}

      {isWinner && (
        <Modal show>
          <RulesPanel
            mode={"success"}
            showScore={true}
            showExitButton={false}
            confirmButtonText={t("claim")}
            onConfirm={claimPrize}
          />
        </Modal>
      )}

      {isComplete && (
        <Modal show>
          <RulesPanel
            mode={"introduction"}
            showScore={true}
            showExitButton={true}
            confirmButtonText={""}
            onConfirm={() => portalService.send("RETRY")}
          />
        </Modal>
      )}

      {sflBalance && (
        <div
          style={
            deviceOrientation === "portrait"
              ? {
                width: `${window.innerHeight}px`,
                height: `${window.innerWidth}px`,
                transformOrigin: "top left",
                transform: `rotate(90deg) translateY(-${window.innerWidth}px)`,
                position: "absolute",
                top: 0,
                left: 0,
              }
              : {
                width: "100%",
                height: "100%",
              }
          }
        >
          <Hud />
          <Phaser />
        </div>
      )}
    </div>
  );
};
