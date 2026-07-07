jest.mock("features/auth/actions/login", () => ({
  decodeToken: () => ({ farmId: 1 }),
}));

jest.mock("features/portal/actions/loadPortal", () => ({
  getUrl: () => undefined,
  loadPortal: jest.fn(),
}));

jest.mock("features/portal/lib/portalUtil", () => ({
  startAttempt: jest.fn(),
  submitScore: jest.fn(),
}));

jest.mock("features/game/events/minigames/startMinigameAttempt", () => ({
  startMinigameAttempt: ({ state }: { state: unknown }) => state,
}));

jest.mock("features/game/events/minigames/submitMinigameScore", () => ({
  submitMinigameScore: jest.fn(({ state }: { state: unknown }) => state),
}));

jest.mock("features/game/events/minigames/purchaseMinigameItem", () => ({
  purchaseMinigameItem: ({ state }: { state: unknown }) => state,
}));

jest.mock("../constants", () => {
  const playerLevel = jest.requireActual("../constants/PlayerLevelConstants");
  const playerStats = jest.requireActual("../constants/PlayerStatConstants");

  return {
    ...playerLevel,
    ...playerStats,
    DROP_ITEM_XP_VALUES: {
      blueOrb: 1,
      greenOrb: 2,
      grayOrb: 3,
      yellowOrb: 4,
      purpleOrb: 5,
    },
    ENEMY_BALANCE_STATS: {
      mob1: { DAMAGE: 1 },
      mob2: { DAMAGE: 1 },
      mob3: { DAMAGE: 1 },
      mob4: { DAMAGE: 1 },
      mob5: { DAMAGE: 1 },
      boss1: { DAMAGE: 1 },
      boss2: { DAMAGE: 1 },
      boss3: { DAMAGE: 1 },
    },
    FREE_DAILY_ATTEMPTS: 1,
    GAME_LIVES: 100,
    GAME_SECONDS: 300,
    INITIAL_DATE: "2026-01-01",
    ATTEMPTS_BETA_TESTERS: 0,
    BETA_TESTERS: [],
    PORTAL_NAME: "colors-2026",
    RESTOCK_ATTEMPTS: [],
    UNLIMITED_ATTEMPTS_SFL: 150,
  };
});

if (!global.structuredClone) {
  global.structuredClone = (value) => JSON.parse(JSON.stringify(value));
}

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { interpret } = require("xstate");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { portalMachine } = require("./Machine");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { getNextLevelXP, PLAYER_MAX_LEVEL } = require("../constants");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { submitScore } = require("features/portal/lib/portalUtil");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const submitMinigameScoreModule = require("features/game/events/minigames/submitMinigameScore");
const { submitMinigameScore } = submitMinigameScoreModule;

