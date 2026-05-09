// ============================================================
// shop.js - 萌趣消消 商城数据
// ============================================================

var ShopData = {
  // ---- 道具列表 ----
  items: [
    {
      id: 'hammer',
      name: '锤子',
      desc: '消除任意一个方块',
      price: 100,
      icon: '锤',
      color: '#FF6B35'
    },
    {
      id: 'refresh',
      name: '刷新',
      desc: '重新排列所有方块',
      price: 80,
      icon: '刷',
      color: '#4169E1'
    },
    {
      id: 'plus5',
      name: '+5步',
      desc: '增加5步',
      price: 50,
      icon: '+5',
      color: '#32CD32'
    },
    {
      id: 'colorBomb',
      name: '彩色球',
      desc: '消除所有同色方块',
      price: 200,
      icon: '彩',
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
      icon: '锤',
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
      icon: '礼',
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
      icon: '全',
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
      icon: '小',
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
      icon: '大',
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
      icon: '豪',
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
      icon: '新',
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
      icon: '日',
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
      icon: '末',
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
      icon: '金',
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
    { day: 1, reward: { type: 'coins', amount: 100 }, icon: '金', name: '100金币' },
    { day: 2, reward: { type: 'item', id: 'hammer', count: 1 }, icon: '锤', name: '锤子x1' },
    { day: 3, reward: { type: 'coins', amount: 200 }, icon: '金', name: '200金币' },
    { day: 4, reward: { type: 'item', id: 'plus5', count: 2 }, icon: '+5', name: '+5步x2' },
    { day: 5, reward: { type: 'item', id: 'colorBomb', count: 1 }, icon: '彩', name: '彩色球x1' },
    { day: 6, reward: { type: 'coins', amount: 500 }, icon: '金', name: '500金币' },
    { day: 7, reward: { type: 'bundle', id: 'bundle2' }, icon: '礼', name: '全套道具x1' }
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

  /** 获取每日奖励信息 */
  getDailyReward: function(day) {
    for (var i = 0; i < this.dailyRewards.length; i++) {
      if (this.dailyRewards[i].day === day) return this.dailyRewards[i];
    }
    return null;
  },

  /** 购买道具 */
  purchaseItem: function(itemId, count) {
    var item = this.getItemById(itemId);
    if (!item) return { success: false, message: '道具不存在' };
    
    var totalPrice = item.price * count;
    if (this.saveData.coins < totalPrice) {
      return { success: false, message: '金币不足' };
    }
    
    this.saveData.coins -= totalPrice;
    this.saveData.items[itemId] = (this.saveData.items[itemId] || 0) + count;
    Storage.save(this.saveData);
    
    return { success: true, message: '购买成功', item: item, count: count };
  },

  /** 购买套餐 */
  purchaseBundle: function(bundleId) {
    var bundle = this.getBundleById(bundleId);
    if (!bundle) return { success: false, message: '套餐不存在' };
    
    if (this.saveData.coins < bundle.price) {
      return { success: false, message: '金币不足' };
    }
    
    this.saveData.coins -= bundle.price;
    for (var i = 0; i < bundle.items.length; i++) {
      var item = bundle.items[i];
      this.saveData.items[item.id] = (this.saveData.items[item.id] || 0) + item.count;
    }
    Storage.save(this.saveData);
    
    return { success: true, message: '购买成功', bundle: bundle };
  },

  /** 购买宝箱 */
  purchaseChest: function(chestId) {
    var chest = this.getChestById(chestId);
    if (!chest) return { success: false, message: '宝箱不存在' };
    
    if (this.saveData.coins < chest.price) {
      return { success: false, message: '金币不足' };
    }
    
    this.saveData.coins -= chest.price;
    
    // 随机选择一个奖励
    var rewardIndex = Math.floor(Math.random() * chest.rewards.length);
    var reward = chest.rewards[rewardIndex];
    
    for (var i = 0; i < reward.items.length; i++) {
      var item = reward.items[i];
      this.saveData.items[item.id] = (this.saveData.items[item.id] || 0) + item.count;
    }
    Storage.save(this.saveData);
    
    return { success: true, message: '开启成功', chest: chest, reward: reward };
  },

  /** 购买特惠 */
  purchaseSpecial: function(specialId) {
    var special = this.getSpecialById(specialId);
    if (!special) return { success: false, message: '特惠不存在' };
    
    if (special.condition === 'firstPurchase' && this.saveData.hasPurchased) {
      return { success: false, message: '仅限首次购买' };
    }
    
    if (special.condition === 'free') {
      // 免费礼包
      if (special.coinReward) {
        this.saveData.coins += special.coinReward;
      }
      if (special.bonusItem) {
        this.saveData.items[special.bonusItem.id] = (this.saveData.items[special.bonusItem.id] || 0) + special.bonusItem.count;
      }
      Storage.save(this.saveData);
      return { success: true, message: '领取成功', special: special };
    }
    
    if (this.saveData.coins < special.price) {
      return { success: false, message: '金币不足' };
    }
    
    this.saveData.coins -= special.price;
    for (var i = 0; i < special.items.length; i++) {
      var item = special.items[i];
      this.saveData.items[item.id] = (this.saveData.items[item.id] || 0) + item.count;
    }
    
    if (special.condition === 'firstPurchase') {
      this.saveData.hasPurchased = true;
    }
    Storage.save(this.saveData);
    
    return { success: true, message: '购买成功', special: special };
  },

  /** 领取每日奖励 */
  claimDailyReward: function(day) {
    var reward = this.getDailyReward(day);
    if (!reward) return { success: false, message: '奖励不存在' };
    
    if (reward.reward.type === 'coins') {
      this.saveData.coins += reward.reward.amount;
    } else if (reward.reward.type === 'item') {
      this.saveData.items[reward.reward.id] = (this.saveData.items[reward.reward.id] || 0) + reward.reward.count;
    } else if (reward.reward.type === 'bundle') {
      var bundle = this.getBundleById(reward.reward.id);
      if (bundle) {
        for (var i = 0; i < bundle.items.length; i++) {
          var item = bundle.items[i];
          this.saveData.items[item.id] = (this.saveData.items[item.id] || 0) + item.count;
        }
      }
    }
    
    Storage.save(this.saveData);
    return { success: true, message: '领取成功', reward: reward };
  }
};
