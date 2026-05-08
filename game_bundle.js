// 开心消消乐 - Happy Match Bundle
// Auto-generated, do not edit

// ===== config.js =====
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


// ===== candy.js =====
// ============================================================
// candy.js - 开心消消乐 方块精灵绘制
// ============================================================

var CandyRenderer = (function() {
  'use strict';

  var SIZE = CONFIG.CELL_SIZE;
  var HALF = SIZE / 2;
  var RADIUS = SIZE * 0.38;
  var EPS = 0.001;

  // 精灵缓存
  var _spriteCache = {};
  var _obstacleCache = {};
  var _ingredientCache = {};

  // ---- 工具方法 ----

  /** 绘制圆角矩形路径（使用arcTo） */
  function roundRectPath(ctx, x, y, w, h, r) {
    r = Math.max(EPS, Math.min(r, w / 2, h / 2));
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
  }

  /** 创建离屏Canvas */
  function createOffscreen(w, h) {
    var canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    return canvas;
  }

  /** 获取颜色值 */
  function getColor(colorName) {
    return CONFIG.CANDY_COLOR_MAP[colorName] || '#FFFFFF';
  }

  function getLightColor(colorName) {
    return CONFIG.CANDY_LIGHT_MAP[colorName] || '#FFFFFF';
  }

  function getDarkColor(colorName) {
    return CONFIG.CANDY_DARK_MAP[colorName] || '#000000';
  }

  // ---- 普通方块绘制 ----

  /** 绘制基础糖果形状（圆形） */
  function drawBaseCandy(ctx, color, cx, cy, radius) {
    var mainColor = getColor(color);
    var lightColor = getLightColor(color);
    var darkColor = getDarkColor(color);

    // 阴影
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 2;

    // 主体渐变
    var grad = ctx.createRadialGradient(cx - radius * 0.3, cy - radius * 0.3, radius * 0.1, cx, cy, radius);
    grad.addColorStop(0, lightColor);
    grad.addColorStop(0.6, mainColor);
    grad.addColorStop(1, darkColor);

    ctx.beginPath();
    ctx.arc(cx, cy, Math.max(EPS, radius), 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.restore();

    // 高光
    var hlGrad = ctx.createRadialGradient(cx - radius * 0.25, cy - radius * 0.3, 0, cx - radius * 0.25, cy - radius * 0.3, radius * 0.5);
    hlGrad.addColorStop(0, 'rgba(255,255,255,0.7)');
    hlGrad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.beginPath();
    ctx.arc(cx, cy, Math.max(EPS, radius), 0, Math.PI * 2);
    ctx.fillStyle = hlGrad;
    ctx.fill();

    // 边框
    ctx.beginPath();
    ctx.arc(cx, cy, Math.max(EPS, radius), 0, Math.PI * 2);
    ctx.strokeStyle = darkColor;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  /** 红色糖果 - 圆形+星星图案 */
  function drawRedCandy(ctx, cx, cy) {
    drawBaseCandy(ctx, 'red', cx, cy, RADIUS);
    // 星星
    drawStar(ctx, cx, cy + 1, 5, RADIUS * 0.35, RADIUS * 0.15, 'rgba(255,255,255,0.6)');
  }

  /** 橙色糖果 - 三角形糖果 */
  function drawOrangeCandy(ctx, cx, cy) {
    var mainColor = getColor('orange');
    var lightColor = getLightColor('orange');
    var darkColor = getDarkColor('orange');

    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 2;

    // 三角形
    var r = RADIUS * 0.9;
    ctx.beginPath();
    ctx.moveTo(cx, cy - r);
    ctx.lineTo(cx + r * 0.87, cy + r * 0.5);
    ctx.lineTo(cx - r * 0.87, cy + r * 0.5);
    ctx.closePath();

    var grad = ctx.createLinearGradient(cx, cy - r, cx, cy + r * 0.5);
    grad.addColorStop(0, lightColor);
    grad.addColorStop(0.5, mainColor);
    grad.addColorStop(1, darkColor);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.restore();

    // 高光
    ctx.beginPath();
    ctx.moveTo(cx, cy - r * 0.7);
    ctx.lineTo(cx + r * 0.3, cy - r * 0.1);
    ctx.lineTo(cx - r * 0.3, cy - r * 0.1);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fill();

    ctx.strokeStyle = darkColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx, cy - r);
    ctx.lineTo(cx + r * 0.87, cy + r * 0.5);
    ctx.lineTo(cx - r * 0.87, cy + r * 0.5);
    ctx.closePath();
    ctx.stroke();
  }

  /** 黄色糖果 - 菱形糖果 */
  function drawYellowCandy(ctx, cx, cy) {
    var mainColor = getColor('yellow');
    var lightColor = getLightColor('yellow');
    var darkColor = getDarkColor('yellow');

    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 2;

    var r = RADIUS * 0.95;
    ctx.beginPath();
    ctx.moveTo(cx, cy - r);
    ctx.lineTo(cx + r * 0.75, cy);
    ctx.lineTo(cx, cy + r);
    ctx.lineTo(cx - r * 0.75, cy);
    ctx.closePath();

    var grad = ctx.createLinearGradient(cx - r, cy, cx + r, cy);
    grad.addColorStop(0, lightColor);
    grad.addColorStop(0.5, mainColor);
    grad.addColorStop(1, darkColor);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.restore();

    // 高光
    ctx.beginPath();
    ctx.moveTo(cx, cy - r * 0.6);
    ctx.lineTo(cx + r * 0.25, cy - r * 0.1);
    ctx.lineTo(cx, cy + r * 0.1);
    ctx.lineTo(cx - r * 0.25, cy - r * 0.1);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fill();

    ctx.strokeStyle = darkColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx, cy - r);
    ctx.lineTo(cx + r * 0.75, cy);
    ctx.lineTo(cx, cy + r);
    ctx.lineTo(cx - r * 0.75, cy);
    ctx.closePath();
    ctx.stroke();
  }

  /** 绿色糖果 - 圆形+叶子 */
  function drawGreenCandy(ctx, cx, cy) {
    drawBaseCandy(ctx, 'green', cx, cy, RADIUS);
    // 叶子
    ctx.save();
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.beginPath();
    ctx.ellipse(cx - 3, cy - 2, 5, 3, -0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + 3, cy - 2, 5, 3, 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  /** 青色糖果 - 六边形 */
  function drawCyanCandy(ctx, cx, cy) {
    var mainColor = getColor('cyan');
    var lightColor = getLightColor('cyan');
    var darkColor = getDarkColor('cyan');

    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 2;

    var r = RADIUS * 0.9;
    ctx.beginPath();
    for (var i = 0; i < 6; i++) {
      var angle = (Math.PI / 3) * i - Math.PI / 6;
      var px = cx + r * Math.cos(angle);
      var py = cy + r * Math.sin(angle);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();

    var grad = ctx.createRadialGradient(cx - r * 0.2, cy - r * 0.2, 0, cx, cy, r);
    grad.addColorStop(0, lightColor);
    grad.addColorStop(0.7, mainColor);
    grad.addColorStop(1, darkColor);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.restore();

    // 高光
    ctx.beginPath();
    ctx.arc(cx - r * 0.2, cy - r * 0.2, r * 0.35, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.fill();

    ctx.strokeStyle = darkColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (var i = 0; i < 6; i++) {
      var angle = (Math.PI / 3) * i - Math.PI / 6;
      var px = cx + r * Math.cos(angle);
      var py = cy + r * Math.sin(angle);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.stroke();
  }

  /** 蓝色糖果 - 方形圆角 */
  function drawBlueCandy(ctx, cx, cy) {
    var mainColor = getColor('blue');
    var lightColor = getLightColor('blue');
    var darkColor = getDarkColor('blue');

    var s = RADIUS * 1.5;
    var x = cx - s / 2;
    var y = cy - s / 2;
    var r = 6;

    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 2;

    var grad = ctx.createLinearGradient(x, y, x + s, y + s);
    grad.addColorStop(0, lightColor);
    grad.addColorStop(0.5, mainColor);
    grad.addColorStop(1, darkColor);

    roundRectPath(ctx, x, y, s, s, r);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.restore();

    // 高光
    roundRectPath(ctx, x + 3, y + 3, s * 0.5, s * 0.35, 3);
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fill();

    roundRectPath(ctx, x, y, s, s, r);
    ctx.strokeStyle = darkColor;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  /** 紫色糖果 - 心形 */
  function drawPurpleCandy(ctx, cx, cy) {
    var mainColor = getColor('purple');
    var lightColor = getLightColor('purple');
    var darkColor = getDarkColor('purple');

    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 2;

    var s = RADIUS * 0.06;
    ctx.translate(cx, cy + 2);
    ctx.scale(s, s);

    // 心形路径
    ctx.beginPath();
    ctx.moveTo(0, -6);
    ctx.bezierCurveTo(-12, -18, -24, -6, -12, 6);
    ctx.lineTo(0, 16);
    ctx.lineTo(12, 6);
    ctx.bezierCurveTo(24, -6, 12, -18, 0, -6);
    ctx.closePath();

    var grad = ctx.createRadialGradient(-4, -4, 0, 0, 0, 18);
    grad.addColorStop(0, lightColor);
    grad.addColorStop(0.6, mainColor);
    grad.addColorStop(1, darkColor);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.restore();

    // 高光
    ctx.save();
    ctx.translate(cx, cy + 2);
    ctx.scale(s, s);
    ctx.beginPath();
    ctx.arc(-6, -6, 4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.fill();
    ctx.restore();
  }

  /** 绘制星星 */
  function drawStar(ctx, cx, cy, points, outerR, innerR, color) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    for (var i = 0; i < points * 2; i++) {
      var r = (i % 2 === 0) ? outerR : innerR;
      var angle = (Math.PI / points) * i - Math.PI / 2;
      var px = cx + r * Math.cos(angle);
      var py = cy + r * Math.sin(angle);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // ---- 特殊方块绘制 ----

  /** 绘制条纹糖果 */
  function drawStripedCandy(ctx, color, direction, cx, cy) {
    // 先绘制基础糖果
    var drawFunc = getDrawFunction(color);
    drawFunc(ctx, cx, cy);

    // 绘制条纹
    ctx.save();
    ctx.globalAlpha = 0.7;
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2.5;

    if (direction === CONFIG.SPECIAL.STRIPED_H) {
      // 横向条纹
      for (var i = -2; i <= 2; i++) {
        var yy = cy + i * 5;
        ctx.beginPath();
        ctx.moveTo(cx - RADIUS * 0.7, yy);
        ctx.lineTo(cx + RADIUS * 0.7, yy);
        ctx.stroke();
      }
    } else {
      // 纵向条纹
      for (var i = -2; i <= 2; i++) {
        var xx = cx + i * 5;
        ctx.beginPath();
        ctx.moveTo(xx, cy - RADIUS * 0.7);
        ctx.lineTo(xx, cy + RADIUS * 0.7);
        ctx.stroke();
      }
    }
    ctx.restore();

    // 条纹边框发光
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, Math.max(EPS, RADIUS + 2), 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
  }

  /** 绘制包装糖果 */
  function drawWrappedCandy(ctx, color, cx, cy) {
    // 先绘制基础糖果
    var drawFunc = getDrawFunction(color);
    drawFunc(ctx, cx, cy);

    // 包装纸效果
    ctx.save();
    var wrapSize = RADIUS * 0.9;

    // 交叉线
    ctx.strokeStyle = 'rgba(255,255,255,0.8)';
    ctx.lineWidth = 3;

    // 对角线1
    ctx.beginPath();
    ctx.moveTo(cx - wrapSize, cy - wrapSize);
    ctx.lineTo(cx + wrapSize, cy + wrapSize);
    ctx.stroke();

    // 对角线2
    ctx.beginPath();
    ctx.moveTo(cx + wrapSize, cy - wrapSize);
    ctx.lineTo(cx - wrapSize, cy + wrapSize);
    ctx.stroke();

    // 中心小方块
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    roundRectPath(ctx, cx - 4, cy - 4, 8, 8, 2);
    ctx.fill();

    ctx.restore();

    // 发光边框
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, Math.max(EPS, RADIUS + 2), 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,215,0,0.6)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }

  /** 绘制彩色球 */
  function drawColorBomb(ctx, cx, cy, time) {
    var t = time || 0;

    ctx.save();
    ctx.shadowColor = 'rgba(255,255,255,0.5)';
    ctx.shadowBlur = 8;

    // 多彩渐变球
    var colors = ['#FF4444', '#FF8C00', '#FFD700', '#32CD32', '#00CED1', '#4169E1', '#9370DB'];
    var angleOffset = t * 0.002;

    var grad = ctx.createConicGradient(angleOffset, cx, cy);
    for (var i = 0; i < colors.length; i++) {
      grad.addColorStop(i / colors.length, colors[i]);
    }
    grad.addColorStop(1, colors[0]);

    ctx.beginPath();
    ctx.arc(cx, cy, Math.max(EPS, RADIUS), 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.restore();

    // 高光
    var hlGrad = ctx.createRadialGradient(cx - RADIUS * 0.3, cy - RADIUS * 0.3, 0, cx, cy, RADIUS);
    hlGrad.addColorStop(0, 'rgba(255,255,255,0.6)');
    hlGrad.addColorStop(0.5, 'rgba(255,255,255,0.1)');
    hlGrad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.beginPath();
    ctx.arc(cx, cy, Math.max(EPS, RADIUS), 0, Math.PI * 2);
    ctx.fillStyle = hlGrad;
    ctx.fill();

    // 星星装饰
    ctx.save();
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    var starAngle = t * 0.003;
    for (var i = 0; i < 4; i++) {
      var a = starAngle + (Math.PI / 2) * i;
      var sx = cx + RADIUS * 0.55 * Math.cos(a);
      var sy = cy + RADIUS * 0.55 * Math.sin(a);
      drawStar(ctx, sx, sy, 4, 3, 1.5, 'rgba(255,255,255,0.8)');
    }
    ctx.restore();

    // 边框
    ctx.beginPath();
    ctx.arc(cx, cy, Math.max(EPS, RADIUS), 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  /** 绘制彩虹球 */
  function drawRainbow(ctx, cx, cy, time) {
    var t = time || 0;

    ctx.save();
    ctx.shadowColor = 'rgba(255,255,255,0.8)';
    ctx.shadowBlur = 12;

    // 彩虹渐变
    var grad = ctx.createConicGradient(t * 0.003, cx, cy);
    grad.addColorStop(0, '#FF0000');
    grad.addColorStop(0.17, '#FF8800');
    grad.addColorStop(0.33, '#FFFF00');
    grad.addColorStop(0.5, '#00FF00');
    grad.addColorStop(0.67, '#0088FF');
    grad.addColorStop(0.83, '#8800FF');
    grad.addColorStop(1, '#FF0000');

    ctx.beginPath();
    ctx.arc(cx, cy, Math.max(EPS, RADIUS * 1.05), 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.restore();

    // 内部白色球
    var innerGrad = ctx.createRadialGradient(cx - 3, cy - 3, 0, cx, cy, RADIUS * 0.5);
    innerGrad.addColorStop(0, '#FFFFFF');
    innerGrad.addColorStop(1, 'rgba(255,255,255,0.3)');
    ctx.beginPath();
    ctx.arc(cx, cy, Math.max(EPS, RADIUS * 0.5), 0, Math.PI * 2);
    ctx.fillStyle = innerGrad;
    ctx.fill();

    // 旋转光环
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, Math.max(EPS, RADIUS * 0.75), t * 0.005, t * 0.005 + Math.PI * 1.2);
    ctx.stroke();
    ctx.restore();
  }

  // ---- 障碍物绘制 ----

  /** 绘制冰块 */
  function drawIce(ctx, cx, cy, layers) {
    var alpha = 0.2 + layers * 0.15;
    ctx.save();

    // 冰块背景
    var grad = ctx.createLinearGradient(cx - HALF, cy - HALF, cx + HALF, cy + HALF);
    grad.addColorStop(0, 'rgba(135,206,250,' + alpha + ')');
    grad.addColorStop(0.5, 'rgba(173,216,230,' + (alpha + 0.1) + ')');
    grad.addColorStop(1, 'rgba(100,149,237,' + alpha + ')');

    roundRectPath(ctx, cx - HALF + 1, cy - HALF + 1, SIZE - 2, SIZE - 2, 4);
    ctx.fillStyle = grad;
    ctx.fill();

    // 冰裂纹
    ctx.strokeStyle = 'rgba(255,255,255,' + (alpha + 0.2) + ')';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - 8, cy - 10);
    ctx.lineTo(cx + 2, cy);
    ctx.lineTo(cx - 5, cy + 8);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + 6, cy - 8);
    ctx.lineTo(cx + 10, cy + 2);
    ctx.stroke();

    // 层数指示
    if (layers > 1) {
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.font = 'bold 10px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(layers.toString(), cx + HALF - 8, cy - HALF + 8);
    }

    ctx.restore();
  }

  /** 绘制锁链 */
  function drawLock(ctx, cx, cy) {
    ctx.save();

    // 锁链背景
    ctx.fillStyle = 'rgba(100,100,100,0.4)';
    roundRectPath(ctx, cx - HALF + 1, cy - HALF + 1, SIZE - 2, SIZE - 2, 4);
    ctx.fill();

    // 锁的形状
    var lockW = 16, lockH = 14;
    var lockX = cx - lockW / 2;
    var lockY = cy - lockH / 2 + 2;

    // 锁身
    ctx.fillStyle = '#888';
    roundRectPath(ctx, lockX, lockY, lockW, lockH, 3);
    ctx.fill();
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 1;
    roundRectPath(ctx, lockX, lockY, lockW, lockH, 3);
    ctx.stroke();

    // 锁环
    ctx.strokeStyle = '#999';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, lockY, 6, Math.PI, 0);
    ctx.stroke();

    // 锁孔
    ctx.fillStyle = '#444';
    ctx.beginPath();
    ctx.arc(cx, lockY + lockH / 2, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(cx - 1, lockY + lockH / 2, 2, 4);

    ctx.restore();
  }

  /** 绘制石头 */
  function drawStone(ctx, cx, cy) {
    ctx.save();

    // 石头主体
    var grad = ctx.createRadialGradient(cx - 4, cy - 4, 0, cx, cy, HALF);
    grad.addColorStop(0, '#999');
    grad.addColorStop(0.5, '#777');
    grad.addColorStop(1, '#555');

    roundRectPath(ctx, cx - HALF + 2, cy - HALF + 2, SIZE - 4, SIZE - 4, 6);
    ctx.fillStyle = grad;
    ctx.fill();

    // 纹理
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - 10, cy - 5);
    ctx.lineTo(cx + 5, cy - 8);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - 8, cy + 3);
    ctx.lineTo(cx + 12, cy + 1);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - 3, cy + 8);
    ctx.lineTo(cx + 8, cy + 10);
    ctx.stroke();

    // 高光
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.beginPath();
    ctx.ellipse(cx - 5, cy - 5, 8, 5, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // 边框
    roundRectPath(ctx, cx - HALF + 2, cy - HALF + 2, SIZE - 4, SIZE - 4, 6);
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.restore();
  }

  /** 绘制巧克力 */
  function drawChocolate(ctx, cx, cy) {
    ctx.save();

    var grad = ctx.createLinearGradient(cx - HALF, cy - HALF, cx + HALF, cy + HALF);
    grad.addColorStop(0, '#8B4513');
    grad.addColorStop(0.3, '#A0522D');
    grad.addColorStop(0.7, '#6B3410');
    grad.addColorStop(1, '#4A2508');

    roundRectPath(ctx, cx - HALF + 2, cy - HALF + 2, SIZE - 4, SIZE - 4, 4);
    ctx.fillStyle = grad;
    ctx.fill();

    // 巧克力纹路（网格）
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.lineWidth = 1;
    // 横线
    ctx.beginPath();
    ctx.moveTo(cx - HALF + 2, cy);
    ctx.lineTo(cx + HALF - 2, cy);
    ctx.stroke();
    // 竖线
    ctx.beginPath();
    ctx.moveTo(cx, cy - HALF + 2);
    ctx.lineTo(cx, cy + HALF - 2);
    ctx.stroke();

    // 高光
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    roundRectPath(ctx, cx - HALF + 4, cy - HALF + 4, SIZE / 2 - 4, SIZE / 2 - 4, 3);
    ctx.fill();

    // 边框
    roundRectPath(ctx, cx - HALF + 2, cy - HALF + 2, SIZE - 4, SIZE - 4, 4);
    ctx.strokeStyle = '#3A1A05';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.restore();
  }

  /** 绘制糖霜 */
  function drawFrosting(ctx, cx, cy) {
    ctx.save();

    ctx.fillStyle = 'rgba(200,230,255,0.5)';
    roundRectPath(ctx, cx - HALF + 1, cy - HALF + 1, SIZE - 2, SIZE - 2, 4);
    ctx.fill();

    // 糖霜波浪
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (var x = cx - HALF + 4; x < cx + HALF - 4; x += 2) {
      var y = cy - HALF + 6 + Math.sin((x - cx) * 0.3) * 3;
      if (x === cx - HALF + 4) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    ctx.restore();
  }

  /** 绘制果冻底层 */
  function drawJelly(ctx, cx, cy, layers) {
    ctx.save();
    var alpha = 0.2 + layers * 0.15;

    // 果冻底层
    var grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, HALF);
    grad.addColorStop(0, 'rgba(50,205,50,' + (alpha + 0.1) + ')');
    grad.addColorStop(1, 'rgba(34,139,34,' + alpha + ')');

    roundRectPath(ctx, cx - HALF + 1, cy - HALF + 1, SIZE - 2, SIZE - 2, 4);
    ctx.fillStyle = grad;
    ctx.fill();

    // 果冻高光
    ctx.fillStyle = 'rgba(255,255,255,' + (alpha * 0.5) + ')';
    ctx.beginPath();
    ctx.ellipse(cx, cy - 5, 12, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // ---- 果子绘制 ----

  /** 绘制樱桃 */
  function drawCherry(ctx, cx, cy) {
    ctx.save();

    // 茎
    ctx.strokeStyle = '#228B22';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - 5, cy - 2);
    ctx.quadraticCurveTo(cx - 2, cy - 16, cx + 4, cy - 14);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + 5, cy - 2);
    ctx.quadraticCurveTo(cx + 2, cy - 16, cx + 4, cy - 14);
    ctx.stroke();

    // 叶子
    ctx.fillStyle = '#32CD32';
    ctx.beginPath();
    ctx.ellipse(cx + 4, cy - 14, 5, 3, 0.3, 0, Math.PI * 2);
    ctx.fill();

    // 左樱桃
    var grad1 = ctx.createRadialGradient(cx - 7, cy - 4, 1, cx - 5, cy, 8);
    grad1.addColorStop(0, '#FF6B6B');
    grad1.addColorStop(0.7, '#DC143C');
    grad1.addColorStop(1, '#8B0000');
    ctx.beginPath();
    ctx.arc(cx - 5, cy + 2, 8, 0, Math.PI * 2);
    ctx.fillStyle = grad1;
    ctx.fill();

    // 右樱桃
    var grad2 = ctx.createRadialGradient(cx + 7, cy - 4, 1, cx + 5, cy, 8);
    grad2.addColorStop(0, '#FF6B6B');
    grad2.addColorStop(0.7, '#DC143C');
    grad2.addColorStop(1, '#8B0000');
    ctx.beginPath();
    ctx.arc(cx + 5, cy + 2, 8, 0, Math.PI * 2);
    ctx.fillStyle = grad2;
    ctx.fill();

    // 高光
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.beginPath();
    ctx.arc(cx - 7, cy, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + 3, cy, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  /** 绘制榛子 */
  function drawHazelnut(ctx, cx, cy) {
    ctx.save();

    // 帽子
    ctx.fillStyle = '#8B7355';
    ctx.beginPath();
    ctx.ellipse(cx, cy - 8, 10, 5, 0, Math.PI, 0);
    ctx.fill();
    ctx.strokeStyle = '#6B5335';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(cx, cy - 8, 10, 5, 0, Math.PI, 0);
    ctx.stroke();

    // 帽子纹理
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.lineWidth = 0.5;
    for (var i = -8; i <= 8; i += 3) {
      ctx.beginPath();
      ctx.moveTo(cx + i, cy - 8);
      ctx.lineTo(cx + i * 0.7, cy - 12);
      ctx.stroke();
    }

    // 榛子主体
    var grad = ctx.createRadialGradient(cx - 3, cy - 2, 1, cx, cy + 2, 12);
    grad.addColorStop(0, '#D2B48C');
    grad.addColorStop(0.5, '#A0522D');
    grad.addColorStop(1, '#6B3410');
    ctx.beginPath();
    ctx.arc(cx, cy + 2, 11, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    // 高光
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.beginPath();
    ctx.ellipse(cx - 3, cy - 1, 5, 3, -0.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // ---- 绘制函数映射 ----

  function getDrawFunction(color) {
    switch (color) {
      case 'red': return drawRedCandy;
      case 'orange': return drawOrangeCandy;
      case 'yellow': return drawYellowCandy;
      case 'green': return drawGreenCandy;
      case 'cyan': return drawCyanCandy;
      case 'blue': return drawBlueCandy;
      case 'purple': return drawPurpleCandy;
      default: return drawRedCandy;
    }
  }

  // ---- 公共API ----

  return {
    /**
     * 绘制糖果到指定Canvas上下文
     * @param {CanvasRenderingContext2D} ctx
     * @param {Object} candy - {color, special}
     * @param {number} x - 左上角x
     * @param {number} y - 左上角y
     * @param {number} time - 当前时间（用于动画）
     */
    drawCandy: function(ctx, candy, x, y, time) {
      if (!candy) return;

      var cx = x + HALF;
      var cy = y + HALF;
      var t = time || 0;

      switch (candy.special) {
        case CONFIG.SPECIAL.STRIPED_H:
          drawStripedCandy(ctx, candy.color, CONFIG.SPECIAL.STRIPED_H, cx, cy);
          break;
        case CONFIG.SPECIAL.STRIPED_V:
          drawStripedCandy(ctx, candy.color, CONFIG.SPECIAL.STRIPED_V, cx, cy);
          break;
        case CONFIG.SPECIAL.WRAPPED:
          drawWrappedCandy(ctx, candy.color, cx, cy);
          break;
        case CONFIG.SPECIAL.COLOR_BOMB:
          drawColorBomb(ctx, cx, cy, t);
          break;
        case CONFIG.SPECIAL.RAINBOW:
          drawRainbow(ctx, cx, cy, t);
          break;
        default:
          var drawFunc = getDrawFunction(candy.color);
          drawFunc(ctx, cx, cy);
          break;
      }
    },

    /**
     * 绘制障碍物
     */
    drawObstacle: function(ctx, obstacle, x, y) {
      if (!obstacle || obstacle.type === CONFIG.OBSTACLE.NONE) return;

      var cx = x + HALF;
      var cy = y + HALF;

      switch (obstacle.type) {
        case CONFIG.OBSTACLE.ICE_1:
          drawIce(ctx, cx, cy, 1);
          break;
        case CONFIG.OBSTACLE.ICE_2:
          drawIce(ctx, cx, cy, 2);
          break;
        case CONFIG.OBSTACLE.ICE_3:
          drawIce(ctx, cx, cy, 3);
          break;
        case CONFIG.OBSTACLE.LOCK:
          drawLock(ctx, cx, cy);
          break;
        case CONFIG.OBSTACLE.STONE:
          drawStone(ctx, cx, cy);
          break;
        case CONFIG.OBSTACLE.CHOCOLATE:
          drawChocolate(ctx, cx, cy);
          break;
        case CONFIG.OBSTACLE.FROSTING:
          drawFrosting(ctx, cx, cy);
          break;
      }
    },

    /**
     * 绘制果冻
     */
    drawJelly: function(ctx, layers, x, y) {
      if (!layers || layers <= 0) return;
      var cx = x + HALF;
      var cy = y + HALF;
      drawJelly(ctx, cx, cy, layers);
    },

    /**
     * 绘制果子
     */
    drawIngredient: function(ctx, type, x, y) {
      if (!type) return;
      var cx = x + HALF;
      var cy = y + HALF;

      switch (type) {
        case 'cherry':
          drawCherry(ctx, cx, cy);
          break;
        case 'hazelnut':
          drawHazelnut(ctx, cx, cy);
          break;
      }
    },

    /**
     * 绘制选中效果
     */
    drawSelection: function(ctx, x, y, time) {
      var t = time || 0;
      var pulse = 1 + Math.sin(t * 0.008) * 0.1;
      var cx = x + HALF;
      var cy = y + HALF;

      ctx.save();
      ctx.strokeStyle = 'rgba(255,255,255,0.8)';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([4, 3]);
      ctx.lineDashOffset = -t * 0.02;

      ctx.beginPath();
      ctx.arc(cx, cy, Math.max(EPS, RADIUS * pulse + 3), 0, Math.PI * 2);
      ctx.stroke();

      ctx.setLineDash([]);
      ctx.restore();
    },

    /**
     * 绘制传送门效果
     */
    drawPortal: function(ctx, x, y, time) {
      var t = time || 0;
      var cx = x + HALF;
      var cy = y + HALF;

      ctx.save();
      var grad = ctx.createRadialGradient(cx, cy, 2, cx, cy, HALF);
      grad.addColorStop(0, 'rgba(138,43,226,0.6)');
      grad.addColorStop(0.5, 'rgba(75,0,130,0.3)');
      grad.addColorStop(1, 'rgba(75,0,130,0)');

      ctx.beginPath();
      ctx.arc(cx, cy, Math.max(EPS, HALF), 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // 旋转效果
      ctx.strokeStyle = 'rgba(200,150,255,0.5)';
      ctx.lineWidth = 1.5;
      var startAngle = t * 0.004;
      ctx.beginPath();
      ctx.arc(cx, cy, Math.max(EPS, HALF * 0.6), startAngle, startAngle + Math.PI);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, Math.max(EPS, HALF * 0.6), startAngle + Math.PI, startAngle + Math.PI * 2);
      ctx.stroke();

      ctx.restore();
    },

    /**
     * 获取方块绘制函数（用于缓存精灵）
     */
    getDrawFunction: getDrawFunction,

    /** 常量 */
    SIZE: SIZE,
    HALF: HALF,
    RADIUS: RADIUS
  };
})();


// ===== particles.js =====
// ============================================================
// particles.js - 开心消消乐 粒子系统
// ============================================================

class ParticleSystem {
  constructor() {
    this.particles = [];
    this.maxParticles = 500;
  }

  // ---- 粒子创建 ----

  /**
   * 创建消除粒子
   * @param {number} x - 中心X
   * @param {number} y - 中心Y
   * @param {string} color - 颜色
   * @param {number} count - 粒子数量
   */
  emitMatch(x, y, color, count) {
    count = count || CONFIG.PARTICLE_COUNT;
    var colorVal = CONFIG.CANDY_COLOR_MAP[color] || '#FFFFFF';

    for (var i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) break;

      var angle = (Math.PI * 2 / count) * i + (Math.random() - 0.5) * 0.5;
      var speed = CONFIG.PARTICLE_SPEED * (0.5 + Math.random() * 1);
      var size = 3 + Math.random() * 4;

      this.particles.push({
        type: 'match',
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1,
        size: size,
        color: colorVal,
        alpha: 1,
        life: CONFIG.PARTICLE_LIFE * (0.6 + Math.random() * 0.4),
        elapsed: 0,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
        gravity: 0.05
      });
    }
  }

  /**
   * 创建条纹特效粒子
   * @param {number} x - 中心X
   * @param {number} y - 中心Y
   * @param {string} direction - 'h' 或 'v'
   * @param {string} color - 颜色
   */
  emitStriped(x, y, direction, color) {
    var colorVal = CONFIG.CANDY_COLOR_MAP[color] || '#FFFFFF';

    if (direction === 'h') {
      // 横向线条粒子
      for (var i = 0; i < 20; i++) {
        if (this.particles.length >= this.maxParticles) break;
        var px = x + (Math.random() - 0.5) * CONFIG.BOARD_COLS * CONFIG.CELL_SIZE;
        this.particles.push({
          type: 'line',
          x: px,
          y: y,
          vx: 0,
          vy: (Math.random() - 0.5) * 2,
          size: 8 + Math.random() * 12,
          color: colorVal,
          alpha: 1,
          life: 400,
          elapsed: 0,
          rotation: 0,
          rotationSpeed: 0,
          gravity: 0,
          width: 3 + Math.random() * 2
        });
      }
    } else {
      // 纵向线条粒子
      for (var i = 0; i < 20; i++) {
        if (this.particles.length >= this.maxParticles) break;
        var py = y + (Math.random() - 0.5) * CONFIG.BOARD_ROWS * CONFIG.CELL_SIZE;
        this.particles.push({
          type: 'line',
          x: x,
          y: py,
          vx: (Math.random() - 0.5) * 2,
          vy: 0,
          size: 8 + Math.random() * 12,
          color: colorVal,
          alpha: 1,
          life: 400,
          elapsed: 0,
          rotation: Math.PI / 2,
          rotationSpeed: 0,
          gravity: 0,
          width: 3 + Math.random() * 2
        });
      }
    }
  }

  /**
   * 创建包装爆炸粒子
   * @param {number} x - 中心X
   * @param {number} y - 中心Y
   * @param {string} color - 颜色
   */
  emitWrapped(x, y, color) {
    var colorVal = CONFIG.CANDY_COLOR_MAP[color] || '#FFFFFF';

    // 爆炸环
    for (var i = 0; i < 24; i++) {
      if (this.particles.length >= this.maxParticles) break;
      var angle = (Math.PI * 2 / 24) * i;
      var speed = 2 + Math.random() * 3;

      this.particles.push({
        type: 'spark',
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2 + Math.random() * 3,
        color: colorVal,
        alpha: 1,
        life: 500,
        elapsed: 0,
        rotation: 0,
        rotationSpeed: 0,
        gravity: 0.02
      });
    }

    // 中心闪光
    this.particles.push({
      type: 'flash',
      x: x,
      y: y,
      vx: 0,
      vy: 0,
      size: 10,
      color: '#FFFFFF',
      alpha: 1,
      life: 300,
      elapsed: 0,
      rotation: 0,
      rotationSpeed: 0,
      gravity: 0
    });
  }

  /**
   * 创建彩色球消除粒子
   * @param {number} x - 中心X
   * @param {number} y - 中心Y
   */
  emitColorBomb(x, y) {
    var colors = ['#FF4444', '#FF8C00', '#FFD700', '#32CD32', '#00CED1', '#4169E1', '#9370DB'];

    // 彩色射线
    for (var i = 0; i < 36; i++) {
      if (this.particles.length >= this.maxParticles) break;
      var angle = (Math.PI * 2 / 36) * i;
      var speed = 3 + Math.random() * 4;
      var color = colors[i % colors.length];

      this.particles.push({
        type: 'spark',
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2 + Math.random() * 3,
        color: color,
        alpha: 1,
        life: 600,
        elapsed: 0,
        rotation: 0,
        rotationSpeed: 0,
        gravity: 0.01
      });
    }

    // 彩色碎片
    for (var i = 0; i < 15; i++) {
      if (this.particles.length >= this.maxParticles) break;
      var angle = Math.random() * Math.PI * 2;
      var speed = 1 + Math.random() * 2;
      var color = colors[Math.floor(Math.random() * colors.length)];

      this.particles.push({
        type: 'match',
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        size: 4 + Math.random() * 5,
        color: color,
        alpha: 1,
        life: 800,
        elapsed: 0,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.15,
        gravity: 0.04
      });
    }

    // 中心大闪光
    this.particles.push({
      type: 'flash',
      x: x,
      y: y,
      vx: 0,
      vy: 0,
      size: 30,
      color: '#FFFFFF',
      alpha: 1,
      life: 400,
      elapsed: 0,
      rotation: 0,
      rotationSpeed: 0,
      gravity: 0
    });
  }

  /**
   * 创建彩虹粒子
   * @param {number} x - 中心X
   * @param {number} y - 中心Y
   */
  emitRainbow(x, y) {
    var colors = ['#FF0000', '#FF8800', '#FFFF00', '#00FF00', '#0088FF', '#8800FF'];

    // 彩虹弧线
    for (var ring = 0; ring < 3; ring++) {
      for (var i = 0; i < 30; i++) {
        if (this.particles.length >= this.maxParticles) break;
        var angle = (Math.PI * 2 / 30) * i + ring * 0.2;
        var speed = 2 + ring * 1.5 + Math.random();
        var color = colors[(i + ring) % colors.length];

        this.particles.push({
          type: 'spark',
          x: x,
          y: y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 3 + ring,
          color: color,
          alpha: 1,
          life: 700 + ring * 100,
          elapsed: 0,
          rotation: 0,
          rotationSpeed: 0,
          gravity: 0
        });
      }
    }

    // 中心超大闪光
    this.particles.push({
      type: 'flash',
      x: x,
      y: y,
      vx: 0,
      vy: 0,
      size: 50,
      color: '#FFFFFF',
      alpha: 1,
      life: 500,
      elapsed: 0,
      rotation: 0,
      rotationSpeed: 0,
      gravity: 0
    });
  }

  /**
   * 创建分数粒子
   * @param {number} x - X位置
   * @param {number} y - Y位置
   * @param {number} score - 分数
   * @param {boolean} isCombo - 是否连击
   */
  emitScore(x, y, score, isCombo) {
    this.particles.push({
      type: 'score_text',
      x: x,
      y: y,
      vx: 0,
      vy: -1.5,
      size: isCombo ? 18 : 14,
      color: isCombo ? '#FF6600' : '#FFD700',
      alpha: 1,
      life: 900,
      elapsed: 0,
      rotation: 0,
      rotationSpeed: 0,
      gravity: 0,
      text: '+' + score,
      isCombo: isCombo || false
    });
  }

  /**
   * 创建连击提示粒子
   * @param {number} x - X位置
   * @param {number} y - Y位置
   * @param {number} combo - 连击数
   */
  emitCombo(x, y, combo) {
    var texts = ['', '', 'Good!', 'Great!', 'Excellent!', 'Amazing!', 'Incredible!', 'Unbelievable!'];
    var text = combo < texts.length ? texts[combo] : 'GODLIKE!';

    this.particles.push({
      type: 'combo_text',
      x: x,
      y: y,
      vx: 0,
      vy: -0.8,
      size: 20 + combo * 2,
      color: combo >= 5 ? '#FF4444' : combo >= 3 ? '#FF8C00' : '#FFD700',
      alpha: 1,
      life: 1200,
      elapsed: 0,
      rotation: 0,
      rotationSpeed: 0,
      gravity: 0,
      text: text
    });
  }

  // ---- 更新 ----

  /**
   * 更新所有粒子
   * @param {number} dt - 帧间隔时间（毫秒）
   */
  update(dt) {
    for (var i = this.particles.length - 1; i >= 0; i--) {
      var p = this.particles[i];
      p.elapsed += dt;

      if (p.elapsed >= p.life) {
        this.particles.splice(i, 1);
        continue;
      }

      var lifeRatio = p.elapsed / p.life;

      // 更新位置
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;

      // 更新透明度
      if (p.type === 'flash') {
        p.alpha = 1 - lifeRatio;
        p.size += 2;
      } else if (p.type === 'score_text' || p.type === 'combo_text') {
        if (lifeRatio > 0.7) {
          p.alpha = 1 - (lifeRatio - 0.7) / 0.3;
        }
      } else {
        if (lifeRatio > 0.5) {
          p.alpha = 1 - (lifeRatio - 0.5) / 0.5;
        }
      }

      // 更新旋转
      p.rotation += p.rotationSpeed;
    }
  }

  // ---- 渲染 ----

  /**
   * 渲染所有粒子
   * @param {CanvasRenderingContext2D} ctx
   */
  render(ctx) {
    for (var i = 0; i < this.particles.length; i++) {
      var p = this.particles[i];
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);

      switch (p.type) {
        case 'match':
          this._renderMatchParticle(ctx, p);
          break;
        case 'spark':
          this._renderSparkParticle(ctx, p);
          break;
        case 'line':
          this._renderLineParticle(ctx, p);
          break;
        case 'flash':
          this._renderFlashParticle(ctx, p);
          break;
        case 'score_text':
          this._renderScoreText(ctx, p);
          break;
        case 'combo_text':
          this._renderComboText(ctx, p);
          break;
      }

      ctx.restore();
    }
  }

  /** 渲染消除粒子（旋转小方块） */
  _renderMatchParticle(ctx, p) {
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);

    var halfSize = p.size / 2;
    ctx.fillStyle = p.color;

    // 绘制小方块
    ctx.beginPath();
    ctx.moveTo(-halfSize, -halfSize);
    ctx.lineTo(halfSize, -halfSize);
    ctx.lineTo(halfSize, halfSize);
    ctx.lineTo(-halfSize, halfSize);
    ctx.closePath();
    ctx.fill();

    // 高光
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.fillRect(-halfSize, -halfSize, halfSize, halfSize);
  }

  /** 渲染火花粒子 */
  _renderSparkParticle(ctx, p) {
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, Math.max(0.5, p.size * p.alpha), 0, Math.PI * 2);
    ctx.fill();

    // 光晕
    ctx.globalAlpha = Math.max(0, p.alpha * 0.3);
    ctx.beginPath();
    ctx.arc(p.x, p.y, Math.max(0.5, p.size * p.alpha * 2), 0, Math.PI * 2);
    ctx.fill();
  }

  /** 渲染线条粒子 */
  _renderLineParticle(ctx, p) {
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);

    ctx.strokeStyle = p.color;
    ctx.lineWidth = p.width || 2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-p.size / 2, 0);
    ctx.lineTo(p.size / 2, 0);
    ctx.stroke();
  }

  /** 渲染闪光粒子 */
  _renderFlashParticle(ctx, p) {
    var grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, Math.max(1, p.size));
    grad.addColorStop(0, 'rgba(255,255,255,' + p.alpha + ')');
    grad.addColorStop(0.5, 'rgba(255,255,200,' + (p.alpha * 0.5) + ')');
    grad.addColorStop(1, 'rgba(255,255,255,0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(p.x, p.y, Math.max(1, p.size), 0, Math.PI * 2);
    ctx.fill();
  }

  /** 渲染分数文字粒子 */
  _renderScoreText(ctx, p) {
    var lifeRatio = p.elapsed / p.life;
    var scale = lifeRatio < 0.15 ? lifeRatio / 0.15 : 1;

    ctx.font = 'bold ' + Math.round(p.size * scale) + 'px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // 描边
    ctx.strokeStyle = 'rgba(0,0,0,0.6)';
    ctx.lineWidth = 3;
    ctx.strokeText(p.text, p.x, p.y);

    // 填充
    ctx.fillStyle = p.color;
    ctx.fillText(p.text, p.x, p.y);
  }

  /** 渲染连击文字粒子 */
  _renderComboText(ctx, p) {
    var lifeRatio = p.elapsed / p.life;
    var scale = lifeRatio < 0.2 ? lifeRatio / 0.2 * 1.3 : (lifeRatio < 0.4 ? 1.3 - (lifeRatio - 0.2) * 1.5 : 1);

    ctx.font = 'bold ' + Math.round(p.size * scale) + 'px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // 描边
    ctx.strokeStyle = 'rgba(0,0,0,0.7)';
    ctx.lineWidth = 4;
    ctx.strokeText(p.text, p.x, p.y);

    // 填充
    ctx.fillStyle = p.color;
    ctx.fillText(p.text, p.x, p.y);

    // 如果是高连击，添加发光效果
    if (p.isCombo) {
      ctx.globalAlpha = Math.max(0, p.alpha * 0.3);
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 2;
      ctx.strokeText(p.text, p.x, p.y);
    }
  }

  // ---- 工具方法 ----

  /** 是否有活跃粒子 */
  isActive() {
    return this.particles.length > 0;
  }

  /** 清除所有粒子 */
  clearAll() {
    this.particles = [];
  }

  /** 获取粒子数量 */
  getCount() {
    return this.particles.length;
  }
}


// ===== sound.js =====
// ============================================================
// sound.js - 开心消消乐 音效系统（Web Audio API）
// ============================================================

var SoundManager = (function() {
  'use strict';

  var _ctx = null;
  var _enabled = true;
  var _volume = 0.5;
  var _masterGain = null;
  var _initialized = false;

  // 音符频率表
  var NOTES = {
    C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23,
    G4: 392.00, A4: 440.00, B4: 493.88,
    C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46,
    G5: 783.99, A5: 880.00, B5: 987.77,
    C6: 1046.50
  };

  // ---- 初始化 ----

  function init() {
    if (_initialized) return;

    try {
      var AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) {
        console.warn('Web Audio API not supported');
        return;
      }
      _ctx = new AudioContext();
      _masterGain = _ctx.createGain();
      _masterGain.gain.value = _volume;
      _masterGain.connect(_ctx.destination);
      _initialized = true;
    } catch (e) {
      console.warn('Failed to initialize Web Audio API:', e);
    }
  }

  /** 确保AudioContext已恢复（需要用户交互后调用） */
  function resume() {
    if (_ctx && _ctx.state === 'suspended') {
      _ctx.resume();
    }
  }

  // ---- 工具方法 ----

  /** 创建振荡器 */
  function createOsc(type, freq, duration, gainValue, startDelay) {
    if (!_ctx || !_enabled) return;

    var osc = _ctx.createOscillator();
    var gain = _ctx.createGain();

    osc.type = type || 'sine';
    osc.frequency.value = freq;

    gain.gain.setValueAtTime(gainValue || 0.3, _ctx.currentTime + (startDelay || 0));
    gain.gain.exponentialRampToValueAtTime(0.001, _ctx.currentTime + (startDelay || 0) + duration);

    osc.connect(gain);
    gain.connect(_masterGain);

    osc.start(_ctx.currentTime + (startDelay || 0));
    osc.stop(_ctx.currentTime + (startDelay || 0) + duration);
  }

  /** 播放音符序列 */
  function playNotes(notes, type, noteDuration, gainValue) {
    if (!_ctx || !_enabled) return;

    for (var i = 0; i < notes.length; i++) {
      createOsc(type, notes[i], noteDuration || 0.15, gainValue || 0.2, i * (noteDuration || 0.15) * 0.8);
    }
  }

  /** 创建噪声 */
  function createNoise(duration, gainValue) {
    if (!_ctx || !_enabled) return;

    var bufferSize = _ctx.sampleRate * duration;
    var buffer = _ctx.createBuffer(1, bufferSize, _ctx.sampleRate);
    var data = buffer.getChannelData(0);

    for (var i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.5;
    }

    var source = _ctx.createBufferSource();
    source.buffer = buffer;

    var gain = _ctx.createGain();
    gain.gain.setValueAtTime(gainValue || 0.1, _ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, _ctx.currentTime + duration);

    // 高通滤波器让噪声更柔和
    var filter = _ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 3000;

    source.connect(filter);
    filter.connect(gain);
    gain.connect(_masterGain);

    source.start();
    source.stop(_ctx.currentTime + duration);
  }

  // ---- 音效定义 ----

  /**
   * 消除音效（不同连击不同音调）
   * @param {number} combo - 连击数
   */
  function playMatch(combo) {
    init();
    resume();

    combo = combo || 0;

    // 音调随连击升高
    var baseNotes = [
      [NOTES.C5, NOTES.E5],           // combo 0
      [NOTES.D5, NOTES.F5],           // combo 1
      [NOTES.E5, NOTES.G5],           // combo 2
      [NOTES.F5, NOTES.A5],           // combo 3
      [NOTES.G5, NOTES.B5],           // combo 4
      [NOTES.A5, NOTES.C6],           // combo 5+
    ];

    var noteIndex = Math.min(combo, baseNotes.length - 1);
    var notes = baseNotes[noteIndex];

    // 主音
    playNotes(notes, 'sine', 0.12, 0.25);

    // 和声
    var harmonyNotes = notes.map(function(n) { return n * 1.5; });
    playNotes(harmonyNotes, 'triangle', 0.1, 0.1);

    // 轻微噪声
    createNoise(0.08, 0.05);
  }

  /**
   * 特殊方块消除音效
   * @param {string} specialType - 特殊方块类型
   */
  function playSpecial(specialType) {
    init();
    resume();

    switch (specialType) {
      case CONFIG.SPECIAL.STRIPED_H:
      case CONFIG.SPECIAL.STRIPED_V:
        // 条纹糖果：上升音阶
        playNotes([NOTES.C5, NOTES.D5, NOTES.E5, NOTES.F5, NOTES.G5], 'square', 0.08, 0.15);
        createNoise(0.15, 0.08);
        break;

      case CONFIG.SPECIAL.WRAPPED:
        // 包装糖果：爆炸声
        createOsc('sine', 150, 0.3, 0.3);
        createOsc('sine', 200, 0.2, 0.2, 0.05);
        createNoise(0.2, 0.15);
        break;

      case CONFIG.SPECIAL.COLOR_BOMB:
        // 彩色球：华丽音效
        playNotes([NOTES.C5, NOTES.E5, NOTES.G5, NOTES.C6], 'sine', 0.15, 0.2);
        playNotes([NOTES.E5, NOTES.G5, NOTES.C6, NOTES.E6], 'triangle', 0.15, 0.15, 0.05);
        createNoise(0.3, 0.1);
        break;

      case CONFIG.SPECIAL.RAINBOW:
        // 彩虹球：超级华丽
        playNotes([NOTES.C5, NOTES.D5, NOTES.E5, NOTES.F5, NOTES.G5, NOTES.A5, NOTES.B5, NOTES.C6], 'sine', 0.1, 0.2);
        playNotes([NOTES.C6, NOTES.B5, NOTES.A5, NOTES.G5, NOTES.F5, NOTES.E5, NOTES.D5, NOTES.C5], 'triangle', 0.1, 0.15, 0.1);
        createOsc('sine', 800, 0.5, 0.15, 0.2);
        createNoise(0.4, 0.12);
        break;
    }
  }

  /**
   * 交换音效
   * @param {boolean} isValid - 是否有效交换
   */
  function playSwap(isValid) {
    init();
    resume();

    if (isValid) {
      // 有效交换：清脆的点击声
      createOsc('sine', NOTES.C5, 0.08, 0.2);
      createOsc('sine', NOTES.E5, 0.06, 0.15, 0.03);
    } else {
      // 无效交换：低沉的嗡嗡声
      createOsc('sine', NOTES.C4, 0.15, 0.15);
      createOsc('sine', NOTES.B3, 0.15, 0.1, 0.05);
    }
  }

  /**
   * 下落音效
   */
  function playFall() {
    init();
    resume();
    createOsc('sine', 400, 0.06, 0.08);
  }

  /**
   * 失败音效
   */
  function playFail() {
    init();
    resume();

    // 下降音阶
    playNotes([NOTES.E5, NOTES.D5, NOTES.C5, NOTES.B4, NOTES.A4], 'sine', 0.2, 0.2);
    createOsc('triangle', NOTES.A3, 0.5, 0.15, 0.5);
  }

  /**
   * 胜利音效
   */
  function playWin() {
    init();
    resume();

    // 上升欢快音阶
    var winNotes = [
      NOTES.C5, NOTES.E5, NOTES.G5, NOTES.C6,
      NOTES.E5, NOTES.G5, NOTES.C6, NOTES.E6
    ];
    playNotes(winNotes, 'sine', 0.12, 0.2);

    // 和声
    var harmonyNotes = [
      NOTES.E5, NOTES.G5, NOTES.C6, NOTES.E6,
      NOTES.G5, NOTES.C6, NOTES.E6, NOTES.G6
    ];
    playNotes(harmonyNotes, 'triangle', 0.12, 0.12, 0.05);

    // 最后的长音
    createOsc('sine', NOTES.C6, 0.6, 0.2, 0.8);
    createOsc('triangle', NOTES.E6, 0.6, 0.15, 0.8);
    createOsc('sine', NOTES.G6, 0.6, 0.1, 0.8);

    // 庆祝噪声
    createNoise(0.3, 0.08);
    createNoise(0.2, 0.06, 0.4);
  }

  /**
   * 按钮点击音效
   */
  function playClick() {
    init();
    resume();
    createOsc('sine', NOTES.G5, 0.05, 0.15);
  }

  /**
   * 洗牌音效
   */
  function playShuffle() {
    init();
    resume();

    // 快速随机音
    for (var i = 0; i < 8; i++) {
      var freq = 300 + Math.random() * 600;
      createOsc('sine', freq, 0.06, 0.1, i * 0.04);
    }
  }

  /**
   * 道具使用音效
   */
  function playItem() {
    init();
    resume();

    playNotes([NOTES.G5, NOTES.A5, NOTES.B5, NOTES.C6], 'sine', 0.1, 0.2);
    createOsc('triangle', NOTES.C6, 0.3, 0.15, 0.3);
  }

  /**
   * 连击音效
   * @param {number} combo - 连击数
   */
  function playCombo(combo) {
    init();
    resume();

    if (combo < 2) return;

    // 连击越高越华丽
    var intensity = Math.min(combo, 6);

    for (var i = 0; i < intensity; i++) {
      var freq = NOTES.C5 * Math.pow(2, i / 6);
      createOsc('sine', freq, 0.15, 0.15, i * 0.05);
      createOsc('triangle', freq * 1.5, 0.1, 0.08, i * 0.05 + 0.02);
    }
  }

  /**
   * 新关卡开始音效
   */
  function playLevelStart() {
    init();
    resume();

    playNotes([NOTES.C5, NOTES.E5, NOTES.G5], 'sine', 0.15, 0.2);
    createOsc('triangle', NOTES.C5, 0.4, 0.15, 0.3);
  }

  // ---- 公共API ----

  return {
    init: init,
    resume: resume,

    playMatch: playMatch,
    playSpecial: playSpecial,
    playSwap: playSwap,
    playFall: playFall,
    playFail: playFail,
    playWin: playWin,
    playClick: playClick,
    playShuffle: playShuffle,
    playItem: playItem,
    playCombo: playCombo,
    playLevelStart: playLevelStart,

    /** 设置音量 0-1 */
    setVolume: function(vol) {
      _volume = Math.max(0, Math.min(1, vol));
      if (_masterGain) {
        _masterGain.gain.value = _volume;
      }
    },

    /** 获取音量 */
    getVolume: function() {
      return _volume;
    },

    /** 开启音效 */
    enable: function() {
      _enabled = true;
      init();
      resume();
    },

    /** 关闭音效 */
    disable: function() {
      _enabled = false;
    },

    /** 是否开启 */
    isEnabled: function() {
      return _enabled;
    },

    /** 是否已初始化 */
    isInitialized: function() {
      return _initialized;
    }
  };
})();


// ===== animation.js =====
// ============================================================
// animation.js - 开心消消乐 动画系统
// ============================================================

class AnimationManager {
  constructor() {
    this.animations = [];
    this._shakeOffset = { x: 0, y: 0 };
    this._shakeDuration = 0;
    this._shakeIntensity = 0;
    this._shakeTime = 0;
  }

  // ---- 动画添加方法 ----

  /**
   * 添加交换动画
   * @param {number} r1, c1 - 第一个格子
   * @param {number} r2, c2 - 第二个格子
   * @param {number} duration - 动画时长
   * @returns {Object} 动画对象
   */
  addSwap(r1, c1, r2, c2, duration) {
    duration = duration || CONFIG.SWAP_DURATION;
    var anim = {
      type: 'swap',
      r1: r1, c1: c1,
      r2: r2, c2: c2,
      duration: duration,
      elapsed: 0,
      progress: 0,
      done: false
    };
    this.animations.push(anim);
    return anim;
  }

  /**
   * 添加下落动画
   * @param {number} r, c - 目标格子
   * @param {number} fromRow - 起始行（负数表示从屏幕外）
   * @param {number} duration - 动画时长
   * @param {number} delay - 延迟
   * @returns {Object} 动画对象
   */
  addFall(r, c, fromRow, duration, delay) {
    duration = duration || CONFIG.FALL_DURATION;
    delay = delay || 0;
    var anim = {
      type: 'fall',
      r: r, c: c,
      fromRow: fromRow,
      toRow: r,
      duration: duration,
      elapsed: -delay,
      progress: 0,
      done: false
    };
    this.animations.push(anim);
    return anim;
  }

  /**
   * 添加消除动画（缩放+透明）
   * @param {number} r, c - 格子位置
   * @param {string} color - 方块颜色
   * @param {number} duration - 动画时长
   * @returns {Object} 动画对象
   */
  addRemove(r, c, color, duration) {
    duration = duration || CONFIG.REMOVE_DURATION;
    var anim = {
      type: 'remove',
      r: r, c: c,
      color: color,
      duration: duration,
      elapsed: 0,
      progress: 0,
      done: false
    };
    this.animations.push(anim);
    return anim;
  }

  /**
   * 添加分数飘字动画
   * @param {number} r, c - 格子位置
   * @param {number} score - 分数
   * @param {number} duration - 动画时长
   * @returns {Object} 动画对象
   */
  addScore(r, c, score, duration) {
    duration = duration || 800;
    var anim = {
      type: 'score',
      r: r, c: c,
      score: score,
      duration: duration,
      elapsed: 0,
      progress: 0,
      done: false
    };
    this.animations.push(anim);
    return anim;
  }

  /**
   * 添加特殊方块特效动画
   * @param {string} effectType - 效果类型: 'striped_h', 'striped_v', 'wrapped', 'color_bomb', 'rainbow'
   * @param {number} r, c - 格子位置
   * @param {string} color - 颜色
   * @param {number} duration - 动画时长
   * @returns {Object} 动画对象
   */
  addSpecialEffect(effectType, r, c, color, duration) {
    duration = duration || CONFIG.SPECIAL_EFFECT_DURATION;
    var anim = {
      type: 'special_effect',
      effectType: effectType,
      r: r, c: c,
      color: color,
      duration: duration,
      elapsed: 0,
      progress: 0,
      done: false
    };
    this.animations.push(anim);
    return anim;
  }

  /**
   * 添加屏幕震动
   * @param {number} intensity - 震动强度
   * @param {number} duration - 震动时长
   */
  addShake(intensity, duration) {
    this._shakeIntensity = intensity || 5;
    this._shakeDuration = duration || 300;
    this._shakeTime = 0;
  }

  /**
   * 添加生成特殊方块动画
   * @param {number} r, c - 格子位置
   * @param {string} specialType - 特殊类型
   * @param {string} color - 颜色
   * @returns {Object} 动画对象
   */
  addSpecialCreate(r, c, specialType, color) {
    var anim = {
      type: 'special_create',
      r: r, c: c,
      specialType: specialType,
      color: color,
      duration: 400,
      elapsed: 0,
      progress: 0,
      done: false
    };
    this.animations.push(anim);
    return anim;
  }

  /**
   * 添加无效交换抖动动画
   * @param {number} r1, c1, r2, c2 - 交换的两个格子
   * @returns {Object} 动画对象
   */
  addInvalidSwap(r1, c1, r2, c2) {
    var anim = {
      type: 'invalid_swap',
      r1: r1, c1: c1,
      r2: r2, c2: c2,
      duration: 300,
      elapsed: 0,
      progress: 0,
      done: false
    };
    this.animations.push(anim);
    return anim;
  }

  // ---- 更新 ----

  /**
   * 更新所有动画
   * @param {number} dt - 帧间隔时间（毫秒）
   */
  update(dt) {
    for (var i = this.animations.length - 1; i >= 0; i--) {
      var anim = this.animations[i];
      anim.elapsed += dt;

      if (anim.elapsed < 0) {
        // 延迟中
        anim.progress = 0;
        continue;
      }

      anim.progress = Math.min(1, anim.elapsed / anim.duration);

      if (anim.progress >= 1) {
        anim.done = true;
        this.animations.splice(i, 1);
      }
    }

    // 更新震动
    if (this._shakeTime < this._shakeDuration) {
      this._shakeTime += dt;
      var decay = 1 - (this._shakeTime / this._shakeDuration);
      this._shakeOffset.x = (Math.random() * 2 - 1) * this._shakeIntensity * decay;
      this._shakeOffset.y = (Math.random() * 2 - 1) * this._shakeIntensity * decay;
    } else {
      this._shakeOffset.x = 0;
      this._shakeOffset.y = 0;
    }
  }

  // ---- 查询 ----

  /** 是否有动画在播放 */
  isBusy() {
    return this.animations.length > 0;
  }

  /** 获取指定格子的当前动画 */
  getAnimationAt(r, c) {
    for (var i = 0; i < this.animations.length; i++) {
      var a = this.animations[i];
      if (a.type === 'swap' && ((a.r1 === r && a.c1 === c) || (a.r2 === r && a.c2 === c))) {
        return a;
      }
      if ((a.type === 'fall' || a.type === 'remove' || a.type === 'special_effect' ||
           a.type === 'special_create' || a.type === 'score') && a.r === r && a.c === c) {
        return a;
      }
      if (a.type === 'invalid_swap' && ((a.r1 === r && a.c1 === c) || (a.r2 === r && a.c2 === c))) {
        return a;
      }
    }
    return null;
  }

  /** 获取震动偏移 */
  getShakeOffset() {
    return { x: this._shakeOffset.x, y: this._shakeOffset.y };
  }

  /** 等待所有动画完成（返回Promise） */
  waitAll() {
    if (this.animations.length === 0) {
      return Promise.resolve();
    }
    return new Promise(function(resolve) {
      var check = setInterval(function() {
        if (!this.isBusy()) {
          clearInterval(check);
          resolve();
        }
      }.bind(this), 16);
    }.bind(this));
  }

  // ---- 缓动函数 ----

  /** 弹性缓出 */
  static easeOutBounce(t) {
    if (t < 1 / 2.75) {
      return 7.5625 * t * t;
    } else if (t < 2 / 2.75) {
      t -= 1.5 / 2.75;
      return 7.5625 * t * t + 0.75;
    } else if (t < 2.5 / 2.75) {
      t -= 2.25 / 2.75;
      return 7.5625 * t * t + 0.9375;
    } else {
      t -= 2.625 / 2.75;
      return 7.5625 * t * t + 0.984375;
    }
  }

  /** 缓出 */
  static easeOutQuad(t) {
    return t * (2 - t);
  }

  /** 缓入缓出 */
  static easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  /** 缓出弹性 */
  static easeOutBack(t) {
    var s = 1.70158;
    return (t -= 1) * t * ((s + 1) * t + s) + 1;
  }

  /** 线性 */
  static linear(t) {
    return t;
  }

  // ---- 渲染 ----

  /**
   * 渲染所有动画效果
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} boardX - 棋盘左上角X
   * @param {number} boardY - 棋盘左上角Y
   * @param {number} time - 当前时间
   */
  render(ctx, boardX, boardY, time) {
    for (var i = 0; i < this.animations.length; i++) {
      var anim = this.animations[i];
      if (anim.elapsed < 0) continue; // 延迟中不渲染

      switch (anim.type) {
        case 'remove':
          this._renderRemove(ctx, anim, boardX, boardY, time);
          break;
        case 'score':
          this._renderScore(ctx, anim, boardX, boardY);
          break;
        case 'special_effect':
          this._renderSpecialEffect(ctx, anim, boardX, boardY, time);
          break;
        case 'special_create':
          this._renderSpecialCreate(ctx, anim, boardX, boardY, time);
          break;
      }
    }
  }

  /** 渲染消除动画 */
  _renderRemove(ctx, anim, boardX, boardY, time) {
    var x = boardX + anim.c * CONFIG.CELL_SIZE;
    var y = boardY + anim.r * CONFIG.CELL_SIZE;
    var cx = x + CandyRenderer.HALF;
    var cy = y + CandyRenderer.HALF;
    var p = anim.progress;
    var ease = AnimationManager.easeOutQuad(p);

    // 缩放+旋转+透明
    var scale = 1 - ease;
    var alpha = 1 - ease;
    var rotation = ease * Math.PI * 0.5;

    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha);
    ctx.translate(cx, cy);
    ctx.rotate(rotation);
    ctx.scale(scale, scale);

    // 绘制方块
    var candy = { color: anim.color, special: CONFIG.SPECIAL.NORMAL };
    CandyRenderer.drawCandy(ctx, candy, -CandyRenderer.HALF, -CandyRenderer.HALF, time);

    ctx.restore();
  }

  /** 渲染分数飘字 */
  _renderScore(ctx, anim, boardX, boardY) {
    var x = boardX + anim.c * CONFIG.CELL_SIZE + CandyRenderer.HALF;
    var y = boardY + anim.r * CONFIG.CELL_SIZE;
    var p = anim.progress;
    var ease = AnimationManager.easeOutQuad(p);

    // 向上飘动
    var offsetY = -ease * 40;
    var alpha = p < 0.7 ? 1 : 1 - (p - 0.7) / 0.3;
    var scale = p < 0.2 ? p / 0.2 * 1.2 : 1.2 - (p - 0.2) * 0.25;

    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha);
    ctx.font = 'bold ' + Math.round(14 * scale) + 'px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // 描边
    ctx.strokeStyle = 'rgba(0,0,0,0.5)';
    ctx.lineWidth = 3;
    ctx.strokeText('+' + anim.score, x, y + offsetY);

    // 填充
    ctx.fillStyle = '#FFD700';
    ctx.fillText('+' + anim.score, x, y + offsetY);

    ctx.restore();
  }

  /** 渲染特殊方块特效 */
  _renderSpecialEffect(ctx, anim, boardX, boardY, time) {
    var x = boardX + anim.c * CONFIG.CELL_SIZE + CandyRenderer.HALF;
    var y = boardY + anim.r * CONFIG.CELL_SIZE + CandyRenderer.HALF;
    var p = anim.progress;
    var ease = AnimationManager.easeOutQuad(p);

    ctx.save();

    switch (anim.effectType) {
      case CONFIG.SPECIAL.STRIPED_H:
        // 横向线条扩展
        var lineW = ease * CONFIG.BOARD_COLS * CONFIG.CELL_SIZE;
        ctx.strokeStyle = 'rgba(255,255,255,' + (1 - ease) * 0.8 + ')';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(x - lineW / 2, y);
        ctx.lineTo(x + lineW / 2, y);
        ctx.stroke();
        // 光晕
        ctx.strokeStyle = CONFIG.CANDY_COLOR_MAP[anim.color] || '#FFF';
        ctx.lineWidth = 8;
        ctx.globalAlpha = (1 - ease) * 0.3;
        ctx.beginPath();
        ctx.moveTo(x - lineW / 2, y);
        ctx.lineTo(x + lineW / 2, y);
        ctx.stroke();
        break;

      case CONFIG.SPECIAL.STRIPED_V:
        // 纵向线条扩展
        var lineH = ease * CONFIG.BOARD_ROWS * CONFIG.CELL_SIZE;
        ctx.strokeStyle = 'rgba(255,255,255,' + (1 - ease) * 0.8 + ')';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(x, y - lineH / 2);
        ctx.lineTo(x, y + lineH / 2);
        ctx.stroke();
        ctx.strokeStyle = CONFIG.CANDY_COLOR_MAP[anim.color] || '#FFF';
        ctx.lineWidth = 8;
        ctx.globalAlpha = (1 - ease) * 0.3;
        ctx.beginPath();
        ctx.moveTo(x, y - lineH / 2);
        ctx.lineTo(x, y + lineH / 2);
        ctx.stroke();
        break;

      case CONFIG.SPECIAL.WRAPPED:
        // 3x3 爆炸波纹
        var radius = ease * CONFIG.CELL_SIZE * 2;
        ctx.strokeStyle = 'rgba(255,200,50,' + (1 - ease) * 0.8 + ')';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x, y, Math.max(0.01, radius), 0, Math.PI * 2);
        ctx.stroke();
        // 内圈
        ctx.strokeStyle = 'rgba(255,100,50,' + (1 - ease) * 0.5 + ')';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, Math.max(0.01, radius * 0.6), 0, Math.PI * 2);
        ctx.stroke();
        break;

      case CONFIG.SPECIAL.COLOR_BOMB:
        // 彩色爆炸
        var radius = ease * CONFIG.CELL_SIZE * 4;
        var colors = ['#FF4444', '#FF8C00', '#FFD700', '#32CD32', '#00CED1', '#4169E1', '#9370DB'];
        for (var i = 0; i < colors.length; i++) {
          var angle = (Math.PI * 2 / colors.length) * i + time * 0.005;
          ctx.strokeStyle = colors[i];
          ctx.globalAlpha = (1 - ease) * 0.6;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + Math.cos(angle) * radius, y + Math.sin(angle) * radius);
          ctx.stroke();
        }
        break;

      case CONFIG.SPECIAL.RAINBOW:
        // 全屏彩虹波
        var radius = ease * Math.max(CONFIG.BOARD_ROWS, CONFIG.BOARD_COLS) * CONFIG.CELL_SIZE;
        var grad = ctx.createConicGradient(time * 0.005, x, y);
        grad.addColorStop(0, '#FF0000');
        grad.addColorStop(0.17, '#FF8800');
        grad.addColorStop(0.33, '#FFFF00');
        grad.addColorStop(0.5, '#00FF00');
        grad.addColorStop(0.67, '#0088FF');
        grad.addColorStop(0.83, '#8800FF');
        grad.addColorStop(1, '#FF0000');
        ctx.strokeStyle = grad;
        ctx.globalAlpha = (1 - ease) * 0.5;
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(x, y, Math.max(0.01, radius), 0, Math.PI * 2);
        ctx.stroke();
        break;
    }

    ctx.restore();
  }

  /** 渲染特殊方块生成动画 */
  _renderSpecialCreate(ctx, anim, boardX, boardY, time) {
    var x = boardX + anim.c * CONFIG.CELL_SIZE + CandyRenderer.HALF;
    var y = boardY + anim.r * CONFIG.CELL_SIZE + CandyRenderer.HALF;
    var p = anim.progress;

    // 闪光效果
    if (p < 0.5) {
      var flashP = p / 0.5;
      var radius = flashP * CONFIG.CELL_SIZE;
      ctx.save();
      ctx.globalAlpha = (1 - flashP) * 0.6;
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(x, y, Math.max(0.01, radius), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 缩放弹跳
    if (p > 0.3) {
      var scaleP = (p - 0.3) / 0.7;
      var scale = AnimationManager.easeOutBack(scaleP);

      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);

      var candy = { color: anim.color, special: anim.specialType };
      CandyRenderer.drawCandy(ctx, candy, -CandyRenderer.HALF, -CandyRenderer.HALF, time);

      ctx.restore();
    }
  }

  // ---- 批量添加 ----

  /**
   * 批量添加下落动画
   * @param {Array} falls - [{r, c, fromRow}]
   * @param {number} baseDelay - 基础延迟
   */
  addFalls(falls, baseDelay) {
    baseDelay = baseDelay || 0;
    for (var i = 0; i < falls.length; i++) {
      var f = falls[i];
      var distance = Math.abs(f.toRow - f.fromRow);
      var delay = baseDelay + distance * 20;
      this.addFall(f.r, f.c, f.fromRow, CONFIG.FALL_DURATION + distance * 15, delay);
    }
  }

  /**
   * 批量添加消除动画
   * @param {Array} removed - [{r, c, color}]
   * @param {number} baseDelay - 基础延迟
   */
  addRemoves(removed, baseDelay) {
    baseDelay = baseDelay || 0;
    for (var i = 0; i < removed.length; i++) {
      var r = removed[i];
      this.addRemove(r.r, r.c, r.color, CONFIG.REMOVE_DURATION, baseDelay);
    }
  }

  /**
   * 清除所有动画
   */
  clearAll() {
    this.animations = [];
    this._shakeOffset = { x: 0, y: 0 };
    this._shakeDuration = 0;
    this._shakeTime = 0;
  }
}


