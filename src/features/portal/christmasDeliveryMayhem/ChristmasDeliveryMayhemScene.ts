import mapJson from "assets/map/christmasDeliveryMayhem.json";
import tilesetconfig from "assets/map/christmas_tileset.json";
import { SceneId } from "features/world/mmoMachine";
import { BaseScene, WALKING_SPEED } from "features/world/scenes/BaseScene";
import { MachineInterpreter } from "./lib/christmasDeliveryMayhemMachine";
import {
  COALS_CONFIGURATION,
  GIFT_CONFIGURATION,
  BONFIRE_CONFIGURATION,
  ELVES_CONFIGURATION,
  GRIT_CONFIGURATION,
  SNOWSTORM_CONFIGURATION,
  Events,
  EVENT_DURATION,
} from "./ChristmasDeliveryMayhemConstants";
import { GiftContainer } from "./containers/GiftContainer";
import { BonfireContainer } from "./containers/BonfireContainer";
import { ElfContainer } from "./containers/ElfContainer";
import { GritContainer } from "./containers/GritContainer";
import { NewSnowStormContainer } from "./containers/SnowStormContainer";
import { CoalsContainer } from "./containers/CoalsContainer";
import { isArray } from "xstate/lib/utils";
import { EventObject } from "xstate";
import { SPAWNS } from "features/world/lib/spawn";
import { isTouchDevice } from "features/world/lib/device";

// export const NPCS: NPCBumpkin[] = [
//   {
//     x: 380,
//     y: 400,
//     // View NPCModals.tsx for implementation of pop up modal
//     npc: "portaller",
//   },
// ];

export class ChristmasDeliveryMayhemScene extends BaseScene {
  sceneId: SceneId = "christmas_delivery_mayhem";
  private gifts: GiftContainer[] = [];
  private elves: ElfContainer[] = [];
  private snowStorm!: NewSnowStormContainer;
  private gritContainer!: GritContainer;
  private coal: CoalsContainer[] = [];
  private currentEventName = "";
  private eventInitialDate: Date | null = null;
  private christmasEvents!: Record<
    Events,
    () => NewSnowStormContainer | GritContainer | CoalsContainer[] | null
  >;

  constructor() {
    super({
      name: "christmas_delivery_mayhem",
      map: {
        json: mapJson,
        imageKey: "christmas-tileset",
        defaultTilesetConfig: tilesetconfig,
      },
      audio: { fx: { walk_key: "dirt_footstep" } },
    });
  }