describe("portalMachine progression flow", () => {
  it("does not show the initial weapon choice before the game starts", () => {
    const state = portalMachine.initialState;

    expect(state.context.pendingLevelUpChoice).toBeUndefined();
    expect(state.context.isGameplayPaused).toBe(false);
  });

  it("creates the initial weapon choice only after START", () => {
    const state = portalMachine
      .withContext({
        ...portalMachine.initialState.context,
        attemptsLeft: 1,
      })
      .transition("ready", { type: "START" });

    expect(state.matches("playing")).toBe(true);
    expect(state.context.endAt).toBe(0);
    expect(state.context.isGameplayPaused).toBe(true);
    expect(state.context.pendingLevelUpChoice?.type).toBe("weapon");
    expect(state.context.pendingLevelUpChoice?.level).toBe(1);
    expect(state.context.pendingLevelUpChoice?.options).toHaveLength(3);
  });

  it("starts the timer after the initial weapon is chosen", () => {
    const service = interpret(
      portalMachine.withContext({
        ...portalMachine.initialState.context,
        attemptsLeft: 1,
      }),
    ).start("ready");

    service.send("START");

    const weapon = service.state.context.pendingLevelUpChoice?.options[0];
    expect(weapon).toBeDefined();

    service.send("SELECT_LEVEL_UP_WEAPON", { weapon: weapon! });

    expect(service.state.context.pendingLevelUpChoice).toBeUndefined();
    expect(service.state.context.isGameplayPaused).toBe(false);
    expect(service.state.context.endAt).toBeGreaterThan(Date.now());

    service.stop();
  });

  it("extends endAt by the paused duration when gameplay resumes", () => {
    const nowSpy = jest.spyOn(Date, "now").mockReturnValue(1000);
    const service = interpret(
      portalMachine.withContext({
        ...portalMachine.initialState.context,
        endAt: 301000,
        isGameplayPaused: false,
        pendingLevelUpChoice: undefined,
      }),
    ).start("playing");

    service.send("SET_GAMEPLAY_PAUSED", { isPaused: true });

    expect(service.state.context.isGameplayPaused).toBe(true);
    expect(service.state.context.gameplayPausedAt).toBe(1000);
    expect(service.state.context.endAt).toBe(301000);

    nowSpy.mockReturnValue(6000);
    service.send("SET_GAMEPLAY_PAUSED", { isPaused: false });

    expect(service.state.context.isGameplayPaused).toBe(false);
    expect(service.state.context.gameplayPausedAt).toBeUndefined();
    expect(service.state.context.endAt).toBe(306000);

    service.stop();
    nowSpy.mockRestore();
  });

  it("does not create an endAt when pausing before the timer starts", () => {
    const nowSpy = jest.spyOn(Date, "now").mockReturnValue(1000);
    const service = interpret(
      portalMachine.withContext({
        ...portalMachine.initialState.context,
        attemptsLeft: 1,
      }),
    ).start("ready");

    service.send("START");
    service.send("SET_GAMEPLAY_PAUSED", { isPaused: true });

    expect(service.state.context.endAt).toBe(0);
    expect(service.state.context.gameplayPausedAt).toBeUndefined();

    nowSpy.mockReturnValue(6000);
    service.send("SET_GAMEPLAY_PAUSED", { isPaused: false });

    expect(service.state.context.endAt).toBe(0);
    expect(service.state.context.isGameplayPaused).toBe(true);

    service.stop();
    nowSpy.mockRestore();
  });

  it("extends endAt when resolving a level-up choice after a pause", () => {
    const nowSpy = jest.spyOn(Date, "now").mockReturnValue(2000);
    const service = interpret(
      portalMachine.withContext({
        ...portalMachine.initialState.context,
        endAt: 302000,
        currentXP: 9,
        nextLevelXP: 10,
        isGameplayPaused: false,
        pendingLevelUpChoice: undefined,
      }),
    ).start("playing");

    service.send("COLLECT_ITEM", { itemKey: "purpleOrb" });

    expect(service.state.context.pendingLevelUpChoice?.type).toBe("stat");
    expect(service.state.context.isGameplayPaused).toBe(true);
    expect(service.state.context.gameplayPausedAt).toBe(2000);

    nowSpy.mockReturnValue(7000);
    service.send("SELECT_LEVEL_UP_STAT", { stat: "damage" });

    expect(service.state.context.pendingLevelUpChoice).toBeUndefined();
    expect(service.state.context.isGameplayPaused).toBe(false);
    expect(service.state.context.gameplayPausedAt).toBeUndefined();
    expect(service.state.context.endAt).toBe(307000);

    service.stop();
    nowSpy.mockRestore();
  });

  it("does not resume gameplay while a level-up choice is pending", () => {
    const nowSpy = jest.spyOn(Date, "now").mockReturnValue(1000);
    const service = interpret(
      portalMachine.withContext({
        ...portalMachine.initialState.context,
        endAt: 301000,
        isGameplayPaused: true,
        pendingLevelUpChoice: {
          type: "stat",
          level: 2,
          options: ["damage", "speed"],
        },
      }),
    ).start("playing");

    service.send("SET_GAMEPLAY_PAUSED", { isPaused: false });

    expect(service.state.context.isGameplayPaused).toBe(true);
    expect(service.state.context.gameplayPausedAt).toBe(1000);
    expect(service.state.context.endAt).toBe(301000);

    service.stop();
    nowSpy.mockRestore();
  });

  it("applies health wearable buffs when active wearables change", () => {
    const service = interpret(
      portalMachine.withContext({
        ...portalMachine.initialState.context,
      }),
    ).start("playing");

    service.send("SET_ACTIVE_WEARABLES", {
      wearables: { tool: "Handheld Bunny" },
    });

    expect(service.state.context.maxLives).toBe(120);
    expect(service.state.context.lives).toBe(120);

    service.send("SET_ACTIVE_WEARABLES", {
      wearables: { pants: "Comfy Xmas Pants" },
    });

    expect(service.state.context.maxLives).toBe(125);
    expect(service.state.context.lives).toBe(125);

    service.send("LOSE_LIFE", { enemyType: "mob1" });
    service.send("SET_ACTIVE_WEARABLES", { wearables: {} });

    expect(service.state.context.maxLives).toBe(100);
    expect(service.state.context.lives).toBe(100);

    service.stop();
  });

  it("starts runs with active health wearable buffs applied", () => {
    const service = interpret(
      portalMachine.withContext({
        ...portalMachine.initialState.context,
        activeWearables: { tool: "Handheld Bunny" },
        attemptsLeft: 1,
      }),
    ).start("ready");

    service.send("START");

    expect(service.state.context.maxLives).toBe(120);
    expect(service.state.context.lives).toBe(120);

    service.stop();
  });

  it("clears pending choices when retrying after a game over", () => {
    const service = interpret(
      portalMachine.withContext({
        ...portalMachine.initialState.context,
        attemptsLeft: 1,
      }),
    ).start("ready");

    service.send("START");
    expect(service.state.context.pendingLevelUpChoice).toBeDefined();

    service.send("GAME_OVER");
    service.send("RETRY");

    expect(service.state.context.pendingLevelUpChoice).toBeUndefined();
    expect(service.state.context.endAt).toBe(0);

    service.stop();
  });

  it("stops player XP progression at the configured max level", () => {
    const levelBeforeMax = PLAYER_MAX_LEVEL - 1;
    const nextLevelXP = getNextLevelXP(levelBeforeMax);
    const service = interpret(
      portalMachine.withContext({
        ...portalMachine.initialState.context,
        playerLevel: levelBeforeMax,
        currentXP: Math.max(0, (nextLevelXP ?? 1) - 1),
        nextLevelXP,
        collected: 10,
        xpPoints: 2,
        pendingLevelUpChoice: undefined,
        isGameplayPaused: false,
      }),
    ).start("playing");

    const initialCollected = service.state.context.collected;

    service.send("COLLECT_ITEM", { itemKey: "purpleOrb" });

    expect(service.state.context.playerLevel).toBe(PLAYER_MAX_LEVEL);
    expect(service.state.context.currentXP).toBe(0);
    expect(service.state.context.nextLevelXP).toBeUndefined();
    expect(service.state.context.xpPoints).toBe(3);
    expect(service.state.context.collected).toBe(initialCollected + 5);

    service.send("COLLECT_ITEM", { itemKey: "purpleOrb" });

    expect(service.state.context.playerLevel).toBe(PLAYER_MAX_LEVEL);
    expect(service.state.context.currentXP).toBe(0);
    expect(service.state.context.nextLevelXP).toBeUndefined();
    expect(service.state.context.xpPoints).toBe(3);
    expect(service.state.context.collected).toBe(initialCollected + 10);

    service.stop();
  });

  it("uses collected as the submitted score and winner target score", () => {
    const service = interpret(
      portalMachine.withContext({
        ...portalMachine.initialState.context,
        state: {
          minigames: {
            games: {
              "colors-2026": {
                history: {},
                highscore: 0,
                purchases: [],
              },
            },
            prizes: {
              "colors-2026": {
                coins: 0,
                items: {},
                wearables: {},
                score: 10,
                startAt: 0,
                endAt: Date.now() + 1000,
              },
            },
          },
        },
        score: 1,
        collected: 10,
        isTraining: false,
      }),
    ).start("playing");

    service.send("GAME_OVER");

    expect(service.state.matches("winner")).toBe(true);
    expect(service.state.context.lastScore).toBe(10);
    expect(submitScore).toHaveBeenCalledWith({ score: 10 });
    expect(submitMinigameScore).toHaveBeenCalledWith(
      expect.objectContaining({
        action: expect.objectContaining({
          score: 10,
        }),
      }),
    );

    service.stop();
  });
});
