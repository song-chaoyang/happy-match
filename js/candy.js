// ============================================================
// candy.js - 萌趣三消 方块精灵绘制
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