  preload() {
    super.preload();

    this.load.spritesheet("snowflake_icon", "world/snowflake_icon.png", {
      frameWidth: 13,
      frameHeight: 13,
    });

    this.load.spritesheet("grit_icon", "world/grit_icon.png", {
      frameWidth: 13,
      frameHeight: 12,
    });

    this.load.spritesheet("krampus", "world/krampus.webp", {
      frameWidth: 20,
      frameHeight: 19,
    });

    this.load.spritesheet(
      "coalspawn_spritesheet",
      "world/coalspawn_spritesheet.png",
      {
        frameWidth: 10,
        frameHeight: 30,
      },
    );

    this.load.spritesheet("coal", "world/coal.png", {
      frameWidth: 12,
      frameHeight: 12,
    });

    this.load.spritesheet(
      "snowstorm_left_final_tileset",
      "world/snowstorm_left_final_tileset.png",
      {
        frameWidth: 544,
        frameHeight: 320,
      },
    );

    this.load.spritesheet(
      "snowstorm_right_final_tileset_2",
      "world/snowstorm_right_final_tileset_2.png",
      {
        frameWidth: 544,
        frameHeight: 320,
      },
    );

    this.load.spritesheet(
      "snowstorm_final_tileset",
      "world/snowstorm_final_tileset.png",
      {
        frameWidth: 544,
        frameHeight: 320,
      },
    );

    this.load.spritesheet("Grit_Carrying", "world/Grit_Carrying.webp", {
      frameWidth: 25,
      frameHeight: 19,
    });

    this.load.spritesheet("Grit_escape", "world/Grit_escape.png", {
      frameWidth: 14,
      frameHeight: 17,
    });

    // Gifts
    this.load.spritesheet("gift_1", "world/gift_1.png", {
      frameWidth: 16,
      frameHeight: 18,
    });
    this.load.spritesheet("gift_2", "world/gift_2.png", {
      frameWidth: 16,
      frameHeight: 18,
    });
    this.load.spritesheet("gift_3", "world/gift_3.png", {
      frameWidth: 16,
      frameHeight: 18,
    });
    this.load.spritesheet("gift_4", "world/gift_4.png", {
      frameWidth: 16,
      frameHeight: 18,
    });
    this.load.spritesheet("gift_5", "world/gift_5.png", {
      frameWidth: 16,
      frameHeight: 18,
    });
    this.load.spritesheet("gift_6", "world/gift_6.png", {
      frameWidth: 16,
      frameHeight: 18,
    });

    // Bonfire
    this.load.spritesheet("bonfire", "world/bonfire.png", {
      frameWidth: 23,
      frameHeight: 40,
    });

    // Elves
    this.load.spritesheet("elf", "world/elf.png", {
      frameWidth: 20,
      frameHeight: 19,
    });

    // Emoticons
    this.load.spritesheet("happy", "world/happy.png", {
      frameWidth: 7,
      frameHeight: 8,
    });
    this.load.spritesheet("sad", "world/sad.png", {
      frameWidth: 7,
      frameHeight: 8,
    });

    //sounds
    this.load.audio("coal-sound", "world/sound-effects/coal-sound.mp3"); // done
    this.load.audio("grit-spawn", "world/sound-effects/grit-spawn.mp3"); // done
    this.load.audio("grit-die", "world/sound-effects/grit-die.mp3"); // done
    this.load.audio("gift-pickup", "world/sound-effects/gift-pickup.mp3"); // done
    this.load.audio("snow-storm", "world/sound-effects/snow-storm.mp3"); // doneddd
    this.load.audio("bad-sound", "world/sound-effects/bad-sound.mp3"); //done
    this.load.audio("good-sound", "world/sound-effects/good-sound.mp3"); //done
    this.load.audio("gift-gen", "world/sound-effects/gift-gen.mp3");
    //bg music
    this.load.audio("bg-music", "world/sound-effects/sunflower-christmas.mp3");
  }

