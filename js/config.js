// ============================================================
// config.js - 开心消消乐 全局配置
// ============================================================

const CONFIG = {
  // ---- 棋盘尺寸 ----
  BOARD_COLS: 9,
  BOARD_ROWS: 9,
  CELL_SIZE: 48,

  // ---- 糖果颜色 ----
  CANDY_COLORS: ['red', 'orange', 'yellow', 'green', 'cyan', 'blue', 'purple'],

  CANDY_COLOR_MAP: {
    'red':    '#FF4444',
    'orange': '#FF8C00',
    'yellow': '#FFD700',
    'green':  '#32CD32',
    'cyan':   '#00CED1',
    'blue':   '#4169E1',
    'purple': '#9370DB'
  },

  // 糖果高光颜色（用于渐变）
  CANDY_LIGHT_MAP: {
    'red':    '#FF8888',
    'orange': '#FFB347',
    'yellow': '#FFEC8B',
    'green':  '#90EE90',
    'cyan':   '#7FFFD4',
    'blue':   '#87CEEB',
    'purple': '#D8BFD8'
  },

  // 糖果暗部颜色
  CANDY_DARK_MAP: {
    'red':    '#CC0000',
    'orange': '#CC6600',
    'yellow': '#DAA520',
    'green':  '#228B22',
    'cyan':   '#008B8B',
    'blue':   '#27408B',
    'purple': '#6A5ACD'
  },

  // ---- 动画时间（毫秒） ----
  SWAP_DURATION: 200,
  FALL_DURATION: 150,
  REMOVE_DURATION: 200,
  SPECIAL_EFFECT_DURATION: 300,
  CASCADE_DELAY: 80,

  // ---- 游戏模式 ----
  MODES: {
    SCORE:      'score',
    JELLY:      'jelly',
    INGREDIENT: 'ingredient',
    COLLECT:    'collect',
    ORDER:      'order'
  },

  // ---- 特殊方块类型 ----
  SPECIAL: {
    NORMAL:     'normal',
    STRIPED_H:  'striped_h',
    STRIPED_V:  'striped_v',
    WRAPPED:    'wrapped',
    COLOR_BOMB: 'color_bomb',
    RAINBOW:    'rainbow'
  },

  // ---- 障碍物类型 ----
  OBSTACLE: {
    NONE:       'none',
    ICE_1:      'ice_1',
    ICE_2:      'ice_2',
    ICE_3:      'ice_3',
    LOCK:       'lock',
    STONE:      'stone',
    CHOCOLATE:  'chocolate',
    FROSTING:   'frosting',
    PORTAL:     'portal'
  },

  // ---- 游戏参数 ----
  MAX_MOVES: 30,
  INITIAL_COINS: 500,
  INITIAL_LIVES: 5,
  MAX_LIVES: 5,
  LIFE_REGEN_TIME: 1800000, // 30分钟恢复1体力

  // ---- 分数 ----
  SCORE_MATCH_3: 60,
  SCORE_MATCH_4: 120,
  SCORE_MATCH_5: 200,
  SCORE_STRIPED: 150,
  SCORE_WRAPPED: 200,
  SCORE_COLOR_BOMB: 500,
  SCORE_COMBO_MULTIPLIER: 1.5, // 连击倍率
  SCORE_JELLY: 30,
  SCORE_INGREDIENT: 1000,

  // ---- 粒子 ----
  PARTICLE_COUNT: 8,
  PARTICLE_LIFE: 600,
  PARTICLE_SPEED: 3,

  // ---- 关卡目标示例 ----
  LEVEL_TARGETS: {
    1: { mode: 'score', targetScore: 3000, moves: 20 },
    2: { mode: 'score', targetScore: 5000, moves: 20 },
    3: { mode: 'jelly', jellyCount: 10, moves: 25 },
    4: { mode: 'ingredient', ingredients: ['cherry', 'cherry'], moves: 25 },
    5: { mode: 'score', targetScore: 8000, moves: 30 }
  }
};
