// ============================================================
// sound.js - 开心消消乐 音效系统（Web Audio API）
// ============================================================

var SoundManager = (function() {
  'use strict';

  var _ctx = null;
  var _enabled = true;
  var _volume = 0.5;
  var _masterGain = null;
  var _initialized = false;

  // 音符频率表
  var NOTES = {
    C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23,
    G4: 392.00, A4: 440.00, B4: 493.88,
    C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46,
    G5: 783.99, A5: 880.00, B5: 987.77,
    C6: 1046.50
  };

  // ---- 初始化 ----

  function init() {
    if (_initialized) return;

    try {
      var AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) {
        console.warn('Web Audio API not supported');
        return;
      }
      _ctx = new AudioContext();
      _masterGain = _ctx.createGain();
      _masterGain.gain.value = _volume;
      _masterGain.connect(_ctx.destination);
      _initialized = true;
    } catch (e) {
      console.warn('Failed to initialize Web Audio API:', e);
    }
  }

  /** 确保AudioContext已恢复（需要用户交互后调用） */
  function resume() {
    if (_ctx && _ctx.state === 'suspended') {
      _ctx.resume();
    }
  }

  // ---- 工具方法 ----

  /** 创建振荡器 */
  function createOsc(type, freq, duration, gainValue, startDelay) {
    if (!_ctx || !_enabled) return;

    var osc = _ctx.createOscillator();
    var gain = _ctx.createGain();

    osc.type = type || 'sine';
    osc.frequency.value = freq;

    gain.gain.setValueAtTime(gainValue || 0.3, _ctx.currentTime + (startDelay || 0));
    gain.gain.exponentialRampToValueAtTime(0.001, _ctx.currentTime + (startDelay || 0) + duration);

    osc.connect(gain);
    gain.connect(_masterGain);

    osc.start(_ctx.currentTime + (startDelay || 0));
    osc.stop(_ctx.currentTime + (startDelay || 0) + duration);
  }

  /** 播放音符序列 */
  function playNotes(notes, type, noteDuration, gainValue) {
    if (!_ctx || !_enabled) return;

    for (var i = 0; i < notes.length; i++) {
      createOsc(type, notes[i], noteDuration || 0.15, gainValue || 0.2, i * (noteDuration || 0.15) * 0.8);
    }
  }

  /** 创建噪声 */
  function createNoise(duration, gainValue) {
    if (!_ctx || !_enabled) return;

    var bufferSize = _ctx.sampleRate * duration;
    var buffer = _ctx.createBuffer(1, bufferSize, _ctx.sampleRate);
    var data = buffer.getChannelData(0);

    for (var i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.5;
    }

    var source = _ctx.createBufferSource();
    source.buffer = buffer;

    var gain = _ctx.createGain();
    gain.gain.setValueAtTime(gainValue || 0.1, _ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, _ctx.currentTime + duration);

    // 高通滤波器让噪声更柔和
    var filter = _ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 3000;

    source.connect(filter);
    filter.connect(gain);
    gain.connect(_masterGain);

    source.start();
    source.stop(_ctx.currentTime + duration);
  }

  // ---- 音效定义 ----

  /**
   * 消除音效（不同连击不同音调）
   * @param {number} combo - 连击数
   */
  function playMatch(combo) {
    init();
    resume();

    combo = combo || 0;

    // 音调随连击升高
    var baseNotes = [
      [NOTES.C5, NOTES.E5],           // combo 0
      [NOTES.D5, NOTES.F5],           // combo 1
      [NOTES.E5, NOTES.G5],           // combo 2
      [NOTES.F5, NOTES.A5],           // combo 3
      [NOTES.G5, NOTES.B5],           // combo 4
      [NOTES.A5, NOTES.C6],           // combo 5+
    ];

    var noteIndex = Math.min(combo, baseNotes.length - 1);
    var notes = baseNotes[noteIndex];

    // 主音
    playNotes(notes, 'sine', 0.12, 0.25);

    // 和声
    var harmonyNotes = notes.map(function(n) { return n * 1.5; });
    playNotes(harmonyNotes, 'triangle', 0.1, 0.1);

    // 轻微噪声
    createNoise(0.08, 0.05);
  }

  /**
   * 特殊方块消除音效
   * @param {string} specialType - 特殊方块类型
   */
  function playSpecial(specialType) {
    init();
    resume();

    switch (specialType) {
      case CONFIG.SPECIAL.STRIPED_H:
      case CONFIG.SPECIAL.STRIPED_V:
        // 条纹糖果：上升音阶
        playNotes([NOTES.C5, NOTES.D5, NOTES.E5, NOTES.F5, NOTES.G5], 'square', 0.08, 0.15);
        createNoise(0.15, 0.08);
        break;

      case CONFIG.SPECIAL.WRAPPED:
        // 包装糖果：爆炸声
        createOsc('sine', 150, 0.3, 0.3);
        createOsc('sine', 200, 0.2, 0.2, 0.05);
        createNoise(0.2, 0.15);
        break;

      case CONFIG.SPECIAL.COLOR_BOMB:
        // 彩色球：华丽音效
        playNotes([NOTES.C5, NOTES.E5, NOTES.G5, NOTES.C6], 'sine', 0.15, 0.2);
        playNotes([NOTES.E5, NOTES.G5, NOTES.C6, NOTES.E6], 'triangle', 0.15, 0.15, 0.05);
        createNoise(0.3, 0.1);
        break;

      case CONFIG.SPECIAL.RAINBOW:
        // 彩虹球：超级华丽
        playNotes([NOTES.C5, NOTES.D5, NOTES.E5, NOTES.F5, NOTES.G5, NOTES.A5, NOTES.B5, NOTES.C6], 'sine', 0.1, 0.2);
        playNotes([NOTES.C6, NOTES.B5, NOTES.A5, NOTES.G5, NOTES.F5, NOTES.E5, NOTES.D5, NOTES.C5], 'triangle', 0.1, 0.15, 0.1);
        createOsc('sine', 800, 0.5, 0.15, 0.2);
        createNoise(0.4, 0.12);
        break;
    }
  }

  /**
   * 交换音效
   * @param {boolean} isValid - 是否有效交换
   */
  function playSwap(isValid) {
    init();
    resume();

    if (isValid) {
      // 有效交换：清脆的点击声
      createOsc('sine', NOTES.C5, 0.08, 0.2);
      createOsc('sine', NOTES.E5, 0.06, 0.15, 0.03);
    } else {
      // 无效交换：低沉的嗡嗡声
      createOsc('sine', NOTES.C4, 0.15, 0.15);
      createOsc('sine', NOTES.B3, 0.15, 0.1, 0.05);
    }
  }

  /**
   * 下落音效
   */
  function playFall() {
    init();
    resume();
    createOsc('sine', 400, 0.06, 0.08);
  }

  /**
   * 失败音效
   */
  function playFail() {
    init();
    resume();

    // 下降音阶
    playNotes([NOTES.E5, NOTES.D5, NOTES.C5, NOTES.B4, NOTES.A4], 'sine', 0.2, 0.2);
    createOsc('triangle', NOTES.A3, 0.5, 0.15, 0.5);
  }

  /**
   * 胜利音效
   */
  function playWin() {
    init();
    resume();

    // 上升欢快音阶
    var winNotes = [
      NOTES.C5, NOTES.E5, NOTES.G5, NOTES.C6,
      NOTES.E5, NOTES.G5, NOTES.C6, NOTES.E6
    ];
    playNotes(winNotes, 'sine', 0.12, 0.2);

    // 和声
    var harmonyNotes = [
      NOTES.E5, NOTES.G5, NOTES.C6, NOTES.E6,
      NOTES.G5, NOTES.C6, NOTES.E6, NOTES.G6
    ];
    playNotes(harmonyNotes, 'triangle', 0.12, 0.12, 0.05);

    // 最后的长音
    createOsc('sine', NOTES.C6, 0.6, 0.2, 0.8);
    createOsc('triangle', NOTES.E6, 0.6, 0.15, 0.8);
    createOsc('sine', NOTES.G6, 0.6, 0.1, 0.8);

    // 庆祝噪声
    createNoise(0.3, 0.08);
    createNoise(0.2, 0.06, 0.4);
  }

  /**
   * 按钮点击音效
   */
  function playClick() {
    init();
    resume();
    createOsc('sine', NOTES.G5, 0.05, 0.15);
  }

  /**
   * 洗牌音效
   */
  function playShuffle() {
    init();
    resume();

    // 快速随机音
    for (var i = 0; i < 8; i++) {
      var freq = 300 + Math.random() * 600;
      createOsc('sine', freq, 0.06, 0.1, i * 0.04);
    }
  }

  /**
   * 道具使用音效
   */
  function playItem() {
    init();
    resume();

    playNotes([NOTES.G5, NOTES.A5, NOTES.B5, NOTES.C6], 'sine', 0.1, 0.2);
    createOsc('triangle', NOTES.C6, 0.3, 0.15, 0.3);
  }

  /**
   * 连击音效
   * @param {number} combo - 连击数
   */
  function playCombo(combo) {
    init();
    resume();

    if (combo < 2) return;

    // 连击越高越华丽
    var intensity = Math.min(combo, 6);

    for (var i = 0; i < intensity; i++) {
      var freq = NOTES.C5 * Math.pow(2, i / 6);
      createOsc('sine', freq, 0.15, 0.15, i * 0.05);
      createOsc('triangle', freq * 1.5, 0.1, 0.08, i * 0.05 + 0.02);
    }
  }

  /**
   * 新关卡开始音效
   */
  function playLevelStart() {
    init();
    resume();

    playNotes([NOTES.C5, NOTES.E5, NOTES.G5], 'sine', 0.15, 0.2);
    createOsc('triangle', NOTES.C5, 0.4, 0.15, 0.3);
  }

  // ---- 公共API ----

  return {
    init: init,
    resume: resume,

    playMatch: playMatch,
    playSpecial: playSpecial,
    playSwap: playSwap,
    playFall: playFall,
    playFail: playFail,
    playWin: playWin,
    playClick: playClick,
    playShuffle: playShuffle,
    playItem: playItem,
    playCombo: playCombo,
    playLevelStart: playLevelStart,

    /** 设置音量 0-1 */
    setVolume: function(vol) {
      _volume = Math.max(0, Math.min(1, vol));
      if (_masterGain) {
        _masterGain.gain.value = _volume;
      }
    },

    /** 获取音量 */
    getVolume: function() {
      return _volume;
    },

    /** 开启音效 */
    enable: function() {
      _enabled = true;
      init();
      resume();
    },

    /** 关闭音效 */
    disable: function() {
      _enabled = false;
    },

    /** 是否开启 */
    isEnabled: function() {
      return _enabled;
    },

    /** 是否已初始化 */
    isInitialized: function() {
      return _initialized;
    }
  };
})();
