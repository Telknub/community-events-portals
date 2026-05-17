import Phaser from "phaser";
import {
  COMBAT_CONFIG,
  WEAPON_CONFIGS,
  WEAPON_UPGRADES,
} from "../../constants";
import type { MachineInterpreter } from "../Machine";
import type {
  DamagePayload,
  EnemyLike,
  ProjectileConfig,
  WeaponConfig,
  WeaponId,
  WeaponLevel,
  WeaponLoadoutItem,
  WeaponRuntimeStats,
} from "../../Types";
import { Projectile } from "../../containers/weapons/Projectile";
import { RollingProjectile } from "../../containers/weapons/RollingProjectile";
import { SlashHitbox } from "../../containers/weapons/SlashHitbox";
import { AreaHitbox } from "../../containers/weapons/AreaHitbox";
import { OrbitalWeapon } from "../../containers/weapons/OrbitalWeapon";
import { HomingBee } from "../../containers/weapons/HomingBee";
import { EventBus } from "../EventBus";
import { CooldownTracker } from "./CooldownTracker";
import { DamageSystem } from "./DamageSystem";
import { StatusEffectSystem } from "./StatusEffectSystem";
import { TargetingSystem } from "./TargetingSystem";
import {
  FALLBACK_AIM_VECTOR,
  enemyCenter,
  normalizeVector,
  rotateVector,
  vectorFromAngleDegrees,
  type Vector,
} from "./geometry";

type RuntimeWeapon = {
  id: WeaponId;
  level: WeaponLevel;
  stats: WeaponRuntimeStats;
  config: WeaponConfig;
};

type WeaponManagerProps = {
  scene: Phaser.Scene & {
    movementAngle?: number;
    isFacingLeft?: boolean;
  };
  player: Phaser.GameObjects.GameObject & {
    x: number;
    y: number;
    body?: unknown;
  };
  enemyGroup: Phaser.Physics.Arcade.Group;
  portalService?: MachineInterpreter;
  loadout?: WeaponLoadoutItem[];
};

export class WeaponManager {
  public readonly projectileGroup: Phaser.Physics.Arcade.Group;
  public readonly rollingProjectileGroup: Phaser.Physics.Arcade.Group;
  public readonly hitboxGroup: Phaser.Physics.Arcade.Group;
  public readonly slashHitboxGroup: Phaser.Physics.Arcade.Group;
  public readonly orbitalGroup: Phaser.Physics.Arcade.Group;
  public readonly beeGroup: Phaser.Physics.Arcade.Group;

  private readonly cooldowns = new CooldownTracker();
  private readonly damageSystem: DamageSystem;
  private readonly statusEffectSystem = new StatusEffectSystem();
  private readonly targetingSystem: TargetingSystem;
  private readonly activeWeapons = new Map<WeaponId, RuntimeWeapon>();
  private lastAimVector: Vector = { ...FALLBACK_AIM_VECTOR };
  private isShutDown = false;

  constructor(private readonly props: WeaponManagerProps) {
    this.createFallbackTextures();

    this.projectileGroup = props.scene.physics.add.group({
      classType: Projectile,
      maxSize: COMBAT_CONFIG.projectilePoolSize,
      runChildUpdate: false,
    });
    this.rollingProjectileGroup = props.scene.physics.add.group({
      classType: RollingProjectile,
      maxSize: Math.ceil(COMBAT_CONFIG.projectilePoolSize / 3),
      runChildUpdate: false,
    });
    this.hitboxGroup = props.scene.physics.add.group({
      classType: AreaHitbox,
      maxSize: COMBAT_CONFIG.hitboxPoolSize,
      runChildUpdate: false,
    });
    this.slashHitboxGroup = props.scene.physics.add.group({
      classType: SlashHitbox,
      maxSize: COMBAT_CONFIG.hitboxPoolSize,
      runChildUpdate: false,
    });
    this.orbitalGroup = props.scene.physics.add.group({
      classType: OrbitalWeapon,
      maxSize: COMBAT_CONFIG.orbitalPoolSize,
      runChildUpdate: false,
    });
    this.beeGroup = props.scene.physics.add.group({
      classType: HomingBee,
      maxSize: COMBAT_CONFIG.beePoolSize,
      runChildUpdate: false,
    });

    this.damageSystem = new DamageSystem(props.portalService);
    this.damageSystem.setStatusEffectSystem(this.statusEffectSystem);
    this.statusEffectSystem.setDamageApplier(
      this.damageSystem.applyDamage.bind(this.damageSystem),
    );
    this.targetingSystem = new TargetingSystem(
      props.enemyGroup,
      COMBAT_CONFIG.targetScanMs,
    );

    this.setupOverlaps(props.enemyGroup);
    this.reset(props.loadout ?? COMBAT_CONFIG.defaultWeaponLoadout);
  }

