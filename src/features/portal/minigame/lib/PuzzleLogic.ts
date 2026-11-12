/**
 * Pure puzzle logic (generators, solvers, rules). No React / Phaser imports,
 * so it can be unit-tested with plain node and reused by a free-play mode.
 *
 * Every generator builds the puzzle from a SOLVED state (or verifies it with a
 * solver), so every board handed to the player is solvable.
 */

export const rand = (n: number) => Math.floor(Math.random() * n);
export const randInt = (a: number, b: number) => a + rand(b - a + 1);
export const pick = <T>(arr: T[]): T => arr[rand(arr.length)];
export const range = (n: number) => Array.from({ length: n }, (_, i) => i);
export const shuffle = <T>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = rand(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

/** 4-neighbours of a cell in a w x h grid (up, right, down, left). */
export const neighbors = (i: number, w: number, h: number): number[] => {
  const x = i % w;
  const y = Math.floor(i / w);
  const r: number[] = [];
  if (y > 0) r.push(i - w);
  if (x < w - 1) r.push(i + 1);
  if (y < h - 1) r.push(i + w);
  if (x > 0) r.push(i - 1);
  return r;
};

export const DIRS: [number, number][] = [
  [0, -1], // up
  [1, 0], // right
  [0, 1], // down
  [-1, 0], // left
];

// ===========================================================================
// LIGHTS OUT
// ===========================================================================
export const lightsToggle = (
  cells: boolean[],
  size: number,
  idx: number,
): boolean[] => {
  const next = [...cells];
  const x = idx % size;
  const y = Math.floor(idx / size);
  const flip = (xx: number, yy: number) => {
    if (xx >= 0 && yy >= 0 && xx < size && yy < size)
      next[yy * size + xx] = !next[yy * size + xx];
  };
  flip(x, y);
  flip(x - 1, y);
  flip(x + 1, y);
  flip(x, y - 1);
  flip(x, y + 1);
  return next;
};

/** Starts from "all off" and presses `presses` distinct cells => always solvable. */
export const generateLights = (size: number, presses: number): boolean[] => {
  for (let attempt = 0; attempt < 50; attempt++) {
    let cells: boolean[] = Array(size * size).fill(false);
    shuffle(range(size * size))
      .slice(0, presses)
      .forEach((i) => {
        cells = lightsToggle(cells, size, i);
      });
    if (cells.some(Boolean)) return cells;
  }
  return lightsToggle(Array(size * size).fill(false), size, 0);
};

// ===========================================================================
// COLOR SORT (water-sort style)
// ===========================================================================
export type Tubes = number[][];

export const tubesSolved = (tubes: Tubes, cap: number) =>
  tubes.every(
    (t) => t.length === 0 || (t.length === cap && t.every((c) => c === t[0])),
  );

export const canPour = (tubes: Tubes, from: number, to: number, cap: number) => {
  if (from === to) return false;
  const a = tubes[from];
  const b = tubes[to];
  if (!a.length || b.length >= cap) return false;
  return !b.length || b[b.length - 1] === a[a.length - 1];
};

/** Moves the whole run of same-coloured balls on top (as many as fit). */
export const pour = (tubes: Tubes, from: number, to: number, cap: number): Tubes => {
  const next = tubes.map((t) => [...t]);
  while (canPour(next, from, to, cap)) next[to].push(next[from].pop() as number);
  return next;
};

/** Returns true when the tubes can be solved (bounded search). */
export const solveTubes = (tubes: Tubes, cap: number, nodeCap = 50000): boolean => {
  const key = (t: Tubes) => t.map((x) => x.join("")).sort().join("|");
  const seen = new Set<string>([key(tubes)]);
  const stack: Tubes[] = [tubes];
  while (stack.length && seen.size < nodeCap) {
    const s = stack.pop() as Tubes;
    if (tubesSolved(s, cap)) return true;
    for (let i = 0; i < s.length; i++) {
      for (let j = 0; j < s.length; j++) {
        if (!canPour(s, i, j, cap)) continue;
        // pointless: pouring a pure tube into an empty tube
        if (!s[j].length && s[i].every((c) => c === s[i][0]) && s[i].length === cap) continue;
        const n = pour(s, i, j, cap);
        const k = key(n);
        if (!seen.has(k)) {
          seen.add(k);
          stack.push(n);
        }
      }
    }
  }
  return false;
};

export const generateColorSort = (colors: number, empty: number, cap: number): Tubes => {
  for (let attempt = 0; attempt < 100; attempt++) {
    const balls = shuffle(range(colors).flatMap((c) => Array(cap).fill(c) as number[]));
    const tubes: Tubes = range(colors).map((i) => balls.slice(i * cap, (i + 1) * cap));
    if (tubes.some((t) => t.every((c) => c === t[0]))) continue;
    return [...tubes, ...range(empty).map(() => [] as number[])];
  }
  // fallback: a trivial-but-valid board
  const tubes: Tubes = range(colors).map((c) => Array(cap).fill(c) as number[]);
  [tubes[0][cap - 1], tubes[1][cap - 1]] = [tubes[1][cap - 1], tubes[0][cap - 1]];
  return [...tubes, ...range(empty).map(() => [] as number[])];
};

// ===========================================================================
// CODEBREAKER (Mastermind)
// ===========================================================================
export const generateSecret = (pegs: number, colors: number, unique: boolean): number[] =>
  unique
    ? shuffle(range(colors)).slice(0, pegs)
    : range(pegs).map(() => rand(colors));

export const scoreGuess = (secret: number[], guess: number[]) => {
  let exact = 0;
  const restSecret: number[] = [];
  const restGuess: number[] = [];
  secret.forEach((s, i) => {
    if (guess[i] === s) exact++;
    else {
      restSecret.push(s);
      restGuess.push(guess[i]);
    }
  });
  let partial = 0;
  restGuess.forEach((g) => {
    const k = restSecret.indexOf(g);
    if (k >= 0) {
      partial++;
      restSecret.splice(k, 1);
    }
  });
  return { exact, partial };
};

// ===========================================================================
// FLOW / NUMBERLINK
// ===========================================================================
export interface FlowPuzzle {
  size: number;
  pairs: [number, number][]; // endpoints (cell indexes) of each colour
  solution: number[][]; // one valid full-board solution (for tests / hints)
}

/** Random Hamiltonian path on a size x size grid (Warnsdorff-style DFS). */
const hamiltonianPath = (size: number, maxSteps = 20000): number[] | null => {
  const N = size * size;
  const visited: boolean[] = Array(N).fill(false);
  const path: number[] = [];
  let steps = 0;
  const free = (n: number) => neighbors(n, size, size).filter((m) => !visited[m]).length;
  const dfs = (i: number): boolean => {
    if (++steps > maxSteps) return false;
    visited[i] = true;
    path.push(i);
    if (path.length === N) return true;
    const cand = shuffle(neighbors(i, size, size).filter((n) => !visited[n])).sort(
      (a, b) => free(a) - free(b),
    );
    for (const n of cand) {
      if (dfs(n)) return true;
      if (steps > maxSteps) break;
    }
    visited[i] = false;
    path.pop();
    return false;
  };
  return dfs(rand(N)) ? path : null;
};

export const generateFlow = (size: number, pairs: number): FlowPuzzle => {
  const N = size * size;
  for (let attempt = 0; attempt < 300; attempt++) {
    const path = hamiltonianPath(size);
    if (!path) continue;
    // pick (pairs - 1) cut points so every segment has >= 3 cells
    const cuts: number[] = [];
    let tries = 0;
    while (cuts.length < pairs - 1 && tries++ < 100) {
      const c = randInt(3, N - 3);
      if (cuts.every((o) => Math.abs(o - c) >= 3)) cuts.push(c);
    }
    if (cuts.length < pairs - 1) continue;
    cuts.sort((a, b) => a - b);
    const bounds = [0, ...cuts, N];
    const solution: number[][] = [];
    for (let i = 0; i < bounds.length - 1; i++) solution.push(path.slice(bounds[i], bounds[i + 1]));
    if (solution.some((s) => s.length < 3)) continue;
    return {
      size,
      pairs: solution.map((s) => [s[0], s[s.length - 1]] as [number, number]),
      solution,
    };
  }
  // fallback (placeholder): snake path cut in equal parts
  const snake = range(N).map((i) => {
    const y = Math.floor(i / size);
    const x = i % size;
    return y * size + (y % 2 === 0 ? x : size - 1 - x);
  });
  const per = Math.floor(N / pairs);
  const solution = range(pairs).map((p) =>
    snake.slice(p * per, p === pairs - 1 ? N : (p + 1) * per),
  );
  return {
    size,
    pairs: solution.map((s) => [s[0], s[s.length - 1]] as [number, number]),
    solution,
  };
};

export const flowSolved = (paths: Record<number, number[]>, pairs: [number, number][]) =>
  pairs.every(([a, b], k) => {
    const p = paths[k];
    if (!p || p.length < 2) return false;
    const first = p[0];
    const last = p[p.length - 1];
    return (first === a && last === b) || (first === b && last === a);
  });

// ===========================================================================
// UNBLOCK (Rush Hour)  - 6x6 board, car 0 is the red one on row 2, exit on the right
// ===========================================================================
export interface Car {
  x: number;
  y: number;
  len: number;
  horiz: boolean;
}
export const UNBLOCK_N = 6;

const occupancy = (cars: Car[], skip = -1): number[] => {
  const g: number[] = Array(UNBLOCK_N * UNBLOCK_N).fill(-1);
  cars.forEach((c, i) => {
    if (i === skip) return;
    for (let k = 0; k < c.len; k++) {
      const x = c.horiz ? c.x + k : c.x;
      const y = c.horiz ? c.y : c.y + k;
      g[y * UNBLOCK_N + x] = i;
    }
  });
  return g;
};

/** Positions (along the car's axis) the car can slide to. */
export const unblockReach = (cars: Car[], i: number): number[] => {
  const g = occupancy(cars, i);
  const c = cars[i];
  const pos = c.horiz ? c.x : c.y;
  const res: number[] = [];
  for (let p = pos + 1; p + c.len - 1 < UNBLOCK_N; p++) {
    const end = p + c.len - 1;
    const cell = c.horiz ? c.y * UNBLOCK_N + end : end * UNBLOCK_N + c.x;
    if (g[cell] !== -1) break;
    res.push(p);
  }
  for (let p = pos - 1; p >= 0; p--) {
    const cell = c.horiz ? c.y * UNBLOCK_N + p : p * UNBLOCK_N + c.x;
    if (g[cell] !== -1) break;
    res.push(p);
  }
  return res;
};

export const unblockSet = (cars: Car[], i: number, p: number): Car[] =>
  cars.map((c, j) => (j !== i ? c : c.horiz ? { ...c, x: p } : { ...c, y: p }));

export const unblockWon = (cars: Car[]) => cars[0].x + cars[0].len === UNBLOCK_N;

/** BFS: minimum number of moves (sliding any distance = 1 move). -1 if unsolvable / too big. */
export const solveUnblock = (cars: Car[], cap = 40000): number => {
  const n = cars.length;
  const horiz = cars.map((c) => c.horiz);
  const len = cars.map((c) => c.len);
  const fixed = cars.map((c) => (c.horiz ? c.y : c.x)); // the coordinate that never changes
  const key = (s: number[]) => s.reduce((acc, v) => acc * UNBLOCK_N + v, 0);
  const startState = cars.map((c) => (c.horiz ? c.x : c.y));
  const seen = new Set<number>([key(startState)]);
  let frontier: number[][] = [startState];
  let d = 0;
  const occ = new Int8Array(UNBLOCK_N * UNBLOCK_N);
  const cellAt = (i: number, p: number) =>
    horiz[i] ? fixed[i] * UNBLOCK_N + p : p * UNBLOCK_N + fixed[i];
  while (frontier.length) {
    const next: number[][] = [];
    for (const s of frontier) {
      if (s[0] + len[0] === UNBLOCK_N) return d;
      occ.fill(-1);
      for (let i = 0; i < n; i++) for (let k = 0; k < len[i]; k++) occ[cellAt(i, s[i] + k)] = i;
      for (let i = 0; i < n; i++) {
        for (let p = s[i] + 1; p + len[i] - 1 < UNBLOCK_N; p++) {
          if (occ[cellAt(i, p + len[i] - 1)] !== -1) break;
          const ns = s.slice();
          ns[i] = p;
          const k = key(ns);
          if (!seen.has(k)) {
            seen.add(k);
            next.push(ns);
          }
        }
        for (let p = s[i] - 1; p >= 0; p--) {
          if (occ[cellAt(i, p)] !== -1) break;
          const ns = s.slice();
          ns[i] = p;
          const k = key(ns);
          if (!seen.has(k)) {
            seen.add(k);
            next.push(ns);
          }
        }
      }
    }
    if (seen.size > cap) return -1;
    frontier = next;
    d++;
  }
  return -1;
};

// Placeholder level used only if generation fails (2 moves).
export const UNBLOCK_FALLBACK: Car[] = [
  { x: 0, y: 2, len: 2, horiz: true },
  { x: 3, y: 1, len: 2, horiz: false },
  { x: 5, y: 2, len: 3, horiz: false },
  { x: 4, y: 0, len: 2, horiz: true },
];

const randomCar = (): Car => {
  const horiz = Math.random() < 0.4;
  const len = Math.random() < 0.7 ? 2 : 3;
  return {
    horiz,
    len,
    x: randInt(0, horiz ? UNBLOCK_N - len : UNBLOCK_N - 1),
    y: randInt(0, horiz ? UNBLOCK_N - 1 : UNBLOCK_N - len),
  };
};

const carFits = (cars: Car[], c: Car, skip = -1) => {
  if (c.horiz && c.y === 2) return false; // would block the red car's row forever
  const g = occupancy(cars, skip);
  for (let k = 0; k < c.len; k++) {
    const x = c.horiz ? c.x + k : c.x;
    const y = c.horiz ? c.y : c.y + k;
    if (g[y * UNBLOCK_N + x] !== -1) return false;
  }
  return true;
};

/** Random board + hill climbing (move cars around) until the shortest solution is in [min, max]. */
export const generateUnblock = (n: number, min: number, max: number): Car[] => {
  let best: Car[] | null = null;
  let bestDist = -1;
  for (let attempt = 0; attempt < 25; attempt++) {
    let cars: Car[] = [{ x: randInt(0, 1), y: 2, len: 2, horiz: true }];
    let guard = 0;
    while (cars.length < n && guard++ < 80) {
      const c = randomCar();
      if (carFits(cars, c)) cars = [...cars, c];
    }
    let m = solveUnblock(cars);
    for (let it = 0; it < 60 && !(m >= min && m <= max); it++) {
      const i = randInt(1, cars.length - 1);
      const c = randomCar();
      const moved: Car = { ...c, horiz: cars[i].horiz, len: cars[i].len };
      moved.x = randInt(0, moved.horiz ? UNBLOCK_N - moved.len : UNBLOCK_N - 1);
      moved.y = randInt(0, moved.horiz ? UNBLOCK_N - 1 : UNBLOCK_N - moved.len);
      if (!carFits(cars, moved, i)) continue;
      const candidate = cars.map((x, j) => (j === i ? moved : x));
      const d = solveUnblock(candidate);
      if (d > m && d <= max) {
        cars = candidate;
        m = d;
      }
    }
    if (m >= min && m <= max) return cars;
    if (m > bestDist) {
      best = cars;
      bestDist = m;
    }
  }
  return best && bestDist > 0 ? best : UNBLOCK_FALLBACK;
};

// ===========================================================================
// ICE SLIDE
// ===========================================================================
export interface IcePuzzle {
  size: number;
  rocks: boolean[];
  start: number;
  goal: number;
  min: number;
}

/** Slides until the next cell is a rock / the wall. Passing over the goal stops there. */
export const iceSlide = (
  rocks: boolean[],
  size: number,
  goal: number,
  pos: number,
  dir: [number, number],
): number => {
  let x = pos % size;
  let y = Math.floor(pos / size);
  for (;;) {
    const nx = x + dir[0];
    const ny = y + dir[1];
    if (nx < 0 || ny < 0 || nx >= size || ny >= size || rocks[ny * size + nx]) break;
    x = nx;
    y = ny;
    if (y * size + x === goal) break;
  }
  return y * size + x;
};

export const iceSolve = (rocks: boolean[], size: number, start: number, goal: number): number => {
  const dist = new Map<number, number>([[start, 0]]);
  const queue = [start];
  for (let h = 0; h < queue.length; h++) {
    const p = queue[h];
    if (p === goal) return dist.get(p) as number;
    for (const d of DIRS) {
      const n = iceSlide(rocks, size, goal, p, d);
      if (!dist.has(n)) {
        dist.set(n, (dist.get(p) as number) + 1);
        queue.push(n);
      }
    }
  }
  return -1;
};

export const generateIce = (size: number, nRocks: number, min: number, max: number): IcePuzzle => {
  let best: IcePuzzle | null = null;
  for (let attempt = 0; attempt < 500; attempt++) {
    const cells = shuffle(range(size * size));
    const start = cells[0];
    const goal = cells[1];
    const rocks: boolean[] = Array(size * size).fill(false);
    cells.slice(2, 2 + nRocks).forEach((i) => (rocks[i] = true));
    const m = iceSolve(rocks, size, start, goal);
    if (m >= min && m <= max) return { size, rocks, start, goal, min: m };
    if (m > 0 && (!best || Math.abs(m - min) < Math.abs(best.min - min)))
      best = { size, rocks, start, goal, min: m };
  }
  return (
    best ?? {
      size,
      rocks: range(size * size).map((i) => i === size + 1),
      start: 0,
      goal: size * size - 1,
      min: 2,
    }
  );
};

// ===========================================================================
// SOKOBAN (generated with reverse "pull" moves => always solvable)
// ===========================================================================
export interface SokobanPuzzle {
  size: number;
  walls: boolean[];
  boxes: number[];
  targets: number[];
  player: number;
}

export const generateSokoban = (size: number, nBoxes: number, steps: number): SokobanPuzzle => {
  const N = size * size;
  for (let attempt = 0; attempt < 200; attempt++) {
    const walls: boolean[] = Array(N).fill(false);
    shuffle(range(N))
      .slice(0, Math.floor(size * 0.8))
      .forEach((i) => (walls[i] = true));
    const free = range(N).filter((i) => !walls[i]);
    if (free.length < nBoxes * 2 + 2) continue;
    const spots = shuffle(free);
    const targets = spots.slice(0, nBoxes);
    const boxes = [...targets];
    let player = spots[nBoxes];
    const blocked = (x: number, y: number) =>
      x < 0 || y < 0 || x >= size || y >= size || walls[y * size + x] || boxes.includes(y * size + x);
    for (let s = 0; s < steps; s++) {
      const [dx, dy] = pick(DIRS);
      const px = player % size;
      const py = Math.floor(player / size);
      if (blocked(px + dx, py + dy)) continue;
      const bx = px - dx;
      const by = py - dy;
      const idx = bx >= 0 && by >= 0 && bx < size && by < size ? boxes.indexOf(by * size + bx) : -1;
      if (idx >= 0 && Math.random() < 0.7) boxes[idx] = py * size + px; // pull the box
      player = (py + dy) * size + (px + dx);
    }
    const off = boxes.filter((b) => !targets.includes(b)).length;
    if (off >= Math.max(1, nBoxes - 1)) return { size, walls, boxes, targets, player };
  }
  // fallback (placeholder): 1 box, 1 push
  return {
    size,
    walls: Array(N).fill(false),
    boxes: [size + 2],
    targets: [2 * size + 2],
    player: 2,
  };
};

export interface SokobanState {
  boxes: number[];
  player: number;
}

/** Applies a move; returns null when blocked. */
export const sokobanMove = (
  walls: boolean[],
  size: number,
  s: SokobanState,
  dir: [number, number],
): SokobanState | null => {
  const px = (s.player % size) + dir[0];
  const py = Math.floor(s.player / size) + dir[1];
  const inside = (x: number, y: number) => x >= 0 && y >= 0 && x < size && y < size;
  if (!inside(px, py) || walls[py * size + px]) return null;
  const target = py * size + px;
  const bi = s.boxes.indexOf(target);
  if (bi < 0) return { boxes: s.boxes, player: target };
  const bx = px + dir[0];
  const by = py + dir[1];
  if (!inside(bx, by) || walls[by * size + bx] || s.boxes.includes(by * size + bx)) return null;
  const boxes = [...s.boxes];
  boxes[bi] = by * size + bx;
  return { boxes, player: target };
};

export const sokobanSolved = (boxes: number[], targets: number[]) =>
  boxes.every((b) => targets.includes(b));

// ===========================================================================
// FLOOD IT
// ===========================================================================
export const floodFill = (grid: number[], size: number, color: number): number[] => {
  const old = grid[0];
  if (old === color) return grid;
  const next = [...grid];
  const stack = [0];
  const seen = new Set<number>([0]);
  while (stack.length) {
    const i = stack.pop() as number;
    next[i] = color;
    for (const n of neighbors(i, size, size)) {
      if (!seen.has(n) && grid[n] === old) {
        seen.add(n);
        stack.push(n);
      }
    }
  }
  return next;
};

export const floodDone = (grid: number[]) => grid.every((c) => c === grid[0]);

const floodRegion = (grid: number[], size: number) => {
  let n = 0;
  const seen = new Set<number>([0]);
  const stack = [0];
  while (stack.length) {
    const i = stack.pop() as number;
    n++;
    for (const m of neighbors(i, size, size))
      if (!seen.has(m) && grid[m] === grid[0]) {
        seen.add(m);
        stack.push(m);
      }
  }
  return n;
};

/** Greedy solver (pick the colour that grows the flooded area the most). */
export const greedyFlood = (grid: number[], size: number, colors: number): number => {
  let g = grid;
  let moves = 0;
  while (!floodDone(g) && moves < 200) {
    let bestColor = 0;
    let bestSize = -1;
    for (let c = 0; c < colors; c++) {
      if (c === g[0]) continue;
      const s = floodRegion(floodFill(g, size, c), size);
      if (s > bestSize) {
        bestSize = s;
        bestColor = c;
      }
    }
    g = floodFill(g, size, bestColor);
    moves++;
  }
  return moves;
};

export const generateFlood = (size: number, colors: number, slack: number) => {
  for (let attempt = 0; attempt < 20; attempt++) {
    const grid = range(size * size).map(() => rand(colors));
    if (floodDone(grid)) continue;
    return { grid, limit: greedyFlood(grid, size, colors) + slack };
  }
  const grid = range(size * size).map((i) => i % colors);
  return { grid, limit: greedyFlood(grid, size, colors) + slack };
};

// ===========================================================================
// SPINNING RINGS
// ===========================================================================
export const ringsMove = (
  offsets: number[],
  ring: number,
  dir: 1 | -1,
  coupled: boolean,
  seg: number,
): number[] => {
  const o = [...offsets];
  o[ring] = (o[ring] + dir + seg) % seg;
  if (coupled) {
    const partner = ring < o.length - 1 ? ring + 1 : ring - 1;
    o[partner] = (o[partner] - dir + seg) % seg;
  }
  return o;
};

export const ringsSolved = (offsets: number[]) => offsets.every((o) => o === offsets[0]);

export const generateRings = (rings: number, seg: number, coupled: boolean, scramble: number): number[] => {
  for (let attempt = 0; attempt < 50; attempt++) {
    let o: number[] = Array(rings).fill(0);
    for (let i = 0; i < scramble; i++)
      o = ringsMove(o, rand(rings), Math.random() < 0.5 ? 1 : -1, coupled, seg);
    if (!ringsSolved(o)) return o;
  }
  return ringsMove(Array(rings).fill(0), 0, 1, coupled, seg);
};

// ===========================================================================
// WATER JUGS
// ===========================================================================
export const jugActions = (state: number[], caps: number[]): number[][] => {
  const res: number[][] = [];
  for (let i = 0; i < caps.length; i++) {
    if (state[i] < caps[i]) {
      const s = [...state];
      s[i] = caps[i];
      res.push(s);
    }
    if (state[i] > 0) {
      const s = [...state];
      s[i] = 0;
      res.push(s);
    }
    for (let j = 0; j < caps.length; j++) {
      if (i === j || state[i] === 0 || state[j] === caps[j]) continue;
      const amt = Math.min(state[i], caps[j] - state[j]);
      const s = [...state];
      s[i] -= amt;
      s[j] += amt;
      res.push(s);
    }
  }
  return res;
};

export const jugPour = (state: number[], caps: number[], from: number, to: number): number[] => {
  const amt = Math.min(state[from], caps[to] - state[to]);
  const s = [...state];
  s[from] -= amt;
  s[to] += amt;
  return s;
};

export interface JugsPuzzle {
  caps: number[];
  target: number;
  min: number;
}

export const generateJugs = (jugs: number, maxCap: number, min: number, max: number): JugsPuzzle => {
  for (let attempt = 0; attempt < 200; attempt++) {
    const caps = shuffle(range(maxCap - 1).map((i) => i + 2))
      .slice(0, jugs)
      .sort((a, b) => a - b);
    if (Math.max(...caps) < maxCap - 2) continue;
    // BFS over all states, remember the first distance at which each amount shows up
    const key = (s: number[]) => s.join(",");
    const dist = new Map<string, number>([[key(caps.map(() => 0)), 0]]);
    const queue: number[][] = [caps.map(() => 0)];
    const firstSeen = new Map<number, number>();
    for (let h = 0; h < queue.length; h++) {
      const s = queue[h];
      const d = dist.get(key(s)) as number;
      s.forEach((v) => {
        if (v > 0 && !firstSeen.has(v)) firstSeen.set(v, d);
      });
      for (const n of jugActions(s, caps)) {
        if (!dist.has(key(n))) {
          dist.set(key(n), d + 1);
          queue.push(n);
        }
      }
    }
    const targets = [...firstSeen.entries()].filter(
      ([v, d]) => !caps.includes(v) && d >= min && d <= max,
    );
    if (targets.length) {
      const [target, d] = pick(targets);
      return { caps, target, min: d };
    }
  }
  return { caps: [3, 5], target: 4, min: 6 };
};

// ===========================================================================
// LASER & MIRRORS   (mirror values: 0 none, 1 "/", 2 "\")
// ===========================================================================
export interface LaserPuzzle {
  size: number;
  row: number; // laser enters from the left edge on this row
  mirrors: number[]; // scrambled state
  target: number;
  solution: number[]; // mirrors in the solved orientation (for tests)
}

export const traceLaser = (mirrors: number[], size: number, row: number, target: number) => {
  const pts: [number, number][] = [[0, row + 0.5]];
  let x = 0;
  let y = row;
  let dx = 1;
  let dy = 0;
  let hit = false;
  for (let s = 0; s < size * size * 2; s++) {
    pts.push([x + 0.5, y + 0.5]);
    const idx = y * size + x;
    if (idx === target) {
      hit = true;
      break;
    }
    const m = mirrors[idx];
    if (m === 1) [dx, dy] = [-dy, -dx];
    else if (m === 2) [dx, dy] = [dy, dx];
    x += dx;
    y += dy;
    if (x < 0 || y < 0 || x >= size || y >= size) {
      pts.push([x - dx * 0.5 + 0.5, y - dy * 0.5 + 0.5]);
      break;
    }
  }
  return { pts, hit };
};

export const generateLaser = (size: number, turns: number, decoys: number): LaserPuzzle => {
  for (let attempt = 0; attempt < 400; attempt++) {
    const row = randInt(0, size - 1);
    const solution: number[] = Array(size * size).fill(0);
    const used = new Set<number>([row * size]);
    const turnCells: number[] = [];
    let x = 0;
    let y = row;
    let dx = 1;
    let dy = 0;
    let target = -1;
    let ok = true;
    for (let t = 0; t <= turns && ok; t++) {
      let steps = 0;
      const want = randInt(1, Math.max(1, size - 2));
      while (steps < want) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= size || ny >= size || used.has(ny * size + nx)) break;
        x = nx;
        y = ny;
        used.add(y * size + x);
        steps++;
      }
      if (t === turns) {
        if (steps < 1) ok = false;
        else target = y * size + x;
        break;
      }
      if (t > 0 && steps < 1) {
        ok = false;
        break;
      }
      const opts = shuffle<[number, number]>([
        [-dy, dx],
        [dy, -dx],
      ]).filter(([ex, ey]) => {
        const nx = x + ex;
        const ny = y + ey;
        return nx >= 0 && ny >= 0 && nx < size && ny < size && !used.has(ny * size + nx);
      });
      if (!opts.length) {
        ok = false;
        break;
      }
      const [ex, ey] = opts[0];
      solution[y * size + x] = ex === -dy && ey === -dx ? 1 : 2;
      turnCells.push(y * size + x);
      dx = ex;
      dy = ey;
    }
    if (!ok || target < 0) continue;
    if (!traceLaser(solution, size, row, target).hit) continue; // sanity
    const mirrors = [...solution];
    shuffle(range(size * size))
      .filter((i) => !used.has(i))
      .slice(0, decoys)
      .forEach((i) => (mirrors[i] = randInt(1, 2)));
    turnCells.forEach((i) => {
      if (Math.random() < 0.6) mirrors[i] = mirrors[i] === 1 ? 2 : 1;
    });
    if (traceLaser(mirrors, size, row, target).hit) continue; // must start unsolved
    return { size, row, mirrors, target, solution };
  }
  // fallback (placeholder): one mirror, wrongly oriented
  const mirrors: number[] = Array(size * size).fill(0);
  mirrors[0] = 2;
  const solution = [...mirrors];
  solution[0] = 1;
  return { size, row: 0, mirrors, target: size, solution };
};

