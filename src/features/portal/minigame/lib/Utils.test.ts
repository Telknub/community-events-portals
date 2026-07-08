import type { Minigame, Wardrobe } from "features/game/types/game";

jest.mock("../constants", () => ({
  ATTEMPTS_BETA_TESTERS: 0,
  ATTEMPTS_PURCHASED_BY_MISTAKE: [],
  BETA_TESTERS: [],
  FREE_DAILY_ATTEMPTS: 1,
  INITIAL_DATE: "2026-01-01",
  RESTOCK_ATTEMPTS: [],
  UNLIMITED_ATTEMPTS_AURA_DISCOUNT_SFL: 150,
  UNLIMITED_ATTEMPTS_DISCOUNT_AURAS: [
    "Slime Aura",
    "Butterfly Aura",
    "Wisp Aura",
    "Diamond Snow Aura",
    "Glitch Aura",
  ],
  UNLIMITED_ATTEMPTS_SFL: 200,
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const {
  getAttemptsLeft,
  getUnlimitedAttemptsSfl,
  hasUnlimitedAttemptsDiscountAura,
} = require("./Utils");

describe("portal minigame attempts utils", () => {
  it("discounts unlimited attempts when the player owns an eligible aura", () => {
    const wardrobe: Wardrobe = {
      "Slime Aura": 1,
    };

    expect(hasUnlimitedAttemptsDiscountAura(wardrobe)).toBe(true);
    expect(getUnlimitedAttemptsSfl(wardrobe)).toBe(150);
  });

  it("uses the full unlimited attempts price without an eligible aura", () => {
    expect(hasUnlimitedAttemptsDiscountAura({})).toBe(false);
    expect(getUnlimitedAttemptsSfl({})).toBe(200);
  });

  it("treats discounted unlimited attempts purchases as unlimited attempts", () => {
    const minigame: Minigame = {
      highscore: 0,
      history: {},
      purchases: [
        {
          purchasedAt: Date.now(),
          sfl: 150,
          items: {},
        },
      ],
    };

    expect(getAttemptsLeft(minigame)).toBe(Infinity);
  });
});
