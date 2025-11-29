import { NPCName, acknowledgeNPC } from "lib/npcs";
import React, { useEffect, useState } from "react";
import { Modal } from "components/ui/Modal";
import { NPCS_WITH_ALERTS } from "../../Core/BumpkinContainer";
import { NPC } from "./NPC";

class NpcModalManager {
  private listener?: (npc: NPCName, isOpen: boolean, data: any) => void;

  public open(npc: NPCName, data = {}) {
    if (this.listener) {
      this.listener(npc, true, data);
    }
  }

  public listen(cb: (npc: NPCName, isOpen: boolean, data: any) => void) {
    this.listener = cb;
  }
}

export const npcModalManager = new NpcModalManager();

export const NPCModals = () => {
  const [npc, setNpc] = useState<NPCName>();
  const [data, setData] = useState({});

  useEffect(() => {
    npcModalManager.listen((npc, isOpen, data) => {
      setNpc(npc);
      setData(data);
    });
  }, []);

  const closeModal = () => {
    if (npc && !!NPCS_WITH_ALERTS[npc]) {
      acknowledgeNPC(npc);
    }
    setNpc(undefined);
  };

  const isSeparateModal = npc === "Chun Long" || npc === "hammerin harry";

  return (
    <>
      <Modal show={!!npc && !isSeparateModal} onHide={closeModal}>
        {npc === "portaller" && <NPC onClose={closeModal} data={data} />}
      </Modal>
    </>
  );
};