// ===========================================================================
// TANGRAM (polyomino version - TODO: swap for real tangram shapes)
// ===========================================================================
export type Cells = [number, number][];

export const normalizeCells = (cells: Cells): Cells => {
  const mx = Math.min(...cells.map((c) => c[0]));
  const my = Math.min(...cells.map((c) => c[1]));
  return cells
    .map(([x, y]) => [x - mx, y - my] as [number, number])
    .sort((a, b) => a[1] - b[1] || a[0] - b[0]);
};
export const rotateCells = (cells: Cells): Cells =>
  normalizeCells(cells.map(([x, y]) => [-y, x] as [number, number]));

export interface TangramData {
  w: number;
  h: number;
  pieces: { id: number; cells: Cells }[]; // shown rotated randomly
  solution: number[]; // piece id per board cell
}

export const generateTangram = (w: number, h: number, size: number): TangramData => {
  const N = w * h;
  const id: number[] = Array(N).fill(-1);
  let next = 0;
  for (const start of shuffle(range(N))) {
    if (id[start] !== -1) continue;
    id[start] = next;
    const cells = [start];
    while (cells.length < size) {
      const frontier = cells.flatMap((c) => neighbors(c, w, h)).filter((n) => id[n] === -1);
      if (!frontier.length) break;
      const n = pick(frontier);
      id[n] = next;
      cells.push(n);
    }
    next++;
  }
  // merge pieces made of a single cell into a neighbour
  for (let p = 0; p < next; p++) {
    const cells = range(N).filter((i) => id[i] === p);
    if (cells.length !== 1) continue;
    const nb = neighbors(cells[0], w, h).find((n) => id[n] !== p);
    if (nb !== undefined) id[cells[0]] = id[nb];
  }
  const ids = [...new Set(id)];
  const pieces = ids.map((pid, k) => {
    let cells = normalizeCells(
      range(N)
        .filter((i) => id[i] === pid)
        .map((i) => [i % w, Math.floor(i / w)] as [number, number]),
    );
    for (let r = rand(4); r > 0; r--) cells = rotateCells(cells);
    return { id: k, cells };
  });
  const remap = new Map(ids.map((pid, k) => [pid, k]));
  return { w, h, pieces, solution: id.map((pid) => remap.get(pid) as number) };
};

