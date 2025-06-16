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

  const evalFunc = (b) => {
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
    const move = mctsSelectMoveUCT(board, turn, config);
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

// --- MCTS with UCT ---
function mctsSelectMoveUCT(b, color, config) {
  const moves = getAllValidMoves(color, b);
  if (moves.length === 0) return null;

  const stats = new Map(); // move => { wins, visits }
  const start = Date.now();
  const maxSim = config.simulations ?? 100;
  const limit = config.timeLimit ?? null;
  const C = config.explorationConstant ?? 1.41;
  let totalSimulations = 0;

  while (
    (!limit || Date.now() - start < limit) &&
    totalSimulations < maxSim * moves.length
  ) {
    for (const move of moves) {
      const state = simulateMove(b, move, color);
      const result = simulateRandomPlayout(state, 3 - color, config);

      if (!stats.has(move)) stats.set(move, { wins: 0, visits: 0 });
      const stat = stats.get(move);
      stat.wins += result;
      stat.visits++;
      totalSimulations++;
    }
  }

  const best = [...stats.entries()]
    .map(([move, stat]) => {
      const winRate = stat.wins / stat.visits;
      const uct = winRate + C * Math.sqrt(Math.log(totalSimulations) / stat.visits);
      return { move, uct };
    })
    .sort((a, b) => b.uct - a.uct)[0]?.move;

  return best;
}

// --- 評価関数ベースのプレイアウト ---
function simulateRandomPlayout(board, color, config) {
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

  const finalEval = config.evaluator(currentBoard, window.playerColor, config);
  return finalEval > 0 ? 1 : finalEval === 0 ? 0 : -1;
}
