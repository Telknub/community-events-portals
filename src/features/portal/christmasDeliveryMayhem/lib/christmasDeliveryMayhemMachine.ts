import { OFFLINE_FARM } from "features/game/lib/landData";
import { assign, createMachine, Interpreter, State } from "xstate";
import { CONFIG } from "lib/config";
import { decodeToken } from "features/auth/actions/login";
import {
  // RESTOCK_ATTEMPTS_SFL,
  // UNLIMITED_ATTEMPTS_SFL,
  DAILY_ATTEMPTS,
  GAME_SECONDS,
  GAME_LIVES,
  Gifts,
  Events,
} from "../ChristmasDeliveryMayhemConstants";
import { GameState } from "features/game/types/game";
import { purchaseMinigameItem } from "features/game/events/minigames/purchaseMinigameItem";
import { startMinigameAttempt } from "features/game/events/minigames/startMinigameAttempt";
import { submitMinigameScore } from "features/game/events/minigames/submitMinigameScore";
import {
  achievementsUnlocked,
  submitScore,
  startAttempt,
} from "features/portal/lib/portalUtil";
import { getUrl, loadPortal } from "features/portal/actions/loadPortal";
import { getAttemptsLeft } from "./ChristmasDeliveryMayhemUtils";
import { unlockMinigameAchievements } from "features/game/events/minigames/unlockMinigameAchievements";
import { ChristmasDeliveryMayhemAchievementsName } from "../ChristmasDeliveryMayhemAchievements";

const getJWT = () => {
  const code = new URLSearchParams(window.location.search).get("jwt");
  return code;
};

export interface Context {
  id: number;
  jwt: string | null;
  isJoystickActive: boolean;
  state: GameState | undefined;
  score: number;
  lastScore: number;
  gifts: Gifts[];
  streak: number;
  event: Events;
  deliveries: Record<string, Gifts[][]>;
  lives: number;
  endAt: number;
  attemptsLeft: number;
}

type GainPointsEvent = {
  type: "GAIN_POINTS";
  points: number;
};

type UnlockAchievementsEvent = {
  type: "UNLOCKED_ACHIEVEMENTS";
  achievementNames: ChristmasDeliveryMayhemAchievementsName[];
};

type SetJoystickActiveEvent = {
  type: "SET_JOYSTICK_ACTIVE";
  isJoystickActive: boolean;
};

type PurchaseRestockEvent = {
  type: "PURCHASED_RESTOCK";
  sfl: number;
};

type CollectGiftEvent = {
  type: "COLLECT_GIFT";
  gift: Gifts;
};

type ClearInventoryEvent = {
  type: "CLEAR_INVENTORY";
};

type RemoveLastGiftInventoryEvent = {
  type: "REMOVE_LAST_GIFT_INVENTORY";
};

type LoseLifeEvent = {
  type: "LOSE_LIFE";
};

type StreakEvent = {
  type: "STREAK";
  streak: number;
};

type UpdateEventEvent = {
  type: "UPDATE_EVENT";
  event: Events;
};