/** Anchor = the piece's first cell (top-left-most) lands on (ax, ay). */
export const tangramCells = (cells: Cells, ax: number, ay: number): Cells =>
  cells.map(([x, y]) => [x - cells[0][0] + ax, y - cells[0][1] + ay] as [number, number]);

export const tangramCanPlace = (board: number[], w: number, h: number, cells: Cells, ax: number, ay: number) =>
  tangramCells(cells, ax, ay).every(
    ([x, y]) => x >= 0 && y >= 0 && x < w && y < h && board[y * w + x] === -1,
  );

// ===========================================================================
// SUM 10
// ===========================================================================
export interface Sum10Puzzle {
  cells: number[];
  rects: { x: number; y: number; w: number; h: number }[]; // the intended solution
}

const composition10 = (k: number): number[] => {
  const parts: number[] = Array(k).fill(1);
  let left = 10 - k;
  while (left > 0) {
    const i = rand(k);
    if (parts[i] < 9) {
      parts[i]++;
      left--;
    }
  }
  return parts;
};

export const generateSum10 = (w: number, h: number): Sum10Puzzle => {
  const SHAPES: [number, number][] = [
    [2, 1],
    [1, 2],
    [3, 1],
    [1, 3],
    [2, 2],
    [4, 1],
    [1, 4],
    [3, 2],
    [2, 3],
  ];
  for (let attempt = 0; attempt < 50; attempt++) {
    const taken: boolean[] = Array(w * h).fill(false);
    const rects: Sum10Puzzle["rects"] = [];
    const fill = (pos: number): boolean => {
      while (pos < w * h && taken[pos]) pos++;
      if (pos >= w * h) return true;
      const x = pos % w;
      const y = Math.floor(pos / w);
      for (const [rw, rh] of shuffle(SHAPES)) {
        if (x + rw > w || y + rh > h) continue;
        let free = true;
        for (let j = 0; j < rh && free; j++)
          for (let i = 0; i < rw; i++) if (taken[(y + j) * w + x + i]) free = false;
        if (!free) continue;
        for (let j = 0; j < rh; j++) for (let i = 0; i < rw; i++) taken[(y + j) * w + x + i] = true;
        rects.push({ x, y, w: rw, h: rh });
        if (fill(pos + 1)) return true;
        rects.pop();
        for (let j = 0; j < rh; j++) for (let i = 0; i < rw; i++) taken[(y + j) * w + x + i] = false;
      }
      return false;
    };
    if (!fill(0)) continue;
    const cells: number[] = Array(w * h).fill(0);
    rects.forEach((r) => {
      const digits = shuffle(composition10(r.w * r.h));
      let k = 0;
      for (let j = 0; j < r.h; j++) for (let i = 0; i < r.w; i++) cells[(r.y + j) * w + r.x + i] = digits[k++];
    });
    return { cells, rects };
  }
  return { cells: range(w * h).map((i) => (i % 2 === 0 ? 4 : 6)), rects: [] };
};

