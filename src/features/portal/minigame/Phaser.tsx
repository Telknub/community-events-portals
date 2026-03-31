import React, { useContext, useEffect, useRef } from "react";
import { Game, AUTO } from "phaser";
import NinePatchPlugin from "phaser3-rex-plugins/plugins/ninepatch-plugin.js";
import VirtualJoystickPlugin from "phaser3-rex-plugins/plugins/virtualjoystick-plugin.js";

import { Preloader } from "features/world/scenes/Preloader";
import { PortalContext } from "./lib/PortalProvider";
import { useActor } from "@xstate/react";
import { Scene } from "./Scene";
import { NPCModals } from "./components/npcs/NPCModals";
import { InteractableModals } from "./components/interactables/InteractableModals";
import { PORTAL_NAME } from "./Constants";

export const Phaser: React.FC = () => {
  const { portalService } = useContext(PortalContext);
  const [portalState] = useActor(portalService);

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
      width: Math.max(window.innerWidth, window.innerHeight),
      height: Math.min(window.innerWidth, window.innerHeight),

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

    // Fix pointer events mapping for when the container is CSS-rotated
    const inputManager = game.current.input as any;
    if (inputManager && typeof inputManager.transformPointer === "function") {
      const origTransformPointer = inputManager.transformPointer.bind(inputManager);
      inputManager.transformPointer = function (
        pointer: any,
        pageX: number,
        pageY: number,
        wasMove: boolean
      ) {
        if (window.innerHeight > window.innerWidth) {
          // Hardware is portrait but CSS rotated 90deg clockwise.
          const w = window.innerWidth;

          const scaleManager = game.current?.scale as any;
          if (!scaleManager) {
            origTransformPointer(pointer, pageY, w - pageX, wasMove);
            return;
          }

          const scaleX = scaleManager.displayScale?.x || 1;
          const scaleY = scaleManager.displayScale?.y || 1;
          const bounds = scaleManager.canvasBounds || scaleManager.bounds || { left: 0, top: 0 };
          const boundsLeft = bounds.left || 0;
          const boundsTop = bounds.top || 0;

          // Target logical coords we want Phaser to end up with:
          const logicalX = pageY;
          const logicalY = w - pageX;

          // Inverse map them through Phaser's internal distorted physical scaling matrix
          const pageXFake = (logicalX / scaleX) + boundsLeft;
          const pageYFake = (logicalY / scaleY) + boundsTop;

          origTransformPointer(pointer, pageXFake, pageYFake, wasMove);
        } else {
          origTransformPointer(pointer, pageX, pageY, wasMove);
        }
      };
    }

    game.current.registry.set("initialScene", scene);
    game.current.registry.set("gameState", portalState.context.state);
    game.current.registry.set("id", portalState.context.id);
    game.current.registry.set("portalService", portalService);

    return () => {
      game.current?.destroy(true);
    };
  }, []);

  const ref = useRef<HTMLDivElement>(null);

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
