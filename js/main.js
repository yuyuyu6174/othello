import { initOthello, setVsCPU, setPlayerColor, setCpuLevel } from './game.js';
import { cpuMove } from './ai.js';
import { AI_CONFIG } from './config.js';

// グローバル登録（game.jsから呼び出すため）
window.cpuMove = cpuMove;

// UI要素取得
const cpuBtn = document.getElementById("cpuBtn");
const pvpBtn = document.getElementById("pvpBtn");
const onlineBtn = document.getElementById("onlineBtn");
const startBtn = document.getElementById("startBtn");
const rematchBtn = document.getElementById("rematchBtn");
const cpuLevelSelect = document.getElementById("cpuLevel");
const aiDescDiv = document.getElementById("ai-description");
const modeLabel = document.getElementById("mode-label");

// CPU選択肢を Config から自動で追加
Object.entries(AI_CONFIG).forEach(([level, config]) => {
  const option = document.createElement("option");
  option.value = level;
  option.textContent = config.name;
  cpuLevelSelect.appendChild(option);
});

// 初期CPU情報表示
updateCpuInfo(parseInt(cpuLevelSelect.value));

// CPUボタン押下時（CPU対戦選択）
cpuBtn.addEventListener("click", () => {
  setVsCPU(true);
  window.vsCPU = true;
  document.getElementById("mode-selection").style.display = "none";
  document.getElementById("controls").style.display = "flex";
  updateCpuInfo(parseInt(cpuLevelSelect.value));
});

// 2人対戦ボタン押下時
pvpBtn.addEventListener("click", () => {
  setVsCPU(false);
  window.vsCPU = false;
  setPlayerColor(1); // 黒
  document.getElementById("mode-selection").style.display = "none";
  document.getElementById("game-area").style.display = "block";
  updateModeLabel();
  initOthello();
});

// オンライン対戦
onlineBtn.addEventListener("click", () => {
  alert("オンライン対戦は現在準備中です。");
});

// ゲーム開始ボタン押下時（CPU対戦）
startBtn.addEventListener("click", () => {
  const level = parseInt(cpuLevelSelect.value);
  const color = parseInt(document.getElementById("playerColor").value);
  setCpuLevel(level);
  setPlayerColor(color);
  document.getElementById("controls").style.display = "none";
  document.getElementById("game-area").style.display = "block";
  updateCpuInfo(level);
  updateModeLabel();
  initOthello();
});

// 再戦ボタン押下時（現在の設定で再スタート）
rematchBtn.addEventListener("click", () => {
  document.getElementById("message").textContent = "";
  initOthello();
});

// CPUレベル選択変更時に説明更新
cpuLevelSelect.addEventListener("change", () => {
  const level = parseInt(cpuLevelSelect.value);
  updateCpuInfo(level);
});

// CPU名・説明文表示
function updateCpuInfo(level) {
  const config = AI_CONFIG[level];
  if (!config) return;
  aiDescDiv.textContent = config.comment || "";
  const label = document.getElementById("cpu-info-label");
  if (label) {
    label.textContent = `VS CPU（${config.name}）`;
  }
}

// モード表示更新（ゲーム開始時に呼ばれる）
function updateModeLabel() {
  const level = parseInt(cpuLevelSelect?.value || "1");
  const config = AI_CONFIG[level];
  if (window.vsCPU) {
    modeLabel.textContent = `VS CPU（${config?.name || "?"}）`;
  } else {
    modeLabel.textContent = "2人対戦";
  }
}