// ===========================================================================
// EQUATION
// ===========================================================================
/** Evaluates with normal precedence (* and / first). NaN if a division is not exact. */
export const evalExpr = (nums: number[], ops: string[]): number => {
  let sum = 0;
  let sign = 1;
  let term = nums[0];
  for (let i = 0; i < ops.length; i++) {
    const n = nums[i + 1];
    const op = ops[i];
    if (op === "*") term *= n;
    else if (op === "/") {
      if (term % n !== 0) return NaN;
      term /= n;
    } else {
      sum += sign * term;
      term = n;
      sign = op === "+" ? 1 : -1;
    }
  }
  return sum + sign * term;
};

export interface EquationPuzzle {
  nums: number[];
  start: string[]; // operators the player starts with
  target: number;
  solution: string[];
}

export const generateEquation = (count: number, allowed: string[]): EquationPuzzle => {
  for (let attempt = 0; attempt < 300; attempt++) {
    const nums = range(count).map(() => randInt(1, 9));
    const solution = range(count - 1).map(() => pick(allowed));
    const target = evalExpr(nums, solution);
    if (!Number.isInteger(target) || target < 1 || target > 99) continue;
    const start = range(count - 1).map(() => allowed[0]);
    if (evalExpr(nums, start) === target) continue;
    return { nums, start, target, solution };
  }
  return { nums: [2, 3, 4], start: ["+", "+"], target: 14, solution: ["+", "*"] };
};

