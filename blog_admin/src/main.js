import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import pinia from './stores'
import Antd from 'ant-design-vue'
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import 'ant-design-vue/dist/reset.css'
import './style.css'
import 'dayjs/locale/zh-cn'

const app = createApp(App)

app.use(router)
app.use(pinia)
app.use(Antd, { locale: zhCN })

app.mount('#app')
