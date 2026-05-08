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
