import React from "react";
import { renderToStaticMarkup } from "react-dom/server.node";

let mockState: Record<string, unknown>;

jest.mock("@xstate/react", () => ({
  useSelector: (
    _service: unknown,
    selector: (state: Record<string, unknown>) => unknown,
  ) => selector(mockState),
}));

jest.mock("lib/i18n/useAppTranslations", () => ({
  useAppTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock("features/portal/actions/loadPortal", () => ({
  getUrl: () => undefined,
}));

jest.mock("features/auth/actions/login", () => ({
  decodeToken: () => ({ farmId: 0 }),
}));

jest.mock("../../constants", () => ({
  NO_WEARABLE_BUFF_SCORE_MULTIPLIER: 1.1,
  PORTAL_NAME: "colors-2026",
}));

jest.mock("../../lib/Utils", () => ({
  getAttemptsLeft: () => 1,
  isWithinRange: () => true,
}));

jest.mock("public/world/minigame/base/key.png", () => "key", {
  virtual: true,
});

jest.mock("./Attempts", () => ({
  Attempts: () => <div />,
}));

jest.mock("./Controls", () => ({
  Controls: () => <div />,
}));

jest.mock("./AbilityWearables", () => ({
  AbilityWearables: () => <div>ability-wearables</div>,
}));

jest.mock("./Prize", () => ({
  Prize: () => <div>prize</div>,
}));

jest.mock("components/ui/Button", () => ({
  Button: ({ children }: { children: React.ReactNode }) => (
    <button>{children}</button>
  ),
}));

jest.mock("components/ui/Label", () => ({
  Label: ({ children }: { children: React.ReactNode }) => (
    <span>{children}</span>
  ),
}));

jest.mock("components/ui/Panel", () => ({
  OuterPanel: ({ children }: { children: React.ReactNode }) => (
    <section>{children}</section>
  ),
}));

jest.mock("../../lib/PortalProvider", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require("react");

  return {
    PortalContext: React.createContext({ portalService: {} }),
  };
});

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PortalContext } = require("../../lib/PortalProvider");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { Mission } = require("./Mission");

describe("Mission", () => {
  beforeEach(() => {
    mockState = {
      context: {
        lastScore: 42,
        lastBaseScore: 42,
        lastScoreBonusApplied: false,
        jwt: null,
        state: {
          bumpkin: {
            equipped: {},
          },
          minigames: {
            games: {
              "colors-2026": {
                history: {},
                purchases: [],
              },
            },
          },
        },
      },
    };
  });

  it("shows only the final score for a completed training run", () => {
    const html = renderToStaticMarkup(
      <PortalContext.Provider value={{ portalService: {} as never }}>
        <Mission
          mode="introduction"
          showScore
          showOnlyScore
          showExitButton={false}
          confirmButtonText=""
          onConfirm={jest.fn()}
        />
      </PortalContext.Provider>,
    );

    expect(html).toContain("leaderboard.score");
    expect(html).toContain("42");
    expect(html).not.toContain("colors-2026.noWearableBuffScoreBonus");
    expect(html).not.toContain("colors-2026.bestToday");
    expect(html).not.toContain("colors-2026.bestAllTime");
    expect(html).not.toContain("ability-wearables");
    expect(html).not.toContain("prize");
  });
});
