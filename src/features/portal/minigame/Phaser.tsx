import React, { useContext, useEffect, useRef } from "react";
import { Game, AUTO } from "phaser";
import NinePatchPlugin from "phaser3-rex-plugins/plugins/ninepatch-plugin.js";
import VirtualJoystickPlugin from "phaser3-rex-plugins/plugins/virtualjoystick-plugin.js";

import {
  SceneId,
  mmoMachine,
  MachineInterpreter as MMOMachineInterpreter,
} from "features/world/mmoMachine";
import * as AuthProvider from "features/auth/lib/Provider";
import { Context } from "features/game/GameProvider";

import { Preloader } from "features/world/scenes/Preloader";
import { PortalContext } from "./lib/PortalProvider";
import { useActor, useInterpret } from "@xstate/react";
import { Scene } from "./Scene";
import { NPCModals } from "./components/npcs/NPCModals";
import { InteractableModals } from "./components/interactables/InteractableModals";
import { PORTAL_NAME } from "./Constants";

export const Phaser: React.FC = () => {
  const { portalService } = useContext(PortalContext);
  const [portalState] = useActor(portalService);

  const { authService } = useContext(AuthProvider.Context);
  const [authState] = useActor(authService);

  const { gameService } = useContext(Context);
  const [gameState] = useActor(gameService);

  const mmoService = useInterpret(mmoMachine, {
    context: {
      jwt: authState.context.user.rawToken,
      farmId: gameState.context.farmId,
      bumpkin: gameState.context.state.bumpkin,
      pets: gameState.context.state.pets,
      faction: gameState.context.state.faction?.name,
      sceneId: (name ?? "plaza") as SceneId,
      experience: gameState.context.state.bumpkin?.experience ?? 0,
      isCommunity: true,
      moderation: gameState.context.moderation,
      username: gameState.context.state.username,
    },
  }) as unknown as MMOMachineInterpreter;

  const game = useRef<Game | null>(null);

  // This must match the key of your scene [PortalExampleScene]
  const scene = PORTAL_NAME;

  // Preloader is useful if you want to load the standard Sunflower Land assets + SFX
  const scenes = [Preloader, Scene];

  useEffect(() => {
    const config: Phaser.Types.Core.GameConfig = {
      type: AUTO,
      fps: {
        target: 30,
        smoothStep: true,
      },
      backgroundColor: "#000000",
      parent: "phaser-example",

      autoRound: true,
      pixelArt: true,
      plugins: {
        global: [
          {
            key: "rexNinePatchPlugin",
            plugin: NinePatchPlugin,
            start: true,
          },
          {
            key: "rexVirtualJoystick",
            plugin: VirtualJoystickPlugin,
            start: true,
          },
        ],
      },
      width: window.innerWidth,
      height: window.innerHeight,

      physics: {
        default: "arcade",
        arcade: {
          debug: true,
          gravity: { x: 0, y: 0 },
        },
      },
      scene: scenes,
      loader: {
        crossOrigin: "anonymous",
      },
    };

    game.current = new Game({
      ...config,
      parent: "game-content",
    });

    game.current.registry.set("mmoService", mmoService);
    game.current.registry.set("initialScene", scene);
    game.current.registry.set("gameState", portalState.context.state);
    game.current.registry.set("id", portalState.context.id);
    game.current.registry.set("portalService", portalService);

    return () => {
      game.current?.destroy(true);
    };
  }, []);

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    game.current?.registry.set(
      "mmoServer",
      mmoService.getSnapshot().context.server,
    );
  }, [mmoService.getSnapshot().context.server]);

  return (
    <div>
      <div id="game-content" ref={ref} />

      {/* Comment out if you don't want to use our standard Bumpkin NPCs + click interactions */}
      <NPCModals />

      {/* Comment out if you don't want to use pop up modals from in game interactables */}
      <InteractableModals />
    </div>
  );
};
