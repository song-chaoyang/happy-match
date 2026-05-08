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