// ===========================================================================
// NEXT IN SEQUENCE
// ===========================================================================
export interface SequencePuzzle {
  terms: number[]; // shown
  answer: number;
  options: number[];
}

const SEQ_KINDS: Record<string, () => number[]> = {
  arith: () => {
    const a = randInt(1, 20);
    const d = randInt(2, 9);
    return range(6).map((i) => a + d * i);
  },
  geom: () => {
    const a = randInt(1, 3);
    const r = randInt(2, 3);
    return range(6).map((i) => a * r ** i);
  },
  squares: () => {
    const k = randInt(1, 4);
    return range(6).map((i) => (i + k) ** 2);
  },
  cubes: () => {
    const k = randInt(1, 2);
    return range(6).map((i) => (i + k) ** 3);
  },
  fib: () => {
    const t = [randInt(1, 4), randInt(1, 6)];
    for (let i = 2; i < 6; i++) t.push(t[i - 1] + t[i - 2]);
    return t;
  },
  triangular: () => {
    const k = randInt(1, 3);
    return range(6).map((i) => ((i + k) * (i + k + 1)) / 2);
  },
  altadd: () => {
    const a = randInt(1, 5);
    const b = randInt(6, 12);
    const t = [randInt(1, 10)];
    for (let i = 0; i < 5; i++) t.push(t[i] + (i % 2 === 0 ? a : b));
    return t;
  },
  quadratic: () => {
    const c = randInt(1, 6);
    const d = randInt(0, 4);
    const e = randInt(1, 3);
    return range(6).map((i) => c + d * i + (e * i * (i - 1)) / 2);
  },
  muladd: () => {
    const m = 2;
    const c = randInt(1, 3);
    const t = [randInt(1, 3)];
    for (let i = 0; i < 5; i++) t.push(t[i] * m + c);
    return t;
  },
};

