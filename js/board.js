// ============================================================
// board.js - 萌趣消消 棋盘核心逻辑
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
