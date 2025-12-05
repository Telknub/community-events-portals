import React from "react";

interface Props {
  onClose: () => void;
  onAction: () => void;
}

export const JigsawPuzzle: React.FC<Props> = ({ onClose, onAction }) => {
  const name = "jigsaw";

  return (
    <>
      <span>{name}</span>
    </>
  );
};
