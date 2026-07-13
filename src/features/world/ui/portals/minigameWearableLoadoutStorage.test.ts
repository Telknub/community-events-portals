import {
  getIframeOrigin,
  getWearableLoadoutsStorageKey,
  handleMinigameWearableLoadoutStorageMessage,
} from "./minigameWearableLoadoutStorage";

const portalName = "colors-2026";
const farmId = 123;
const expectedOrigin = "https://halloween.sunflower-land.com";

const makeMessage = ({
  data,
  source,
  origin = expectedOrigin,
}: {
  data: unknown;
  source: Window;
  origin?: string;
}) =>
  ({
    data,
    source,
    origin,
  }) as MessageEvent;

describe("minigame wearable loadout parent storage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("resolves the expected iframe origin from the loaded URL", () => {
    expect(getIframeOrigin(`${expectedOrigin}?jwt=token`)).toBe(expectedOrigin);
  });

  it("stores iframe loadouts under the parent origin key", () => {
    const iframeWindow = { postMessage: jest.fn() } as unknown as Window;
    const value = JSON.stringify({ version: 1, loadouts: {} });

    const handled = handleMinigameWearableLoadoutStorageMessage({
      event: makeMessage({
        source: iframeWindow,
        data: {
          event: "minigameStorage:setWearableLoadouts",
          portalName,
          farmId,
          value,
        },
      }),
      iframeWindow,
      expectedOrigin,
      portalName,
      farmId,
    });

    expect(handled).toBe(true);
    expect(
      localStorage.getItem(
        getWearableLoadoutsStorageKey({ portalName, farmId }),
      ),
    ).toBe(value);
  });

  it("responds to iframe loadout requests with the parent stored value", () => {
    const postMessage = jest.fn();
    const iframeWindow = { postMessage } as unknown as Window;
    const value = JSON.stringify({ version: 1, loadouts: {} });
    localStorage.setItem(
      getWearableLoadoutsStorageKey({ portalName, farmId }),
      value,
    );

    const handled = handleMinigameWearableLoadoutStorageMessage({
      event: makeMessage({
        source: iframeWindow,
        data: {
          event: "minigameStorage:getWearableLoadouts",
          requestId: "request-1",
          portalName,
          farmId,
        },
      }),
      iframeWindow,
      expectedOrigin,
      portalName,
      farmId,
    });

    expect(handled).toBe(true);
    expect(postMessage).toHaveBeenCalledWith(
      {
        event: "minigameStorage:wearableLoadouts",
        requestId: "request-1",
        value,
      },
      expectedOrigin,
    );
  });

  it("ignores storage messages from unexpected origins", () => {
    const iframeWindow = { postMessage: jest.fn() } as unknown as Window;

    const handled = handleMinigameWearableLoadoutStorageMessage({
      event: makeMessage({
        source: iframeWindow,
        origin: "https://evil.example",
        data: {
          event: "minigameStorage:setWearableLoadouts",
          portalName,
          farmId,
          value: "malicious",
        },
      }),
      iframeWindow,
      expectedOrigin,
      portalName,
      farmId,
    });

    expect(handled).toBe(true);
    expect(
      localStorage.getItem(
        getWearableLoadoutsStorageKey({ portalName, farmId }),
      ),
    ).toBeNull();
  });
});
