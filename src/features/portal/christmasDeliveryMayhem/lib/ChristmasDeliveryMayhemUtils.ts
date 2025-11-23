import { Minigame } from "features/game/types/game";
import {
  // RESTOCK_ATTEMPTS_SFL,
  // UNLIMITED_ATTEMPTS_SFL,
  DAILY_ATTEMPTS,
  RESTOCK_ATTEMPTS,
} from "../ChristmasDeliveryMayhemConstants";

/**
 * Gets the number of attempts left for the minigame.
 * @param minigame The minigame.
 * @returns The number of attempts left.
 */
export const getAttemptsLeft = (minigame?: Minigame) => {
  const dateKey = new Date().toISOString().slice(0, 10);

  const history = minigame?.history ?? {};
  const purchases = minigame?.purchases ?? [];
  const moreAttemptsDay = ["2024-12-15", "2024-12-16"];
  let dailyAttempts = DAILY_ATTEMPTS;

  const now = new Date();
  const startOfTodayUTC = getStartOfUTCDay(now);
  const endOfTodayUTC = startOfTodayUTC + 24 * 60 * 60 * 1000; // 24 hours later
  // const hasUnlimitedAttempts = purchases.some(
  //   (purchase) =>
  //     purchase.sfl === UNLIMITED_ATTEMPTS_SFL &&
  //     purchase.purchasedAt >= startOfTodayUTC &&
  //     purchase.purchasedAt < endOfTodayUTC,
  // );

  // if (hasUnlimitedAttempts) return Infinity;

  let restockAttempts = 0;
  RESTOCK_ATTEMPTS.forEach((option) => {
    const restockedCount = purchases.filter(
      (purchase) =>
        purchase.sfl === option.sfl &&
        purchase.purchasedAt >= startOfTodayUTC &&
        purchase.purchasedAt < endOfTodayUTC,
    ).length;

    restockAttempts += option.attempts * restockedCount;
  });

  // More attempts
  if (moreAttemptsDay.includes(now.toISOString().substring(0, 10))) {
    dailyAttempts = 2;
  }

  const attemptsToday = history[dateKey]?.attempts ?? 0;
  const attemptsLeft = dailyAttempts - attemptsToday + restockAttempts;

  return attemptsLeft;
};

/**
 * Gets the start of the UTC day for a given date.
 * @param date The date.
 * @returns The start of the UTC day for the given date.
 */
const getStartOfUTCDay = (date: Date) => {
  const startOfDay = new Date(date);
  startOfDay.setUTCHours(0, 0, 0, 0); // set time to midnight UTC
  return startOfDay.getTime();
};
