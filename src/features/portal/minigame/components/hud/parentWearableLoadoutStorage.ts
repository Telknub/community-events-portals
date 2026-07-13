import { PORTAL_NAME } from "../../constants";
import type { StoredWearableLoadouts } from "./loadoutStorage";

const RESPONSE_EVENT = "minigameStorage:wearableLoadouts";
const GET_EVENT = "minigameStorage:getWearableLoadouts";
const SET_EVENT = "minigameStorage:setWearableLoadouts";

const DEFAULT_TIMEOUT_MS = 1000;

const isInIframe = () => {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
};

const createRequestId = () =>
  `${PORTAL_NAME}:${Date.now()}:${Math.random().toString(36).slice(2)}`;

type ParentWearableLoadoutResponse = {
  event: typeof RESPONSE_EVENT;
  requestId: string;
  value: string | null;
};

const isParentWearableLoadoutResponse = (
  data: unknown,
  requestId: string,
): data is ParentWearableLoadoutResponse => {
  if (!data || typeof data !== "object") return false;

  const message = data as Partial<ParentWearableLoadoutResponse>;
  return message.event === RESPONSE_EVENT && message.requestId === requestId;
};

export const requestParentStoredLoadouts = ({
  farmId,
  timeoutMs = DEFAULT_TIMEOUT_MS,
}: {
  farmId: number;
  timeoutMs?: number;
}): Promise<string | null | undefined> => {
  if (!isInIframe()) return Promise.resolve(undefined);

  const requestId = createRequestId();

  return new Promise((resolve) => {
    const cleanup = () => {
      window.removeEventListener("message", handleMessage);
      window.clearTimeout(timeout);
    };

    const handleMessage = (event: MessageEvent) => {
      if (!isParentWearableLoadoutResponse(event.data, requestId)) return;

      cleanup();
      resolve(event.data.value);
    };

    const timeout = window.setTimeout(() => {
      cleanup();
      resolve(undefined);
    }, timeoutMs);

    window.addEventListener("message", handleMessage);
    window.parent.postMessage(
      {
        event: GET_EVENT,
        requestId,
        portalName: PORTAL_NAME,
        farmId,
      },
      "*",
    );
  });
};

export const saveParentStoredLoadouts = ({
  farmId,
  defaultEquipment,
  loadouts,
}: {
  farmId: number;
  defaultEquipment: StoredWearableLoadouts["defaultEquipment"];
  loadouts: StoredWearableLoadouts["loadouts"];
}) => {
  if (!isInIframe()) return;

  window.parent.postMessage(
    {
      event: SET_EVENT,
      portalName: PORTAL_NAME,
      farmId,
      value: JSON.stringify({
        version: 1,
        defaultEquipment,
        loadouts,
      } satisfies StoredWearableLoadouts),
    },
    "*",
  );
};
