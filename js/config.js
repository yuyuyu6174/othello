// config.js
import {
  evaluateBoard,
  evaluateStrategicBoard,
  evaluateStrategicAdvancedBoard
} from './evaluators.js';

export const SIZE = 8;
export const EMPTY = 0;
export const BLACK = 1;
export const WHITE = 2;

export const DIRECTIONS = [
  [-1, 0], [1, 0], [0, -1], [0, 1],
  [-1, -1], [1, 1], [-1, 1], [1, -1]
];

// === AI設定 ===
export const AI_CONFIG = {
  // --- レベル1〜4（標準AI） ---
  1: {
    visible: true,
    name: "弱",
        comment: "浅い読みとシンプルな評価（初心者向け）",
    type: "minimax",
    depth: 1,
    evaluator: evaluateBoard
  },
  2: {
    visible: true,
    name: "中",
      comment: "標準的な深さのミニマックス探索",
    type: "minimax",
    depth: 2,
    evaluator: evaluateBoard
  },
  3: {
    visible: true,
    name: "強",
      comment: "さらに深い探索で安定したプレイ",
    type: "minimax",
    depth: 3,
    evaluator: evaluateBoard
  },
  4: {
    visible: true,
    name: "最強",
      comment: "深さ6の高精度ミニマックス探索（実践向け）",
    type: "minimax",
    depth: 6,
    evaluator: evaluateStrategicBoard,
    useWeights: false,
    avoidCornerTrap: true,
    penalizeXSquare: true
  },

  // --- AI Test 系 ---
  101: {
    visible: true,
    name: "AI Test1",
      comment: "戦略評価を導入",
    type: "minimax",
    depth: 6,
    evaluator: evaluateStrategicBoard,
    useWeights: true,
    avoidCornerTrap: true,
    evaluateStableStones: true,
    considerParity: true,
    penalizeXSquare: true
  },

  102: {
    visible: true,
    name: "AI Test2",
      comment: "残りマス数に応じて深さを調整（動的読み）",
    type: "minimax",
    dynamicDepth: true,
    depthTable: [
      { max: 20, depth: 7 },
      { max: 40, depth: 5 },
      { max: 64, depth: 4 }
    ],
    evaluator: evaluateStrategicBoard,
    useWeights: true,
    avoidCornerTrap: true,
    evaluateStableStones: true,
    considerParity: true,
    penalizeXSquare: true
  },

  103: {
    visible: true,
    name: "AI Test3",
      comment: "反復深化探索（時間制限あり）",
    type: "iterative",
    timeLimit: 1000,
    evaluator: evaluateStrategicBoard,
    useWeights: true,
    avoidCornerTrap: true,
    evaluateStableStones: true,
    considerParity: true,
    penalizeXSquare: true
  },

  // 104: {
  //   visible: true,
  //   name: "AI Test4",
  //     comment: "MCTS（モンテカルロ木探索）を使用",
  //   type: "mcts",
  //   simulations: 300,
  //   timeLimit: 1000,
  //   explorationConstant: 1.41,
  //   evaluator: evaluateStrategicAdvancedBoard,
  //   useWeights: true,
  //   avoidCornerTrap: true,
  //   evaluateStableStones: true,
  //   considerParity: true,
  //   penalizeXSquare: true,
  //   parityWeight: 40,
  //   stableStoneBonus: 20,
  //   xSquarePenalty: 50
  // },

  104: {
    visible: true,
    name: "AI Test4",
    comment: "MCTS（モンテカルロ木探索）を使用",
    type: "mcts",
    simulations: 800,
    timeLimit: 2000,
    explorationConstant: 1.25,
    evaluator: evaluateStrategicAdvancedBoard,
    useWeights: true,
    avoidCornerTrap: true,
    evaluateStableStones: true,
    considerParity: true,
    penalizeXSquare: true,
    parityWeight: 50,
    stableStoneBonus: 30,
    xSquarePenalty: 60
  },

  105: {
    visible: true,
    name: "AI Test5",
    comment: "評価カスタムを実装",
    type: "minimax",
    dynamicDepth: true,
    depthTable: [
      { max: 20, depth: 8 },
      { max: 40, depth: 6 },
      { max: 64, depth: 5 }
    ],
    evaluator: evaluateStrategicAdvancedBoard,
    useWeights: true,
    weights: [ // カスタム評価マトリクス（8x8）
      [100, -40, 20,  5,  5, 20, -40, 100],
      [-40, -80, -1, -1, -1, -1, -80, -40],
      [ 20,  -1,  5,  1,  1,  5,  -1,  20],
      [  5,  -1,  1,  0,  0,  1,  -1,   5],
      [  5,  -1,  1,  0,  0,  1,  -1,   5],
      [ 20,  -1,  5,  1,  1,  5,  -1,  20],
      [-40, -80, -1, -1, -1, -1, -80, -40],
      [100, -40, 20,  5,  5, 20, -40, 100]
    ],
    avoidCornerTrap: true,
    evaluateStableStones: true,
    considerParity: true,
    penalizeXSquare: true,
    parityWeight: 40,
    stableStoneBonus: 20,
    xSquarePenalty: 50
  }
};

// ===========================
// 各設定の意味（参考）
// ===========================
/*

【基本設定】
type                  // 使用アルゴリズム（"minimax", "iterative", "mcts"）
depth                 // 探索深さ（整数）→ 通常は 1〜8 程度
dynamicDepth          // 残りマス数によって探索深さを切替（true/false）
depthTable            // dynamicDepth用設定（例: [{ max: 40, depth: 5 }, ...]）

timeLimit             // 最大思考時間（ms）→ 推奨: 300〜5000
simulations           // MCTSの試行回数 → 推奨: 100〜1000
explorationConstant   // MCTSの探索率（UCT）→ 推奨: 1.2〜1.5（√2）

【評価関数】
evaluator             // 使用する評価関数

evaluateBoard
  - 石数の差を単純に評価
  - 位置評価・戦略フラグなし
  - 軽量だが弱い

evaluateStrategicBoard
  - weights による位置評価
  - 各戦略フラグ（true/false）も使用可能
  - 固定強度で評価（調整不可）

evaluateStrategicAdvancedBoard
  - weights + 戦略フラグ + 調整パラメータ使用可能
  - より強いAI・学習型に向く

【戦略パラメータ】
useWeights            // マスの重みを評価に使う（true/false）
weights               // 盤面ごとの重み（8x8マトリクス）

avoidCornerTrap       // 危険な角付近の打ち手を避ける（true/false）
evaluateStableStones  // 安定石（角・端）を加点（true/false）
considerParity        // パリティ（終盤の奇偶有利）を考慮（true/false）
penalizeXSquare       // X打ち（角の斜め前）を避ける（true/false）

parityWeight          // パリティの重み（デフォ: 40）
stableStoneBonus      // 安定石ボーナス（デフォ: 20）
xSquarePenalty        // X打ちペナルティ（デフォ: 50）

*/
