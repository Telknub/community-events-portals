import React, { useState, useEffect, useCallback } from "react";
import { StatusBar } from "../hud/StatusBar";
import { SNOW } from "../../Constants";
import redRibbon from "public/world/portal/images/bow.webp";

// --- Constants & Types ---

type Difficulty = "easy" | "hard";

const DIRT_PATH = "/world/portal/images/dirt_path.png";
const DIRT_PATH_CURVE = "/world/portal/images/dirt_path_curve.png";
const START_SLEDGE = "/world/portal/images/sledge.png";
const END_LIGHTHOUSE = "/world/portal/images/lighthouse.png";

const GRID_SIZES: Record<Difficulty, number> = {
  easy: 5,
  hard: 7,
};

// Pipe definitions
// Directions: 0: North, 1: East, 2: South, 3: West
// Pipe 'Straight' normal: North-South (connects 0 and 2) or East-West (1 and 3)
// Pipe 'Corner' normal: North-East (connects 0 and 1)

type PipeType = "straight" | "corner";

interface PipeTile {
  row: number;
  col: number;
  type: PipeType;
  rotation: number; // 0, 1, 2, 3 (x 90 degrees clockwise)
  isFixed: boolean;
  isFilled: boolean; // Part of the active flow
  isStart?: boolean;
  isEnd?: boolean;
}

interface Props {
  onClose: () => void;
  onComplete: () => void;
  difficulty?: Difficulty;
  seconds: number;
  onReset: () => void;
}

// Helper: Get connections for a pipe based on its type and rotation
// Returns array of directions [North, East, South, West] (boolean)
const getConnections = (type: PipeType, rotation: number): boolean[] => {
  // Base connections for rotation 0
  let base = [false, false, false, false];

  if (type === "straight") {
    // North-South (0 and 2)
    base = [true, false, true, false];
  } else if (type === "corner") {
    // North-East (0 and 1)
    base = [true, true, false, false];
  }

  // Rotate 'rotation' times (clockwise)
  // 1 rotation: North(0) -> East(1), East(1) -> South(2), ...
  // new[i] = old[(i - rotation + 4) % 4] 
  // Wait, if I rotate 90 deg clockwise (1): 
  // North connection moves to East.
  // So connected[1] = base[0]. 
  // Generally: connected[(d + rotation) % 4] = base[d]

  const connected = [false, false, false, false];
  for (let i = 0; i < 4; i++) {
    if (base[i]) {
      connected[(i + rotation) % 4] = true;
    }
  }

  return connected;
};

