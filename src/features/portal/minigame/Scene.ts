import mapJson from "assets/map/christmas2026.json";
import tilesetconfig from "assets/map/tileset_christmas26.json";
import { SceneId } from "features/world/mmoMachine";
import { BaseScene } from "./Core/BaseScene";
import { MachineInterpreter } from "./lib/Machine";
import { EventObject } from "xstate";
import { isTouchDevice } from "features/world/lib/device";
import {
  NEXT_DIFFICULTY_PUZZLE,
  PATH_PUZZLE_POINTS,
  PORTAL_NAME,
  PUZZLE_POINTS_CONFIG,
  PUZZLE_TYPES,
  PuzzleDifficulty,
  PuzzleName,
  WALKING_SPEED,
} from "./Constants";
import { EventBus } from "./lib/EventBus";
import { NPCBumpkin } from "features/world/scenes/BaseScene";
import { PuzzlePoint } from "./containers/PuzzlePoint";
import { interactableModalManager } from "./components/interactables/InteractableModals";
import { SQUARE_WIDTH } from "features/game/lib/constants";
import { SantaSleigh } from "./containers/SantaSleigh";
import { Present } from "./containers/Presents";

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
  private santaSleighs: SantaSleigh[] = [];
  private presents: Present[] = [];
  private catchEnabled = false;
  private puzzleOpen = false;
  private puzzleCount = 0;
  private nextPuzzleScore = 0;
  private readonly POINTS_PER_PUZZLE = 10;

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
    this.load.image("santa_sleigh", "/world/portal/images/Xmas_Boat_21.webp");
    this.load.image("present", "/world/portal/images/SudokuPresent.webp");
    // Music
    // Background
    this.load.audio(
      "backgroundMusic",
      "/world/portal/music/SunflowerChristmas.mp3",
    );

    // Points
    this.load.image("point", "/world/portal/images/point.png");
    this.load.image("checkpoint", "/world/portal/images/checkpoint.png");

    // Heart
    this.load.image("heart", "/world/portal/images/heart.png");
  }

  async create() {
    this.map = this.make.tilemap({
      key: PORTAL_NAME,
    });
    super.create();

    // Stop BaseScene from following the player
    const cam = this.cameras.main;
    cam.stopFollow();

    // Reset listeners
    EventBus.removeAllListeners();

    // Initialise
    this.initialiseProperties();
    this.initializeControls();
    this.initialiseTouchCamera();
    this.initialiseEvents();
    this.initialiseFontFamily();

    this.createSantaSleigh();
    this.createPresent();

    // Config
    this.input.addPointer(3);

    // Background music
    if (this.backgroundMusic) {
      this.backgroundMusic.stop();
    }

    this.backgroundMusic = this.sound.add("backgroundMusic", {
      loop: true,
      volume: 0.1,
    });
    this.backgroundMusic.play();

    this.events.on("shutdown", () => {
      this.backgroundMusic?.stop();
    });

    if (!this.physics.world.debugGraphic) {
      this.physics.world.createDebugGraphic();
    }
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
          name.setScale(0.4);
          name.setDepth(10000000000000);
        }
      }
    }

    // Create minigame
    // this.createPuzzlePoints();
  }

  update() {
    if (this.isGamePlaying) {
      // The game has started
      this.loadBumpkinAnimations();
      this.velocity = WALKING_SPEED;
      this.santaSleighs.forEach((sleigh) => sleigh.start());
      this.presents.forEach((present) => present.start());
    } else if (this.isGameReady) {
      this.portalService?.send("START");
      this.velocity = WALKING_SPEED;
    }

    super.update();
  }

  private initialiseProperties() {
    this.velocity = this.isGamePlaying ? WALKING_SPEED : 0;
    this.puzzleTypes = structuredClone(PUZZLE_TYPES);
  }

  private initializeControls() {
    if (isTouchDevice()) {
      this.portalService?.send("SET_JOYSTICK_ACTIVE", {
        isJoystickActive: true,
      });
    }
  }

  private initialiseTouchCamera() {
    if (isTouchDevice()) {
      this.cameras.main.setZoom(2);
      const cam = this.cameras.main;
      cam.centerOn(this.map.widthInPixels / 1.875, this.map.heightInPixels / 1);
    }
  }

  private getScore(): number {
    return this.portalService?.state.context.score ?? 0;
  }

  private setCatchEnabled(enabled: boolean) {
    this.catchEnabled = enabled;
    this.presents = this.presents.filter((p) => p.active);
    this.presents.forEach((p) => {
      p.canCatch = enabled;
    });
  }

  private checkPuzzleTrigger() {
    if (this.puzzleOpen) return;
    if (this.getScore() < this.nextPuzzleScore) return;

    this.puzzleOpen = true;
    this.setCatchEnabled(false); // puzzle opened: scoring stops

    const puzzleType =
      PUZZLE_TYPES[Math.floor(Math.random() * PUZZLE_TYPES.length)];

    interactableModalManager.open("puzzle", {  
      id: this.puzzleCount + 1,                
      puzzleType,
    });
  }

  // --- events ---
  private initialiseEvents() {
    this.puzzleOpen = false;
    this.puzzleCount = 0;
    this.nextPuzzleScore = this.getScore() + this.POINTS_PER_PUZZLE;
    this.setCatchEnabled(true);

    // Open a puzzle each time the score reaches the target
    const scoreSub = this.portalService?.subscribe(() => {
      this.checkPuzzleTrigger();
    });

    // Puzzle closed solved scoring resumes
    const onPuzzleDone = () => {
      if (!this.puzzleOpen) return; 
      this.puzzleOpen = false;
      this.puzzleCount++;
      this.nextPuzzleScore = this.getScore() + this.POINTS_PER_PUZZLE;
      this.setCatchEnabled(true);
    };
    EventBus.on("close-puzzle", onPuzzleDone);
    EventBus.on("hurt-player", onPuzzleDone);
    EventBus.on("puzzle-closed", onPuzzleDone); 

    const onNextLevel = () => {
      const lives = this.portalService?.state.context.lives || 0;
      if (lives <= 0) return;

      const currentDifficulty = this.portalService?.state.context
        .difficulty as PuzzleDifficulty;
      const nextDifficulty = NEXT_DIFFICULTY_PUZZLE[currentDifficulty];
      if (!nextDifficulty) return; //

      // this.cameras.main.fadeOut(500);
      this.portalService?.send("SET_DIFFICULTY", { difficulty: nextDifficulty });

      this.cameras.main.once("camerafadeoutcomplete", () => {
        interactableModalManager.open("difficulty-message", {
          difficulty: nextDifficulty,
        });
        this.time.delayedCall(2000, () => {
          interactableModalManager.open(undefined);
          this.cameras.main.fadeIn(500);
          this.scene.restart();
        });
      });
    };
    EventBus.on("next-level", onNextLevel);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      scoreSub?.unsubscribe();
      EventBus.off("close-puzzle", onPuzzleDone);
      EventBus.off("hurt-player", onPuzzleDone);
      EventBus.off("puzzle-closed", onPuzzleDone);
      EventBus.off("next-level", onNextLevel);
    });
  }

  // private initialiseEvents() {
  //   EventBus.on("close-puzzle", (id: number) => {
  //     this.moveToNextPuzzlePoint(PATH_PUZZLE_POINTS[id]);
  //   });
  //   EventBus.on("hurt-player", (id: number) => {
  //     this.moveToNextPuzzlePoint(PATH_PUZZLE_POINTS[id]);
  //   });
  //   EventBus.on("next-level", () => {
  //     const lives = this.portalService?.state.context.lives || 0;
  //     if (lives <= 0) return;
  //     this.cameras.main.fadeOut(500);
  //     const currentDifficulty = this.portalService?.state.context
  //       .difficulty as PuzzleDifficulty;
  //     this.portalService?.send("SET_DIFFICULTY", {
  //       difficulty: NEXT_DIFFICULTY_PUZZLE[currentDifficulty],
  //     });
  //     this.cameras.main.on(
  //       "camerafadeoutcomplete",
  //       () => {
  //         interactableModalManager.open("difficulty-message", {
  //           difficulty: NEXT_DIFFICULTY_PUZZLE[currentDifficulty],
  //         });
  //         setTimeout(() => {
  //           interactableModalManager.open(undefined);
  //           this.cameras.main.fadeIn(500);
  //           this.scene.restart();
  //         }, 2000);
  //       },
  //       this,
  //     );
  //   });

  //   // reload scene when player hit retry
  //   const onRetry = (event: EventObject) => {
  //     if (event.type === "RETRY") {
  //       this.scene.restart();
  //     }
  //   };
  //   this.portalService?.onEvent(onRetry);

  //   // Restart scene when player hit start
  //   const onContinue = (event: EventObject) => {
  //     if (event.type === "CONTINUE") {
  //       this.scene.restart();
  //     }
  //   };
  //   this.portalService?.onEvent(onContinue);

  //   // Restart scene when player hit start training
  //   const onContinueTraining = (event: EventObject) => {
  //     if (event.type === "CONTINUE_TRAINING") {
  //       this.scene.restart();
  //     }
  //   };
  //   this.portalService?.onEvent(onContinueTraining);
  // }

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

  private createSantaSleigh() {
    const config = [
      {
        x: 20 * SQUARE_WIDTH,
        y: 12 * SQUARE_WIDTH,
        endX: 40 * SQUARE_WIDTH,
        flip: false,
        delay: 0,
        repeatDelay: 1000,
      },
      {
        x: 40 * SQUARE_WIDTH,
        y: 14 * SQUARE_WIDTH,
        endX: 20 * SQUARE_WIDTH,
        flip: true,
        delay: 2500,
        repeatDelay: 2500,
      },
    ];

    this.santaSleighs = config.map(
      ({ x, y, endX, flip, delay, repeatDelay }) => {
        const sleigh = new SantaSleigh({
          x,
          y,
          endX,
          scene: this,
          delay,
          repeatDelay,
        });
        sleigh.setFlipX(flip);
        return sleigh;
      },
    );
  }

  private createPresent() {
    this.catchEnabled = true;

    this.presents = this.santaSleighs.flatMap((sleigh) =>
      [0, 1].map(() => {
        const present = new Present({
          scene: this,
          sleigh,
          player: this.currentPlayer,
        });
        present.canCatch = this.catchEnabled;
        return present;
      }),
    );
  }
}
