import { createApp } from 'vue'
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import '@/assets/style/style.scss'
import App from './App.vue'
import router from "./common/router";


const app = createApp(App)
app.use(ElementPlus)
app.use(router)
app.mount('#app')