  public update(time: number, _delta: number) {
    if (this.isShutDown) return;

    this.targetingSystem.update(time);
    this.statusEffectSystem.update(time);
    this.updateAimVector();
    this.updatePooledObjects(time);

    this.activeWeapons.forEach((weapon) => {
      if (
        weapon.config.behavior === "orbital" ||
        weapon.config.behavior === "orbitalShooter"
      ) {
        this.ensureOrbitals(weapon);
      }

      if (weapon.config.behavior === "orbital") return;
      if (!this.cooldowns.isReady(weapon.id, time)) return;
      if (!this.fireWeapon(weapon, time)) return;

      this.cooldowns.use(weapon.id, time, weapon.stats.cooldownMs);
    });
  }

  public setWeaponLevel(id: WeaponId, level: WeaponLevel) {
    if (this.isShutDown) return;

    const config = WEAPON_CONFIGS[id];
    this.activeWeapons.set(id, {
      id,
      level,
      config,
      stats: this.resolveStats(id, level),
    });
  }

  public reset(loadout = COMBAT_CONFIG.defaultWeaponLoadout) {
    if (this.isShutDown) return;

    this.cooldowns.reset();
    this.statusEffectSystem.reset();
    this.activeWeapons.clear();
    this.clearGroup(this.projectileGroup);
    this.clearGroup(this.rollingProjectileGroup);
    this.clearGroup(this.hitboxGroup);
    this.clearGroup(this.slashHitboxGroup);
    this.clearGroup(this.orbitalGroup);
    this.clearGroup(this.beeGroup);

    loadout.forEach(({ id, level }) => this.setWeaponLevel(id, level));
  }

  public shutdown() {
    if (this.isShutDown) return;

    this.reset([]);
    this.isShutDown = true;
    this.targetingSystem.shutdown();
    this.statusEffectSystem.shutdown();
    this.destroyGroup(this.projectileGroup);
    this.destroyGroup(this.rollingProjectileGroup);
    this.destroyGroup(this.hitboxGroup);
    this.destroyGroup(this.slashHitboxGroup);
    this.destroyGroup(this.orbitalGroup);
    this.destroyGroup(this.beeGroup);
  }

  private setupOverlaps(enemyGroup: Phaser.Physics.Arcade.Group) {
    this.props.scene.physics.add.overlap(
      this.projectileGroup,
      enemyGroup,
      (projectile, enemy) =>
        this.handleProjectileHit(projectile as Projectile, enemy as EnemyLike),
    );
    this.props.scene.physics.add.overlap(
      this.rollingProjectileGroup,
      enemyGroup,
      (projectile, enemy) =>
        this.handleProjectileHit(projectile as Projectile, enemy as EnemyLike),
    );
    this.props.scene.physics.add.overlap(
      this.hitboxGroup,
      enemyGroup,
      (hitbox, enemy) =>
        this.handleHitboxHit(
          hitbox as Phaser.GameObjects.GameObject,
          enemy as EnemyLike,
        ),
    );
    this.props.scene.physics.add.overlap(
      this.slashHitboxGroup,
      enemyGroup,
      (hitbox, enemy) =>
        this.handleHitboxHit(
          hitbox as Phaser.GameObjects.GameObject,
          enemy as EnemyLike,
        ),
    );
    this.props.scene.physics.add.overlap(
      this.orbitalGroup,
      enemyGroup,
      (orbital, enemy) =>
        this.handleOrbitalHit(orbital as OrbitalWeapon, enemy as EnemyLike),
    );
    this.props.scene.physics.add.overlap(
      this.beeGroup,
      enemyGroup,
      (bee, enemy) => this.handleBeeHit(bee as HomingBee, enemy as EnemyLike),
    );
  }