  async create() {
    this.map = this.make.tilemap({
      key: "christmas_delivery_mayhem",
    });

    super.create();

    this.velocity = 0;

    this.initializeControls();
    this.createBonfires();
    this.createElves();
    this.createCoals();
    this.createSnowStorm();
    this.createGifts();
    this.createGrit();
    this.createEvents();
    this.snowStorm.normalSnowStorm();

    this.physics.world.drawDebug = false;

    // reload scene when player hit retry
    const onRetry = (event: EventObject) => {
      if (event.type === "RETRY") {
        this.isCameraFading = true;
        this.cameras.main.fadeOut(500);
        this.reset();
        this.cameras.main.on(
          "camerafadeoutcomplete",
          () => {
            this.cameras.main.fadeIn(500);
            this.velocity = WALKING_SPEED;
            this.isCameraFading = false;
          },
          this,
        );
      }
    };
    this.portalService?.onEvent(onRetry);
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

  update() {
    super.update();

    const lives = this.portalService?.state.context.lives || 0;
    if (lives <= 0) {
      // Game over
      this.isCameraFading = true;
      this.velocity = 0;
      this.time.delayedCall(1000, () => {
        this.portalService?.send("GAME_OVER");
      });
    } else {
      if (this.isGamePlaying) {
        // Activate event
        const eventName = this.portalService?.state.context.event || "";
        if (eventName !== "" && eventName !== this.currentEventName) {
          const event = this.christmasEvents[eventName]();
          if (!isArray(event)) {
            event?.activate();
          } else {
            event?.forEach((e) => e.activate());
          }
          this.currentEventName = eventName;
          this.eventInitialDate = new Date();
        }
        // Desactivate event
        const millisecondsLeftInEvent = this.secondsLeftInEvent() * 1000;
        if (millisecondsLeftInEvent >= EVENT_DURATION) {
          const event = this.christmasEvents[eventName]();
          if (!isArray(event)) {
            event?.desactivate();
          } else {
            event?.forEach((e) => e.desactivate());
          }
          this.currentEventName = "";
          this.eventInitialDate = null;
          this.portalService?.send("UPDATE_EVENT", { event: "" });
        }

        // Activate emoticon
        const isSnowStormActive = this.snowStorm?.isActive;
        if (isSnowStormActive) {
          this.snowStorm.speedDirection();
          this.snowStorm.emotionIndicator();
          this.snowStorm.updateEmoticonPosition();
        }
        const isGritActive = this.gritContainer?.isActive;
        if (isGritActive) {
          this.gritContainer.emotionIndicator();
          this.gritContainer.updateEmoticonPosition();
        }
      } else {
        this.velocity = 0;
      }

      if (this.isGameReady) {
        this.portalService?.send("START");
        this.velocity = WALKING_SPEED;
        this.initializeRequests();
        this.sound.play("bg-music", { loop: true, volume: 0.1 });
      }
    }
  }

  private initializeControls() {
    if (isTouchDevice()) {
      this.portalService?.send("SET_JOYSTICK_ACTIVE", {
        isJoystickActive: true,
      });
    }
  }

  private initializeRequests() {
    this.elves.forEach((elf) => {
      elf.destroyInfo();
      elf.createRequest();
    });
  }

  private reset() {
    this.currentPlayer?.setPosition(
      SPAWNS()[this.sceneId].default.x,
      SPAWNS()[this.sceneId].default.y,
    );
    this.gritContainer.desactivate();
    this.snowStorm.desactivate();
    this.coal.forEach((e) => e.desactivate());
    this.initializeRequests();
  }

  private secondsLeftInEvent() {
    const secondsLeft = !this.eventInitialDate
      ? -1000
      : Math.max(Date.now() - this.eventInitialDate.getTime(), 0) / 1000;
    return secondsLeft;
  }

  private createSnowStorm() {
    this.snowStorm = new NewSnowStormContainer({
      x: SNOWSTORM_CONFIGURATION.x,
      y: SNOWSTORM_CONFIGURATION.y,
      scene: this,
      player: this.currentPlayer,
    });
    // use activate() to activate
    this.snowStorm.desactivate();
  }

  private createGrit() {
    GRIT_CONFIGURATION.forEach((config) => {
      this.gritContainer = new GritContainer({
        x: config.x,
        y: config.y,
        scene: this,
        gifts: this.gifts,
        player: this.currentPlayer,
      });
      // use activate() to activate
      this.gritContainer.desactivate();
    });
  }

  private createCoals() {
    COALS_CONFIGURATION.forEach((config) => {
      const coal = new CoalsContainer({
        x: config.x,
        y: config.y,
        scene: this,
        player: this.currentPlayer,
      });
      this.coal.push(coal);
      // use activate() to deactivate
      coal.desactivate();
    });
  }

  private createGifts() {
    this.gifts = GIFT_CONFIGURATION.map(
      (config) =>
        new GiftContainer({
          x: config.x,
          y: config.y,
          scene: this,
          name: config.name,
          player: this.currentPlayer,
        }),
    );
  }

  private createBonfires() {
    BONFIRE_CONFIGURATION.forEach(
      (config) =>
        new BonfireContainer({
          x: config.x,
          y: config.y,
          scene: this,
          player: this.currentPlayer,
        }),
    );
  }

  private createElves() {
    this.elves = ELVES_CONFIGURATION.map(
      (config) =>
        new ElfContainer({
          x: config.x,
          y: config.y,
          scene: this,
          direction: config.direction,
          position: config.position,
          player: this.currentPlayer,
        }),
    );
  }

  private createEvents() {
    this.christmasEvents = {
      storm: () => this.snowStorm,
      krampus: () => this.coal,
      grit: () => this.gritContainer,
      "": () => null,
    };
  }

  //private setDefaultState() {}
}
