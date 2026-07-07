import type { BumpkinItem } from "features/game/types/bumpkin";
import type { BumpkinParts } from "lib/utils/tokenUriBuilder";
import type {
  PlayerStatId,
  WeaponId,
  WeaponStatKey,
} from "features/portal/minigame/Types";

export type WearableBuffTarget =
  | {
      type: "playerStat";
      stat: PlayerStatId;
    }
  | {
      type: "weaponStat";
      weapon: WeaponId;
      stat: WeaponStatKey;
    };

export type WearableBuff = {
  target: WearableBuffTarget;
  value: number;
  descriptionKey: string;
};

export const WEARABLES_TAB_ITEMS: BumpkinItem[] = [
  "Carrot Pitchfork",
  "Handheld Bunny",
  "Bunny Mask",
  "Bunny Pants",
  "Easter Apron",
  "Slime Hat",
  "Slime Wings",
  "Slime Aura",
  "Green Slime Hair",
  "Blue Slime Shirt",
  "Slime Splattered Shirt",
  "Sad Slime Pants",
  "Red Jelly Pants",
  "Yellow Slime Puppet",
  "Blue Jelly Shoes",
  "Sad Slime Slippers",
  "Sad Slime Hat",
  "Slime Wall Background",
  "Rainbow Wings",
  "Butterfly Aura",
  "Paint Splattered Hair",
  "Paint Splattered Shirt",
  "Paint Splattered Overalls",
  "Paint Spray Can",
  "Moonseeker Potion",
  "Frizzy Bob Cut",
  "Two-toned Layered",
  "Halloween Deathscythe",
  "Moonseeker Hand Puppet",
  "Sweet Devil Horns",
  "Trick and Treat",
  "Jack O'Sweets",
  "Frank Onesie",
  "Research Uniform",
  "Sweet Devil Dress",
  "Underworld Stimpack",
  "Sweet Devil Wings",
  "Wisp Aura",
  "Comfy Xmas Sweater",
  "Comfy Xmas Pants",
  "Candy Halbred",
  "Xmas Top Hat",
  "Reindeer Mask",
  "Snowman Mask",
  "Cool Glasses",
  "Cookie Shield",
  "Holiday Feast Background",
  "Cozy Reindeer Onesie",
  "Diamond Snow Aura",
  "Neon Noiz Jacket",
  "404 Chic Top",
  "Neon Noiz Pants",
  "404 Chic Skirt",
  "Admin Fools Tools",
  "Neon Noiz Shoes",
  "404 Chic Boots",
  "Aether Specs",
  "Faulty Barrier Background",
  "Cardboard Wings",
  "Glitch Aura",
];

export const NEW_WEARABLES = new Set<BumpkinItem>([
  "Green Slime Hair",
  "Blue Slime Shirt",
  "Slime Splattered Shirt",
  "Sad Slime Pants",
  "Red Jelly Pants",
  "Yellow Slime Puppet",
  "Blue Jelly Shoes",
  "Sad Slime Slippers",
  "Sad Slime Hat",
  "Slime Wall Background",
  "Rainbow Wings",
  "Butterfly Aura",
]);

