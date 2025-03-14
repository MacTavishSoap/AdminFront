import './assets/base.scss'
import '@/assets/icon/iconfont.css'

import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from './router'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import Request from './utils/Request'
import storage from './utils/storage'
import message from './utils/Message'
import Api from './utils/Api'

import store from "./store"


const app = createApp(App)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
  }

app.use(ElementPlus)
app.use(router)
app.use(store)

app.config.globalProperties.Request = Request;
app.config.globalProperties.$api = Api
app.config.globalProperties.$storage = storage
app.config.globalProperties.$message = message

app.mount('#app')