// ===== board.js =====
// ============================================================
// board.js - 开心消消乐 棋盘核心逻辑
// ============================================================

class Board {
  constructor() {
    this.rows = CONFIG.BOARD_ROWS;
    this.cols = CONFIG.BOARD_COLS;
    this.grid = [];        // 二维数组 grid[row][col]
    this.matches = [];     // 当前匹配
    this.specialActions = []; // 特殊方块触发动作队列
    this.combo = 0;        // 连击计数
    this.scoreGained = 0;  // 本轮得分
    this.clearedJellies = 0;
    this.collectedIngredients = 0;
  }

  // ---- 工具方法 ----

  /** 创建空格子 */
  _emptyCell() {
    return {
      candy: null,
      obstacle: { type: CONFIG.OBSTACLE.NONE, hp: 0 },
      jelly: 0,
      ingredient: null,
      isPortal: false,
      portalTarget: null
    };
  }

  /** 创建一个糖果对象 */
  _createCandy(color, special) {
    return {
      type: special || CONFIG.SPECIAL.NORMAL,
      color: color || CONFIG.CANDY_COLORS[Math.floor(Math.random() * CONFIG.CANDY_COLORS.length)],
      special: special || CONFIG.SPECIAL.NORMAL
    };
  }

  /** 随机颜色（排除某些颜色） */
  _randomColor(exclude) {
    var available = CONFIG.CANDY_COLORS.filter(function(c) {
      return exclude.indexOf(c) === -1;
    });
    return available[Math.floor(Math.random() * available.length)];
  }