  private fireWeapon(weapon: RuntimeWeapon, time: number) {
    switch (weapon.config.behavior) {
      case "slash":
        return this.fireSlash(weapon, time);
      case "linearProjectile":
        return this.fireWateringCan(weapon, time);
      case "explodingProjectile":
        return this.fireCorn(weapon, time);
      case "chainProjectile":
        return this.fireTomato(weapon, time);
      case "orbitalShooter":
        return this.fireSunflower(weapon, time);
      case "snareArea":
        return this.fireWheat(weapon, time);
      case "rollingProjectile":
        return this.firePumpkin(weapon, time);
      case "homingSummon":
        return this.fireBeehive(weapon, time);
      default:
        return false;
    }
  }

  private fireSlash(weapon: RuntimeWeapon, time: number) {
    const directions =
      weapon.stats.projectileCount >= 2
        ? [this.lastAimVector, rotateVector(this.lastAimVector, 180)]
        : [this.lastAimVector];

    directions.forEach((direction) => {
      const hitbox = this.slashHitboxGroup.get(
        this.props.player.x,
        this.props.player.y,
        weapon.config.texture,
      ) as SlashHitbox | null;

      if (!hitbox) return;

      hitbox.spawn({
        x: this.props.player.x,
        y: this.props.player.y,
        texture: weapon.config.texture,
        direction,
        range: weapon.stats.range,
        arcDegrees: weapon.stats.arcDegrees,
        expiresAt: time + weapon.stats.durationMs,
        payload: this.createPayload(weapon),
      });
      EventBus.emit("weapon:fired", {
        id: weapon.id,
        x: hitbox.x,
        y: hitbox.y,
      });
    });

    return directions.length > 0;
  }

  private fireWateringCan(weapon: RuntimeWeapon, time: number) {
    this.fireProjectilesFromPlayer({
      weapon,
      time,
      projectile: weapon.config.projectile,
      behavior: "linear",
      direction: this.lastAimVector,
    });

    return true;
  }

  private fireCorn(weapon: RuntimeWeapon, time: number) {
    const target = this.targetingSystem.nearest(this.props.player);
    if (!target) return false;

    this.fireProjectile({
      weapon,
      time,
      projectile: weapon.config.projectile,
      behavior: "exploding",
      x: this.props.player.x,
      y: this.props.player.y,
      direction: normalizeVector({
        x: target.x - this.props.player.x,
        y: target.y - this.props.player.y,
      }),
    });

    return true;
  }

  private fireTomato(weapon: RuntimeWeapon, time: number) {
    const target = this.targetingSystem.random();
    if (!target) return false;

    this.fireProjectilesFromPlayer({
      weapon,
      time,
      projectile: weapon.config.projectile,
      behavior: "bouncing",
      direction: normalizeVector({
        x: target.x - this.props.player.x,
        y: target.y - this.props.player.y,
      }),
    });

    return true;
  }

  private fireSunflower(weapon: RuntimeWeapon, time: number) {
    const target = this.targetingSystem.nearest(this.props.player);
    if (!target) return false;

    const orbitals = this.getActiveOrbitals(weapon.id);
    orbitals.forEach((orbital) => {
      this.fireProjectile({
        weapon,
        time,
        projectile: weapon.config.projectile,
        behavior: "light",
        x: orbital.x,
        y: orbital.y,
        direction: normalizeVector({
          x: target.x - orbital.x,
          y: target.y - orbital.y,
        }),
      });
    });

    return orbitals.length > 0;
  }

