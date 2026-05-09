// ============================================================
// storage.js - 萌趣消消 本地存储管理
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
