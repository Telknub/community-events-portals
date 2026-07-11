import type { Scene } from "../../Scene";

const DEFAULT_SFX_COOLDOWN_MS = 100;

export class WeaponSfxLimiter {
  private static readonly lastPlayedByScene = new WeakMap<
    Scene,
    Map<string, number>
  >();

  public static play(
    scene: Scene,
    soundKey: string,
    volume: number,
    cooldownMs = DEFAULT_SFX_COOLDOWN_MS,
  ) {
    let lastPlayedBySound = this.lastPlayedByScene.get(scene);

    if (!lastPlayedBySound) {
      lastPlayedBySound = new Map<string, number>();
      this.lastPlayedByScene.set(scene, lastPlayedBySound);
    }

    const now = scene.time.now;
    const lastPlayedAt = lastPlayedBySound.get(soundKey) ?? -Infinity;

    if (now - lastPlayedAt < cooldownMs) return;

    lastPlayedBySound.set(soundKey, now);
    scene.sound.play(soundKey, { volume });
  }
}
