import mapJson from "assets/map/emptyMap.json";
// import tilesetconfig from "assets/map/tileset.json";
import { SceneId } from "features/world/mmoMachine";
import { BaseScene } from "./Core/BaseScene";
import { MachineInterpreter } from "./lib/Machine";
import { EventObject } from "xstate";
import { isTouchDevice } from "features/world/lib/device";
import {
  getPlayerStatValue,
  PLAYER_STAT_INITIAL_LEVEL,
  PLAYER_WATER_SPEED_MULTIPLIER,
  PORTAL_NAME,
  WALKING_SPEED,
} from "./constants";
import { EventBus } from "./lib/EventBus";
import { SUNNYSIDE } from "assets/sunnyside";
import { BoundingBox } from "./lib/collisionDetection";
import { addStaticObstacle } from "./containers/ObstaclesContainer";
import { WeaponManager } from "./lib/combat/WeaponManager";
import { BumpkinContainer } from "./Core/BumpkinContainer";
import { OBSTACLES_LAYOUT } from "./constants";
import { SwarmMob } from "./containers/SwarmMobContainer";
import { SQUARE_WIDTH } from "features/game/lib/constants";
import { DropItem } from "./containers/DropItemsContainer";
import {
  WeaponId,
  WeaponLoadoutItem,
  DropItemType,
  BossTypes,
  MobTypes,
} from "./Types";
import { BossEnemy } from "./containers/BossEnemyContainer";
import {
  BOSS_WAVE_THRESHOLDS,
  MOB_WAVE_THRESHOLDS,
} from "./constants/EnemyConstants";

// export const NPCS: NPCBumpkin[] = [
//   {
//     x: 380,
//     y: 400,
//     // View NPCModals.tsx for implementation of pop up modal
//     npc: "portaller",
//   },
// ];
export class Scene extends BaseScene {
  private backgroundMusic!: Phaser.Sound.BaseSound;
  private obstacles: BoundingBox[] = [];
  private obstacleGroup!: Phaser.Physics.Arcade.StaticGroup;
  private enemyGroup!: Phaser.Physics.Arcade.Group;
  private weaponManager?: WeaponManager;
  private seaBeastDefeated = false;
  waterGroup!: Phaser.Physics.Arcade.StaticGroup;
  swarmEnemies: SwarmMob[] = [];
  swarmGroup!: Phaser.Physics.Arcade.Group;
  bossEnemies: BossEnemy[] = [];
  bossGroup!: Phaser.Physics.Arcade.Group;
  private gameStartTime = Date.now();

  sceneId: SceneId = PORTAL_NAME;

  constructor() {
    super({
      name: PORTAL_NAME,
      map: {
        json: mapJson,
      },
      audio: { fx: { walk_key: "dirt_footstep" } },
    });
  }

  private get isGameReady() {
    return this.portalService?.state.matches("ready") === true;
  }

  private get isGamePlaying() {
    return this.portalService?.state.matches("playing") === true;
  }

  public get portalService() {
    return this.registry.get("portalService") as MachineInterpreter | undefined;
  }