  private fireWheat(weapon: RuntimeWeapon, time: number) {
    const target = this.targetingSystem.nearest(this.props.player);
    if (!target) return false;

    this.spawnArea({
      x: target.x,
      y: target.y,
      texture: weapon.config.texture,
      radius: weapon.stats.areaRadius,
      expiresAt: time + weapon.stats.durationMs,
      payload: this.createPayload(weapon),
      hitCooldownMs: weapon.stats.hitCooldownMs,
      persistent: true,
    });

    return true;
  }

  private firePumpkin(weapon: RuntimeWeapon, time: number) {
    this.fireProjectile({
      weapon,
      time,
      projectile: weapon.config.projectile,
      behavior: "rolling",
      x: this.props.player.x,
      y: this.props.player.y,
      direction: this.lastAimVector,
      rolling: true,
    });

    return true;
  }

  private fireBeehive(weapon: RuntimeWeapon, time: number) {
    if (this.targetingSystem.getActiveEnemies().length === 0) return false;

    for (let index = 0; index < weapon.stats.projectileCount; index++) {
      const bee = this.beeGroup.get(
        this.props.player.x,
        this.props.player.y,
        weapon.config.texture,
      ) as HomingBee | null;

      if (!bee) continue;

      bee.spawn({
        x: this.props.player.x + (index - weapon.stats.projectileCount / 2) * 4,
        y: this.props.player.y,
        texture: weapon.config.texture,
        speed: weapon.stats.homingSpeed,
        expiresAt: time + weapon.stats.durationMs,
        payload: this.createPayload(weapon),
        hitCooldownMs: weapon.stats.hitCooldownMs,
      });
      EventBus.emit("weapon:fired", { id: weapon.id, x: bee.x, y: bee.y });
    }

    return true;
  }

  private fireProjectilesFromPlayer({
    weapon,
    time,
    projectile,
    behavior,
    direction,
  }: {
    weapon: RuntimeWeapon;
    time: number;
    projectile?: ProjectileConfig;
    behavior: Projectile["behavior"];
    direction: Vector;
  }) {
    const directions = this.getSpreadDirections(
      direction,
      weapon.stats.projectileCount,
      weapon.stats.spreadDegrees,
    );

    directions.forEach((spreadDirection) =>
      this.fireProjectile({
        weapon,
        time,
        projectile,
        behavior,
        x: this.props.player.x,
        y: this.props.player.y,
        direction: spreadDirection,
      }),
    );
  }

  private fireProjectile({
    weapon,
    time,
    projectile,
    behavior,
    x,
    y,
    direction,
    rolling = false,
  }: {
    weapon: RuntimeWeapon;
    time: number;
    projectile?: ProjectileConfig;
    behavior: Projectile["behavior"];
    x: number;
    y: number;
    direction: Vector;
    rolling?: boolean;
  }) {
    if (!projectile) return;

    const group = rolling ? this.rollingProjectileGroup : this.projectileGroup;
    const projectileObject = group.get(
      x,
      y,
      projectile.texture,
    ) as Projectile | null;

    if (!projectileObject) return;

    const normalized = normalizeVector(direction);
    projectileObject.spawn({
      x,
      y,
      texture: projectile.texture,
      velocity: {
        x: normalized.x * weapon.stats.projectileSpeed,
        y: normalized.y * weapon.stats.projectileSpeed,
      },
      bodySize: projectile.bodySize,
      expiresAt: time + weapon.stats.durationMs,
      payload: this.createPayload(weapon),
      ownerWeaponId: weapon.id,
      behavior,
      pierce: weapon.stats.pierce,
      bounceCount: weapon.stats.bounceCount,
      chainRadius: weapon.stats.chainRadius,
      scale: weapon.stats.size,
    });
    EventBus.emit("weapon:fired", {
      id: weapon.id,
      x: projectileObject.x,
      y: projectileObject.y,
    });
  }

