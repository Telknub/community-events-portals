import type { MinigameName } from "features/game/types/minigames";

const GET_EVENT = "minigameStorage:getWearableLoadouts";
const SET_EVENT = "minigameStorage:setWearableLoadouts";
const RESPONSE_EVENT = "minigameStorage:wearableLoadouts";

type MinigameWearableLoadoutMessage = {
  event: typeof GET_EVENT | typeof SET_EVENT;
  requestId?: string;
  portalName?: MinigameName;
  farmId?: number;
  value?: string;
};

export const getWearableLoadoutsStorageKey = ({
  portalName,
  farmId,
}: {
  portalName: MinigameName;
  farmId: number;
}) => `portal:${portalName}:wearableLoadouts:${farmId}`;

export const getIframeOrigin = (url?: string) => {
  if (!url) return undefined;

  try {
    return new URL(url).origin;
  } catch {
    return undefined;
  }
};

const isStorageMessage = (
  data: unknown,
): data is MinigameWearableLoadoutMessage => {
  if (!data || typeof data !== "object") return false;

  const event = (data as Partial<MinigameWearableLoadoutMessage>).event;
  return event === GET_EVENT || event === SET_EVENT;
};

export const isTrustedMinigameStorageMessage = ({
  event,
  iframeWindow,
  expectedOrigin,
}: {
  event: MessageEvent;
  iframeWindow?: Window | null;
  expectedOrigin?: string;
}) => {
  if (!iframeWindow || !expectedOrigin) return false;

  return event.source === iframeWindow && event.origin === expectedOrigin;
};

export const handleMinigameWearableLoadoutStorageMessage = ({
  event,
  iframeWindow,
  expectedOrigin,
  portalName,
  farmId,
}: {
  event: MessageEvent;
  iframeWindow?: Window | null;
  expectedOrigin?: string;
  portalName: MinigameName;
  farmId: number;
}) => {
  if (!isStorageMessage(event.data)) return false;

  if (
    !isTrustedMinigameStorageMessage({
      event,
      iframeWindow,
      expectedOrigin,
    })
  ) {
    return true;
  }

  if (event.data.portalName && event.data.portalName !== portalName) {
    return true;
  }

  if (event.data.farmId && event.data.farmId !== farmId) {
    return true;
  }

  const targetOrigin = expectedOrigin;
  if (!targetOrigin) return true;

  const key = getWearableLoadoutsStorageKey({ portalName, farmId });

  if (event.data.event === SET_EVENT && typeof event.data.value === "string") {
    localStorage.setItem(key, event.data.value);
    return true;
  }

  if (event.data.event === GET_EVENT) {
    iframeWindow?.postMessage(
      {
        event: RESPONSE_EVENT,
        requestId: event.data.requestId,
        value: localStorage.getItem(key),
      },
      targetOrigin,
    );
    return true;
  }

  return true;
};
