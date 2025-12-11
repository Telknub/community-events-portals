import mapJson from "assets/map/christmas_map.json";
import tilesetconfig from "assets/map/tileset_christmas.json";
import { SceneId } from "features/world/mmoMachine";
import { BaseScene } from "./Core/BaseScene";
import { MachineInterpreter } from "./lib/Machine";
import { EventObject } from "xstate";
import { isTouchDevice } from "features/world/lib/device";
import {
  PATH_PUZZLE_POINTS,
  PORTAL_NAME,
  PUZZLE_POINTS_CONFIG,
  PUZZLE_TYPES,
  PuzzleName,
  WALKING_SPEED,
} from "./Constants";
import { EventBus } from "./lib/EventBus";
import { NPCBumpkin } from "features/world/scenes/BaseScene";
import { PuzzlePoint } from "./containers/PuzzlePoint";

export const NPCS: NPCBumpkin[] = [
  {
    x: 280,
    y: 180,
    // View NPCModals.tsx for implementation of pop up modal
    npc: "portaller",
  },
];

export class Scene extends BaseScene {
  private backgroundMusic!: Phaser.Sound.BaseSound;

  puzzleTypes!: PuzzleName[];
  sceneId: SceneId = PORTAL_NAME;

  constructor() {
    super({
      name: PORTAL_NAME,
      map: {
        json: mapJson,
        imageKey: "christmas-tileset",
        defaultTilesetConfig: tilesetconfig,
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
    // Music
    // Background
    this.load.audio(
      "backgroundMusic",
      "/world/portal/music/background-music.mp3",
    );

    // Points
    this.load.image("point", "/world/portal/images/point.png");
    this.load.image("checkpoint", "/world/portal/images/checkpoint.png");
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
    this.physics.world.drawDebug = false;

    // Background music
    this.backgroundMusic = this.sound.add("backgroundMusic", {
      loop: true,
      volume: 0.1,
    });
    this.backgroundMusic.play();

    // Create minigame
    this.createPuzzlePoints();
  }

  update() {
    if (this.isGamePlaying) {
      // The game has started
      // this.loadBumpkinAnimations();
    } else if (this.isGameReady) {
      this.portalService?.send("START");
      this.velocity = WALKING_SPEED;
    }

    super.update();
  }

  private initialiseProperties() {
    this.velocity = 0;
    this.puzzleTypes = structuredClone(PUZZLE_TYPES);
  }

  private initializeControls() {
    if (isTouchDevice()) {
      this.portalService?.send("SET_JOYSTICK_ACTIVE", {
        isJoystickActive: true,
      });
    }
  }

  private initialiseEvents() {
    EventBus.on("close-puzzle", (id: number) => {
      this.moveToNextPuzzlePoint(PATH_PUZZLE_POINTS[id]);
    });

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

  private loadBumpkinAnimations() {
    if (!this.currentPlayer) return;
    if (!this.cursorKeys) return;

    const animation = this.isMoving ? "walk" : "idle";

    this.currentPlayer[animation]?.();
  }

  private createPuzzlePoints() {
    PUZZLE_POINTS_CONFIG.forEach((config, i) => {
      new PuzzlePoint({
        x: config.x,
        y: config.y,
        scene: this,
        id: i + 1,
        difficulty: config.difficulty,
        player: this.currentPlayer,
      });
    });
  }

  private moveToNextPuzzlePoint(path: { x: number; y: number }[]) {
    if (!this.currentPlayer || !path) return;

    const tweens: any[] = [];

    path.forEach((nextPoint, i) => {
      const currentPoint = path[i - 1] ?? this.currentPlayer;
      const distance = Phaser.Math.Distance.BetweenPoints(
        currentPoint,
        nextPoint,
      );

      const duration = (distance / WALKING_SPEED) * 1000;

      tweens.push({
        targets: this.currentPlayer,
        x: nextPoint.x,
        y: nextPoint.y,
        duration: duration,
        onStart: () => {
          if (!this.currentPlayer) return;
          if (nextPoint.x < currentPoint.x) {
            this.currentPlayer.faceLeft();
          } else {
            this.currentPlayer.faceRight();
          }
          this.currentPlayer.walk();
        },
        onUpdate: () => {
          this.currentPlayer?.walk();
        },
        onComplete: () => {
          this.currentPlayer?.idle();
        },
      });
    });

    this.tweens.chain({ targets: this.currentPlayer, tweens });
  }
}