  private ensureOrbitals(weapon: RuntimeWeapon) {
    const orbitals = this.getActiveOrbitals(weapon.id);
    const expectedCount = Math.max(1, Math.round(weapon.stats.orbitalCount));

    if (orbitals.length === expectedCount) {
      orbitals.forEach((orbital) =>
        orbital.updateOrbit(this.props.player, this.props.scene.time.now),
      );
      return;
    }

    orbitals.forEach((orbital) => orbital.despawn());

    for (let slot = 0; slot < expectedCount; slot++) {
      const orbital = this.orbitalGroup.get(
        this.props.player.x,
        this.props.player.y,
        weapon.config.texture,
      ) as OrbitalWeapon | null;

      if (!orbital) continue;

      orbital.spawn({
        ownerWeaponId: weapon.id,
        texture: weapon.config.texture,
        slot,
        count: expectedCount,
        radius: weapon.stats.orbitRadius,
        angularSpeed: weapon.stats.angularSpeed,
        payload: this.createPayload(weapon),
        hitCooldownMs: weapon.stats.hitCooldownMs,
      });
      orbital.updateOrbit(this.props.player, this.props.scene.time.now);
    }
  }

  private updatePooledObjects(time: number) {
    this.getActiveProjectiles(this.projectileGroup).forEach((projectile) => {
      if (!projectile.hasExpired(time)) return;
      if (projectile.behavior === "exploding") {
        this.spawnExplosion(projectile, time);
      }
      projectile.despawn();
    });

    this.getActiveProjectiles(this.rollingProjectileGroup).forEach(
      (projectile) => {
        if (projectile.hasExpired(time)) {
          projectile.despawn();
        }
      },
    );

    this.hitboxGroup.getChildren().forEach((hitbox) => {
      if (!hitbox.active) return;
      if (hitbox instanceof AreaHitbox && hitbox.hasExpired(time)) {
        hitbox.despawn();
      }
    });

    this.slashHitboxGroup.getChildren().forEach((hitbox) => {
      if (!hitbox.active) return;
      if (hitbox instanceof SlashHitbox && hitbox.hasExpired(time)) {
        hitbox.despawn();
      }
    });

    this.getActiveOrbitals("hoe").forEach((orbital) =>
      orbital.updateOrbit(this.props.player, time),
    );
    this.getActiveOrbitals("sunflower").forEach((orbital) =>
      orbital.updateOrbit(this.props.player, time),
    );

    this.beeGroup.getChildren().forEach((bee) => {
      if (!(bee instanceof HomingBee) || !bee.active) return;

      if (bee.hasExpired(time)) {
        bee.despawn();
        return;
      }

      bee.steer(time, this.targetingSystem);
    });
  }

  private handleProjectileHit(projectile: Projectile, enemy: EnemyLike) {
    if (!projectile.active || projectile.hasHit(enemy)) return;

    projectile.registerHit(enemy);
    this.damageSystem.applyDamage(
      enemy,
      projectile.payload,
      this.props.scene.time.now,
    );

    if (projectile.behavior === "exploding") {
      this.spawnExplosion(projectile, this.props.scene.time.now);
      projectile.despawn();
      return;
    }

    if (projectile.behavior === "bouncing") {
      projectile.bounceRemaining -= 1;
      const nextTarget = this.targetingSystem.chainNext({
        origin: enemyCenter(enemy),
        chainRadius: projectile.chainRadius,
        excluded: projectile.hitEnemies,
      });

      if (projectile.bounceRemaining >= 0 && nextTarget) {
        projectile.redirectTo(nextTarget, this.getProjectileSpeed(projectile));
        return;
      }

      projectile.despawn();
      return;
    }

    if (projectile.pierceRemaining <= 0) {
      projectile.despawn();
      return;
    }

    projectile.pierceRemaining -= 1;
  }

  private handleHitboxHit(
    hitbox: Phaser.GameObjects.GameObject,
    enemy: EnemyLike,
  ) {
    const time = this.props.scene.time.now;

    if (hitbox instanceof AreaHitbox) {
      if (!hitbox.canHit(enemy, time)) return;
      hitbox.registerHit(enemy, time);
      this.damageSystem.applyDamage(enemy, hitbox.payload, time);
      return;
    }

    if (hitbox instanceof SlashHitbox) {
      if (!hitbox.canHit(enemy)) return;
      hitbox.registerHit(enemy);
      this.damageSystem.applyDamage(enemy, hitbox.payload, time);
    }
  }

