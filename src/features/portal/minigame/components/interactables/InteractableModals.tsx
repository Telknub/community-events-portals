import React, { useEffect, useState } from "react";
import { Modal } from "components/ui/Modal";
import { PuzzleName } from "../../Constants";
import { SudokuPuzzle } from "./SudokuPuzzle";
import { Puzzle } from "./Puzzle";
import { DifficultyMessage } from "./DifficultyMessage";

type InteractableName = "puzzle" | "difficulty-message" | undefined;

class InteractableModalManager {
  private listener?: (
    name: InteractableName,
    isOpen: boolean,
    data: any,
  ) => void;

  public open(name: InteractableName, data = {}) {
    if (this.listener) {
      this.listener(name, true, data);
    }
  }

  public listen(
    cb: (name: InteractableName, isOpen: boolean, data: any) => void,
  ) {
    this.listener = cb;
  }
}

export const interactableModalManager = new InteractableModalManager();

export const InteractableModals = () => {
  const [interactable, setInteractable] = useState<InteractableName>();
  const [data, setData] = useState({});

  useEffect(() => {
    interactableModalManager.listen((interactable, open, data) => {
      setInteractable(interactable);
      setData(data);
    });
  }, []);

  const closeModal = () => {
    setInteractable(undefined);
  };

  return (
    <>
      <Modal show={!!interactable}>
        {interactable === "puzzle" && (
          <Puzzle onClose={closeModal} data={data} />
        )}
        {interactable === "difficulty-message" && (
          <DifficultyMessage onClose={closeModal} data={data} />
        )}
      </Modal>
    </>
  );
};
