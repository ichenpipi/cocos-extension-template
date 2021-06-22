const { ipcRenderer, shell } = require('electron');
const { getUrlParam } = require('../../../utils/browser-utils');
const I18n = require('../../i18n');

/** 包名 */
const PACKAGE_NAME = require('../../../package.json').name;

/** 语言 */
const LANG = getUrlParam('lang');

/**
 * i18n
 * @param {string} key
 * @returns {string}
 */
const translate = (key) => I18n.translate(LANG, key);

// 应用
const App = {

  /**
   * 数据
   */
  data() {
    return {
      title: translate('hello'),
    };
  },

  /**
   * 监听器
   */
  watch: {

  },

  /**
   * 实例函数
   */
  methods: {

    /**
     * Greet
     */
    greet() {
      // 发送事件到主进程
      ipcRenderer.send(`${PACKAGE_NAME}:greet`, 'greet');
    },

    /**
     * （主进程）事件回复回调
     * @param {*} event 
     * @param {string} reply 
     */
    onGreetReply(event, reply) {
      this.title = translate(reply);
    },

  },

  /**
   * 生命周期：实例被挂载
   */
  mounted() {
    ipcRenderer.on(`${PACKAGE_NAME}:greet-reply`, this.onGreetReply.bind(this));
    // 覆盖 a 标签点击回调（使用默认浏览器打开网页）
    const links = document.querySelectorAll('a[href]');
    links.forEach((link) => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        const url = link.getAttribute('href');
        shell.openExternal(url);
      });
    });
    // （主进程）检查更新
    ipcRenderer.send(`${PACKAGE_NAME}:check-update`, true);
    // 1.5 秒后
    setTimeout(() => {
      this.greet();
    }, 1500);
  },

  /**
   * 生命周期：实例销毁前
   */
  beforeDestroy() {
    ipcRenderer.removeAllListeners(`${PACKAGE_NAME}:greet-reply`);
  },

};

// 创建实例
const app = Vue.createApp(App);
// 挂载
app.mount('#app');
