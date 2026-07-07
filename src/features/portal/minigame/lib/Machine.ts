import { OFFLINE_FARM } from "features/game/lib/landData";
import { assign, createMachine, type Interpreter, type State } from "xstate";
import { CONFIG } from "lib/config";
import { decodeToken } from "features/auth/actions/login";
import {
  UNLIMITED_ATTEMPTS_SFL,
  FREE_DAILY_ATTEMPTS,
  GAME_SECONDS,
  GAME_LIVES,
  PORTAL_NAME,
  DROP_ITEM_XP_VALUES,
  DEFAULT_PLAYER_STAT_LEVELS,
  getLevelUpChoice,
  getNextLevelXP,
  getNextPlayerStatLevel,
  getPlayerStatValueIncrease,
  getUnlockedWeapons,
  isPlayerMaxLevel,
  LEVEL_UP_WEAPON_IDS,
  PLAYER_INITIAL_LEVEL,
  shouldGrantXPPoint,
  ENEMY_BALANCE_STATS,
} from "../constants";
import type { GameState } from "features/game/types/game";
import type { BumpkinParts } from "lib/utils/tokenUriBuilder";
import { purchaseMinigameItem } from "features/game/events/minigames/purchaseMinigameItem";
import { startMinigameAttempt } from "features/game/events/minigames/startMinigameAttempt";
import { submitMinigameScore } from "features/game/events/minigames/submitMinigameScore";
import { submitScore, startAttempt } from "features/portal/lib/portalUtil";
import { getUrl, loadPortal } from "features/portal/actions/loadPortal";
import { getAttemptsLeft } from "./Utils";
import type {
  DropItemType,
  EnemyType,
  LevelUpChoice,
  PlayerStatId,
  PlayerStatLevels,
  WeaponId,
  WeaponLevel,
} from "../Types";

const getJWT = () => {
  const code = new URLSearchParams(window.location.search).get("jwt");
  return code;
};

const getRunScore = (context: Context) => context.collected;

export interface Context {
  id: number;
  jwt: string | null;
  isJoystickActive: boolean;
  state: GameState | undefined;
  score: number;
  collected: number;
  lastScore: number;
  endAt: number;
  attemptsLeft: number;
  lives: number;
  maxLives: number;
  validations: Record<string, boolean>;
  isTraining: boolean;

  playerLevel: number;
  currentXP: number;
  nextLevelXP?: number;
  xpPoints: number;
  selectedStat?: PlayerStatId;
  pendingLevelUpChoice?: LevelUpChoice;
  isGameplayPaused: boolean;
  weaponLevels: Record<WeaponId, WeaponLevel>;
  hudWeapons: WeaponId[];
  playerStatLevels: PlayerStatLevels;
  activeWearables?: BumpkinParts;
}

const DEFAULT_WEAPON_LEVELS: Record<WeaponId, WeaponLevel> =
  LEVEL_UP_WEAPON_IDS.reduce(
    (levels, weaponId) => ({
      ...levels,
      [weaponId]: 0,
    }),
    {} as Record<WeaponId, WeaponLevel>,
  );

const getNextWeaponLevel = (level: WeaponLevel) => {
  if (level >= 8) return undefined;

  return (level + 1) as WeaponLevel;
};

const getInitialProgression = ({
  withInitialWeaponChoice = false,
}: {
  withInitialWeaponChoice?: boolean;
} = {}) => {
  const weaponLevels = { ...DEFAULT_WEAPON_LEVELS };
  const pendingLevelUpChoice = withInitialWeaponChoice
    ? getLevelUpChoice({
        level: PLAYER_INITIAL_LEVEL,
        weaponLevels,
      })
    : undefined;

  return {
    collected: 0,
    playerLevel: PLAYER_INITIAL_LEVEL,
    currentXP: 0,
    nextLevelXP: getNextLevelXP(PLAYER_INITIAL_LEVEL),
    xpPoints: 0,
    selectedStat: undefined,
    pendingLevelUpChoice,
    isGameplayPaused: !!pendingLevelUpChoice,
    weaponLevels,
    hudWeapons: [] as WeaponId[],
    playerStatLevels: { ...DEFAULT_PLAYER_STAT_LEVELS },
  };
};

