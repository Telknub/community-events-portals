import React from "react";

import * as Auth from "features/auth/lib/Provider";
import { GameProvider } from "features/game/GameProvider";
import { PortalProvider } from "./minigame/lib/PortalProvider";
import { Ocean } from "features/world/ui/Ocean";
import { WalletProvider } from "features/wallet/WalletProvider";
import { Portal } from "./minigame/Portal";

export const PortalApp: React.FC = () => {
  return (
    <Auth.Provider>
      {/* WalletProvider - if you need to connect to a players wallet */}
      <WalletProvider>
        {/* PortalProvider - gives you access to a xstate machine which handles state management */}
        <PortalProvider>
          <GameProvider>
            <Ocean>
              <Portal />
            </Ocean>
          </GameProvider>
        </PortalProvider>
      </WalletProvider>
    </Auth.Provider>
  );
};
