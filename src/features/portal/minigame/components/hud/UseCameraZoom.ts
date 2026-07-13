import { useCallback, useState } from "react";

export const ZOOM_TOGGLE_EVENT = "zoom_toggle";
const ZOOM_STORAGE_KEY = "mmo_zoomed_out";

/**
 * Reads the persisted zoom preference (mirrors getAudioMutedSetting()).
 * Used by BaseScene on scene load so the preference survives a refresh.
 */
export function getIsZoomedOutSetting(): boolean {
  return localStorage.getItem(ZOOM_STORAGE_KEY) === "true";
}

/**
 * Mirrors useIsAudioMuted: local React state + a window CustomEvent
 * so the Phaser scene (which has no direct access to React state)
 * can react to the change.
 */
export function useCameraZoom() {
  const [isZoomedOut, setIsZoomedOut] = useState(getIsZoomedOutSetting());

  const toggleZoom = useCallback(() => {
    const next = !isZoomedOut;

    localStorage.setItem(ZOOM_STORAGE_KEY, String(next));
    setIsZoomedOut(next);

    window.dispatchEvent(
      new CustomEvent(ZOOM_TOGGLE_EVENT, { detail: next }),
    );
  }, [isZoomedOut]);

  return { isZoomedOut, toggleZoom };
}