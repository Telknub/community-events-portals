import { createContext } from "react";

/**
 * Provided by the free-play mode (components/panels/FreePlay.tsx).
 * When present, StatusBar swaps the game HUD (lives / game timer / reset attempts)
 * for a simple bar: elapsed time, "New puzzle" and "Menu" buttons.
 */
export interface FreePlayValue {
  elapsed: number; // seconds since the puzzle started
  onMenu: () => void; // back to the puzzle list
}

export const FreePlayContext = createContext<FreePlayValue | null>(null);