  private handleOrbitalHit(orbital: OrbitalWeapon, enemy: EnemyLike) {
    const time = this.props.scene.time.now;
    if (!orbital.active || !orbital.canHit(enemy, time)) return;

    orbital.registerHit(enemy, time);
    this.damageSystem.applyDamage(enemy, orbital.payload, time);
  }

  private handleBeeHit(bee: HomingBee, enemy: EnemyLike) {
    const time = this.props.scene.time.now;
    if (!bee.active || !bee.canHit(enemy, time)) return;

    bee.registerHit(enemy, time);
    this.damageSystem.applyDamage(enemy, bee.payload, time);
    bee.despawn();
  }

  private spawnExplosion(projectile: Projectile, time: number) {
    const weapon = this.activeWeapons.get(projectile.ownerWeaponId);
    if (!weapon) return;

    this.spawnArea({
      x: projectile.x,
      y: projectile.y,
      texture: "weapon_explosion",
      radius: weapon.stats.areaRadius,
      expiresAt: time + 180,
      payload: {
        ...projectile.payload,
        damageType: "explosion",
      },
      hitCooldownMs: weapon.stats.hitCooldownMs,
      persistent: false,
    });
  }

  private spawnArea({
    x,
    y,
    texture,
    radius,
    expiresAt,
    payload,
    hitCooldownMs,
    persistent,
  }: {
    x: number;
    y: number;
    texture: string;
    radius: number;
    expiresAt: number;
    payload: DamagePayload;
    hitCooldownMs: number;
    persistent: boolean;
  }) {
    const hitbox = this.hitboxGroup.get(x, y, texture) as AreaHitbox | null;

    if (!hitbox) return;

    hitbox.spawn({
      x,
      y,
      texture,
      radius,
      expiresAt,
      payload,
      hitCooldownMs,
      persistent,
    });
    EventBus.emit("weapon:aoe", {
      sourceWeaponId: payload.sourceWeaponId,
      x,
      y,
      radius,
    });
  }

  private createPayload(weapon: RuntimeWeapon): DamagePayload {
    const statusEffects = weapon.config.statusEffects?.map((status) => ({
      ...status,
      durationMs: weapon.stats.statusDurationMs || status.durationMs,
      tickMs: weapon.stats.dotTickMs || status.tickMs,
      damagePerTick:
        status.damagePerTick !== undefined
          ? weapon.stats.dotDamage || status.damagePerTick
          : undefined,
    }));

    return {
      sourceWeaponId: weapon.id,
      amount: weapon.stats.damage,
      damageType: weapon.config.damageType,
      statusEffects,
    };
  }

  private resolveStats(id: WeaponId, level: WeaponLevel): WeaponRuntimeStats {
    const stats = { ...WEAPON_CONFIGS[id].baseStats };

    WEAPON_UPGRADES[id]
      .filter((upgrade) => upgrade.level <= level)
      .forEach((upgrade) => {
        upgrade.modifiers.forEach(({ stat, operation, value }) => {
          if (operation === "add") {
            stats[stat] += value;
          } else if (operation === "multiply") {
            stats[stat] *= value;
          } else {
            stats[stat] = value;
          }
        });
      });

    stats.cooldownMs = Math.max(80, Math.round(stats.cooldownMs));
    stats.projectileCount = Math.max(1, Math.round(stats.projectileCount));
    stats.orbitalCount = Math.max(1, Math.round(stats.orbitalCount));
    stats.pierce = Math.round(stats.pierce);
    stats.bounceCount = Math.round(stats.bounceCount);

    return stats;
  }

  private updateAimVector() {
    if (this.props.scene.movementAngle !== undefined) {
      this.lastAimVector = vectorFromAngleDegrees(
        this.props.scene.movementAngle,
      );
      return;
    }

    const body = this.props.player.body as
      | Phaser.Physics.Arcade.Body
      | null
      | undefined;

    if (body && (body.velocity.x !== 0 || body.velocity.y !== 0)) {
      this.lastAimVector = normalizeVector(body.velocity);
      return;
    }

    if (!this.lastAimVector) {
      this.lastAimVector = this.props.scene.isFacingLeft
        ? { x: -1, y: 0 }
        : { ...FALLBACK_AIM_VECTOR };
    }
  }

