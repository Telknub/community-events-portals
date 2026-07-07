export const WEAPON_VISUAL_MAX_DEPTH = 70;

export const getWeaponVisualDepth = (y: number) =>
  Math.min(WEAPON_VISUAL_MAX_DEPTH, Math.floor(y) - 1);
