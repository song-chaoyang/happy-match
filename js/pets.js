// ============================================================
// pets.js - 萌趣消消 宠物系统
// ============================================================

var Pets = {
  list: [
    {
      id: 'fox',
      name: '小狐狸',
      color: '#FF6B35',
      bodyColor: '#FF8C5A',
      earColor: '#E85D26',
      bellyColor: '#FFF5E6',
      skill: '每消除10个方块，随机消除1个方块',
      skillType: 'auto_remove',
      unlockLevel: 1,
      draw: function(ctx, x, y, size) {
        var s = size || 64;
        var cx = x + s / 2;
        var cy = y + s / 2;
        var r = s * 0.42;

        // 尖耳朵
        ctx.save();
        ctx.fillStyle = this.earColor;
        // 左耳
        ctx.beginPath();
        ctx.moveTo(cx - r * 0.7, cy - r * 0.3);
        ctx.lineTo(cx - r * 0.9, cy - r * 1.2);
        ctx.lineTo(cx - r * 0.1, cy - r * 0.7);
        ctx.closePath();
        ctx.fill();
        // 右耳
        ctx.beginPath();
        ctx.moveTo(cx + r * 0.7, cy - r * 0.3);
        ctx.lineTo(cx + r * 0.9, cy - r * 1.2);
        ctx.lineTo(cx + r * 0.1, cy - r * 0.7);
        ctx.closePath();
        ctx.fill();

        // 耳朵内部
        ctx.fillStyle = '#FFB88C';
        ctx.beginPath();
        ctx.moveTo(cx - r * 0.6, cy - r * 0.4);
        ctx.lineTo(cx - r * 0.75, cy - r * 0.95);
        ctx.lineTo(cx - r * 0.2, cy - r * 0.65);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx + r * 0.6, cy - r * 0.4);
        ctx.lineTo(cx + r * 0.75, cy - r * 0.95);
        ctx.lineTo(cx + r * 0.2, cy - r * 0.65);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // 脸部（圆形）
        ctx.save();
        ctx.fillStyle = this.bodyColor;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();

        // 白色脸部区域
        ctx.fillStyle = this.bellyColor;
        ctx.beginPath();
        ctx.ellipse(cx, cy + r * 0.15, r * 0.6, r * 0.55, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 眼睛
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.ellipse(cx - r * 0.3, cy - r * 0.1, r * 0.12, r * 0.15, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(cx + r * 0.3, cy - r * 0.1, r * 0.12, r * 0.15, 0, 0, Math.PI * 2);
        ctx.fill();

        // 眼睛高光
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.arc(cx - r * 0.25, cy - r * 0.18, r * 0.05, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx + r * 0.35, cy - r * 0.18, r * 0.05, 0, Math.PI * 2);
        ctx.fill();

        // 鼻子
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.ellipse(cx, cy + r * 0.15, r * 0.08, r * 0.06, 0, 0, Math.PI * 2);
        ctx.fill();

        // 微笑嘴巴
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(cx, cy + r * 0.2, r * 0.2, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.stroke();

        // 脸颊红晕
        ctx.fillStyle = 'rgba(255,150,150,0.35)';
        ctx.beginPath();
        ctx.ellipse(cx - r * 0.55, cy + r * 0.1, r * 0.12, r * 0.08, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(cx + r * 0.55, cy + r * 0.1, r * 0.12, r * 0.08, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    },
    {
      id: 'cat',
      name: '小猫咪',
      color: '#FFB347',
      bodyColor: '#FFD699',
      earColor: '#FF9F1C',
      bellyColor: '#FFF5E6',
      skill: '每5步恢复1步',
      skillType: 'add_move',
      unlockLevel: 10,
      draw: function(ctx, x, y, size) {
        var s = size || 64;
        var cx = x + s / 2;
        var cy = y + s / 2;
        var r = s * 0.42;

        // 三角耳朵
        ctx.save();
        ctx.fillStyle = this.earColor;
        // 左耳
        ctx.beginPath();
        ctx.moveTo(cx - r * 0.8, cy - r * 0.4);
        ctx.lineTo(cx - r * 0.5, cy - r * 1.3);
        ctx.lineTo(cx - r * 0.05, cy - r * 0.6);
        ctx.closePath();
        ctx.fill();
        // 右耳
        ctx.beginPath();
        ctx.moveTo(cx + r * 0.8, cy - r * 0.4);
        ctx.lineTo(cx + r * 0.5, cy - r * 1.3);
        ctx.lineTo(cx + r * 0.05, cy - r * 0.6);
        ctx.closePath();
        ctx.fill();

        // 耳朵内部（粉色）
        ctx.fillStyle = '#FFB5B5';
        ctx.beginPath();
        ctx.moveTo(cx - r * 0.65, cy - r * 0.45);
        ctx.lineTo(cx - r * 0.48, cy - r * 1.05);
        ctx.lineTo(cx - r * 0.15, cy - r * 0.6);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx + r * 0.65, cy - r * 0.45);
        ctx.lineTo(cx + r * 0.48, cy - r * 1.05);
        ctx.lineTo(cx + r * 0.15, cy - r * 0.6);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // 脸部
        ctx.save();
        ctx.fillStyle = this.bodyColor;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 眼睛（猫眼形状）
        ctx.save();
        ctx.fillStyle = '#4CAF50';
        // 左眼
        ctx.beginPath();
        ctx.ellipse(cx - r * 0.3, cy - r * 0.1, r * 0.14, r * 0.16, 0, 0, Math.PI * 2);
        ctx.fill();
        // 竖瞳孔
        ctx.fillStyle = '#222';
        ctx.beginPath();
        ctx.ellipse(cx - r * 0.3, cy - r * 0.1, r * 0.04, r * 0.14, 0, 0, Math.PI * 2);
        ctx.fill();
        // 右眼
        ctx.fillStyle = '#4CAF50';
        ctx.beginPath();
        ctx.ellipse(cx + r * 0.3, cy - r * 0.1, r * 0.14, r * 0.16, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#222';
        ctx.beginPath();
        ctx.ellipse(cx + r * 0.3, cy - r * 0.1, r * 0.04, r * 0.14, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 眼睛高光
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.arc(cx - r * 0.25, cy - r * 0.18, r * 0.04, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx + r * 0.35, cy - r * 0.18, r * 0.04, 0, Math.PI * 2);
        ctx.fill();

        // 鼻子（倒三角）
        ctx.fillStyle = '#FFB5B5';
        ctx.beginPath();
        ctx.moveTo(cx, cy + r * 0.08);
        ctx.lineTo(cx - r * 0.08, cy + r * 0.18);
        ctx.lineTo(cx + r * 0.08, cy + r * 0.18);
        ctx.closePath();
        ctx.fill();

        // 嘴巴
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(cx, cy + r * 0.18);
        ctx.lineTo(cx, cy + r * 0.28);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx - r * 0.12, cy + r * 0.32, r * 0.12, 1.1 * Math.PI, 1.7 * Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx + r * 0.12, cy + r * 0.32, r * 0.12, 1.3 * Math.PI, 1.9 * Math.PI);
        ctx.stroke();

        // 胡须
        ctx.strokeStyle = '#999';
        ctx.lineWidth = 1;
        // 左胡须
        ctx.beginPath();
        ctx.moveTo(cx - r * 0.3, cy + r * 0.2);
        ctx.lineTo(cx - r * 0.9, cy + r * 0.1);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx - r * 0.3, cy + r * 0.3);
        ctx.lineTo(cx - r * 0.9, cy + r * 0.35);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx - r * 0.3, cy + r * 0.4);
        ctx.lineTo(cx - r * 0.85, cy + r * 0.55);
        ctx.stroke();
        // 右胡须
        ctx.beginPath();
        ctx.moveTo(cx + r * 0.3, cy + r * 0.2);
        ctx.lineTo(cx + r * 0.9, cy + r * 0.1);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + r * 0.3, cy + r * 0.3);
        ctx.lineTo(cx + r * 0.9, cy + r * 0.35);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + r * 0.3, cy + r * 0.4);
        ctx.lineTo(cx + r * 0.85, cy + r * 0.55);
        ctx.stroke();
      }
    },
    {
      id: 'owl',
      name: '猫头鹰',
      color: '#8B6914',
      bodyColor: '#A07828',
      earColor: '#6B4F10',
      bellyColor: '#F5DEB3',
      skill: '条纹糖果效果翻倍',
      skillType: 'boost_striped',
      unlockLevel: 20,
      draw: function(ctx, x, y, size) {
        var s = size || 64;
        var cx = x + s / 2;
        var cy = y + s / 2;
        var r = s * 0.42;

        // 耳朵（小尖角）
        ctx.save();
        ctx.fillStyle = this.earColor;
        ctx.beginPath();
        ctx.moveTo(cx - r * 0.6, cy - r * 0.5);
        ctx.lineTo(cx - r * 0.75, cy - r * 1.15);
        ctx.lineTo(cx - r * 0.2, cy - r * 0.65);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx + r * 0.6, cy - r * 0.5);
        ctx.lineTo(cx + r * 0.75, cy - r * 1.15);
        ctx.lineTo(cx + r * 0.2, cy - r * 0.65);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // 脸部
        ctx.save();
        ctx.fillStyle = this.bodyColor;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 面盘（浅色圆圈）
        ctx.save();
        ctx.fillStyle = this.bellyColor;
        ctx.beginPath();
        ctx.ellipse(cx, cy - r * 0.05, r * 0.75, r * 0.7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 大圆眼睛
        ctx.save();
        // 左眼
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.arc(cx - r * 0.3, cy - r * 0.1, r * 0.22, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(cx - r * 0.3, cy - r * 0.1, r * 0.13, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.arc(cx - r * 0.24, cy - r * 0.18, r * 0.05, 0, Math.PI * 2);
        ctx.fill();

        // 右眼
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.arc(cx + r * 0.3, cy - r * 0.1, r * 0.22, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(cx + r * 0.3, cy - r * 0.1, r * 0.13, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.arc(cx + r * 0.36, cy - r * 0.18, r * 0.05, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 喙（三角形）
        ctx.save();
        ctx.fillStyle = '#FF8C00';
        ctx.beginPath();
        ctx.moveTo(cx, cy + r * 0.1);
        ctx.lineTo(cx - r * 0.1, cy + r * 0.28);
        ctx.lineTo(cx + r * 0.1, cy + r * 0.28);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // 翅膀纹理
        ctx.save();
        ctx.fillStyle = this.earColor;
        ctx.globalAlpha = 0.4;
        ctx.beginPath();
        ctx.ellipse(cx - r * 0.85, cy + r * 0.1, r * 0.2, r * 0.5, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(cx + r * 0.85, cy + r * 0.1, r * 0.2, r * 0.5, -0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    },
    {
      id: 'panda',
      name: '小熊猫',
      color: '#333333',
      bodyColor: '#FFFFFF',
      earColor: '#222222',
      bellyColor: '#F5F5F5',
      skill: '果冻消除效果+1',
      skillType: 'boost_jelly',
      unlockLevel: 30,
      draw: function(ctx, x, y, size) {
        var s = size || 64;
        var cx = x + s / 2;
        var cy = y + s / 2;
        var r = s * 0.42;

        // 圆耳朵
        ctx.save();
        ctx.fillStyle = this.earColor;
        ctx.beginPath();
        ctx.arc(cx - r * 0.65, cy - r * 0.65, r * 0.28, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx + r * 0.65, cy - r * 0.65, r * 0.28, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 脸部（白色）
        ctx.save();
        ctx.fillStyle = this.bodyColor;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 黑眼圈
        ctx.save();
        ctx.fillStyle = '#444';
        // 左眼圈
        ctx.beginPath();
        ctx.ellipse(cx - r * 0.3, cy - r * 0.1, r * 0.25, r * 0.2, -0.2, 0, Math.PI * 2);
        ctx.fill();
        // 右眼圈
        ctx.beginPath();
        ctx.ellipse(cx + r * 0.3, cy - r * 0.1, r * 0.25, r * 0.2, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 眼睛
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.arc(cx - r * 0.28, cy - r * 0.12, r * 0.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx + r * 0.28, cy - r * 0.12, r * 0.1, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#111';
        ctx.beginPath();
        ctx.arc(cx - r * 0.28, cy - r * 0.1, r * 0.06, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx + r * 0.28, cy - r * 0.1, r * 0.06, 0, Math.PI * 2);
        ctx.fill();

        // 眼睛高光
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.arc(cx - r * 0.25, cy - r * 0.15, r * 0.03, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx + r * 0.31, cy - r * 0.15, r * 0.03, 0, Math.PI * 2);
        ctx.fill();

        // 鼻子
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.ellipse(cx, cy + r * 0.15, r * 0.1, r * 0.07, 0, 0, Math.PI * 2);
        ctx.fill();

        // 嘴巴
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(cx, cy + r * 0.22);
        ctx.lineTo(cx, cy + r * 0.3);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx - r * 0.1, cy + r * 0.33, r * 0.1, 1.1 * Math.PI, 1.7 * Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx + r * 0.1, cy + r * 0.33, r * 0.1, 1.3 * Math.PI, 1.9 * Math.PI);
        ctx.stroke();

        // 腮红
        ctx.fillStyle = 'rgba(255,180,180,0.3)';
        ctx.beginPath();
        ctx.ellipse(cx - r * 0.5, cy + r * 0.15, r * 0.1, r * 0.07, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(cx + r * 0.5, cy + r * 0.15, r * 0.1, r * 0.07, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    },
    {
      id: 'unicorn',
      name: '独角兽',
      color: '#FF69B4',
      bodyColor: '#E8B4F8',
      earColor: '#D8A0E8',
      bellyColor: '#FFF0FF',
      skill: '每局开始随机生成1个彩色球',
      skillType: 'free_color_bomb',
      unlockLevel: 40,
      draw: function(ctx, x, y, size) {
        var s = size || 64;
        var cx = x + s / 2;
        var cy = y + s / 2;
        var r = s * 0.42;

        // 角（金色螺旋）
        ctx.save();
        var hornGrad = ctx.createLinearGradient(cx, cy - r * 1.5, cx, cy - r * 0.5);
        hornGrad.addColorStop(0, '#FFD700');
        hornGrad.addColorStop(0.5, '#FFF8DC');
        hornGrad.addColorStop(1, '#FFD700');
        ctx.fillStyle = hornGrad;
        ctx.beginPath();
        ctx.moveTo(cx - r * 0.08, cy - r * 0.6);
        ctx.lineTo(cx, cy - r * 1.4);
        ctx.lineTo(cx + r * 0.08, cy - r * 0.6);
        ctx.closePath();
        ctx.fill();

        // 角的螺旋纹理
        ctx.strokeStyle = 'rgba(255,200,0,0.5)';
        ctx.lineWidth = 1;
        for (var i = 0; i < 4; i++) {
          var hy = cy - r * 0.7 - i * r * 0.15;
          ctx.beginPath();
          ctx.moveTo(cx - r * 0.06 + i * 0.5, hy);
          ctx.lineTo(cx + r * 0.06 - i * 0.5, hy);
          ctx.stroke();
        }
        ctx.restore();

        // 彩虹鬃毛
        ctx.save();
        var maneColors = ['#FF0000', '#FF8800', '#FFFF00', '#00FF00', '#0088FF', '#8800FF'];
        for (var i = 0; i < maneColors.length; i++) {
          ctx.fillStyle = maneColors[i];
          ctx.globalAlpha = 0.6;
          var mx = cx + r * 0.6 + i * 2;
          var my = cy - r * 0.4 + i * r * 0.15;
          ctx.beginPath();
          ctx.ellipse(mx, my, r * 0.15, r * 0.12, 0.3, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();

        // 小耳朵
        ctx.save();
        ctx.fillStyle = this.earColor;
        ctx.beginPath();
        ctx.moveTo(cx - r * 0.55, cy - r * 0.45);
        ctx.lineTo(cx - r * 0.65, cy - r * 1.0);
        ctx.lineTo(cx - r * 0.15, cy - r * 0.6);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx + r * 0.55, cy - r * 0.45);
        ctx.lineTo(cx + r * 0.65, cy - r * 1.0);
        ctx.lineTo(cx + r * 0.15, cy - r * 0.6);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // 脸部
        ctx.save();
        ctx.fillStyle = this.bodyColor;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 大眼睛（紫色梦幻）
        ctx.save();
        ctx.fillStyle = '#9370DB';
        ctx.beginPath();
        ctx.ellipse(cx - r * 0.28, cy - r * 0.05, r * 0.14, r * 0.16, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#6A0DAD';
        ctx.beginPath();
        ctx.arc(cx - r * 0.28, cy - r * 0.05, r * 0.08, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#9370DB';
        ctx.beginPath();
        ctx.ellipse(cx + r * 0.28, cy - r * 0.05, r * 0.14, r * 0.16, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#6A0DAD';
        ctx.beginPath();
        ctx.arc(cx + r * 0.28, cy - r * 0.05, r * 0.08, 0, Math.PI * 2);
        ctx.fill();

        // 高光
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.arc(cx - r * 0.23, cy - r * 0.12, r * 0.05, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx + r * 0.33, cy - r * 0.12, r * 0.05, 0, Math.PI * 2);
        ctx.fill();

        // 星星高光
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.beginPath();
        ctx.arc(cx - r * 0.32, cy + r * 0.0, r * 0.03, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx + r * 0.24, cy + r * 0.0, r * 0.03, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 鼻子
        ctx.fillStyle = '#FF69B4';
        ctx.beginPath();
        ctx.ellipse(cx, cy + r * 0.18, r * 0.07, r * 0.05, 0, 0, Math.PI * 2);
        ctx.fill();

        // 微笑
        ctx.strokeStyle = '#FF69B4';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(cx, cy + r * 0.22, r * 0.18, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.stroke();

        // 腮红
        ctx.fillStyle = 'rgba(255,150,200,0.3)';
        ctx.beginPath();
        ctx.ellipse(cx - r * 0.5, cy + r * 0.15, r * 0.1, r * 0.07, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(cx + r * 0.5, cy + r * 0.15, r * 0.1, r * 0.07, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  ],

  // ---- 辅助方法 ----

  /** 根据ID获取宠物 */
  getPetById: function(id) {
    for (var i = 0; i < this.list.length; i++) {
      if (this.list[i].id === id) return this.list[i];
    }
    return null;
  },

  /** 获取当前选择的宠物 */
  getSelectedPet: function() {
    var data = Storage.load();
    return this.getPetById(data.selectedPet || 'fox');
  },

  /** 选择宠物 */
  selectPet: function(petId) {
    var pet = this.getPetById(petId);
    if (!pet) return false;

    var data = Storage.load();
    data.selectedPet = petId;
    Storage.save(data);
    return true;
  },

  /** 检查宠物是否解锁 */
  isPetUnlocked: function(petId) {
    var pet = this.getPetById(petId);
    if (!pet) return false;

    var data = Storage.load();
    return data.currentLevel >= pet.unlockLevel;
  },

  /** 获取宠物解锁所需关卡 */
  getUnlockLevel: function(petId) {
    var pet = this.getPetById(petId);
    return pet ? pet.unlockLevel : 999;
  }
};