export const WEARABLE_BUFFS: Partial<Record<BumpkinItem, WearableBuff>> = {
  "Carrot Pitchfork": {
    target: { type: "weaponStat", weapon: "corn", stat: "projectileSpeed" },
    value: 8,
    descriptionKey: "wearables.buff.carrotPitchfork",
  },
  "Handheld Bunny": {
    target: { type: "playerStat", stat: "speed" },
    value: 0.75,
    descriptionKey: "wearables.buff.handheldBunny",
  },
  "Bunny Mask": {
    target: { type: "weaponStat", weapon: "tomato", stat: "chainRadius" },
    value: 3,
    descriptionKey: "wearables.buff.bunnyMask",
  },
  "Bunny Pants": {
    target: { type: "weaponStat", weapon: "pumpkin", stat: "durationMs" },
    value: 40,
    descriptionKey: "wearables.buff.bunnyPants",
  },
  "Easter Apron": {
    target: { type: "playerStat", stat: "damage" },
    value: 0.75,
    descriptionKey: "wearables.buff.easterApron",
  },
  "Slime Hat": {
    target: { type: "weaponStat", weapon: "oil", stat: "areaRadius" },
    value: 1,
    descriptionKey: "wearables.buff.slimeHat",
  },
  "Slime Wings": {
    target: { type: "playerStat", stat: "health" },
    value: 20,
    descriptionKey: "wearables.buff.slimeWings",
  },
  "Slime Aura": {
    target: { type: "weaponStat", weapon: "oil", stat: "statusDurationMs" },
    value: 80,
    descriptionKey: "wearables.buff.slimeAura",
  },
  "Green Slime Hair": {
    target: { type: "playerStat", stat: "speed" },
    value: 0.5,
    descriptionKey: "wearables.buff.greenSlimeHair",
  },
  "Blue Slime Shirt": {
    target: { type: "weaponStat", weapon: "wateringCan", stat: "damage" },
    value: 0.35,
    descriptionKey: "wearables.buff.blueSlimeShirt",
  },
  "Slime Splattered Shirt": {
    target: { type: "weaponStat", weapon: "oil", stat: "dotDamage" },
    value: 0.25,
    descriptionKey: "wearables.buff.slimeSplatteredShirt",
  },
  "Sad Slime Pants": {
    target: { type: "weaponStat", weapon: "pumpkin", stat: "projectileSpeed" },
    value: 5,
    descriptionKey: "wearables.buff.sadSlimePants",
  },
  "Red Jelly Pants": {
    target: { type: "playerStat", stat: "speed" },
    value: 0.5,
    descriptionKey: "wearables.buff.redJellyPants",
  },
  "Yellow Slime Puppet": {
    target: { type: "weaponStat", weapon: "beehive", stat: "homingSpeed" },
    value: 5,
    descriptionKey: "wearables.buff.yellowSlimePuppet",
  },
  "Blue Jelly Shoes": {
    target: { type: "playerStat", stat: "speed" },
    value: 0.5,
    descriptionKey: "wearables.buff.blueJellyShoes",
  },
  "Sad Slime Slippers": {
    target: { type: "weaponStat", weapon: "wateringCan", stat: "cooldownMs" },
    value: -25,
    descriptionKey: "wearables.buff.sadSlimeSlippers",
  },
  "Sad Slime Hat": {
    target: { type: "weaponStat", weapon: "tomato", stat: "bounceCount" },
    value: 0.25,
    descriptionKey: "wearables.buff.sadSlimeHat",
  },
  "Slime Wall Background": {
    target: { type: "weaponStat", weapon: "oil", stat: "durationMs" },
    value: 100,
    descriptionKey: "wearables.buff.slimeWallBackground",
  },
  "Rainbow Wings": {
    target: {
      type: "weaponStat",
      weapon: "sunflower",
      stat: "projectileSpeed",
    },
    value: 8,
    descriptionKey: "wearables.buff.rainbowWings",
  },
  "Butterfly Aura": {
    target: { type: "weaponStat", weapon: "oil", stat: "dotDamage" },
    value: 0.5,
    descriptionKey: "wearables.buff.butterflyAura",
  },
  "Paint Splattered Hair": {
    target: { type: "weaponStat", weapon: "tomato", stat: "projectileSpeed" },
    value: 5,
    descriptionKey: "wearables.buff.paintSplatteredHair",
  },
  "Paint Splattered Shirt": {
    target: { type: "weaponStat", weapon: "corn", stat: "areaRadius" },
    value: 1,
    descriptionKey: "wearables.buff.paintSplatteredShirt",
  },
  "Paint Splattered Overalls": {
    target: { type: "weaponStat", weapon: "pumpkin", stat: "pierce" },
    value: 0.5,
    descriptionKey: "wearables.buff.paintSplatteredOveralls",
  },
  "Paint Spray Can": {
    target: { type: "weaponStat", weapon: "wateringCan", stat: "range" },
    value: 3,
    descriptionKey: "wearables.buff.paintSprayCan",
  },
  "Moonseeker Potion": {
    target: { type: "playerStat", stat: "damage" },
    value: 0.35,
    descriptionKey: "wearables.buff.moonseekerPotion",
  },
  "Frizzy Bob Cut": {
    target: { type: "weaponStat", weapon: "banana", stat: "orbitRadius" },
    value: 2,
    descriptionKey: "wearables.buff.frizzyBobCut",
  },
  "Two-toned Layered": {
    target: { type: "weaponStat", weapon: "sunflower", stat: "cooldownMs" },
    value: -15,
    descriptionKey: "wearables.buff.twoTonedLayered",
  },
  "Halloween Deathscythe": {
    target: { type: "weaponStat", weapon: "broomScythe", stat: "range" },
    value: 3,
    descriptionKey: "wearables.buff.halloweenDeathscythe",
  },
  "Moonseeker Hand Puppet": {
    target: { type: "weaponStat", weapon: "beehive", stat: "durationMs" },
    value: 60,
    descriptionKey: "wearables.buff.moonseekerHandPuppet",
  },
  "Sweet Devil Horns": {
    target: { type: "weaponStat", weapon: "broomScythe", stat: "damage" },
    value: 0.25,
    descriptionKey: "wearables.buff.sweetDevilHorns",
  },
  "Trick and Treat": {
    target: { type: "weaponStat", weapon: "tomato", stat: "cooldownMs" },
    value: -15,
    descriptionKey: "wearables.buff.trickAndTreat",
  },
  "Jack O'Sweets": {
    target: { type: "weaponStat", weapon: "pumpkin", stat: "size" },
    value: 0.05,
    descriptionKey: "wearables.buff.jackOSweets",
  },
  "Frank Onesie": {
    target: { type: "playerStat", stat: "speed" },
    value: 1,
    descriptionKey: "wearables.buff.frankOnesie",
  },
  "Research Uniform": {
    target: { type: "weaponStat", weapon: "wateringCan", stat: "cooldownMs" },
    value: -35,
    descriptionKey: "wearables.buff.researchUniform",
  },
  "Sweet Devil Dress": {
    target: { type: "playerStat", stat: "damage" },
    value: 0.5,
    descriptionKey: "wearables.buff.sweetDevilDress",
  },
  "Sweet Devil Wings": {
    target: { type: "weaponStat", weapon: "banana", stat: "hitCooldownMs" },
    value: -25,
    descriptionKey: "wearables.buff.sweetDevilWings",
  },
  "Wisp Aura": {
    target: { type: "weaponStat", weapon: "oil", stat: "areaRadius" },
    value: 3,
    descriptionKey: "wearables.buff.wispAura",
  },
  "Comfy Xmas Sweater": {
    target: { type: "weaponStat", weapon: "beehive", stat: "hitCooldownMs" },
    value: -25,
    descriptionKey: "wearables.buff.comfyXmasSweater",
  },
  "Comfy Xmas Pants": {
    target: { type: "playerStat", stat: "speed" },
    value: 0.75,
    descriptionKey: "wearables.buff.comfyXmasPants",
  },
  "Candy Halbred": {
    target: { type: "weaponStat", weapon: "broomScythe", stat: "arcDegrees" },
    value: 4,
    descriptionKey: "wearables.buff.candyHalbred",
  },
  "Xmas Top Hat": {
    target: { type: "weaponStat", weapon: "sunflower", stat: "damage" },
    value: 0.25,
    descriptionKey: "wearables.buff.xmasTopHat",
  },
  "Reindeer Mask": {
    target: { type: "weaponStat", weapon: "pumpkin", stat: "cooldownMs" },
    value: -50,
    descriptionKey: "wearables.buff.reindeerMask",
  },
  "Snowman Mask": {
    target: { type: "weaponStat", weapon: "oil", stat: "dotTickMs" },
    value: -25,
    descriptionKey: "wearables.buff.snowmanMask",
  },
  "Cool Glasses": {
    target: {
      type: "weaponStat",
      weapon: "wateringCan",
      stat: "projectileSpeed",
    },
    value: 5,
    descriptionKey: "wearables.buff.coolGlasses",
  },
  "Cookie Shield": {
    target: { type: "weaponStat", weapon: "banana", stat: "damage" },
    value: 0.35,
    descriptionKey: "wearables.buff.cookieShield",
  },
  "Holiday Feast Background": {
    target: { type: "weaponStat", weapon: "corn", stat: "durationMs" },
    value: 50,
    descriptionKey: "wearables.buff.holidayFeastBackground",
  },
  "Cozy Reindeer Onesie": {
    target: { type: "playerStat", stat: "damage" },
    value: 0.5,
    descriptionKey: "wearables.buff.cozyReindeerOnesie",
  },
  "Diamond Snow Aura": {
    target: { type: "weaponStat", weapon: "sunflower", stat: "orbitRadius" },
    value: 5,
    descriptionKey: "wearables.buff.diamondSnowAura",
  },
  "Neon Noiz Jacket": {
    target: { type: "weaponStat", weapon: "beehive", stat: "cooldownMs" },
    value: -15,
    descriptionKey: "wearables.buff.neonNoizJacket",
  },
  "404 Chic Top": {
    target: { type: "weaponStat", weapon: "tomato", stat: "damage" },
    value: 0.25,
    descriptionKey: "wearables.buff.404ChicTop",
  },
  "Neon Noiz Pants": {
    target: { type: "playerStat", stat: "speed" },
    value: 1,
    descriptionKey: "wearables.buff.neonNoizPants",
  },
  "404 Chic Skirt": {
    target: { type: "weaponStat", weapon: "pumpkin", stat: "damage" },
    value: 0.5,
    descriptionKey: "wearables.buff.404ChicSkirt",
  },
  "Admin Fools Tools": {
    target: { type: "weaponStat", weapon: "corn", stat: "cooldownMs" },
    value: -35,
    descriptionKey: "wearables.buff.adminFoolsTools",
  },
  "Neon Noiz Shoes": {
    target: { type: "playerStat", stat: "speed" },
    value: 0.75,
    descriptionKey: "wearables.buff.neonNoizShoes",
  },
  "404 Chic Boots": {
    target: { type: "weaponStat", weapon: "broomScythe", stat: "cooldownMs" },
    value: -25,
    descriptionKey: "wearables.buff.404ChicBoots",
  },
  "Aether Specs": {
    target: { type: "weaponStat", weapon: "sunflower", stat: "range" },
    value: 4,
    descriptionKey: "wearables.buff.aetherSpecs",
  },
  "Faulty Barrier Background": {
    target: { type: "weaponStat", weapon: "oil", stat: "areaRadius" },
    value: 4,
    descriptionKey: "wearables.buff.faultyBarrierBackground",
  },
  "Cardboard Wings": {
    target: { type: "playerStat", stat: "health" },
    value: 25,
    descriptionKey: "wearables.buff.cardboardWings",
  },
  "Glitch Aura": {
    target: { type: "weaponStat", weapon: "tomato", stat: "bounceCount" },
    value: 0.5,
    descriptionKey: "wearables.buff.glitchAura",
  },
};

export const getActiveWearableBuffs = (
  activeWearables?: BumpkinParts,
): WearableBuff[] => {
  if (!activeWearables) return [];

  return Object.values(activeWearables).flatMap((wearable) => {
    if (!wearable) return [];

    const buff = WEARABLE_BUFFS[wearable];

    return buff ? [buff] : [];
  });
};

export const getActivePlayerStatBuff = (
  stat: PlayerStatId,
  activeWearables?: BumpkinParts,
) =>
  getActiveWearableBuffs(activeWearables)
    .filter((buff) => buff.target.type === "playerStat")
    .filter((buff) => buff.target.stat === stat)
    .reduce((total, buff) => total + buff.value, 0);

export const getWearableBuffDescriptionKey = (wearable?: BumpkinItem) => {
  if (!wearable) return undefined;

  return WEARABLE_BUFFS[wearable]?.descriptionKey;
};
