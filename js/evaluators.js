// evaluators.js

// シンプルな評価関数：石の数と角の価値を評価
export function evaluateBoard(board, color) {
  let score = 0;
  const opponent = 3 - color;
  const cornerPositions = [
    [0, 0], [0, 7], [7, 0], [7, 7]
  ];

  for (let y = 0; y < board.length; y++) {
    for (let x = 0; x < board[y].length; x++) {
      if (board[y][x] === color) score += 1;
      else if (board[y][x] === opponent) score -= 1;
    }
  }

  for (let [x, y] of cornerPositions) {
    if (board[y][x] === color) score += 5;
    else if (board[y][x] === opponent) score -= 5;
  }

  return score;
}

// 安定石をカウント（シンプルな左上→右下走査）
function countStableStones(board, color) {
  let stable = 0;
  const size = board.length;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (board[y][x] === color && isStable(board, x, y, color)) {
        stable++;
      }
    }
  }
  return stable;
}

// 簡易的な安定石判定（角からの連続）
function isStable(board, x, y, color) {
  const size = board.length;
  return (
    (x === 0 || x === size - 1 || board[y][0] === color || board[y][size - 1] === color) &&
    (y === 0 || y === size - 1 || board[0][x] === color || board[size - 1][x] === color)
  );
}

// 戦略的評価関数：複数要素に基づく評価
export function evaluateStrategicBoard(board, color, config = {}) {
  let score = 0;
  const opponent = 3 - color;

  const weights = [
    [100, -25, 10, 5, 5, 10, -25, 100],
    [-25, -50, 1, 1, 1, 1, -50, -25],
    [10, 1, 3, 2, 2, 3, 1, 10],
    [5, 1, 2, 1, 1, 2, 1, 5],
    [5, 1, 2, 1, 1, 2, 1, 5],
    [10, 1, 3, 2, 2, 3, 1, 10],
    [-25, -50, 1, 1, 1, 1, -50, -25],
    [100, -25, 10, 5, 5, 10, -25, 100]
  ];

  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      if (board[y][x] === color) score += weights[y][x];
      else if (board[y][x] === opponent) score -= weights[y][x];
    }
  }

  // 安定石の数を評価
  if (config.evaluateStableStones) {
    score += countStableStones(board, color) * 4;
    score -= countStableStones(board, opponent) * 4;
  }

  // パリティ評価（終盤）
  if (config.considerParity) {
    const emptyCount = board.flat().filter(v => v === 0).length;
    if (emptyCount < 16) {
      score += (emptyCount % 2 === 0 ? 3 : -3);
    }
  }

  // X打ち抑制（角の斜め前）
  if (config.penalizeXSquare) {
    const xsquares = [
      [1, 1], [1, 6], [6, 1], [6, 6]
    ];
    for (const [x, y] of xsquares) {
      if (board[y][x] === color) score -= 20;
      else if (board[y][x] === opponent) score += 20;
    }
  }

  // 角周囲トラップ回避（avoidCornerTrap）
  if (config.avoidCornerTrap) {
    const trapZones = [
      [0, 1], [1, 0], [1, 1],
      [0, 6], [1, 7], [1, 6],
      [6, 0], [7, 1], [6, 1],
      [6, 6], [7, 6], [6, 7]
    ];
    for (const [x, y] of trapZones) {
      if (board[y][x] === color) score -= 20;
      else if (board[y][x] === opponent) score += 20;
    }
  }

  return score;
}

// 将来の拡張用：高度な戦略評価
export function evaluateStrategicAdvancedBoard(board, color, config = {}) {
  // 今は戦略版と同じ実装。後で改良可能。
  return evaluateStrategicBoard(board, color, config);
}
