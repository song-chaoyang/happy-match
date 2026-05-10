// ============================================================
// ui.js - 萌趣消消 UI界面管理器
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

    if (screen === 'game') {
      // 初始化游戏（如果还未初始化）
      if (!this.game) {
        this.game = new Game(this.canvas);
        this.game.ui = this;
      }
      // 如果没有活动关卡，自动开始第1关
      if (!this.game.board || this.game.state === 'idle') {
        this.game.startLevel(1);
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
        text: '返回', color: 'rgba(255,255,255,0.2)',
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
    ctx.fillText('萌趣消消', w / 2 + 2, titleY + 2);

    // 标题金色渐变
    var titleGrad = ctx.createLinearGradient(w / 2 - 100, titleY - 20, w / 2 + 100, titleY + 20);
    titleGrad.addColorStop(0, '#FFD700');
    titleGrad.addColorStop(0.3, '#FFF8DC');
    titleGrad.addColorStop(0.5, '#FFD700');
    titleGrad.addColorStop(0.7, '#FFF8DC');
    titleGrad.addColorStop(1, '#FFD700');
    ctx.fillStyle = titleGrad;
    ctx.fillText('萌趣消消', w / 2, titleY);

    // 标题描边
    ctx.strokeStyle = '#DAA520';
    ctx.lineWidth = 1.5;
    ctx.strokeText('萌趣消消', w / 2, titleY);
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
      text: '开始游戏', color: '#4CAF50',
      fontSize: 18, bold: true, radius: 14,
      action: function() { this.setScreen('map'); }.bind(this)
    });

    this._addButton({
      x: btnX, y: startBtnY + 58, w: btnW, h: btnH,
      text: '\u5173\u5361\u5730\u56FE', color: '#FF8C00',
      fontSize: 16, bold: true, radius: 14,
      action: function() { this.setScreen('map'); }.bind(this)
    });

    this._addButton({
      x: btnX, y: startBtnY + 116, w: btnW, h: btnH,
      text: '\u5546\u57CE', color: '#4169E1',
      fontSize: 16, bold: true, radius: 14,
      action: function() { this.setScreen('shop'); }.bind(this)
    });

    this._addButton({
      x: btnX, y: startBtnY + 174, w: btnW, h: btnH,
      text: '\u6BCF\u65E5\u5956\u52B1', color: '#9370DB',
      fontSize: 16, bold: true, radius: 14,
      action: function() { this.setScreen('daily'); }.bind(this)
    });

    this._addButton({
      x: btnX, y: startBtnY + 232, w: btnW, h: 40,
      text: '设置', color: '#888888',
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
          text: itm.price + '💰', color: '#FF8C00',
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
      ctx.fillText(chest.price + ' 💰', cx + 70, y + 65);

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
                title: '\u5F00\u542F\u5B9D\u7BB1',
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
        var btnText = spec.price === 0 ? '\u514D\u8D39' : (spec.price + '💰');
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
    ctx.fillText('\u6BCF\u65E5\u5956\u52B1', w / 2, 35);

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
        text: '\u9886\u53D6\u5956\u52B1', color: '#FF8C00',
        fontSize: 18, bold: true, radius: 14,
        action: function() {
          var result = Storage.claimDailyReward();
          if (result) {
            this.saveData = Storage.load();
            this.popup = {
              title: '\u9886\u53D6\u6210\u529F\uFF01',
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
      text: '继续游戏', color: '#4CAF50',
      fontSize: 15, bold: true, radius: 10,
      action: function() {
        if (this.game) this.game.resume();
        this.setScreen('game');
      }.bind(this)
    });

    var soundText = '🔊 \u97F3\u6548 ' + (this.saveData.soundEnabled ? '\u5F00' : '\u5173');
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
      text: '🔄 \u91CD\u65B0\u5F00\u59CB', color: '#FF8C00',
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
      text: '下一关', color: '#4CAF50',
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
      text: '\u8FD4\u56DE\u5730\u56FE', color: '#FF8C00',
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
      text: '🔄 \u518D\u8BD5\u4E00\u6B21', color: '#FF8C00',
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
      text: '\u8FD4\u56DE\u5730\u56FE', color: '#888',
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
    ctx.fillText('设置', w / 2, 35);

    // 设置项
    var data = this.saveData;
    var startY = 70;
    var itemH = 50;
    var gap = 5;

    // 音效开关
    this._drawSettingToggle(ctx, w, startY, '🔊 \u97F3\u6548', data.soundEnabled, function(val) {
      data.soundEnabled = val;
      Storage.save(data);
      this.saveData = data;
    }.bind(this));

    // 音乐开关
    this._drawSettingToggle(ctx, w, startY + itemH + gap, '🎵 \u97F3\u4E50', data.musicEnabled, function(val) {
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
