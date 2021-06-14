const { BrowserWindow, ipcMain } = require('electron');
const Fs = require('fs');
const Path = require('path');

/** 包名 */
const PACKAGE_NAME = require('./package.json').name;

/**
 * i18n
 * @param {string} key
 * @returns {string}
 */
const translate = (key) => Editor.T(`${PACKAGE_NAME}.${key}`);

/** 扩展名 */
const EXTENSION_NAME = translate('name');

module.exports = {

  /**
   * 扩展消息
   * @type {{ [key: string]: Function }}
   */
  messages: {

    /**
     * 打开预览面板
     */
    'open-panel'() {
      openPanel();
    },

  },

  /**
   * 生命周期：加载
   */
  load() {
    ipcMain.on(`${PACKAGE_NAME}:greet`, onGreetEvent);
  },

  /**
   * 生命周期：卸载
   */
  unload() {
    ipcMain.removeAllListeners(`${PACKAGE_NAME}:greet`);
  },

}

/**
 * （渲染进程）事件回调
 * @param {*} event 
 * @param {string} content 
 */
function onGreetEvent(event, content) {
  Editor.log(`[${EXTENSION_NAME}]`, translate(content));
  // 回复到渲染进程
  event.reply(`${PACKAGE_NAME}:greet-reply`, 'nice');
}

/**
 * 面板实例
 */
let panel = null;

/**
 * 打开面板
 */
function openPanel() {
  // 已打开则关闭
  if (panel) {
    closePanel();
    return;
  }
  // 创建窗口
  const winSize = [500, 500],
    winPos = getPosition(winSize, 'center'),
    win = panel = new BrowserWindow({
      width: winSize[0],
      height: winSize[1],
      minWidth: winSize[0],
      minHeight: winSize[1],
      x: winPos[0],
      y: winPos[1] - 100,
      frame: true,
      title: `${EXTENSION_NAME} | Cocos Creator`,
      autoHideMenuBar: true,
      resizable: true,
      minimizable: false,
      maximizable: false,
      skipTaskbar: true,
      alwaysOnTop: true,
      hasShadow: false,
      show: false,
      webPreferences: {
        nodeIntegration: true,
      },
    });
  // 加载页面（并传递当前语言）
  const lang = Editor.lang;
  win.loadURL(`file://${__dirname}/panels/main/index.html?lang=${lang}`);
  // 监听按键（ESC 关闭）
  win.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'Escape') {
      closePanel();
    }
  });
  // 就绪后展示（避免闪烁）
  win.on('ready-to-show', () => win.show());
  // 失焦后（自动关闭）
  win.on('blur', () => closePanel());
  // 关闭后（移除引用）
  win.on('closed', () => (panel = null));
  // 调试用的 devtools（detach 模式需要取消失焦自动关闭）
  // win.webContents.openDevTools({ mode: 'detach' });
}

/**
 * 关闭面板
 */
function closePanel() {
  if (!panel) {
    return;
  }
  // 先隐藏再关闭
  panel.hide();
  // 关闭
  panel.close();
  // 移除引用
  panel = null;
}

/**
 * 获取窗口位置
 * @param {[number, number]} size 窗口尺寸
 * @param {'top' | 'center'} anchor 锚点
 * @returns {[number, number]}
 */
function getPosition(size, anchor) {
  // 根据编辑器窗口的位置和尺寸来计算
  const editorWin = BrowserWindow.getFocusedWindow(),
    editorSize = editorWin.getSize(),
    editorPos = editorWin.getPosition();
  // 注意：原点 (0, 0) 在屏幕左上角
  // 另外，窗口的位置值必须是整数，否则修改无效（像素的最小粒度为 1）
  const x = Math.floor(editorPos[0] + (editorSize[0] / 2) - (size[0] / 2));
  let y;
  switch (anchor || 'top') {
    case 'top': {
      y = Math.floor(editorPos[1]);
      break;
    }
    case 'center': {
      y = Math.floor(editorPos[1] + (editorSize[1] / 2) - (size[1] / 2));
      break;
    }
  }
  return [x, y];
}
