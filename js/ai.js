// ai.js
import { AI_CONFIG } from './config.js';
import { getAllValidMoves, simulateMove, turn, place, nextTurn, board } from './game.js';
import {
  evaluateBoard,
  evaluateStrategicBoard,
  evaluateStrategicAdvancedBoard
} from './evaluators.js';

export function cpuMove() {
  const config = AI_CONFIG[window.cpuLevel] || AI_CONFIG[1];

  // 評価関数取得（options を渡す可能性）
  const evalFunc = (b) => {
    if (config.evaluator === evaluateStrategicAdvancedBoard) {
      return config.evaluator(b, turn, config);
    }
    return config.evaluator(b, turn, config);
  };

  if (config.type === 'minimax') {
    const depth = config.dynamicDepth
      ? getDynamicDepth(config.depthTable)
      : config.depth;
    const moves = getAllValidMoves(turn);
    let best = null, bestScore = -Infinity;

    for (const move of moves) {
      const temp = simulateMove(board, move, turn);
      const score = minimax(temp, 3 - turn, depth - 1, -Infinity, Infinity, false, evalFunc);
      if (score > bestScore) {
        bestScore = score;
        best = move;
      }
    }
    if (best) place(best.x, best.y, best.flips);
    nextTurn();
  }

  else if (config.type === 'iterative') {
    const moves = getAllValidMoves(turn);
    let bestMove = null;
    let bestScore = -Infinity;
    const start = Date.now();
    let depth = 1;

    while (Date.now() - start < config.timeLimit) {
      for (const move of moves) {
        const temp = simulateMove(board, move, turn);
        const score = minimax(temp, 3 - turn, depth, -Infinity, Infinity, false, evalFunc);
        if (score > bestScore) {
          bestScore = score;
          bestMove = move;
        }
      }
      depth++;
    }
    if (bestMove) place(bestMove.x, bestMove.y, bestMove.flips);
    nextTurn();
  }

  else if (config.type === 'mcts') {
    const move = mctsSelectMove(board, turn, config.simulations);
    if (move) place(move.x, move.y, move.flips);
    nextTurn();
  }
}

function minimax(b, color, depth, alpha, beta, maximizing, evalFunc) {
  if (depth === 0 || getAllValidMoves(color, b).length === 0) {
    return evalFunc(b);
  }
  const moves = getAllValidMoves(color, b);
  if (maximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      const next = simulateMove(b, move, color);
      const evalScore = minimax(next, 3 - color, depth - 1, alpha, beta, false, evalFunc);
      maxEval = Math.max(maxEval, evalScore);
      alpha = Math.max(alpha, evalScore);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      const next = simulateMove(b, move, color);
      const evalScore = minimax(next, 3 - color, depth - 1, alpha, beta, true, evalFunc);
      minEval = Math.min(minEval, evalScore);
      beta = Math.min(beta, evalScore);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

function getDynamicDepth(table) {
  const empty = board.flat().filter(c => c === 0).length;
  for (let item of table) {
    if (empty <= item.max) return item.depth;
  }
  return 2;
}

function mctsSelectMove(b, color, simulations = 100) {
  const moves = getAllValidMoves(color, b);
  if (moves.length === 0) return null;

  const scores = new Map();
  for (const move of moves) {
    scores.set(move, 0);
    for (let i = 0; i < simulations; i++) {
      const result = simulateRandomPlayout(simulateMove(b, move, color), 3 - color);
      scores.set(move, scores.get(move) + result);
    }
  }
  return [...scores.entries()].sort((a, b) => b[1] - a[1])[0][0];
}

function simulateRandomPlayout(board, color) {
  let currentBoard = board.map(row => row.slice());
  let currentColor = color;
  let passes = 0;

  while (passes < 2) {
    const moves = getAllValidMoves(currentColor, currentBoard);
    if (moves.length === 0) {
      passes++;
      currentColor = 3 - currentColor;
      continue;
    }
    passes = 0;
    const move = moves[Math.floor(Math.random() * moves.length)];
    currentBoard = simulateMove(currentBoard, move, currentColor);
    currentColor = 3 - currentColor;
  }

  const { white, black } = countStones(currentBoard);
  return white > black ? 1 : white === black ? 0 : -1;
}

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
