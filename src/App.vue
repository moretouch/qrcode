<template>
    <div :class="[style['body-container'],showMenu?style['show-menu']:'']">
        <div :class="style['menu-wrap']">
            <nav :class="style['menu-top']">
                <div :class="style['profile']"><img :src="profileImage" alt="登录">
                    <span>登录</span>
                </div>
                <div :class="style['icon-list']">
                    <a href="#">
                        <e-icon type="Star" height="unset"></e-icon>
                    </a>
                    <a href="#">
                        <e-icon type="Bell" height="unset"></e-icon>
                    </a>
                    <a href="#">
                        <e-icon type="Message" height="unset"></e-icon>
                    </a>
                    <a href="#">
                        <e-icon type="Edit" height="unset"></e-icon>
                    </a>
                </div>
            </nav>
            <nav :class="style['menu-side']">
                <router-link :to="{name:'home'}">二维码生成</router-link>
                <router-link :to="{name:'scan'}">二维码解析</router-link>
            </nav>
        </div>
        <button :class="style['menu-button']" @click="showMenu=!showMenu" title="Open Menu">菜单</button>
        <div id="content-wrap" :class="style['content-wrap']" @click="showMenu=false">
            <div :class="style['content']">
                <router-view></router-view>
            </div>
        </div>
        <el-backtop :right="100" :bottom="100" target="#content-wrap"/>
        <speed-insights/>
        <inject/>
    </div>
</template>
<script setup>
import {inject} from "@vercel/analytics"
import {SpeedInsights} from "@vercel/speed-insights/vue"
import style from "@/assets/style/app.module.scss";
import {ref} from "vue";
import profileImage from "@/assets/image/vue.svg?url"
import EIcon from "@/components/span/EIcon.vue";
import {useRouter} from "vue-router";

let showMenu = ref(false)
const router = useRouter()


router.beforeEach((to, from, next) => {
    console.log(to, from)
    showMenu.value = false;
    next()
})

console.log(style)

</script>
<style scoped lang="scss">

</style>
<style>
html, body, #app {
    overflow: hidden;
    width: 100%;
    height: 100%;
}
</style>