  /** 判断坐标是否在棋盘内 */
  _inBounds(r, c) {
    return r >= 0 && r < this.rows && c >= 0 && c < this.cols;
  }

  /** 获取格子 */
  getCell(r, c) {
    if (!this._inBounds(r, c)) return null;
    return this.grid[r][c];
  }

  /** 获取糖果 */
  getCandy(r, c) {
    var cell = this.getCell(r, c);
    return cell ? cell.candy : null;
  }

  /** 设置糖果 */
  setCandy(r, c, candy) {
    if (this._inBounds(r, c)) {
      this.grid[r][c].candy = candy;
    }
  }

  /** 判断格子是否为空 */
  isEmpty(r, c) {
    var cell = this.getCell(r, c);
    return cell && cell.candy === null;
  }

  /** 判断格子是否被锁 */
  isLocked(r, c) {
    var cell = this.getCell(r, c);
    return cell && cell.obstacle && cell.obstacle.type === CONFIG.OBSTACLE.LOCK;
  }

  /** 判断格子是否为石头 */
  isStone(r, c) {
    var cell = this.getCell(r, c);
    return cell && cell.obstacle && cell.obstacle.type === CONFIG.OBSTACLE.STONE;
  }

  // ---- 初始化 ----

  /**
   * 根据关卡配置初始化棋盘
   * @param {Object} levelConfig - 关卡配置
   *   {
   *     rows, cols,
   *     obstacles: [{r, c, type}],
   *     jellies: [{r, c, layers}],
   *     ingredients: [{r, c, type}],
   *     portals: [{r1, c1, r2, c2}],
   *     stones: [{r, c}],
   *     chocolates: [{r, c}],
   *     lockedCells: [{r, c}]
   *   }
   */
  init(levelConfig) {
    this.rows = levelConfig.rows || CONFIG.BOARD_ROWS;
    this.cols = levelConfig.cols || CONFIG.BOARD_COLS;
    this.grid = [];
    this.combo = 0;
    this.scoreGained = 0;
    this.clearedJellies = 0;
    this.collectedIngredients = 0;

    // 创建空棋盘
    for (var r = 0; r < this.rows; r++) {
      this.grid[r] = [];
      for (var c = 0; c < this.cols; c++) {
        this.grid[r][c] = this._emptyCell();
      }
    }

    // 设置障碍物
    if (levelConfig.obstacles) {
      for (var i = 0; i < levelConfig.obstacles.length; i++) {
        var ob = levelConfig.obstacles[i];
        if (this._inBounds(ob.r, ob.c)) {
          this.grid[ob.r][ob.c].obstacle = { type: ob.type, hp: this._obstacleHP(ob.type) };
        }
      }
    }

    // 设置石头
    if (levelConfig.stones) {
      for (var i = 0; i < levelConfig.stones.length; i++) {
        var s = levelConfig.stones[i];
        if (this._inBounds(s.r, s.c)) {
          this.grid[s.r][s.c].obstacle = { type: CONFIG.OBSTACLE.STONE, hp: 1 };
        }
      }
    }

    // 设置锁链
    if (levelConfig.lockedCells) {
      for (var i = 0; i < levelConfig.lockedCells.length; i++) {
        var lk = levelConfig.lockedCells[i];
        if (this._inBounds(lk.r, lk.c)) {
          this.grid[lk.r][lk.c].obstacle = { type: CONFIG.OBSTACLE.LOCK, hp: 1 };
        }
      }
    }

    // 设置巧克力
    if (levelConfig.chocolates) {
      for (var i = 0; i < levelConfig.chocolates.length; i++) {
        var ch = levelConfig.chocolates[i];
        if (this._inBounds(ch.r, ch.c)) {
          this.grid[ch.r][ch.c].obstacle = { type: CONFIG.OBSTACLE.CHOCOLATE, hp: 1 };
        }
      }
    }

    // 设置果冻
    if (levelConfig.jellies) {
      for (var i = 0; i < levelConfig.jellies.length; i++) {
        var j = levelConfig.jellies[i];
        if (this._inBounds(j.r, j.c)) {
          this.grid[j.r][j.c].jelly = j.layers || 1;
        }
      }
    }

    // 设置果子
    if (levelConfig.ingredients) {
      for (var i = 0; i < levelConfig.ingredients.length; i++) {
        var ing = levelConfig.ingredients[i];
        if (this._inBounds(ing.r, ing.c)) {
          this.grid[ing.r][ing.c].ingredient = ing.type || 'cherry';
        }
      }
    }

    // 设置传送门
    if (levelConfig.portals) {
      for (var i = 0; i < levelConfig.portals.length; i++) {
        var p = levelConfig.portals[i];
        if (this._inBounds(p.r1, p.c1) && this._inBounds(p.r2, p.c2)) {
          this.grid[p.r1][p.c1].isPortal = true;
          this.grid[p.r1][p.c1].portalTarget = { row: p.r2, col: p.c2 };
          this.grid[p.r2][p.c2].isPortal = true;
          this.grid[p.r2][p.c2].portalTarget = { row: p.r1, col: p.c1 };
        }
      }
    }

    // 填充糖果（确保没有初始匹配）
    this._fillInitial();

    // 确保有有效移动
    if (!this.hasValidMoves()) {
      this.shuffle();
    }
  }

  /** 获取障碍物HP */
  _obstacleHP(type) {
    switch (type) {
      case CONFIG.OBSTACLE.ICE_1: return 1;
      case CONFIG.OBSTACLE.ICE_2: return 2;
      case CONFIG.OBSTACLE.ICE_3: return 3;
      case CONFIG.OBSTACLE.LOCK: return 1;
      case CONFIG.OBSTACLE.CHOCOLATE: return 1;
      case CONFIG.OBSTACLE.FROSTING: return 1;
      case CONFIG.OBSTACLE.STONE: return 1;
      default: return 0;
    }
  }

  /** 填充初始糖果（无匹配） */
  _fillInitial() {
    for (var r = 0; r < this.rows; r++) {
      for (var c = 0; c < this.cols; c++) {
        // 跳过石头格
        if (this.isStone(r, c)) continue;
        // 跳过巧克力格
        if (this.grid[r][c].obstacle.type === CONFIG.OBSTACLE.CHOCOLATE) continue;

        if (this.grid[r][c].candy === null) {
          var exclude = [];
          // 排除左边两个相同颜色
          if (c >= 2) {
            var c1 = this.getCandy(r, c - 1);
            var c2 = this.getCandy(r, c - 2);
            if (c1 && c2 && c1.color === c2.color) {
              exclude.push(c1.color);
            }
          }
          // 排除上面两个相同颜色
          if (r >= 2) {
            var c1 = this.getCandy(r - 1, c);
            var c2 = this.getCandy(r - 2, c);
            if (c1 && c2 && c1.color === c2.color) {
              exclude.push(c1.color);
            }
          }
          var color = this._randomColor(exclude);
          this.grid[r][c].candy = this._createCandy(color, CONFIG.SPECIAL.NORMAL);
        }
      }
    }
  }

  // ---- 匹配检测 ----

  /**
   * 查找所有匹配（3+连续相同颜色）
   * 返回: { matches: [{cells:[{r,c},...], color, length, direction}], specials: [...] }
   */
  findMatches() {
    var allMatches = [];
    var matchedCells = {}; // key "r,c" -> true

    // 横向扫描
    for (var r = 0; r < this.rows; r++) {
      var start = 0;
      for (var c = 1; c <= this.cols; c++) {
        var curr = this.getCandy(r, c);
        var prev = this.getCandy(r, start);
        if (c < this.cols && curr && prev && curr.color === prev.color &&
            curr.special !== CONFIG.SPECIAL.COLOR_BOMB &&
            curr.special !== CONFIG.SPECIAL.RAINBOW &&
            prev.special !== CONFIG.SPECIAL.COLOR_BOMB &&
            prev.special !== CONFIG.SPECIAL.RAINBOW) {
          continue;
        }
        // 检查这段长度
        var len = c - start;
        if (len >= 3 && prev && prev.special !== CONFIG.SPECIAL.COLOR_BOMB && prev.special !== CONFIG.SPECIAL.RAINBOW) {
          var match = { cells: [], color: prev.color, length: len, direction: 'h' };
          for (var k = start; k < c; k++) {
            match.cells.push({ r: r, c: k });
            matchedCells[r + ',' + k] = true;
          }
          allMatches.push(match);
        }
        start = c;
      }
    }

    // 纵向扫描
    for (var c = 0; c < this.cols; c++) {
      var start = 0;
      for (var r = 1; r <= this.rows; r++) {
        var curr = this.getCandy(r, c);
        var prev = this.getCandy(start, c);
        if (r < this.rows && curr && prev && curr.color === prev.color &&
            curr.special !== CONFIG.SPECIAL.COLOR_BOMB &&
            curr.special !== CONFIG.SPECIAL.RAINBOW &&
            prev.special !== CONFIG.SPECIAL.COLOR_BOMB &&
            prev.special !== CONFIG.SPECIAL.RAINBOW) {
          continue;
        }
        var len = r - start;
        if (len >= 3 && prev && prev.special !== CONFIG.SPECIAL.COLOR_BOMB && prev.special !== CONFIG.SPECIAL.RAINBOW) {
          var match = { cells: [], color: prev.color, length: len, direction: 'v' };
          for (var k = start; k < r; k++) {
            match.cells.push({ r: k, c: c });
            matchedCells[k + ',' + c] = true;
          }
          allMatches.push(match);
        }
        start = r;
      }
    }

    // 检测特殊方块生成
    var specials = this._detectSpecials(allMatches, matchedCells);

    return { matches: allMatches, specials: specials, matchedCells: matchedCells };
  }

  /**
   * 检测应该生成的特殊方块
   */
  _detectSpecials(allMatches, matchedCells) {
    var specials = [];

    // 检查5连 → 彩色球
    for (var i = 0; i < allMatches.length; i++) {
      var m = allMatches[i];
      if (m.length >= 5) {
        // 找到交换位置（中间格子）
        var mid = Math.floor(m.cells.length / 2);
        specials.push({
          type: CONFIG.SPECIAL.COLOR_BOMB,
          r: m.cells[mid].r,
          c: m.cells[mid].c,
          color: m.color,
          matchIndex: i
        });
      }
    }

    // 检查L型/T型 → 包装糖果
    // 找交叉点：一个格子同时属于横向和纵向匹配
    var hMatches = allMatches.filter(function(m) { return m.direction === 'h'; });
    var vMatches = allMatches.filter(function(m) { return m.direction === 'v'; });

    for (var i = 0; i < hMatches.length; i++) {
      for (var j = 0; j < vMatches.length; j++) {
        if (hMatches[i].color !== vMatches[j].color) continue;
        // 找交叉格
        for (var a = 0; a < hMatches[i].cells.length; a++) {
          for (var b = 0; b < vMatches[j].cells.length; b++) {
            if (hMatches[i].cells[a].r === vMatches[j].cells[b].r &&
                hMatches[i].cells[a].c === vMatches[j].cells[b].c) {
              // 检查是否已经被标记为5连
              var alreadySpecial = specials.some(function(s) {
                return s.r === hMatches[i].cells[a].r && s.c === hMatches[i].cells[a].c;
              });
              if (!alreadySpecial) {
                specials.push({
                  type: CONFIG.SPECIAL.WRAPPED,
                  r: hMatches[i].cells[a].r,
                  c: hMatches[i].cells[a].c,
                  color: hMatches[i].color,
                  matchIndices: [i, j]
                });
              }
            }
          }
        }
      }
    }

    // 检查4连 → 条纹糖果
    for (var i = 0; i < allMatches.length; i++) {
      var m = allMatches[i];
      if (m.length === 4) {
        // 检查是否已经被标记
        var mid = 1; // 交换位置
        var alreadySpecial = specials.some(function(s) {
          return (s.r === m.cells[mid].r && s.c === m.cells[mid].c) ||
                 (s.r === m.cells[2].r && s.c === m.cells[2].c);
        });
        if (!alreadySpecial) {
          var stripedType = m.direction === 'h' ? CONFIG.SPECIAL.STRIPED_V : CONFIG.SPECIAL.STRIPED_H;
          specials.push({
            type: stripedType,
            r: m.cells[mid].r,
            c: m.cells[mid].c,
            color: m.color,
            matchIndex: i
          });
        }
      }
    }

    return specials;
  }

  // ---- 消除匹配 ----

  /**
   * 消除匹配的方块
   * @returns {Object} { removed: [{r,c,color,special}], specialsCreated: [...], score }
   */
  removeMatches(matchResult) {
    var self = this;
    var removed = [];
    var specialsCreated = [];
    var totalScore = 0;
    var matchedCells = matchResult.matchedCells;

    // 处理特殊方块生成
    var specialPositions = {};
    for (var i = 0; i < matchResult.specials.length; i++) {
      var sp = matchResult.specials[i];
      specialPositions[sp.r + ',' + sp.c] = sp;
    }

    // 收集要消除的格子
    var keys = Object.keys(matchedCells);
    for (var i = 0; i < keys.length; i++) {
      var parts = keys[i].split(',');
      var r = parseInt(parts[0]);
      var c = parseInt(parts[1]);
      var cell = this.grid[r][c];
      if (cell.candy) {
        var isSpecialPos = specialPositions[keys[i]];
        if (isSpecialPos) {
          // 这个位置要生成特殊方块，不消除，而是替换
          var newCandy = this._createCandy(isSpecialPos.color, isSpecialPos.type);
          cell.candy = newCandy;
          specialsCreated.push({ r: r, c: c, type: isSpecialPos.type, color: isSpecialPos.color });
        } else {
          // 检查被消除的方块是否本身是特殊方块
          if (cell.candy.special !== CONFIG.SPECIAL.NORMAL) {
            // 触发特殊效果
            var effect = this._triggerSpecialEffect(r, c, cell.candy);
            removed = removed.concat(effect.removed);
            totalScore += effect.score;
          }
          removed.push({ r: r, c: c, color: cell.candy.color, special: cell.candy.special });
          totalScore += CONFIG.SCORE_MATCH_3;
          cell.candy = null;
        }
      }

      // 处理果冻
      if (cell.jelly > 0) {
        cell.jelly--;
        this.clearedJellies++;
        totalScore += CONFIG.SCORE_JELLY;
      }

      // 处理障碍物
      this._damageAdjacentObstacles(r, c);
    }

    // 去重 removed
    var uniqueRemoved = [];
    var removedMap = {};
    for (var i = 0; i < removed.length; i++) {
      var key = removed[i].r + ',' + removed[i].c;
      if (!removedMap[key]) {
        removedMap[key] = true;
        uniqueRemoved.push(removed[i]);
      }
    }

    // 应用连击倍率
    if (this.combo > 0) {
      totalScore = Math.floor(totalScore * Math.pow(CONFIG.SCORE_COMBO_MULTIPLIER, this.combo));
    }

    return {
      removed: uniqueRemoved,
      specialsCreated: specialsCreated,
      score: totalScore
    };
  }

  /**
   * 触发特殊方块效果
   */
  _triggerSpecialEffect(r, c, candy) {
    var removed = [];
    var score = 0;

    switch (candy.special) {
      case CONFIG.SPECIAL.STRIPED_H:
        // 消除整行
        for (var cc = 0; cc < this.cols; cc++) {
          if (cc !== c) {
            var cell = this.grid[r][cc];
            if (cell.candy) {
              removed.push({ r: r, c: cc, color: cell.candy.color, special: cell.candy.special });
              // 递归触发
              if (cell.candy.special !== CONFIG.SPECIAL.NORMAL) {
                var sub = this._triggerSpecialEffect(r, cc, cell.candy);
                removed = removed.concat(sub.removed);
                score += sub.score;
              }
              cell.candy = null;
            }
            if (cell.jelly > 0) { cell.jelly--; this.clearedJellies++; }
            this._damageAdjacentObstacles(r, cc);
          }
        }
        score += CONFIG.SCORE_STRIPED;
        break;

      case CONFIG.SPECIAL.STRIPED_V:
        // 消除整列
        for (var rr = 0; rr < this.rows; rr++) {
          if (rr !== r) {
            var cell = this.grid[rr][c];
            if (cell.candy) {
              removed.push({ r: rr, c: c, color: cell.candy.color, special: cell.candy.special });
              if (cell.candy.special !== CONFIG.SPECIAL.NORMAL) {
                var sub = this._triggerSpecialEffect(rr, c, cell.candy);
                removed = removed.concat(sub.removed);
                score += sub.score;
              }
              cell.candy = null;
            }
            if (cell.jelly > 0) { cell.jelly--; this.clearedJellies++; }
            this._damageAdjacentObstacles(rr, c);
          }
        }
        score += CONFIG.SCORE_STRIPED;
        break;

      case CONFIG.SPECIAL.WRAPPED:
        // 3x3 范围爆炸
        for (var dr = -1; dr <= 1; dr++) {
          for (var dc = -1; dc <= 1; dc++) {
            var nr = r + dr, nc = c + dc;
            if (this._inBounds(nr, nc) && !(nr === r && nc === c)) {
              var cell = this.grid[nr][nc];
              if (cell.candy) {
                removed.push({ r: nr, c: nc, color: cell.candy.color, special: cell.candy.special });
                if (cell.candy.special !== CONFIG.SPECIAL.NORMAL) {
                  var sub = this._triggerSpecialEffect(nr, nc, cell.candy);
                  removed = removed.concat(sub.removed);
                  score += sub.score;
                }
                cell.candy = null;
              }
              if (cell.jelly > 0) { cell.jelly--; this.clearedJellies++; }
              this._damageAdjacentObstacles(nr, nc);
            }
          }
        }
        score += CONFIG.SCORE_WRAPPED;
        break;

      case CONFIG.SPECIAL.COLOR_BOMB:
        // 彩色球效果在swap中处理，这里不应该被直接触发
        // 但如果被匹配消除，随机消除一种颜色
        var targetColor = candy.color || CONFIG.CANDY_COLORS[Math.floor(Math.random() * CONFIG.CANDY_COLORS.length)];
        for (var rr = 0; rr < this.rows; rr++) {
          for (var cc = 0; cc < this.cols; cc++) {
            var cell = this.grid[rr][cc];
            if (cell.candy && cell.candy.color === targetColor && !(rr === r && cc === c)) {
              removed.push({ r: rr, c: cc, color: cell.candy.color, special: cell.candy.special });
              if (cell.candy.special !== CONFIG.SPECIAL.NORMAL) {
                var sub = this._triggerSpecialEffect(rr, cc, cell.candy);
                removed = removed.concat(sub.removed);
                score += sub.score;
              }
              cell.candy = null;
            }
            if (cell.jelly > 0) { cell.jelly--; this.clearedJellies++; }
          }
        }
        score += CONFIG.SCORE_COLOR_BOMB;
        break;

      case CONFIG.SPECIAL.RAINBOW:
        // 全屏消除
        for (var rr = 0; rr < this.rows; rr++) {
          for (var cc = 0; cc < this.cols; cc++) {
            var cell = this.grid[rr][cc];
            if (cell.candy && !(rr === r && cc === c)) {
              removed.push({ r: rr, c: cc, color: cell.candy.color, special: cell.candy.special });
              if (cell.candy.special !== CONFIG.SPECIAL.NORMAL) {
                var sub = this._triggerSpecialEffect(rr, cc, cell.candy);
                removed = removed.concat(sub.removed);
                score += sub.score;
              }
              cell.candy = null;
            }
            if (cell.jelly > 0) { cell.jelly--; this.clearedJellies++; }
          }
        }
        score += CONFIG.SCORE_COLOR_BOMB * 2;
        break;
    }

    return { removed: removed, score: score };
  }

  /**
   * 处理特殊方块之间的合成效果
   */
  _combineSpecials(r1, c1, candy1, r2, c2, candy2) {
    var removed = [];
    var score = 0;
    var specialsCreated = [];

    // 确定两个特殊方块的类型
    var types = [candy1.special, candy2.special].sort();
    var t1 = types[0], t2 = types[1];

    if (t1 === CONFIG.SPECIAL.COLOR_BOMB && t2 === CONFIG.SPECIAL.COLOR_BOMB) {
      // 彩色球 + 彩色球 = 全屏消除
      for (var r = 0; r < this.rows; r++) {
        for (var c = 0; c < this.cols; c++) {
          var cell = this.grid[r][c];
          if (cell.candy) {
            removed.push({ r: r, c: c, color: cell.candy.color, special: cell.candy.special });
            cell.candy = null;
          }
          if (cell.jelly > 0) { cell.jelly--; this.clearedJellies++; }
        }
      }
      score += CONFIG.SCORE_COLOR_BOMB * 3;
    }
    else if (t1 === CONFIG.SPECIAL.COLOR_BOMB) {
      // 彩色球 + 任意特殊 = 消除所有该颜色，并将同色变为该特殊
      var targetColor = (candy1.special === CONFIG.SPECIAL.COLOR_BOMB) ? candy2.color : candy1.color;
      var specialType = (candy1.special === CONFIG.SPECIAL.COLOR_BOMB) ? candy2.special : candy1.special;
      for (var r = 0; r < this.rows; r++) {
        for (var c = 0; c < this.cols; c++) {
          var cell = this.grid[r][c];
          if (cell.candy && cell.candy.color === targetColor) {
            if (r !== r1 || c !== c1) {
              if (r !== r2 || c !== c2) {
                // 变为特殊方块
                cell.candy = this._createCandy(targetColor, specialType);
                // 立即触发
                var effect = this._triggerSpecialEffect(r, c, cell.candy);
                removed = removed.concat(effect.removed);
                score += effect.score;
              }
            }
          }
        }
      }
      score += CONFIG.SCORE_COLOR_BOMB * 2;
    }
    else if ((t1 === CONFIG.SPECIAL.STRIPED_H || t1 === CONFIG.SPECIAL.STRIPED_V) &&
             (t2 === CONFIG.SPECIAL.STRIPED_H || t2 === CONFIG.SPECIAL.STRIPED_V)) {
      // 条纹 + 条纹 = 十字消除（3行3列）
      var cr = (r1 + r2) / 2;
      var cc = (c1 + c2) / 2;
      // 消除3行
      for (var dr = -1; dr <= 1; dr++) {
        for (var c = 0; c < this.cols; c++) {
          var nr = Math.round(cr) + dr;
          if (this._inBounds(nr, c)) {
            var cell = this.grid[nr][c];
            if (cell.candy) {
              removed.push({ r: nr, c: c, color: cell.candy.color, special: cell.candy.special });
              cell.candy = null;
            }
            if (cell.jelly > 0) { cell.jelly--; this.clearedJellies++; }
          }
        }
      }
      // 消除3列
      for (var dc = -1; dc <= 1; dc++) {
        for (var r = 0; r < this.rows; r++) {
          var nc = Math.round(cc) + dc;
          if (this._inBounds(r, nc)) {
            var cell = this.grid[r][nc];
            if (cell.candy) {
              removed.push({ r: r, c: nc, color: cell.candy.color, special: cell.candy.special });
              cell.candy = null;
            }
            if (cell.jelly > 0) { cell.jelly--; this.clearedJellies++; }
          }
        }
      }
      score += CONFIG.SCORE_STRIPED * 3;
    }
    else if ((t1 === CONFIG.SPECIAL.STRIPED_H || t1 === CONFIG.SPECIAL.STRIPED_V) && t2 === CONFIG.SPECIAL.WRAPPED) {
      // 条纹 + 包装 = 3行+3列消除
      var cr = r1, cc = c1;
      for (var dr = -1; dr <= 1; dr++) {
        for (var c = 0; c < this.cols; c++) {
          var nr = cr + dr;
          if (this._inBounds(nr, c)) {
            var cell = this.grid[nr][c];
            if (cell.candy) {
              removed.push({ r: nr, c: c, color: cell.candy.color, special: cell.candy.special });
              cell.candy = null;
            }
            if (cell.jelly > 0) { cell.jelly--; this.clearedJellies++; }
          }
        }
      }
      for (var dc = -1; dc <= 1; dc++) {
        for (var r = 0; r < this.rows; r++) {
          var nc = cc + dc;
          if (this._inBounds(r, nc)) {
            var cell = this.grid[r][nc];
            if (cell.candy) {
              removed.push({ r: r, c: nc, color: cell.candy.color, special: cell.candy.special });
              cell.candy = null;
            }
            if (cell.jelly > 0) { cell.jelly--; this.clearedJellies++; }
          }
        }
      }
      score += CONFIG.SCORE_STRIPED + CONFIG.SCORE_WRAPPED;
    }
    else if (t1 === CONFIG.SPECIAL.WRAPPED && t2 === CONFIG.SPECIAL.WRAPPED) {
      // 包装 + 包装 = 5x5 范围爆炸
      var cr = Math.round((r1 + r2) / 2);
      var cc = Math.round((c1 + c2) / 2);
      for (var dr = -2; dr <= 2; dr++) {
        for (var dc = -2; dc <= 2; dc++) {
          var nr = cr + dr, nc = cc + dc;
          if (this._inBounds(nr, nc)) {
            var cell = this.grid[nr][nc];
            if (cell.candy) {
              removed.push({ r: nr, c: nc, color: cell.candy.color, special: cell.candy.special });
              cell.candy = null;
            }
            if (cell.jelly > 0) { cell.jelly--; this.clearedJellies++; }
          }
        }
      }
      score += CONFIG.SCORE_WRAPPED * 3;
    }

    // 消除两个特殊方块自身
    this.grid[r1][c1].candy = null;
    this.grid[r2][c2].candy = null;
    removed.push({ r: r1, c: c1, color: candy1.color, special: candy1.special });
    removed.push({ r: r2, c: c2, color: candy2.color, special: candy2.special });

    // 处理果冻
    if (this.grid[r1][c1].jelly > 0) { this.grid[r1][c1].jelly--; this.clearedJellies++; }
    if (this.grid[r2][c2].jelly > 0) { this.grid[r2][c2].jelly--; this.clearedJellies++; }

    return { removed: removed, score: score, specialsCreated: specialsCreated };
  }

  // ---- 障碍物处理 ----

  /** 损伤相邻障碍物 */
  _damageAdjacentObstacles(r, c) {
    var dirs = [[-1,0],[1,0],[0,-1],[0,1]];
    for (var i = 0; i < dirs.length; i++) {
      var nr = r + dirs[i][0], nc = c + dirs[i][1];
      if (!this._inBounds(nr, nc)) continue;
      var cell = this.grid[nr][nc];
      var ob = cell.obstacle;

      // 冰块
      if (ob.type === CONFIG.OBSTACLE.ICE_1 || ob.type === CONFIG.OBSTACLE.ICE_2 || ob.type === CONFIG.OBSTACLE.ICE_3) {
        ob.hp--;
        if (ob.hp <= 0) {
          ob.type = CONFIG.OBSTACLE.NONE;
          ob.hp = 0;
        } else {
          // 降级
          if (ob.hp === 2) ob.type = CONFIG.OBSTACLE.ICE_2;
          if (ob.hp === 1) ob.type = CONFIG.OBSTACLE.ICE_1;
        }
      }

      // 锁链
      if (ob.type === CONFIG.OBSTACLE.LOCK) {
        ob.hp--;
        if (ob.hp <= 0) {
          ob.type = CONFIG.OBSTACLE.NONE;
          ob.hp = 0;
        }
      }

      // 巧克力
      if (ob.type === CONFIG.OBSTACLE.CHOCOLATE) {
        ob.hp--;
        if (ob.hp <= 0) {
          ob.type = CONFIG.OBSTACLE.NONE;
          ob.hp = 0;
        }
      }

      // 糖霜
      if (ob.type === CONFIG.OBSTACLE.FROSTING) {
        ob.hp--;
        if (ob.hp <= 0) {
          ob.type = CONFIG.OBSTACLE.NONE;
          ob.hp = 0;
        }
      }
    }
  }

  /** 巧克力蔓延 */
  _spreadChocolate() {
    var chocolateCells = [];
    for (var r = 0; r < this.rows; r++) {
      for (var c = 0; c < this.cols; c++) {
        if (this.grid[r][c].obstacle.type === CONFIG.OBSTACLE.CHOCOLATE) {
          chocolateCells.push({ r: r, c: c });
        }
      }
    }

    if (chocolateCells.length === 0) return;

    // 随机选一个巧克力，向随机方向蔓延
    var source = chocolateCells[Math.floor(Math.random() * chocolateCells.length)];
    var dirs = [[-1,0],[1,0],[0,-1],[0,1]];
    // 打乱方向
    for (var i = dirs.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = dirs[i]; dirs[i] = dirs[j]; dirs[j] = tmp;
    }

    for (var i = 0; i < dirs.length; i++) {
      var nr = source.r + dirs[i][0], nc = source.c + dirs[i][1];
      if (!this._inBounds(nr, nc)) continue;
      var cell = this.grid[nr][nc];
      if (cell.candy === null && cell.obstacle.type === CONFIG.OBSTACLE.NONE) {
        cell.obstacle = { type: CONFIG.OBSTACLE.CHOCOLATE, hp: 1 };
        break; // 每次只蔓延一格
      }
    }
  }

  // ---- 重力下落 ----

  /**
   * 应用重力，方块下落填充空位
   * @returns {Array} [{r, c, fromRow}] 下落信息
   */
  applyGravity() {
    var falls = [];

    for (var c = 0; c < this.cols; c++) {
      // 从底部向上扫描
      var emptyRow = -1;
      for (var r = this.rows - 1; r >= 0; r--) {
        var cell = this.grid[r][c];
        if (cell.candy === null && cell.obstacle.type !== CONFIG.OBSTACLE.STONE) {
          if (emptyRow === -1) emptyRow = r;
        } else if (cell.candy !== null && emptyRow !== -1) {
          // 下落
          this.grid[emptyRow][c].candy = cell.candy;
          this.grid[emptyRow][c].ingredient = cell.ingredient;
          cell.candy = null;
          cell.ingredient = null;
          falls.push({ r: emptyRow, c: c, fromRow: r });
          emptyRow--;
          // 如果遇到石头，重置空行
          if (this.isStone(r, c)) {
            emptyRow = -1;
          }
        } else if (cell.obstacle.type === CONFIG.OBSTACLE.STONE) {
          emptyRow = -1;
        }
      }
    }

    return falls;
  }

  // ---- 填充空位 ----

  /**
   * 从顶部生成新方块填充空位
   * @returns {Array} [{r, c, fromRow}] 新生成方块的下落信息
   */
  fillEmpty() {
    var fills = [];

    for (var c = 0; c < this.cols; c++) {
      var emptyCount = 0;
      for (var r = 0; r < this.rows; r++) {
        if (this.grid[r][c].candy === null && this.grid[r][c].obstacle.type !== CONFIG.OBSTACLE.STONE) {
          emptyCount++;
        }
      }

      // 从顶部填充
      var fillIndex = 0;
      for (var r = 0; r < this.rows; r++) {
        if (this.grid[r][c].candy === null && this.grid[r][c].obstacle.type !== CONFIG.OBSTACLE.STONE) {
          var color = CONFIG.CANDY_COLORS[Math.floor(Math.random() * CONFIG.CANDY_COLORS.length)];
          this.grid[r][c].candy = this._createCandy(color, CONFIG.SPECIAL.NORMAL);
          fills.push({ r: r, c: c, fromRow: -(fillIndex + 1) });
          fillIndex++;
        }
      }
    }

    return fills;
  }

  // ---- 交换 ----

  /**
   * 判断是否可交换
   */
  canSwap(r1, c1, r2, c2) {
    // 必须相邻
    var dr = Math.abs(r1 - r2), dc = Math.abs(c1 - c2);
    if (!((dr === 1 && dc === 0) || (dr === 0 && dc === 1))) return false;

    // 边界检查
    if (!this._inBounds(r1, c1) || !this._inBounds(r2, c2)) return false;

    var candy1 = this.getCandy(r1, c1);
    var candy2 = this.getCandy(r2, c2);

    // 必须都有糖果
    if (!candy1 || !candy2) return false;

    // 被锁的不能移动
    if (this.isLocked(r1, c1) || this.isLocked(r2, c2)) return false;

    // 石头不能移动
    if (this.isStone(r1, c1) || this.isStone(r2, c2)) return false;

    // 彩色球可以和任何方块交换
    if (candy1.special === CONFIG.SPECIAL.COLOR_BOMB || candy1.special === CONFIG.SPECIAL.RAINBOW) return true;
    if (candy2.special === CONFIG.SPECIAL.COLOR_BOMB || candy2.special === CONFIG.SPECIAL.RAINBOW) return true;

    return true;
  }

