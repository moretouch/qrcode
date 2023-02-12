<template>
    <div :class="[style['content'],borderhover?style['drop']:'']" ref="dropable">
        <header :class="style['header']">
            二维码解析
            <router-link :to="{name:'home'}" :class="[style['camera'],style['top-link']]">
                <e-icon type="DocumentAdd"></e-icon>
            </router-link>
        </header>
        <div :class="style['container']">
            <div class="mt-4 center mb-2" v-if="resultValue.value" :class="style['scanner-btn']">
                <el-button type="success" @click="copyResult">{{ copied ? '已复制' : '复制解析结果' }}</el-button>
                <p :class="style['result']">{{ resultValue.value }}</p>
                <img :src="resultValue.fileBlob" alt="" style="width: 100px">
            </div>
            <div class="mt-4 center mb-2" v-else-if="resultValue.fileBlob" :class="style['scanner-btn']">
                <p :class="style['result']">未识别到二维码</p>
                <img :src="resultValue.fileBlob" alt="" style="width: 100px">
            </div>
            <div class="mt-4 center" :class="style['scanner-btn']">
                <div>
                    <el-button size="large" type="primary" @click="startMedia()">
                        <e-icon type="Camera"></e-icon>&nbsp; 扫一扫
                    </el-button>
                    <el-button size="large" type="success" @click="uploadFile">
                        <e-icon type="Document"></e-icon>&nbsp; 选择文件
                    </el-button>
                </div>
                <p class="m-1">拖动文件至此，或者 <kbd>Ctrl+V (⌘+V)</kbd> 粘贴剪贴板图片至此</p>
            </div>
        </div>
        <div :class="[style['preview-camera'],showPreview?style['show']:'']">
            <canvas ref="canvas"></canvas>
            <div :class="style['close']">
                <div :class="style['item']" @click="changeCamera">
                    <e-icon type="Switch"></e-icon>
                </div>
                <div :class="style['item']" @click="closeMedia">
                    <e-icon type="Close"></e-icon>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import style from "@/assets/style/home.module.scss";
import EIcon from "@/components/span/EIcon.vue";
import {computed, onDeactivated, onMounted, reactive, ref, watch} from "vue";
import {useClipboard, useStorage} from "@vueuse/core";
import jsQR from "jsqr";
import {DateFormat} from "@/common/libs/tools";

const video = document.createElement("video");
const showPreview = ref(false);
const canvas = ref(null);
const resultValue = reactive({
    value: "",
    fileBlob: null,
});
const cameraList = ref([]);
const cameraFacingMode = ref("environment");
const {copy, copied} = useClipboard({source: computed(() => resultValue.value)});
let $ctx;
let $mediaStream;
let $canvas;


function startMedia(facingMode = "environment") {
    closeMedia(false);
    let width = 640;
    let height = ~~(640 / document.documentElement.clientWidth * document.documentElement.clientHeight);
    console.log("mediaSize", width, height);
    $canvas.width = width;
    $canvas.height = height;
    navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
            facingMode: facingMode,
            width: width,
            height: height
        },
    }).then((stream) => {
        showPreview.value = true;
        video.srcObject = stream;
        video.setAttribute("playsinline", 'true');
        video.play();
        $mediaStream = stream;
        requestAnimationFrame(tickIFrame);
    }).catch((err) => {
        console.log(err);
    });
    getCameraList().then((list) => {
        cameraList.value = list;
    });
}

function closeMedia(closePreview = true) {
    if (!$mediaStream) {
        return;
    }
    $mediaStream.getTracks().forEach(function (track) {
        track.stop();
    });
    $mediaStream = null;
    if (closePreview) {
        showPreview.value = false;
    }
}

async function getCameraList() {
    let devices = await navigator.mediaDevices.enumerateDevices();
    let cameraList = devices.filter((item) => item.kind === "videoinput");
    console.log(cameraList);
    return cameraList;
}

function tickIFrame() {
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
        let width = video.videoWidth, height = video.videoHeight;
        if (video.width !== $canvas.width || video.height !== $canvas.height) {
            $canvas.width = width;
            $canvas.height = height;
            $ctx = $canvas.getContext('2d');
        }
        $ctx.drawImage(video, 0, 0, $canvas.width, $canvas.height);
        if (decodeQrcode($ctx, {width: video.videoWidth, height: video.videoHeight})) {
            closeMedia();
            return;
        }
    }
    requestAnimationFrame(tickIFrame)
}

/**
 * 解析二维码
 * @param ctx
 * @param imageSize
 * @returns {false|string}
 */
