/**
 * 萌趣三消 - 主入口
 * 初始化所有系统，启动游戏循环
 */

(function() {
  'use strict';

  // 屏幕适配
  const DESIGN_WIDTH = 480;
  const DESIGN_HEIGHT = 800;

  let canvas, ctx;
  let scale = 1;
  let offsetX = 0, offsetY = 0;
  let ui;
  let lastTime = 0;

  function init() {
    // 创建Canvas
    canvas = document.createElement('canvas');
    canvas.id = 'gameCanvas';
    document.body.appendChild(canvas);

    // 适配屏幕
    resize();
    window.addEventListener('resize', resize);

    ctx = canvas.getContext('2d');

    // 加载存档
    const saveData = Storage.load();

    // 初始化UI
    ui = new UIManager(canvas);
    ui.saveData = saveData;

    // 初始化音效
    if (typeof SoundManager !== 'undefined') {
      SoundManager.init();
      if (saveData.soundEnabled) {
        SoundManager.enable();
      } else {
        SoundManager.disable();
      }
    }

    // 触摸/鼠标事件
    canvas.addEventListener('mousedown', onPointerDown);
    canvas.addEventListener('mousemove', onPointerMove);
    canvas.addEventListener('mouseup', onPointerUp);
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd, { passive: false });

    // 开始游戏循环
    requestAnimationFrame(gameLoop);

    console.log('萌趣三消 已启动！');
  }

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;

    scale = Math.min(w / DESIGN_WIDTH, h / DESIGN_HEIGHT);
    offsetX = (w - DESIGN_WIDTH * scale) / 2;
    offsetY = (h - DESIGN_HEIGHT * scale) / 2;

    canvas.width = DESIGN_WIDTH * dpr;
    canvas.height = DESIGN_HEIGHT * dpr;
    canvas.style.width = DESIGN_WIDTH * scale + 'px';
    canvas.style.height = DESIGN_HEIGHT * scale + 'px';

    if (ctx) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  }

  function getCanvasPos(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (clientX - rect.left) / scale,
      y: (clientY - rect.top) / scale
    };
  }

  function onPointerDown(e) {
    const pos = getCanvasPos(e.clientX, e.clientY);
    ui.handleClick(pos.x, pos.y);
  }

  function onPointerMove(e) {
    const pos = getCanvasPos(e.clientX, e.clientY);
    ui.handleHover(pos.x, pos.y);
  }

  function onPointerUp(e) {
    ui.handleRelease();
  }

  function onTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const pos = getCanvasPos(touch.clientX, touch.clientY);
    ui.handleClick(pos.x, pos.y);
  }

  function onTouchMove(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const pos = getCanvasPos(touch.clientX, touch.clientY);
    ui.handleHover(pos.x, pos.y);
  }

  function onTouchEnd(e) {
    e.preventDefault();
    ui.handleRelease();
  }

  function gameLoop(timestamp) {
    const dt = timestamp - lastTime;
    lastTime = timestamp;

    // 清空
    ctx.clearRect(0, 0, DESIGN_WIDTH, DESIGN_HEIGHT);

    // 更新和渲染UI
    if (ui.update) ui.update(dt);
    ui.render();

    requestAnimationFrame(gameLoop);
  }

  // 启动
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // 暴露到全局
  window.HappyMatch = { init, getUI: function() { return ui; } };
})();