type UpdateDeliveriesEvent = {
  type: "UPDATE_DELIVERIES";
  delivery: Gifts[];
  position: number;
  direction: string;
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
  | { type: "END_GAME_EARLY" }
  | { type: "GAME_OVER" }
  | GainPointsEvent
  | StreakEvent
  | UpdateEventEvent
  | UpdateDeliveriesEvent
  | CollectGiftEvent
  | ClearInventoryEvent
  | RemoveLastGiftInventoryEvent
  | LoseLifeEvent
  | UnlockAchievementsEvent;

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

const resetGameTransition = {
  RETRY: {
    target: "starting",
    actions: assign({
      score: () => 0,
      gifts: () => [],
      streak: () => 0,
      event: () => "",
      deliveries: () => ({ left: [[], []], right: [[], []] }),
      lives: () => GAME_LIVES,
      endAt: () => 0,
    }) as any,
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
    gifts: [],
    streak: 0,
    event: "",
    deliveries: { left: [[], []], right: [[], []] },
    lives: GAME_LIVES,
    attemptsLeft: 0,
    endAt: 0,
  },
  on: {
    SET_JOYSTICK_ACTIVE: {
      actions: assign<Context, any>({
        isJoystickActive: (_: Context, event: SetJoystickActiveEvent) => {
          return event.isJoystickActive;
        },
      }),
    },
    UNLOCKED_ACHIEVEMENTS: {
      actions: assign<Context, any>({
        state: (context: Context, event: UnlockAchievementsEvent) => {
          achievementsUnlocked({ achievementNames: event.achievementNames });
          return unlockMinigameAchievements({
            state: context.state!,
            action: {
              type: "minigame.achievementsUnlocked",
              id: "christmas-delivery",
              achievementNames: event.achievementNames,
            },
          });
        },
      }) as any,
    },
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
            return { game: OFFLINE_FARM, attemptsLeft: DAILY_ATTEMPTS };
          }

          const { farmId } = decodeToken(context.jwt as string);

          // Load the game data
          const { game } = await loadPortal({
            portalId: CONFIG.PORTAL_APP,
            token: context.jwt as string,
          });

          const minigame = game.minigames.games["christmas-delivery"];
          const attemptsLeft = getAttemptsLeft(minigame);

          return { game, farmId, attemptsLeft };
        },
        onDone: [
          {
            target: "introduction",
            actions: assign({
              state: (_: any, event) => event.data.game,
              id: (_: any, event) => event.data.farmId,
              attemptsLeft: (_: any, event) => event.data.attemptsLeft,
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
          actions: assign<Context, any>({
            state: (context: Context, event: PurchaseRestockEvent) =>
              purchaseMinigameItem({
                state: context.state!,
                action: {
                  id: "christmas-delivery",
                  sfl: event.sfl,
                  type: "minigame.itemPurchased",
                  items: {},
                },
              }),
          }) as any,
        },
        // PURCHASED_UNLIMITED: {
        //   target: "introduction",
        //   actions: assign<Context>({
        //     state: (context: Context) =>
        //       purchaseMinigameItem({
        //         state: context.state!,
        //         action: {
        //           id: "christmas-delivery",
        //           sfl: UNLIMITED_ATTEMPTS_SFL,
        //           type: "minigame.itemPurchased",
        //           items: {},
        //         },
        //       }),
        //   }) as any,
        // },
      },
    },

    starting: {
      always: [
        {
          target: "noAttempts",
          cond: (context) => {
            const minigame =
              context.state?.minigames.games["christmas-delivery"];
            const attemptsLeft = getAttemptsLeft(minigame);
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
        },
      },
    },

    ready: {
      on: {
        START: {
          target: "playing",
          actions: assign<Context>({
            endAt: () => Date.now() + GAME_SECONDS * 1000,
            score: 0,
            gifts: [],
            streak: 0,
            event: "",
            deliveries: { left: [[], []], right: [[], []] },
            lives: GAME_LIVES,
            state: (context: any) => {
              startAttempt();
              return startMinigameAttempt({
                state: context.state,
                action: {
                  type: "minigame.attemptStarted",
                  id: "christmas-delivery",
                },
              });
            },
            attemptsLeft: (context: Context) => context.attemptsLeft - 1,
          }) as any,
        },
      },
    },

    playing: {
      on: {
        STREAK: {
          actions: assign<Context, any>((context, event: StreakEvent) => {
            let streak = context.streak;

            if (event.streak === 1) {
              if (streak >= 0) {
                streak += event.streak;
              } else {
                streak = event.streak;
              }
            } else {
              if (streak <= 0) {
                streak += event.streak;
              } else {
                streak = event.streak;
              }
            }

            return {
              score: context.score + streak,
              streak: streak,
            };
          }),
        },
        UPDATE_EVENT: {
          actions: assign<Context, any>({
            event: (context: Context, event: UpdateEventEvent) => {
              return event.event;
            },
          }),
        },
        UPDATE_DELIVERIES: {
          actions: assign<Context, any>({
            deliveries: (context: Context, event: UpdateDeliveriesEvent) => {
              const deliveries = { ...context.deliveries };
              const { direction, position, delivery } = event;
              deliveries[direction][position] = delivery;
              return deliveries;
            },
          }),
        },
        LOSE_LIFE: {
          actions: assign<Context, any>({
            lives: (context: Context) => {
              return context.lives - 1;
            },
          }),
        },
        COLLECT_GIFT: {
          actions: assign<Context, any>({
            gifts: (context: Context, event: CollectGiftEvent) => {
              const gifts = [...context.gifts, event.gift];
              return gifts;
            },
          }),
        },
        CLEAR_INVENTORY: {
          actions: assign<Context, any>({
            gifts: () => {
              return [];
            },
          }),
        },
        REMOVE_LAST_GIFT_INVENTORY: {
          actions: assign<Context, any>({
            gifts: (context: Context) => {
              const gifts = [...context.gifts];
              gifts.pop();
              return gifts;
            },
          }),
        },
        END_GAME_EARLY: {
          actions: assign<Context, any>({
            endAt: () => Date.now(),
            lastScore: (context: Context) => {
              return context.score;
            },
            state: (context: Context) => {
              submitScore({ score: context.score });
              return submitMinigameScore({
                state: context.state as any,
                action: {
                  type: "minigame.scoreSubmitted",
                  score: Math.round(context.score),
                  id: "christmas-delivery",
                },
              });
            },
          }),
          target: "introduction",
        },
        GAME_OVER: {
          target: "gameOver",
          actions: assign({
            lastScore: (context: any) => {
              return context.score;
            },
            state: (context: any) => {
              submitScore({ score: context.score });
              return submitMinigameScore({
                state: context.state,
                action: {
                  type: "minigame.scoreSubmitted",
                  score: Math.round(context.score),
                  id: "christmas-delivery",
                },
              });
            },
          }) as any,
        },
      },
    },

    gameOver: {
      always: [
        {
          // they have already completed the mission before
          target: "complete",
          cond: (context) => {
            const dateKey = new Date().toISOString().slice(0, 10);

            const minigame =
              context.state?.minigames.games["christmas-delivery"];
            const history = minigame?.history ?? {};

            return !!history[dateKey]?.prizeClaimedAt;
          },
        },

        {
          target: "winner",
          cond: (context) => {
            const prize = context.state?.minigames.prizes["christmas-delivery"];
            if (!prize) {
              return false;
            }

            return context.score >= prize.score;
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