function decodeQrcode(ctx, imageSize) {
    function drawLine(begin, end, color) {
        ctx.beginPath();
        ctx.moveTo(begin.x, begin.y);
        ctx.lineTo(end.x, end.y);
        ctx.lineWidth = 4;
        ctx.strokeStyle = color;
        ctx.stroke();
    }

    let imageData = ctx.getImageData(0, 0, imageSize.width, imageSize.height);
    var code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert"
    });
    if (code) {
        resultValue.value = code.data;
        drawLine(code.location.topLeftCorner, code.location.topRightCorner, "#FF3B58");
        drawLine(code.location.topRightCorner, code.location.bottomRightCorner, "#FF3B58");
        drawLine(code.location.bottomRightCorner, code.location.bottomLeftCorner, "#FF3B58");
        drawLine(code.location.bottomLeftCorner, code.location.topLeftCorner, "#FF3B58");

        $canvas.toBlob(function (blob) {
            if (imageData.height + imageData.width > 1024) {
                $canvas.width = 200;
                $canvas.height = imageData.height * 200 / imageSize.width;
            } else {
                $canvas.width = imageData.width;
                $canvas.height = imageData.height;
            }
            $ctx = $canvas.getContext('2d');
            let img = new Image();
            img.onload = function () {
                $ctx.drawImage(img, 0, 0, $canvas.width, $canvas.height);
                resultValue.fileBlob = $canvas.toDataURL("image/png");
                showPreview.value = false;
            }
            img.src = URL.createObjectURL(blob);
            saveToLog(resultValue.value)
        }, "image/png");

        return code.data;
    } else {
        return false;
    }
}

function copyResult() {
    copy();
}

const savedLogs = useStorage('saved-qrcode', [])

function saveToLog(inputVal) {
    let item = {
        value: inputVal, type: 'scan',
        time: DateFormat('YYYY-MM-DD HH:mm')
    };
    for (let i = 0; i < savedLogs.value.length; i++) {
        if (savedLogs.value[i].value === item.value) {
            savedLogs.value.splice(i, 1);
            break;
        }
    }
    savedLogs.value.unshift(item);
}

async function changeCamera() {
    if (cameraFacingMode.value === "environment") {
        cameraFacingMode.value = "user";
    } else {
        cameraFacingMode.value = "environment";
    }
    startMedia(cameraFacingMode.value);
}

// 通过选择文件
async function uploadFile() {
    let blob = await chooseFile() as Blob;
    decodeImage(blob);
}

function decodeImage(file: Blob) {
    if (!file) {
        return;
    }
    file2img(file).then(function (img) {
        console.log(img, img.width, img.height)
        $canvas.width = img.width;
        $canvas.height = img.height;
        $ctx = $canvas.getContext('2d');
        $ctx.drawImage(img, 0, 0, $canvas.width, $canvas.height);

        if (decodeQrcode($ctx, {width: img.width, height: img.height})) {
            return;
        }
        resultValue.value = '';
        resultValue.fileBlob = img.src;
    })
}

async function chooseFile(): Promise<Blob> {
    return new Promise(function (resolve, reject) {
        let input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = function (e) {
            let target = e.target as HTMLInputElement;
            let file = target.files[0];
            if (!file) {
                return;
            }
            resolve(file)
            input.remove();
        };
        input.click();
    })
}

async function file2img(file: Blob): Promise<HTMLImageElement> {
    return new Promise(function (resolve, reject) {
        let img = new Image()
        img.onload = function () {
            resolve(img);
        }
        img.src = URL.createObjectURL(file);
        img.style.position = 'fixed';
        img.style.top = '-1000px';
    })
}

// 拖动文件到浏览器
const borderhover = ref(false);
const dropable = ref(null)

let $dropable: HTMLElement;


onMounted(() => {
    $canvas = canvas.value;
    $dropable = dropable.value;
    $dropable.addEventListener("drop", enentDrop, false)
    $dropable.addEventListener("dragleave", _stopDefaultFalse, false)
    $dropable.addEventListener("dragenter", _stopDefaultTrue, false)
    $dropable.addEventListener("dragover", _stopDefaultTrue, false)
})

function _stopDefaultTrue(e) {
    e.stopPropagation();
    e.preventDefault();
    borderhover.value = true;
}

function _stopDefaultFalse(e) {
    e.stopPropagation();
    e.preventDefault();
    borderhover.value = false;
}

function enentDrop(e) {
    console.log(e)
    e.stopPropagation();
    e.preventDefault();
    borderhover.value = false;
    let fileData = e.dataTransfer.files;
    console.log(fileData);
    if (fileData.length === 0) {
        return;
    }
    let file = fileData[0];
    decodeImage(file);
}

// 粘贴剪贴板图片
function pasteImage(e) {
    let clipboardData = e.clipboardData;
    if (!clipboardData) {
        return;
    }
    let items = clipboardData.items;
    if (!items) {
        return;
    }
    for (let i = 0; i < items.length; i++) {
        let item = items[i];
        if (item.kind === 'file' && item.type.indexOf('image/') !== -1) {
            let blob = item.getAsFile();
            decodeImage(blob);
            break;
        }
    }
}

document.body.addEventListener('paste', pasteImage);
onDeactivated(() => {
    $dropable.removeEventListener("drop", enentDrop, false)
    $dropable.removeEventListener("dragleave", _stopDefaultFalse, false)
    $dropable.removeEventListener("dragenter", _stopDefaultTrue, false)
    $dropable.removeEventListener("dragover", _stopDefaultTrue, false)
    document.body.removeEventListener('paste', pasteImage);
    console.log("销毁事件")
})


</script>

<style scoped lang="scss">

</style>