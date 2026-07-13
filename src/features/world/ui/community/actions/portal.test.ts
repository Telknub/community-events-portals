const getStorageKeys = () => {
  const host = window.location.host.replace(/^www\./, "");
  const stable = `sb_wiz.zpc.minigame.${host}`;

  return {
    stable,
    legacy: `${stable}-${window.location.pathname}`,
  };
};

describe("portal minigame JWT storage", () => {
  beforeEach(() => {
    jest.resetModules();
    localStorage.clear();
    window.history.pushState({}, "", "/world/colors_island_2026");
  });

  it("stores JWT sessions under a route-independent key", () => {
    const { saveJWT } = require("./portal");
    const { stable, legacy } = getStorageKeys();

    saveJWT({ token: "portal-token", name: "colors-2026" });

    expect(JSON.parse(localStorage.getItem(stable) ?? "{}")).toEqual({
      "colors-2026": "portal-token",
    });
    expect(localStorage.getItem(legacy)).toBeNull();
  });

  it("migrates sessions from the legacy route-dependent key", () => {
    const { stable, legacy } = getStorageKeys();
    localStorage.setItem(
      legacy,
      JSON.stringify({ "colors-2026": "legacy-token" }),
    );

    const { saveJWT } = require("./portal");

    saveJWT({ token: "other-token", name: "chicken-rescue" });

    expect(JSON.parse(localStorage.getItem(stable) ?? "{}")).toEqual({
      "colors-2026": "legacy-token",
      "chicken-rescue": "other-token",
    });
  });

  it("removes both stable and legacy route-dependent sessions", () => {
    const { stable, legacy } = getStorageKeys();
    localStorage.setItem(stable, JSON.stringify({ "colors-2026": "token" }));
    localStorage.setItem(legacy, JSON.stringify({ "colors-2026": "token" }));

    const { removeMinigameJWTs } = require("./portal");

    removeMinigameJWTs();

    expect(localStorage.getItem(stable)).toBeNull();
    expect(localStorage.getItem(legacy)).toBeNull();
  });
});
