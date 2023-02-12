<template>
    <div :class="style['history']">
        <el-table :data="savedLogs.slice((savedLogsPage-1)*10,savedLogsPage*10)" :class="style['table']">
            <el-table-column fixed prop="type" label="类型" :width="50">
                <template #default="{row}">
                    <el-tag type="success" v-if="row.type==='generate'">生成</el-tag>
                    <el-tag type="danger" v-if="row.type==='scan'">识别</el-tag>
                </template>
            </el-table-column>
            <el-table-column fixed prop="time" label="时间" :width="140">
                <template #default="{row}">
                    <el-tag>{{ row.time }}</el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="value" label="内容">
            </el-table-column>
            <el-table-column :width="50">
                <template #header>
                    <el-popover v-if="savedLogs.length>0" :visible="cleanVisible" placement="top" :width="160">
                        <p>你确定要清空历史记录么</p>
                        <div style="text-align: right; margin: 0">
                            <el-button size="small" text @click="cleanVisible = false">取消</el-button>
                            <el-button size="small" type="danger" @click="savedLogs=[];cleanVisible=false">清空</el-button>
                        </div>
                        <template #reference>
                            <el-button size="small" type="danger" @click="cleanVisible = true" style="float: right">清空</el-button>
                        </template>
                    </el-popover>
                </template>
                <template #default="{row,rowIndex}">
                    <el-popover trigger="hover" :width="200" placement="left-end" persistent teleported :show-after="100">
                        <template #reference>
                            <el-button type="success" size="small" @click="logPopover=row.value">查看</el-button>
                        </template>
                        <template #default>
                            <div class="mb-2 center">
                                <img :src="qrUrl(row.value)" :alt="row.value" style="width: 100%">
                                <el-button-group size="small">
                                    <el-button type="success" size="small" @click="reQrcode(row.value)">重新生成</el-button>
                                    <el-button type="danger" size="small" @click="delLog(rowIndex,row.value)">删除</el-button>
                                </el-button-group>
                            </div>
                        </template>
                    </el-popover>
                </template>
            </el-table-column>
            <template #append>
                <el-pagination style="padding: 0.5em;text-align: center;margin: 0 auto" v-model:current-page="savedLogsPage"
                               :page-size="10" background :total="savedLogs.length"
                               layout="total, prev, pager, next" hide-on-single-page></el-pagination>
            </template>
        </el-table>
    </div>
</template>
<script setup lang="ts">
import style from "@/assets/style/home.module.scss";
import {useStorage} from "@vueuse/core";
import {ref} from "vue";
import QRCode from "@/common/libs/qrcode.js";
import {DateFormat} from "@/common/libs/tools";

const savedLogs = useStorage('saved-qrcode', [])
const cleanVisible = ref(false)
const logPopover = ref(null)
const savedLogsPage = ref(1)

const $emits = defineEmits<{
    (event: 'reQrcode', text: string): void
}>()

defineExpose({saveToLog})


let QRDiv = document.createElement('div');
let QR = new QRCode(QRDiv, {
    text: '',
    mode: 'utf-8',
})

const qrUrlCache = {};
const qrUrl = function (text) {
    if (qrUrlCache[text]) {
        return qrUrlCache[text];
    }
    QR.makeCode(text);
    let url = QRDiv.querySelector('img').src;
    qrUrlCache[text] = url;
    return url;
}

function saveToLog(inputVal) {
    let item = {
        value: inputVal, type: 'generate',
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

function delLog(index, text) {
    logPopover.value = text;
    savedLogs.value.splice(index, 1)
}

function reQrcode(text) {
    $emits('reQrcode', text)
    logPopover.value = null;
    document.getElementById('content-wrap').scrollTo({top: 0, behavior: "smooth"})
}


</script>