const SEQ_POOLS: string[][] = [
  ["arith"],
  ["arith", "geom"],
  ["geom", "squares", "altadd"],
  ["squares", "fib", "triangular", "altadd", "quadratic"],
  ["fib", "quadratic", "muladd", "cubes", "altadd", "triangular"],
  ["fib", "quadratic", "muladd", "cubes", "altadd", "triangular"],
];

export const generateSequence = (level: number): SequencePuzzle => {
  const kind = pick(SEQ_POOLS[Math.min(level, SEQ_POOLS.length - 1)]);
  const all = SEQ_KINDS[kind]();
  const terms = all.slice(0, 5);
  const answer = all[5];
  const spread = Math.max(2, Math.round((answer - all[4]) / 3));
  const options = new Set<number>([answer]);
  let guard = 0;
  while (options.size < 4 && guard++ < 50) {
    const off = randInt(1, 3) * spread * (Math.random() < 0.5 ? -1 : 1);
    const v = answer + off;
    if (v > 0) options.add(v);
  }
  let extra = 1;
  while (options.size < 4) options.add(answer + extra++);
  return { terms, answer, options: shuffle([...options]) };
};

// ===========================================================================
// ODD ONE OUT
// ===========================================================================
export const ODD_SHAPES = ["circle", "square", "triangle", "star", "hexagon"];
export interface OddCell {
  shape: string;
  hue: number;
  rot: number;
}
export interface OddRound {
  cells: OddCell[];
  odd: number;
  kind: string;
}

