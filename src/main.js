const PanelManager = require('./panel-manager');
const MainUtil = require('./eazax/main-util');
const { print, translate, checkUpdate } = require('./eazax/editor-util');

/**
 * 生命周期：加载
 */
function load() {
  MainUtil.on('check-update', onCheckUpdateEvent);
  MainUtil.on('print', onPrintEvent);
  MainUtil.on('greet', onGreetEvent);
}

/**
 * 生命周期：加载
 */
function unload() {
  MainUtil.removeAllListeners('check-update');
  MainUtil.removeAllListeners('print');
  MainUtil.removeAllListeners('greet');
}

/**
 * （渲染进程）检查更新回调
 * @param {Electron.IpcMainEvent} event 
 * @param {boolean} logWhatever 无论有无更新都打印提示
 */
function onCheckUpdateEvent(event, logWhatever) {
  checkUpdate(logWhatever);
}

/**
 * （渲染进程）打印事件回调
 * @param {Electron.IpcMainEvent} event 
 * @param {{ type: string, content: string }} options 选项
 */
function onPrintEvent(event, options) {
  const { type, content } = options;
  print(type, content);
}

/**
 * （渲染进程）事件回调
 * @param {Electron.IpcMainEvent} event 
 * @param {string} content 
 */
function onGreetEvent(event, content) {
  print('log', content);
  // 回复到渲染进程
  MainUtil.reply(event, 'greet-reply', translate('nice'));
}

module.exports = {

  /**
   * 扩展消息
   */
  messages: {

    /**
     * 打开 Cocos 定制面板
     */
    'open-cocos-panel'() {
      PanelManager.openCocosPanel();
    },

    /**
     * 打开 Electron 原生面板
     */
    'open-native-panel'() {
      PanelManager.openNativePanel();
    },

    /**
     * 打开设置面板
     */
    'open-setting-panel'() {
      PanelManager.openSettingPanel();
    },

    /**
     * 检查更新
     */
    'force-check-update'() {
      checkUpdate(true);
    },

  },

  load,

  unload,

};
