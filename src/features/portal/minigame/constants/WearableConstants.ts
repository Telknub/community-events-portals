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
  "Pumpkin Head",
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
  "Slime Aura": {
    target: { type: "weaponStat", weapon: "oil", stat: "statusDurationMs" },
    value: 500,
    descriptionKey: "wearables.buff.slimeAura",
  },
  "Butterfly Aura": {
    target: { type: "weaponStat", weapon: "beehive", stat: "homingSpeed" },
    value: 20,
    descriptionKey: "wearables.buff.butterflyAura",
  },
  "Wisp Aura": {
    target: { type: "weaponStat", weapon: "corn", stat: "damage" },
    value: 2,
    descriptionKey: "wearables.buff.wispAura",
  },
  "Diamond Snow Aura": {
    target: { type: "weaponStat", weapon: "sunflower", stat: "damage" },
    value: 3,
    descriptionKey: "wearables.buff.diamondSnowAura",
  },
  "Glitch Aura": {
    target: { type: "weaponStat", weapon: "tomato", stat: "bounceCount" },
    value: 1,
    descriptionKey: "wearables.buff.glitchAura",
  },
  "Slime Wings": {
    target: { type: "weaponStat", weapon: "oil", stat: "statusDurationMs" },
    value: 200,
    descriptionKey: "wearables.buff.slimeWings",
  },
  "Rainbow Wings": {
    target: { type: "weaponStat", weapon: "wateringCan", stat: "pierce" },
    value: 2,
    descriptionKey: "wearables.buff.rainbowWings",
  },
  "Sweet Devil Wings": {
    target: { type: "weaponStat", weapon: "banana", stat: "damage" },
    value: 2,
    descriptionKey: "wearables.buff.sweetDevilWings",
  },
  "Cardboard Wings": {
    target: { type: "playerStat", stat: "speed" },
    value: 10,
    descriptionKey: "wearables.buff.cardboardWings",
  },
  "Slime Wall Background": {
    target: { type: "weaponStat", weapon: "pumpkin", stat: "pierce" },
    value: 4,
    descriptionKey: "wearables.buff.slimeWallBackground",
  },
  "Holiday Feast Background": {
    target: { type: "weaponStat", weapon: "broomScythe", stat: "range" },
    value: 10,
    descriptionKey: "wearables.buff.holidayFeastBackground",
  },
  "Faulty Barrier Background": {
    target: { type: "weaponStat", weapon: "corn", stat: "cooldownMs" },
    value: -100,
    descriptionKey: "wearables.buff.faultyBarrierBackground",
  },
  "Carrot Pitchfork": {
    target: { type: "weaponStat", weapon: "corn", stat: "projectileSpeed" },
    value: 20,
    descriptionKey: "wearables.buff.carrotPitchfork",
  },
  "Handheld Bunny": {
    target: { type: "playerStat", stat: "speed" },
    value: 5,
    descriptionKey: "wearables.buff.handheldBunny",
  },
  "Bunny Mask": {
    target: { type: "weaponStat", weapon: "tomato", stat: "cooldownMs" },
    value: -100,
    descriptionKey: "wearables.buff.bunnyMask",
  },
  "Bunny Pants": {
    target: { type: "weaponStat", weapon: "beehive", stat: "cooldownMs" },
    value: -100,
    descriptionKey: "wearables.buff.bunnyPants",
  },
  "Easter Apron": {
    target: { type: "playerStat", stat: "damage" },
    value: 0.5,
    descriptionKey: "wearables.buff.easterApron",
  },
  "Slime Hat": {
    target: { type: "weaponStat", weapon: "oil", stat: "areaRadius" },
    value: 10,
    descriptionKey: "wearables.buff.slimeHat",
  },
  "Green Slime Hair": {
    target: {
      type: "weaponStat",
      weapon: "wateringCan",
      stat: "damage",
    },
    value: 2,
    descriptionKey: "wearables.buff.greenSlimeHair",
  },
  "Blue Slime Shirt": {
    target: { type: "weaponStat", weapon: "wateringCan", stat: "pierce" },
    value: 1,
    descriptionKey: "wearables.buff.blueSlimeShirt",
  },
  "Slime Splattered Shirt": {
    target: { type: "weaponStat", weapon: "oil", stat: "dotDamage" },
    value: 0.5,
    descriptionKey: "wearables.buff.slimeSplatteredShirt",
  },
  "Sad Slime Pants": {
    target: { type: "weaponStat", weapon: "oil", stat: "dotTickMs" },
    value: -50,
    descriptionKey: "wearables.buff.sadSlimePants",
  },
  "Yellow Slime Puppet": {
    target: { type: "weaponStat", weapon: "beehive", stat: "durationMs" },
    value: 200,
    descriptionKey: "wearables.buff.yellowSlimePuppet",
  },
  "Sad Slime Hat": {
    target: { type: "weaponStat", weapon: "tomato", stat: "bounceCount" },
    value: 1,
    descriptionKey: "wearables.buff.sadSlimeHat",
  },
  "Red Jelly Pants": {
    target: { type: "playerStat", stat: "speed" },
    value: 5,
    descriptionKey: "wearables.buff.redJellyPants",
  },
  "Blue Jelly Shoes": {
    target: { type: "weaponStat", weapon: "sunflower", stat: "projectileSpeed" },
    value: 15,
    descriptionKey: "wearables.buff.blueJellyShoes",
  },
  "Sad Slime Slippers": {
    target: { type: "weaponStat", weapon: "wateringCan", stat: "cooldownMs" },
    value: -50,
    descriptionKey: "wearables.buff.sadSlimeSlippers",
  },
  "Paint Splattered Hair": {
    target: { type: "weaponStat", weapon: "tomato", stat: "projectileSpeed" },
    value: 10,
    descriptionKey: "wearables.buff.paintSplatteredHair",
  },
  "Paint Splattered Shirt": {
    target: { type: "weaponStat", weapon: "corn", stat: "areaRadius" },
    value: 2,
    descriptionKey: "wearables.buff.paintSplatteredShirt",
  },
  "Paint Splattered Overalls": {
    target: {
      type: "weaponStat",
      weapon: "sunflower",
      stat: "cooldownMs",
    },
    value: -100,
    descriptionKey: "wearables.buff.paintSplatteredOveralls",
  },
  "Paint Spray Can": {
    target: { type: "weaponStat", weapon: "wateringCan", stat: "damage" },
    value: 1,
    descriptionKey: "wearables.buff.paintSprayCan",
  },
  "Moonseeker Potion": {
    target: { type: "playerStat", stat: "damage" },
    value: 0.5,
    descriptionKey: "wearables.buff.moonseekerPotion",
  },
  "Moonseeker Hand Puppet": {
    target: { type: "weaponStat", weapon: "beehive", stat: "cooldownMs" },
    value: -100,
    descriptionKey: "wearables.buff.moonseekerHandPuppet",
  },
  "Halloween Deathscythe": {
    target: { type: "weaponStat", weapon: "broomScythe", stat: "range" },
    value: 5,
    descriptionKey: "wearables.buff.halloweenDeathscythe",
  },
  "Sweet Devil Horns": {
    target: { type: "weaponStat", weapon: "broomScythe", stat: "damage" },
    value: 1,
    descriptionKey: "wearables.buff.sweetDevilHorns",
  },
  "Sweet Devil Dress": {
    target: { type: "playerStat", stat: "damage" },
    value: 0.5,
    descriptionKey: "wearables.buff.sweetDevilDress",
  },
  "Trick and Treat": {
    target: { type: "weaponStat", weapon: "tomato", stat: "damage" },
    value: 1,
    descriptionKey: "wearables.buff.trickAndTreat",
  },
  "Jack O'Sweets": {
    target: { type: "weaponStat", weapon: "pumpkin", stat: "size" },
    value: 0.1,
    descriptionKey: "wearables.buff.jackOSweets",
  },
  "Frank Onesie": {
    target: { type: "weaponStat", weapon: "broomScythe", stat: "range" },
    value: 5,
    descriptionKey: "wearables.buff.frankOnesie",
  },
  "Comfy Xmas Sweater": {
    target: { type: "weaponStat", weapon: "beehive", stat: "durationMs" },
    value: 300,
    descriptionKey: "wearables.buff.comfyXmasSweater",
  },
  "Comfy Xmas Pants": {
    target: { type: "weaponStat", weapon: "broomScythe", stat: "cooldownMs" },
    value: -100,
    descriptionKey: "wearables.buff.comfyXmasPants",
  },
  "Candy Halbred": {
    target: { type: "weaponStat", weapon: "pumpkin", stat: "pierce" },
    value: 2,
    descriptionKey: "wearables.buff.candyHalbred",
  },
  "Xmas Top Hat": {
    target: { type: "weaponStat", weapon: "sunflower", stat: "damage" },
    value: 1,
    descriptionKey: "wearables.buff.xmasTopHat",
  },
  "Reindeer Mask": {
    target: { type: "weaponStat", weapon: "pumpkin", stat: "size" },
    value: 0.1,
    descriptionKey: "wearables.buff.reindeerMask",
  },
  "Snowman Mask": {
    target: { type: "weaponStat", weapon: "oil", stat: "cooldownMs" },
    value: -100,
    descriptionKey: "wearables.buff.snowmanMask",
  },
  "Cozy Reindeer Onesie": {
    target: { type: "playerStat", stat: "damage" },
    value: 0.5,
    descriptionKey: "wearables.buff.cozyReindeerOnesie",
  },
  "Neon Noiz Jacket": {
    target: { type: "weaponStat", weapon: "beehive", stat: "damage" },
    value: 1,
    descriptionKey: "wearables.buff.neonNoizJacket",
  },
  "404 Chic Top": {
    target: { type: "weaponStat", weapon: "pumpkin", stat: "damage" },
    value: 1,
    descriptionKey: "wearables.buff.404ChicTop",
  },
  "Pumpkin Head": {
    target: { type: "weaponStat", weapon: "pumpkin", stat: "cooldownMs" },
    value: -100,
    descriptionKey: "wearables.buff.pumpkinHead",
  },
  "Neon Noiz Pants": {
    target: { type: "weaponStat", weapon: "banana", stat: "damage" },
    value: 1,
    descriptionKey: "wearables.buff.neonNoizPants",
  },
  "404 Chic Skirt": {
    target: {
      type: "weaponStat",
      weapon: "sunflower",
      stat: "projectileSpeed",
    },
    value: 15,
    descriptionKey: "wearables.buff.404ChicSkirt",
  },
  "Neon Noiz Shoes": {
    target: { type: "playerStat", stat: "speed" },
    value: 5,
    descriptionKey: "wearables.buff.neonNoizShoes",
  },
  "404 Chic Boots": {
    target: { type: "weaponStat", weapon: "broomScythe", stat: "cooldownMs" },
    value: -100,
    descriptionKey: "wearables.buff.404ChicBoots",
  },
  "Frizzy Bob Cut": {
    target: { type: "weaponStat", weapon: "banana", stat: "orbitRadius" },
    value: 5,
    descriptionKey: "wearables.buff.frizzyBobCut",
  },
  "Two-toned Layered": {
    target: { type: "weaponStat", weapon: "sunflower", stat: "cooldownMs" },
    value: -100,
    descriptionKey: "wearables.buff.twoTonedLayered",
  },
  "Research Uniform": {
    target: { type: "weaponStat", weapon: "wateringCan", stat: "pierce" },
    value: 1,
    descriptionKey: "wearables.buff.researchUniform",
  },
  "Cool Glasses": {
    target: { type: "weaponStat", weapon: "banana", stat: "damage" },
    value: 1,
    descriptionKey: "wearables.buff.coolGlasses",
  },
  "Cookie Shield": {
    target: { type: "weaponStat", weapon: "banana", stat: "hitCooldownMs" },
    value: -50,
    descriptionKey: "wearables.buff.cookieShield",
  },
  "Admin Fools Tools": {
    target: { type: "weaponStat", weapon: "corn", stat: "cooldownMs" },
    value: -100,
    descriptionKey: "wearables.buff.adminFoolsTools",
  },
  "Aether Specs": {
    target: { type: "weaponStat", weapon: "sunflower", stat: "cooldownMs" },
    value: -100,
    descriptionKey: "wearables.buff.aetherSpecs",
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
