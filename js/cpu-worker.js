
// cpu-worker.js
importScripts('config.js', 'evaluators.js', 'game.js');

let board = [];
let turn = 1;
let config = {};
let evaluator = null;

onmessage = function(e) {
  const { type, data } = e.data;

  if (type === 'init') {
    board = data.board;
    turn = data.turn;
    config = data.config;
    evaluator = (b) => config.evaluator(b, turn, config);
    const bestMove = getBestMove(board, turn, config);
    postMessage({ type: 'result', move: bestMove });
  }
};

function getBestMove(b, color, config) {
  const moves = getAllValidMoves(color, b);
  if (moves.length === 0) return null;

  let bestMove = null;
  let bestEval = -Infinity;

  for (const move of moves) {
    const next = simulateMove(b, move, color);
    const evalScore = -evaluateBoard(next, 3 - color); // 簡易評価で代用
    if (evalScore > bestEval) {
      bestEval = evalScore;
      bestMove = move;
    }
  }

  return bestMove;
}

function getAllValidMoves(color, b) {
  const moves = [];
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      if (b[y][x] === 0) {
        const flips = getFlips(x, y, color, b);
        if (flips.length > 0) {
          moves.push({ x, y, flips });
        }
      }
    }
  }
  return moves;
}

function getFlips(x, y, color, b) {
  const directions = [[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[1,1],[-1,1],[1,-1]];
  const flips = [];
  for (const [dx, dy] of directions) {
    let cx = x + dx, cy = y + dy;
    const temp = [];
    while (cx >= 0 && cx < 8 && cy >= 0 && cy < 8 && b[cy][cx] === 3 - color) {
      temp.push([cx, cy]);
      cx += dx; cy += dy;
    }
    if (temp.length && cx >= 0 && cx < 8 && cy >= 0 && cy < 8 && b[cy][cx] === color) {
      flips.push(...temp);
    }
  }
  return flips;
}

function simulateMove(b, move, color) {
  const copy = b.map(row => row.slice());
  copy[move.y][move.x] = color;
  move.flips.forEach(([fx, fy]) => copy[fy][fx] = color);
  return copy;
}
