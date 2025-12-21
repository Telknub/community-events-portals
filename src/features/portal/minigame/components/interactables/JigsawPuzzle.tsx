import React, { useState, useEffect } from "react";
import { StatusBar } from "../hud/StatusBar";
import { JIGSAW_PUZZLE_DIFFICULTY, PORTAL_NAME, PORTAL_SOUNDS, PUZZLE_IMGS, PuzzleDifficulty, SNOW } from "../../Constants";
import redRibbon from "public/world/portal/images/bow.webp";
import { Button } from "components/ui/Button";
import { useAppTranslation } from "lib/i18n/useAppTranslations";
import { ModalOverlay } from "components/ui/ModalOverlay";
import { InnerPanel } from "components/ui/Panel";
import { SUNNYSIDE } from "assets/sunnyside";
import { PIXEL_SCALE } from "features/game/lib/constants";

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
  const { t } = useAppTranslation();
  // State
  // The board can have empty slots (null)
  const [board, setBoard] = useState<(Tile | null)[]>([]);
  // Available pieces outside the board
  const [pool, setPool] = useState<Tile[]>([]);
  const [tileSize, setTileSize] = useState<number>(MAX_TILE_SIZE);

  const [isComplete, setIsComplete] = useState<boolean>(false);

  const [draggedItem, setDraggedItem] = useState<DragSource | null>(null);

  const [puzzleImg, setPuzzleImg] = useState<string>("");

  const [isImageOpen, setIsImageOpen] = useState<boolean>(false);

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

  // --- Drag and Drop Handlers (Mouse & Touch) ---

  const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null);

  // Core logic separated from event
  const movePieceToBoard = (source: DragSource, targetIndex: number) => {
    // Cannot drop over a fixed piece
    if (board[targetIndex]?.isFixed) return;

    const newBoard = [...board];
    const newPool = [...pool];
    let sourceTile: Tile;

    if (source.type === "board") {
      if (source.index === targetIndex) return; // Same slot
      sourceTile = newBoard[source.index] as Tile;
      newBoard[source.index] = null;
    } else {
      sourceTile = newPool[source.index];
      newPool.splice(source.index, 1);
    }

    const targetTile = newBoard[targetIndex];
    newBoard[targetIndex] = sourceTile;

    if (targetTile) {
      if (source.type === "board") {
        newBoard[source.index] = targetTile;
      } else {
        newPool.push(targetTile);
      }
    }

    setBoard(newBoard);
    setPool(newPool);
    PORTAL_SOUNDS.click.play();
    checkWinCondition(newBoard);
  };

  const movePieceToPool = (source: DragSource) => {
    if (source.type === "pool") return; // Already in pool

    const newBoard = [...board];
    const newPool = [...pool];

    const tile = newBoard[source.index];
    if (tile && !tile.isFixed) {
      newBoard[source.index] = null;
      newPool.push(tile);
      setBoard(newBoard);
      setPool(newPool);
      PORTAL_SOUNDS.click.play();
      checkWinCondition(newBoard);
    }
  };

  // --- Mouse Events ---
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, source: DragSource) => {
    if (source.type === "board") {
      const tile = board[source.index];
      if (tile?.isFixed || isComplete) {
        e.preventDefault();
        return;
      }
    }
    setDraggedItem(source);
    e.dataTransfer.effectAllowed = "move";
    // Hide ghost image? Default is usually fine, but for touch we make our own.
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDropOnBoard = (e: React.DragEvent<HTMLDivElement>, targetIndex: number) => {
    e.preventDefault();
    if (!draggedItem) return;
    movePieceToBoard(draggedItem, targetIndex);
    setDraggedItem(null);
  };

  const handleDropOnPool = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!draggedItem) return;
    movePieceToPool(draggedItem);
    setDraggedItem(null);
  };

  // --- Touch Events ---
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>, source: DragSource) => {
    if (isComplete) return;
    if (source.type === "board") {
      const tile = board[source.index];
      if (tile?.isFixed) return;
    }

    const touch = e.touches[0];
    setDraggedItem(source);
    setDragPosition({ x: touch.clientX, y: touch.clientY });
    // Prevent scrolling while dragging a piece
    document.body.style.overflow = "hidden";
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!dragPosition) return;
    const touch = e.touches[0];
    setDragPosition({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!draggedItem || !dragPosition) return;

    // Find drop target
    const touch = e.changedTouches[0];
    const targetElement = document.elementFromPoint(touch.clientX, touch.clientY);

    // Check if dropped on a board slot
    const slotElement = targetElement?.closest("[data-board-index]");
    if (slotElement) {
      const index = parseInt(slotElement.getAttribute("data-board-index") || "-1");
      if (index !== -1) {
        movePieceToBoard(draggedItem, index);
      }
    } else {
      // Check if dropped on pool
      const poolElement = targetElement?.closest("#jigsaw-pool");
      if (poolElement) {
        movePieceToPool(draggedItem);
      }
    }

    setDraggedItem(null);
    setDragPosition(null);
    document.body.style.overflow = ""; // Restore scrolling
  };

  const checkWinCondition = (currentBoard: (Tile | null)[]) => {
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

  return (
    <div className="fixed inset-0 bg-white-200 z-0 backdrop-blur-sm">
      {/* Ghost Tile for Touch Dragging */}
      {dragPosition && draggedItem && (
        <div
          style={{
            position: "fixed",
            left: dragPosition.x,
            top: dragPosition.y,
            width: tileSize,
            height: tileSize,
            zIndex: 9999,
            pointerEvents: "none",
            transform: "translate(-50%, -50%)",
            ...getBackgroundStyle(
              draggedItem.type === "board"
                ? board[draggedItem.index]!.id
                : pool[draggedItem.index].id
            ),
            boxShadow: "0 5px 15px rgba(0,0,0,0.5)",
            borderRadius: "5px",
            opacity: 0.9,
          }}
        />
      )}

      <div className="relative text-[#265c42] flex flex-col items-center justify-center w-full h-full">
        <div className="relative w-full bottom-10 md:bottom-12 flex justify-center z-20">
          <img className="absolute w-[6rem] md:w-[8rem] " src={redRibbon} />
        </div>

        <div className="flex flex-col items-center gap-5">
          <div className="border-[1rem] md:border-[1.5rem] border-[#a22633] bg-[#a22633] rounded-t-[3rem]">
            <StatusBar seconds={seconds} difficulty={difficulty} onReset={onReset} />
            <div className="md:p-[1rem] p-[.7rem]"
              style={{
                position: "relative",
                backgroundImage: "repeating-linear-gradient(45deg, #3e8948 0 15px, #ffffff 5px 25px, #a22633 10px 35px)",
              }}
            >
              <ModalOverlay
                show={isImageOpen}
                onBackdropClick={() => setIsImageOpen(false)}
              >
                <InnerPanel className="aspect-[1/1]">
                  <div style={{ width: `${PIXEL_SCALE * 9}px` }} />
                  <img
                    src={SUNNYSIDE.icons.close}
                    className="cursor-pointer"
                    onClick={() => setIsImageOpen(false)}
                    style={{
                      width: `${PIXEL_SCALE * 9}px`,
                      position: "absolute",
                      top: "0",
                      right: "0",
                      margin: "1rem",
                    }}
                  />
                  <img src={puzzleImg} alt="Jigsaw Puzzle" />
                </InnerPanel>
              </ModalOverlay>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "15px",
                  alignItems: "center",
                  border: "15px solid transparent",
                  backgroundColor: "#fdf5e6",
                  maxWidth: "95vw",
                }}
              >
                {/* BoardGrid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${GRID_SIZE}, ${tileSize}px)`,
                    width: `${GRID_SIZE * tileSize}px`,
                    backgroundColor: "#000",
                    boxShadow: "inset 0 0 20px rgba(0,0,0,0.8)",
                  }}
                >
                  {board.map((tile, index) => (
                    <div
                      key={`slot-${index}`}
                      data-board-index={index} // Identity for touch drop
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
                          onTouchStart={(e) => handleTouchStart(e, { type: "board", index })}
                          onTouchMove={handleTouchMove}
                          onTouchEnd={handleTouchEnd}
                          style={{
                            width: "100%",
                            height: "100%",
                            ...getBackgroundStyle(tile.id),
                            cursor: tile.isFixed ? "default" : "grab",
                            opacity: tile.isFixed ? 1 : 0.9,
                            filter: tile.isFixed ? "brightness(100%)" : "none",
                            // Hide the original element while touch dragging (optional, but ghost is there)
                            visibility: (draggedItem?.type === "board" && draggedItem.index === index && dragPosition) ? "hidden" : "visible",
                          }}
                        >
                          {tile.isFixed && (
                            <div
                              style={{
                                position: "absolute", top: 2, right: 2,
                                width: 8, height: 8,
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

                {/* Piece Pool */}
                <div
                  id="jigsaw-pool" // Identity for touch drop
                  className="scrollable"
                  onDragOver={handleDragOver}
                  onDrop={handleDropOnPool}
                  style={{
                    width: `${GRID_SIZE * tileSize}px`,
                    maxWidth: "100%",
                    minHeight: `${tileSize + 20}px`,
                    border: "2px dashed #aaa",
                    borderRadius: "5px",
                    padding: "10px",
                    display: "flex",
                    flexDirection: "row",
                    overflowX: "auto",
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
                      onTouchStart={(e) => handleTouchStart(e, { type: "pool", index })}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={handleTouchEnd}
                      style={{
                        flex: `0 0 ${tileSize}px`,
                        width: tileSize,
                        height: tileSize,
                        ...getBackgroundStyle(tile.id),
                        cursor: "grab",
                        boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                        borderRadius: "5px",
                        visibility: (draggedItem?.type === "pool" && draggedItem.index === index && dragPosition) ? "hidden" : "visible",
                      }}
                    />
                  ))}
                </div>
                <Button onClick={() => setIsImageOpen(true)}>{t(`${PORTAL_NAME}.jigsaw.view.image`)}</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
