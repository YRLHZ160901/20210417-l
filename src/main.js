import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
import axios from 'axios'
import './assets/CSS/global.css'   //导入全局样式
import './assets/fonts/iconfont.css' //导入字体图标

Vue.prototype.$http = axios
//配置请求的根路径,后期需要将axios进行封装管理
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
