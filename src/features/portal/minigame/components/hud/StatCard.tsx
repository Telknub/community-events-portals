import React, { useEffect, useState } from "react";
import { Transition } from "@headlessui/react";

import { Label, LabelType } from "components/ui/Label";
import { ButtonPanel, InnerPanel } from "components/ui/Panel";
import { ProgressType, ResizableBar } from "components/ui/ProgressBar";
import { PIXEL_SCALE } from "features/game/lib/constants";
import { SUNNYSIDE } from "assets/sunnyside";
import powerupIcon from "assets/icons/level_up.png";

const XP_POPOVER_DURATION_MS = 3000;

type StatCardImg = {
  src: string;
  width?: number;
  height?: number;
};

type StatCardLabel = {
  value: React.ReactNode;
  type?: LabelType;
};

type StatCardProps = {
  title: string;
  label?: StatCardLabel;
  warningLabel?: React.ReactNode;
  progress?: {
    percentage: number;
    type?: ProgressType;
    currentXp?: number;
    requiredXp?: number;
  };
  className?: string;
  img?: StatCardImg;
  disabled?: boolean;
  selected?: boolean;
  showConfirm?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  label,
  warningLabel,
  progress,
  img,
  className,
  disabled,
  selected,
  showConfirm,
  onClick,
  children,
}) => {
  const [showXp, setShowXp] = useState(false);
  const hasXpDetails =
    progress?.currentXp !== undefined && progress.requiredXp !== undefined;

  useEffect(() => {
    if (!showXp) return;

    const timeout = window.setTimeout(() => {
      setShowXp(false);
    }, XP_POPOVER_DURATION_MS);

    return () => window.clearTimeout(timeout);
  }, [showXp]);

  return (
    <ButtonPanel
      className={`relative flex min-w-[92px] items-center justify-center px-2 ${className ?? ""}`}
      disabled={disabled}
      selected={selected}
      onClick={onClick}
      style={{
        paddingBottom: warningLabel ? "18px" : "10px",
      }}
    >
      {label !== undefined && (
        <div className="absolute -top-5 flex">
          <Label type={label?.type || "default"}>{label?.value}</Label>
        </div>
      )}

      <div className="flex flex-col items-center">
        {img !== undefined && (
          <img
            src={img.src}
            width={img.width || 20}
            className={`object-contain pixelated ${label && "mt-2"}`}
          />
        )}

        <span className={`text-center text-xs ${warningLabel && "mb-1"}`}>
          {title}
        </span>
      </div>

      {warningLabel !== undefined && (
        <div
          className="absolute -bottom-2 left-0 right-0 flex justify-center"
          style={{
            left: `${PIXEL_SCALE * -3}px`,
            right: `${PIXEL_SCALE * -3}px`,
            width: `calc(100% + ${PIXEL_SCALE * 6}px)`,
          }}
        >
          <Label type="warning" className="w-full justify-center text-center">
            {warningLabel}
          </Label>
        </div>
      )}

      {progress !== undefined && (
        <div
          className="absolute -bottom-4 cursor-pointer"
          onClick={(event) => {
            event.stopPropagation();
            if (hasXpDetails) setShowXp((show) => !show);
          }}
        >
          {progress.percentage === 100 && (
            <img className="absolute -left-5" src={powerupIcon} width={16} />
          )}
          <ResizableBar
            percentage={progress.percentage}
            type={progress.type ?? "progress"}
            outerDimensions={{ width: 16, height: 7.5 }}
          />
          {hasXpDetails ? (
            <Transition
              appear
              show={showXp}
              enter="transition-opacity transition-transform duration-200"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
              className="absolute bottom-7 left-1/2 z-40 -translate-x-1/2"
              as="div"
              onClick={(event) => event.stopPropagation()}
            >
              <InnerPanel className="drop-shadow-lg">
                <span className="whitespace-nowrap text-xs">
                  {`XP ${progress.currentXp}/${progress.requiredXp}`}
                </span>
              </InnerPanel>
            </Transition>
          ) : null}
        </div>
      )}

      {showConfirm ? (
        <img
          src={SUNNYSIDE.icons.confirm}
          className="absolute -left-2 -top-3 z-10 h-4"
        />
      ) : null}

      {children}
    </ButtonPanel>
  );
};
