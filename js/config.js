// config.js

export const SIZE = 8;
export const EMPTY = 0;
export const BLACK = 1;
export const WHITE = 2;

export const DIRECTIONS = [
  [-1, 0], [1, 0], [0, -1], [0, 1],
  [-1, -1], [1, 1], [-1, 1], [1, -1]
];

// AI設定（評価関数はai.js側で定義される想定）
import { evaluateBoard, evaluateStrategicBoard } from './ai.js';

export const AI_CONFIG = {
  1: { depth: 1, evalType: evaluateBoard },
  2: { depth: 2, evalType: evaluateBoard },
  3: { depth: 3, evalType: evaluateBoard },
  4: { depth: 6, evalType: evaluateBoard },
  99: { depth: 8, evalType: evaluateStrategicBoard },
  100: { dynamic: true, evalType: evaluateStrategicBoard },
  101: { iterative: true, evalType: evaluateStrategicBoard },
  102: { mcts: true, evalType: null }
};
