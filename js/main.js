import { initOthello, setVsCPU, setPlayerColor, setCpuLevel } from './game.js';
import { cpuMove } from './ai.js';
import { AI_CONFIG } from './config.js';

window.cpuMove = cpuMove;

const cpuBtn = document.getElementById("cpuBtn");
const pvpBtn = document.getElementById("pvpBtn");
const onlineBtn = document.getElementById("onlineBtn");
const startBtn = document.getElementById("startBtn");

const cpuLevelSelect = document.getElementById("cpuLevel");
const aiDescDiv = document.getElementById("ai-description");

// ▼ CPU選択肢を Config から生成（name 表示）
function populateCpuOptions() {
  cpuLevelSelect.innerHTML = '';
  for (const key in AI_CONFIG) {
    const config = AI_CONFIG[key];
    const option = document.createElement("option");
    option.value = key;
    option.textContent = config.name;
    cpuLevelSelect.appendChild(option);
  }

  const initial = parseInt(cpuLevelSelect.value);
  updateCpuInfo(initial);
}

// ▼ CPU名と説明を表示
function updateCpuInfo(level) {
  const config = AI_CONFIG[level];
  if (!config) return;

  const desc = config.description || config.comment || "";
  aiDescDiv.textContent = desc ? `${config.name}: ${desc}` : config.name;
}

// ▼ CPU対戦モード選択
cpuBtn.addEventListener("click", () => {
  setVsCPU(true);
  document.getElementById("mode-selection").style.display = "none";
  document.getElementById("controls").style.display = "flex";
  populateCpuOptions();
});

// ▼ CPU選択変更時に説明更新
cpuLevelSelect.addEventListener("change", () => {
  const selected = parseInt(cpuLevelSelect.value);
  updateCpuInfo(selected);
});

// ▼ ゲーム開始ボタン
startBtn.addEventListener("click", () => {
  const level = parseInt(cpuLevelSelect.value);
  const color = parseInt(document.getElementById("playerColor").value);
  setCpuLevel(level);
  setPlayerColor(color);
  document.getElementById("controls").style.display = "none";
  document.getElementById("game-area").style.display = "block";
  initOthello();
});

// ▼ 2人対戦
pvpBtn.addEventListener("click", () => {
  setVsCPU(false);
  setPlayerColor(1);
  document.getElementById("mode-selection").style.display = "none";
  document.getElementById("game-area").style.display = "block";
  initOthello();
});

// ▼ オンライン未実装
onlineBtn.addEventListener("click", () => {
  alert("オンライン対戦は現在準備中です。");
});
