<template>
    <div :class="style['content']">
        <header :class="style['header']">
            二维码生成
            <router-link :to="{name:'scan'}" :class="[style['camera'],style['top-link']]">
                <e-icon type="Camera"></e-icon>
            </router-link>
        </header>
        <div :class="style['container']">
            <el-input type="textarea" :autosize="{minRows:3,maxRows:10}" show-word-limit
                      maxlength="300" placeholder="请输入内容"
                      v-model="inputVal" @keydown.enter="keyDownEnter" :class="[style['input']]" enterkeyhint="done" autofocus></el-input>
            <div class="mb-2 center">
                <el-button @click="saveToLog" type="success" :disabled="!inputVal">保存到历史</el-button>
                <el-button @click="downloadImage" type="primary" :disabled="!inputVal">下载图片</el-button>
            </div>
            <div :class="style['result']">
                <div :class="style['output-box']">
                    <div :class="style['output']">
                        <div :class="style['qrcode']"><img ref="qrcode"></div>
                    </div>
                </div>
                <home-qrcode-log @reQrcode="inputVal=$event" ref="qrcodeLog"></home-qrcode-log>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import style from "@/assets/style/home.module.scss";
import QRCode from "@/common/libs/qrcode.js";
import {ref, watch} from "vue";
import EIcon from "@/components/span/EIcon.vue";
import HomeQrcodeLog from "@/components/home/HomeQrcodeLog.vue";

const inputVal = ref("");
const qrcode = ref(null);
let QRDiv = document.createElement('div');
let QR = new QRCode(QRDiv, {
    text: '',
    mode: 'utf-8',
})
let qrcodeLog = ref(null);

watch(inputVal, (val) => {
    QR.makeCode(val)
    renderQrcode();
}, {immediate: true});


function renderQrcode() {
    if (!qrcode.value) {
        setTimeout(() => {
            renderQrcode();
        }, 100);
        return;
    }
    let image = qrcode.value;
    image.src = QRDiv.querySelector('img').src;
}

function keyDownEnter($event) {
    console.log($event)
    let u = navigator.userAgent; //获取到的是个字符串，包括很多信息，我只匹配我想要的信息
    let isAnd = u.indexOf("Android") > -1 || u.indexOf("Linux") > -1; //判断是安卓手机
    let isIOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //判断是苹果手机
    if ((isAnd || isIOS) && !$event.ctrlKey && !$event.shiftKey && !$event.altKey) {
        $event.target.blur();
    }
}

function downloadImage() {
    saveToLog();
    QR.makeCode(inputVal.value);
    const canvas = QRDiv.querySelector('canvas');
    canvas.toBlob(function (blob) {
        const a = document.createElement('a');
        a.download = 'qrcode.png';
        a.href = URL.createObjectURL(blob);
        a.click();
    });
}

function saveToLog() {
    qrcodeLog.value.saveToLog(inputVal.value);
}

</script>

