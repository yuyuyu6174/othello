// config.js
import { evaluateBoard, evaluateStrategicBoard, evaluateStrategicAdvancedBoard } from './evaluators.js'

export const SIZE = 8;
export const EMPTY = 0;
export const BLACK = 1;
export const WHITE = 2;

export const DIRECTIONS = [
  [-1, 0], [1, 0], [0, -1], [0, 1],
  [-1, -1], [1, 1], [-1, 1], [1, -1]
];

// === レベル設定 ===
export const AI_CONFIG = {
  1: {
    name: "弱",
    comment: "浅い読みとシンプルな評価（初心者向け）",
    type: "minimax",
    depth: 1,
    evaluator: evaluateBoard
  },
  2: {
    name: "中",
    comment: "標準的な深さのミニマックス探索",
    type: "minimax",
    depth: 2,
    evaluator: evaluateBoard
  },
  3: {
    name: "強",
    comment: "さらに深い探索で安定したプレイ",
    type: "minimax",
    depth: 3,
    evaluator: evaluateBoard
  },
  4: {
    name: "最強",
    comment: "深さ6の高精度ミニマックス探索（実践向け）",
    type: "minimax",
    depth: 6,
    evaluator: evaluateBoard,
    avoidCornerTrap: true // 危険な角周辺の打ち手を避ける
  },
  101: {
    name: "AI Test1",
    comment: "戦略評価を導入",
    type: "minimax",
    depth: 6,
    evaluator: evaluateStrategicBoard,  // 戦略的評価関数
    avoidCornerTrap: true,              // 危険な角周辺の打ち手を避ける
    evaluateStableStones: true,         // 安定石の数を評価に含める
    considerParity: true,               // パリティ（偶奇）戦略を評価に含める
    penalizeXSquare: true               // X打ち（角の斜め前）を回避する
  },
  102: {
    name: "AI Test2",
    comment: "残りマス数に応じて深さを調整（動的読み）",
    type: "minimax",
    dynamicDepth: true,                 // 残りマスに応じて探索深度を動的に決定
    depthTable: [
      { max: 20, depth: 7 },
      { max: 40, depth: 5 },
      { max: 64, depth: 4 }
    ],
    evaluator: evaluateStrategicBoard,
    avoidCornerTrap: true,              // 危険な角周辺の打ち手を避ける
    evaluateStableStones: true,         // 安定石の数を評価に含める
    considerParity: true,               // パリティ（偶奇）戦略を評価に含める
    penalizeXSquare: true               // X打ち（角の斜め前）を回避する
  },
  103: {
    name: "AI Test3",
    comment: "反復深化探索（時間制限あり）",
    type: "iterative",
    timeLimit: 1000,                    // 思考時間
    evaluator: evaluateStrategicBoard,
    avoidCornerTrap: true,              // 危険な角周辺の打ち手を避ける
    evaluateStableStones: true,         // 安定石の数を評価に含める
    considerParity: true,               // パリティ（偶奇）戦略を評価に含める
    penalizeXSquare: true               // X打ち（角の斜め前）を回避する
  },
  // 実装予定
  104: {
    name: "AI Test4",
    comment: "MCTS（モンテカルロ木探索）を使用",
    type: "mcts",
    simulations: 200,
    evaluator: evaluateStrategicAdvancedBoard,  // 強化版の戦略評価関数
    avoidCornerTrap: true,                      // 危険な角周辺の打ち手を避ける
    evaluateStableStones: true,                 // 安定石の数を評価に含める
    considerParity: true,                       // パリティ（偶奇）戦略を評価に含める
    penalizeXSquare: true                       // X打ち（角の斜め前）を回避する
  }
};
