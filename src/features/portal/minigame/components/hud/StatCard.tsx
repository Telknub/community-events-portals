import React from "react";

import { Label, LabelType } from "components/ui/Label";
import { ButtonPanel } from "components/ui/Panel";
import { PIXEL_SCALE } from "features/game/lib/constants";
import { SUNNYSIDE } from "assets/sunnyside";
import powerupIcon from "assets/icons/level_up.png";

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
  className?: string;
  img?: StatCardImg;
  disabled?: boolean;
  selected?: boolean;
  showConfirm?: boolean;
  showLabelAboveDisabled?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  label,
  warningLabel,
  img,
  className,
  disabled,
  selected,
  showConfirm,
  showLabelAboveDisabled,
  onClick,
  children,
}) => {
  const labelNode =
    label !== undefined ? (
      <div
        className={`absolute z-10 flex justify-center w-full ${showLabelAboveDisabled ? "-top-3" : "-top-5"}`}
      >
        <Label type={label?.type || "default"}>{label?.value}</Label>
      </div>
    ) : null;

  return (
    <div className={`relative flex flex-col ${className ?? ""}`}>
      {showLabelAboveDisabled ? labelNode : null}
      <ButtonPanel
        className="relative flex min-w-[92px] flex-1 items-center justify-center px-2"
        disabled={disabled}
        selected={selected}
        onClick={onClick}
        style={{
          paddingBottom: warningLabel ? "18px" : "10px",
        }}
      >
        {showLabelAboveDisabled ? null : labelNode}

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
            <Label type="vibrant" className="w-full justify-center text-center">
              {warningLabel}
            </Label>
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
    </div>
  );
};
