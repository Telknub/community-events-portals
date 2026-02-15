import React from "react";

import { PortalProvider } from "./minigame/lib/PortalProvider";
import { WalletProvider } from "features/wallet/WalletProvider";
import { Portal } from "./minigame/Portal";

export const PortalApp: React.FC = () => {
  return (
    // WalletProvider - if you need to connect to a players wallet
    <WalletProvider>
      {/* PortalProvider - gives you access to a xstate machine which handles state management */}
      <PortalProvider>
        <Portal />
      </PortalProvider>
    </WalletProvider>
  );
};
