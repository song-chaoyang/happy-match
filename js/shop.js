// ============================================================
// shop.js - 萌趣三消 商城数据
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
