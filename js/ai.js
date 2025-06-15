// ai.js
import { SIZE, BLACK, WHITE, AI_CONFIG } from './config.js';
import { getAllValidMoves, drawBoard } from './game.js';

// 評価関数（me = 評価する側の色）
export function evaluateBoard(b, me = WHITE) {
  let score = 0;
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const val = (x === 0 || x === 7) && (y === 0 || y === 7) ? 5 : 1;
      if (b[y][x] === me) score += val;
      else if (b[y][x] === 3 - me) score -= val;
    }
  }
  return score;
}

export function evaluateStrategicBoard(b, me = WHITE) {
  const weights = [
    [100, -50, 20, 10, 10, 20, -50, 100],
    [-50, -70,  0,  0,  0,  0, -70, -50],
    [ 20,   0, 10,  5,  5, 10,   0,  20],
    [ 10,   0,  5,  1,  1,  5,   0,  10],
    [ 10,   0,  5,  1,  1,  5,   0,  10],
    [ 20,   0, 10,  5,  5, 10,   0,  20],
    [-50, -70,  0,  0,  0,  0, -70, -50],
    [100, -50, 20, 10, 10, 20, -50, 100]
  ];

  let score = 0;
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const cell = b[y][x];
      if (cell === me) score += weights[y][x];
      else if (cell === 3 - me) score -= weights[y][x];
    }
  }
  return score;
}

export function cpuMove(board, turn, playerColor, cpuLevel, placeAndNext) {
  const moves = getAllValidMoves(turn, board);
  if (moves.length === 0) return;
  const config = AI_CONFIG[cpuLevel] || AI_CONFIG[1];
  const depth = config.depth || 3;
  const evalFunc = config.evalType || evaluateBoard;
  const cpuColor = turn;

  let best = null;
  let bestScore = -Infinity;
  for (const move of moves) {
    const temp = simulateMove(board, move, cpuColor);
    const score = minimax(temp, 3 - cpuColor, depth - 1, -Infinity, Infinity, false, evalFunc, cpuColor);
    if (score > bestScore) {
      bestScore = score;
      best = move;
    }
  }
  if (best) placeAndNext(best.x, best.y, best.flips);
}

function minimax(b, color, depth, alpha, beta, maximizing, evalFunc, cpuColor) {
  const moves = getAllValidMoves(color, b);
  if (depth === 0 || moves.length === 0) return evalFunc(b, cpuColor);

  if (maximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      const next = simulateMove(b, move, color);
      const evalScore = minimax(next, 3 - color, depth - 1, alpha, beta, false, evalFunc, cpuColor);
      maxEval = Math.max(maxEval, evalScore);
      alpha = Math.max(alpha, evalScore);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      const next = simulateMove(b, move, color);
      const evalScore = minimax(next, 3 - color, depth - 1, alpha, beta, true, evalFunc, cpuColor);
      minEval = Math.min(minEval, evalScore);
      beta = Math.min(beta, evalScore);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

function simulateMove(b, move, color) {
  const copy = b.map(row => row.slice());
  copy[move.y][move.x] = color;
  for (const [fx, fy] of move.flips) {
    copy[fy][fx] = color;
  }
  return copy;
}