const resolveXPProgression = ({
  context,
  gainedXP,
}: {
  context: Context;
  gainedXP: number;
}): Partial<Context> => {
  if (context.pendingLevelUpChoice) return {};
  if (isPlayerMaxLevel(context.playerLevel)) {
    return {
      collected: context.collected + gainedXP,
    };
  }

  let playerLevel = context.playerLevel;
  let currentXP = context.currentXP + gainedXP;
  let nextLevelXP = getNextLevelXP(playerLevel);
  let xpPoints = context.xpPoints;
  let pendingLevelUpChoice: LevelUpChoice | undefined;

  while (
    nextLevelXP !== undefined &&
    currentXP >= nextLevelXP &&
    !pendingLevelUpChoice
  ) {
    currentXP -= nextLevelXP;
    playerLevel += 1;
    nextLevelXP = getNextLevelXP(playerLevel);

    const choice = getLevelUpChoice({
      level: playerLevel,
      weaponLevels: context.weaponLevels,
    });

    if (choice) {
      pendingLevelUpChoice = choice;
    } else if (shouldGrantXPPoint(playerLevel)) {
      xpPoints += 1;
    }

    if (isPlayerMaxLevel(playerLevel)) {
      currentXP = 0;
      pendingLevelUpChoice = undefined;
      break;
    }
  }

  return {
    collected: context.collected + gainedXP,
    playerLevel,
    currentXP,
    nextLevelXP,
    xpPoints,
    pendingLevelUpChoice,
    isGameplayPaused: pendingLevelUpChoice ? true : context.isGameplayPaused,
  };
};

// type UnlockAchievementsEvent = {
//   type: "UNLOCKED_ACHIEVEMENTS";
//   achievementNames: AchievementsName[];
// };

type SetJoystickActiveEvent = {
  type: "SET_JOYSTICK_ACTIVE";
  isJoystickActive: boolean;
};

type PurchaseRestockEvent = {
  type: "PURCHASED_RESTOCK";
  sfl: number;
};

type GainPointsEvent = {
  type: "GAIN_POINTS";
  points: number;
};

type LoseLifeEvent = {
  type: "LOSE_LIFE";
  enemyType: EnemyType;
};

type CollectItemEvent = {
  type: "COLLECT_ITEM";
  itemKey: DropItemType;
};

type SetValidationsEvent = {
  type: "SET_VALIDATIONS";
  validation: string;
};

type UpgradeWeaponEvent = {
  type: "UPGRADE_WEAPON";
  weapon: WeaponId;
};

type UpgradePlayerStatEvent = {
  type: "UPGRADE_PLAYER_STAT";
  stat: PlayerStatId;
};

type SelectLevelUpWeaponEvent = {
  type: "SELECT_LEVEL_UP_WEAPON";
  weapon: WeaponId;
};

type SelectLevelUpStatEvent = {
  type: "SELECT_LEVEL_UP_STAT";
  stat: PlayerStatId;
};

type SetGameplayPausedEvent = {
  type: "SET_GAMEPLAY_PAUSED";
  isPaused: boolean;
};

type SetActiveWearablesEvent = {
  type: "SET_ACTIVE_WEARABLES";
  wearables: BumpkinParts;
};

export type PortalEvent =
  | SetJoystickActiveEvent
  | { type: "START" }
  | { type: "CLAIM" }
  | { type: "CANCEL_PURCHASE" }
  | PurchaseRestockEvent
  | { type: "PURCHASED_UNLIMITED" }
  | { type: "RETRY" }
  | { type: "CONTINUE" }
  | { type: "CONTINUE_TRAINING" }
  | { type: "END_GAME_EARLY" }
  | { type: "GAME_OVER" }
  | GainPointsEvent
  | LoseLifeEvent
  | SetValidationsEvent
  | CollectItemEvent
  | UpgradeWeaponEvent
  | UpgradePlayerStatEvent
  | SelectLevelUpWeaponEvent
  | SelectLevelUpStatEvent
  | SetGameplayPausedEvent
  | SetActiveWearablesEvent;

export type PortalState = {
  value:
    | "initialising"
    | "error"
    | "ready"
    | "unauthorised"
    | "loading"
    | "introduction"
    | "playing"
    | "gameOver"
    | "winner"
    | "loser"
    | "complete"
    | "starting"
    | "noAttempts";
  context: Context;
};

