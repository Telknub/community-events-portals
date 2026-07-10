import mapJson from "assets/map/emptyMap.json";
// import tilesetconfig from "assets/map/tileset.json";
import type { SceneId } from "features/world/mmoMachine";
import { BaseScene } from "./Core/BaseScene";
import type { MachineInterpreter } from "./lib/Machine";
import type { EventObject } from "xstate";
import { isTouchDevice } from "features/world/lib/device";
import {
  getPlayerStatValue,
  PLAYER_STAT_BASE_LEVEL,
  PLAYER_WATER_SPEED_MULTIPLIER,
  PORTAL_NAME,
  WALKING_SPEED,
  GAME_SECONDS,
} from "./constants";
import { EventBus } from "./lib/EventBus";
import { SUNNYSIDE } from "assets/sunnyside";
import type { BoundingBox } from "./lib/collisionDetection";
import { addStaticObstacle } from "./containers/ObstaclesContainer";
import { WeaponManager } from "./lib/combat/WeaponManager";
import type { BumpkinContainer } from "./Core/BumpkinContainer";
import { OBSTACLES_LAYOUT } from "./constants";
import { SwarmMob } from "./containers/SwarmMobContainer";
import { SQUARE_WIDTH } from "features/game/lib/constants";
import { DropItem } from "./containers/DropItemsContainer";
import type {
  WeaponId,
  WeaponLoadoutItem,
  DropItemType,
  BossTypes,
  MobTypes,
  WeaponLevel,
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
  private static readonly WEAPON_BANANA_ANIMATION_KEY = "weapon_banana_active";
  private static readonly WEAPON_SCYTHE_ANIMATION_KEY = "weapon_scythe_active";
  private static readonly WEAPON_WATERING_CAN_PROJECTILE_ANIMATION_KEY =
    "weapon_watering_can_projectile_active";
  private static readonly WEAPON_CORN_PROJECTILE_ANIMATION_KEY =
    "weapon_corn_projectile_active";
  private static readonly WEAPON_CORN_EXPLOSION_ANIMATION_KEY =
    "weapon_corn_explosion_active";
  private static readonly WEAPON_TOMATO_PROJECTILE_ANIMATION_KEY =
    "weapon_tomato_projectile_active";
  private static readonly WEAPON_SUNFLOWER_ANIMATION_KEY =
    "weapon_sunflower_active";
  private static readonly WEAPON_SUNFLOWER_PROJECTILE_ANIMATION_KEY =
    "weapon_sunflower_projectile_active";
  private static readonly WEAPON_OIL_ANIMATION_KEY = "weapon_oil_active";
  private static readonly WEAPON_HORIZONTAL_PUMPKIN_ANIMATION_KEY =
    "weapon_horizontal_pumpkin_active";
  private static readonly WEAPON_VERTICAL_PUMPKIN_ANIMATION_KEY =
    "weapon_vertical_pumpkin_active";
  private static readonly WEAPON_DIAGONAL_PUMPKIN_ANIMATION_KEY =
    "weapon_diagonal_pumpkin_active";
  private static readonly WEAPON_DIAGONAL_PUMPKIN_REVERSE_ANIMATION_KEY =
    "weapon_diagonal_pumpkin_active_reverse";
  private static readonly WEAPON_BEES_ANIMATION_KEY = "weapon_bees_active";
  private static readonly WEAPON_BEES_SPAWN_ANIMATION_KEY =
    "weapon_bees_spawn_active";
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

  private get isGameplayPaused() {
    return this.portalService?.state.context.isGameplayPaused === true;
  }

  public get portalService() {
    return this.registry.get("portalService") as MachineInterpreter;
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

    // Boss icons
    this.load.image("icon_boss_1", "world/portal/images/icon_boss_1.webp");
    this.load.image("icon_boss_2", "world/portal/images/icon_boss_2.webp");
    this.load.image("icon_boss_3", "world/portal/images/icon_boss_3.webp");

    // Weapons
    this.load.spritesheet("weapon_banana", "world/portal/images/banana.png", {
      frameWidth: 16,
      frameHeight: 16,
    });
    this.load.spritesheet("weapon_scythe", "world/portal/images/scythe.png", {
      frameWidth: 38,
      frameHeight: 25,
    });
    this.load.image(
      "weapon_watering_can",
      "world/portal/images/watering_can.png",
    );
    this.load.spritesheet(
      "weapon_watering_can_projectile",
      "world/portal/images/watering_can_projectile.png",
      {
        frameWidth: 16,
        frameHeight: 16,
      },
    );
    this.load.spritesheet(
      "weapon_corn_projectile",
      "world/portal/images/corn_projectile.png",
      {
        frameWidth: 16,
        frameHeight: 48,
      },
    );
    this.load.spritesheet(
      "weapon_corn_explosion",
      "world/portal/images/corn_explosion.png",
      {
        frameWidth: 48,
        frameHeight: 48,
      },
    );
    this.load.image(
      "weapon_tomato_ricochet",
      "world/portal/images/tomato_ricochet.png",
    );
    this.load.spritesheet(
      "weapon_tomato_projectile",
      "world/portal/images/tomato_projectile.png",
      {
        frameWidth: 17,
        frameHeight: 17,
      },
    );
    this.load.spritesheet(
      "weapon_sunflower",
      "world/portal/images/sunflower.png",
      {
        frameWidth: 18,
        frameHeight: 31,
      },
    );
    this.load.spritesheet(
      "weapon_sunflower_projectile",
      "world/portal/images/sunflower_projectile.png",
      {
        frameWidth: 16,
        frameHeight: 16,
      },
    );
    this.load.spritesheet("weapon_oil", "world/portal/images/oil.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet(
      "weapon_horizontal_pumpkin",
      "world/portal/images/horizontal_pumpkin.webp",
      {
        frameWidth: 32,
        frameHeight: 48,
      },
    );
    this.load.spritesheet(
      "weapon_vertical_pumpkin",
      "world/portal/images/vertical_pumpkin.webp",
      {
        frameWidth: 32,
        frameHeight: 48,
      },
    );
    this.load.spritesheet(
      "weapon_diagonal_pumpkin",
      "world/portal/images/diagonal_pumpkin.webp",
      {
        frameWidth: 32,
        frameHeight: 48,
      },
    );
    this.load.spritesheet(
      "weapon_bees_spawn",
      "world/portal/images/bees_spawn.png",
      {
        frameWidth: 16,
        frameHeight: 32,
      },
    );
    this.load.spritesheet("weapon_bees", "world/portal/images/bees.png", {
      frameWidth: 16,
      frameHeight: 32,
    });
    // this.load.image("weapon_slash", "/world/portal/images/weapons/slash.png");
    // this.load.image(
    //   "weapon_water_drop",
    //   "/world/portal/images/weapons/water_drop.png",
    // );
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
    // this.load.image("weapon_oil", "/world/portal/images/weapons/oil.png");
    // this.load.image("weapon_bee", "/world/portal/images/weapons/bee.png");

    // Music
    // Background
    this.load.audio("backgroundMusic", "/world/portal/music/bg_music.mp3");

    // SFX
    this.load.audio("hurt", "world/portal/sfx/hurt.wav");
    this.load.audio("bossDeath", "world/portal/sfx/bossDeath.wav");
    this.load.audio("collect_xp", "world/portal/sfx/xp.wav");

    // Weapon SFX
    this.load.audio("sfx_banana_swing", "world/portal/sfx/banana.wav");
    this.load.audio("sfx_slash_broom", "world/portal/sfx/broomScythe.wav");
    this.load.audio("sfx_tomato_throw", "world/portal/sfx/tomato.wav");
    this.load.audio("sfx_water_shot", "world/portal/sfx/wateringCan.wav");
    this.load.audio("sfx_explosion_pop", "world/portal/sfx/corn.wav");
    this.load.audio("sfx_light_shot", "world/portal/sfx/sunflower.wav");
    this.load.audio("sfx_oil_cast", "world/portal/sfx/oil.wav");
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
    this.createWeaponAnimations();

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
      volume: 0.4,
    });
  }

  private createWeaponAnimations() {
    if (!this.anims.exists(Scene.WEAPON_BANANA_ANIMATION_KEY)) {
      this.anims.create({
        key: Scene.WEAPON_BANANA_ANIMATION_KEY,
        frames: this.anims.generateFrameNumbers("weapon_banana", {
          start: 0,
          end: 7,
        }),
        frameRate: 12,
        repeat: -1,
      });
    }

    if (!this.anims.exists(Scene.WEAPON_SCYTHE_ANIMATION_KEY)) {
      this.anims.create({
        key: Scene.WEAPON_SCYTHE_ANIMATION_KEY,
        frames: this.anims.generateFrameNumbers("weapon_scythe", {
          start: 0,
          end: 9,
        }),
        frameRate: 36,
        repeat: 0,
      });
    }

    if (
      !this.anims.exists(Scene.WEAPON_WATERING_CAN_PROJECTILE_ANIMATION_KEY)
    ) {
      this.anims.create({
        key: Scene.WEAPON_WATERING_CAN_PROJECTILE_ANIMATION_KEY,
        frames: this.anims.generateFrameNumbers(
          "weapon_watering_can_projectile",
          {
            start: 0,
            end: 4,
          },
        ),
        frameRate: 12,
        repeat: -1,
      });
    }

    if (!this.anims.exists(Scene.WEAPON_CORN_PROJECTILE_ANIMATION_KEY)) {
      this.anims.create({
        key: Scene.WEAPON_CORN_PROJECTILE_ANIMATION_KEY,
        frames: this.anims.generateFrameNumbers("weapon_corn_projectile", {
          start: 0,
          end: 9,
        }),
        frameRate: 12,
        repeat: -1,
      });
    }

    if (!this.anims.exists(Scene.WEAPON_CORN_EXPLOSION_ANIMATION_KEY)) {
      this.anims.create({
        key: Scene.WEAPON_CORN_EXPLOSION_ANIMATION_KEY,
        frames: this.anims.generateFrameNumbers("weapon_corn_explosion", {
          start: 0,
          end: 14,
        }),
        frameRate: 24,
        repeat: 0,
      });
    }

    if (!this.anims.exists(Scene.WEAPON_TOMATO_PROJECTILE_ANIMATION_KEY)) {
      this.anims.create({
        key: Scene.WEAPON_TOMATO_PROJECTILE_ANIMATION_KEY,
        frames: this.anims.generateFrameNumbers("weapon_tomato_projectile", {
          start: 0,
          end: 3,
        }),
        frameRate: 12,
        repeat: -1,
      });
    }

    if (!this.anims.exists(Scene.WEAPON_SUNFLOWER_ANIMATION_KEY)) {
      this.anims.create({
        key: Scene.WEAPON_SUNFLOWER_ANIMATION_KEY,
        frames: this.anims.generateFrameNumbers("weapon_sunflower", {
          start: 0,
          end: 4,
        }),
        frameRate: 8,
        repeat: -1,
      });
    }

    if (!this.anims.exists(Scene.WEAPON_SUNFLOWER_PROJECTILE_ANIMATION_KEY)) {
      this.anims.create({
        key: Scene.WEAPON_SUNFLOWER_PROJECTILE_ANIMATION_KEY,
        frames: this.anims.generateFrameNumbers("weapon_sunflower_projectile", {
          start: 0,
          end: 7,
        }),
        frameRate: 12,
        repeat: -1,
      });
    }

    if (!this.anims.exists(Scene.WEAPON_OIL_ANIMATION_KEY)) {
      this.anims.create({
        key: Scene.WEAPON_OIL_ANIMATION_KEY,
        frames: this.anims.generateFrameNumbers("weapon_oil", {
          start: 0,
          end: 9,
        }),
        frameRate: 12,
        repeat: 0,
      });
    }

    if (!this.anims.exists(Scene.WEAPON_HORIZONTAL_PUMPKIN_ANIMATION_KEY)) {
      this.anims.create({
        key: Scene.WEAPON_HORIZONTAL_PUMPKIN_ANIMATION_KEY,
        frames: this.anims.generateFrameNumbers("weapon_horizontal_pumpkin", {
          start: 0,
          end: 8,
        }),
        frameRate: 12,
        repeat: -1,
      });
    }

    if (!this.anims.exists(Scene.WEAPON_VERTICAL_PUMPKIN_ANIMATION_KEY)) {
      this.anims.create({
        key: Scene.WEAPON_VERTICAL_PUMPKIN_ANIMATION_KEY,
        frames: this.anims.generateFrameNumbers("weapon_vertical_pumpkin", {
          start: 0,
          end: 8,
        }),
        frameRate: 12,
        repeat: -1,
      });
    }

    if (!this.anims.exists(Scene.WEAPON_DIAGONAL_PUMPKIN_ANIMATION_KEY)) {
      this.anims.create({
        key: Scene.WEAPON_DIAGONAL_PUMPKIN_ANIMATION_KEY,
        frames: this.anims.generateFrameNumbers("weapon_diagonal_pumpkin", {
          start: 0,
          end: 8,
        }),
        frameRate: 12,
        repeat: -1,
      });
    }

    if (
      !this.anims.exists(Scene.WEAPON_DIAGONAL_PUMPKIN_REVERSE_ANIMATION_KEY)
    ) {
      this.anims.create({
        key: Scene.WEAPON_DIAGONAL_PUMPKIN_REVERSE_ANIMATION_KEY,
        frames: Array.from({ length: 9 }, (_, index) => ({
          key: "weapon_diagonal_pumpkin",
          frame: 8 - index,
        })),
        frameRate: 12,
        repeat: -1,
      });
    }

    if (!this.anims.exists(Scene.WEAPON_BEES_ANIMATION_KEY)) {
      this.anims.create({
        key: Scene.WEAPON_BEES_ANIMATION_KEY,
        frames: this.anims.generateFrameNumbers("weapon_bees", {
          start: 0,
          end: 7,
        }),
        frameRate: 12,
        repeat: -1,
      });
    }

    if (!this.anims.exists(Scene.WEAPON_BEES_SPAWN_ANIMATION_KEY)) {
      this.anims.create({
        key: Scene.WEAPON_BEES_SPAWN_ANIMATION_KEY,
        frames: this.anims.generateFrameNumbers("weapon_bees_spawn", {
          start: 0,
          end: 6,
        }),
        frameRate: 12,
        repeat: 0,
      });
    }
  }

  update(time = this.time.now, delta = this.game.loop.delta) {
    this.syncPhysicsPause();

    if (this.isGamePlaying && !this.isGameplayPaused) {
      // The game has started
      this.velocity = this.getPlayerMovementSpeed();
      this.loadBumpkinAnimations();
      this.handlePlayerOutOfWater();
      this.weaponManager?.update(time, delta);
      this.processTimeWaves();
      // this.scoreBaseWave();
      this.swarmEnemies.forEach((mob) => {
        mob.setSwarmMove(true);
      });
      this.bossEnemies.forEach((boss) => {
        boss.setMove(true);
      });
    } else if (this.isGamePlaying && this.isGameplayPaused) {
      this.velocity = 0;
      if (!this.currentPlayer?.isHurting) {
        this.currentPlayer?.idle?.();
      }
      this.swarmEnemies.forEach((mob) => {
        mob.setSwarmMove(false);
      });
      this.bossEnemies.forEach((boss) => {
        boss.setMove(false);
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

  private syncPhysicsPause() {
    if (this.isGamePlaying && this.isGameplayPaused) {
      if (!this.physics.world.isPaused) {
        this.physics.world.pause();
      }
      if (!this.time.paused) {
        this.time.paused = true;
      }
      return;
    }

    if (this.physics.world.isPaused) {
      this.physics.world.resume();
    }
    if (this.time.paused) {
      this.time.paused = false;
    }
  }

  private initialiseProperties() {
    this.velocity = 0;
    this.obstacles = [];
    this.swarmEnemies = [];
    this.bossEnemies = [];
    this.seaBeastDefeated = false;
    this.waveState.clear();

    if (this.physics.world.isPaused) {
      this.physics.world.resume();
    }

    if (this.time.paused) {
      this.time.paused = false;
    }
  }

  private getPlayerMovementSpeed() {
    const speedLevel =
      this.portalService?.state.context.playerStatLevels.speed ??
      PLAYER_STAT_BASE_LEVEL;
    const speed = getPlayerStatValue(
      "speed",
      speedLevel,
      this.portalService?.state.context.activeWearables,
    );

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
    const portalService = this.portalService;

    // reload scene when player hit retry
    const onRetry = (event: EventObject) => {
      if (event.type === "RETRY") {
        this.scene.restart();
      }
    };
    portalService.onEvent(onRetry);

    // Restart scene when player hit start
    const onContinue = (event: EventObject) => {
      if (event.type === "CONTINUE") {
        this.scene.restart();
      }
    };
    portalService.onEvent(onContinue);

    // Restart scene when player hit start training
    const onContinueTraining = (event: EventObject) => {
      if (event.type === "CONTINUE_TRAINING") {
        this.scene.restart();
      }
    };
    portalService.onEvent(onContinueTraining);

    // Ensure the scene is fresh when the game starts
    const onStart = (event: EventObject) => {
      if (event.type === "START") {
        this.scene.restart();
      }
    };
    portalService.onEvent(onStart);

    this.events.once("shutdown", () => {
      portalService.off(onRetry);
      portalService.off(onContinue);
      portalService.off(onContinueTraining);
      portalService.off(onStart);
    });
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
    let weaponLoadout = this.createWeaponLoadout(portalContext?.weaponLevels);
    let activeWearables = portalContext?.activeWearables;
    this.currentPlayer.setEquippedWeapon(
      this.getDisplayedWeapon(weaponLoadout),
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
        state.context.weaponLevels,
      );
      const nextWearables = state.context.activeWearables;
      const hasSameWeaponLoadout =
        JSON.stringify(nextWeaponLoadout) === JSON.stringify(weaponLoadout);
      const hasSameWearables =
        JSON.stringify(nextWearables) === JSON.stringify(activeWearables);

      if (hasSameWeaponLoadout && hasSameWearables) {
        return;
      }

      weaponLoadout = nextWeaponLoadout;
      activeWearables = nextWearables;
      this.currentPlayer?.setEquippedWeapon(
        this.getDisplayedWeapon(nextWeaponLoadout),
      );
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
    weaponLevels: Record<WeaponId, WeaponLevel> = {} as Record<
      WeaponId,
      WeaponLevel
    >,
  ): WeaponLoadoutItem[] {
    return Object.entries(weaponLevels)
      .filter((entry): entry is [WeaponId, WeaponLevel] => entry[1] > 0)
      .map(([id, level]) => ({
        id,
        level,
      }));
  }

  private getDisplayedWeapon(loadout: WeaponLoadoutItem[]) {
    return loadout.find(({ id }) => id === "wateringCan")?.id;
  }

  private groupPhysics() {
    this.obstacleGroup = this.physics.add.staticGroup();
    this.waterGroup = this.physics.add.staticGroup();
    this.swarmGroup = this.physics.add.group();
    this.enemyGroup = this.physics.add.group();
    this.bossGroup = this.physics.add.group();
  }

  private groupCollision() {
    this.physics.add.collider(this.swarmGroup, this.swarmGroup);

    this.physics.add.collider(
      this.obstacleGroup,
      this.swarmGroup,
      (_obstacle, enemyObj) => {
        const enemy = enemyObj as SwarmMob;

        enemy.changeDirection();
      },
    );

    this.physics.add.collider(this.bossEnemies, this.bossEnemies);

    this.physics.add.collider(
      this.obstacleGroup,
      this.bossGroup,
      (_obstacle, enemyObj) => {
        const boss = enemyObj as BossEnemy;

        boss.changeDirection();
      },
    );
  }

  private scoreBaseWave() {
    this.portalService?.onTransition((state) => {
      if (!state.changed) return;

      const score = state.context.score;
      this.spawnBoss(score);
      this.spawnSwarmMob(score);
    });
  }

  private processTimeWaves() {
    const endAt = this.portalService?.state.context.endAt ?? 0;
    if (!endAt) return;

    const secondsLeft = Math.max(endAt - Date.now(), 0) / 1000;
    const elapsedTime = GAME_SECONDS - secondsLeft;

    this.spawnBoss(elapsedTime);
    this.spawnSwarmMob(elapsedTime);
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
  private bossWarning(bossType: BossTypes) {
    if (!this.currentPlayer) return;

    const BOSS_ICONS: Record<BossTypes, string> = {
      boss1: "icon_boss_1",
      boss2: "icon_boss_2",
      boss3: "icon_boss_3",
    };

    const key = BOSS_ICONS[bossType];
    if (!key) return;

    const icon = this.add
      .image(this.currentPlayer.x, this.currentPlayer.y - 20, key)
      .setDepth(9999)
      .setAlpha(0);
    icon.setScale(0.8);

    const followPlayer = () => {
      if (!this.currentPlayer || !icon.active) return;
      icon.setPosition(this.currentPlayer.x, this.currentPlayer.y - 20);
    };
    this.events.on("update", followPlayer);

    this.tweens.add({
      targets: icon,
      alpha: 1,
      duration: 400,
      yoyo: true,
      repeat: 1,
      onComplete: () => {
        icon.setVisible(false);
        this.events.off("update", followPlayer);
        icon.destroy();
      },
    });
  }

  private bossSpawnWave(bossType: BossTypes, total: number) {
    for (let i = 0; i < total; i++) {
      this.bossWarning(bossType);
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
      if (score >= wave.triggerAt && !this.waveState.get(key)) {
        this.waveState.set(key, true);

        this.bossSpawnWave(wave.bossType, wave.totalEnemy);
      }
    }
  }

  private spawnSwarmMob(score: number) {
    for (const wave of MOB_WAVE_THRESHOLDS) {
      const key = wave.flag;
      if (score >= wave.triggerAt && !this.waveState.get(key)) {
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
