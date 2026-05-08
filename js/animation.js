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
