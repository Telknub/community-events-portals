import React from "react";

interface Props {
  onClose: () => void;
  onAction: () => void;
}

export const NonogramPuzzle: React.FC<Props> = ({ onClose, onAction }) => {
  const name = "nonogram";

  return (
    <>
      <span>{name}</span>
    </>
  );
};
