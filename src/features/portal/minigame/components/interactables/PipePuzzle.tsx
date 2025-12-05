import React from "react";

interface Props {
  onClose: () => void;
  onAction: () => void;
}

export const PipePuzzle: React.FC<Props> = ({ onClose, onAction }) => {
  const name = "pipe";

  return (
    <>
      <span>{name}</span>
    </>
  );
};
