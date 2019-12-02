<template>
    <div class="window-box">
        <Titlebar />
        <div class="box-content">
            <button class="left" @click="login('lion')">lion0214</button>
            <button class="right" @click="login('kim')">kimphilbit</button>
        </div>
    </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import Titlebar from '@/components/Titlebar.vue';
declare const window: any;
const { ipcRenderer } = window.require('electron');
import { user } from '@/env/user';
import { userService } from './user.service';

@Component({
    components: {
        Titlebar
    }
})
export default class Login extends Vue {
    
    async login(key: string): Promise<any> {
        try {
            const response: any = await userService.getToken({ id: user[key].id, password: user[key].password });
            localStorage.setItem('tken', response.data.access_token);
            localStorage.setItem('id', key);
            ipcRenderer.send('showAfterLogin', { id: key });
        } catch (error) {
            console.error(error);
        }
    }

	private exit(): void {
		ipcRenderer.send('exit');
	}
}
</script>
<style lang="scss" scoped>
@import '../assets/css/window.scss';
button {
    width: 160px;
    height: 160px;
    line-height: 160px;
    border-radius: 10px;
    font-size: 14px;
    background-color: white;
    justify-content: space-between;
    outline: none;
}
.left {
    border: 1px solid #00c89c;
    color: #00c89c;
}
.left:hover {
    background-color: #00c89c;
    color: white;
}
.right {
    border: 1px solid #ff9b00;
    color: #ff9b00;
}
.right:hover {
    background-color: #ff9b00;
    color: white;
}
</style>
