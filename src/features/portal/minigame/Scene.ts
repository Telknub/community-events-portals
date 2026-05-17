import mapJson from "assets/map/emptyMap.json";
// import tilesetconfig from "assets/map/tileset.json";
import { SceneId } from "features/world/mmoMachine";
import { BaseScene } from "./Core/BaseScene";
import { MachineInterpreter } from "./lib/Machine";
import { EventObject } from "xstate";
import { isTouchDevice } from "features/world/lib/device";
import { DROP_ITEM, PORTAL_NAME, WALKING_SPEED } from "./constants";
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
import { WeaponId, WeaponLoadoutItem } from "./Types";

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
  waterGroup!: Phaser.Physics.Arcade.StaticGroup;
  swarmEnemies: SwarmMob[] = [];
  swarmGroup!: Phaser.Physics.Arcade.Group;

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
    this.load.spritesheet("swarmMob1", "world/portal/images/mob1.webp", {
      frameWidth: 32,
      frameHeight: 32,
    });

    this.load.spritesheet("swarmMob2", "world/portal/images/mob2.webp", {
      frameWidth: 32,
      frameHeight: 48,
    });

    // Obstacles
    this.load.image("rock", SUNNYSIDE.resource.stone_rock);
    this.load.image("tree", SUNNYSIDE.resource.tree);
    this.load.image("tree_stump", SUNNYSIDE.resource.tree_stump);
    this.load.image("water", SUNNYSIDE.decorations.ocean);
    this.load.image("swarmMob_dropItem", "world/pearl.webp");

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
    // this.load.audio(
    //   "backgroundMusic",
    //   "/world/portal/music/background-music.mp3",
    // );
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
    for (let i = 0; i < 50; i++) {
      this.createSwarmEnemies();
    }

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
    // this.backgroundMusic = this.sound.add("backgroundMusic", {
    //   loop: true,
    //   volume: 0.1,
    // });
    // this.backgroundMusic.play();
  }

  update(time = this.time.now, delta = this.game.loop.delta) {
    if (this.isGamePlaying) {
      // The game has started
      this.loadBumpkinAnimations();
      this.handlePlayerOutOfWater();
      this.weaponManager?.update(time, delta);
      this.swarmEnemies.forEach((mob) => {
        mob.setSwarmMove(true);
      });
    } else if (this.isGameReady) {
      this.portalService?.send("START");
      this.velocity = WALKING_SPEED;
    }

    super.update();
  }

  private initialiseProperties() {
    this.velocity = 0;
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
    let selectedWeapon = portalService?.state.context.selectedWeapon ?? "hoe";

    this.weaponManager = new WeaponManager({
      scene: this,
      player: this.currentPlayer,
      enemyGroup: this.enemyGroup,
      portalService,
      loadout: this.createWeaponLoadout(selectedWeapon),
    });

    const subscription = portalService?.subscribe((state) => {
      const nextSelectedWeapon = state.context.selectedWeapon;
      if (nextSelectedWeapon === selectedWeapon) return;

      selectedWeapon = nextSelectedWeapon;
      this.weaponManager?.reset(this.createWeaponLoadout(nextSelectedWeapon));
    });

    this.events.once("shutdown", () => {
      subscription?.unsubscribe();
      this.weaponManager?.shutdown();
      this.weaponManager = undefined;
      this.enemyGroup?.destroy(false);
      this.swarmGroup?.destroy(false);
    });
  }

  private loadBumpkinAnimations() {
    if (!this.currentPlayer) return;
    if (!this.cursorKeys) return;

    if (this.currentPlayer.isSwimming) {
      this.currentPlayer.swim?.();
      return;
    }

    const animation = this.isMoving ? "walk" : "idle";

    this.currentPlayer[animation]?.();
  }

  private createWeaponLoadout(selectedWeapon: WeaponId): WeaponLoadoutItem[] {
    return [{ id: selectedWeapon, level: 1 }];
  }

  private groupPhysics() {
    this.obstacleGroup = this.physics.add.staticGroup();
    this.waterGroup = this.physics.add.staticGroup();
    this.swarmGroup = this.physics.add.group();
    this.enemyGroup = this.physics.add.group();
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
          this.velocity = 30;
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
      this.velocity = WALKING_SPEED;
    }
  }

  createSwarmEnemies() {
    const maxAttempts = 20;
    const minDistance = 20;

    let x = 0;
    let y = 0;

    let placed = false;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      x = Phaser.Utils.Array.GetRandom([0, 60]) * SQUARE_WIDTH;
      y = Phaser.Math.Between(0, 60) * SQUARE_WIDTH;

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
    });

    mob.setDepth(10000);

    this.swarmEnemies.push(mob);
    this.swarmGroup.add(mob);
    this.enemyGroup.add(mob);
    mob.once("destroy", () => {
      this.unregisterSwarmMob(mob);
    });
  }

  public createDropItems({ x, y }: { x: number; y: number }) {
    new DropItem({
      x,
      y,
      scene: this,
      player: this.currentPlayer,
      itemKey: DROP_ITEM,
    });
  }

  public handleSwarmMobDefeat(mob: SwarmMob) {
    this.createDropItems({ x: mob.x, y: mob.y });
    this.unregisterSwarmMob(mob);
    mob.destroy();
    this.createSwarmEnemies();
  }

  private unregisterSwarmMob(mob: SwarmMob) {
    this.swarmEnemies = this.swarmEnemies.filter((enemy) => enemy !== mob);
    this.swarmGroup?.remove(mob, false, false);
    this.enemyGroup?.remove(mob, false, false);
  }
}
