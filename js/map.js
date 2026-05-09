// ============================================================
// map.js - 萌趣三消 关卡地图数据（50关）
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