  /**
   * 交换两个方块
   * @returns {Object} { success, matchResult, specialCombine, falls, fills }
   */
  swap(r1, c1, r2, c2) {
    if (!this.canSwap(r1, c1, r2, c2)) {
      return { success: false };
    }

    var candy1 = this.getCandy(r1, c1);
    var candy2 = this.getCandy(r2, c2);

    // 检查特殊方块合成
    if (candy1.special !== CONFIG.SPECIAL.NORMAL && candy2.special !== CONFIG.SPECIAL.NORMAL) {
      var combineResult = this._combineSpecials(r1, c1, candy1, r2, c2, candy2);
      this.scoreGained += combineResult.score;
      return {
        success: true,
        specialCombine: combineResult,
        swapInfo: { r1: r1, c1: c1, r2: r2, c2: c2 }
      };
    }

    // 彩色球 + 普通方块
    if (candy1.special === CONFIG.SPECIAL.COLOR_BOMB || candy1.special === CONFIG.SPECIAL.RAINBOW) {
      var targetColor = candy2.color;
      var removed = [];
      var score = 0;
      for (var r = 0; r < this.rows; r++) {
        for (var c = 0; c < this.cols; c++) {
          var cell = this.grid[r][c];
          if (cell.candy && cell.candy.color === targetColor) {
            removed.push({ r: r, c: c, color: cell.candy.color, special: cell.candy.special });
            if (cell.candy.special !== CONFIG.SPECIAL.NORMAL) {
              var effect = this._triggerSpecialEffect(r, c, cell.candy);
              removed = removed.concat(effect.removed);
              score += effect.score;
            }
            cell.candy = null;
            if (cell.jelly > 0) { cell.jelly--; this.clearedJellies++; }
          }
        }
      }
      this.grid[r1][c1].candy = null;
      this.grid[r2][c2].candy = null;
      score += CONFIG.SCORE_COLOR_BOMB;
      this.scoreGained += score;
      return {
        success: true,
        colorBombResult: { removed: removed, score: score, color: targetColor },
        swapInfo: { r1: r1, c1: c1, r2: r2, c2: c2 }
      };
    }

    if (candy2.special === CONFIG.SPECIAL.COLOR_BOMB || candy2.special === CONFIG.SPECIAL.RAINBOW) {
      var targetColor = candy1.color;
      var removed = [];
      var score = 0;
      for (var r = 0; r < this.rows; r++) {
        for (var c = 0; c < this.cols; c++) {
          var cell = this.grid[r][c];
          if (cell.candy && cell.candy.color === targetColor) {
            removed.push({ r: r, c: c, color: cell.candy.color, special: cell.candy.special });
            if (cell.candy.special !== CONFIG.SPECIAL.NORMAL) {
              var effect = this._triggerSpecialEffect(r, c, cell.candy);
              removed = removed.concat(effect.removed);
              score += effect.score;
            }
            cell.candy = null;
            if (cell.jelly > 0) { cell.jelly--; this.clearedJellies++; }
          }
        }
      }
      this.grid[r1][c1].candy = null;
      this.grid[r2][c2].candy = null;
      score += CONFIG.SCORE_COLOR_BOMB;
      this.scoreGained += score;
      return {
        success: true,
        colorBombResult: { removed: removed, score: score, color: targetColor },
        swapInfo: { r1: r1, c1: c1, r2: r2, c2: c2 }
      };
    }

    // 普通交换
    this.grid[r1][c1].candy = candy2;
    this.grid[r2][c2].candy = candy1;

    // 检查是否产生匹配
    var matchResult = this.findMatches();
    if (matchResult.matches.length === 0) {
      // 没有匹配，交换回来
      this.grid[r1][c1].candy = candy1;
      this.grid[r2][c2].candy = candy2;
      return { success: false };
    }

    return {
      success: true,
      matchResult: matchResult,
      swapInfo: { r1: r1, c1: c1, r2: r2, c2: c2 }
    };
  }

  // ---- 有效移动检测 ----

  /**
   * 检查是否还有有效移动
   */
  hasValidMoves() {
    for (var r = 0; r < this.rows; r++) {
      for (var c = 0; c < this.cols; c++) {
        // 尝试向右交换
        if (c < this.cols - 1) {
          if (this._wouldMatch(r, c, r, c + 1)) return true;
        }
        // 尝试向下交换
        if (r < this.rows - 1) {
          if (this._wouldMatch(r, c, r + 1, c)) return true;
        }
      }
    }
    return false;
  }

  /**
   * 判断交换两个格子是否会产生匹配
   */
  _wouldMatch(r1, c1, r2, c2) {
    if (!this.canSwap(r1, c1, r2, c2)) return false;

    var candy1 = this.getCandy(r1, c1);
    var candy2 = this.getCandy(r2, c2);
    if (!candy1 || !candy2) return false;

    // 彩色球总是有效
    if (candy1.special === CONFIG.SPECIAL.COLOR_BOMB || candy1.special === CONFIG.SPECIAL.RAINBOW) return true;
    if (candy2.special === CONFIG.SPECIAL.COLOR_BOMB || candy2.special === CONFIG.SPECIAL.RAINBOW) return true;

    // 临时交换
    this.grid[r1][c1].candy = candy2;
    this.grid[r2][c2].candy = candy1;

    var hasMatch = this.findMatches().matches.length > 0;

    // 交换回来
    this.grid[r1][c1].candy = candy1;
    this.grid[r2][c2].candy = candy2;

    return hasMatch;
  }

  // ---- 洗牌 ----

  /**
   * 重新洗牌（保持特殊方块和障碍物）
   */
  shuffle() {
    var candies = [];
    var positions = [];

    // 收集所有糖果
    for (var r = 0; r < this.rows; r++) {
      for (var c = 0; c < this.cols; c++) {
        if (this.grid[r][c].candy && !this.isStone(r, c)) {
          candies.push(this.grid[r][c].candy);
          positions.push({ r: r, c: c });
        }
      }
    }

    // Fisher-Yates 洗牌
    for (var i = candies.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = candies[i];
      candies[i] = candies[j];
      candies[j] = tmp;
    }

    // 放回
    for (var i = 0; i < positions.length; i++) {
      this.grid[positions[i].r][positions[i].c].candy = candies[i];
    }

    // 如果洗牌后没有有效移动或仍有匹配，重新填充
    if (this.findMatches().matches.length > 0 || !this.hasValidMoves()) {
      // 清除所有糖果并重新填充
      for (var r = 0; r < this.rows; r++) {
        for (var c = 0; c < this.cols; c++) {
          if (!this.isStone(r, c) && this.grid[r][c].obstacle.type !== CONFIG.OBSTACLE.CHOCOLATE) {
            this.grid[r][c].candy = null;
          }
        }
      }
      this._fillInitial();
    }
  }

  // ---- 果子处理 ----

  /**
   * 检查并收集落到底部的果子
   * @returns {Array} [{r, c, type}] 收集到的果子
   */
  collectIngredients() {
    var collected = [];
    for (var c = 0; c < this.cols; c++) {
      // 检查最底行
      var r = this.rows - 1;
      var cell = this.grid[r][c];
      if (cell.ingredient) {
        collected.push({ r: r, c: c, type: cell.ingredient });
        cell.ingredient = null;
        this.collectedIngredients++;
        this.scoreGained += CONFIG.SCORE_INGREDIENT;
      }
    }
    return collected;
  }

  // ---- 完整处理流程 ----

  /**
   * 完整的一轮处理：匹配→消除→下落→填充→再匹配（连锁）
   * @returns {Object} 完整的处理结果
   *   {
   *     steps: [{ removed, specialsCreated, falls, fills, score }],
   *     totalScore, totalJellies, totalIngredients,
   *     chocolateSpread
   *   }
   */
  processBoard() {
    var steps = [];
    var totalScore = 0;
    this.combo = 0;
    this.scoreGained = 0;
    this.clearedJellies = 0;
    this.collectedIngredients = 0;
    var maxIterations = 50; // 防止无限循环
    var iteration = 0;

    while (iteration < maxIterations) {
      iteration++;

      // 1. 查找匹配
      var matchResult = this.findMatches();

      if (matchResult.matches.length === 0) {
        break; // 没有匹配了，结束
      }

      // 2. 消除匹配
      var removeResult = this.removeMatches(matchResult);
      totalScore += removeResult.score;

      // 3. 应用重力
      var falls = this.applyGravity();

      // 4. 填充空位
      var fills = this.fillEmpty();

      // 5. 收集果子
      var ingredients = this.collectIngredients();

      steps.push({
        removed: removeResult.removed,
        specialsCreated: removeResult.specialsCreated,
        falls: falls,
        fills: fills,
        ingredients: ingredients,
        score: removeResult.score,
        combo: this.combo
      });

      this.combo++;
    }

    // 巧克力蔓延
    var chocolateSpread = false;
    if (this._hasChocolate()) {
      this._spreadChocolate();
      chocolateSpread = true;
    }

    // 检查是否还有有效移动
    var needShuffle = !this.hasValidMoves();

    return {
      steps: steps,
      totalScore: totalScore,
      totalJellies: this.clearedJellies,
      totalIngredients: this.collectedIngredients,
      chocolateSpread: chocolateSpread,
      needShuffle: needShuffle
    };
  }

  /** 检查是否有巧克力 */
  _hasChocolate() {
    for (var r = 0; r < this.rows; r++) {
      for (var c = 0; c < this.cols; c++) {
        if (this.grid[r][c].obstacle.type === CONFIG.OBSTACLE.CHOCOLATE) {
          return true;
        }
      }
    }
    return false;
  }

  // ---- 关卡完成检查 ----

  /**
   * 检查果冻是否全部清除
   */
  isJellyComplete() {
    for (var r = 0; r < this.rows; r++) {
      for (var c = 0; c < this.cols; c++) {
        if (this.grid[r][c].jelly > 0) return false;
      }
    }
    return true;
  }

  /**
   * 获取剩余果冻数
   */
  getRemainingJellies() {
    var count = 0;
    for (var r = 0; r < this.rows; r++) {
      for (var c = 0; c < this.cols; c++) {
        if (this.grid[r][c].jelly > 0) count++;
      }
    }
    return count;
  }

  /**
   * 获取剩余果子数
   */
  getRemainingIngredients() {
    var count = 0;
    for (var r = 0; r < this.rows; r++) {
      for (var c = 0; c < this.cols; c++) {
        if (this.grid[r][c].ingredient) count++;
      }
    }
    return count;
  }

  // ---- 道具效果 ----

  /**
   * 锤子道具：消除指定格子
   */
  useHammer(r, c) {
    var cell = this.grid[r][c];
    if (!cell || !cell.candy) return null;

    var removed = [];
    var score = 0;

    // 如果是特殊方块，触发效果
    if (cell.candy.special !== CONFIG.SPECIAL.NORMAL) {
      var effect = this._triggerSpecialEffect(r, c, cell.candy);
      removed = removed.concat(effect.removed);
      score += effect.score;
    }

    removed.push({ r: r, c: c, color: cell.candy.color, special: cell.candy.special });
    score += CONFIG.SCORE_MATCH_3;
    cell.candy = null;

    if (cell.jelly > 0) { cell.jelly--; this.clearedJellies++; score += CONFIG.SCORE_JELLY; }
    this._damageAdjacentObstacles(r, c);

    return { removed: removed, score: score };
  }

  /**
   * 刷新道具：重新洗牌
   */
  useRefresh() {
    this.shuffle();
    return { shuffled: true };
  }

  /**
   * +5步道具
   */
  usePlus5() {
    return { extraMoves: 5 };
  }

  /**
   * 彩色球道具：在指定位置放置彩色球
   */
  useColorBomb(r, c) {
    var cell = this.grid[r][c];
    if (!cell || !cell.candy) return null;

    var oldColor = cell.candy.color;
    cell.candy = this._createCandy(oldColor, CONFIG.SPECIAL.COLOR_BOMB);

    return { r: r, c: c, type: CONFIG.SPECIAL.COLOR_BOMB };
  }

  // ---- 序列化（用于存档） ----

  serialize() {
    var data = {
      rows: this.rows,
      cols: this.cols,
      grid: []
    };
    for (var r = 0; r < this.rows; r++) {
      data.grid[r] = [];
      for (var c = 0; c < this.cols; c++) {
        var cell = this.grid[r][c];
        data.grid[r][c] = {
          candy: cell.candy ? { type: cell.candy.type, color: cell.candy.color, special: cell.candy.special } : null,
          obstacle: { type: cell.obstacle.type, hp: cell.obstacle.hp },
          jelly: cell.jelly,
          ingredient: cell.ingredient,
          isPortal: cell.isPortal,
          portalTarget: cell.portalTarget
        };
      }
    }
    return JSON.stringify(data);
  }

  deserialize(json) {
    var data = JSON.parse(json);
    this.rows = data.rows;
    this.cols = data.cols;
    this.grid = [];
    for (var r = 0; r < this.rows; r++) {
      this.grid[r] = [];
      for (var c = 0; c < this.cols; c++) {
        var d = data.grid[r][c];
        this.grid[r][c] = {
          candy: d.candy ? { type: d.candy.type, color: d.candy.color, special: d.candy.special } : null,
          obstacle: d.obstacle,
          jelly: d.jelly,
          ingredient: d.ingredient,
          isPortal: d.isPortal,
          portalTarget: d.portalTarget
        };
      }
    }
  }
}


// ===== storage.js =====
// ============================================================
// storage.js - 开心消消乐 本地存储管理
// ============================================================

