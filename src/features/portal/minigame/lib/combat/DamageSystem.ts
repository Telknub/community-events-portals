import type { MachineInterpreter } from "../Machine";
import type { DamagePayload, EnemyLike } from "../../Types";
import { EventBus } from "../EventBus";
import { isEnemyAlive } from "./geometry";
import type { StatusEffectSystem } from "./StatusEffectSystem";
import { COMBAT_CONFIG } from "../../constants";
import {
  PLAYER_STAT_BASE_LEVEL,
  resolvePlayerDamage,
} from "../../constants/PlayerStatConstants";

export class DamageSystem {
  private statusEffectSystem?: StatusEffectSystem;

  constructor(private readonly portalService?: MachineInterpreter) {}

  public setStatusEffectSystem(statusEffectSystem: StatusEffectSystem) {
    this.statusEffectSystem = statusEffectSystem;
  }

  public applyDamage(
    enemy: EnemyLike,
    payload: DamagePayload,
    time: number,
    options: { skipStatusEffects?: boolean } = {},
  ) {
    if (!isEnemyAlive(enemy)) return false;

    const damageLevel =
      this.portalService?.state.context.playerStatLevels.damage ??
      PLAYER_STAT_BASE_LEVEL;
    const resolvedPayload = {
      ...payload,
      amount: resolvePlayerDamage(payload.amount, damageLevel),
    };

    if (enemy.takeDamage) {
      enemy.takeDamage(resolvedPayload.amount, resolvedPayload);
    } else if (enemy.hp !== undefined) {
      enemy.hp = Math.max(0, enemy.hp - resolvedPayload.amount);
      enemy.isDead = enemy.hp <= 0;
    }

    if (!options.skipStatusEffects && payload.statusEffects?.length) {
      this.statusEffectSystem?.apply(enemy, payload.statusEffects, time);
    }

    EventBus.emit("weapon:hit", {
      enemy,
      sourceWeaponId: payload.sourceWeaponId,
      amount: resolvedPayload.amount,
      damageType: payload.damageType,
    });

    if (enemy.isDead || enemy.hp === 0) {
      enemy.setActive(false);
      enemy.onDeath?.();
      EventBus.emit("enemy:killed", {
        enemy,
        sourceWeaponId: payload.sourceWeaponId,
      });
      EventBus.emit("score:gained", {
        points: COMBAT_CONFIG.defaultEnemyScore,
      });
      this.portalService?.send("GAIN_POINTS", {
        points: COMBAT_CONFIG.defaultEnemyScore,
      });

      return true;
    }

    return false;
  }
}