  preload() {
    super.preload();

    // Minigame assets
    // Swarm Mobs
    this.load.spritesheet("Mob1", "world/portal/images/mob1.webp", {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet("Mob2", "world/portal/images/mob2.webp", {
      frameWidth: 32,
      frameHeight: 48,
    });
    this.load.spritesheet("Mob3", "world/portal/images/mob3.webp", {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet("Mob4", "world/portal/images/mob4.webp", {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet("Mob5", "world/portal/images/mob5.webp", {
      frameWidth: 16,
      frameHeight: 32,
    });

    // Boss enemy
    this.load.spritesheet("Boss1", "world/portal/images/BossEnemy1.webp", {
      frameWidth: 55,
      frameHeight: 71,
    });
    this.load.spritesheet("Boss2", "world/portal/images/BossEnemy2.webp", {
      frameWidth: 71,
      frameHeight: 64,
    });
    this.load.spritesheet("Boss3", "world/portal/images/BossEnemy3.webp", {
      frameWidth: 55,
      frameHeight: 50,
    });

    // Drop items
    this.load.image("blueOrb", "world/portal/images/dropItem1.webp");
    this.load.image("greenOrb", "world/portal/images/dropItem2.webp");
    this.load.image("grayOrb", "world/portal/images/dropItem3.webp");
    this.load.image("yellowOrb", "world/portal/images/dropItem4.webp");
    this.load.image("purpleOrb", "world/portal/images/dropItem5.webp");
    this.load.image("boss_dropItem1", SUNNYSIDE.icons.lightning);
    this.load.image("boss_dropItem2", SUNNYSIDE.icons.happy);
    this.load.image("heart", SUNNYSIDE.icons.heart);

    // Obstacles
    this.load.image("rock", SUNNYSIDE.resource.stone_rock);
    this.load.image("tree", SUNNYSIDE.resource.tree);
    this.load.image("tree_stump", SUNNYSIDE.resource.tree_stump);
    this.load.image("water", SUNNYSIDE.decorations.ocean);

    this.load.image("weapon_hoe", "world/portal/images/hoe.webp");
    // this.load.image("weapon_slash", "/world/portal/images/weapons/slash.png");
    // this.load.image(
    //   "weapon_water_drop",
    //   "/world/portal/images/weapons/water_drop.png",
    // );
    // this.load.image("weapon_corn", "/world/portal/images/weapons/corn.png");
    // this.load.image("weapon_tomato", "/world/portal/images/weapons/tomato.png");
    // this.load.image("weapon_light", "/world/portal/images/weapons/light.png");
    // this.load.image(
    //   "weapon_pumpkin",
    //   "/world/portal/images/weapons/pumpkin.png",
    // );
    // this.load.image(
    //   "weapon_sunflower",
    //   "/world/portal/images/weapons/sunflower.png",
    // );
    // this.load.image("weapon_wheat", "/world/portal/images/weapons/wheat.png");
    // this.load.image("weapon_bee", "/world/portal/images/weapons/bee.png");
    // this.load.image(
    //   "weapon_explosion",
    //   "/world/portal/images/weapons/explosion.png",
    // );

    // Music
    // Background
    this.load.audio(
      "backgroundMusic",
      "/world/portal/music/background-music.mp3",
    );

    // SFX
    this.load.audio("hurt", "world/portal/sfx/hurt.wav");
    this.load.audio("bossDeath", "world/portal/sfx/bossDeath.wav");
    this.load.audio("collect_xp", "world/portal/sfx/xp.wav");

    // Weapon SFX
    this.load.audio("sfx_hoe_swing", "world/portal/sfx/hoe.wav");
    this.load.audio("sfx_slash_broom", "world/portal/sfx/broomScythe.wav");
    this.load.audio("sfx_tomato_throw", "world/portal/sfx/tomato.wav");
    this.load.audio("sfx_water_shot", "world/portal/sfx/wateringCan.wav");
    this.load.audio("sfx_explosion_pop", "world/portal/sfx/corn.wav");
    this.load.audio("sfx_light_shot", "world/portal/sfx/sunflower.wav");
    this.load.audio("sfx_root_cast", "world/portal/sfx/wheat.wav");
    this.load.audio("sfx_pumpkin_roll", "world/portal/sfx/pumpkin.wav");
    this.load.audio("sfx_bee_spawn", "world/portal/sfx/beehive.wav");
  }

  async create() {
    this.map = this.make.tilemap({
      key: PORTAL_NAME,
    });
    super.create();

    // Reset listeners
    EventBus.removeAllListeners();

    // Initialise
    this.initialiseProperties();
    this.initializeControls();
    this.initialiseEvents();
    this.initialiseFontFamily();

    // Config
    this.input.addPointer(3);

    this.groupPhysics();
    this.groupCollision();

    this.handlePlayerInWater();
    this.createObstacles();
    this.initialiseCombat();
    this.initialiseWearables();

    // DEBUG
    this.physics.world.drawDebug = false;
    if (this.physics.world.drawDebug) {
      const GRID_SIZE = 16;
      // Draw coordinates at each grid position
      for (let x = 0; x < this.map.widthInPixels; x += GRID_SIZE) {
        for (let y = 0; y < this.map.heightInPixels; y += GRID_SIZE) {
          const name = this.add.bitmapText(
            x,
            y,
            "Teeny Tiny Pixls",
            `${x / GRID_SIZE},${y / GRID_SIZE}`,
            7,
          );
          name.setScale(0.5);
          name.setDepth(10000000000000);
        }
      }
    }

    // Background music
    this.backgroundMusic = this.sound.add("backgroundMusic", {
      loop: true,
      volume: 0.2,
    });
  }

  update(time = this.time.now, delta = this.game.loop.delta) {
    if (this.isGamePlaying) {
      // The game has started
      this.velocity = this.getPlayerMovementSpeed();
      this.loadBumpkinAnimations();
      this.handlePlayerOutOfWater();
      this.weaponManager?.update(time, delta);
      this.timeBaseWave();
      // this.scoreBaseWave();
      this.swarmEnemies.forEach((mob) => {
        mob.setSwarmMove(true);
      });
      this.bossEnemies.forEach((boss) => {
        boss.setMove(true);
      });
    } else if (this.isGameReady) {
      this.portalService?.send("START");
      this.velocity = WALKING_SPEED;
      this.backgroundMusic.play();
    } else {
      this.velocity = 0;
    }

    super.update();
  }

  private initialiseProperties() {
    this.velocity = 0;
  }

  private getPlayerMovementSpeed() {
    const speedLevel =
      this.portalService?.state.context.playerStatLevels.speed ??
      PLAYER_STAT_INITIAL_LEVEL;
    const speed = getPlayerStatValue("speed", speedLevel);

    return this.currentPlayer?.isSwimming
      ? speed * PLAYER_WATER_SPEED_MULTIPLIER
      : speed;
  }

  private initializeControls() {
    if (isTouchDevice()) {
      // const baseX = this.cameras.main.width / 2;
      // const baseY = this.cameras.main.height / 2;
      // const offsetX = window.innerWidth / (2 * this.zoom) - TILE_SIZE;
      // const offsetY = window.innerHeight / (2 * this.zoom) - TILE_SIZE;

      // // Joystick
      // this.joystick = new VirtualJoyStick(this, {
      //   x: baseX - offsetX,
      //   y: baseY + offsetY,
      //   radius: 15,
      //   base: this.add.circle(0, 0, 20, 0x000000, 0.5).setDepth(1000000000),
      //   thumb: this.add.circle(0, 0, 8, 0xffffff, 0.5).setDepth(1000000000),
      //   forceMin: 2,
      // });

      // // Use tool button
      // const useToolButton = this.add
      //   .image(
      //     baseX + offsetX - TILE_SIZE / 6,
      //     baseY + offsetY,
      //     "use_tool_button",
      //   )
      //   .setInteractive()
      //   .setScrollFactor(0)
      //   .setScale(1.5)
      //   .setAlpha(0.8)
      //   .setDepth(1000000000000)
      //   .on("pointerdown", () => {
      //     if (this.isUseToolButtonPressed) return;
      //     this.isUseToolButtonPressed = true;
      //     this.mobileKeys.useTool = true;
      //     useToolButton.setTexture("use_tool_button_pressed");
      //   })
      //   .on("pointerup", () => {
      //     this.isUseToolButtonPressed = false;
      //     useToolButton.setTexture("use_tool_button");
      //   })
      //   .on("pointerout", () => {
      //     this.isUseToolButtonPressed = false;
      //     useToolButton.setTexture("use_tool_button");
      //   });

      // // Change tool button
      // const changeToolButton = this.add
      //   .image(
      //     baseX + offsetX + TILE_SIZE / 3,
      //     baseY + offsetY - TILE_SIZE + TILE_SIZE / 8,
      //     "change_tool_button",
      //   )
      //   .setInteractive()
      //   .setScrollFactor(0)
      //   .setScale(0.75)
      //   .setAlpha(0.8)
      //   .setDepth(1000000000000)
      //   .on("pointerdown", () => {
      //     if (this.isChangeToolButtonPressed) return;
      //     this.isChangeToolButtonPressed = true;
      //     this.mobileKeys.changeTool = true;
      //     changeToolButton.setTexture("change_tool_button_pressed");
      //   })
      //   .on("pointerup", () => {
      //     this.isChangeToolButtonPressed = false;
      //     changeToolButton.setTexture("change_tool_button");
      //   })
      //   .on("pointerout", () => {
      //     this.isChangeToolButtonPressed = false;
      //     changeToolButton.setTexture("change_tool_button");
      //   });

      this.portalService?.send("SET_JOYSTICK_ACTIVE", {
        isJoystickActive: true,
      });
    }
  }

  private initialiseEvents() {
    // reload scene when player hit retry
    const onRetry = (event: EventObject) => {
      if (event.type === "RETRY") {
        this.scene.restart();
      }
    };
    this.portalService?.onEvent(onRetry);

    // Restart scene when player hit start
    const onContinue = (event: EventObject) => {
      if (event.type === "CONTINUE") {
        this.scene.restart();
      }
    };
    this.portalService?.onEvent(onContinue);

    // Restart scene when player hit start training
    const onContinueTraining = (event: EventObject) => {
      if (event.type === "CONTINUE_TRAINING") {
        this.scene.restart();
      }
    };
    this.portalService?.onEvent(onContinueTraining);

    // Ensure the scene is fresh when the game starts
    const onStart = (event: EventObject) => {
      if (event.type === "START") {
        this.scene.restart();
      }
    };
    this.portalService?.onEvent(onStart);
  }

  private initialiseFontFamily() {
    this.add
      .text(0, 0, ".", {
        fontFamily: "Teeny",
        fontSize: "1px",
        color: "#000000",
      })
      .setAlpha(0);
  }

  private initialiseCombat() {
    if (!this.currentPlayer) return;

    const portalService = this.portalService;
    const portalContext = portalService?.state.context;
    let weaponLoadout = this.createWeaponLoadout(
      portalContext?.selectedWeapon,
      portalContext
        ? portalContext.weaponLevels[portalContext.selectedWeapon]
        : undefined,
    );

    this.weaponManager = new WeaponManager({
      scene: this,
      player: this.currentPlayer,
      enemyGroup: this.enemyGroup,
      portalService,
      loadout: weaponLoadout,
    });

    const subscription = portalService?.subscribe((state) => {
      const nextWeaponLoadout = this.createWeaponLoadout(
        state.context.selectedWeapon,
        state.context.weaponLevels[state.context.selectedWeapon],
      );
      if (JSON.stringify(nextWeaponLoadout) === JSON.stringify(weaponLoadout)) {
        return;
      }

      weaponLoadout = nextWeaponLoadout;
      this.weaponManager?.reset(nextWeaponLoadout);
    });

    this.events.once("shutdown", () => {
      subscription?.unsubscribe();
      this.weaponManager?.shutdown();
      this.weaponManager = undefined;
      this.enemyGroup?.destroy(false);
      this.swarmGroup?.destroy(false);
    });
  }

  private initialiseWearables() {
    const portalService = this.portalService;
    let activeWearables = portalService?.state.context.activeWearables;

    if (activeWearables && this.currentPlayer) {
      this.currentPlayer.changeClothing({
        ...activeWearables,
        updatedAt: Date.now(),
      });
    }

    const subscription = portalService?.subscribe((state) => {
      const nextWearables = state.context.activeWearables;
      if (!nextWearables || !this.currentPlayer) return;
      if (JSON.stringify(nextWearables) === JSON.stringify(activeWearables)) {
        return;
      }

      activeWearables = nextWearables;
      this.currentPlayer.changeClothing({
        ...nextWearables,
        updatedAt: Date.now(),
      });
    });

    this.events.once("shutdown", () => {
      subscription?.unsubscribe();
    });
  }

  private loadBumpkinAnimations() {
    if (!this.currentPlayer) return;
    if (!this.cursorKeys) return;
    if (this.currentPlayer.isHurting) return;

    if (this.currentPlayer.isSwimming) {
      this.currentPlayer.swim?.();
      return;
    }

    const animation = this.isMoving ? "walk" : "idle";

    this.currentPlayer[animation]?.();
  }

  private createWeaponLoadout(
    selectedWeapon: WeaponId = "hoe",
    selectedWeaponLevel: WeaponLoadoutItem["level"] = 1,
  ): WeaponLoadoutItem[] {
    return [
      {
        id: selectedWeapon,
        level: Math.max(1, selectedWeaponLevel) as WeaponLoadoutItem["level"],
      },
    ];
  }

  private groupPhysics() {
    this.obstacleGroup = this.physics.add.staticGroup();
    this.waterGroup = this.physics.add.staticGroup();
    this.swarmGroup = this.physics.add.group();
    this.enemyGroup = this.physics.add.group();
    this.bossGroup = this.physics.add.group();
  }

  private groupCollision() {
    this.physics.add.collider(
      this.swarmGroup,
      this.swarmGroup,
      (obj1, obj2) => {
        const enemy1 = obj1 as SwarmMob;
        const enemy2 = obj2 as SwarmMob;

        enemy1.separateFrom(enemy2);
        enemy2.separateFrom(enemy1);
      },
    );

    this.physics.add.collider(
      this.obstacleGroup,
      this.swarmGroup,
      (_obstacle, enemyObj) => {
        const enemy = enemyObj as SwarmMob;

        enemy.changeDirection();
      },
    );

    this.physics.add.collider(
      this.bossEnemies,
      this.bossEnemies,
      (obj1, obj2) => {
        const boss1 = obj1 as BossEnemy;
        const boss2 = obj2 as BossEnemy;

        boss1.changeDirection();
        boss2.changeDirection();
      },
    );

    this.physics.add.collider(
      this.obstacleGroup,
      this.bossGroup,
      (_obstacle, enemyObj) => {
        const boss = enemyObj as BossEnemy;

        boss.changeDirection();
      },
    );

    // this.physics.add.collider(
    //   this.bossGroup,
    //   this.swarmGroup,
    // );
  }

  private scoreBaseWave() {
    this.portalService?.onTransition((state) => {
      if (!state.changed) return;

      const score = state.context.score;
      this.spawnBoss(score);
      this.spawnSwarmMob(score);
    });
  }

  private timeBaseWave() {
    this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        const elapsedTime = (Date.now() - this.gameStartTime) / 1000;

        this.spawnBoss(elapsedTime);
        this.spawnSwarmMob(elapsedTime);
      },
    });
  }

  private createObstacles() {
    OBSTACLES_LAYOUT.obstacle1.forEach((o) =>
      addStaticObstacle({
        ...o,
        scene: this,
        obstacleGroup: this.obstacleGroup,
        waterGroup: this.waterGroup,
        currentPlayer: this.currentPlayer as Phaser.GameObjects.GameObject,
        obstacles: this.obstacles,
      }),
    );
  }

  private handlePlayerInWater() {
    this.physics.add.overlap(
      this.currentPlayer as Phaser.GameObjects.GameObject,
      this.waterGroup,
      () => {
        const player = this.currentPlayer;
        if (!player) return;

        if (!player.isSwimming) {
          player.isSwimming = true;
          player.swim?.();
          this.velocity = this.getPlayerMovementSpeed();
          if (!this.seaBeastDefeated) {
            this.createBossEnemy("boss3");
          }
        }
      },
    );
  }

  private handlePlayerOutOfWater() {
    const player = this.currentPlayer;
    if (!player) return;

    const isInWater = this.physics.overlap(
      player as BumpkinContainer,
      this.waterGroup,
    );

    if (!isInWater && player.isSwimming) {
      player.isSwimming = false;
      player.walk?.();
      this.velocity = this.getPlayerMovementSpeed();
      const boss = this.bossEnemies.find((b) => b.bossType === "boss3");
      if (boss) {
        this.dismissBoss(boss);
      }
    }
  }

  private createBossEnemy(bossType: BossTypes) {
    if (!this.currentPlayer) return;
    const maxAttempts = 20;
    const minDistance = 20;
    const spawnRadius = 5 * SQUARE_WIDTH;

    let x = 0;
    let y = 0;
    let placed = false;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const distance = Phaser.Math.Between(10 * SQUARE_WIDTH, spawnRadius);

      x = this.currentPlayer.x + Math.cos(angle) * distance;
      y = this.currentPlayer.y + Math.sin(angle) * distance;

      const tooClose = this.swarmEnemies.some((enemy) => {
        const dist = Phaser.Math.Distance.Between(x, y, enemy.x, enemy.y);
        return dist < minDistance;
      });

      if (!tooClose) {
        placed = true;
        break;
      }
    }

    const boss = new BossEnemy({
      x,
      y,
      scene: this,
      player: this.currentPlayer,
      bossType,
    });

    this.enemyGroup.add(boss);
    this.bossEnemies.push(boss);
    this.bossGroup.add(boss);
    boss.once("destroy", () => {
      this.unregisterBossEnemy(boss);
    });
  }

  private bossWarningFlash() {
    for (let i = 0; i < 3; i++) {
      this.time.delayedCall(i * 100, () => {
        this.cameras.main.flash(100, 255, 0, 0);
      });
    }
  }

  private bossSpawnWave(bossType: BossTypes, total: number) {
    for (let i = 0; i < total; i++) {
      this.bossWarningFlash();
      this.createBossEnemy(bossType);
    }
  }

  createSwarmEnemies(mobType: MobTypes) {
    if (!this.currentPlayer) return;

    const maxAttempts = 20;
    const minDistance = 20;
    const spawnRadius = 5 * SQUARE_WIDTH;

    let x = 0;
    let y = 0;
    let placed = false;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const distance = Phaser.Math.Between(10 * SQUARE_WIDTH, spawnRadius);

      x = this.currentPlayer.x + Math.cos(angle) * distance;
      y = this.currentPlayer.y + Math.sin(angle) * distance;

      const tooClose = this.swarmEnemies.some((enemy) => {
        const dist = Phaser.Math.Distance.Between(x, y, enemy.x, enemy.y);
        return dist < minDistance;
      });

      if (!tooClose) {
        placed = true;
        break;
      }
    }
    const mob = new SwarmMob({
      x,
      y,
      scene: this,
      player: this.currentPlayer,
      mobType,
    });

    this.swarmEnemies.push(mob);
    this.swarmGroup.add(mob);
    this.enemyGroup.add(mob);
    mob.once("destroy", () => {
      this.unregisterSwarmMob(mob);
    });
  }

  private mobSpawnWave(
    mobType: MobTypes,
    total: number,
    batchSize: number,
    delay: number,
  ) {
    let spawned = 0;

    this.time.addEvent({
      delay,
      callback: () => {
        for (let i = 0; i < batchSize && spawned < total; i++) {
          this.createSwarmEnemies(mobType);
          spawned++;
        }
      },
      repeat: Math.ceil(total / batchSize) - 1,
    });
  }

  private waveState = new Map<string, boolean>();

  private spawnBoss(score: number) {
    for (const wave of BOSS_WAVE_THRESHOLDS) {
      const key = wave.flag;
      if (score >= wave.scoreReq && !this.waveState.get(key)) {
        this.waveState.set(key, true);

        this.bossSpawnWave(wave.bossType, wave.totalEnemy);
      }
    }
  }

  private spawnSwarmMob(score: number) {
    for (const wave of MOB_WAVE_THRESHOLDS) {
      const key = wave.flag;
      if (score >= wave.scoreReq && !this.waveState.get(key)) {
        this.waveState.set(key, true);

        this.mobSpawnWave(
          wave.mobType,
          wave.totalEnemy,
          wave.batchSize,
          wave.delay,
        );
      }
    }
  }

  public createDropItems({
    x,
    y,
    itemKey,
  }: {
    x: number;
    y: number;
    itemKey: DropItemType;
  }) {
    new DropItem({
      x,
      y,
      scene: this,
      player: this.currentPlayer,
      itemKey,
    });
  }

  public handleSwarmMobDefeat(mob: SwarmMob) {
    this.createDropItems({ x: mob.x, y: mob.y, itemKey: mob.config.dropItem });
    this.unregisterSwarmMob(mob);
    mob.destroy();
  }

  private unregisterSwarmMob(mob: SwarmMob) {
    this.swarmEnemies = this.swarmEnemies.filter((enemy) => enemy !== mob);
    this.swarmGroup?.remove(mob, false, false);
    this.enemyGroup?.remove(mob, false, false);
  }

  public handleBossDefeat(boss: BossEnemy) {
    if (boss.bossType === "boss3") {
      this.seaBeastDefeated = true;
      this.bossEnemies.forEach((boss) => {
        boss.setMove(false);
      });
      this.swarmEnemies.forEach((mob) => {
        mob.setSwarmMove(false);
      });
    }

    this.createDropItems({
      x: boss.x,
      y: boss.y,
      itemKey: boss.config.dropItem,
    });
    this.unregisterBossEnemy(boss);
    boss.destroy();
  }

  private dismissBoss(boss: BossEnemy) {
    if (!boss || !boss.active) return;
    this.unregisterBossEnemy(boss);
    boss.destroy();
  }

  private unregisterBossEnemy(boss: BossEnemy) {
    this.bossEnemies = this.bossEnemies.filter((enemy) => enemy !== boss);
    this.bossGroup?.remove(boss, false, false);
    this.enemyGroup?.remove(boss, false, false);
  }
}
