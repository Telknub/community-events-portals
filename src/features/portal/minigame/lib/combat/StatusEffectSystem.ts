import type { DamagePayload, EnemyLike, StatusEffectConfig } from "../../Types";

type ActiveStatusEffect = StatusEffectConfig & {
  expiresAt: number;
  nextTickAt: number;
};

type DamageApplier = (
  enemy: EnemyLike,
  payload: DamagePayload,
  time: number,
  options?: { skipStatusEffects?: boolean },
) => boolean;

export class StatusEffectSystem {
  private readonly effects = new Map<EnemyLike, ActiveStatusEffect[]>();
  private applyDamage?: DamageApplier;

  public setDamageApplier(applyDamage: DamageApplier) {
    this.applyDamage = applyDamage;
  }

  public apply(enemy: EnemyLike, statuses: StatusEffectConfig[], time: number) {
    const current = this.effects.get(enemy) ?? [];

    statuses.forEach((status) => {
      const existing = current.find((effect) => effect.id === status.id);
      const activeEffect: ActiveStatusEffect = {
        ...status,
        expiresAt: time + status.durationMs,
        nextTickAt: time + (status.tickMs ?? status.durationMs),
      };

      if (existing && status.refreshMode === "refresh") {
        existing.expiresAt = activeEffect.expiresAt;
        existing.nextTickAt = Math.min(
          existing.nextTickAt,
          activeEffect.nextTickAt,
        );
      } else {
        current.push(activeEffect);
      }

      if (status.speedMultiplier !== undefined) {
        enemy.setMovementMultiplier?.(status.speedMultiplier);
      }
    });

    enemy.statusEffects = {
      ...(enemy.statusEffects ?? {}),
      ...Object.fromEntries(statuses.map((status) => [status.id, time])),
    };

    this.effects.set(enemy, current);
  }

  public update(time: number) {
    this.effects.forEach((effects, enemy) => {
      const activeEffects = effects.filter((effect) => {
        if (time >= effect.expiresAt) return false;

        if (
          effect.damagePerTick !== undefined &&
          effect.tickMs !== undefined &&
          time >= effect.nextTickAt
        ) {
          effect.nextTickAt = time + effect.tickMs;
          this.applyDamage?.(
            enemy,
            {
              sourceWeaponId: "wheat",
              amount: effect.damagePerTick,
              damageType: "dot",
            },
            time,
            { skipStatusEffects: true },
          );
        }

        return true;
      });

      if (activeEffects.length === 0) {
        enemy.setMovementMultiplier?.(1);
        this.effects.delete(enemy);
        return;
      }

      const hasMovementEffect = activeEffects.some(
        (effect) => effect.speedMultiplier !== undefined,
      );

      if (!hasMovementEffect) {
        enemy.setMovementMultiplier?.(1);
      }

      this.effects.set(enemy, activeEffects);
    });
  }

  public reset() {
    this.effects.forEach((_effects, enemy) => {
      enemy.setMovementMultiplier?.(1);
    });
    this.effects.clear();
  }

  public shutdown() {
    this.reset();
    this.applyDamage = undefined;
  }
}
