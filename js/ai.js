// ai.js
import { AI_CONFIG } from './config.js';
import { getAllValidMoves, simulateMove, turn, place, nextTurn, board } from './game.js';
import {
  evaluateBoard,
  evaluateStrategicBoard,
  evaluateStrategicAdvancedBoard
} from './evaluators.js';

const transpositionTable = new Map(); // key: hash string, value: eval score

export function cpuMove() {
  const config = AI_CONFIG[window.cpuLevel] || AI_CONFIG[1];
  const evalFunc = (b) => config.evaluator(b, turn, config);
  const emptyCount = board.flat().filter(c => c === 0).length;

  // --- 終局読み（config.endgame に従って実行） ---
  if (config.useEndgameSolver && config.endgame && emptyCount <= (config.endgame.maxEmpty ?? 12)) {
    const best = getBestMoveFullSearch(board, turn, config);
    if (best) place(best.x, best.y, best.flips);
    nextTurn();
    return;
  }

  if (config.type === 'minimax') {
    const depth = config.dynamicDepth
      ? getDynamicDepth(config.depthTable)
      : config.depth;
    const moves = getAllValidMoves(turn);

    const orderedMoves = moves.map(move => {
      const temp = simulateMove(board, move, turn);
      const score = evalFunc(temp);
      return { move, score };
    }).sort((a, b) => b.score - a.score);

    let best = null, bestScore = -Infinity;
    for (const { move } of orderedMoves) {
      const temp = simulateMove(board, move, turn);
      const score = minimax(temp, 3 - turn, depth - 1, -Infinity, Infinity, false, evalFunc, config);
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
        const score = minimax(temp, 3 - turn, depth, -Infinity, Infinity, false, evalFunc, config);
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

function minimax(b, color, depth, alpha, beta, maximizing, evalFunc, config) {
  const key = JSON.stringify(b) + color + depth;
  if (transpositionTable.has(key)) return transpositionTable.get(key);

  if (depth === 0 || getAllValidMoves(color, b).length === 0) {
    const val = evalFunc(b);
    transpositionTable.set(key, val);
    return val;
  }

  const moves = getAllValidMoves(color, b);
  const orderedMoves = moves.map(move => {
    const temp = simulateMove(b, move, color);
    const score = evalFunc(temp);
    return { move, score };
  }).sort((a, b) => maximizing ? b.score - a.score : a.score - b.score);

  if (maximizing) {
    let maxEval = -Infinity;
    for (const { move } of orderedMoves) {
      const next = simulateMove(b, move, color);
      const evalScore = minimax(next, 3 - color, depth - 1, alpha, beta, false, evalFunc, config);
      maxEval = Math.max(maxEval, evalScore);
      alpha = Math.max(alpha, evalScore);
      if (beta <= alpha) break;
    }
    transpositionTable.set(key, maxEval);
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const { move } of orderedMoves) {
      const next = simulateMove(b, move, color);
      const evalScore = minimax(next, 3 - color, depth - 1, alpha, beta, true, evalFunc, config);
      minEval = Math.min(minEval, evalScore);
      beta = Math.min(beta, evalScore);
      if (beta <= alpha) break;
    }
    transpositionTable.set(key, minEval);
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

function getBestMoveFullSearch(b, color, config) {
  const moves = getAllValidMoves(color, b);
  if (moves.length === 0) return null;

  let bestMove = null;
  let bestEval = -Infinity;

  for (const move of moves) {
    const temp = simulateMove(b, move, color);
    const evalScore = fullSearch(temp, 3 - color, config, false);
    if (evalScore > bestEval) {
      bestEval = evalScore;
      bestMove = move;
    }
  }

  return bestMove;
}

function fullSearch(b, color, config, passed) {
  const moves = getAllValidMoves(color, b);
  if (moves.length === 0) {
    const opponentMoves = getAllValidMoves(3 - color, b);
    if (opponentMoves.length === 0) {
      const black = b.flat().filter(c => c === 1).length;
      const white = b.flat().filter(c => c === 2).length;
      return (window.playerColor === 1 ? black - white : white - black);
    } else {
      return -fullSearch(b, 3 - color, config, true);
    }
  }

  let best = -Infinity;
  for (const move of moves) {
    const temp = simulateMove(b, move, color);
    const evalScore = -fullSearch(temp, 3 - color, config, false);
    best = Math.max(best, evalScore);

    // --- 新形式対応：枝刈り条件が config.endgame.usePruning なら適用 ---
    if (config.endgame?.usePruning && best >= 64) break;
  }
  return best;
}

function mctsSelectMoveUCT(b, color, config) {
  const moves = getAllValidMoves(color, b);
  if (moves.length === 0) return null;

  const stats = new Map();
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
