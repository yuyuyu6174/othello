import { SIZE, EMPTY, BLACK, WHITE } from './config.js';

// デフォルト評価マトリクス（weights）
export const DEFAULT_WEIGHTS = [
  [100, -25, 10, 5, 5, 10, -25, 100],
  [-25, -50,  1, 1, 1,  1, -50, -25],
  [ 10,   1,  3, 2, 2,  3,   1,  10],
  [  5,   1,  2, 1, 1,  2,   1,   5],
  [  5,   1,  2, 1, 1,  2,   1,   5],
  [ 10,   1,  3, 2, 2,  3,   1,  10],
  [-25, -50,  1, 1, 1,  1, -50, -25],
  [100, -25, 10, 5, 5, 10, -25, 100]
];

// 安定石の検出（角と端から埋まっている石を抽出）
function getStableStones(board) {
  const stable = Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
  const directions = [
    [1, 0], [-1, 0], [0, 1], [0, -1],
    [1, 1], [-1, -1], [1, -1], [-1, 1]
  ];

  const check = (x, y, color) => {
    for (let [dx, dy] of directions) {
      let cx = x + dx, cy = y + dy;
      while (cx >= 0 && cx < SIZE && cy >= 0 && cy < SIZE) {
        if (board[cy][cx] !== color) return false;
        cx += dx;
        cy += dy;
      }
    }
    return true;
  };

  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const cell = board[y][x];
      if (cell !== EMPTY && check(x, y, cell)) {
        stable[y][x] = cell;
      }
    }
  }

  return stable;
}

// 石数カウント
function countStones(board) {
  let white = 0, black = 0;
  for (let row of board) {
    for (let cell of row) {
      if (cell === WHITE) white++;
      else if (cell === BLACK) black++;
    }
  }
  return { white, black };
}

// 軽量評価：石の数だけを見る
export function evaluateBoard(board, color) {
  const opponent = 3 - color;
  let score = 0;
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      if (board[y][x] === color) score++;
      else if (board[y][x] === opponent) score--;
    }
  }
  return score;
}

// 戦略評価（固定ボーナス）
export function evaluateStrategicBoard(board, color, config = {}) {
  return evaluateStrategicGeneralBoard(board, color, config, true);
}

// 高度な戦略評価（パラメータ調整対応）
export function evaluateStrategicAdvancedBoard(board, color, config = {}) {
  return evaluateStrategicGeneralBoard(board, color, config, false);
}

// 共通評価関数（共通ロジック + 固定値orconfigで切替）
function evaluateStrategicGeneralBoard(board, color, config = {}, useDefaults = true) {
  const opponent = 3 - color;
  let score = 0;

  // マス重み設定
  const weights = config.weights || DEFAULT_WEIGHTS;
  const useWeights = config.useWeights !== false;

  // ボーナス・ペナルティ（デフォルト or config指定）
  const stableBonus = useDefaults ? 20 : config.stableStoneBonus ?? 20;
  const parityBonus = useDefaults ? 40 : config.parityWeight ?? 40;
  const xPenalty = useDefaults ? 30 : config.xSquarePenalty ?? 50;
  const trapPenalty = useDefaults ? 30 : config.trapPenalty ?? 30;

  // 1. weights による評価
  if (useWeights) {
    for (let y = 0; y < SIZE; y++) {
      for (let x = 0; x < SIZE; x++) {
        const cell = board[y][x];
        if (cell === color) score += weights[y][x];
        else if (cell === opponent) score -= weights[y][x];
      }
    }
  }

  // 2. 安定石ボーナス
  if (config.evaluateStableStones) {
    const stable = getStableStones(board);
    for (let y = 0; y < SIZE; y++) {
      for (let x = 0; x < SIZE; x++) {
        if (stable[y][x] === color) score += stableBonus;
        else if (stable[y][x] === opponent) score -= stableBonus;
      }
    }
  }

  // 3. パリティ（終盤で石差が有利な方に加点）
  if (config.considerParity) {
    const empty = board.flat().filter(c => c === EMPTY).length;
    if (empty <= 16) {
      const count = countStones(board);
      const parity = (color === WHITE ? count.white - count.black : count.black - count.white);
      score += parityBonus * Math.sign(parity);
    }
  }

  // 4. Xマス（角の斜め前）に打った場合ペナルティ
  if (config.penalizeXSquare) {
    const xSquares = [ [1,1], [6,1], [1,6], [6,6] ];
    for (const [x, y] of xSquares) {
      if (board[y][x] === color) score -= xPenalty;
      if (board[y][x] === opponent) score += xPenalty;
    }
  }

  // 5. 危険な角周辺の罠マスペナルティ
  if (config.avoidCornerTrap) {
    const trapSquares = [
      [0,1],[1,0],[1,1],[0,6],[1,7],[1,6],
      [6,0],[6,1],[7,1],[6,6],[6,7],[7,6]
    ];
    for (const [x, y] of trapSquares) {
      if (board[y][x] === color) score -= trapPenalty;
      if (board[y][x] === opponent) score += trapPenalty;
    }
  }

  return score;
}
