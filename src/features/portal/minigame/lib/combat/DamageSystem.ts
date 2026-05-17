import type { MachineInterpreter } from "../Machine";
import type { DamagePayload, EnemyLike } from "../../Types";
import { EventBus } from "../EventBus";
import { isEnemyAlive } from "./geometry";
import type { StatusEffectSystem } from "./StatusEffectSystem";
import { COMBAT_CONFIG } from "../../constants";

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

    if (enemy.takeDamage) {
      enemy.takeDamage(payload.amount, payload);
    } else if (enemy.hp !== undefined) {
      enemy.hp = Math.max(0, enemy.hp - payload.amount);
      enemy.isDead = enemy.hp <= 0;
    }

    if (!options.skipStatusEffects && payload.statusEffects?.length) {
      this.statusEffectSystem?.apply(enemy, payload.statusEffects, time);
    }

    EventBus.emit("weapon:hit", {
      enemy,
      sourceWeaponId: payload.sourceWeaponId,
      amount: payload.amount,
      damageType: payload.damageType,
    });

    if (enemy.isDead || enemy.hp === 0) {
      enemy.setActive(false);
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
