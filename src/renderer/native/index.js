const { getUrlParam } = require('../../eazax/browser-util');
const I18n = require('../../eazax/i18n');
const RendererUtil = require('../../eazax/renderer-util');

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
      greeting: translate('hello'),
    };
  },

  /**
   * 计算属性
   */
  computed: {

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
     * i18n
     * @param {string} key 
     */
    i18n(key) {
      return translate(key);
    },

    /**
     * Greet
     */
    greet() {
      // （主进程）问好
      RendererUtil.send('greet', translate('greet'));
    },

    /**
     * （主进程）事件回复回调
     * @param {*} event 
     * @param {string} reply 
     */
    onGreetReply(event, reply) {
      this.greeting = reply;
    },

  },

  /**
   * 生命周期：实例被挂载
   */
  mounted() {
    console.log('mounted', this);
    // （主进程）监听回复事件
    RendererUtil.on('greet-reply', this.onGreetReply.bind(this));
    // （主进程）检查更新
    RendererUtil.send('check-update', true);
    // 2 秒后问好
    setTimeout(() => {
      this.greet();
    }, 2000);
  },

  /**
   * 生命周期：实例销毁前
   */
  beforeDestroy() {
    RendererUtil.removeAllListeners('greet-reply');
  },

};

// 创建实例
const app = Vue.createApp(App);
// 挂载
app.mount('#app');