var Storage = {
  SAVE_KEY: 'happy_match_save',

  /** 保存数据到本地存储 */
  save: function(data) {
    try {
      localStorage.setItem(this.SAVE_KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      console.warn('Storage.save failed:', e);
      return false;
    }
  },

  /** 从本地存储加载数据 */
  load: function() {
    try {
      var raw = localStorage.getItem(this.SAVE_KEY);
      if (raw) {
        var data = JSON.parse(raw);
        // 合并默认值（防止新增字段缺失）
        var defaults = this.getDefault();
        for (var key in defaults) {
          if (data[key] === undefined) {
            data[key] = defaults[key];
          }
        }
        // 合并items默认值
        if (data.items) {
          for (var itemKey in defaults.items) {
            if (data.items[itemKey] === undefined) {
              data.items[itemKey] = defaults.items[itemKey];
            }
          }
        }
        return data;
      }
    } catch (e) {
      console.warn('Storage.load failed:', e);
    }
    return this.getDefault();
  },

  /** 获取默认存档数据 */
  getDefault: function() {
    return {
      coins: 500,
      lives: 5,
      maxLives: 5,
      currentLevel: 1,
      levelStars: {},       // { "1": 3, "2": 2, ... }
      levelScores: {},      // { "1": 3500, "2": 2100, ... }
      items: {
        hammer: 0,
        refresh: 0,
        plus5: 0,
        colorBomb: 0
      },
      selectedPet: 'fox',
      dailyRewardDay: 0,
      lastDailyReward: null,
      soundEnabled: true,
      musicEnabled: true,
      vibrationEnabled: true,
      language: 'zh',
      totalStars: 0,
      consecutiveDays: 0,
      lastPlayDate: null,
      firstPurchase: false
    };
  },

  /** 更新单个字段 */
  updateField: function(field, value) {
    var data = this.load();
    data[field] = value;
    this.save(data);
    return data;
  },

  /** 更新多个字段 */
  updateFields: function(fields) {
    var data = this.load();
    for (var key in fields) {
      data[key] = fields[key];
    }
    this.save(data);
    return data;
  },

  /** 添加金币 */
  addCoins: function(amount) {
    var data = this.load();
    data.coins = Math.max(0, (data.coins || 0) + amount);
    this.save(data);
    return data.coins;
  },

  /** 消耗金币（不足返回false） */
  spendCoins: function(amount) {
    var data = this.load();
    if (data.coins < amount) return false;
    data.coins -= amount;
    this.save(data);
    return data.coins;
  },

  /** 添加道具 */
  addItem: function(itemId, count) {
    var data = this.load();
    if (!data.items) data.items = this.getDefault().items;
    data.items[itemId] = (data.items[itemId] || 0) + (count || 1);
    this.save(data);
    return data.items[itemId];
  },

  /** 消耗道具（不足返回false） */
  spendItem: function(itemId, count) {
    var data = this.load();
    if (!data.items || (data.items[itemId] || 0) < (count || 1)) return false;
    data.items[itemId] -= (count || 1);
    this.save(data);
    return data.items[itemId];
  },

  /** 记录关卡结果 */
  saveLevelResult: function(levelId, score, stars) {
    var data = this.load();
    var key = String(levelId);

    // 更新星级（取最高）
    var oldStars = data.levelStars[key] || 0;
    if (stars > oldStars) {
      data.totalStars = (data.totalStars || 0) + (stars - oldStars);
      data.levelStars[key] = stars;
    }

    // 更新最高分
    var oldScore = data.levelScores[key] || 0;
    if (score > oldScore) {
      data.levelScores[key] = score;
    }

    // 解锁下一关
    if (stars > 0 && levelId >= data.currentLevel) {
      data.currentLevel = levelId + 1;
    }

    this.save(data);
    return data;
  },

  /** 获取关卡星级 */
  getLevelStars: function(levelId) {
    var data = this.load();
    return data.levelStars[String(levelId)] || 0;
  },

  /** 获取关卡最高分 */
  getLevelScore: function(levelId) {
    var data = this.load();
    return data.levelScores[String(levelId)] || 0;
  },

  /** 检查关卡是否解锁 */
  isLevelUnlocked: function(levelId) {
    var data = this.load();
    return levelId <= data.currentLevel;
  },

  /** 使用体力（不足返回false） */
  useLife: function() {
    var data = this.load();
    if (data.lives <= 0) return false;
    data.lives--;
    this.save(data);
    return true;
  },

  /** 恢复体力 */
  addLives: function(count) {
    var data = this.load();
    data.lives = Math.min(data.maxLives, data.lives + (count || 1));
    this.save(data);
    return data.lives;
  },

  /** 检查并恢复体力（基于时间） */
  checkLifeRegen: function() {
    var data = this.load();
    if (data.lives >= data.maxLives) return data;

    if (!data.lastLifeTime) {
      data.lastLifeTime = Date.now();
      this.save(data);
      return data;
    }

    var elapsed = Date.now() - data.lastLifeTime;
    var regenCount = Math.floor(elapsed / CONFIG.LIFE_REGEN_TIME);

    if (regenCount > 0) {
      data.lives = Math.min(data.maxLives, data.lives + regenCount);
      data.lastLifeTime = Date.now();
      this.save(data);
    }

    return data;
  },

  /** 获取体力恢复倒计时（秒） */
  getLifeRegenTimer: function() {
    var data = this.load();
    if (data.lives >= data.maxLives) return 0;
    if (!data.lastLifeTime) return CONFIG.LIFE_REGEN_TIME / 1000;

    var elapsed = Date.now() - data.lastLifeTime;
    var remaining = CONFIG.LIFE_REGEN_TIME - (elapsed % CONFIG.LIFE_REGEN_TIME);
    return Math.ceil(remaining / 1000);
  },

  /** 检查每日奖励是否可领取 */
  canClaimDailyReward: function() {
    var data = this.load();
    if (!data.lastDailyReward) return true;

    var lastDate = new Date(data.lastDailyReward);
    var today = new Date();

    // 比较年月日
    if (lastDate.getFullYear() !== today.getFullYear() ||
        lastDate.getMonth() !== today.getMonth() ||
        lastDate.getDate() !== today.getDate()) {
      return true;
    }
    return false;
  },

  /** 领取每日奖励 */
  claimDailyReward: function() {
    var data = this.load();
    if (!this.canClaimDailyReward()) return null;

    var day = (data.dailyRewardDay || 0) + 1;
    if (day > 7) day = 1;

    // 检查连续天数
    var today = new Date();
    var yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (data.lastDailyReward) {
      var lastDate = new Date(data.lastDailyReward);
      if (lastDate.getFullYear() !== yesterday.getFullYear() ||
          lastDate.getMonth() !== yesterday.getMonth() ||
          lastDate.getDate() !== yesterday.getDate()) {
        // 不连续，重置
        day = 1;
        data.consecutiveDays = 0;
      }
    }

    data.dailyRewardDay = day;
    data.lastDailyReward = today.toISOString();
    data.consecutiveDays = (data.consecutiveDays || 0) + 1;

    // 获取奖励
    var reward = null;
    if (ShopData && ShopData.dailyRewards) {
      for (var i = 0; i < ShopData.dailyRewards.length; i++) {
        if (ShopData.dailyRewards[i].day === day) {
          reward = ShopData.dailyRewards[i].reward;
          break;
        }
      }
    }

    // 发放奖励
    if (reward) {
      if (reward.type === 'coins') {
        data.coins = (data.coins || 0) + reward.amount;
      } else if (reward.type === 'item') {
        if (!data.items) data.items = this.getDefault().items;
        data.items[reward.id] = (data.items[reward.id] || 0) + (reward.count || 1);
      } else if (reward.type === 'bundle' && ShopData && ShopData.bundles) {
        // 发放礼包
        var bundle = null;
        for (var i = 0; i < ShopData.bundles.length; i++) {
          if (ShopData.bundles[i].id === reward.id) {
            bundle = ShopData.bundles[i];
            break;
          }
        }
        if (bundle && bundle.items) {
          if (!data.items) data.items = this.getDefault().items;
          for (var j = 0; j < bundle.items.length; j++) {
            var bi = bundle.items[j];
            data.items[bi.id] = (data.items[bi.id] || 0) + (bi.count || 1);
          }
        }
      }
    }

    this.save(data);
    return { day: day, reward: reward, data: data };
  },

  /** 记录今日游玩日期 */
  recordPlayDate: function() {
    var data = this.load();
    var today = new Date().toISOString().split('T')[0];
    if (data.lastPlayDate !== today) {
      data.lastPlayDate = today;
      this.save(data);
    }
  },

  /** 重置存档 */
  reset: function() {
    localStorage.removeItem(this.SAVE_KEY);
    return this.getDefault();
  }
};


// ===== shop.js =====
// ============================================================
// shop.js - 开心消消乐 商城数据
// ============================================================

var ShopData = {
  // ---- 道具列表 ----
  items: [
    {
      id: 'hammer',
      name: '锤子',
      desc: '消除任意一个方块',
      price: 100,
      icon: '\u{1F528}',
      color: '#FF6B35'
    },
    {
      id: 'refresh',
      name: '刷新',
      desc: '重新排列所有方块',
      price: 80,
      icon: '\u{1F500}',
      color: '#4169E1'
    },
    {
      id: 'plus5',
      name: '+5步',
      desc: '增加5步',
      price: 50,
      icon: '\u2795',
      color: '#32CD32'
    },
    {
      id: 'colorBomb',
      name: '彩色球',
      desc: '消除所有同色方块',
      price: 200,
      icon: '\u{1F48E}',
      color: '#9370DB'
    }
  ],

  // ---- 套餐列表 ----
  bundles: [
    {
      id: 'hammer5',
      name: '锤子x5',
      desc: '5个锤子，超值套餐',
      items: [{ id: 'hammer', count: 5 }],
      price: 450,
      originalPrice: 500,
      icon: '\u{1F528}',
      color: '#FF6B35',
      discount: '9折'
    },
    {
      id: 'bundle1',
      name: '新手礼包',
      desc: '锤子x2 + 刷新x2',
      items: [{ id: 'hammer', count: 2 }, { id: 'refresh', count: 2 }],
      price: 300,
      originalPrice: 360,
      icon: '\u{1F381}',
      color: '#FFD700',
      discount: '83折'
    },
    {
      id: 'bundle2',
      name: '全套道具',
      desc: '锤子x3 + 刷新x3 + +5步x3 + 彩色球x1',
      items: [
        { id: 'hammer', count: 3 },
        { id: 'refresh', count: 3 },
        { id: 'plus5', count: 3 },
        { id: 'colorBomb', count: 1 }
      ],
      price: 500,
      originalPrice: 740,
      icon: '\u{1F4E6}',
      color: '#FF69B4',
      discount: '68折'
    }
  ],

  // ---- 宝箱列表 ----
  chests: [
    {
      id: 'chest_small',
      name: '小宝箱',
      desc: '随机3个道具',
      price: 300,
      icon: '\u{1F4E6}',
      color: '#CD853F',
      rewards: [
        { items: [{ id: 'hammer', count: 1 }, { id: 'refresh', count: 1 }, { id: 'plus5', count: 1 }] },
        { items: [{ id: 'hammer', count: 2 }, { id: 'plus5', count: 1 }] },
        { items: [{ id: 'refresh', count: 2 }, { id: 'colorBomb', count: 1 }] }
      ]
    },
    {
      id: 'chest_big',
      name: '大宝箱',
      desc: '随机5个道具 + 1个皮肤碎片',
      price: 800,
      icon: '\u{1F3C6}',
      color: '#FFD700',
      rewards: [
        { items: [{ id: 'hammer', count: 3 }, { id: 'refresh', count: 2 }] },
        { items: [{ id: 'colorBomb', count: 2 }, { id: 'plus5', count: 3 }] },
        { items: [{ id: 'hammer', count: 2 }, { id: 'refresh', count: 2 }, { id: 'colorBomb', count: 1 }] }
      ]
    },
    {
      id: 'chest_luxury',
      name: '豪华宝箱',
      desc: '随机10个道具 + 3个皮肤碎片',
      price: 1500,
      icon: '\u{1F451}',
      color: '#FF1493',
      rewards: [
        { items: [{ id: 'hammer', count: 5 }, { id: 'refresh', count: 3 }, { id: 'colorBomb', count: 2 }] },
        { items: [{ id: 'colorBomb', count: 3 }, { id: 'plus5', count: 5 }, { id: 'hammer', count: 2 }] },
        { items: [{ id: 'hammer', count: 4 }, { id: 'refresh', count: 4 }, { id: 'plus5', count: 2 }] }
      ]
    }
  ],

  // ---- 特惠列表 ----
  specials: [
    {
      id: 'special_newbie',
      name: '新手礼包',
      desc: '首次购买半价！全套道具x1',
      price: 250,
      originalPrice: 500,
      icon: '\u{1F31F}',
      color: '#00CED1',
      condition: 'firstPurchase',
      items: [
        { id: 'hammer', count: 3 },
        { id: 'refresh', count: 3 },
        { id: 'plus5', count: 3 },
        { id: 'colorBomb', count: 1 }
      ],
      discount: '半价',
      limited: false
    },
    {
      id: 'special_daily',
      name: '每日特惠',
      desc: '锤子x3 + +5步x2',
      price: 200,
      originalPrice: 400,
      icon: '\u{23F0}',
      color: '#FF8C00',
      condition: 'daily',
      items: [
        { id: 'hammer', count: 3 },
        { id: 'plus5', count: 2 }
      ],
      discount: '5折',
      limited: true,
      resetHour: 0
    },
    {
      id: 'special_weekend',
      name: '周末狂欢',
      desc: '彩色球x2 + 锤子x2',
      price: 350,
      originalPrice: 600,
      icon: '\u{1F389}',
      color: '#9370DB',
      condition: 'weekend',
      items: [
        { id: 'colorBomb', count: 2 },
        { id: 'hammer', count: 2 }
      ],
      discount: '58折',
      limited: true
    },
    {
      id: 'special_coin_pack',
      name: '金币大礼包',
      desc: '500金币 + 锤子x1',
      price: 0,
      originalPrice: 0,
      icon: '\u{1F4B0}',
      color: '#FFD700',
      condition: 'free',
      items: [],
      coinReward: 500,
      bonusItem: { id: 'hammer', count: 1 },
      discount: '免费',
      limited: true,
      cooldownHours: 24
    }
  ],

  // ---- 每日奖励 ----
  dailyRewards: [
    { day: 1, reward: { type: 'coins', amount: 100 }, icon: '\u{1F4B0}', name: '100金币' },
    { day: 2, reward: { type: 'item', id: 'hammer', count: 1 }, icon: '\u{1F528}', name: '锤子x1' },
    { day: 3, reward: { type: 'coins', amount: 200 }, icon: '\u{1F4B0}', name: '200金币' },
    { day: 4, reward: { type: 'item', id: 'plus5', count: 2 }, icon: '\u2795', name: '+5步x2' },
    { day: 5, reward: { type: 'item', id: 'colorBomb', count: 1 }, icon: '\u{1F48E}', name: '彩色球x1' },
    { day: 6, reward: { type: 'coins', amount: 500 }, icon: '\u{1F4B0}', name: '500金币' },
    { day: 7, reward: { type: 'bundle', id: 'bundle2' }, icon: '\u{1F381}', name: '全套道具x1' }
  ],

  // ---- 辅助方法 ----

  /** 根据ID获取道具信息 */
  getItemById: function(id) {
    for (var i = 0; i < this.items.length; i++) {
      if (this.items[i].id === id) return this.items[i];
    }
    return null;
  },

  /** 根据ID获取套餐信息 */
  getBundleById: function(id) {
    for (var i = 0; i < this.bundles.length; i++) {
      if (this.bundles[i].id === id) return this.bundles[i];
    }
    return null;
  },

  /** 根据ID获取宝箱信息 */
  getChestById: function(id) {
    for (var i = 0; i < this.chests.length; i++) {
      if (this.chests[i].id === id) return this.chests[i];
    }
    return null;
  },

  /** 根据ID获取特惠信息 */
  getSpecialById: function(id) {
    for (var i = 0; i < this.specials.length; i++) {
      if (this.specials[i].id === id) return this.specials[i];
    }
    return null;
  },

  /** 获取今日可用的特惠列表 */
  getAvailableSpecials: function() {
    var available = [];
    var now = new Date();
    var dayOfWeek = now.getDay(); // 0=周日, 6=周六
    var isWeekend = (dayOfWeek === 0 || dayOfWeek === 6);

    for (var i = 0; i < this.specials.length; i++) {
      var sp = this.specials[i];
      var show = false;

      switch (sp.condition) {
        case 'firstPurchase':
          var data = Storage.load();
          show = !data.firstPurchase;
          break;
        case 'daily':
          show = true;
          break;
        case 'weekend':
          show = isWeekend;
          break;
        case 'free':
          show = true;
          break;
        default:
          show = true;
      }

      if (show) available.push(sp);
    }

    return available;
  },

  /** 购买道具 */
  purchaseItem: function(itemId, count) {
    var item = this.getItemById(itemId);
    if (!item) return { success: false, reason: 'item_not_found' };

    var data = Storage.load();
    var totalPrice = item.price * (count || 1);

    if (data.coins < totalPrice) {
      return { success: false, reason: 'insufficient_coins', needed: totalPrice - data.coins };
    }

    data.coins -= totalPrice;
    if (!data.items) data.items = Storage.getDefault().items;
    data.items[itemId] = (data.items[itemId] || 0) + (count || 1);
    Storage.save(data);

    return { success: true, coins: data.coins, itemCount: data.items[itemId] };
  },

  /** 购买套餐 */
  purchaseBundle: function(bundleId) {
    var bundle = this.getBundleById(bundleId);
    if (!bundle) return { success: false, reason: 'bundle_not_found' };

    var data = Storage.load();
    if (data.coins < bundle.price) {
      return { success: false, reason: 'insufficient_coins', needed: bundle.price - data.coins };
    }

    data.coins -= bundle.price;
    if (!data.items) data.items = Storage.getDefault().items;

    for (var i = 0; i < bundle.items.length; i++) {
      var bi = bundle.items[i];
      data.items[bi.id] = (data.items[bi.id] || 0) + (bi.count || 1);
    }

    Storage.save(data);
    return { success: true, coins: data.coins, items: data.items };
  },

  /** 购买宝箱 */
  purchaseChest: function(chestId) {
    var chest = this.getChestById(chestId);
    if (!chest) return { success: false, reason: 'chest_not_found' };

    var data = Storage.load();
    if (data.coins < chest.price) {
      return { success: false, reason: 'insufficient_coins', needed: chest.price - data.coins };
    }

    data.coins -= chest.price;
    if (!data.items) data.items = Storage.getDefault().items;

    // 随机选择奖励
    var rewardIndex = Math.floor(Math.random() * chest.rewards.length);
    var reward = chest.rewards[rewardIndex];

    for (var i = 0; i < reward.items.length; i++) {
      var ri = reward.items[i];
      data.items[ri.id] = (data.items[ri.id] || 0) + (ri.count || 1);
    }

    Storage.save(data);
    return { success: true, coins: data.coins, items: data.items, reward: reward };
  },

  /** 购买特惠 */
  purchaseSpecial: function(specialId) {
    var sp = this.getSpecialById(specialId);
    if (!sp) return { success: false, reason: 'special_not_found' };

    var data = Storage.load();

    // 免费特惠
    if (sp.price === 0) {
      if (!data.items) data.items = Storage.getDefault().items;
      if (sp.coinReward) data.coins += sp.coinReward;
      if (sp.bonusItem) {
        data.items[sp.bonusItem.id] = (data.items[sp.bonusItem.id] || 0) + (sp.bonusItem.count || 1);
      }
      if (sp.items) {
        for (var i = 0; i < sp.items.length; i++) {
          var si = sp.items[i];
          data.items[si.id] = (data.items[si.id] || 0) + (si.count || 1);
        }
      }
      Storage.save(data);
      return { success: true, coins: data.coins, items: data.items };
    }

    if (data.coins < sp.price) {
      return { success: false, reason: 'insufficient_coins', needed: sp.price - data.coins };
    }

    data.coins -= sp.price;
    if (!data.items) data.items = Storage.getDefault().items;

    if (sp.items) {
      for (var i = 0; i < sp.items.length; i++) {
        var si = sp.items[i];
        data.items[si.id] = (data.items[si.id] || 0) + (si.count || 1);
      }
    }

    // 标记首次购买
    if (sp.condition === 'firstPurchase') {
      data.firstPurchase = true;
    }

    Storage.save(data);
    return { success: true, coins: data.coins, items: data.items };
  }
};


// ===== pets.js =====
// ============================================================
// pets.js - 开心消消乐 宠物系统
// ============================================================

var Pets = {
  list: [
    {
      id: 'fox',
      name: '小狐狸',
      color: '#FF6B35',
      bodyColor: '#FF8C5A',
      earColor: '#E85D26',
      bellyColor: '#FFF5E6',
      skill: '每消除10个方块，随机消除1个方块',
      skillType: 'auto_remove',
      unlockLevel: 1,
      draw: function(ctx, x, y, size) {
        var s = size || 64;
        var cx = x + s / 2;
        var cy = y + s / 2;
        var r = s * 0.42;

        // 尖耳朵
        ctx.save();
        ctx.fillStyle = this.earColor;
        // 左耳
        ctx.beginPath();
        ctx.moveTo(cx - r * 0.7, cy - r * 0.3);
        ctx.lineTo(cx - r * 0.9, cy - r * 1.2);
        ctx.lineTo(cx - r * 0.1, cy - r * 0.7);
        ctx.closePath();
        ctx.fill();
        // 右耳
        ctx.beginPath();
        ctx.moveTo(cx + r * 0.7, cy - r * 0.3);
        ctx.lineTo(cx + r * 0.9, cy - r * 1.2);
        ctx.lineTo(cx + r * 0.1, cy - r * 0.7);
        ctx.closePath();
        ctx.fill();

        // 耳朵内部
        ctx.fillStyle = '#FFB88C';
        ctx.beginPath();
        ctx.moveTo(cx - r * 0.6, cy - r * 0.4);
        ctx.lineTo(cx - r * 0.75, cy - r * 0.95);
        ctx.lineTo(cx - r * 0.2, cy - r * 0.65);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx + r * 0.6, cy - r * 0.4);
        ctx.lineTo(cx + r * 0.75, cy - r * 0.95);
        ctx.lineTo(cx + r * 0.2, cy - r * 0.65);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // 脸部（圆形）
        ctx.save();
        ctx.fillStyle = this.bodyColor;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();

        // 白色脸部区域
        ctx.fillStyle = this.bellyColor;
        ctx.beginPath();
        ctx.ellipse(cx, cy + r * 0.15, r * 0.6, r * 0.55, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 眼睛
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.ellipse(cx - r * 0.3, cy - r * 0.1, r * 0.12, r * 0.15, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(cx + r * 0.3, cy - r * 0.1, r * 0.12, r * 0.15, 0, 0, Math.PI * 2);
        ctx.fill();

        // 眼睛高光
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.arc(cx - r * 0.25, cy - r * 0.18, r * 0.05, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx + r * 0.35, cy - r * 0.18, r * 0.05, 0, Math.PI * 2);
        ctx.fill();

        // 鼻子
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.ellipse(cx, cy + r * 0.15, r * 0.08, r * 0.06, 0, 0, Math.PI * 2);
        ctx.fill();

        // 微笑嘴巴
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(cx, cy + r * 0.2, r * 0.2, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.stroke();

        // 脸颊红晕
        ctx.fillStyle = 'rgba(255,150,150,0.35)';
        ctx.beginPath();
        ctx.ellipse(cx - r * 0.55, cy + r * 0.1, r * 0.12, r * 0.08, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(cx + r * 0.55, cy + r * 0.1, r * 0.12, r * 0.08, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    },
    {
      id: 'cat',
      name: '小猫咪',
      color: '#FFB347',
      bodyColor: '#FFD699',
      earColor: '#FF9F1C',
      bellyColor: '#FFF5E6',
      skill: '每5步恢复1步',
      skillType: 'add_move',
      unlockLevel: 10,
      draw: function(ctx, x, y, size) {
        var s = size || 64;
        var cx = x + s / 2;
        var cy = y + s / 2;
        var r = s * 0.42;

        // 三角耳朵
        ctx.save();
        ctx.fillStyle = this.earColor;
        // 左耳
        ctx.beginPath();
        ctx.moveTo(cx - r * 0.8, cy - r * 0.4);
        ctx.lineTo(cx - r * 0.5, cy - r * 1.3);
        ctx.lineTo(cx - r * 0.05, cy - r * 0.6);
        ctx.closePath();
        ctx.fill();
        // 右耳
        ctx.beginPath();
        ctx.moveTo(cx + r * 0.8, cy - r * 0.4);
        ctx.lineTo(cx + r * 0.5, cy - r * 1.3);
        ctx.lineTo(cx + r * 0.05, cy - r * 0.6);
        ctx.closePath();
        ctx.fill();

        // 耳朵内部（粉色）
        ctx.fillStyle = '#FFB5B5';
        ctx.beginPath();
        ctx.moveTo(cx - r * 0.65, cy - r * 0.45);
        ctx.lineTo(cx - r * 0.48, cy - r * 1.05);
        ctx.lineTo(cx - r * 0.15, cy - r * 0.6);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx + r * 0.65, cy - r * 0.45);
        ctx.lineTo(cx + r * 0.48, cy - r * 1.05);
        ctx.lineTo(cx + r * 0.15, cy - r * 0.6);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // 脸部
        ctx.save();
        ctx.fillStyle = this.bodyColor;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 眼睛（猫眼形状）
        ctx.save();
        ctx.fillStyle = '#4CAF50';
        // 左眼
        ctx.beginPath();
        ctx.ellipse(cx - r * 0.3, cy - r * 0.1, r * 0.14, r * 0.16, 0, 0, Math.PI * 2);
        ctx.fill();
        // 竖瞳孔
        ctx.fillStyle = '#222';
        ctx.beginPath();
        ctx.ellipse(cx - r * 0.3, cy - r * 0.1, r * 0.04, r * 0.14, 0, 0, Math.PI * 2);
        ctx.fill();
        // 右眼
        ctx.fillStyle = '#4CAF50';
        ctx.beginPath();
        ctx.ellipse(cx + r * 0.3, cy - r * 0.1, r * 0.14, r * 0.16, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#222';
        ctx.beginPath();
        ctx.ellipse(cx + r * 0.3, cy - r * 0.1, r * 0.04, r * 0.14, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 眼睛高光
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.arc(cx - r * 0.25, cy - r * 0.18, r * 0.04, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx + r * 0.35, cy - r * 0.18, r * 0.04, 0, Math.PI * 2);
        ctx.fill();

        // 鼻子（倒三角）
        ctx.fillStyle = '#FFB5B5';
        ctx.beginPath();
        ctx.moveTo(cx, cy + r * 0.08);
        ctx.lineTo(cx - r * 0.08, cy + r * 0.18);
        ctx.lineTo(cx + r * 0.08, cy + r * 0.18);
        ctx.closePath();
        ctx.fill();

        // 嘴巴
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(cx, cy + r * 0.18);
        ctx.lineTo(cx, cy + r * 0.28);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx - r * 0.12, cy + r * 0.32, r * 0.12, 1.1 * Math.PI, 1.7 * Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx + r * 0.12, cy + r * 0.32, r * 0.12, 1.3 * Math.PI, 1.9 * Math.PI);
        ctx.stroke();

        // 胡须
        ctx.strokeStyle = '#999';
        ctx.lineWidth = 1;
        // 左胡须
        ctx.beginPath();
        ctx.moveTo(cx - r * 0.3, cy + r * 0.2);
        ctx.lineTo(cx - r * 0.9, cy + r * 0.1);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx - r * 0.3, cy + r * 0.3);
        ctx.lineTo(cx - r * 0.9, cy + r * 0.35);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx - r * 0.3, cy + r * 0.4);
        ctx.lineTo(cx - r * 0.85, cy + r * 0.55);
        ctx.stroke();
        // 右胡须
        ctx.beginPath();
        ctx.moveTo(cx + r * 0.3, cy + r * 0.2);
        ctx.lineTo(cx + r * 0.9, cy + r * 0.1);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + r * 0.3, cy + r * 0.3);
        ctx.lineTo(cx + r * 0.9, cy + r * 0.35);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + r * 0.3, cy + r * 0.4);
        ctx.lineTo(cx + r * 0.85, cy + r * 0.55);
        ctx.stroke();
      }
    },
    {
      id: 'owl',
      name: '猫头鹰',
      color: '#8B6914',
      bodyColor: '#A07828',
      earColor: '#6B4F10',
      bellyColor: '#F5DEB3',
      skill: '条纹糖果效果翻倍',
      skillType: 'boost_striped',
      unlockLevel: 20,
      draw: function(ctx, x, y, size) {
        var s = size || 64;
        var cx = x + s / 2;
        var cy = y + s / 2;
        var r = s * 0.42;

        // 耳朵（小尖角）
        ctx.save();
        ctx.fillStyle = this.earColor;
        ctx.beginPath();
        ctx.moveTo(cx - r * 0.6, cy - r * 0.5);
        ctx.lineTo(cx - r * 0.75, cy - r * 1.15);
        ctx.lineTo(cx - r * 0.2, cy - r * 0.65);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx + r * 0.6, cy - r * 0.5);
        ctx.lineTo(cx + r * 0.75, cy - r * 1.15);
        ctx.lineTo(cx + r * 0.2, cy - r * 0.65);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // 脸部
        ctx.save();
        ctx.fillStyle = this.bodyColor;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 面盘（浅色圆圈）
        ctx.save();
        ctx.fillStyle = this.bellyColor;
        ctx.beginPath();
        ctx.ellipse(cx, cy - r * 0.05, r * 0.75, r * 0.7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 大圆眼睛
        ctx.save();
        // 左眼
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.arc(cx - r * 0.3, cy - r * 0.1, r * 0.22, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(cx - r * 0.3, cy - r * 0.1, r * 0.13, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.arc(cx - r * 0.24, cy - r * 0.18, r * 0.05, 0, Math.PI * 2);
        ctx.fill();

        // 右眼
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.arc(cx + r * 0.3, cy - r * 0.1, r * 0.22, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(cx + r * 0.3, cy - r * 0.1, r * 0.13, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.arc(cx + r * 0.36, cy - r * 0.18, r * 0.05, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 喙（三角形）
        ctx.save();
        ctx.fillStyle = '#FF8C00';
        ctx.beginPath();
        ctx.moveTo(cx, cy + r * 0.1);
        ctx.lineTo(cx - r * 0.1, cy + r * 0.28);
        ctx.lineTo(cx + r * 0.1, cy + r * 0.28);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // 翅膀纹理
        ctx.save();
        ctx.fillStyle = this.earColor;
        ctx.globalAlpha = 0.4;
        ctx.beginPath();
        ctx.ellipse(cx - r * 0.85, cy + r * 0.1, r * 0.2, r * 0.5, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(cx + r * 0.85, cy + r * 0.1, r * 0.2, r * 0.5, -0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    },
    {
      id: 'panda',
      name: '小熊猫',
      color: '#333333',
      bodyColor: '#FFFFFF',
      earColor: '#222222',
      bellyColor: '#F5F5F5',
      skill: '果冻消除效果+1',
      skillType: 'boost_jelly',
      unlockLevel: 30,
      draw: function(ctx, x, y, size) {
        var s = size || 64;
        var cx = x + s / 2;
        var cy = y + s / 2;
        var r = s * 0.42;

        // 圆耳朵
        ctx.save();
        ctx.fillStyle = this.earColor;
        ctx.beginPath();
        ctx.arc(cx - r * 0.65, cy - r * 0.65, r * 0.28, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx + r * 0.65, cy - r * 0.65, r * 0.28, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 脸部（白色）
        ctx.save();
        ctx.fillStyle = this.bodyColor;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 黑眼圈
        ctx.save();
        ctx.fillStyle = '#444';
        // 左眼圈
        ctx.beginPath();
        ctx.ellipse(cx - r * 0.3, cy - r * 0.1, r * 0.25, r * 0.2, -0.2, 0, Math.PI * 2);
        ctx.fill();
        // 右眼圈
        ctx.beginPath();
        ctx.ellipse(cx + r * 0.3, cy - r * 0.1, r * 0.25, r * 0.2, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 眼睛
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.arc(cx - r * 0.28, cy - r * 0.12, r * 0.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx + r * 0.28, cy - r * 0.12, r * 0.1, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#111';
        ctx.beginPath();
        ctx.arc(cx - r * 0.28, cy - r * 0.1, r * 0.06, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx + r * 0.28, cy - r * 0.1, r * 0.06, 0, Math.PI * 2);
        ctx.fill();

        // 眼睛高光
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.arc(cx - r * 0.25, cy - r * 0.15, r * 0.03, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx + r * 0.31, cy - r * 0.15, r * 0.03, 0, Math.PI * 2);
        ctx.fill();

        // 鼻子
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.ellipse(cx, cy + r * 0.15, r * 0.1, r * 0.07, 0, 0, Math.PI * 2);
        ctx.fill();

        // 嘴巴
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(cx, cy + r * 0.22);
        ctx.lineTo(cx, cy + r * 0.3);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx - r * 0.1, cy + r * 0.33, r * 0.1, 1.1 * Math.PI, 1.7 * Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx + r * 0.1, cy + r * 0.33, r * 0.1, 1.3 * Math.PI, 1.9 * Math.PI);
        ctx.stroke();

        // 腮红
        ctx.fillStyle = 'rgba(255,180,180,0.3)';
        ctx.beginPath();
        ctx.ellipse(cx - r * 0.5, cy + r * 0.15, r * 0.1, r * 0.07, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(cx + r * 0.5, cy + r * 0.15, r * 0.1, r * 0.07, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    },
    {
      id: 'unicorn',
      name: '独角兽',
      color: '#FF69B4',
      bodyColor: '#E8B4F8',
      earColor: '#D8A0E8',
      bellyColor: '#FFF0FF',
      skill: '每局开始随机生成1个彩色球',
      skillType: 'free_color_bomb',
      unlockLevel: 40,
      draw: function(ctx, x, y, size) {
        var s = size || 64;
        var cx = x + s / 2;
        var cy = y + s / 2;
        var r = s * 0.42;

        // 角（金色螺旋）
        ctx.save();
        var hornGrad = ctx.createLinearGradient(cx, cy - r * 1.5, cx, cy - r * 0.5);
        hornGrad.addColorStop(0, '#FFD700');
        hornGrad.addColorStop(0.5, '#FFF8DC');
        hornGrad.addColorStop(1, '#FFD700');
        ctx.fillStyle = hornGrad;
        ctx.beginPath();
        ctx.moveTo(cx - r * 0.08, cy - r * 0.6);
        ctx.lineTo(cx, cy - r * 1.4);
        ctx.lineTo(cx + r * 0.08, cy - r * 0.6);
        ctx.closePath();
        ctx.fill();

        // 角的螺旋纹理
        ctx.strokeStyle = 'rgba(255,200,0,0.5)';
        ctx.lineWidth = 1;
        for (var i = 0; i < 4; i++) {
          var hy = cy - r * 0.7 - i * r * 0.15;
          ctx.beginPath();
          ctx.moveTo(cx - r * 0.06 + i * 0.5, hy);
          ctx.lineTo(cx + r * 0.06 - i * 0.5, hy);
          ctx.stroke();
        }
        ctx.restore();

        // 彩虹鬃毛
        ctx.save();
        var maneColors = ['#FF0000', '#FF8800', '#FFFF00', '#00FF00', '#0088FF', '#8800FF'];
        for (var i = 0; i < maneColors.length; i++) {
          ctx.fillStyle = maneColors[i];
          ctx.globalAlpha = 0.6;
          var mx = cx + r * 0.6 + i * 2;
          var my = cy - r * 0.4 + i * r * 0.15;
          ctx.beginPath();
          ctx.ellipse(mx, my, r * 0.15, r * 0.12, 0.3, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();

        // 小耳朵
        ctx.save();
        ctx.fillStyle = this.earColor;
        ctx.beginPath();
        ctx.moveTo(cx - r * 0.55, cy - r * 0.45);
        ctx.lineTo(cx - r * 0.65, cy - r * 1.0);
        ctx.lineTo(cx - r * 0.15, cy - r * 0.6);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx + r * 0.55, cy - r * 0.45);
        ctx.lineTo(cx + r * 0.65, cy - r * 1.0);
        ctx.lineTo(cx + r * 0.15, cy - r * 0.6);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // 脸部
        ctx.save();
        ctx.fillStyle = this.bodyColor;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 大眼睛（紫色梦幻）
        ctx.save();
        ctx.fillStyle = '#9370DB';
        ctx.beginPath();
        ctx.ellipse(cx - r * 0.28, cy - r * 0.05, r * 0.14, r * 0.16, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#6A0DAD';
        ctx.beginPath();
        ctx.arc(cx - r * 0.28, cy - r * 0.05, r * 0.08, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#9370DB';
        ctx.beginPath();
        ctx.ellipse(cx + r * 0.28, cy - r * 0.05, r * 0.14, r * 0.16, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#6A0DAD';
        ctx.beginPath();
        ctx.arc(cx + r * 0.28, cy - r * 0.05, r * 0.08, 0, Math.PI * 2);
        ctx.fill();

        // 高光
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.arc(cx - r * 0.23, cy - r * 0.12, r * 0.05, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx + r * 0.33, cy - r * 0.12, r * 0.05, 0, Math.PI * 2);
        ctx.fill();

        // 星星高光
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.beginPath();
        ctx.arc(cx - r * 0.32, cy + r * 0.0, r * 0.03, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx + r * 0.24, cy + r * 0.0, r * 0.03, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 鼻子
        ctx.fillStyle = '#FF69B4';
        ctx.beginPath();
        ctx.ellipse(cx, cy + r * 0.18, r * 0.07, r * 0.05, 0, 0, Math.PI * 2);
        ctx.fill();

        // 微笑
        ctx.strokeStyle = '#FF69B4';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(cx, cy + r * 0.22, r * 0.18, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.stroke();

        // 腮红
        ctx.fillStyle = 'rgba(255,150,200,0.3)';
        ctx.beginPath();
        ctx.ellipse(cx - r * 0.5, cy + r * 0.15, r * 0.1, r * 0.07, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(cx + r * 0.5, cy + r * 0.15, r * 0.1, r * 0.07, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  ],

  // ---- 辅助方法 ----

  /** 根据ID获取宠物 */
  getPetById: function(id) {
    for (var i = 0; i < this.list.length; i++) {
      if (this.list[i].id === id) return this.list[i];
    }
    return null;
  },

  /** 获取当前选择的宠物 */
  getSelectedPet: function() {
    var data = Storage.load();
    return this.getPetById(data.selectedPet || 'fox');
  },

  /** 选择宠物 */
  selectPet: function(petId) {
    var pet = this.getPetById(petId);
    if (!pet) return false;

    var data = Storage.load();
    data.selectedPet = petId;
    Storage.save(data);
    return true;
  },

  /** 检查宠物是否解锁 */
  isPetUnlocked: function(petId) {
    var pet = this.getPetById(petId);
    if (!pet) return false;

    var data = Storage.load();
    return data.currentLevel >= pet.unlockLevel;
  },

  /** 获取宠物解锁所需关卡 */
  getUnlockLevel: function(petId) {
    var pet = this.getPetById(petId);
    return pet ? pet.unlockLevel : 999;
  }
};


// ===== map.js =====
// ============================================================
// map.js - 开心消消乐 关卡地图数据（50关）
// ============================================================

var LevelMap = {
  // ---- 50个关卡配置 ----
  levels: [
    // === 关卡1-5：纯分数模式，入门 ===
    { id:1,  mode:'score', target:1000, moves:25, rows:9, cols:9, stars:[1000,2000,3000], candyCount:5 },
    { id:2,  mode:'score', target:1500, moves:25, rows:9, cols:9, stars:[1500,3000,4500], candyCount:5 },
    { id:3,  mode:'score', target:2000, moves:24, rows:9, cols:9, stars:[2000,3500,5000], candyCount:5 },
    { id:4,  mode:'score', target:2500, moves:23, rows:9, cols:9, stars:[2500,4000,6000], candyCount:5 },
    { id:5,  mode:'score', target:3000, moves:22, rows:9, cols:9, stars:[3000,5000,8000], candyCount:5, isBoss:true },

    // === 关卡6-10：分数模式，目标更高 ===
    { id:6,  mode:'score', target:3500, moves:22, rows:9, cols:9, stars:[3500,5500,8500], candyCount:5 },
    { id:7,  mode:'score', target:4000, moves:21, rows:9, cols:9, stars:[4000,6000,9000], candyCount:5 },
    { id:8,  mode:'score', target:4500, moves:21, rows:9, cols:9, stars:[4500,7000,10000], candyCount:6 },
    { id:9,  mode:'score', target:5000, moves:20, rows:9, cols:9, stars:[5000,8000,12000], candyCount:6 },
    { id:10, mode:'score', target:6000, moves:20, rows:9, cols:9, stars:[6000,9000,14000], candyCount:6, isBoss:true },

    // === 关卡11-15：果冻模式入门 ===
    { id:11, mode:'jelly', target:0, moves:25, rows:9, cols:9, jellyCount:8, stars:[1,2,3], candyCount:5 },
    { id:12, mode:'jelly', target:0, moves:24, rows:9, cols:9, jellyCount:10, stars:[1,2,3], candyCount:5 },
    { id:13, mode:'jelly', target:0, moves:24, rows:9, cols:9, jellyCount:12, stars:[1,2,3], candyCount:5 },
    { id:14, mode:'jelly', target:0, moves:23, rows:9, cols:9, jellyCount:14, stars:[1,2,3], candyCount:6 },
    { id:15, mode:'jelly', target:0, moves:22, rows:9, cols:9, jellyCount:16, stars:[1,2,3], candyCount:6, isBoss:true },

    // === 关卡16-20：果冻+冰块 ===
    { id:16, mode:'jelly', target:0, moves:25, rows:9, cols:9, jellyCount:12,
      obstacles:[{type:'ice_1',cells:[[2,2],[2,3],[2,4],[3,2],[3,4]]}],
      stars:[1,2,3], candyCount:5 },
    { id:17, mode:'jelly', target:0, moves:24, rows:9, cols:9, jellyCount:14,
      obstacles:[{type:'ice_1',cells:[[1,3],[1,5],[3,1],[3,7],[5,3],[5,5]]}],
      stars:[1,2,3], candyCount:5 },
    { id:18, mode:'jelly', target:0, moves:24, rows:9, cols:9, jellyCount:15,
      obstacles:[{type:'ice_2',cells:[[2,2],[2,6],[6,2],[6,6]]}],
      stars:[1,2,3], candyCount:5 },
    { id:19, mode:'jelly', target:0, moves:23, rows:9, cols:9, jellyCount:16,
      obstacles:[{type:'ice_1',cells:[[1,1],[1,7],[7,1],[7,7],[4,4]]},{type:'ice_2',cells:[[3,3],[3,5],[5,3],[5,5]]}],
      stars:[1,2,3], candyCount:6 },
    { id:20, mode:'jelly', target:0, moves:22, rows:9, cols:9, jellyCount:18,
      obstacles:[{type:'ice_2',cells:[[0,4],[4,0],[4,8],[8,4]]},{type:'ice_1',cells:[[2,2],[2,6],[6,2],[6,6]]}],
      stars:[1,2,3], candyCount:6, isBoss:true },

    // === 关卡21-25：分数+锁链 ===
    { id:21, mode:'score', target:5000, moves:22, rows:9, cols:9,
      lockedCells:[[2,2],[2,6],[4,4],[6,2],[6,6]],
      stars:[5000,8000,12000], candyCount:5 },
    { id:22, mode:'score', target:5500, moves:22, rows:9, cols:9,
      lockedCells:[[1,3],[1,5],[3,1],[3,7],[5,1],[5,7],[7,3],[7,5]],
      stars:[5500,8500,13000], candyCount:5 },
    { id:23, mode:'score', target:6000, moves:21, rows:9, cols:9,
      lockedCells:[[0,0],[0,8],[8,0],[8,8],[4,4]],
      obstacles:[{type:'ice_1',cells:[[2,4],[4,2],[4,6],[6,4]]}],
      stars:[6000,9000,14000], candyCount:6 },
    { id:24, mode:'score', target:7000, moves:21, rows:9, cols:9,
      lockedCells:[[1,1],[1,7],[3,3],[3,5],[5,3],[5,5],[7,1],[7,7]],
      stars:[7000,10000,15000], candyCount:6 },
    { id:25, mode:'score', target:8000, moves:20, rows:9, cols:9,
      lockedCells:[[0,4],[2,2],[2,6],[4,0],[4,8],[6,2],[6,6],[8,4]],
      obstacles:[{type:'ice_2',cells:[[3,3],[3,5],[5,3],[5,5]]}],
      stars:[8000,12000,18000], candyCount:6, isBoss:true },

    // === 关卡26-30：果冻+多层冰 ===
    { id:26, mode:'jelly', target:0, moves:25, rows:9, cols:9, jellyCount:15,
      obstacles:[{type:'ice_2',cells:[[1,1],[1,7],[7,1],[7,7]]},{type:'ice_1',cells:[[3,3],[3,5],[5,3],[5,5]]}],
      stars:[1,2,3], candyCount:5 },
    { id:27, mode:'jelly', target:0, moves:24, rows:9, cols:9, jellyCount:18,
      obstacles:[{type:'ice_2',cells:[[2,2],[2,6],[6,2],[6,6]]},{type:'ice_3',cells:[[4,4]]}],
      stars:[1,2,3], candyCount:5 },
    { id:28, mode:'jelly', target:0, moves:24, rows:9, cols:9, jellyCount:20,
      obstacles:[{type:'ice_3',cells:[[0,4],[4,0],[4,8],[8,4]]},{type:'ice_2',cells:[[2,2],[2,6],[6,2],[6,6]]}],
      stars:[1,2,3], candyCount:6 },
    { id:29, mode:'jelly', target:0, moves:23, rows:9, cols:9, jellyCount:22,
      obstacles:[{type:'ice_3',cells:[[1,1],[1,7],[7,1],[7,7]]},{type:'ice_2',cells:[[3,3],[3,5],[5,3],[5,5]]},{type:'ice_1',cells:[[4,4]]}],
      stars:[1,2,3], candyCount:6 },
    { id:30, mode:'jelly', target:0, moves:22, rows:9, cols:9, jellyCount:25,
      obstacles:[{type:'ice_3',cells:[[2,2],[2,6],[6,2],[6,6]]},{type:'ice_2',cells:[[0,4],[4,0],[4,8],[8,4]]}],
      stars:[1,2,3], candyCount:6, isBoss:true },

    // === 关卡31-35：果子运送入门 ===
    { id:31, mode:'ingredient', target:0, moves:28, rows:9, cols:9,
      ingredients:['cherry','cherry'],
      stars:[1,2,3], candyCount:5 },
    { id:32, mode:'ingredient', target:0, moves:27, rows:9, cols:9,
      ingredients:['cherry','hazelnut'],
      stars:[1,2,3], candyCount:5 },
    { id:33, mode:'ingredient', target:0, moves:26, rows:9, cols:9,
      ingredients:['cherry','cherry','hazelnut'],
      obstacles:[{type:'ice_1',cells:[[2,4],[6,4]]}],
      stars:[1,2,3], candyCount:5 },
    { id:34, mode:'ingredient', target:0, moves:26, rows:9, cols:9,
      ingredients:['cherry','hazelnut','hazelnut'],
      obstacles:[{type:'ice_2',cells:[[3,2],[3,6],[5,2],[5,6]]}],
      stars:[1,2,3], candyCount:6 },
    { id:35, mode:'ingredient', target:0, moves:25, rows:9, cols:9,
      ingredients:['cherry','cherry','hazelnut','hazelnut'],
      obstacles:[{type:'ice_2',cells:[[2,2],[2,6],[6,2],[6,6]]},{type:'stone',cells:[[4,4]]}],
      stars:[1,2,3], candyCount:6, isBoss:true },

    // === 关卡36-40：果子+石头 ===
    { id:36, mode:'ingredient', target:0, moves:28, rows:9, cols:9,
      ingredients:['cherry','cherry'],
      stones:[[2,2],[2,6],[6,2],[6,6]],
      stars:[1,2,3], candyCount:5 },
    { id:37, mode:'ingredient', target:0, moves:27, rows:9, cols:9,
      ingredients:['cherry','hazelnut'],
      stones:[[1,1],[1,7],[3,4],[5,4],[7,1],[7,7]],
      stars:[1,2,3], candyCount:5 },
    { id:38, mode:'ingredient', target:0, moves:26, rows:9, cols:9,
      ingredients:['cherry','cherry','hazelnut'],
      stones:[[0,4],[4,0],[4,8],[8,4]],
      obstacles:[{type:'ice_2',cells:[[2,2],[2,6],[6,2],[6,6]]}],
      stars:[1,2,3], candyCount:6 },
    { id:39, mode:'ingredient', target:0, moves:25, rows:9, cols:9,
      ingredients:['cherry','hazelnut','hazelnut'],
      stones:[[2,4],[4,2],[4,6],[6,4]],
      lockedCells:[[1,1],[1,7],[7,1],[7,7]],
      stars:[1,2,3], candyCount:6 },
    { id:40, mode:'ingredient', target:0, moves:24, rows:9, cols:9,
      ingredients:['cherry','cherry','hazelnut','hazelnut'],
      stones:[[3,3],[3,5],[5,3],[5,5]],
      obstacles:[{type:'ice_3',cells:[[1,4],[4,1],[4,7],[7,4]]}],
      lockedCells:[[0,0],[0,8],[8,0],[8,8]],
      stars:[1,2,3], candyCount:6, isBoss:true },

    // === 关卡41-45：混合模式 ===
    { id:41, mode:'jelly', target:0, moves:24, rows:9, cols:9, jellyCount:20,
      obstacles:[{type:'ice_2',cells:[[2,2],[2,6],[6,2],[6,6]]}],
      stones:[[4,4]],
      lockedCells:[[1,4],[7,4]],
      stars:[1,2,3], candyCount:6 },
    { id:42, mode:'score', target:10000, moves:22, rows:9, cols:9,
      obstacles:[{type:'ice_3',cells:[[1,1],[1,7],[7,1],[7,7]]}],
      stones:[[3,3],[3,5],[5,3],[5,5]],
      lockedCells:[[0,4],[4,0],[4,8],[8,4]],
      stars:[10000,15000,22000], candyCount:6 },
    { id:43, mode:'jelly', target:0, moves:25, rows:9, cols:9, jellyCount:25,
      obstacles:[{type:'ice_2',cells:[[0,2],[0,6],[8,2],[8,6]]},{type:'ice_3',cells:[[4,4]]}],
      stones:[[2,4],[6,4]],
      stars:[1,2,3], candyCount:6 },
    { id:44, mode:'ingredient', target:0, moves:26, rows:9, cols:9,
      ingredients:['cherry','cherry','hazelnut','hazelnut'],
      obstacles:[{type:'ice_2',cells:[[2,2],[2,6],[6,2],[6,6]]}],
      stones:[[1,4],[7,4]],
      lockedCells:[[3,3],[3,5],[5,3],[5,5]],
      stars:[1,2,3], candyCount:6 },
    { id:45, mode:'score', target:12000, moves:20, rows:9, cols:9,
      obstacles:[{type:'ice_3',cells:[[2,2],[2,6],[6,2],[6,6]]}],
      stones:[[0,4],[4,0],[4,8],[8,4]],
      lockedCells:[[1,1],[1,7],[7,1],[7,7]],
      stars:[12000,18000,25000], candyCount:7, isBoss:true },

    // === 关卡46-50：高难度混合 ===
    { id:46, mode:'jelly', target:0, moves:24, rows:9, cols:9, jellyCount:30,
      obstacles:[{type:'ice_3',cells:[[1,1],[1,7],[7,1],[7,7]]},{type:'ice_2',cells:[[3,3],[3,5],[5,3],[5,5]]}],
      stones:[[0,4],[4,0],[4,8],[8,4]],
      lockedCells:[[2,4],[6,4]],
      stars:[1,2,3], candyCount:6 },
    { id:47, mode:'ingredient', target:0, moves:25, rows:9, cols:9,
      ingredients:['cherry','cherry','hazelnut','hazelnut','cherry'],
      obstacles:[{type:'ice_3',cells:[[2,2],[2,6],[6,2],[6,6]]}],
      stones:[[3,4],[5,4]],
      lockedCells:[[1,3],[1,5],[7,3],[7,5]],
      stars:[1,2,3], candyCount:7 },
    { id:48, mode:'score', target:15000, moves:20, rows:9, cols:9,
      obstacles:[{type:'ice_3',cells:[[0,4],[4,0],[4,8],[8,4]]},{type:'ice_2',cells:[[2,2],[2,6],[6,2],[6,6]]}],
      stones:[[1,1],[1,7],[7,1],[7,7],[4,4]],
      stars:[15000,22000,30000], candyCount:7 },
    { id:49, mode:'jelly', target:0, moves:22, rows:9, cols:9, jellyCount:35,
      obstacles:[{type:'ice_3',cells:[[1,1],[1,7],[7,1],[7,7],[4,4]]},{type:'ice_2',cells:[[3,3],[3,5],[5,3],[5,5]]}],
      stones:[[0,4],[4,0],[4,8],[8,4]],
      lockedCells:[[2,4],[6,4]],
      stars:[1,2,3], candyCount:7 },
    { id:50, mode:'score', target:20000, moves:18, rows:9, cols:9,
      obstacles:[{type:'ice_3',cells:[[2,2],[2,6],[6,2],[6,6]]},{type:'ice_2',cells:[[0,4],[4,0],[4,8],[8,4]]}],
      stones:[[1,1],[1,7],[3,4],[5,4],[7,1],[7,7]],
      lockedCells:[[3,3],[3,5],[5,3],[5,5]],
      stars:[20000,30000,45000], candyCount:7, isBoss:true }
  ],

  // ---- 关卡位置缓存 ----
  _positionCache: null,

  // ---- 辅助方法 ----

  /** 获取关卡配置 */
  getLevel: function(id) {
    if (id < 1 || id > this.levels.length) return null;
    return this.levels[id - 1];
  },

  /** 获取关卡总数 */
  getTotalLevels: function() {
    return this.levels.length;
  },

  /** 获取关卡在地图上的位置（蜿蜒路径） */
  getLevelPosition: function(id) {
    if (!this._positionCache) {
      this._positionCache = {};
    }
    if (this._positionCache[id]) {
      return this._positionCache[id];
    }

    // 地图参数
    var mapWidth = 400;
    var nodeSpacingX = 90;
    var nodeSpacingY = 80;
    var startY = 80;
    var centerX = mapWidth / 2;

    // 每行放3个节点，蜿蜒排列
    var index = id - 1;
    var row = Math.floor(index / 3);
    var col = index % 3;

    // 蜿蜒：偶数行从左到右，奇数行从右到左
    var xOffset;
    if (row % 2 === 0) {
      xOffset = (col - 1) * nodeSpacingX;
    } else {
      xOffset = (1 - col) * nodeSpacingX;
    }

    var x = centerX + xOffset;
    var y = startY + row * nodeSpacingY;

    var pos = { x: x, y: y };
    this._positionCache[id] = pos;
    return pos;
  },

  /** 获取相邻关卡之间的路径点 */
  getPathBetween: function(fromId, toId) {
    var from = this.getLevelPosition(fromId);
    var to = this.getLevelPosition(toId);

    // 生成蜿蜒路径
    var points = [];
    var steps = 10;
    for (var i = 0; i <= steps; i++) {
      var t = i / steps;
      var x = from.x + (to.x - from.x) * t;
      var y = from.y + (to.y - from.y) * t;

      // 添加一些弯曲
      var wave = Math.sin(t * Math.PI) * 15;
      if (fromId % 2 === 0) {
        x += wave;
      } else {
        x -= wave;
      }

      points.push({ x: x, y: y });
    }

    return points;
  },

  /** 获取地图总高度 */
  getMapHeight: function() {
    var lastLevel = this.levels[this.levels.length - 1];
    var pos = this.getLevelPosition(lastLevel.id);
    return pos.y + 120;
  },

  /** 将关卡配置转换为Game.startLevel可用的格式 */
  toGameConfig: function(levelId) {
    var level = this.getLevel(levelId);
    if (!level) return null;

    var config = {
      rows: level.rows,
      cols: level.cols,
      mode: level.mode,
      moves: level.moves
    };

    // 分数模式
    if (level.mode === 'score') {
      config.targetScore = level.target;
    }

    // 果冻模式
    if (level.mode === 'jelly' && level.jellyCount) {
      config.jellies = this._generateJellyPositions(level.jellyCount, level.rows, level.cols, level.obstacles, level.stones);
    }

    // 果子运送模式
    if (level.mode === 'ingredient' && level.ingredients) {
      config.ingredients = [];
      for (var i = 0; i < level.ingredients.length; i++) {
        var c = Math.floor(Math.random() * level.cols);
        config.ingredients.push({ r: 0, c: c, type: level.ingredients[i] });
      }
    }

    // 障碍物
    if (level.obstacles) {
      config.obstacles = [];
      for (var i = 0; i < level.obstacles.length; i++) {
        var ob = level.obstacles[i];
        for (var j = 0; j < ob.cells.length; j++) {
          config.obstacles.push({ r: ob.cells[j][0], c: ob.cells[j][1], type: ob.type });
        }
      }
    }

    // 石头
    if (level.stones) {
      config.stones = [];
      for (var i = 0; i < level.stones.length; i++) {
        config.stones.push({ r: level.stones[i][0], c: level.stones[i][1] });
      }
    }

    // 锁链
    if (level.lockedCells) {
      config.lockedCells = [];
      for (var i = 0; i < level.lockedCells.length; i++) {
        config.lockedCells.push({ r: level.lockedCells[i][0], c: level.lockedCells[i][1] });
      }
    }

    // 糖果颜色数量
    if (level.candyCount) {
      config.candyColors = CONFIG.CANDY_COLORS.slice(0, level.candyCount);
    }

    return config;
  },

  /** 生成随机果冻位置（避开障碍物和石头） */
  _generateJellyPositions: function(count, rows, cols, obstacles, stones) {
    var jellies = [];
    var used = {};
    var blocked = {};

    // 标记被占用的格子
    if (obstacles) {
      for (var i = 0; i < obstacles.length; i++) {
        var ob = obstacles[i];
        for (var j = 0; j < ob.cells.length; j++) {
          blocked[ob.cells[j][0] + ',' + ob.cells[j][1]] = true;
        }
      }
    }
    if (stones) {
      for (var i = 0; i < stones.length; i++) {
        blocked[stones[i][0] + ',' + stones[i][1]] = true;
      }
    }

    var maxAttempts = count * 10;
    var attempts = 0;
    while (jellies.length < count && attempts < maxAttempts) {
      attempts++;
      var r = Math.floor(Math.random() * rows);
      var c = Math.floor(Math.random() * cols);
      var key = r + ',' + c;
      if (!used[key] && !blocked[key]) {
        used[key] = true;
        jellies.push({ r: r, c: c, layers: Math.random() < 0.2 ? 2 : 1 });
      }
    }

    return jellies;
  },

  /** 获取关卡模式的中文名称 */
  getModeName: function(mode) {
    switch (mode) {
      case 'score': return '分数模式';
      case 'jelly': return '果冻模式';
      case 'ingredient': return '果子运送';
      default: return '未知';
    }
  },

  /** 获取关卡难度描述 */
  getDifficultyText: function(levelId) {
    if (levelId <= 5) return '简单';
    if (levelId <= 10) return '普通';
    if (levelId <= 20) return '中等';
    if (levelId <= 30) return '困难';
    if (levelId <= 40) return '很难';
    return '极难';
  },

  /** 获取关卡难度颜色 */
  getDifficultyColor: function(levelId) {
    if (levelId <= 5) return '#32CD32';
    if (levelId <= 10) return '#7CFC00';
    if (levelId <= 20) return '#FFD700';
    if (levelId <= 30) return '#FF8C00';
    if (levelId <= 40) return '#FF4500';
    return '#FF0000';
  }
};


// ===== ui.js =====
// ============================================================
// ui.js - 开心消消乐 UI界面管理器
// ============================================================

class UIManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.currentScreen = 'menu';
    this.prevScreen = null;
    this.buttons = [];
    this.hoveredButton = null;
    this.transition = null; // { type:'fade', alpha:0, target:null, duration:300, startTime:0 }
    this.saveData = Storage.load();

    // 地图滚动
    this.mapScrollY = 0;
    this.mapTargetScrollY = 0;
    this.mapMaxScroll = 0;

    // 商城标签页
    this.shopTab = 0; // 0=道具, 1=宝箱, 2=特惠

    // 宠物滚动
    this.petScrollX = 0;

    // 动画状态
    this.animTime = 0;
    this.titleBounce = 0;
    this.winStarsAnim = 0;
    this.winStarCount = 0;
    this.confetti = [];

    // 背景装饰
    this.bgCandies = [];
    this.bgClouds = [];
    this._initBgDecorations();

    // 弹窗
    this.popup = null; // { type, data, buttons }

    // 游戏实例引用
    this.game = null;

    // 事件回调
    this.onLevelSelect = null;
    this.onBackToMenu = null;

    // Canvas尺寸
    this.width = canvas.width;
    this.height = canvas.height;

    // 绑定事件
    this._bindEvents();
  }

  // ---- 事件绑定 ----

  _bindEvents() {
    var self = this;

    this.canvas.addEventListener('mousemove', function(e) {
      var rect = self.canvas.getBoundingClientRect();
      var x = (e.clientX - rect.left) * (self.canvas.width / rect.width);
      var y = (e.clientY - rect.top) * (self.canvas.height / rect.height);
      self.handleHover(x, y);
    });

    this.canvas.addEventListener('click', function(e) {
      var rect = self.canvas.getBoundingClientRect();
      var x = (e.clientX - rect.left) * (self.canvas.width / rect.width);
      var y = (e.clientY - rect.top) * (self.canvas.height / rect.height);
      self.handleClick(x, y);
    });

    this.canvas.addEventListener('touchstart', function(e) {
      e.preventDefault();
      var touch = e.touches[0];
      var rect = self.canvas.getBoundingClientRect();
      var x = (touch.clientX - rect.left) * (self.canvas.width / rect.width);
      var y = (touch.clientY - rect.top) * (self.canvas.height / rect.height);
      self.handleClick(x, y);
    }, { passive: false });

    // 地图滚轮
    this.canvas.addEventListener('wheel', function(e) {
      if (self.currentScreen === 'map') {
        e.preventDefault();
        self.mapTargetScrollY += e.deltaY * 0.5;
        self.mapTargetScrollY = Math.max(0, Math.min(self.mapMaxScroll, self.mapTargetScrollY));
      }
    }, { passive: false });

    // 地图触摸滚动
    var touchStartY = 0;
    this.canvas.addEventListener('touchstart', function(e) {
      if (self.currentScreen === 'map') {
        touchStartY = e.touches[0].clientY;
      }
    }, { passive: true });
    this.canvas.addEventListener('touchmove', function(e) {
      if (self.currentScreen === 'map') {
        e.preventDefault();
        var dy = touchStartY - e.touches[0].clientY;
        touchStartY = e.touches[0].clientY;
        self.mapTargetScrollY += dy;
        self.mapTargetScrollY = Math.max(0, Math.min(self.mapMaxScroll, self.mapTargetScrollY));
      }
    }, { passive: false });
  }

  // ---- 背景装饰初始化 ----

  _initBgDecorations() {
    // 飘落的糖果
    var candyColors = ['#FF4444', '#FF8C00', '#FFD700', '#32CD32', '#00CED1', '#4169E1', '#9370DB'];
    for (var i = 0; i < 15; i++) {
      this.bgCandies.push({
        x: Math.random() * 500,
        y: Math.random() * 800 - 200,
        size: 8 + Math.random() * 12,
        color: candyColors[Math.floor(Math.random() * candyColors.length)],
        speed: 0.3 + Math.random() * 0.5,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.01 + Math.random() * 0.02
      });
    }

    // 云朵
    for (var i = 0; i < 5; i++) {
      this.bgClouds.push({
        x: Math.random() * 500,
        y: 20 + Math.random() * 100,
        width: 60 + Math.random() * 80,
        speed: 0.1 + Math.random() * 0.2
      });
    }
  }

  // ---- 界面切换 ----

  setScreen(screen) {
    if (screen === this.currentScreen) return;
    this.prevScreen = this.currentScreen;
    this.transition = {
      type: 'fade',
      alpha: 0,
      target: screen,
      duration: 300,
      startTime: performance.now(),
      phase: 'out'
    };
  }

  _applyScreenChange(screen) {
    this.currentScreen = screen;
    this.buttons = [];
    this.popup = null;
    this.saveData = Storage.load();

    if (screen === 'map') {
      this.mapMaxScroll = Math.max(0, LevelMap.getMapHeight() - this.height + 100);
      // 滚动到当前关卡
      var pos = LevelMap.getLevelPosition(this.saveData.currentLevel);
      this.mapTargetScrollY = Math.max(0, pos.y - this.height / 2);
      this.mapScrollY = this.mapTargetScrollY;
    }

    if (screen === 'win') {
      this.winStarsAnim = 0;
      this.winStarCount = 0;
      this.confetti = [];
      for (var i = 0; i < 50; i++) {
        this.confetti.push({
          x: Math.random() * this.width,
          y: -Math.random() * 200,
          size: 4 + Math.random() * 6,
          color: ['#FF4444', '#FF8C00', '#FFD700', '#32CD32', '#00CED1', '#4169E1', '#9370DB', '#FF69B4'][Math.floor(Math.random() * 8)],
          speed: 1 + Math.random() * 3,
          wobble: Math.random() * Math.PI * 2,
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.1
        });
      }
    }
  }

  // ---- 事件处理 ----

  handleClick(x, y) {
    if (this.transition) return;

    // 弹窗优先
    if (this.popup) {
      this._handlePopupClick(x, y);
      return;
    }

    // 按钮检测
    for (var i = this.buttons.length - 1; i >= 0; i--) {
      var btn = this.buttons[i];
      if (this._isInButton(x, y, btn)) {
        if (btn.action) btn.action();
        // 按钮点击缩放动画
        btn._clickAnim = 1.0;
        return;
      }
    }

    // 地图关卡点击
    if (this.currentScreen === 'map') {
      this._handleMapClick(x, y);
    }
  }

  handleHover(x, y) {
    this.hoveredButton = null;
    for (var i = this.buttons.length - 1; i >= 0; i--) {
      var btn = this.buttons[i];
      if (this._isInButton(x, y, btn)) {
        this.hoveredButton = btn;
        this.canvas.style.cursor = 'pointer';
        return;
      }
    }
    this.canvas.style.cursor = 'default';
  }

  _isInButton(x, y, btn) {
    return x >= btn.x && x <= btn.x + btn.w && y >= btn.y && y <= btn.y + btn.h;
  }

  _handlePopupClick(x, y) {
    if (!this.popup || !this.popup.buttons) return;
    for (var i = 0; i < this.popup.buttons.length; i++) {
      var btn = this.popup.buttons[i];
      if (this._isInButton(x, y, btn)) {
        if (btn.action) btn.action();
        return;
      }
    }
  }

  _handleMapClick(x, y) {
    var data = this.saveData;
    for (var i = 1; i <= LevelMap.getTotalLevels(); i++) {
      if (!Storage.isLevelUnlocked(i)) continue;
      var pos = LevelMap.getLevelPosition(i);
      var screenY = pos.y - this.mapScrollY;
      var dx = x - pos.x;
      var dy = y - screenY;
      if (dx * dx + dy * dy < 30 * 30) {
        if (this.onLevelSelect) this.onLevelSelect(i);
        return;
      }
    }
  }

  // ---- 渲染主循环 ----

  render(timestamp) {
    this.animTime = timestamp || performance.now();
    var ctx = this.ctx;
    var w = this.width;
    var h = this.height;

    // 处理过渡动画
    if (this.transition) {
      var elapsed = this.animTime - this.transition.startTime;
      var progress = Math.min(1, elapsed / this.transition.duration);

      if (this.transition.phase === 'out') {
        this.transition.alpha = progress;
        if (progress >= 1) {
          this._applyScreenChange(this.transition.target);
          this.transition.phase = 'in';
          this.transition.startTime = this.animTime;
        }
      } else {
        this.transition.alpha = 1 - progress;
        if (progress >= 1) {
          this.transition = null;
        }
      }
    }

    // 清空
    ctx.clearRect(0, 0, w, h);

    // 绘制当前界面
    switch (this.currentScreen) {
      case 'menu': this.drawMenu(ctx, w, h); break;
      case 'map': this.drawMap(ctx, w, h); break;
      case 'game': this.drawGame(ctx, w, h); break;
      case 'shop': this.drawShop(ctx, w, h); break;
      case 'daily': this.drawDaily(ctx, w, h); break;
      case 'pause': this.drawPause(ctx, w, h); break;
      case 'win': this.drawWin(ctx, w, h); break;
      case 'lose': this.drawLose(ctx, w, h); break;
      case 'settings': this.drawSettings(ctx, w, h); break;
      case 'pet': this.drawPet(ctx, w, h); break;
    }

    // 绘制弹窗
    if (this.popup) {
      this._drawPopup(ctx, w, h);
    }

    // 过渡遮罩
    if (this.transition) {
      ctx.fillStyle = 'rgba(0,0,0,' + this.transition.alpha + ')';
      ctx.fillRect(0, 0, w, h);
    }
  }

  // ============================================================
  // 绘制工具方法
  // ============================================================

  /** 绘制圆角矩形（使用arcTo） */
  _roundRect(ctx, x, y, w, h, r) {
    r = Math.max(0, Math.min(r, w / 2, h / 2));
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
  }

  /** 绘制按钮 */
  _drawButton(ctx, btn, isHovered) {
    var scale = 1;
    if (btn._clickAnim && btn._clickAnim > 0) {
      scale = 1 - btn._clickAnim * 0.1;
      btn._clickAnim -= 0.1;
      if (btn._clickAnim < 0) btn._clickAnim = 0;
    }

    ctx.save();
    var cx = btn.x + btn.w / 2;
    var cy = btn.y + btn.h / 2;
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);
    ctx.translate(-cx, -cy);

    // 阴影
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 3;

    // 背景
    var bgColor = btn.color || '#4CAF50';
    if (isHovered) {
      bgColor = this._lightenColor(bgColor, 30);
    }

    this._roundRect(ctx, btn.x, btn.y, btn.w, btn.h, btn.radius || 12);
    ctx.fillStyle = bgColor;
    ctx.fill();

    // 高光
    ctx.shadowColor = 'transparent';
    var hlGrad = ctx.createLinearGradient(btn.x, btn.y, btn.x, btn.y + btn.h);
    hlGrad.addColorStop(0, 'rgba(255,255,255,0.25)');
    hlGrad.addColorStop(0.5, 'rgba(255,255,255,0.05)');
    hlGrad.addColorStop(1, 'rgba(0,0,0,0.1)');
    this._roundRect(ctx, btn.x, btn.y, btn.w, btn.h, btn.radius || 12);
    ctx.fillStyle = hlGrad;
    ctx.fill();

    // 边框
    this._roundRect(ctx, btn.x, btn.y, btn.w, btn.h, btn.radius || 12);
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // 文字
    ctx.fillStyle = btn.textColor || '#FFFFFF';
    ctx.font = (btn.bold ? 'bold ' : '') + (btn.fontSize || 16) + 'px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(btn.text, cx, cy + 1);

    ctx.restore();
  }

  /** 绘制所有按钮 */
  _drawButtons(ctx) {
    for (var i = 0; i < this.buttons.length; i++) {
      var btn = this.buttons[i];
      var isHovered = (this.hoveredButton === btn);
      this._drawButton(ctx, btn, isHovered);
    }
  }

  /** 添加按钮 */
  _addButton(opt) {
    var btn = {
      x: opt.x, y: opt.y, w: opt.w, h: opt.h,
      text: opt.text, color: opt.color, textColor: opt.textColor,
      fontSize: opt.fontSize, bold: opt.bold || false,
      radius: opt.radius, action: opt.action,
      _clickAnim: 0
    };
    this.buttons.push(btn);
    return btn;
  }

  /** 颜色变亮 */
  _lightenColor(hex, amount) {
    var r = parseInt(hex.slice(1, 3), 16);
    var g = parseInt(hex.slice(3, 5), 16);
    var b = parseInt(hex.slice(5, 7), 16);
    r = Math.min(255, r + amount);
    g = Math.min(255, g + amount);
    b = Math.min(255, b + amount);
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  /** 绘制背景装饰（糖果+云朵） */
  _drawBgDecorations(ctx, w, h) {
    var t = this.animTime;

    // 云朵
    ctx.save();
    for (var i = 0; i < this.bgClouds.length; i++) {
      var cloud = this.bgClouds[i];
      cloud.x += cloud.speed;
      if (cloud.x > w + cloud.width) cloud.x = -cloud.width;

      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.beginPath();
      ctx.ellipse(cloud.x, cloud.y, cloud.width * 0.5, 18, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cloud.x - cloud.width * 0.2, cloud.y + 5, cloud.width * 0.3, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cloud.x + cloud.width * 0.2, cloud.y + 3, cloud.width * 0.35, 16, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // 飘落的糖果
    ctx.save();
    for (var i = 0; i < this.bgCandies.length; i++) {
      var candy = this.bgCandies[i];
      candy.y += candy.speed;
      candy.wobble += candy.wobbleSpeed;
      var wx = candy.x + Math.sin(candy.wobble) * 20;

      if (candy.y > h + 20) {
        candy.y = -20;
        candy.x = Math.random() * w;
      }

      ctx.globalAlpha = 0.4;
      ctx.fillStyle = candy.color;
      ctx.beginPath();
      ctx.arc(wx, candy.y, candy.size / 2, 0, Math.PI * 2);
      ctx.fill();

      // 高光
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.beginPath();
      ctx.arc(wx - candy.size * 0.15, candy.y - candy.size * 0.15, candy.size * 0.15, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  /** 绘制天空+草地背景 */
  _drawSkyGrassBg(ctx, w, h) {
    // 天空渐变
    var skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.6);
    skyGrad.addColorStop(0, '#87CEEB');
    skyGrad.addColorStop(0.5, '#B0E0FF');
    skyGrad.addColorStop(1, '#E0F4FF');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);

    // 草地
    var grassGrad = ctx.createLinearGradient(0, h * 0.55, 0, h);
    grassGrad.addColorStop(0, '#7CCD7C');
    grassGrad.addColorStop(0.3, '#5CB85C');
    grassGrad.addColorStop(1, '#4A9E4A');
    ctx.fillStyle = grassGrad;
    ctx.fillRect(0, h * 0.55, w, h * 0.45);

    // 草地波浪线
    ctx.strokeStyle = '#6BBF6B';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (var x = 0; x <= w; x += 5) {
      var y = h * 0.55 + Math.sin(x * 0.03 + this.animTime * 0.001) * 3;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  /** 绘制顶部状态栏（金币+体力） */
  _drawTopBar(ctx, w, showBack) {
    var data = this.saveData;

    // 顶部栏背景
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    this._roundRect(ctx, 5, 5, w - 10, 40, 10);
    ctx.fill();

    // 返回按钮
    if (showBack) {
      this._addButton({
        x: 10, y: 8, w: 60, h: 34,
        text: '\u2190 \u8FD4\u56DE', color: 'rgba(255,255,255,0.2)',
        fontSize: 13, radius: 8,
        action: function() { this.setScreen('menu'); }.bind(this)
      });
    }

    // 金币
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(showBack ? 120 : 30, 25, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#DAA520';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('$', showBack ? 120 : 30, 26);
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(String(data.coins), showBack ? 138 : 48, 26);

    // 体力（心形）
    var heartX = w - 120;
    var lives = data.lives || 0;
    var maxLives = data.maxLives || 5;
    for (var i = 0; i < maxLives; i++) {
      var hx = heartX + i * 22;
      ctx.fillStyle = i < lives ? '#FF4444' : 'rgba(255,255,255,0.2)';
      this._drawHeart(ctx, hx, 25, 8);
    }
  }

  /** 绘制心形 */
  _drawHeart(ctx, cx, cy, size) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cx, cy + size * 0.4);
    ctx.bezierCurveTo(cx - size, cy - size * 0.3, cx - size * 0.5, cy - size, cx, cy - size * 0.4);
    ctx.bezierCurveTo(cx + size * 0.5, cy - size, cx + size, cy - size * 0.3, cx, cy + size * 0.4);
    ctx.fill();
    ctx.restore();
  }

  /** 绘制星星 */
  _drawStar(ctx, cx, cy, outerR, innerR, points, color) {
    ctx.save();
    ctx.fillStyle = color || '#FFD700';
    ctx.beginPath();
    for (var i = 0; i < points * 2; i++) {
      var r = (i % 2 === 0) ? outerR : innerR;
      var angle = (Math.PI / points) * i - Math.PI / 2;
      var px = cx + r * Math.cos(angle);
      var py = cy + r * Math.sin(angle);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // ============================================================
  // 主菜单界面
  // ============================================================

  drawMenu(ctx, w, h) {
    this.buttons = [];

    // 背景
    this._drawSkyGrassBg(ctx, w, h);
    this._drawBgDecorations(ctx, w, h);

    // 标题弹跳动画
    var bounce = Math.sin(this.animTime * 0.003) * 5;
    var titleY = 60 + bounce;

    // 标题阴影
    ctx.save();
    ctx.font = 'bold 38px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillText('\u5F00\u5FC3\u6D88\u6D88\u4E50', w / 2 + 2, titleY + 2);

    // 标题金色渐变
    var titleGrad = ctx.createLinearGradient(w / 2 - 100, titleY - 20, w / 2 + 100, titleY + 20);
    titleGrad.addColorStop(0, '#FFD700');
    titleGrad.addColorStop(0.3, '#FFF8DC');
    titleGrad.addColorStop(0.5, '#FFD700');
    titleGrad.addColorStop(0.7, '#FFF8DC');
    titleGrad.addColorStop(1, '#FFD700');
    ctx.fillStyle = titleGrad;
    ctx.fillText('\u5F00\u5FC3\u6D88\u6D88\u4E50', w / 2, titleY);

    // 标题描边
    ctx.strokeStyle = '#DAA520';
    ctx.lineWidth = 1.5;
    ctx.strokeText('\u5F00\u5FC3\u6D88\u6D88\u4E50', w / 2, titleY);
    ctx.restore();

    // 吉祥物（小狐狸头像）
    var foxPet = Pets.getPetById('fox');
    if (foxPet) {
      ctx.save();
      var mascotY = titleY + 55;
      // 圆形背景
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.beginPath();
      ctx.arc(w / 2, mascotY, 42, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      ctx.lineWidth = 2;
      ctx.stroke();
      foxPet.draw(ctx, w / 2 - 42, mascotY - 42, 84);
      ctx.restore();
    }

    // 按钮布局
    var btnW = 200;
    var btnH = 48;
    var btnX = (w - btnW) / 2;
    var startBtnY = 210;

    this._addButton({
      x: btnX, y: startBtnY, w: btnW, h: btnH,
      text: '\u25B6 \u5F00\u59CB\u6E38\u620F', color: '#4CAF50',
      fontSize: 18, bold: true, radius: 14,
      action: function() { this.setScreen('map'); }.bind(this)
    });

    this._addButton({
      x: btnX, y: startBtnY + 58, w: btnW, h: btnH,
      text: '\u{1F5FA} \u5173\u5361\u5730\u56FE', color: '#FF8C00',
      fontSize: 16, bold: true, radius: 14,
      action: function() { this.setScreen('map'); }.bind(this)
    });

    this._addButton({
      x: btnX, y: startBtnY + 116, w: btnW, h: btnH,
      text: '\u{1F6D2} \u5546\u57CE', color: '#4169E1',
      fontSize: 16, bold: true, radius: 14,
      action: function() { this.setScreen('shop'); }.bind(this)
    });

    this._addButton({
      x: btnX, y: startBtnY + 174, w: btnW, h: btnH,
      text: '\u{1F381} \u6BCF\u65E5\u5956\u52B1', color: '#9370DB',
      fontSize: 16, bold: true, radius: 14,
      action: function() { this.setScreen('daily'); }.bind(this)
    });

    this._addButton({
      x: btnX, y: startBtnY + 232, w: btnW, h: 40,
      text: '\u2699 \u8BBE\u7F6E', color: '#888888',
      fontSize: 14, radius: 10,
      action: function() { this.setScreen('settings'); }.bind(this)
    });

    // 绘制按钮
    this._drawButtons(ctx);

    // 底部金币和体力
    this._drawTopBar(ctx, w, false);
  }

  // ============================================================
  // 关卡地图界面
  // ============================================================

  drawMap(ctx, w, h) {
    this.buttons = [];

    // 背景
    this._drawSkyGrassBg(ctx, w, h);

    // 平滑滚动
    this.mapScrollY += (this.mapTargetScrollY - this.mapScrollY) * 0.15;

    // 绘制路径
    this._drawMapPaths(ctx, w, h);

    // 绘制关卡节点
    this._drawMapNodes(ctx, w, h);

    // 绘制按钮
    this._drawButtons(ctx);

    // 顶部栏
    this._drawTopBar(ctx, w, true);
  }

  _drawMapPaths(ctx, w, h) {
    var data = this.saveData;
    ctx.save();

    for (var i = 1; i < LevelMap.getTotalLevels(); i++) {
      var from = LevelMap.getLevelPosition(i);
      var to = LevelMap.getLevelPosition(i + 1);
      var fromY = from.y - this.mapScrollY;
      var toY = to.y - this.mapScrollY;

      // 跳过不可见的
      if (fromY < -50 && toY < -50) continue;
      if (fromY > h + 50 && toY > h + 50) continue;

      var unlocked = Storage.isLevelUnlocked(i) && Storage.isLevelUnlocked(i + 1);
      ctx.strokeStyle = unlocked ? '#FFD700' : 'rgba(200,200,200,0.4)';
      ctx.lineWidth = unlocked ? 4 : 2;
      ctx.setLineDash(unlocked ? [] : [5, 5]);

      // 蜿蜒路径
      var points = LevelMap.getPathBetween(i, i + 1);
      ctx.beginPath();
      for (var j = 0; j < points.length; j++) {
        var px = points[j].x;
        var py = points[j].y - this.mapScrollY;
        if (j === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }

    ctx.setLineDash([]);
    ctx.restore();
  }

  _drawMapNodes(ctx, w, h) {
    var data = this.saveData;
    var t = this.animTime;

    for (var i = 1; i <= LevelMap.getTotalLevels(); i++) {
      var pos = LevelMap.getLevelPosition(i);
      var screenY = pos.y - this.mapScrollY;

      // 跳过不可见
      if (screenY < -60 || screenY > h + 60) continue;

      var level = LevelMap.getLevel(i);
      var isUnlocked = Storage.isLevelUnlocked(i);
      var stars = Storage.getLevelStars(i);
      var isCurrent = (i === data.currentLevel);
      var isBoss = level.isBoss;

      var nodeR = isBoss ? 28 : 22;

      ctx.save();

      // 当前关卡发光脉冲
      if (isCurrent && isUnlocked) {
        var pulse = 0.5 + Math.sin(t * 0.005) * 0.3;
        ctx.fillStyle = 'rgba(255,215,0,' + pulse + ')';
        ctx.beginPath();
        ctx.arc(pos.x, screenY, nodeR + 10, 0, Math.PI * 2);
        ctx.fill();
      }

      // 节点背景
      if (isUnlocked) {
        var nodeGrad = ctx.createRadialGradient(pos.x - 5, screenY - 5, 2, pos.x, screenY, nodeR);
        if (isBoss) {
          nodeGrad.addColorStop(0, '#FF6B6B');
          nodeGrad.addColorStop(1, '#CC0000');
        } else if (isCurrent) {
          nodeGrad.addColorStop(0, '#FFE066');
          nodeGrad.addColorStop(1, '#FFB300');
        } else {
          nodeGrad.addColorStop(0, '#90EE90');
          nodeGrad.addColorStop(1, '#32CD32');
        }
        ctx.fillStyle = nodeGrad;
      } else {
        ctx.fillStyle = '#999';
      }

      ctx.shadowColor = 'rgba(0,0,0,0.3)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetY = 2;
      ctx.beginPath();
      ctx.arc(pos.x, screenY, nodeR, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowColor = 'transparent';

      // 边框
      ctx.strokeStyle = isUnlocked ? 'rgba(255,255,255,0.5)' : 'rgba(150,150,150,0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(pos.x, screenY, nodeR, 0, Math.PI * 2);
      ctx.stroke();

      // 关卡号
      ctx.fillStyle = isUnlocked ? '#FFF' : '#666';
      ctx.font = 'bold ' + (isBoss ? 16 : 14) + 'px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      if (!isUnlocked) {
        // 锁图标
        ctx.font = '16px Arial';
        ctx.fillText('\u{1F512}', pos.x, screenY);
      } else {
        ctx.fillText(String(i), pos.x, screenY);
      }

      // 星级
      if (isUnlocked && stars > 0) {
        var starY = screenY + nodeR + 10;
        for (var s = 0; s < 3; s++) {
          var sx = pos.x + (s - 1) * 14;
          var filled = s < stars;
          this._drawStar(ctx, sx, starY, 6, 3, 5, filled ? '#FFD700' : 'rgba(255,255,255,0.3)');
        }
      }

      // Boss标记
      if (isBoss && isUnlocked) {
        ctx.font = '10px Arial';
        ctx.fillStyle = '#FFF';
        ctx.fillText('BOSS', pos.x, screenY - nodeR - 8);
      }

      // 分数显示
      if (isUnlocked && stars > 0) {
        var score = Storage.getLevelScore(i);
        ctx.font = '10px Arial';
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.fillText(String(score), pos.x, screenY + nodeR + 24);
      }

      ctx.restore();
    }
  }

  // ============================================================
  // 游戏界面
  // ============================================================

  drawGame(ctx, w, h) {
    // 游戏界面委托给Game类渲染
    if (this.game) {
      this.game.render();
    }
  }

  // ============================================================
  // 商城界面
  // ============================================================

  drawShop(ctx, w, h) {
    this.buttons = [];

    // 背景
    var bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, '#1a237e');
    bgGrad.addColorStop(1, '#283593');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // 标题
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('\u5546\u57CE', w / 2, 35);

    // 标签页
    var tabs = ['\u9053\u5177', '\u5B9D\u7BB1', '\u7279\u60E0'];
    var tabW = 100;
    var tabH = 32;
    var tabStartX = (w - tabs.length * tabW) / 2;
    var tabY = 55;

    for (var i = 0; i < tabs.length; i++) {
      var tx = tabStartX + i * tabW;
      var isActive = (this.shopTab === i);
      (function(idx) {
        this._addButton({
          x: tx + 2, y: tabY, w: tabW - 4, h: tabH,
          text: tabs[idx], color: isActive ? '#FF8C00' : 'rgba(255,255,255,0.15)',
          fontSize: 14, bold: isActive, radius: 8,
          action: function() { this.shopTab = idx; }.bind(this)
        });
      }).call(this, i);
    }

    // 内容区域
    var contentY = tabY + tabH + 10;
    var contentH = h - contentY - 20;

    switch (this.shopTab) {
      case 0: this._drawShopItems(ctx, w, contentY, contentH); break;
      case 1: this._drawShopChests(ctx, w, contentY, contentH); break;
      case 2: this._drawShopSpecials(ctx, w, contentY, contentH); break;
    }

    // 绘制按钮
    this._drawButtons(ctx);

    // 顶部栏
    this._drawTopBar(ctx, w, true);
  }

  _drawShopItems(ctx, w, startY, maxH) {
    var data = this.saveData;
    var items = ShopData.items;
    var bundles = ShopData.bundles;
    var allItems = items.concat(bundles);
    var cardW = w - 30;
    var cardH = 70;
    var gap = 8;
    var y = startY;

    for (var i = 0; i < allItems.length; i++) {
      if (y + cardH > startY + maxH) break;
      var item = allItems[i];
      var cx = 15;

      // 卡片背景
      this._roundRect(ctx, cx, y, cardW, cardH, 10);
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.lineWidth = 1;
      this._roundRect(ctx, cx, y, cardW, cardH, 10);
      ctx.stroke();

      // 图标
      ctx.font = '28px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(item.icon, cx + 30, y + cardH / 2);

      // 名称
      ctx.fillStyle = '#FFF';
      ctx.font = 'bold 15px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(item.name, cx + 55, y + 20);

      // 描述
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.font = '11px Arial';
      ctx.fillText(item.desc || '', cx + 55, y + 38);

      // 拥有数量
      if (item.id && data.items) {
        var count = data.items[item.id] || 0;
        ctx.fillStyle = '#FFD700';
        ctx.font = '11px Arial';
        ctx.fillText('\u62E5\u6709: ' + count, cx + 55, y + 55);
      }

      // 折扣标签
      if (item.discount) {
        ctx.fillStyle = '#FF4444';
        this._roundRect(ctx, cx + cardW - 120, y + 5, 40, 18, 4);
        ctx.fill();
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(item.discount, cx + cardW - 100, y + 15);
      }

      // 购买按钮
      (function(itm, yPos) {
        this._addButton({
          x: cx + cardW - 70, y: yPos + 18, w: 60, h: 34,
          text: itm.price + '\u{1F4B0}', color: '#FF8C00',
          fontSize: 12, bold: true, radius: 8,
          action: function() {
            var result;
            if (itm.items) {
              result = ShopData.purchaseBundle(itm.id);
            } else {
              result = ShopData.purchaseItem(itm.id, 1);
            }
            if (result && result.success) {
              this.saveData = Storage.load();
            } else {
              this.popup = {
                title: '\u91D1\u5E01\u4E0D\u8DB3',
                message: '\u91D1\u5E01\u4E0D\u591F\u5566\uFF01\u5F53\u524D: ' + this.saveData.coins,
                buttons: [{
                  text: '\u786E\u5B9A', x: w / 2 - 40, y: 0, w: 80, h: 36,
                  color: '#4CAF50', action: function() { this.popup = null; }.bind(this)
                }]
              };
            }
          }.bind(this)
        });
      }).call(this, item, y);

      y += cardH + gap;
    }
  }

  _drawShopChests(ctx, w, startY, maxH) {
    var chests = ShopData.chests;
    var cardW = w - 30;
    var cardH = 90;
    var gap = 10;
    var y = startY;

    for (var i = 0; i < chests.length; i++) {
      if (y + cardH > startY + maxH) break;
      var chest = chests[i];
      var cx = 15;

      // 卡片背景
      this._roundRect(ctx, cx, y, cardW, cardH, 12);
      var chestGrad = ctx.createLinearGradient(cx, y, cx + cardW, y + cardH);
      chestGrad.addColorStop(0, 'rgba(255,255,255,0.12)');
      chestGrad.addColorStop(1, 'rgba(255,255,255,0.05)');
      ctx.fillStyle = chestGrad;
      ctx.fill();
      ctx.strokeStyle = chest.color;
      ctx.lineWidth = 2;
      this._roundRect(ctx, cx, y, cardW, cardH, 12);
      ctx.stroke();

      // 图标
      ctx.font = '36px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(chest.icon, cx + 40, y + cardH / 2);

      // 名称
      ctx.fillStyle = chest.color;
      ctx.font = 'bold 17px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(chest.name, cx + 70, y + 22);

      // 描述
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.font = '12px Arial';
      ctx.fillText(chest.desc, cx + 70, y + 42);

      // 价格
      ctx.fillStyle = '#FFD700';
      ctx.font = 'bold 14px Arial';
      ctx.fillText(chest.price + ' \u{1F4B0}', cx + 70, y + 65);

      // 购买按钮
      (function(ch, yPos) {
        this._addButton({
          x: cx + cardW - 80, y: yPos + 28, w: 65, h: 36,
          text: '\u8D2D\u4E70', color: ch.color,
          fontSize: 14, bold: true, radius: 8,
          action: function() {
            var result = ShopData.purchaseChest(ch.id);
            if (result && result.success) {
              this.saveData = Storage.load();
              this.popup = {
                title: '\u{1F389} \u5F00\u542F\u5B9D\u7BB1',
                message: '\u83B7\u5F97\u968F\u673A\u9053\u5177\uFF01',
                buttons: [{
                  text: '\u597D\u7684', x: w / 2 - 40, y: 0, w: 80, h: 36,
                  color: '#4CAF50', action: function() { this.popup = null; }.bind(this)
                }]
              };
            } else {
              this.popup = {
                title: '\u91D1\u5E01\u4E0D\u8DB3',
                message: '\u91D1\u5E01\u4E0D\u591F\u5566\uFF01',
                buttons: [{
                  text: '\u786E\u5B9A', x: w / 2 - 40, y: 0, w: 80, h: 36,
                  color: '#4CAF50', action: function() { this.popup = null; }.bind(this)
                }]
              };
            }
          }.bind(this)
        });
      }).call(this, chest, y);

      y += cardH + gap;
    }
  }

  _drawShopSpecials(ctx, w, startY, maxH) {
    var specials = ShopData.getAvailableSpecials();
    var cardW = w - 30;
    var cardH = 85;
    var gap = 10;
    var y = startY;

    if (specials.length === 0) {
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('\u6682\u65E0\u53EF\u7528\u7279\u60E0', w / 2, startY + 50);
      return;
    }

    for (var i = 0; i < specials.length; i++) {
      if (y + cardH > startY + maxH) break;
      var sp = specials[i];
      var cx = 15;

      // 卡片
      this._roundRect(ctx, cx, y, cardW, cardH, 12);
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      ctx.fill();
      ctx.strokeStyle = sp.color;
      ctx.lineWidth = 2;
      this._roundRect(ctx, cx, y, cardW, cardH, 12);
      ctx.stroke();

      // 限时标签
      if (sp.limited) {
        ctx.fillStyle = '#FF4444';
        this._roundRect(ctx, cx + 5, y + 5, 36, 18, 4);
        ctx.fill();
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('\u9650\u65F6', cx + 23, y + 15);
      }

      // 图标
      ctx.font = '32px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(sp.icon, cx + 40, y + cardH / 2);

      // 名称
      ctx.fillStyle = sp.color;
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(sp.name, cx + 68, y + 22);

      // 描述
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.font = '11px Arial';
      ctx.fillText(sp.desc, cx + 68, y + 42);

      // 折扣
      if (sp.originalPrice > 0) {
        ctx.fillStyle = '#FF4444';
        ctx.font = 'bold 12px Arial';
        ctx.fillText(sp.discount + '!', cx + 68, y + 62);
      }

      // 购买按钮
      (function(spec, yPos) {
        var btnText = spec.price === 0 ? '\u514D\u8D39' : (spec.price + '\u{1F4B0}');
        var btnColor = spec.price === 0 ? '#32CD32' : spec.color;
        this._addButton({
          x: cx + cardW - 80, y: yPos + 25, w: 65, h: 36,
          text: btnText, color: btnColor,
          fontSize: 13, bold: true, radius: 8,
          action: function() {
            var result = ShopData.purchaseSpecial(spec.id);
            if (result && result.success) {
              this.saveData = Storage.load();
            } else {
              this.popup = {
                title: '\u91D1\u5E01\u4E0D\u8DB3',
                message: '\u91D1\u5E01\u4E0D\u591F\u5566\uFF01',
                buttons: [{
                  text: '\u786E\u5B9A', x: w / 2 - 40, y: 0, w: 80, h: 36,
                  color: '#4CAF50', action: function() { this.popup = null; }.bind(this)
                }]
              };
            }
          }.bind(this)
        });
      }).call(this, sp, y);

      y += cardH + gap;
    }
  }

  // ============================================================
  // 每日奖励界面
  // ============================================================

  drawDaily(ctx, w, h) {
    this.buttons = [];

    // 背景
    var bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, '#4A148C');
    bgGrad.addColorStop(1, '#6A1B9A');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // 标题
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('\u{1F381} \u6BCF\u65E5\u5956\u52B1', w / 2, 35);

    // 7天日历卡片
    var data = this.saveData;
    var rewards = ShopData.dailyRewards;
    var currentDay = data.dailyRewardDay || 0;
    var canClaim = Storage.canClaimDailyReward();
    var nextDay = canClaim ? ((currentDay % 7) + 1) : currentDay;

    var cardW = 48;
    var cardH = 80;
    var gap = 8;
    var totalW = rewards.length * cardW + (rewards.length - 1) * gap;
    var startX = (w - totalW) / 2;
    var cardY = 70;

    for (var i = 0; i < rewards.length; i++) {
      var reward = rewards[i];
      var cx = startX + i * (cardW + gap);
      var dayNum = reward.day;
      var isClaimed = dayNum < nextDay || (!canClaim && dayNum === currentDay);
      var isToday = canClaim && dayNum === nextDay;
      var isFuture = dayNum > nextDay;

      // 卡片背景
      this._roundRect(ctx, cx, cardY, cardW, cardH, 8);
      if (isToday) {
        var todayGrad = ctx.createLinearGradient(cx, cardY, cx, cardY + cardH);
        todayGrad.addColorStop(0, '#FFD700');
        todayGrad.addColorStop(1, '#FFA000');
        ctx.fillStyle = todayGrad;
      } else if (isClaimed) {
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
      } else {
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
      }
      ctx.fill();

      // 金色边框（今天）
      if (isToday) {
        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 2;
        this._roundRect(ctx, cx, cardY, cardW, cardH, 8);
        ctx.stroke();
      }

      // Day标签
      ctx.fillStyle = isToday ? '#333' : 'rgba(255,255,255,0.5)';
      ctx.font = 'bold 11px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Day' + dayNum, cx + cardW / 2, cardY + 15);

      // 奖励图标
      ctx.font = '22px Arial';
      ctx.textBaseline = 'middle';
      ctx.fillText(reward.icon, cx + cardW / 2, cardY + 40);

      // 奖励名称
      ctx.fillStyle = isToday ? '#333' : 'rgba(255,255,255,0.7)';
      ctx.font = '9px Arial';
      ctx.fillText(reward.name, cx + cardW / 2, cardY + 62);

      // 状态
      if (isClaimed) {
        ctx.fillStyle = '#32CD32';
        ctx.font = 'bold 16px Arial';
        ctx.fillText('\u2713', cx + cardW / 2, cardY + cardH - 5);
      } else if (isFuture) {
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.font = '14px Arial';
        ctx.fillText('\u{1F512}', cx + cardW / 2, cardY + cardH - 5);
      }
    }

    // 连续登录提示
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = '13px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('\u8FDE\u7EED\u767B\u5F55: ' + (data.consecutiveDays || 0) + ' \u5929', w / 2, cardY + cardH + 25);

    // 领取按钮
    if (canClaim) {
      this._addButton({
        x: (w - 160) / 2, y: cardY + cardH + 45, w: 160, h: 48,
        text: '\u{1F381} \u9886\u53D6\u5956\u52B1', color: '#FF8C00',
        fontSize: 18, bold: true, radius: 14,
        action: function() {
          var result = Storage.claimDailyReward();
          if (result) {
            this.saveData = Storage.load();
            this.popup = {
              title: '\u{1F389} \u9886\u53D6\u6210\u529F\uFF01',
              message: '\u7B2C' + result.day + '\u5929\u5956\u52B1\u5DF2\u9886\u53D6',
              buttons: [{
                text: '\u597D\u7684', x: w / 2 - 40, y: 0, w: 80, h: 36,
                color: '#4CAF50', action: function() { this.popup = null; }.bind(this)
              }]
            };
          }
        }.bind(this)
      });
    } else {
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('\u4ECA\u65E5\u5DF2\u9886\u53D6\uFF0C\u660E\u5929\u518D\u6765\uFF01', w / 2, cardY + cardH + 65);
    }

    // 绘制按钮
    this._drawButtons(ctx);

    // 顶部栏
    this._drawTopBar(ctx, w, true);
  }

  // ============================================================
  // 暂停界面
  // ============================================================

  drawPause(ctx, w, h) {
    // 先绘制游戏界面
    if (this.game) {
      this.game.render();
    }

    this.buttons = [];

    // 半透明遮罩
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, 0, w, h);

    // 弹窗
    var popupW = 260;
    var popupH = 260;
    var popupX = (w - popupW) / 2;
    var popupY = (h - popupH) / 2;

    // 弹窗背景
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 20;
    this._roundRect(ctx, popupX, popupY, popupW, popupH, 16);
    ctx.fillStyle = '#2C2C54';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 2;
    this._roundRect(ctx, popupX, popupY, popupW, popupH, 16);
    ctx.stroke();
    ctx.restore();

    // 标题
    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 22px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('\u6E38\u620F\u6682\u505C', w / 2, popupY + 35);

    // 按钮
    var btnW = 200;
    var btnH = 40;
    var btnX = (w - btnW) / 2;
    var btnStartY = popupY + 65;
    var btnGap = 48;

    this._addButton({
      x: btnX, y: btnStartY, w: btnW, h: btnH,
      text: '\u25B6 \u7EE7\u7EED\u6E38\u620F', color: '#4CAF50',
      fontSize: 15, bold: true, radius: 10,
      action: function() {
        if (this.game) this.game.resume();
        this.setScreen('game');
      }.bind(this)
    });

    var soundText = '\u{1F50A} \u97F3\u6548 ' + (this.saveData.soundEnabled ? '\u5F00' : '\u5173');
    this._addButton({
      x: btnX, y: btnStartY + btnGap, w: btnW, h: btnH,
      text: soundText, color: '#4169E1',
      fontSize: 15, radius: 10,
      action: function() {
        this.saveData.soundEnabled = !this.saveData.soundEnabled;
        Storage.save(this.saveData);
      }.bind(this)
    });

    this._addButton({
      x: btnX, y: btnStartY + btnGap * 2, w: btnW, h: btnH,
      text: '\u{1F504} \u91CD\u65B0\u5F00\u59CB', color: '#FF8C00',
      fontSize: 15, radius: 10,
      action: function() {
        if (this.game && this.game.levelConfig) {
          this.game.startLevel(this.game.level, this.game.levelConfig);
          this.setScreen('game');
        }
      }.bind(this)
    });

    this._addButton({
      x: btnX, y: btnStartY + btnGap * 3, w: btnW, h: btnH,
      text: '\u{1F3E0} \u9000\u51FA\u6E38\u620F', color: '#888',
      fontSize: 15, radius: 10,
      action: function() {
        if (this.game) this.game.exit();
        this.setScreen('map');
      }.bind(this)
    });

    this._drawButtons(ctx);
  }

  // ============================================================
  // 胜利界面
  // ============================================================

  drawWin(ctx, w, h) {
    this.buttons = [];

    // 先绘制游戏界面
    if (this.game) {
      this.game.render();
    }

    // 半透明遮罩
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, 0, w, h);

    // 彩色纸屑
    this._drawConfetti(ctx, w, h);

    // 星星动画
    this.winStarsAnim += 0.02;
    if (this.winStarsAnim > 0.33 && this.winStarCount < 1) this.winStarCount = 1;
    if (this.winStarsAnim > 0.66 && this.winStarCount < 2) this.winStarCount = 2;
    if (this.winStarsAnim >= 1.0 && this.winStarCount < 3) this.winStarCount = 3;

    // 标题弹跳
    var bounce = Math.sin(this.animTime * 0.005) * 5;
    ctx.save();
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // 描边
    ctx.strokeStyle = 'rgba(0,0,0,0.8)';
    ctx.lineWidth = 4;
    ctx.strokeText('\u5173\u5361\u901A\u8FC7\uFF01', w / 2, h * 0.25 + bounce);

    // 金色渐变
    var titleGrad = ctx.createLinearGradient(w / 2 - 80, h * 0.25, w / 2 + 80, h * 0.25);
    titleGrad.addColorStop(0, '#FFD700');
    titleGrad.addColorStop(0.5, '#FFF8DC');
    titleGrad.addColorStop(1, '#FFD700');
    ctx.fillStyle = titleGrad;
    ctx.fillText('\u5173\u5361\u901A\u8FC7\uFF01', w / 2, h * 0.25 + bounce);
    ctx.restore();

    // 星级评价
    var starY = h * 0.38;
    for (var i = 0; i < 3; i++) {
      var sx = w / 2 + (i - 1) * 50;
      var visible = i < this.winStarCount;
      if (visible) {
        var starScale = 1 + Math.sin(this.animTime * 0.008 + i) * 0.1;
        ctx.save();
        ctx.translate(sx, starY);
        ctx.scale(starScale, starScale);
        this._drawStar(ctx, 0, 0, 22, 10, 5, '#FFD700');
        // 高光
        this._drawStar(ctx, -3, -4, 8, 4, 5, 'rgba(255,255,255,0.4)');
        ctx.restore();
      } else {
        this._drawStar(ctx, sx, starY, 22, 10, 5, 'rgba(255,255,255,0.2)');
      }
    }

    // 分数显示
    var score = this.game ? this.game.score : 0;
    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('\u5206\u6570: ' + score, w / 2, h * 0.52);

    // 按钮
    var btnW = 180;
    var btnH = 46;
    var btnX = (w - btnW) / 2;

    this._addButton({
      x: btnX, y: h * 0.6, w: btnW, h: btnH,
      text: '\u25B6 \u4E0B\u4E00\u5173', color: '#4CAF50',
      fontSize: 17, bold: true, radius: 12,
      action: function() {
        if (this.game) {
          var nextLevel = this.game.level + 1;
          var config = LevelMap.toGameConfig(nextLevel);
          if (config) {
            this.game.startLevel(nextLevel, config);
            this.setScreen('game');
          } else {
            this.setScreen('map');
          }
        }
      }.bind(this)
    });

    this._addButton({
      x: btnX, y: h * 0.6 + 58, w: btnW, h: btnH,
      text: '\u{1F5FA} \u8FD4\u56DE\u5730\u56FE', color: '#FF8C00',
      fontSize: 17, bold: true, radius: 12,
      action: function() {
        if (this.game) this.game.exit();
        this.setScreen('map');
      }.bind(this)
    });

    this._drawButtons(ctx);
  }

  _drawConfetti(ctx, w, h) {
    ctx.save();
    for (var i = 0; i < this.confetti.length; i++) {
      var c = this.confetti[i];
      c.y += c.speed;
      c.wobble += 0.03;
      c.rotation += c.rotSpeed;
      var wx = c.x + Math.sin(c.wobble) * 30;

      if (c.y > h + 20) {
        c.y = -20;
        c.x = Math.random() * w;
      }

      ctx.save();
      ctx.translate(wx, c.y);
      ctx.rotate(c.rotation);
      ctx.fillStyle = c.color;
      ctx.fillRect(-c.size / 2, -c.size / 2, c.size, c.size * 0.6);
      ctx.restore();
    }
    ctx.restore();
  }

  // ============================================================
  // 失败界面
  // ============================================================

  drawLose(ctx, w, h) {
    this.buttons = [];

    // 先绘制游戏界面
    if (this.game) {
      this.game.render();
    }

    // 半透明遮罩
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, 0, w, h);

    // 标题
    ctx.save();
    ctx.font = 'bold 30px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.strokeStyle = 'rgba(0,0,0,0.8)';
    ctx.lineWidth = 4;
    ctx.strokeText('\u5173\u5361\u5931\u8D25', w / 2, h * 0.25);

    ctx.fillStyle = '#FF4444';
    ctx.fillText('\u5173\u5361\u5931\u8D25', w / 2, h * 0.25);
    ctx.restore();

    // 分数
    var score = this.game ? this.game.score : 0;
    var target = this.game ? this.game.targetScore : 0;

    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('\u5206\u6570: ' + score, w / 2, h * 0.35);

    // 目标对比
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '14px Arial';
    ctx.fillText('\u76EE\u6807\u5206\u6570: ' + target, w / 2, h * 0.4);

    // 进度条
    var barW = 200;
    var barH = 12;
    var barX = (w - barW) / 2;
    var barY = h * 0.45;
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    this._roundRect(ctx, barX, barY, barW, barH, 6);
    ctx.fill();

    var progress = target > 0 ? Math.min(1, score / target) : 0;
    if (progress > 0) {
      var progGrad = ctx.createLinearGradient(barX, 0, barX + barW * progress, 0);
      progGrad.addColorStop(0, '#FF4444');
      progGrad.addColorStop(1, '#FF8C00');
      this._roundRect(ctx, barX, barY, barW * progress, barH, 6);
      ctx.fillStyle = progGrad;
      ctx.fill();
    }

    // 按钮
    var btnW = 180;
    var btnH = 46;
    var btnX = (w - btnW) / 2;

    this._addButton({
      x: btnX, y: h * 0.55, w: btnW, h: btnH,
      text: '\u{1F504} \u518D\u8BD5\u4E00\u6B21', color: '#FF8C00',
      fontSize: 17, bold: true, radius: 12,
      action: function() {
        if (this.game && this.game.levelConfig) {
          this.game.startLevel(this.game.level, this.game.levelConfig);
          this.setScreen('game');
        }
      }.bind(this)
    });

    this._addButton({
      x: btnX, y: h * 0.55 + 58, w: btnW, h: btnH,
      text: '\u{1F5FA} \u8FD4\u56DE\u5730\u56FE', color: '#888',
      fontSize: 17, bold: true, radius: 12,
      action: function() {
        if (this.game) this.game.exit();
        this.setScreen('map');
      }.bind(this)
    });

    this._addButton({
      x: btnX, y: h * 0.55 + 116, w: btnW, h: btnH,
      text: '\u{1F4F9} \u770B\u5E7F\u544A+5\u6B65', color: '#4CAF50',
      fontSize: 15, bold: true, radius: 12,
      action: function() {
        // 模拟看广告加5步
        if (this.game) {
          this.game.moves += 5;
          this.game.state = 'idle';
          this.setScreen('game');
        }
      }.bind(this)
    });

    this._drawButtons(ctx);
  }

  // ============================================================
  // 设置界面
  // ============================================================

  drawSettings(ctx, w, h) {
    this.buttons = [];

    // 背景
    var bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, '#37474F');
    bgGrad.addColorStop(1, '#455A64');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // 标题
    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('\u2699 \u8BBE\u7F6E', w / 2, 35);

    // 设置项
    var data = this.saveData;
    var startY = 70;
    var itemH = 50;
    var gap = 5;

    // 音效开关
    this._drawSettingToggle(ctx, w, startY, '\u{1F50A} \u97F3\u6548', data.soundEnabled, function(val) {
      data.soundEnabled = val;
      Storage.save(data);
      this.saveData = data;
    }.bind(this));

    // 音乐开关
    this._drawSettingToggle(ctx, w, startY + itemH + gap, '\u{1F3B5} \u97F3\u4E50', data.musicEnabled, function(val) {
      data.musicEnabled = val;
      Storage.save(data);
      this.saveData = data;
    }.bind(this));

    // 震动反馈
    this._drawSettingToggle(ctx, w, startY + (itemH + gap) * 2, '\u{1F4F3} \u9707\u52A8\u53CD\u9988', data.vibrationEnabled, function(val) {
      data.vibrationEnabled = val;
      Storage.save(data);
      this.saveData = data;
    }.bind(this));

    // 语言选择
    var langY = startY + (itemH + gap) * 3;
    this._roundRect(ctx, 20, langY, w - 40, itemH, 10);
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.fill();
    ctx.fillStyle = '#FFF';
    ctx.font = '15px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('\u{1F310} \u8BED\u8A00', 35, langY + itemH / 2);

    var langBtnW = 60;
    var langBtnH = 30;
    var langBtnY = langY + (itemH - langBtnH) / 2;
    (function() {
      this._addButton({
        x: w - 140, y: langBtnY, w: langBtnW, h: langBtnH,
        text: '\u4E2D\u6587', color: data.language === 'zh' ? '#4CAF50' : 'rgba(255,255,255,0.15)',
        fontSize: 13, radius: 6,
        action: function() {
          data.language = 'zh';
          Storage.save(data);
          this.saveData = data;
        }.bind(this)
      });
      this._addButton({
        x: w - 70, y: langBtnY, w: langBtnW, h: langBtnH,
        text: 'EN', color: data.language === 'en' ? '#4CAF50' : 'rgba(255,255,255,0.15)',
        fontSize: 13, radius: 6,
        action: function() {
          data.language = 'en';
          Storage.save(data);
          this.saveData = data;
        }.bind(this)
      });
    }).call(this);

    // 关于
    var aboutY = startY + (itemH + gap) * 4;
    this._roundRect(ctx, 20, aboutY, w - 40, itemH, 10);
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.fill();
    ctx.fillStyle = '#FFF';
    ctx.font = '15px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('\u{2139} \u5173\u4E8E', 35, aboutY + itemH / 2);
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '12px Arial';
    ctx.textAlign = 'right';
    ctx.fillText('v1.0.0', w - 35, aboutY + itemH / 2);

    // 重置存档按钮
    var resetY = aboutY + itemH + 20;
    this._addButton({
      x: (w - 160) / 2, y: resetY, w: 160, h: 40,
      text: '\u{1F5D1} \u91CD\u7F6E\u5B58\u6863', color: '#FF4444',
      fontSize: 14, bold: true, radius: 10,
      action: function() {
        this.popup = {
          title: '\u786E\u8BA4\u91CD\u7F6E\uFF1F',
          message: '\u6240\u6709\u8FDB\u5EA6\u5C06\u4F1A\u4E22\u5931\uFF01',
          buttons: [
            {
              text: '\u53D6\u6D88', x: w / 2 - 90, y: 0, w: 80, h: 36,
              color: '#888', action: function() { this.popup = null; }.bind(this)
            },
            {
              text: '\u786E\u8BA4', x: w / 2 + 10, y: 0, w: 80, h: 36,
              color: '#FF4444', action: function() {
                Storage.reset();
                this.saveData = Storage.load();
                this.popup = null;
              }.bind(this)
            }
          ]
        };
      }.bind(this)
    });

    // 绘制按钮
    this._drawButtons(ctx);

    // 顶部栏
    this._drawTopBar(ctx, w, true);
  }

  _drawSettingToggle(ctx, w, y, label, value, callback) {
    var itemH = 50;
    var toggleW = 50;
    var toggleH = 26;
    var toggleX = w - 70;
    var toggleY = y + (itemH - toggleH) / 2;

    // 背景
    this._roundRect(ctx, 20, y, w - 40, itemH, 10);
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.fill();

    // 标签
    ctx.fillStyle = '#FFF';
    ctx.font = '15px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, 35, y + itemH / 2);

    // 开关轨道
    this._roundRect(ctx, toggleX, toggleY, toggleW, toggleH, toggleH / 2);
    ctx.fillStyle = value ? '#4CAF50' : 'rgba(255,255,255,0.2)';
    ctx.fill();

    // 开关滑块
    var knobX = value ? toggleX + toggleW - toggleH / 2 - 1 : toggleX + toggleH / 2 + 1;
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.arc(knobX, toggleY + toggleH / 2, toggleH / 2 - 3, 0, Math.PI * 2);
    ctx.fill();

    // 点击区域
    (function(val, cb) {
      this._addButton({
        x: toggleX - 5, y: toggleY - 5, w: toggleW + 10, h: toggleH + 10,
        text: '', color: 'rgba(0,0,0,0)',
        action: function() { cb(!val); }
      });
    }).call(this, value, callback);
  }

  // ============================================================
  // 宠物界面
  // ============================================================

  drawPet(ctx, w, h) {
    this.buttons = [];

    // 背景
    var bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, '#E8F5E9');
    bgGrad.addColorStop(1, '#C8E6C9');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // 标题
    ctx.fillStyle = '#333';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('\u{1F43E} \u5BA0\u7269', w / 2, 35);

    // 宠物列表
    var data = this.saveData;
    var pets = Pets.list;
    var cardW = 130;
    var cardH = 220;
    var gap = 12;
    var totalW = pets.length * cardW + (pets.length - 1) * gap;
    var startX = (w - totalW) / 2 + this.petScrollX;
    var cardY = 65;

    for (var i = 0; i < pets.length; i++) {
      var pet = pets[i];
      var cx = startX + i * (cardW + gap);
      var isSelected = (data.selectedPet === pet.id);
      var isUnlocked = Pets.isPetUnlocked(pet.id);

      // 跳过不可见
      if (cx + cardW < 0 || cx > w) continue;

      // 卡片背景
      this._roundRect(ctx, cx, cardY, cardW, cardH, 12);
      if (isSelected) {
        var selGrad = ctx.createLinearGradient(cx, cardY, cx, cardY + cardH);
        selGrad.addColorStop(0, '#FFF8E1');
        selGrad.addColorStop(1, '#FFECB3');
        ctx.fillStyle = selGrad;
      } else {
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
      }
      ctx.fill();

      // 选中边框
      if (isSelected) {
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 3;
        this._roundRect(ctx, cx, cardY, cardW, cardH, 12);
        ctx.stroke();
      } else {
        ctx.strokeStyle = 'rgba(0,0,0,0.1)';
        ctx.lineWidth = 1;
        this._roundRect(ctx, cx, cardY, cardW, cardH, 12);
        ctx.stroke();
      }

      // 锁定遮罩
      if (!isUnlocked) {
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        this._roundRect(ctx, cx, cardY, cardW, cardH, 12);
        ctx.fill();
      }

      // 宠物头像
      var avatarSize = 80;
      var avatarX = cx + (cardW - avatarSize) / 2;
      var avatarY = cardY + 10;

      // 头像圆形背景
      ctx.fillStyle = isUnlocked ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.1)';
      ctx.beginPath();
      ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
      ctx.fill();

      if (isUnlocked) {
        pet.draw(ctx, avatarX, avatarY, avatarSize);
      } else {
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('\u{1F512}', avatarX + avatarSize / 2, avatarY + avatarSize / 2);
      }

      // 宠物名称
      ctx.fillStyle = isUnlocked ? '#333' : '#999';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(pet.name, cx + cardW / 2, avatarY + avatarSize + 18);

      // 等级
      ctx.fillStyle = '#888';
      ctx.font = '11px Arial';
      ctx.fillText('\u89E3\u9501: \u5173\u5361' + pet.unlockLevel, cx + cardW / 2, avatarY + avatarSize + 36);

      // 技能描述
      ctx.fillStyle = '#666';
      ctx.font = '10px Arial';
      var skillText = pet.skill;
      // 自动换行
      var maxChars = 8;
      var line1 = skillText.substring(0, maxChars);
      var line2 = skillText.substring(maxChars);
      ctx.fillText(line1, cx + cardW / 2, avatarY + avatarSize + 54);
      if (line2) ctx.fillText(line2, cx + cardW / 2, avatarY + avatarSize + 68);

      // 选择按钮
      if (isUnlocked) {
        (function(petId, yPos) {
          this._addButton({
            x: cx + 15, y: yPos + cardH - 42, w: cardW - 30, h: 32,
            text: isSelected ? '\u2713 \u5DF2\u9009\u62E9' : '\u9009\u62E9',
            color: isSelected ? '#4CAF50' : pet.color,
            fontSize: 13, bold: true, radius: 8,
            action: function() {
              Pets.selectPet(petId);
              this.saveData = Storage.load();
            }.bind(this)
          });
        }).call(this, pet.id, cardY);
      }
    }

    // 绘制按钮
    this._drawButtons(ctx);

    // 顶部栏
    this._drawTopBar(ctx, w, true);
  }

  // ============================================================
  // 弹窗绘制
  // ============================================================

  _drawPopup(ctx, w, h) {
    if (!this.popup) return;

    // 遮罩
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, 0, w, h);

    // 弹窗尺寸
    var popupW = 280;
    var popupH = 160;
    var popupX = (w - popupW) / 2;
    var popupY = (h - popupH) / 2;

    // 背景
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 20;
    this._roundRect(ctx, popupX, popupY, popupW, popupH, 16);
    ctx.fillStyle = '#FFF';
    ctx.fill();
    ctx.restore();

    // 标题
    ctx.fillStyle = '#333';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.popup.title || '', w / 2, popupY + 35);

    // 消息
    ctx.fillStyle = '#666';
    ctx.font = '14px Arial';
    ctx.fillText(this.popup.message || '', w / 2, popupY + 65);

    // 按钮
    if (this.popup.buttons) {
      for (var i = 0; i < this.popup.buttons.length; i++) {
        var btn = this.popup.buttons[i];
        btn.y = popupY + popupH - 55;
        this._drawButton(ctx, btn, false);
      }
    }
  }

  // ============================================================
  // 公共方法
  // ============================================================

  /** 设置游戏实例 */
  setGame(game) {
    this.game = game;
  }

  /** 调整画布大小 */
  resize(w, h) {
    this.width = w;
    this.height = h;
  }

  /** 刷新存档数据 */
  refreshSaveData() {
    this.saveData = Storage.load();
  }
}


// ===== game.js =====
// ============================================================
// game.js - 开心消消乐 游戏主控制器
// ============================================================

class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    // 棋盘
    this.board = new Board();

    // 游戏状态
    this.state = 'idle'; // idle, selected, swapping, removing, falling, processing, paused, win, lose
    this.selectedCell = null;
    this.hoverCell = null;

    // 分数和步数
    this.score = 0;
    this.moves = 0;
    this.maxMoves = CONFIG.MAX_MOVES;
    this.targetScore = 0;
    this.level = 1;
    this.mode = CONFIG.MODES.SCORE;
    this.combo = 0;

    // 动画和粒子
    this.animations = new AnimationManager();
    this.particles = new ParticleSystem();

    // 道具
    this.items = {
      hammer: 0,
      refresh: 0,
      plus5: 0,
      colorBomb: 0
    };
    this.activeItem = null;

    // 暂停
    this.paused = false;

    // 时间
    this.lastTime = 0;
    this.rafId = null;

    // 棋盘偏移（居中显示）
    this.boardOffsetX = 0;
    this.boardOffsetY = 60; // HUD高度

    // 关卡配置缓存
    this.levelConfig = null;

    // 回调
    this.onWin = null;
    this.onLose = null;
    this.onScoreUpdate = null;
    this.onMovesUpdate = null;

    // 触摸/鼠标状态
    this._dragStart = null;
    this._isDragging = false;

    // 初始化音效
    SoundManager.init();

    // 绑定事件
    this._bindEvents();
  }

  // ---- 事件绑定 ----

  _bindEvents() {
    var self = this;

    // 鼠标事件
    this.canvas.addEventListener('mousedown', function(e) { self._onPointerDown(e); });
    this.canvas.addEventListener('mousemove', function(e) { self._onPointerMove(e); });
    this.canvas.addEventListener('mouseup', function(e) { self._onPointerUp(e); });

    // 触摸事件
    this.canvas.addEventListener('touchstart', function(e) {
      e.preventDefault();
      self._onPointerDown(e.touches[0]);
    }, { passive: false });
    this.canvas.addEventListener('touchmove', function(e) {
      e.preventDefault();
      self._onPointerMove(e.touches[0]);
    }, { passive: false });
    this.canvas.addEventListener('touchend', function(e) {
      e.preventDefault();
      self._onPointerUp(e.changedTouches[0]);
    }, { passive: false });
  }

  _getCanvasPos(e) {
    var rect = this.canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (this.canvas.width / rect.width),
      y: (e.clientY - rect.top) * (this.canvas.height / rect.height)
    };
  }

  /** 像素坐标转棋盘坐标 */
  _pixelToCell(px, py) {
    var col = Math.floor((px - this.boardOffsetX) / CONFIG.CELL_SIZE);
    var row = Math.floor((py - this.boardOffsetY) / CONFIG.CELL_SIZE);
    if (row >= 0 && row < this.board.rows && col >= 0 && col < this.board.cols) {
      return { r: row, c: col };
    }
    return null;
  }

  _onPointerDown(e) {
    if (this.paused) return;
    if (this.state === 'win' || this.state === 'lose') return;
    if (this.animations.isBusy()) return;

    SoundManager.resume();
    var pos = this._getCanvasPos(e);
    var cell = this._pixelToCell(pos.x, pos.y);

    if (!cell) return;

    // 使用道具
    if (this.activeItem) {
      this._useItemAt(cell.r, cell.c);
      return;
    }

    this._dragStart = { x: pos.x, y: pos.y, cell: cell };
    this._isDragging = false;
  }

  _onPointerMove(e) {
    if (!this._dragStart) return;

    var pos = this._getCanvasPos(e);
    var dx = pos.x - this._dragStart.x;
    var dy = pos.y - this._dragStart.y;
    var dist = Math.sqrt(dx * dx + dy * dy);

    // 更新hover
    this.hoverCell = this._pixelToCell(pos.x, pos.y);

    if (dist > CONFIG.CELL_SIZE * 0.3) {
      this._isDragging = true;

      // 判断滑动方向
      var dr = 0, dc = 0;
      if (Math.abs(dx) > Math.abs(dy)) {
        dc = dx > 0 ? 1 : -1;
      } else {
        dr = dy > 0 ? 1 : -1;
      }

      var targetCell = {
        r: this._dragStart.cell.r + dr,
        c: this._dragStart.cell.c + dc
      };

      this._dragStart = null;
      this._isDragging = false;

      this._trySwap(this._dragStart ? this._dragStart.cell : { r: targetCell.r - dr, c: targetCell.c - dc }, targetCell);
    }
  }

  _onPointerUp(e) {
    if (!this._dragStart) return;

    if (!this._isDragging) {
      // 点击选择
      this._handleClick(this._dragStart.cell);
    }

    this._dragStart = null;
    this._isDragging = false;
  }

  _handleClick(cell) {
    if (this.state === 'processing' || this.state === 'swapping' ||
        this.state === 'removing' || this.state === 'falling') return;

    if (this.state === 'idle') {
      this.selectedCell = cell;
      this.state = 'selected';
      SoundManager.playClick();
    } else if (this.state === 'selected') {
      if (this.selectedCell && this.selectedCell.r === cell.r && this.selectedCell.c === cell.c) {
        // 取消选择
        this.selectedCell = null;
        this.state = 'idle';
      } else if (this.selectedCell) {
        // 尝试交换
        this._trySwap(this.selectedCell, cell);
      }
    }
  }

  _trySwap(cell1, cell2) {
    if (!this.board.canSwap(cell1.r, cell1.c, cell2.r, cell2.c)) {
      // 无效交换
      SoundManager.playSwap(false);
      this.animations.addInvalidSwap(cell1.r, cell1.c, cell2.r, cell2.c);
      this.selectedCell = null;
      this.state = 'idle';
      return;
    }

    this.selectedCell = null;
    this.state = 'swapping';

    // 执行交换
    var result = this.board.swap(cell1.r, cell1.c, cell2.r, cell2.c);

    if (!result.success) {
      // 无效交换（没有产生匹配）
      SoundManager.playSwap(false);
      this.animations.addInvalidSwap(cell1.r, cell1.c, cell2.r, cell2.c);
      this.state = 'idle';
      return;
    }

    SoundManager.playSwap(true);
    this.moves--;

    // 处理特殊合成
    if (result.specialCombine) {
      this._processSpecialCombine(result);
      return;
    }

    // 处理彩色球
    if (result.colorBombResult) {
      this._processColorBomb(result);
      return;
    }

    // 普通交换 - 添加交换动画
    this.animations.addSwap(cell1.r, cell1.c, cell2.r, cell2.c);

    // 延迟后开始处理匹配
    var self = this;
    setTimeout(function() {
      self._processMatches();
    }, CONFIG.SWAP_DURATION + 50);
  }

  _processSpecialCombine(result) {
    var combine = result.specialCombine;
    var swapInfo = result.swapInfo;

    // 添加交换动画
    this.animations.addSwap(swapInfo.r1, swapInfo.c1, swapInfo.r2, swapInfo.c2);

    // 添加消除粒子
    for (var i = 0; i < combine.removed.length; i++) {
      var r = combine.removed[i];
      var px = this.boardOffsetX + r.c * CONFIG.CELL_SIZE + CandyRenderer.HALF;
      var py = this.boardOffsetY + r.r * CONFIG.CELL_SIZE + CandyRenderer.HALF;
      this.particles.emitMatch(px, py, r.color, 4);
    }

    // 添加特效
    this.animations.addSpecialEffect('rainbow', swapInfo.r1, swapInfo.c1, '#FFF');
    this.animations.addShake(8, 400);

    this.score += combine.score;
    SoundManager.playSpecial(CONFIG.SPECIAL.RAINBOW);

    if (this.onScoreUpdate) this.onScoreUpdate(this.score);
    if (this.onMovesUpdate) this.onMovesUpdate(this.moves);

    this.state = 'processing';

    // 延迟后继续处理
    var self = this;
    setTimeout(function() {
      self._continueProcessing();
    }, CONFIG.SPECIAL_EFFECT_DURATION + 100);
  }

  _processColorBomb(result) {
    var cbResult = result.colorBombResult;
    var swapInfo = result.swapInfo;

    // 添加交换动画
    this.animations.addSwap(swapInfo.r1, swapInfo.c1, swapInfo.r2, swapInfo.c2);

    // 添加消除粒子
    for (var i = 0; i < cbResult.removed.length; i++) {
      var r = cbResult.removed[i];
      var px = this.boardOffsetX + r.c * CONFIG.CELL_SIZE + CandyRenderer.HALF;
      var py = this.boardOffsetY + r.r * CONFIG.CELL_SIZE + CandyRenderer.HALF;
      this.particles.emitMatch(px, py, r.color, 4);
    }

    // 彩色球特效
    var px = this.boardOffsetX + swapInfo.r1 * CONFIG.CELL_SIZE + CandyRenderer.HALF;
    var py = this.boardOffsetY + swapInfo.r1 * CONFIG.CELL_SIZE + CandyRenderer.HALF;
    this.particles.emitColorBomb(px, py);
    this.animations.addSpecialEffect(CONFIG.SPECIAL.COLOR_BOMB, swapInfo.r1, swapInfo.c1, cbResult.color);
    this.animations.addShake(6, 300);

    this.score += cbResult.score;
    SoundManager.playSpecial(CONFIG.SPECIAL.COLOR_BOMB);

    if (this.onScoreUpdate) this.onScoreUpdate(this.score);
    if (this.onMovesUpdate) this.onMovesUpdate(this.moves);

    this.state = 'processing';

    var self = this;
    setTimeout(function() {
      self._continueProcessing();
    }, CONFIG.SPECIAL_EFFECT_DURATION + 100);
  }

  // ---- 游戏流程 ----

  /**
   * 开始关卡
   * @param {number} level - 关卡号
   * @param {Object} customConfig - 自定义关卡配置（可选）
   */
  startLevel(level, customConfig) {
    this.level = level || 1;
    this.score = 0;
    this.combo = 0;
    this.selectedCell = null;
    this.activeItem = null;
    this.animations.clearAll();
    this.particles.clearAll();

    // 获取关卡配置
    var config = customConfig || this._getLevelConfig(this.level);
    this.levelConfig = config;

    this.mode = config.mode || CONFIG.MODES.SCORE;
    this.targetScore = config.targetScore || 3000;
    this.maxMoves = config.moves || CONFIG.MAX_MOVES;
    this.moves = this.maxMoves;

    // 初始化棋盘
    this.board.init(config);

    // 调整Canvas大小
    this._resizeCanvas();

    this.state = 'idle';
    this.paused = false;

    SoundManager.playLevelStart();

    // 启动游戏循环
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.lastTime = performance.now();
    this._gameLoop(this.lastTime);
  }

  /** 获取关卡配置 */
  _getLevelConfig(level) {
    var preset = CONFIG.LEVEL_TARGETS[level];
    if (preset) {
      var config = {
        rows: CONFIG.BOARD_ROWS,
        cols: CONFIG.BOARD_COLS,
        mode: preset.mode,
        targetScore: preset.targetScore,
        moves: preset.moves
      };

      // 根据模式添加额外配置
      if (preset.mode === CONFIG.MODES.JELLY) {
        config.jellies = this._generateJellies(preset.jellyCount || 10);
      } else if (preset.mode === CONFIG.MODES.INGREDIENT) {
        config.ingredients = this._generateIngredients(preset.ingredients || ['cherry', 'cherry']);
      }

      // 高关卡添加障碍物
      if (level >= 3) {
        config.obstacles = this._generateObstacles(level);
      }

      return config;
    }

    // 默认配置
    return {
      rows: CONFIG.BOARD_ROWS,
      cols: CONFIG.BOARD_COLS,
      mode: CONFIG.MODES.SCORE,
      targetScore: 3000 + (level - 1) * 2000,
      moves: Math.max(15, 30 - Math.floor(level / 3))
    };
  }

  /** 生成随机果冻位置 */
  _generateJellies(count) {
    var jellies = [];
    var used = {};
    while (jellies.length < count) {
      var r = Math.floor(Math.random() * CONFIG.BOARD_ROWS);
      var c = Math.floor(Math.random() * CONFIG.BOARD_COLS);
      var key = r + ',' + c;
      if (!used[key]) {
        used[key] = true;
        jellies.push({ r: r, c: c, layers: Math.random() < 0.3 ? 2 : 1 });
      }
    }
    return jellies;
  }

  /** 生成果子位置 */
  _generateIngredients(ingredientTypes) {
    var ingredients = [];
    for (var i = 0; i < ingredientTypes.length; i++) {
      var c = Math.floor(Math.random() * CONFIG.BOARD_COLS);
      ingredients.push({ r: 0, c: c, type: ingredientTypes[i] });
    }
    return ingredients;
  }

  /** 生成障碍物 */
  _generateObstacles(level) {
    var obstacles = [];
    var count = Math.min(level, 8);
    var used = {};

    for (var i = 0; i < count; i++) {
      var r, c, key;
      do {
        r = Math.floor(Math.random() * CONFIG.BOARD_ROWS);
        c = Math.floor(Math.random() * CONFIG.BOARD_COLS);
        key = r + ',' + c;
      } while (used[key]);

      used[key] = true;
      var types = [CONFIG.OBSTACLE.ICE_1, CONFIG.OBSTACLE.ICE_2, CONFIG.OBSTACLE.ICE_3];
      obstacles.push({ r: r, c: c, type: types[Math.floor(Math.random() * types.length)] });
    }

    return obstacles;
  }

  /** 调整Canvas大小 */
  _resizeCanvas() {
    var boardWidth = this.board.cols * CONFIG.CELL_SIZE;
    var boardHeight = this.board.rows * CONFIG.CELL_SIZE;
    var hudHeight = 60;
    var itemBarHeight = 50;
    var padding = 10;

    this.canvas.width = boardWidth + padding * 2;
    this.canvas.height = hudHeight + boardHeight + itemBarHeight + padding * 2;

    this.boardOffsetX = padding;
    this.boardOffsetY = hudHeight + padding;
  }

  // ---- 匹配处理 ----

  _processMatches() {
    this.state = 'processing';
    this.combo = 0;

    var processResult = this.board.processBoard();

    if (processResult.steps.length === 0) {
      this._finishProcessing(processResult);
      return;
    }

    // 逐步播放动画
    this._playProcessSteps(processResult, 0);
  }

  _continueProcessing() {
    // 下落和填充
    var falls = this.board.applyGravity();
    var fills = this.board.fillEmpty();
    var ingredients = this.board.collectIngredients();

    // 添加下落动画
    this.animations.addFalls(falls, 0);
    this.animations.addFalls(fills, CONFIG.CASCADE_DELAY);

    // 添加收集果子粒子
    for (var i = 0; i < ingredients.length; i++) {
      var ing = ingredients[i];
      var px = this.boardOffsetX + ing.c * CONFIG.CELL_SIZE + CandyRenderer.HALF;
      var py = this.boardOffsetY + ing.r * CONFIG.CELL_SIZE + CandyRenderer.HALF;
      this.particles.emitScore(px, py, CONFIG.SCORE_INGREDIENT, true);
    }

    // 等待动画完成后继续
    var self = this;
    var waitTime = CONFIG.FALL_DURATION + fills.length * 20 + 200;

    setTimeout(function() {
      // 检查新的匹配
      var matchResult = self.board.findMatches();
      if (matchResult.matches.length > 0) {
        self._processMatches();
      } else {
        // 处理完成
        self._finishProcessing({ needShuffle: !self.board.hasValidMoves() });
      }
    }, waitTime);
  }

  _playProcessSteps(processResult, stepIndex) {
    if (stepIndex >= processResult.steps.length) {
      // 所有步骤完成，继续处理
      this._continueProcessing();
      return;
    }

    var step = processResult.steps[stepIndex];
    var self = this;
    this.combo = step.combo;

    // 播放消除音效
    SoundManager.playMatch(step.combo);
    if (step.combo > 1) {
      SoundManager.playCombo(step.combo);
    }

    // 添加消除动画
    for (var i = 0; i < step.removed.length; i++) {
      var r = step.removed[i];
      var px = this.boardOffsetX + r.c * CONFIG.CELL_SIZE + CandyRenderer.HALF;
      var py = this.boardOffsetY + r.r * CONFIG.CELL_SIZE + CandyRenderer.HALF;

      // 消除粒子
      if (r.special && r.special !== CONFIG.SPECIAL.NORMAL) {
        // 特殊方块粒子
        if (r.special === CONFIG.SPECIAL.STRIPED_H) {
          this.particles.emitStriped(px, py, 'h', r.color);
        } else if (r.special === CONFIG.SPECIAL.STRIPED_V) {
          this.particles.emitStriped(px, py, 'v', r.color);
        } else if (r.special === CONFIG.SPECIAL.WRAPPED) {
          this.particles.emitWrapped(px, py, r.color);
        } else if (r.special === CONFIG.SPECIAL.COLOR_BOMB) {
          this.particles.emitColorBomb(px, py);
        }
        SoundManager.playSpecial(r.special);
      } else {
        this.particles.emitMatch(px, py, r.color, 6);
      }
    }

    // 添加分数飘字
    if (step.removed.length > 0) {
      var midR = step.removed[Math.floor(step.removed.length / 2)];
      var px = this.boardOffsetX + midR.c * CONFIG.CELL_SIZE + CandyRenderer.HALF;
      var py = this.boardOffsetY + midR.r * CONFIG.CELL_SIZE + CandyRenderer.HALF;
      this.particles.emitScore(px, py, step.score, step.combo > 0);
    }

    // 连击提示
    if (step.combo >= 2) {
      var px = this.canvas.width / 2;
      var py = this.boardOffsetY + this.board.rows * CONFIG.CELL_SIZE / 2;
      this.particles.emitCombo(px, py, step.combo);
      if (step.combo >= 3) {
        this.animations.addShake(3 + step.combo, 200);
      }
    }

    // 添加特殊方块生成动画
    for (var i = 0; i < step.specialsCreated.length; i++) {
      var sp = step.specialsCreated[i];
      this.animations.addSpecialCreate(sp.r, sp.c, sp.type, sp.color);
    }

    // 更新分数
    this.score += step.score;
    if (this.onScoreUpdate) this.onScoreUpdate(this.score);

    // 下落动画
    this.animations.addFalls(step.falls, CONFIG.REMOVE_DURATION);
    this.animations.addFalls(step.fills, CONFIG.REMOVE_DURATION + CONFIG.CASCADE_DELAY);

    // 等待动画完成后处理下一步
    var waitTime = CONFIG.REMOVE_DURATION + CONFIG.FALL_DURATION + step.fills.length * 20 + 150;

    setTimeout(function() {
      self._playProcessSteps(processResult, stepIndex + 1);
    }, waitTime);
  }

  _finishProcessing(processResult) {
    // 检查是否需要洗牌
    if (processResult && processResult.needShuffle) {
      SoundManager.playShuffle();
      this.board.shuffle();
    }

    // 检查胜利/失败
    this._checkWinLose();
  }

  _checkWinLose() {
    var won = false;

    switch (this.mode) {
      case CONFIG.MODES.SCORE:
        won = this.score >= this.targetScore;
        break;
      case CONFIG.MODES.JELLY:
        won = this.board.isJellyComplete();
        break;
      case CONFIG.MODES.INGREDIENT:
        won = this.board.getRemainingIngredients() === 0;
        break;
    }

    if (won) {
      this.state = 'win';
      SoundManager.playWin();
      // 胜利粒子
      for (var i = 0; i < 5; i++) {
        var px = Math.random() * this.canvas.width;
        var py = Math.random() * this.canvas.height * 0.5;
        this.particles.emitColorBomb(px, py);
      }
      if (this.onWin) this.onWin(this.score, this.moves);
    } else if (this.moves <= 0) {
      this.state = 'lose';
      SoundManager.playFail();
      if (this.onLose) this.onLose(this.score);
    } else {
      this.state = 'idle';
    }
  }

  // ---- 道具 ----

  _useItemAt(r, c) {
    var result = null;

    switch (this.activeItem) {
      case 'hammer':
        result = this.board.useHammer(r, c);
        break;
      case 'colorBomb':
        result = this.board.useColorBomb(r, c);
        break;
      case 'refresh':
        result = this.board.useRefresh();
        break;
      case 'plus5':
        result = this.board.usePlus5();
        break;
    }

    if (result) {
      this.items[this.activeItem]--;
      this.activeItem = null;
      SoundManager.playItem();

      if (this.activeItem === 'plus5' && result.extraMoves) {
        this.moves += result.extraMoves;
        if (this.onMovesUpdate) this.onMovesUpdate(this.moves);
      }

      if (result.removed) {
        for (var i = 0; i < result.removed.length; i++) {
          var rm = result.removed[i];
          var px = this.boardOffsetX + rm.c * CONFIG.CELL_SIZE + CandyRenderer.HALF;
          var py = this.boardOffsetY + rm.r * CONFIG.CELL_SIZE + CandyRenderer.HALF;
          this.particles.emitMatch(px, py, rm.color, 8);
        }
        this.score += result.score;
        if (this.onScoreUpdate) this.onScoreUpdate(this.score);

        // 继续处理连锁
        var self = this;
        setTimeout(function() {
          self._processMatches();
        }, CONFIG.REMOVE_DURATION + 100);
      }

      if (result.shuffled) {
        this.animations.addShake(5, 300);
      }
    }
  }

  /** 激活道具 */
  activateItem(itemName) {
    if (this.items[itemName] <= 0) return;
    if (this.state === 'processing' || this.state === 'win' || this.state === 'lose') return;

    if (itemName === 'plus5') {
      // 直接使用
      this.items.plus5--;
      this.moves += 5;
      SoundManager.playItem();
      if (this.onMovesUpdate) this.onMovesUpdate(this.moves);
      return;
    }

    if (itemName === 'refresh') {
      this.items.refresh--;
      this.board.shuffle();
      SoundManager.playItem();
      this.animations.addShake(5, 300);
      return;
    }

    this.activeItem = itemName;
  }

  /** 取消道具 */
  cancelItem() {
    this.activeItem = null;
  }

  // ---- 暂停/恢复 ----

  pause() {
    this.paused = true;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  resume() {
    this.paused = false;
    if (!this.rafId) {
      this.lastTime = performance.now();
      this._gameLoop(this.lastTime);
    }
  }

  exit() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  // ---- 渲染 ----

  render() {
    var ctx = this.ctx;
    var w = this.canvas.width;
    var h = this.canvas.height;
    var time = performance.now();

    // 清空
    ctx.clearRect(0, 0, w, h);

    // 背景
    this._drawBackground(ctx, w, h);

    // 震动偏移
    var shake = this.animations.getShakeOffset();

    ctx.save();
    ctx.translate(shake.x, shake.y);

    // 绘制棋盘
    this._drawBoard(ctx, time);

    // 绘制动画层
    this.animations.render(ctx, this.boardOffsetX, this.boardOffsetY, time);

    // 绘制粒子
    this.particles.render(ctx);

    ctx.restore();

    // 绘制HUD（不受震动影响）
    this._drawHUD(ctx, w);

    // 绘制道具栏
    this._drawItems(ctx, w, h);

    // 绘制进度条
    this._drawProgressBar(ctx, w);

    // 绘制状态覆盖
    if (this.state === 'win') {
      this._drawWinOverlay(ctx, w, h, time);
    } else if (this.state === 'lose') {
      this._drawLoseOverlay(ctx, w, h, time);
    } else if (this.paused) {
      this._drawPauseOverlay(ctx, w, h);
    }

    // 道具激活提示
    if (this.activeItem) {
      this._drawItemHint(ctx, w, h, time);
    }
  }

  _drawBackground(ctx, w, h) {
    // 渐变背景
    var grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#1a0a3e');
    grad.addColorStop(0.5, '#2d1b69');
    grad.addColorStop(1, '#1a0a3e');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // 星星装饰
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    for (var i = 0; i < 20; i++) {
      var sx = (i * 137.5) % w;
      var sy = (i * 97.3) % h;
      var sr = 1 + (i % 3);
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  _drawBoard(ctx, time) {
    var ox = this.boardOffsetX;
    var oy = this.boardOffsetY;

    // 棋盘背景
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    var bw = this.board.cols * CONFIG.CELL_SIZE;
    var bh = this.board.rows * CONFIG.CELL_SIZE;
    // 使用arcTo绘制圆角矩形
    var br = 8;
    ctx.beginPath();
    ctx.moveTo(ox - 3 + br, oy - 3);
    ctx.lineTo(ox + bw + 3 - br, oy - 3);
    ctx.arcTo(ox + bw + 3, oy - 3, ox + bw + 3, oy - 3 + br, br);
    ctx.lineTo(ox + bw + 3, oy + bh + 3 - br);
    ctx.arcTo(ox + bw + 3, oy + bh + 3, ox + bw + 3 - br, oy + bh + 3, br);
    ctx.lineTo(ox - 3 + br, oy + bh + 3);
    ctx.arcTo(ox - 3, oy + bh + 3, ox - 3, oy + bh + 3 - br, br);
    ctx.lineTo(ox - 3, oy - 3 + br);
    ctx.arcTo(ox - 3, oy - 3, ox - 3 + br, oy - 3, br);
    ctx.closePath();
    ctx.fill();

    // 绘制格子
    for (var r = 0; r < this.board.rows; r++) {
      for (var c = 0; c < this.board.cols; c++) {
        var x = ox + c * CONFIG.CELL_SIZE;
        var y = oy + r * CONFIG.CELL_SIZE;
        var cell = this.board.getCell(r, c);

        // 格子背景
        ctx.fillStyle = (r + c) % 2 === 0 ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)';
        ctx.fillRect(x, y, CONFIG.CELL_SIZE, CONFIG.CELL_SIZE);

        // 检查是否有动画
        var anim = this.animations.getAnimationAt(r, c);

        if (anim) {
          // 动画中的格子
          if (anim.type === 'swap') {
            this._drawSwapAnim(ctx, anim, ox, oy, time);
          } else if (anim.type === 'fall') {
            this._drawFallAnim(ctx, anim, ox, oy, time);
          }
          // remove 和 special_effect 由 animation.render 处理
          continue;
        }

        // 绘制果冻（底层）
        if (cell.jelly > 0) {
          CandyRenderer.drawJelly(ctx, cell.jelly, x, y);
        }

        // 绘制传送门
        if (cell.isPortal) {
          CandyRenderer.drawPortal(ctx, x, y, time);
        }

        // 绘制糖果
        if (cell.candy) {
          CandyRenderer.drawCandy(ctx, cell.candy, x, y, time);
        }

        // 绘制果子
        if (cell.ingredient) {
          CandyRenderer.drawIngredient(ctx, cell.ingredient, x, y);
        }

        // 绘制障碍物（覆盖层）
        if (cell.obstacle && cell.obstacle.type !== CONFIG.OBSTACLE.NONE) {
          CandyRenderer.drawObstacle(ctx, cell.obstacle, x, y);
        }

        // 绘制选中效果
        if (this.selectedCell && this.selectedCell.r === r && this.selectedCell.c === c) {
          CandyRenderer.drawSelection(ctx, x, y, time);
        }

        // 绘制hover效果
        if (this.hoverCell && this.hoverCell.r === r && this.hoverCell.c === c &&
            !(this.selectedCell && this.selectedCell.r === r && this.selectedCell.c === c)) {
          ctx.save();
          ctx.strokeStyle = 'rgba(255,255,255,0.3)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(x + CandyRenderer.HALF, y + CandyRenderer.HALF, CandyRenderer.RADIUS + 2, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }
      }
    }
  }

  _drawSwapAnim(ctx, anim, ox, oy, time) {
    var p = AnimationManager.easeInOutQuad(anim.progress);

    // 格子1的位置
    var x1 = ox + anim.c1 * CONFIG.CELL_SIZE;
    var y1 = oy + anim.r1 * CONFIG.CELL_SIZE;
    var x2 = ox + anim.c2 * CONFIG.CELL_SIZE;
    var y2 = oy + anim.r2 * CONFIG.CELL_SIZE;

    // 插值位置
    var cx1 = x1 + (x2 - x1) * p;
    var cy1 = y1 + (y2 - y1) * p;
    var cx2 = x2 + (x1 - x2) * p;
    var cy2 = y2 + (y1 - y2) * p;

    var candy1 = this.board.getCandy(anim.r1, anim.c1);
    var candy2 = this.board.getCandy(anim.r2, anim.c2);

    // 注意：交换后candy已经在board中交换了，所以这里需要反向
    if (candy1) {
      CandyRenderer.drawCandy(ctx, candy1, cx2, cy2, time);
    }
    if (candy2) {
      CandyRenderer.drawCandy(ctx, candy2, cx1, cy1, time);
    }
  }

  _drawFallAnim(ctx, anim, ox, oy, time) {
    if (anim.elapsed < 0) return; // 延迟中

    var p = AnimationManager.easeOutBounce(anim.progress);

    var x = ox + anim.c * CONFIG.CELL_SIZE;
    var targetY = oy + anim.toRow * CONFIG.CELL_SIZE;
    var fromY = oy + anim.fromRow * CONFIG.CELL_SIZE;
    var currentY = fromY + (targetY - fromY) * p;

    var candy = this.board.getCandy(anim.r, anim.c);
    if (candy) {
      CandyRenderer.drawCandy(ctx, candy, x, currentY, time);
    }
  }

  _drawHUD(ctx, w) {
    // HUD背景
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, 0, w, 55);

    // 关卡号
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('Level ' + this.level, 10, 18);

    // 模式图标
    var modeText = '';
    switch (this.mode) {
      case CONFIG.MODES.SCORE: modeText = 'Target: ' + this.targetScore; break;
      case CONFIG.MODES.JELLY: modeText = 'Jelly: ' + this.board.getRemainingJellies(); break;
      case CONFIG.MODES.INGREDIENT: modeText = 'Ingredients: ' + this.board.getRemainingIngredients(); break;
    }
    ctx.font = '11px Arial';
    ctx.fillStyle = '#AAA';
    ctx.fillText(modeText, 10, 38);

    // 分数
    ctx.textAlign = 'center';
    ctx.font = 'bold 22px Arial';
    ctx.fillStyle = '#FFD700';
    ctx.fillText(this.score.toString(), w / 2, 20);

    ctx.font = '11px Arial';
    ctx.fillStyle = '#AAA';
    ctx.fillText('SCORE', w / 2, 40);

    // 步数
    ctx.textAlign = 'right';
    ctx.font = 'bold 22px Arial';
    ctx.fillStyle = this.moves <= 5 ? '#FF4444' : '#FFFFFF';
    ctx.fillText(this.moves.toString(), w - 10, 20);

    ctx.font = '11px Arial';
    ctx.fillStyle = '#AAA';
    ctx.fillText('MOVES', w - 10, 40);
  }

  _drawItems(ctx, w, h) {
    var itemY = h - 45;
    var itemSize = 36;
    var gap = 8;
    var totalWidth = 4 * itemSize + 3 * gap;
    var startX = (w - totalWidth) / 2;

    var itemDefs = [
      { key: 'hammer', label: 'Hammer', icon: '\u{1F528}' },
      { key: 'refresh', label: 'Shuffle', icon: '\u{1F500}' },
      { key: 'plus5', label: '+5 Moves', icon: '\u{2795}' },
      { key: 'colorBomb', label: 'Bomb', icon: '\u{1F48E}' }
    ];

    for (var i = 0; i < itemDefs.length; i++) {
      var def = itemDefs[i];
      var ix = startX + i * (itemSize + gap);
      var count = this.items[def.key] || 0;
      var isActive = this.activeItem === def.key;

      // 背景
      ctx.fillStyle = isActive ? 'rgba(255,215,0,0.4)' : 'rgba(255,255,255,0.1)';
      ctx.strokeStyle = isActive ? '#FFD700' : 'rgba(255,255,255,0.2)';
      ctx.lineWidth = isActive ? 2 : 1;

      // arcTo圆角矩形
      var br = 6;
      ctx.beginPath();
      ctx.moveTo(ix + br, itemY);
      ctx.lineTo(ix + itemSize - br, itemY);
      ctx.arcTo(ix + itemSize, itemY, ix + itemSize, itemY + br, br);
      ctx.lineTo(ix + itemSize, itemY + itemSize - br);
      ctx.arcTo(ix + itemSize, itemY + itemSize, ix + itemSize - br, itemY + itemSize, br);
      ctx.lineTo(ix + br, itemY + itemSize);
      ctx.arcTo(ix, itemY + itemSize, ix, itemY + itemSize - br, br);
      ctx.lineTo(ix, itemY + br);
      ctx.arcTo(ix, itemY, ix + br, itemY, br);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // 图标
      ctx.font = '18px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = count > 0 ? '#FFFFFF' : '#666';
      ctx.fillText(def.icon, ix + itemSize / 2, itemY + itemSize / 2 - 2);

      // 数量
      if (count > 0) {
        ctx.font = 'bold 10px Arial';
        ctx.fillStyle = '#FFD700';
        ctx.fillText(count.toString(), ix + itemSize - 6, itemY + 10);
      }
    }
  }

  _drawProgressBar(ctx, w) {
    var barY = 52;
    var barH = 4;
    var barW = w - 20;
    var barX = 10;

    // 背景
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.fillRect(barX, barY, barW, barH);

    // 进度
    var progress = 0;
    if (this.mode === CONFIG.MODES.SCORE) {
      progress = Math.min(1, this.score / this.targetScore);
    } else if (this.mode === CONFIG.MODES.JELLY) {
      var total = this.levelConfig && this.levelConfig.jellies ? this.levelConfig.jellies.length : 10;
      var remaining = this.board.getRemainingJellies();
      progress = Math.min(1, 1 - remaining / total);
    } else if (this.mode === CONFIG.MODES.INGREDIENT) {
      var total = this.levelConfig && this.levelConfig.ingredients ? this.levelConfig.ingredients.length : 2;
      var remaining = this.board.getRemainingIngredients();
      progress = Math.min(1, 1 - remaining / total);
    }

    // 渐变进度条
    if (progress > 0) {
      var grad = ctx.createLinearGradient(barX, 0, barX + barW * progress, 0);
      grad.addColorStop(0, '#FF8C00');
      grad.addColorStop(1, '#FFD700');
      ctx.fillStyle = grad;
      ctx.fillRect(barX, barY, barW * progress, barH);
    }

    // 星星标记（1星=50%, 2星=75%, 3星=100%）
    var stars = [0.5, 0.75, 1.0];
    for (var i = 0; i < stars.length; i++) {
      var sx = barX + barW * stars[i];
      ctx.fillStyle = progress >= stars[i] ? '#FFD700' : 'rgba(255,255,255,0.3)';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('\u2605', sx, barY - 2);
    }
  }

  _drawWinOverlay(ctx, w, h, time) {
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, 0, w, h);

    // 胜利文字
    var pulse = 1 + Math.sin(time * 0.005) * 0.05;
    ctx.font = 'bold ' + Math.round(36 * pulse) + 'px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // 描边
    ctx.strokeStyle = 'rgba(0,0,0,0.8)';
    ctx.lineWidth = 4;
    ctx.strokeText('Level Clear!', w / 2, h / 2 - 20);

    ctx.fillStyle = '#FFD700';
    ctx.fillText('Level Clear!', w / 2, h / 2 - 20);

    // 分数
    ctx.font = 'bold 20px Arial';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('Score: ' + this.score, w / 2, h / 2 + 20);

    ctx.restore();
  }

  _drawLoseOverlay(ctx, w, h) {
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, 0, w, h);

    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.strokeStyle = 'rgba(0,0,0,0.8)';
    ctx.lineWidth = 4;
    ctx.strokeText('No More Moves!', w / 2, h / 2 - 20);

    ctx.fillStyle = '#FF4444';
    ctx.fillText('No More Moves!', w / 2, h / 2 - 20);

    ctx.font = 'bold 18px Arial';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('Score: ' + this.score, w / 2, h / 2 + 20);

    ctx.restore();
  }

  _drawPauseOverlay(ctx, w, h) {
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, 0, w, h);

    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('PAUSED', w / 2, h / 2);

    ctx.restore();
  }

  _drawItemHint(ctx, w, h, time) {
    var pulse = 0.7 + Math.sin(time * 0.006) * 0.3;
    ctx.save();
    ctx.globalAlpha = pulse;
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFD700';
    var hintText = '';
    switch (this.activeItem) {
      case 'hammer': hintText = 'Tap a candy to remove it'; break;
      case 'colorBomb': hintText = 'Tap a candy to make it a Color Bomb'; break;
    }
    if (hintText) {
      ctx.fillText(hintText, w / 2, this.boardOffsetY - 10);
    }
    ctx.restore();
  }

  // ---- 游戏循环 ----

  _gameLoop(timestamp) {
    if (this.paused) return;

    var dt = timestamp - this.lastTime;
    this.lastTime = timestamp;

    // 限制dt防止大跳帧
    if (dt > 100) dt = 16;

    // 更新
    this.animations.update(dt);
    this.particles.update(dt);

    // 渲染
    this.render();

    // 继续循环
    this.rafId = requestAnimationFrame(this._gameLoop.bind(this));
  }

  // ---- 公共方法 ----

  /** 处理触摸/点击（供外部调用） */
  handleTouch(x, y) {
    var cell = this._pixelToCell(x, y);
    if (cell) {
      this._handleClick(cell);
    }
  }

  /** 获取当前状态 */
  getState() {
    return {
      score: this.score,
      moves: this.moves,
      level: this.level,
      mode: this.mode,
      state: this.state,
      combo: this.combo,
      items: this.items
    };
  }

  /** 设置分数回调 */
  setOnScoreUpdate(callback) {
    this.onScoreUpdate = callback;
  }

  /** 设置步数回调 */
  setOnMovesUpdate(callback) {
    this.onMovesUpdate = callback;
  }

  /** 设置胜利回调 */
  setOnWin(callback) {
    this.onWin = callback;
  }

  /** 设置失败回调 */
  setOnLose(callback) {
    this.onLose = callback;
  }

  /** 添加道具 */
  addItem(itemName, count) {
    if (this.items.hasOwnProperty(itemName)) {
      this.items[itemName] += (count || 1);
    }
  }

  /** 销毁游戏 */
  destroy() {
    this.exit();
    this.animations.clearAll();
    this.particles.clearAll();
  }
}


// ===== main.js =====
/**
 * 开心消消乐 - 主入口
 * 初始化所有系统，启动游戏循环
 */

(function() {
  'use strict';

  // 屏幕适配
  const DESIGN_WIDTH = 480;
  const DESIGN_HEIGHT = 800;

  let canvas, ctx;
  let scale = 1;
  let offsetX = 0, offsetY = 0;
  let ui;
  let lastTime = 0;

  function init() {
    // 创建Canvas
    canvas = document.createElement('canvas');
    canvas.id = 'gameCanvas';
    document.body.appendChild(canvas);

    // 适配屏幕
    resize();
    window.addEventListener('resize', resize);

    ctx = canvas.getContext('2d');

    // 加载存档
    const saveData = Storage.load();

    // 初始化UI
    ui = new UIManager(canvas);
    ui.saveData = saveData;

    // 初始化音效
    if (typeof SoundManager !== 'undefined') {
      SoundManager.init();
      if (saveData.soundEnabled) {
        SoundManager.enable();
      } else {
        SoundManager.disable();
      }
    }

    // 触摸/鼠标事件
    canvas.addEventListener('mousedown', onPointerDown);
    canvas.addEventListener('mousemove', onPointerMove);
    canvas.addEventListener('mouseup', onPointerUp);
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd, { passive: false });

    // 开始游戏循环
    requestAnimationFrame(gameLoop);

    console.log('开心消消乐 已启动！');
  }

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;

    scale = Math.min(w / DESIGN_WIDTH, h / DESIGN_HEIGHT);
    offsetX = (w - DESIGN_WIDTH * scale) / 2;
    offsetY = (h - DESIGN_HEIGHT * scale) / 2;

    canvas.width = DESIGN_WIDTH * dpr;
    canvas.height = DESIGN_HEIGHT * dpr;
    canvas.style.width = DESIGN_WIDTH * scale + 'px';
    canvas.style.height = DESIGN_HEIGHT * scale + 'px';

    if (ctx) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  }

  function getCanvasPos(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (clientX - rect.left) / scale,
      y: (clientY - rect.top) / scale
    };
  }

  function onPointerDown(e) {
    const pos = getCanvasPos(e.clientX, e.clientY);
    ui.handleClick(pos.x, pos.y);
  }

  function onPointerMove(e) {
    const pos = getCanvasPos(e.clientX, e.clientY);
    ui.handleHover(pos.x, pos.y);
  }

  function onPointerUp(e) {
    ui.handleRelease();
  }

  function onTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const pos = getCanvasPos(touch.clientX, touch.clientY);
    ui.handleClick(pos.x, pos.y);
  }

  function onTouchMove(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const pos = getCanvasPos(touch.clientX, touch.clientY);
    ui.handleHover(pos.x, pos.y);
  }

  function onTouchEnd(e) {
    e.preventDefault();
    ui.handleRelease();
  }

  function gameLoop(timestamp) {
    const dt = timestamp - lastTime;
    lastTime = timestamp;

    // 清空
    ctx.clearRect(0, 0, DESIGN_WIDTH, DESIGN_HEIGHT);

    // 更新和渲染UI
    if (ui.update) ui.update(dt);
    ui.render();

    requestAnimationFrame(gameLoop);
  }

  // 启动
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // 暴露到全局
  window.HappyMatch = { init, ui };
})();