export const PipePuzzle: React.FC<Props> = ({ onClose, onComplete, difficulty = "easy", seconds, onReset }) => {
  const [grid, setGrid] = useState<PipeTile[][]>([]);
  const [gridSize, setGridSize] = useState<number>(GRID_SIZES[difficulty]);
  const [isComplete, setIsComplete] = useState<boolean>(false);

  const MAX_CELL_SIZE = 60;
  const [cellSize, setCellSize] = useState<number>(MAX_CELL_SIZE);


  // Initialize Game
  const initGame = useCallback(() => {
    const size = GRID_SIZES[difficulty];
    setGridSize(size);
    setIsComplete(false);

    // 1. Generate Empty Grid
    const newGrid: PipeTile[][] = Array.from({ length: size }, (_, r) =>
      Array.from({ length: size }, (_, c) => ({
        row: r,
        col: c,
        type: "straight",
        rotation: 0,
        isFixed: false,
        isFilled: false,
      }))
    );

    // 2. Generate Guide Path (DFS)
    const visited = new Set<string>();
    const path: { r: number; c: number }[] = [];

    // Helper to find random path
    const buildPath = (r: number, c: number): boolean => {
      path.push({ r, c });
      visited.add(`${r},${c}`);

      if (r === size - 1 && c === size - 1) {
        return true;
      }

      // Shuffle directions: Down, Right, Left, Up (bias towards Down/Right for progress)
      const dirs = [
        { dr: 1, dc: 0 }, // Down
        { dr: 0, dc: 1 }, // Right
        { dr: -1, dc: 0 }, // Up
        { dr: 0, dc: -1 }, // Left
      ].sort(() => Math.random() - 0.5);

      for (const { dr, dc } of dirs) {
        const nr = r + dr;
        const nc = c + dc;
        if (
          nr >= 0 && nr < size && nc >= 0 && nc < size &&
          !visited.has(`${nr},${nc}`)
        ) {
          if (buildPath(nr, nc)) return true;
        }
      }

      path.pop();
      return false;
    };

    // Retry path generation until successful
    let tries = 0;
    while (!buildPath(0, 0) && tries < 100) {
      visited.clear();
      path.length = 0;
      tries++;
    }

    // 3. Set Pipe Types based on Path
    for (let i = 0; i < path.length; i++) {
      const curr = path[i];
      const prev = i > 0 ? path[i - 1] : { r: -1, c: 0 }; // Start enters from North (-1, 0)
      const next = i < path.length - 1 ? path[i + 1] : { r: size, c: size - 1 }; // End exits to South (size, size-1)

      const tile = newGrid[curr.r][curr.c];

      // Determine entry and exit relative to current
      // Directions: 0:N, 1:E, 2:S, 3:W
      const getDir = (from: { r: number, c: number }, to: { r: number, c: number }) => {
        if (to.r < from.r) return 0; // North
        if (to.c > from.c) return 1; // East
        if (to.r > from.r) return 2; // South
        if (to.c < from.c) return 3; // West
        return -1;
      };

      const dirFromPrev = getDir(curr, prev);
      const dirToNext = getDir(curr, next);

      // Normalize directions needed:
      const needed = [false, false, false, false];
      if (dirFromPrev !== -1) needed[dirFromPrev] = true;
      else needed[0] = true; // Start default input from North

      if (dirToNext !== -1) needed[dirToNext] = true;
      else needed[2] = true; // End default output to South

      // Decide Type and Rotation
      // Straight: (0,2) or (1,3)
      // Corner: (0,1), (1,2), (2,3), (3,0)

      if ((needed[0] && needed[2]) || (needed[1] && needed[3])) {
        tile.type = "straight";
        tile.rotation = needed[0] ? 0 : 1; // 0=NS, 1=EW
      } else {
        tile.type = "corner";
        if (needed[0] && needed[1]) tile.rotation = 0;      // N(0)+E(1)
        else if (needed[1] && needed[2]) tile.rotation = 1; // E(1)+S(2) 
        else if (needed[2] && needed[3]) tile.rotation = 2; // S(2)+W(3)
        else tile.rotation = 3;                             // W(3)+N(0)
      }

      // Mark Start and End
      if (i === 0) {
        tile.isStart = true;
        tile.isFixed = true;
      } else if (i === path.length - 1) {
        tile.isEnd = true;
        tile.isFixed = true;
      }
    }

    // 4. Fill Empty Spots with Random
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const tile = newGrid[r][c];
        const isPath = path.some(p => p.r === r && p.c === c);

        if (!isPath) {
          tile.type = Math.random() > 0.5 ? "straight" : "corner";
          tile.rotation = Math.floor(Math.random() * 4);
        } else if (!tile.isFixed) {
          // Scramble Path Pipes
          // Ensure we don't accidentally solve it immediately
          let rnd = Math.floor(Math.random() * 4);
          tile.rotation = (tile.rotation + rnd) % 4;
        }
      }
    }

    // Initial Flow Check
    const finalGrid = checkFlow(newGrid, size);
    setGrid(finalGrid.grid);
  }, [difficulty]);

  // Check Flow (BFS) - Returns updated grid and success flag
  const checkFlow = (currentGrid: PipeTile[][], size: number): { grid: PipeTile[][], success: boolean } => {
    const nextGrid = currentGrid.map(row => row.map(tile => ({ ...tile, isFilled: false })));

    const queue: { r: number, c: number }[] = [];
    const visited = new Set<string>();

    const startTile = nextGrid[0][0];
    const startConns = getConnections(startTile.type, startTile.rotation);

    // Start assumed to input from North (0). If tile has connector at North, it's valid entry.
    if (startConns[0]) {
      startTile.isFilled = true;
      queue.push({ r: 0, c: 0 });
      visited.add("0,0");
    }

    let reachedEnd = false;

    while (queue.length > 0) {
      const { r, c } = queue.shift()!;
      const currTile = nextGrid[r][c];
      const currConns = getConnections(currTile.type, currTile.rotation);

      // Check Neighbors
      const dirs = [
        { dr: -1, dc: 0, idx: 0, opp: 2 }, // North (neighbor is Up, requires South connection)
        { dr: 0, dc: 1, idx: 1, opp: 3 },  // East
        { dr: 1, dc: 0, idx: 2, opp: 0 },  // South
        { dr: 0, dc: -1, idx: 3, opp: 1 }, // West
      ];

      for (const { dr, dc, idx, opp } of dirs) {
        if (currConns[idx]) {
          const nr = r + dr;
          const nc = c + dc;

          if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
            const neighbor = nextGrid[nr][nc];
            if (!visited.has(`${nr},${nc}`)) {
              const neighConns = getConnections(neighbor.type, neighbor.rotation);
              if (neighConns[opp]) {
                neighbor.isFilled = true;
                visited.add(`${nr},${nc}`);
                queue.push({ r: nr, c: nc });
              }
            }
          } else {
            // Check End Condition
            // If we are exiting the grid from the End Tile
            // We configured End to exit South (2).
            if (currTile.isEnd && idx === 2) {
              reachedEnd = true;
            }
          }
        }
      }
    }

    return { grid: nextGrid, success: reachedEnd };
  };

  useEffect(() => {
    initGame();
  }, [initGame]);

  useEffect(() => {
    const handleResize = () => {
      // Calculate available width
      // Container padding (20px*2) + Safety margin
      const padding = difficulty === "easy" ? 200 : 60;
      const safeWidth = window.innerWidth - padding;
      const calculatedCellSize = Math.floor(Math.min(safeWidth / gridSize, MAX_CELL_SIZE));
      setCellSize(Math.max(calculatedCellSize, 20)); // Min 20px
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Initial calculation

    return () => window.removeEventListener("resize", handleResize);
  }, [gridSize]);

  const handleRotate = (r: number, c: number) => {
    if (isComplete) return;
    const tile = grid[r][c];
    if (tile.isFixed) return;

    const newRow = [...grid[r]];
    newRow[c] = {
      ...tile,
      rotation: tile.rotation + 1,
    };

    const newGrid = [...grid];
    newGrid[r] = newRow;

    const result = checkFlow(newGrid, gridSize);
    setGrid(result.grid);

    if (result.success && !isComplete) {
      setIsComplete(true);
      onComplete(); // Trigger win action
      SNOW();
    }
  };

  // --- Render Assets (SVG Patterns) ---
  // --- Render Assets (SVG Patterns) ---

  return (
    <div className="fixed inset-0 bg-white-200 z-0 backdrop-blur-sm">
      <div className="relative text-[#265c42] flex flex-col items-center justify-center w-full h-full">
        <div>
          <div className="relative w-full top-16 flex justify-center z-20">
            <img className="w-[6rem] md:w-[8rem] " src={redRibbon} />
          </div>
          <div
            className="p-3 border-[1rem] border-[#a22633] rounded-t-[2.5rem]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg, #3e8948 0 15px, #ffffff 5px 25px, #a22633 10px 35px)",
            }}
          >
            <StatusBar seconds={seconds} onReset={onReset} />
            <div
              style={{
                width: "fit-content",
                justifySelf: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "20px",
                paddingRight: difficulty === "easy" ? "70px" : "20px",
                paddingLeft: difficulty === "easy" ? "70px" : "20px",
                paddingTop: difficulty === "easy" ? "40px" : "20px",
                background: "#87cfee",
                fontFamily: "Arial, sans-serif",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: `repeat(${gridSize}, ${cellSize}px)`,
                  gap: "0px",
                  borderRadius: "4px",
                  backgroundColor: "#87cfee",
                  position: "relative",
                  userSelect: "none",
                }}
              >
                {isComplete && (
                  <div style={{
                    position: "absolute",
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: "rgba(0,0,0,0.6)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#FFF",
                    fontSize: "35px",
                    fontWeight: "bold",
                    zIndex: 10,
                    textShadow: "0 2px 4px black",
                    flexDirection: "column",
                    fontFamily: "Basic",
                  }}>
                    <span>🎉Happy Holidays!🎉</span>
                  </div>
                )}

                {grid.map((row, r) =>
                  row.map((tile, c) => (
                    <div
                      key={`${r}-${c}`}
                      onClick={() => handleRotate(r, c)}
                      style={{
                        width: cellSize,
                        height: cellSize,
                        boxSizing: "border-box",
                        cursor: tile.isFixed ? "default" : "pointer",
                        position: "relative",
                      }}
                    >
                      {/* Dirt Path Image */}
                      <img
                        src={tile.type === "straight" ? DIRT_PATH : DIRT_PATH_CURVE}
                        alt="path"
                        style={{
                          width: "100%",
                          height: "100%",
                          transform: `rotate(${tile.rotation * 90}deg)`,
                          transition: "transform 0.3s ease",
                          opacity: tile.isFixed ? 0.9 : 1,
                          filter: tile.isFilled ? "brightness(1.2)" : "none",
                          pointerEvents: "none",
                        }}
                      />

                      {/* Start Marker */}
                      {tile.isStart && (
                        <img
                          src={START_SLEDGE}
                          alt="Start"
                          style={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                            zIndex: 2,
                            pointerEvents: "none",
                          }}
                        />
                      )}
                      {/* End Marker */}
                      {tile.isEnd && (
                        <img
                          src={END_LIGHTHOUSE}
                          alt="End"
                          style={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            width: "80%",
                            height: "80%",
                            objectFit: "contain",
                            zIndex: 2,
                            pointerEvents: "none",
                          }}
                        />
                      )}
                      {/* Fixed Pin */}
                      {tile.isFixed && !tile.isStart && !tile.isEnd && (
                        <div style={{
                          position: "absolute", top: 4, left: 4,
                          width: 8, height: 8,
                          background: "#95a5a6", borderRadius: "50%",
                          opacity: 0.8,
                          zIndex: 2,
                          pointerEvents: "none",
                        }} />
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Legend */}
              <div style={{ marginTop: "10px", display: "flex", gap: "10px", color: "#34577c", fontSize: "30px", fontFamily: "Basic" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <img
                    src={START_SLEDGE}
                    alt="Start"
                    style={{
                      width: "50px",
                      height: "50px",
                      objectFit: "contain",
                    }}
                  />
                  Start
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <img
                    src={END_LIGHTHOUSE}
                    alt="End"
                    style={{
                      width: "30px",
                      height: "30px",
                      objectFit: "contain",
                    }}
                  />
                  End
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
