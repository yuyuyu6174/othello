// game.js
import { SIZE, EMPTY, BLACK, WHITE, DIRECTIONS } from './config.js';
import { cpuMove } from './ai.js';

let board = [];
let turn;
let vsCPU = false;
let playerColor = BLACK;
let cpuLevel = 1;

export function setVsCPU(flag) { vsCPU = flag; }
export function setPlayerColor(color) { playerColor = color; }
export function setCpuLevel(level) { cpuLevel = level; }

export function initOthello() {
  board = Array.from({ length: SIZE }, () => Array(SIZE).fill(EMPTY));
  board[3][3] = WHITE; board[4][4] = WHITE;
  board[3][4] = BLACK; board[4][3] = BLACK;
  turn = BLACK;
  drawBoard();
  updateMessage(`${turn === BLACK ? "黒" : "白"}の番です`);
  if (vsCPU && playerColor === WHITE) {
    const cpuColor = BLACK;
    setTimeout(() => cpuMove(board, turn, playerColor, cpuLevel, placeAndNext), 300);
  }
}

function updateMessage(text) {
  const msg = document.getElementById("message");
  if (msg) msg.textContent = text;
}

export function drawBoard() {
  const table = document.getElementById("board");
  table.innerHTML = "";
  const hints = getAllValidMoves(turn).map(m => `${m.x},${m.y}`);
  for (let y = 0; y < SIZE; y++) {
    const row = document.createElement("tr");
    for (let x = 0; x < SIZE; x++) {
      const cell = document.createElement("td");
      if (board[y][x] !== EMPTY) {
        const piece = document.createElement("div");
        piece.className = "piece " + (board[y][x] === BLACK ? "black" : "white");
        cell.appendChild(piece);
      } else if (hints.includes(`${x},${y}`)) {
        cell.classList.add("hint");
      }
      cell.addEventListener("click", () => handleClick(x, y));
      row.appendChild(cell);
    }
    table.appendChild(row);
  }
}

function handleClick(x, y) {
  if (vsCPU && turn !== playerColor) return;
  if (board[y][x] !== EMPTY) return;
  const flips = getFlips(x, y, turn);
  if (flips.length === 0) return;
  placeAndNext(x, y, flips);
}

function placeAndNext(x, y, flips) {
  place(x, y, flips);
  nextTurn();
}

function place(x, y, flips) {
  board[y][x] = turn;
  flips.forEach(([fx, fy]) => board[fy][fx] = turn);
  drawBoard();
}

function nextTurn() {
  turn = 3 - turn;
  if (!hasValidMoves(turn)) {
    if (!hasValidMoves(3 - turn)) return endGame();
    updateMessage(`${turn === BLACK ? "黒" : "白"}は打てません。パス！`);
    turn = 3 - turn;
    drawBoard();
    if (vsCPU && turn !== playerColor) {
      setTimeout(() => cpuMove(board, turn, playerColor, cpuLevel, placeAndNext), 300);
    }
    return;
  }
  updateMessage(`${turn === BLACK ? "黒" : "白"}の番です`);
  drawBoard();
  if (vsCPU && turn !== playerColor) {
    setTimeout(() => cpuMove(board, turn, playerColor, cpuLevel, placeAndNext), 300);
  }
}

function getFlips(x, y, color) {
  let flips = [];
  for (let [dx, dy] of DIRECTIONS) {
    let cx = x + dx, cy = y + dy, temp = [];
    while (cx >= 0 && cy >= 0 && cx < SIZE && cy < SIZE && board[cy][cx] === 3 - color) {
      temp.push([cx, cy]); cx += dx; cy += dy;
    }
    if (temp.length && cx >= 0 && cy >= 0 && cx < SIZE && cy < SIZE && board[cy][cx] === color)
      flips = flips.concat(temp);
  }
  return flips;
}

function getFlipsGeneric(x, y, color, b) {
  let flips = [];
  for (let [dx, dy] of DIRECTIONS) {
    let cx = x + dx, cy = y + dy, temp = [];
    while (cx >= 0 && cy >= 0 && cx < SIZE && cy < SIZE && b[cy][cx] === 3 - color) {
      temp.push([cx, cy]); cx += dx; cy += dy;
    }
    if (temp.length && cx >= 0 && cy >= 0 && cx < SIZE && cy < SIZE && b[cy][cx] === color)
      flips = flips.concat(temp);
  }
  return flips;
}

export function getAllValidMoves(color, b = board) {
  let moves = [];
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      if (b[y][x] === EMPTY) {
        const flips = getFlipsGeneric(x, y, color, b);
        if (flips.length) moves.push({ x, y, flips });
      }
    }
  }
  return moves;
}

function hasValidMoves(color, b = board) {
  return getAllValidMoves(color, b).length > 0;
}

function endGame() {
  let black = 0, white = 0;
  for (let row of board) {
    for (let cell of row) {
      if (cell === BLACK) black++;
      else if (cell === WHITE) white++;
    }
  }
  updateMessage(`ゲーム終了！ 黒:${black} 白:${white} → ${black === white ? "引き分け" : (black > white ? "黒の勝ち！" : "白の勝ち！")}`);
}
