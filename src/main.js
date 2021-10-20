import Vue from 'vue'
import App from './App.vue'

import ViewUI from 'view-design';
import 'view-design/dist/styles/iview.css';
import Antd from 'ant-design-vue'

import 'ant-design-vue/dist/antd.css'
import axios from 'axios'

import router from './router/index'

import store from "./store";
import ElementUI from "element-ui";

import Viewer from 'v-viewer';
import 'viewerjs/dist/viewer.css';


Vue.use(ElementUI);
Vue.use(Viewer);
Vue.prototype.$http = axios

Vue.config.productionTip = false
Vue.use(ViewUI);
Vue.use(Antd);
// 添加 eventbus
Vue.prototype.$bus = new Vue();

/**
 * 应用入口
 */
window.$app = new Vue({
  el: '#app',
  render: h => h(App),
  router: router,
  store,
});

// 阻止双击放大
let lastTouchEnd = 0;

document.addEventListener('touchstart', function (event) {
  if (event.touches.length > 1) {
    event.preventDefault();
  }
});
document.addEventListener('touchend', function (event) {
  const now = (new Date()).getTime();

  if (now - lastTouchEnd <= 300) {
    event.preventDefault();
  }
  lastTouchEnd = now;
}, false);

// 阻止双指放大
document.addEventListener('gesturestart', function (event) {
  event.preventDefault();
});
