import { initOthello, setVsCPU, setPlayerColor, setCpuLevel } from './game.js';
import { cpuMove } from './ai.js';
import { AI_CONFIG } from './config.js';

// グローバルにCPU処理を登録
window.cpuMove = cpuMove;

const cpuBtn = document.getElementById("cpuBtn");
const pvpBtn = document.getElementById("pvpBtn");
const onlineBtn = document.getElementById("onlineBtn");
const startBtn = document.getElementById("startBtn");
const cpuLevelSelect = document.getElementById("cpuLevel");
const aiDescDiv = document.getElementById("ai-description");
const modeLabel = document.getElementById("mode-label");

// ✅ AI選択欄を構成（visible: true のものだけ表示）
Object.entries(AI_CONFIG).forEach(([key, config]) => {
  if (config.visible !== true) return; // visible:true のみ対象

  const option = document.createElement("option");
  option.value = key;
  option.textContent = `${config.name}`;
  cpuLevelSelect.appendChild(option);
});

// AI説明表示の更新
function updateCpuInfo(level) {
  const config = AI_CONFIG[level];
  if (!config) return;

  // 説明文を表示
  aiDescDiv.textContent = config.comment || "";

  // 対戦モード名の更新（ゲーム中に表示）
  const label = document.getElementById("cpu-info-label");
  if (label) {
    label.textContent = `VS CPU（${config.name}）`;
  }
}

// イベント登録
cpuBtn.addEventListener("click", () => {
  setVsCPU(true);
  document.getElementById("mode-selection").style.display = "none";
  document.getElementById("controls").style.display = "flex";
});

pvpBtn.addEventListener("click", () => {
  setVsCPU(false);
  setPlayerColor(1);
  document.getElementById("mode-selection").style.display = "none";
  document.getElementById("game-area").style.display = "block";
  initOthello();
  if (modeLabel) modeLabel.textContent = "2人対戦";
});

onlineBtn.addEventListener("click", () => {
  alert("オンライン対戦は現在準備中です。");
});

startBtn.addEventListener("click", () => {
  const level = parseInt(cpuLevelSelect.value);
  const color = parseInt(document.getElementById("playerColor").value);
  setCpuLevel(level);
  setPlayerColor(color);
  document.getElementById("controls").style.display = "none";
  document.getElementById("game-area").style.display = "block";
  initOthello();
  updateCpuInfo(level);
  if (modeLabel) {
    const config = AI_CONFIG[level];
    modeLabel.textContent = `VS CPU（${config?.name ?? '??'}）`;
  }
});

// 説明文初期化
cpuLevelSelect.addEventListener("change", () => {
  const selected = parseInt(cpuLevelSelect.value);
  updateCpuInfo(selected);
});
updateCpuInfo(parseInt(cpuLevelSelect.value));