export const generateOdd = (size: number, delta: number, kinds: string[]): OddRound => {
  const kind = pick(kinds);
  const shapes = kind === "rot" ? ODD_SHAPES.filter((s) => s !== "circle") : ODD_SHAPES;
  const shape = pick(shapes);
  const hue = rand(360);
  const base: OddCell = { shape, hue, rot: 0 };
  let oddCell: OddCell = { ...base };
  if (kind === "shape") oddCell = { ...base, shape: pick(ODD_SHAPES.filter((s) => s !== shape)) };
  else if (kind === "hue") oddCell = { ...base, hue: (hue + delta * (Math.random() < 0.5 ? 1 : -1) + 360) % 360 };
  else oddCell = { ...base, rot: Math.max(12, delta) };
  const odd = rand(size * size);
  return {
    cells: range(size * size).map((i) => (i === odd ? oddCell : base)),
    odd,
    kind,
  };
};

// ===========================================================================
// TRACE MAZE   (open bits: 1 = north, 2 = east, 4 = south, 8 = west)
// ===========================================================================
export interface Maze {
  size: number;
  open: number[];
}

export const generateMaze = (size: number): Maze => {
  const N = size * size;
  const open: number[] = Array(N).fill(0);
  const visited: boolean[] = Array(N).fill(false);
  const stack = [0];
  visited[0] = true;
  while (stack.length) {
    const c = stack[stack.length - 1];
    const x = c % size;
    const y = Math.floor(c / size);
    const opts: [number, number, number][] = [];
    if (y > 0 && !visited[c - size]) opts.push([c - size, 1, 4]);
    if (x < size - 1 && !visited[c + 1]) opts.push([c + 1, 2, 8]);
    if (y < size - 1 && !visited[c + size]) opts.push([c + size, 4, 1]);
    if (x > 0 && !visited[c - 1]) opts.push([c - 1, 8, 2]);
    if (!opts.length) {
      stack.pop();
      continue;
    }
    const [n, a, b] = pick(opts);
    open[c] |= a;
    open[n] |= b;
    visited[n] = true;
    stack.push(n);
  }
  return { size, open };
};

