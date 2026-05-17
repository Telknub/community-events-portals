import type { WeaponId } from "../../Types";

export class CooldownTracker {
  private readonly readyAt = new Map<WeaponId, number>();

  public isReady(id: WeaponId, time: number) {
    return time >= (this.readyAt.get(id) ?? 0);
  }

  public use(id: WeaponId, time: number, cooldownMs: number) {
    this.readyAt.set(id, time + cooldownMs);
  }

  public reset() {
    this.readyAt.clear();
  }
}