  private getSpreadDirections(
    direction: Vector,
    projectileCount: number,
    spreadDegrees: number,
  ) {
    if (projectileCount <= 1) return [normalizeVector(direction)];

    const start = -(spreadDegrees * (projectileCount - 1)) / 2;

    return Array.from({ length: projectileCount }).map((_, index) =>
      rotateVector(direction, start + spreadDegrees * index),
    );
  }

  private getActiveOrbitals(id: WeaponId) {
    return this.orbitalGroup
      .getChildren()
      .filter(
        (orbital): orbital is OrbitalWeapon =>
          orbital instanceof OrbitalWeapon &&
          orbital.active &&
          orbital.ownerWeaponId === id,
      );
  }

  private getActiveProjectiles(group: Phaser.Physics.Arcade.Group) {
    return group
      .getChildren()
      .filter(
        (projectile): projectile is Projectile =>
          projectile instanceof Projectile && projectile.active,
      );
  }

  private getProjectileSpeed(projectile: Projectile) {
    const weapon = this.activeWeapons.get(projectile.ownerWeaponId);

    return weapon?.stats.projectileSpeed ?? 0;
  }

  private clearGroup(group: Phaser.Physics.Arcade.Group) {
    const children = this.getSafeGroupChildren(group);
    if (!children.length) return;

    children.forEach((child) => {
      if ("despawn" in child && typeof child.despawn === "function") {
        child.despawn();
      } else {
        (child as Phaser.GameObjects.Sprite).setActive(false).setVisible(false);
      }
    });
  }

  private getSafeGroupChildren(group?: Phaser.Physics.Arcade.Group) {
    if (!group || !(group as any).scene)
      return [] as Phaser.GameObjects.GameObject[];

    try {
      return group.getChildren();
    } catch {
      return [];
    }
  }

  private destroyGroup(group?: Phaser.Physics.Arcade.Group) {
    if (!group) return;

    try {
      group.destroy(true);
    } catch {
      // Scene shutdown can partially tear down Arcade groups before this runs.
    }
  }

  private createFallbackTextures() {
    const { scene } = this.props;
    const graphics = scene.add.graphics();

    const circleTexture = (key: string, color: number, size = 16) => {
      if (scene.textures.exists(key)) return;
      graphics.clear();
      graphics.fillStyle(color, 1);
      graphics.fillCircle(size / 2, size / 2, size / 2);
      graphics.generateTexture(key, size, size);
    };

    const rectTexture = (
      key: string,
      color: number,
      width = 18,
      height = 8,
    ) => {
      if (scene.textures.exists(key)) return;
      graphics.clear();
      graphics.fillStyle(color, 1);
      graphics.fillRect(0, 0, width, height);
      graphics.generateTexture(key, width, height);
    };

    // circleTexture("weapon_projectile", 0xffffff, 8);
    circleTexture("weapon_water_drop", 0x5bbcff, 8);
    // circleTexture("weapon_corn", 0xffd447, 10);
    // circleTexture("weapon_tomato", 0xe14242, 10);
    // circleTexture("weapon_light", 0xfff6a3, 8);
    circleTexture("weapon_pumpkin", 0xf28c28, 14);
    circleTexture("weapon_sunflower", 0xffd447, 14);
    // circleTexture("weapon_wheat", 0xd8b35a, 20);
    // circleTexture("weapon_bee", 0xf4c430, 10);
    // circleTexture("weapon_explosion", 0xff8f3a, 42);
    // circleTexture("weapon_hitbox", 0xffffff, 32);
    rectTexture("weapon_hoe", 0xcfd7e6, 18, 6);
    rectTexture("weapon_slash", 0xe8f2ff, 42, 14);

    graphics.destroy();
  }
}
