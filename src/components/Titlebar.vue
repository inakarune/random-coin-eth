<template>
    <div class="titlebar">
        <h1>Probit Auto Exchanging-ETH</h1>
        <button @click="closeBtn">x</button>
    </div>
</template>
<script lang="ts">
import {
  Component, Vue, Prop, Emit,
} from 'vue-property-decorator';

const electron = window.require('electron');
const { ipcRenderer, remote } = electron;
declare const window: any;

@Component
export default class Titlebar extends Vue {

    private closeBtn() {
        const window = remote.getCurrentWindow();
        window.close();
    }
}
</script>
<style lang="scss" scoped>
.titlebar {
    display: flex;
    -webkit-app-region: drag;
    justify-content: space-between;
    box-sizing: border-box;
    padding: 10px 10px;
    line-height: 180%;
    border-bottom: 1px solid #ddd;

    & > h1 {
        margin: 0;
        font-size: 15px;
        font-weight: 600;
        text-align: left;
    }

    & > button {
        -webkit-app-region: no-drag;
        border: 1px solid #ddd;
        width: 25px;
        height: 25px;
        color: #ddd;
        background-color: white;
        border-radius: 5px;
    }

    & > button:hover {
        color: white;
        background-color: #ddd;
    }
}
</style>
