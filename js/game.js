import { SIZE, EMPTY, BLACK, WHITE, DIRECTIONS } from './config.js';

// グローバル管理用
export let board = [];
export let turn = BLACK;
let vsCPU = true;
let cpuLevel = 1;
let playerColor = BLACK;

// 外部から変更できるように export
export function setVsCPU(v) { vsCPU = v; }
export function setCpuLevel(level) { cpuLevel = level; window.cpuLevel = level; }
export function setPlayerColor(color) { playerColor = color; window.playerColor = color; }

// 初期化
export function initOthello() {
  board = Array.from({ length: SIZE }, () => Array(SIZE).fill(EMPTY));

  // 初期配置
  board[3][3] = WHITE;
  board[3][4] = BLACK;
  board[4][3] = BLACK;
  board[4][4] = WHITE;

  turn = BLACK;
  drawBoard();
  document.getElementById("message").textContent = "黒の番です";
  document.getElementById("rematchBtn").style.display = "none";

  if (vsCPU && playerColor === WHITE) {
    document.getElementById("message").textContent = "CPU思考中...";
    setTimeout(() => window.cpuMove(), 300);
  }
}

// 盤面描画
function drawBoard() {
  const table = document.getElementById("board");
  table.innerHTML = "";
  const validMoves = getAllValidMoves(turn);

  for (let y = 0; y < SIZE; y++) {
    const row = document.createElement("tr");
    for (let x = 0; x < SIZE; x++) {
      const cell = document.createElement("td");

      if (board[y][x] === BLACK || board[y][x] === WHITE) {
        const piece = document.createElement("div");
        piece.className = "piece " + (board[y][x] === BLACK ? "black" : "white");
        cell.appendChild(piece);
      }

      if (validMoves.some(m => m.x === x && m.y === y)) {
        cell.classList.add("hint");
      }

      cell.addEventListener("click", () => handleClick(x, y));
      row.appendChild(cell);
    }
    table.appendChild(row);
  }
}

// プレイヤーがクリック
function handleClick(x, y) {
  if (vsCPU && turn !== playerColor) return;
  if (board[y][x] !== EMPTY) return;
  const flips = getFlips(x, y, turn);
  if (flips.length === 0) return;

  place(x, y, flips);
  nextTurn();
}

// 石を置く
export function place(x, y, flips) {
  board[y][x] = turn;
  flips.forEach(([fx, fy]) => board[fy][fx] = turn);
  drawBoard();
}

// ターンを進める
export function nextTurn() {
  turn = 3 - turn;

  if (!hasValidMoves(turn)) {
    if (!hasValidMoves(3 - turn)) return endGame();
    document.getElementById("message").textContent =
      `${turn === BLACK ? "黒" : "白"}は打てません。パス！`;
    turn = 3 - turn;
  }

  // CPUの手番時に「思考中...」を表示
  if (vsCPU && turn !== playerColor) {
    document.getElementById("message").textContent = "CPU思考中...";
    drawBoard();
    setTimeout(() => window.cpuMove(), 300);
    return;
  }

  document.getElementById("message").textContent =
    `${turn === BLACK ? "黒" : "白"}の番です`;
  drawBoard();
}

// 勝敗判定
function endGame() {
  let black = 0, white = 0;
  for (let row of board) {
    for (let cell of row) {
      if (cell === BLACK) black++;
      if (cell === WHITE) white++;
    }
  }

  document.getElementById("message").textContent =
    `ゲーム終了！ 黒:${black} 白:${white} → ` +
    (black === white ? "引き分け" : (black > white ? "黒の勝ち！" : "白の勝ち！"));

  document.getElementById("rematchBtn").style.display = "inline-block";
}

// 有効な手を取得
export function getAllValidMoves(color, b = board) {
  const moves = [];
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      if (b[y][x] === EMPTY) {
        const flips = getFlips(x, y, color, b);
        if (flips.length > 0) {
          moves.push({ x, y, flips });
        }
      }
    }
  }
  return moves;
}

// 裏返る石を取得
export function getFlips(x, y, color, b = board) {
  const flips = [];
  for (const [dx, dy] of DIRECTIONS) {
    let cx = x + dx, cy = y + dy;
    const temp = [];
    while (cx >= 0 && cx < SIZE && cy >= 0 && cy < SIZE && b[cy][cx] === 3 - color) {
      temp.push([cx, cy]);
      cx += dx; cy += dy;
    }
    if (temp.length && cx >= 0 && cx < SIZE && cy >= 0 && cy < SIZE && b[cy][cx] === color) {
      flips.push(...temp);
    }
  }
  return flips;
}

// 有効手が存在するか
function hasValidMoves(color, b = board) {
  return getAllValidMoves(color, b).length > 0;
}

// AI用：盤面をシミュレートして返す
export function simulateMove(b, move, color) {
  const copy = b.map(row => row.slice());
  copy[move.y][move.x] = color;
  move.flips.forEach(([fx, fy]) => copy[fy][fx] = color);
  return copy;
}
