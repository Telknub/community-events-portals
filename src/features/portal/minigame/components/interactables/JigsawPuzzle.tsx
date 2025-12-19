import React, { useState, useEffect } from "react";
import { StatusBar } from "../hud/StatusBar";
import { JIGSAW_PUZZLE_DIFFICULTY, PORTAL_SOUNDS, PUZZLE_IMGS, PuzzleDifficulty, SNOW } from "../../Constants";
import redRibbon from "public/world/portal/images/bow.webp";

// --- Constants and Types ---

const GRID_SIZE = 4; // 4x4 = 16 pieces
const MAX_TILE_SIZE = 100; // Pixels per piece

// Interface to define the structure of a piece
interface Tile {
  id: number; // Unique ID: represents which part of the image it is (0-15)
  isFixed: boolean; // If true, the piece cannot be moved (difficulty aid)
}

interface Props {
  onClose: () => void;
  onComplete: () => void;
  difficulty: PuzzleDifficulty;
  seconds: number;
  onReset: () => void;
}

type DragSource = { type: "board"; index: number } | { type: "pool"; index: number };

export const JigsawPuzzle: React.FC<Props> = ({ onClose, onComplete, difficulty, seconds, onReset }) => {
  // State
  // The board can have empty slots (null)
  const [board, setBoard] = useState<(Tile | null)[]>([]);
  // Available pieces outside the board
  const [pool, setPool] = useState<Tile[]>([]);
  const [tileSize, setTileSize] = useState<number>(MAX_TILE_SIZE);

  const [isComplete, setIsComplete] = useState<boolean>(false);

  const [draggedItem, setDraggedItem] = useState<DragSource | null>(null);

  const [puzzleImg, setPuzzleImg] = useState<string>("");

  // --- Initialization Logic ---

  const initializeGame = (fixedCount: number): void => {
    const totalTiles = GRID_SIZE * GRID_SIZE;

    // 1. Create all theoretical pieces
    const allTiles: Tile[] = Array.from({ length: totalTiles }, (_, index) => ({
      id: index,
      isFixed: false,
    }));

    // 2. Determine random fixed indices
    const fixedIndices = new Set<number>();
    while (fixedIndices.size < fixedCount) {
      const randomIndex = Math.floor(Math.random() * totalTiles);
      fixedIndices.add(randomIndex);
    }

    // 3. Distribute pieces on Board (Fixed) and Pool (Movable)
    const newBoard: (Tile | null)[] = new Array(totalTiles).fill(null);
    const newPool: Tile[] = [];

    allTiles.forEach((tile) => {
      if (fixedIndices.has(tile.id)) {
        tile.isFixed = true;
        newBoard[tile.id] = tile; // Fixed ones go in their correct position
      } else {
        newPool.push(tile);
      }
    });

    // 4. Shuffle the pool
    newPool.sort(() => Math.random() - 0.5);

    setBoard(newBoard);
    setPool(newPool);
    setIsComplete(false);
  };

  const getPuzzleImg = (): void => {
    const randomIndex = Math.floor(Math.random() * PUZZLE_IMGS.length);
    const puzzleImg = PUZZLE_IMGS[randomIndex];
    setPuzzleImg(puzzleImg);
  };

  useEffect(() => {
    getPuzzleImg();
    initializeGame(JIGSAW_PUZZLE_DIFFICULTY[difficulty]);

    const handleResize = () => {
      // Calculate available width accounting for borders/padding
      // Frame border (15px*2) + Padding (1rem*2) + Outer border (1.5rem*2) + Gap + Safety
      // Approx 120-140px reduction from window width
      const safeWidth = window.innerWidth - 140;
      const calculatedTileSize = Math.floor(Math.min(safeWidth, MAX_TILE_SIZE * GRID_SIZE) / GRID_SIZE);
      setTileSize(Math.max(calculatedTileSize, 20)); // Min 20px
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Initial calculation

    return () => window.removeEventListener("resize", handleResize);
  }, [difficulty]);

  // --- Drag and Drop Handlers ---

  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    source: DragSource
  ): void => {
    // Check if fixed (only if coming from the board)
    if (source.type === "board") {
      const tile = board[source.index];
      if (tile?.isFixed || isComplete) {
        e.preventDefault();
        return;
      }
    }

    setDraggedItem(source);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  // Drop on a board cell
  const handleDropOnBoard = (
    e: React.DragEvent<HTMLDivElement>,
    targetIndex: number
  ): void => {
    e.preventDefault();
    if (!draggedItem) return;

    // Cannot drop over a fixed piece
    if (board[targetIndex]?.isFixed) return;

    const newBoard = [...board];
    const newPool = [...pool];

    let sourceTile: Tile;

    // 1. Get the source piece and remove it from its previous place
    if (draggedItem.type === "board") {
      // If dropped in the same place, do nothing
      if (draggedItem.index === targetIndex) return;

      sourceTile = newBoard[draggedItem.index] as Tile;
      newBoard[draggedItem.index] = null;
    } else {
      // Comes from the pool
      sourceTile = newPool[draggedItem.index];
      newPool.splice(draggedItem.index, 1);
    }

    // 2. Handle the piece that was already at the destination (if exists)
    const targetTile = newBoard[targetIndex];

    // 3. Place source piece at destination
    newBoard[targetIndex] = sourceTile;

    // 4. If there was a piece at destination, move it to where the other came from (Swap) or to the pool
    if (targetTile) {
      if (draggedItem.type === "board") {
        // Swap on the board
        newBoard[draggedItem.index] = targetTile;
      } else {
        // The piece that was on the board goes back to the pool
        newPool.push(targetTile);
      }
    }

    setBoard(newBoard);
    setPool(newPool);
    setDraggedItem(null);
    PORTAL_SOUNDS.click.play();
    checkWinCondition(newBoard);
  };

  // Drop in the pool area (remove from board)
  const handleDropOnPool = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    if (!draggedItem) return;

    // If already from the pool, do nothing (reordering optional)
    if (draggedItem.type === "pool") return;

    // Comes from the board -> Move to the pool
    const newBoard = [...board];
    const newPool = [...pool];

    const tile = newBoard[draggedItem.index];
    if (tile && !tile.isFixed) {
      newBoard[draggedItem.index] = null;
      newPool.push(tile); // Add to pool

      setBoard(newBoard);
      setPool(newPool);
      PORTAL_SOUNDS.click.play();
      checkWinCondition(newBoard);
    }
    setDraggedItem(null);
  };

  const checkWinCondition = (currentBoard: (Tile | null)[]): void => {
    // We win if there are no empty slots and each ID matches the index
    const isWin = currentBoard.every((tile, index) => tile !== null && tile.id === index);
    if (isWin) {
      setIsComplete(true);
      onComplete();
      SNOW();
      PORTAL_SOUNDS.win.play();
    };
  };

  // --- Styles ---

  const getBackgroundStyle = (id: number): React.CSSProperties => {
    const row = Math.floor(id / GRID_SIZE);
    const col = id % GRID_SIZE;

    return {
      backgroundImage: `url(${puzzleImg})`,
      backgroundPosition: `-${col * tileSize}px -${row * tileSize}px`,
      backgroundSize: `${GRID_SIZE * tileSize}px ${GRID_SIZE * tileSize}px`,
      backgroundRepeat: "no-repeat",
    };
  };

  // --- Render ---

  return (
    <div className="fixed inset-0 bg-white-200 z-0 backdrop-blur-sm">
      <div className="relative text-[#265c42] flex flex-col items-center justify-center w-full h-full">
        <div className="relative w-full bottom-10 md:bottom-12 flex justify-center z-20">
          <img className="absolute w-[6rem] md:w-[8rem] " src={redRibbon} />
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "20px",
          }}
        >
          <div className="border-[1rem] md:border-[1.5rem] border-[#a22633] bg-[#a22633] rounded-t-[3rem]">
            <StatusBar seconds={seconds} difficulty={difficulty} onReset={onReset} />
            <div className="md:p-[1rem] p-[.7rem]"
              style={{
                backgroundImage: "repeating-linear-gradient(45deg, #3e8948 0 15px, #ffffff 5px 25px, #a22633 10px 35px)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "20px",
                  alignItems: "center",
                  // Christmas Frame Border
                  border: "15px solid transparent",
                  backgroundColor: "#fdf5e6", // Old lace / warm background
                  maxWidth: "95vw",
                }}
              >
                {/* BoardGrid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${GRID_SIZE}, ${tileSize}px)`,
                    width: `${GRID_SIZE * tileSize}px`,
                    backgroundColor: "#000", // Black background for empty slots
                    boxShadow: "inset 0 0 20px rgba(0,0,0,0.8)", // Depth for the board
                  }}
                >
                  {board.map((tile, index) => (
                    <div
                      key={`slot-${index}`}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDropOnBoard(e, index)}
                      style={{
                        width: tileSize,
                        height: tileSize,
                        border: "1px solid #222",
                        boxSizing: "border-box",
                        position: "relative",
                      }}
                    >
                      {tile && (
                        <div
                          draggable={!tile.isFixed && !isComplete}
                          onDragStart={(e) => handleDragStart(e, { type: "board", index })}
                          style={{
                            width: "100%",
                            height: "100%",
                            ...getBackgroundStyle(tile.id),
                            cursor: tile.isFixed ? "default" : "grab",
                            opacity: tile.isFixed ? 1 : 0.9,
                            filter: tile.isFixed ? "brightness(100%)" : "none",
                          }}
                        >
                          {tile.isFixed && (
                            <div
                              style={{
                                position: "absolute",
                                top: 2,
                                right: 2,
                                width: 8,
                                height: 8,
                                background: "#4CAF50",
                                borderRadius: "50%",
                                border: "1px solid white",
                              }}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Separator / Decoration */}
                <div style={{ width: "100%", height: "2px", background: "#aaa" }} />

                {/* Piece Pool - Horizontal */}
                <div
                  className="scrollable"
                  onDragOver={handleDragOver}
                  onDrop={handleDropOnPool}
                  style={{
                    // Dynamic width matching the grid or wider but contained
                    width: `${GRID_SIZE * tileSize}px`,
                    maxWidth: "100%",
                    minHeight: `${tileSize + 20}px`,
                    border: "2px dashed #aaa",
                    borderRadius: "5px",
                    padding: "10px",
                    display: "flex",
                    flexDirection: "row", // Horizontal
                    overflowX: "auto", // Scrollable if many pieces
                    flexWrap: "nowrap",
                    alignItems: "center",
                    gap: "10px",
                    backgroundColor: "rgba(255,255,255,0.5)",
                  }}
                >
                  {pool.map((tile, index) => (
                    <div
                      key={`pool-${tile.id}`}
                      draggable={!isComplete}
                      onDragStart={(e) => handleDragStart(e, { type: "pool", index })}
                      style={{
                        flex: `0 0 ${tileSize}px`,
                        width: tileSize,
                        height: tileSize,
                        ...getBackgroundStyle(tile.id),
                        cursor: "grab",
                        boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                        borderRadius: "5px",
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