export const mazeCanMove = (m: Maze, from: number, to: number): boolean => {
  const d = to - from;
  const sameRow = Math.floor(from / m.size) === Math.floor(to / m.size);
  if (d === -m.size) return (m.open[from] & 1) !== 0;
  if (d === 1) return sameRow && (m.open[from] & 2) !== 0;
  if (d === m.size) return (m.open[from] & 4) !== 0;
  if (d === -1) return sameRow && (m.open[from] & 8) !== 0;
  return false;
};

// ===========================================================================
// MAGIC SQUARE
// ===========================================================================
const LOSHU = [
  [2, 7, 6],
  [9, 5, 1],
  [4, 3, 8],
];
const DURER = [
  [16, 3, 2, 13],
  [5, 10, 11, 8],
  [9, 6, 7, 12],
  [4, 15, 14, 1],
];

const rotateGrid = (g: number[][]): number[][] =>
  g.map((_, r) => g.map((__, c) => g[g.length - 1 - c][r]));
const flipGrid = (g: number[][]): number[][] => g.map((row) => [...row].reverse());

export const magicConstant = (n: number) => (n * (n * n + 1)) / 2;

export const isMagic = (cells: number[], n: number): boolean => {
  if (cells.some((c) => c === 0)) return false;
  if (new Set(cells).size !== n * n) return false;
  const k = magicConstant(n);
  for (let i = 0; i < n; i++) {
    let r = 0;
    let c = 0;
    for (let j = 0; j < n; j++) {
      r += cells[i * n + j];
      c += cells[j * n + i];
    }
    if (r !== k || c !== k) return false;
  }
  let d1 = 0;
  let d2 = 0;
  for (let i = 0; i < n; i++) {
    d1 += cells[i * n + i];
    d2 += cells[i * n + (n - 1 - i)];
  }
  return d1 === k && d2 === k;
};

export const generateMagic = (n: number, givens: number) => {
  let g = n === 3 ? LOSHU : DURER;
  for (let r = rand(4); r > 0; r--) g = rotateGrid(g);
  if (Math.random() < 0.5) g = flipGrid(g);
  const solution = g.flat();
  const reveal = new Set(shuffle(range(n * n)).slice(0, givens));
  const given = solution.map((_, i) => reveal.has(i));
  return { solution, given };
};
