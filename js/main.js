// main.js
import { initOthello, setVsCPU, setCpuLevel, setPlayerColor } from './game.js';

const cpuBtn = document.getElementById("cpuBtn");
const pvpBtn = document.getElementById("pvpBtn");
const onlineBtn = document.getElementById("onlineBtn");
const startBtn = document.getElementById("startBtn");
const cpuLevelSelect = document.getElementById("cpuLevel");
const aiDescDiv = document.getElementById("ai-description");
const matchLabel = document.getElementById("match-info");

const aiDescriptions = {
  1: "AIレベル1（弱）: 浅い深さでの簡単な評価。",
  2: "AIレベル2（中）: 通常より少し深く読みます。",
  3: "AIレベル3（強）: より深い読みで強くなります。",
  4: "AIレベル4（最強）: 深さ6の評価関数使用。",
  99: "AI Test: 戦略的な評価関数を使用。",
  100: "AI Test2: 残りマス数に応じた動的読み。",
  101: "AI Test3: 時間制限付き反復深化。",
  102: "AI Test4: MCTS（モンテカルロ木探索）を使用。"
};

const aiShortNames = {
  1: "弱",
  2: "中",
  3: "強",
  4: "最強",
  99: "AI Test",
  100: "AI Test2",
  101: "AI Test3",
  102: "AI Test4"
};

cpuBtn.addEventListener("click", () => {
  document.getElementById("mode-selection").style.display = "none";
  document.getElementById("controls").style.display = "flex";
  setVsCPU(true);
  updateAIDescription();
});

pvpBtn.addEventListener("click", () => {
  document.getElementById("mode-selection").style.display = "none";
  setVsCPU(false);
  setPlayerColor(1);
  matchLabel.textContent = "2人対戦モード";
  document.getElementById("game-area").style.display = "block";
  initOthello();
});

onlineBtn.addEventListener("click", () => {
  alert("オンライン対戦は現在準備中です。");
});

startBtn.addEventListener("click", () => {
  const cpuLevel = parseInt(cpuLevelSelect.value);
  const playerColor = parseInt(document.getElementById("playerColor").value);
  setCpuLevel(cpuLevel);
  setPlayerColor(playerColor);
  matchLabel.textContent = `VS CPU（${aiShortNames[cpuLevel] || "?"}）`;
  document.getElementById("controls").style.display = "none";
  document.getElementById("game-area").style.display = "block";
  initOthello();
});

cpuLevelSelect.addEventListener("change", updateAIDescription);

function updateAIDescription() {
  const selected = parseInt(cpuLevelSelect.value);
  aiDescDiv.textContent = aiDescriptions[selected] || "";
}

// 初期表示
updateAIDescription();