export type MachineInterpreter = Interpreter<
  Context,
  any,
  PortalEvent,
  PortalState
>;

export type PortalMachineState = State<Context, PortalEvent, PortalState>;

const VALIDATIONS = {};

const resetGameTransition = {
  RETRY: {
    target: "starting",
    actions: assign((context: Context): Partial<Context> => ({
      score: 0,
      lives: GAME_LIVES,
      maxLives: GAME_LIVES,
      endAt: 0,
      ...getInitialProgression(),
      activeWearables: context.activeWearables,
      validations: structuredClone(VALIDATIONS),
    })) as any,
  },
};

export const portalMachine = createMachine<Context, PortalEvent, PortalState>({
  id: "portalMachine",
  initial: "initialising",
  context: {
    id: 0,
    jwt: getJWT(),

    isJoystickActive: false,

    state: CONFIG.API_URL ? undefined : OFFLINE_FARM,

    score: 0,
    lastScore: 0,
    lives: GAME_LIVES,
    maxLives: GAME_LIVES,
    attemptsLeft: 0,
    endAt: 0,
    isTraining: false,
    validations: structuredClone(VALIDATIONS),
    ...getInitialProgression(),

    // Portal minigame
  },
  on: {
    SET_JOYSTICK_ACTIVE: {
      actions: assign({
        isJoystickActive: (_: Context, event: SetJoystickActiveEvent) => {
          return event.isJoystickActive;
        },
      }),
    },
    SET_ACTIVE_WEARABLES: {
      actions: assign({
        activeWearables: (_: Context, event: SetActiveWearablesEvent) => {
          return event.wearables;
        },
      }),
    },
    SET_GAMEPLAY_PAUSED: {
      actions: assign({
        isGameplayPaused: (context: Context, event: SetGameplayPausedEvent) => {
          if (context.pendingLevelUpChoice) return true;

          return event.isPaused;
        },
      }),
    },
    UPGRADE_WEAPON: {
      actions: assign((context: Context, event: UpgradeWeaponEvent) => {
        const currentLevel = context.weaponLevels[event.weapon];
        const nextLevel = getNextWeaponLevel(currentLevel);
        const canUpgrade =
          currentLevel > 0 && nextLevel !== undefined && context.xpPoints > 0;
        if (!canUpgrade) return {};

        return {
          xpPoints: context.xpPoints - 1,
          weaponLevels: {
            ...context.weaponLevels,
            [event.weapon]: nextLevel,
          },
        };
      }),
    },
    UPGRADE_PLAYER_STAT: {
      actions: assign(
        (context: Context, event: UpgradePlayerStatEvent): Partial<Context> => {
          const level = context.playerStatLevels[event.stat];
          const nextLevel = getNextPlayerStatLevel(level);
          const canUpgrade =
            context.selectedStat === event.stat &&
            nextLevel !== undefined &&
            context.xpPoints > 0;
          if (!canUpgrade) return {};

          const healthIncrease =
            event.stat === "health"
              ? getPlayerStatValueIncrease("health", level)
              : 0;

          return {
            xpPoints: context.xpPoints - 1,
            playerStatLevels: {
              ...context.playerStatLevels,
              [event.stat]: nextLevel,
            },
            maxLives: context.maxLives + healthIncrease,
            lives: context.lives + healthIncrease,
          };
        },
      ),
    },
    // UNLOCKED_ACHIEVEMENTS: {
    //   actions: assign({
    //     state: (context: Context, event: UnlockAchievementsEvent) => {
    //       achievementsUnlocked({ achievementNames: event.achievementNames });
    //       return unlockMinigameAchievements({
    //         state: context.state as GameState,
    //         action: {
    //           type: "minigame.achievementsUnlocked",
    //           id: PORTAL_NAME,
    //           achievementNames: event.achievementNames,
    //         },
    //       });
    //     },
    //   }),
    // },
  },
  states: {
    initialising: {
      always: [
        {
          target: "unauthorised",
          // TODO: Also validate token
          cond: (context) => !!CONFIG.API_URL && !context.jwt,
        },
        {
          target: "loading",
        },
      ],
    },
    loading: {
      id: "loading",
      invoke: {
        src: async (context) => {
          if (!getUrl()) {
            return { game: OFFLINE_FARM, attemptsLeft: FREE_DAILY_ATTEMPTS };
          }

          const { farmId } = decodeToken(context.jwt as string);

          // Load the game data
          const { game } = await loadPortal({
            portalId: CONFIG.PORTAL_APP,
            token: context.jwt as string,
          });

          const minigame = game.minigames.games[PORTAL_NAME];
          const attemptsLeft = getAttemptsLeft(minigame, farmId);

          return { game, farmId, attemptsLeft };
        },
        onDone: [
          {
            target: "introduction",
            actions: assign({
              state: (_: Context, event) => event.data.game,
              id: (_: Context, event) => event.data.farmId,
              attemptsLeft: (_: Context, event) => event.data.attemptsLeft,
            }),
          },
        ],
        onError: {
          target: "error",
        },
      },
    },

    noAttempts: {
      on: {
        CANCEL_PURCHASE: {
          target: "introduction",
        },
        PURCHASED_RESTOCK: {
          target: "introduction",
          actions: assign({
            state: (context: Context, event: PurchaseRestockEvent) =>
              purchaseMinigameItem({
                state: context.state as GameState,
                action: {
                  id: PORTAL_NAME,
                  sfl: event.sfl,
                  type: "minigame.itemPurchased",
                  items: {},
                },
              }),
          }),
        },
        PURCHASED_UNLIMITED: {
          target: "introduction",
          actions: assign({
            state: (context: Context) =>
              purchaseMinigameItem({
                state: context.state as GameState,
                action: {
                  id: PORTAL_NAME,
                  sfl: UNLIMITED_ATTEMPTS_SFL,
                  type: "minigame.itemPurchased",
                  items: {},
                },
              }),
          }),
        },
      },
    },

    starting: {
      always: [
        {
          target: "noAttempts",
          cond: (context) => {
            if (context.isTraining) return false;
            const farmId = !getUrl()
              ? 0
              : decodeToken(context.jwt as string).farmId;
            const minigame = context.state?.minigames.games[PORTAL_NAME];
            const attemptsLeft = getAttemptsLeft(minigame, farmId);
            return attemptsLeft <= 0;
          },
        },
        {
          target: "ready",
        },
      ],
    },

    introduction: {
      on: {
        CONTINUE: {
          target: "starting",
          actions: assign({
            isTraining: false,
            state: (context: Context) => context.state,
          }),
        },
        CONTINUE_TRAINING: {
          target: "starting",
          actions: assign({
            isTraining: true,
            state: (context: Context) => context.state,
          }),
        },
      },
    },

    ready: {
      on: {
        START: {
          target: "playing",
          actions: assign((context: Context): Partial<Context> => {
            const state = (() => {
              if (context.isTraining) return context.state;
              startAttempt();
              return startMinigameAttempt({
                state: context.state as GameState,
                action: {
                  type: "minigame.attemptStarted",
                  id: PORTAL_NAME,
                },
              });
            })();

            return {
              endAt: 0,
              score: 0,
              lives: GAME_LIVES,
              maxLives: GAME_LIVES,
              ...getInitialProgression({ withInitialWeaponChoice: true }),
              validations: structuredClone(VALIDATIONS),
              state,
              attemptsLeft: context.isTraining
                ? context.attemptsLeft
                : context.attemptsLeft - 1,
            };
          }) as any,
        },
      },
    },

    playing: {
      on: {
        SELECT_LEVEL_UP_WEAPON: {
          actions: assign(
            (
              context: Context,
              event: SelectLevelUpWeaponEvent,
            ): Partial<Context> => {
              const choice = context.pendingLevelUpChoice;
              if (choice?.type !== "weapon") return {};
              if (!choice.options.includes(event.weapon)) return {};
              if (context.weaponLevels[event.weapon] > 0) return {};

              const weaponLevels = {
                ...context.weaponLevels,
                [event.weapon]: 1 as WeaponLevel,
              };
              const hudWeapons = getUnlockedWeapons(weaponLevels);

              return {
                weaponLevels,
                hudWeapons,
                pendingLevelUpChoice: undefined,
                isGameplayPaused: false,
                endAt:
                  context.endAt > 0
                    ? context.endAt
                    : Date.now() + GAME_SECONDS * 1000,
              };
            },
          ),
        },
        SELECT_LEVEL_UP_STAT: {
          actions: assign(
            (
              context: Context,
              event: SelectLevelUpStatEvent,
            ): Partial<Context> => {
              const choice = context.pendingLevelUpChoice;
              if (choice?.type !== "stat") return {};
              if (!choice.options.includes(event.stat)) return {};

              const level = context.playerStatLevels[event.stat];
              const nextLevel = getNextPlayerStatLevel(level);
              if (nextLevel === undefined) return {};

              const healthIncrease =
                event.stat === "health"
                  ? getPlayerStatValueIncrease("health", level)
                  : 0;

              return {
                selectedStat: event.stat,
                playerStatLevels: {
                  ...context.playerStatLevels,
                  [event.stat]: nextLevel,
                },
                maxLives: context.maxLives + healthIncrease,
                lives: context.lives + healthIncrease,
                pendingLevelUpChoice: undefined,
                isGameplayPaused: false,
              };
            },
          ),
        },
        GAIN_POINTS: {
          actions: assign({
            score: (context: Context, event: GainPointsEvent) => {
              const { points = 1 } = event;
              return context.score + points;
            },
          }),
        },
        COLLECT_ITEM: {
          actions: assign((context: Context, event: CollectItemEvent) => {
            const gainedXP = DROP_ITEM_XP_VALUES[event.itemKey] ?? 1;

            return resolveXPProgression({ context, gainedXP });
          }),
        },
        LOSE_LIFE: {
          actions: assign({
            lives: (context, event) => {
              const damage = ENEMY_BALANCE_STATS[event.enemyType].DAMAGE;
              return Math.max(0, context.lives - damage);
            },
          }),
        },
        SET_VALIDATIONS: {
          actions: assign({
            validations: (context: Context, event: SetValidationsEvent) => {
              return {
                ...context.validations,
                [event.validation]: true,
              };
            },
          }),
        },
        END_GAME_EARLY: {
          actions: assign({
            endAt: () => Date.now(),
            lastScore: (context: Context) => {
              if (context.isTraining) return context.lastScore;
              return getRunScore(context);
            },
            state: (context: Context) => {
              if (context.isTraining) return context.state;
              const score = getRunScore(context);

              submitScore({ score });
              return submitMinigameScore({
                state: context.state as GameState,
                action: {
                  type: "minigame.scoreSubmitted",
                  score: Math.round(score),
                  id: PORTAL_NAME,
                },
              });
            },
          }),
          target: "introduction",
        },
        GAME_OVER: {
          target: "gameOver",
          actions: assign((context: Context): Partial<Context> => ({
            endAt: 0,
            lives: GAME_LIVES,
            maxLives: GAME_LIVES,
            ...getInitialProgression(),
            collected: getRunScore(context),
            validations: structuredClone(VALIDATIONS),
            lastScore: context.isTraining
              ? context.lastScore
              : getRunScore(context),
            state: (() => {
              if (context.isTraining) return context.state;
              const score = getRunScore(context);

              submitScore({ score });
              return submitMinigameScore({
                state: context.state as GameState,
                action: {
                  type: "minigame.scoreSubmitted",
                  score: Math.round(score),
                  id: PORTAL_NAME,
                },
              });
            })(),
          })) as any,
        },
      },
    },

    gameOver: {
      always: [
        {
          target: "introduction",
          cond: (context) => {
            return context.isTraining;
          },
        },
        {
          // they have already completed the mission before
          target: "complete",
          cond: () => {
            // const dateKey = new Date().toISOString().slice(0, 10);

            // const minigame = context.state?.minigames.games[PORTAL_NAME];
            // const history = minigame?.history ?? {};

            // return !!history[dateKey]?.prizeClaimedAt;
            return false;
          },
        },
        {
          target: "winner",
          cond: (context) => {
            const prize = context.state?.minigames.prizes[PORTAL_NAME];
            if (!prize) {
              return false;
            }

            return getRunScore(context) >= prize.score;
          },
        },
        {
          target: "loser",
        },
      ],
    },

    winner: {
      on: resetGameTransition,
    },

    loser: {
      on: resetGameTransition,
    },

    complete: {
      on: resetGameTransition,
    },

    error: {
      on: {
        RETRY: {
          target: "initialising",
        },
      },
    },

    unauthorised: {},
  },
});
